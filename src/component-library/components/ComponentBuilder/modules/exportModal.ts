/**
 * Export Modal Module
 *
 * Controls the export configuration modal where the user chooses a
 * component type, category, and name before triggering the ZIP download.
 *
 * @module exportModal
 */

import { builderState } from "../state";
import type { ExportConfig } from "../types";
import { createCloseButton } from "../utils/buttonHelpers";
import { generateExportPreview } from "../utils/exportGenerator";

/** Page section categories from folder structure */
function getPageSectionCategories(): string[] {
  return builderState.pageSectionCategories;
}

/** Format category name for display (e.g., "info-blocks" -> "Info Blocks") */
function formatCategoryName(category: string): string {
  return category
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/** Show the export configuration modal */
export function showExportConfigModal(onExport: (config: ExportConfig) => void): void {
  const overlay = document.getElementById("export-config-overlay");

  if (!overlay) return;

  const componentTypeSelect = document.getElementById("component-type") as HTMLSelectElement;
  const pageSectionCategoryField = document.getElementById("page-section-category-field");
  const buildingBlockCategoryField = document.getElementById("building-block-category-field");
  const pageSectionCategorySelect = document.getElementById(
    "page-section-category"
  ) as HTMLSelectElement;
  const customCategoryInput = document.getElementById(
    "custom-page-section-category"
  ) as HTMLInputElement;
  const componentNameInput = document.getElementById("component-name") as HTMLInputElement;
  const pathPreview = document.getElementById("component-path-preview");
  const confirmBtn = document.getElementById("export-config-confirm");
  const cancelBtn = document.getElementById("export-config-cancel");
  const closeBtnContainer = document.getElementById("export-config-close");
  const buildingBlockCategorySelect = document.getElementById(
    "building-block-category"
  ) as HTMLSelectElement;

  if (!pageSectionCategoryField || !buildingBlockCategoryField || !cancelBtn || !confirmBtn) return;

  // Populate page-section categories
  const categories = getPageSectionCategories();

  pageSectionCategorySelect.innerHTML = categories
    .map((cat) => `<option value="${cat}">${formatCategoryName(cat)}</option>`)
    .join("");

  // Set defaults
  componentTypeSelect.value = "page-section";
  componentNameInput.value = "my-component";
  customCategoryInput.value = "";

  /** Update path preview */
  function updatePreview(): void {
    const type = componentTypeSelect.value;
    const nameValue = componentNameInput.value.trim() || "my-component";
    let category: string;

    if (type === "page-section") {
      const customCat = customCategoryInput.value.trim();

      category = customCat || pageSectionCategorySelect.value;
    } else {
      category = buildingBlockCategorySelect.value;
    }

    const sanitizedName = nameValue.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const baseType = type === "page-section" ? "page-sections" : "building-blocks";

    if (pathPreview) {
      pathPreview.textContent = `${baseType}/${category}/${sanitizedName}`;
    }
  }

  // Toggle category fields
  componentTypeSelect.addEventListener("change", () => {
    if (componentTypeSelect.value === "page-section") {
      pageSectionCategoryField.style.display = "flex";
      buildingBlockCategoryField.style.display = "none";
    } else {
      pageSectionCategoryField.style.display = "none";
      buildingBlockCategoryField.style.display = "flex";
    }
    updatePreview();
  });

  // Update preview on input changes
  [
    componentNameInput,
    pageSectionCategorySelect,
    customCategoryInput,
    buildingBlockCategorySelect,
  ].forEach((el) => {
    el.addEventListener("input", updatePreview);
    el.addEventListener("change", updatePreview);
  });

  updatePreview();

  /** Close modal */
  function closeModal(): void {
    if (overlay) overlay.style.display = "none";
  }

  // Create and append close button
  if (closeBtnContainer) {
    closeBtnContainer.innerHTML = ""; // Clear any existing button
    const closeBtn = createCloseButton(closeModal);

    closeBtnContainer.appendChild(closeBtn);
  }

  cancelBtn.onclick = closeModal;

  overlay.onclick = (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  };

  // Preview panel elements
  const previewPanel = document.getElementById("export-preview-panel");
  const previewCodeEl = document.querySelector("#export-preview-code-content code");
  const lineNumbersEl = document.getElementById("export-line-numbers");
  const previewTabs = document.querySelectorAll(".export-preview-tab");
  const downloadBtn = document.getElementById("export-download-btn");

  let previewData: { astro: string; inputs: string; structureValue: string } | null = null;
  let activeTab = "astro";

  const exportCopyBtn = document.getElementById("export-code-copy");

  if (exportCopyBtn) {
    exportCopyBtn.addEventListener("click", async () => {
      if (!previewData) return;

      const text =
        activeTab === "astro"
          ? previewData.astro
          : activeTab === "inputs"
            ? previewData.inputs
            : previewData.structureValue;

      try {
        await navigator.clipboard.writeText(text);
        exportCopyBtn.classList.add("copied");
        setTimeout(() => exportCopyBtn.classList.remove("copied"), 2000);
      } catch {
        /* noop */
      }
    });
  }

  function showPreviewTab(tab: string): void {
    activeTab = tab;
    previewTabs.forEach((t) => {
      (t as HTMLElement).classList.toggle("active", t.getAttribute("data-tab") === tab);
    });

    if (!previewCodeEl || !previewData) return;

    const content =
      tab === "astro"
        ? previewData.astro
        : tab === "inputs"
          ? previewData.inputs
          : previewData.structureValue;

    previewCodeEl.textContent = content;

    if (lineNumbersEl) {
      const lineCount = content.split("\n").length;

      lineNumbersEl.textContent = Array.from({ length: lineCount }, (_, i) => i + 1).join("\n");
    }
  }

  previewTabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabName = tab.getAttribute("data-tab");

      if (tabName) showPreviewTab(tabName);
    });
  });

  function getExportConfig(): ExportConfig | null {
    const type = componentTypeSelect.value as "page-section" | "building-block";
    const nameValue = componentNameInput.value.trim();
    let category: string;

    if (type === "page-section") {
      const customCat = customCategoryInput.value.trim();

      category = customCat || pageSectionCategorySelect.value;
    } else {
      category = buildingBlockCategorySelect.value;
    }

    if (!nameValue) {
      alert("Please enter a component name");
      return null;
    }

    if (!category) {
      alert("Please select or enter a category");
      return null;
    }

    const sanitizedName = nameValue.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const baseType = type === "page-section" ? "page-sections" : "building-blocks";
    const componentPath = `${baseType}/${category}/${sanitizedName}`;

    return { componentType: type, category, componentName: sanitizedName, componentPath };
  }

  // Handle confirm - show preview
  confirmBtn.onclick = () => {
    const config = getExportConfig();

    if (!config) return;

    previewData = generateExportPreview(
      builderState.componentTree,
      config.componentName,
      builderState.components,
      builderState.metadataMap,
      builderState.nestedBlockProperties,
      config.componentPath
    );

    if (previewPanel) {
      previewPanel.style.display = "block";
    }

    showPreviewTab(activeTab);
    confirmBtn.textContent = "Preview";
    confirmBtn.classList.add("previewing");
  };

  // Handle download
  if (downloadBtn) {
    downloadBtn.onclick = () => {
      const config = getExportConfig();

      if (!config) return;

      closeModal();

      onExport(config);
    };
  }

  // Show modal
  overlay.style.display = "flex";

  // Reset preview state when opening
  if (previewPanel) {
    previewPanel.style.display = "none";
  }

  activeTab = "astro";
  previewData = null;
  if (confirmBtn) {
    confirmBtn.textContent = "Preview";
    confirmBtn.classList.remove("previewing");
  }
}
