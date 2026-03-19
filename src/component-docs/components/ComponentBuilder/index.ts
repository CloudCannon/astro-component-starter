/**
 * ComponentBuilder — Main Entry Point
 *
 * Bootstraps the visual component builder by reading serialised data from
 * the DOM, initialising state, wiring up event listeners, and performing
 * the first render. This file is the single script entry imported by the
 * `.astro` template.
 *
 * @module index
 */

import "./styles.css";
import { onPageLoad } from "../../../components/utils/onPageLoad";
import { debugLog } from "./constants";
import { showExportConfigModal } from "./modules/exportModal";
import { initLivePreview } from "./modules/livePreview";
import { getExposedPropCount, renderPropEditor } from "./modules/propEditor";
import { renderSandbox, setRenderCallback } from "./modules/sandbox";
import { builderState } from "./state";
import type { BuilderData } from "./types";
import { generateExport } from "./utils/exportGenerator";

/** Initialize the component builder */
function initializeBuilder(): void {
  const builderElement = document.querySelector(".component-builder");

  if (!builderElement) return;

  // Load builder data from data attribute
  const dataAttr = builderElement.getAttribute("data-builder-data");

  if (!dataAttr) {
    console.error("[ComponentBuilder] Missing data-builder-data attribute");
    return;
  }

  let builderData: BuilderData;

  try {
    builderData = JSON.parse(dataAttr);
  } catch (e) {
    console.error("[ComponentBuilder] Failed to parse builder data:", e);
    return;
  }

  // Initialize state
  builderState.initialize(builderData);

  debugLog("Builder initialized with:", {
    componentsCount: builderData.components?.length || 0,
    categories: Object.keys(builderData.componentsByCategory || {}),
  });

  // Get DOM elements
  const sandbox = document.getElementById("sandbox");
  const sidebarContent = document.getElementById("sidebar-content");
  const sidebarTitle = document.getElementById("sidebar-title");
  const exportBtn = document.getElementById("export-btn") as HTMLElement;
  const exportBar = document.querySelector(".export-bar") as HTMLElement;
  const exportBtnInner = exportBtn?.querySelector(".button-inner") as HTMLButtonElement | null;
  const exportBtnLabel = exportBtn?.querySelector(".label-text") as HTMLElement | null;

  if (!sandbox || !sidebarContent || !sidebarTitle || !exportBtn || !exportBar || !exportBtnInner) {
    console.error("[ComponentBuilder] Missing required DOM elements");
    return;
  }

  // Set up render callback
  const render = (): void => {
    renderSandbox(sandbox);
    updateExportButton();
    updateSidebar();
  };

  setRenderCallback(render);

  // Selection change handler
  builderState.on("selectionChange", () => {
    updateSidebar();
  });

  // Tree change handler
  builderState.on("treeChange", () => {
    if (builderState.propEditInProgress) {
      renderSandbox(sandbox);
      updateExportButton();
    } else {
      render();
    }
    builderState.saveToLocalStorage();
  });

  // Validation change handler
  builderState.on("validationChange", () => {
    updateExportButton();
    updateValidationPanel();
  });

  // Export button handler
  exportBtn.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleExport();
  });

  // Reset button handler
  const resetBtn = document.getElementById("reset-btn");

  resetBtn?.addEventListener("click", (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Reset the builder? All current progress will be lost.")) return;
    builderState.reset();
    const buildTab = document.querySelector('[data-view="build"]') as HTMLElement | null;

    buildTab?.click();
  });

  // Update sidebar based on selection
  function updateSidebar(): void {
    // These are guaranteed to exist by the check above
    const title = sidebarTitle as HTMLElement;
    const content = sidebarContent as HTMLElement;
    const selectedId = builderState.selectedComponentId;

    if (!selectedId) {
      title.textContent = "Component Props";
      content.innerHTML = '<p class="sidebar-empty">Select a component to edit its properties</p>';
      return;
    }

    const node = builderState.findComponentNode(selectedId);

    if (!node) {
      title.textContent = "Component Props";
      content.innerHTML = '<p class="sidebar-empty">Component not found</p>';
      return;
    }

    const componentInfo = builderState.getComponentInfo(node._component);

    if (!componentInfo) {
      title.textContent = "Component Props";
      content.innerHTML = '<p class="sidebar-empty">Unknown component type</p>';
      return;
    }

    const exposedCount = getExposedPropCount(node, componentInfo);

    title.innerHTML = "";
    title.appendChild(document.createTextNode(`${componentInfo.displayName} Props`));

    if (exposedCount > 0) {
      const badge = document.createElement("span");

      badge.className = "sidebar-exposed-badge";
      badge.textContent = `${exposedCount} exposed`;
      title.appendChild(badge);
    }

    renderPropEditor(node, componentInfo, content);
  }

  // Update export button state
  function updateExportButton(): void {
    const hasComponents = builderState.componentTree.length > 0;
    const validation = builderState.validationResult;

    // Disable if no components
    if (!hasComponents) {
      exportBtn.setAttribute("disabled", "");
      exportBtnInner.disabled = true;
      exportBtn.classList.remove("has-errors");
      if (exportBtnLabel) exportBtnLabel.textContent = "Export Component";
      return;
    }

    // Show error state if validation fails
    if (!validation.isValid) {
      exportBtn.removeAttribute("disabled");
      exportBtnInner.disabled = false; // Keep enabled to show errors
      exportBtn.classList.add("has-errors");

      // Update button text to show error count
      const errorCount = validation.duplicateProps.length;

      if (exportBtnLabel) {
        exportBtnLabel.textContent = `Export Component (${errorCount} error${errorCount > 1 ? "s" : ""})`;
      }
    } else {
      exportBtn.removeAttribute("disabled");
      exportBtnInner.disabled = false;
      exportBtn.classList.remove("has-errors");
      if (exportBtnLabel) exportBtnLabel.textContent = "Export Component";
    }
  }

  // Update validation panel
  function updateValidationPanel(): void {
    const validation = builderState.validationResult;
    let panel = document.getElementById("validation-panel");

    // Remove existing panel if validation passes
    if (validation.isValid) {
      if (panel) {
        panel.remove();
      }
      return;
    }

    // Create panel if it doesn't exist
    if (!panel) {
      panel = document.createElement("div");
      panel.id = "validation-panel";
      panel.className = "validation-panel";
      // Insert after export bar, not inside it
      exportBar.insertAdjacentElement("afterend", panel);
    }

    // Build consolidated error list
    const allDuplicates = validation.duplicateProps
      .map((error) => {
        const locationsList = error.locations
          .map(
            (loc) =>
              `<li><strong>${loc.nodePath}</strong> → "<strong>${error.exposedName}</strong>" (original: "${loc.originalPropName}")</li>`
          )
          .join("");

        return locationsList;
      })
      .join("");

    panel.innerHTML = `
      <div class="validation-panel-header">
        <svg class="validation-panel-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M10 18C14.4183 18 18 14.4183 18 10C18 5.58172 14.4183 2 10 2C5.58172 2 2 5.58172 2 10C2 14.4183 5.58172 18 10 18Z" stroke="currentColor" stroke-width="2"/>
          <path d="M10 6V10" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
          <circle cx="10" cy="13" r="0.5" fill="currentColor"/>
        </svg>
        <span>Validation Errors</span>
      </div>
      <div class="validation-panel-content">
        <div class="validation-error">
          <div class="validation-error-header">
            <svg class="validation-error-icon" width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="8" cy="8" r="7" stroke="currentColor" stroke-width="2"/>
              <path d="M8 4V8" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              <circle cx="8" cy="11" r="0.5" fill="currentColor"/>
            </svg>
            <span>Duplicate exposed prop names found</span>
          </div>
          <div class="validation-error-details">
            <p>The following components expose props with duplicate names:</p>
            <ul>${allDuplicates}</ul>
            <p class="validation-error-hint">Change the "Exposed Name" of one of these props to make it unique.</p>
          </div>
        </div>
      </div>
    `;
  }

  // Handle export
  async function handleExport(): Promise<void> {
    if (builderState.componentTree.length === 0) {
      alert("Please add at least one component to the sandbox before exporting.");
      return;
    }

    // Check validation
    const validation = builderState.validationResult;

    if (!validation.isValid) {
      // Scroll to validation panel to show errors
      const panel = document.getElementById("validation-panel");

      if (panel) {
        panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
      return;
    }

    showExportConfigModal(async (config) => {
      try {
        debugLog("Starting export:", config);

        await generateExport(
          builderState.componentTree,
          config.componentName,
          builderState.components,
          builderState.metadataMap,
          builderState.nestedBlockProperties,
          config.componentPath
        );

        debugLog("Export completed successfully");
      } catch (error) {
        console.error("[ComponentBuilder] Export error:", error);
        alert(`Error exporting component: ${(error as Error).message}`);
      }
    });
  }

  // Live preview
  const viewToggle = document.getElementById("builder-view-toggle");
  const builderLayout = document.getElementById("builder-layout");
  const previewContainer = document.getElementById("builder-preview-container");

  if (viewToggle && builderLayout && previewContainer) {
    initLivePreview(builderLayout, previewContainer, viewToggle);
  }

  // Initial render
  render();

  // Run initial validation
  updateValidationPanel();
}

onPageLoad(initializeBuilder);
