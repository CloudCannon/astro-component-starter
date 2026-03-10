/**
 * Export Modal Module
 *
 * Controls the export configuration modal where the user chooses a
 * page-section category and name before triggering the ZIP download.
 *
 * @module exportModal
 */

import { builderState } from "../state";
import type { ExportConfig } from "../types";
import { createCloseButton } from "../utils/buttonHelpers";

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

  const pageSectionCategoryField = document.getElementById("page-section-category-field");
  const pageSectionCategorySelect = document.getElementById(
    "page-section-category"
  ) as HTMLSelectElement;
  const customCategoryInput = document.getElementById(
    "custom-page-section-category"
  ) as HTMLInputElement;
  const componentNameInput = document.getElementById("component-name") as HTMLInputElement;
  const pathPreview = document.getElementById("component-path-preview");
  const closeBtnContainer = document.getElementById("export-config-close");

  if (!pageSectionCategoryField) return;

  // Populate page-section categories
  const categories = getPageSectionCategories();

  pageSectionCategorySelect.innerHTML = categories
    .map((cat) => `<option value="${cat}">${formatCategoryName(cat)}</option>`)
    .join("");

  // Set defaults
  componentNameInput.value = "my-component";
  customCategoryInput.value = "";

  /** Update path preview */
  function updatePreview(): void {
    const nameValue = componentNameInput.value.trim() || "my-component";
    const customCat = customCategoryInput.value.trim();
    const category = customCat || pageSectionCategorySelect.value;

    const sanitizedName = nameValue.toLowerCase().replace(/[^a-z0-9-]/g, "-");

    if (pathPreview) {
      pathPreview.textContent = `/src/components/page-sections/${category}/${sanitizedName}`;
    }
  }

  pageSectionCategoryField.style.display = "flex";

  // Update preview on input changes
  [componentNameInput, pageSectionCategorySelect, customCategoryInput].forEach((el) => {
    el.addEventListener("input", () => {
      updatePreview();
    });
    el.addEventListener("change", () => {
      updatePreview();
    });
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

  overlay.onclick = (e) => {
    if (e.target === overlay) {
      closeModal();
    }
  };

  const downloadBtn = document.getElementById("export-download-btn");

  function getExportConfig(): ExportConfig | null {
    const nameValue = componentNameInput.value.trim();
    const customCat = customCategoryInput.value.trim();
    const category = customCat || pageSectionCategorySelect.value;

    if (!nameValue) {
      alert("Please enter a component name");
      return null;
    }

    if (!category) {
      alert("Please select or enter a category");
      return null;
    }

    const sanitizedName = nameValue.toLowerCase().replace(/[^a-z0-9-]/g, "-");
    const componentPath = `page-sections/${category}/${sanitizedName}`;

    return {
      componentType: "page-section",
      category,
      componentName: sanitizedName,
      componentPath,
    };
  }

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
}
