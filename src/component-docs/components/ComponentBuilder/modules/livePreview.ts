/**
 * View Toggle Module
 *
 * Manages the Build / Preview / Code tabs above the builder workspace.
 * - Build: the default drag-and-drop sandbox + sidebar
 * - Preview: SSR-gated iframe rendering (hidden when SSR unavailable)
 * - Code: live-generated Astro, Inputs YAML, and Structure Value output
 *
 * @module livePreview
 */

import { builderState } from "../state";
import type { ComponentNode } from "../types";
import { generateExportPreview } from "../utils/exportGenerator";
import { createHighlighter } from "shiki/bundle/web";

type ViewMode = "build" | "preview" | "code";

let previewIframe: HTMLIFrameElement | null = null;
let debounceTimer: number | null = null;
let currentView: ViewMode = "build";
let currentPreviewUrl = "";

const DEBOUNCE_MS = 800;
const PREVIEW_BASE = "/component-docs/builder-preview";
const DEFAULT_COMPONENT_NAME = "my-component";

// Shiki highlighter — lazily loaded and cached

type CodeHighlighter = {
  codeToHtml: (code: string, options: { lang: string; theme: string }) => string;
};

let highlighterPromise: Promise<CodeHighlighter> | null = null;

function getHighlighter(): Promise<CodeHighlighter> {
  if (!highlighterPromise) {
    // Use a static import so Vite bundles this reliably in dev.
    highlighterPromise = createHighlighter({
      themes: ["github-dark"],
      langs: ["astro", "yaml"],
    }).catch((error) => {
      // Allow retry if initialization fails once.
      highlighterPromise = null;
      throw error;
    });
  }

  return highlighterPromise;
}

const CODE_TAB_LANG: Record<string, string> = {
  astro: "astro",
  inputs: "yaml",
  structure: "yaml",
};

function createCodeMarkup(renderedHtml: string, code: string): string {
  const lineCount = Math.max(code.split("\n").length, 1);
  const lineNumbers = Array.from({ length: lineCount }, (_, i) => `<span>${i + 1}</span>`).join("");

  return `<div class="builder-code-render"><div class="builder-code-lines" aria-hidden="true">${lineNumbers}</div><div class="builder-code-html">${renderedHtml}</div></div>`;
}

function cleanTree(nodes: ComponentNode[]): Record<string, unknown>[] {
  return nodes.map((node) => {
    const clean: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(node)) {
      if (
        key.startsWith("_hardcoded_") ||
        key.startsWith("_renamed_") ||
        key.startsWith("_isRootComponent") ||
        key === "_nodeId" ||
        (key.startsWith("_") && key.endsWith("_mode")) ||
        (key.startsWith("_") && key.endsWith("_previewCount"))
      ) {
        continue;
      }

      if (Array.isArray(value) && value.length > 0 && value[0]?._component) {
        const modeKey = `_${key}_mode` as keyof ComponentNode;

        if (node[modeKey] === "prop") {
          clean[key] = [];
        } else {
          const cleaned = cleanTree(value as ComponentNode[]);
          const previewCountKey = `_${key}_previewCount` as keyof ComponentNode;
          const previewCount = node[previewCountKey] as number | undefined;

          if (previewCount && previewCount > 1 && cleaned.length === 1) {
            const template = cleaned[0];
            const copies: Record<string, unknown>[] = [];

            for (let i = 0; i < previewCount; i++) {
              copies.push(JSON.parse(JSON.stringify(template)));
            }
            clean[key] = copies;
          } else {
            clean[key] = cleaned;
          }
        }
      } else {
        clean[key] = value;
      }
    }

    return clean;
  });
}

function navigatePreview(): void {
  if (!previewIframe || currentView !== "preview") return;

  const tree = cleanTree(builderState.componentTree);
  const json = JSON.stringify(tree);
  const url = `${PREVIEW_BASE}?tree=${encodeURIComponent(json)}`;

  if (url === currentPreviewUrl) return;

  currentPreviewUrl = url;
  previewIframe.src = url;
}

function schedulePreview(): void {
  if (debounceTimer !== null) {
    window.clearTimeout(debounceTimer);
  }

  debounceTimer = window.setTimeout(() => {
    navigatePreview();
    debounceTimer = null;
  }, DEBOUNCE_MS);
}

/**
 * Initialize the view toggle system (Build / Preview / Code).
 */
export function initLivePreview(
  builderLayoutEl: HTMLElement,
  previewContainerEl: HTMLElement,
  toggleContainer: HTMLElement
): () => void {
  const ssrEnabled =
    document.querySelector(".component-builder")?.getAttribute("data-ssr-enabled") === "true";

  const buildTab = toggleContainer.querySelector('[data-view="build"]') as HTMLElement | null;
  const previewTab = toggleContainer.querySelector('[data-view="preview"]') as HTMLElement | null;
  const codeTab = toggleContainer.querySelector('[data-view="code"]') as HTMLElement | null;

  const codeContainer = document.getElementById("builder-code-container");
  const codeContentEl = document.querySelector(".builder-code-content") as HTMLElement | null;
  const codeTabs = document.getElementById("builder-code-tabs");

  if (ssrEnabled && previewTab) {
    previewTab.style.display = "";

    previewIframe = document.createElement("iframe");
    previewIframe.className = "builder-preview-iframe";
    previewContainerEl.appendChild(previewIframe);
  }

  let activeCodeTab = "astro";
  let currentCodeText = "";

  const builderCopyBtn = document.getElementById("builder-code-copy");

  if (builderCopyBtn) {
    builderCopyBtn.addEventListener("click", async () => {
      if (!currentCodeText) return;

      try {
        await navigator.clipboard.writeText(currentCodeText);
        builderCopyBtn.classList.add("copied");
        setTimeout(() => builderCopyBtn.classList.remove("copied"), 2000);
      } catch {
        /* noop */
      }
    });
  }

  function updateCodeOutput(): void {
    if (!codeContentEl || currentView !== "code") return;

    try {
      const preview = generateExportPreview(
        builderState.componentTree,
        DEFAULT_COMPONENT_NAME,
        builderState.components,
        builderState.metadataMap,
        builderState.nestedBlockProperties
      );

      const content: Record<string, string> = {
        astro: preview.astro,
        inputs: preview.inputs,
        structure: preview.structureValue,
      };

      const code = content[activeCodeTab] || "";
      const lang = CODE_TAB_LANG[activeCodeTab] || "text";

      currentCodeText = code;

      getHighlighter()
        .then((hl) => {
          if (currentView !== "code") return;

          const highlighted = hl.codeToHtml(code, { lang, theme: "github-dark" });
          const html = createCodeMarkup(highlighted, code);
          const copyBtn = codeContentEl.querySelector(".code-copy-btn");

          if (copyBtn) {
            const existing = codeContentEl.querySelector(".builder-code-render, pre");

            if (existing) existing.remove();
            copyBtn.insertAdjacentHTML("afterend", html);
          } else {
            codeContentEl.innerHTML = html;
          }
        })
        .catch((error) => {
          const message = error instanceof Error ? error.message : String(error);
          const copyBtn = codeContentEl.querySelector(".code-copy-btn");
          const errorMarkup = `<div class="builder-code-error">Shiki failed to load: ${escapeHtml(message)}</div>`;

          if (copyBtn) {
            const existing = codeContentEl.querySelector(
              ".builder-code-render, pre, .builder-code-error"
            );

            if (existing) existing.remove();
            copyBtn.insertAdjacentHTML("afterend", errorMarkup);
          } else {
            codeContentEl.innerHTML = errorMarkup;
          }

          console.error("[ComponentBuilder] Shiki highlight failed.", error);
        });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";

      codeContentEl.innerHTML = `<pre><code>// Error generating code preview\n// ${escapeHtml(message)}</code></pre>`;
    }
  }

  function escapeHtml(str: string): string {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  if (codeTabs) {
    codeTabs.addEventListener("click", (e) => {
      const btn = (e.target as HTMLElement).closest("[data-code-tab]") as HTMLElement | null;

      if (!btn) return;

      const tab = btn.dataset.codeTab;

      if (!tab) return;

      activeCodeTab = tab;

      codeTabs.querySelectorAll(".builder-code-tab").forEach((t) => {
        t.classList.toggle("active", t === btn);
      });

      updateCodeOutput();
    });
  }

  function setView(view: ViewMode): void {
    currentView = view;

    builderLayoutEl.style.display = view === "build" ? "" : "none";
    previewContainerEl.style.display = view === "preview" ? "" : "none";

    if (codeContainer) {
      codeContainer.style.display = view === "code" ? "" : "none";
    }

    buildTab?.classList.toggle("active", view === "build");
    previewTab?.classList.toggle("active", view === "preview");
    codeTab?.classList.toggle("active", view === "code");

    if (view === "preview") {
      currentPreviewUrl = "";
      navigatePreview();
    }

    if (view === "code") {
      updateCodeOutput();
    }
  }

  buildTab?.addEventListener("click", () => setView("build"));
  previewTab?.addEventListener("click", () => setView("preview"));
  codeTab?.addEventListener("click", () => setView("code"));

  const unsub = builderState.on("treeChange", () => {
    if (currentView === "preview") {
      schedulePreview();
    } else if (currentView === "code") {
      updateCodeOutput();
    }
  });

  setView("build");

  return () => {
    unsub();

    if (debounceTimer !== null) {
      window.clearTimeout(debounceTimer);
    }

    previewIframe?.remove();
  };
}
