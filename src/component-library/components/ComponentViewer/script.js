document.addEventListener("DOMContentLoaded", () => {
  const componentViewers = document.querySelectorAll(".component-viewer");

  componentViewers.forEach((viewer) => {
    const segments = {
      deviceSize: viewer.querySelector('[data-action="device-size-toggle"]'),
      direction: viewer.querySelector('[data-action="direction-toggle"]'),
      theme: viewer.querySelector('[data-action="theme-toggle"]'),
      view: viewer.querySelector('[data-action="view-toggle"]'),
    };

    const previews = viewer.querySelectorAll(".preview");
    const codeBlocks = viewer.querySelectorAll(".code");
    const exampleSelect = viewer.querySelector(".example-select");
    const viewerId = viewer.getAttribute("data-viewer-id");

    const switchToExample = (exampleId) => {
      previews.forEach((preview) => {
        preview.classList.toggle("active", preview.id === exampleId);
      });

      const viewMode =
        segments.view?.querySelector(`input[name="view-mode-${viewerId}"]:checked`)?.value ||
        "component";

      if (viewMode === "component") {
        previews.forEach((preview) => {
          preview.style.display = preview.classList.contains("active") ? "block" : "none";
        });
        codeBlocks.forEach((block) => (block.style.display = "none"));
      } else if (viewMode === "astro") {
        previews.forEach((preview) => (preview.style.display = "none"));
        codeBlocks.forEach((block) => {
          block.style.display = block.id === `astro-code-${exampleId}` ? "block" : "none";
        });
      } else if (viewMode === "frontmatter") {
        previews.forEach((preview) => (preview.style.display = "none"));
        codeBlocks.forEach((block) => {
          block.style.display = block.id === `frontmatter-code-${exampleId}` ? "block" : "none";
        });
      }
    };

    const syncCodeViewHeight = () => {
      const activePreview = viewer.querySelector(".preview.active");

      if (activePreview && activePreview.offsetHeight > 0) {
        const previewHeight = activePreview.offsetHeight;

        codeBlocks.forEach((block) => {
          block.style.height = `${previewHeight}px`;
          block.style.minHeight = `${previewHeight}px`;
        });
      }
    };

    const initSegment = (segmentElement, name, callback) => {
      if (!segmentElement) return;

      const inputs = segmentElement.querySelectorAll(`input[name="${name}-${viewerId}"]`);
      const checked = segmentElement.querySelector(`input[name="${name}-${viewerId}"]:checked`);

      if (checked) callback(checked.value);

      inputs.forEach((input) => {
        input.addEventListener("change", (e) => callback(e.target.value));
      });
    };

    if (exampleSelect) {
      const activePreview = viewer.querySelector(".preview.active");

      if (activePreview && exampleSelect.value !== activePreview.id) {
        exampleSelect.value = activePreview.id;
      }
      exampleSelect.addEventListener("change", (e) => switchToExample(e.target.value));
    }

    initSegment(segments.view, "view-mode", (value) => {
      const activePreview = viewer.querySelector(".preview.active");

      if (activePreview) switchToExample(activePreview.id);

      // Show/hide hidden segments based on view mode
      const hiddenSegments = viewer.querySelector(".hidden-segments");

      if (hiddenSegments) {
        hiddenSegments.style.display = value === "component" ? "flex" : "none";
      }

      // Sync height after switching to code view
      setTimeout(syncCodeViewHeight, 50);
    });

    initSegment(segments.theme, "theme-mode", (value) => {
      previews.forEach((preview) => preview.setAttribute("data-theme", value));
    });

    initSegment(segments.direction, "direction-mode", (value) => {
      previews.forEach((preview) => preview.setAttribute("dir", value));
    });

    initSegment(segments.deviceSize, "device-size", (value) => {
      viewer.setAttribute("data-device-size", value);
      setTimeout(syncCodeViewHeight, 150);
    });

    // Initialize hidden segments visibility on page load
    const hiddenSegments = viewer.querySelector(".hidden-segments");

    if (hiddenSegments) {
      const initialViewMode =
        segments.view?.querySelector(`input[name="view-mode-${viewerId}"]:checked`)?.value ||
        "component";

      hiddenSegments.style.display = initialViewMode === "component" ? "flex" : "none";
    }

    // Set up ResizeObserver for dynamic height changes
    const activePreview = viewer.querySelector(".preview.active");

    if (activePreview && window.ResizeObserver) {
      const resizeObserver = new ResizeObserver(() => {
        syncCodeViewHeight();
      });

      resizeObserver.observe(activePreview);
    }

    // Initial height sync
    setTimeout(syncCodeViewHeight, 200);
  });
});

// Copy code functionality
document.addEventListener("DOMContentLoaded", () => {
  document.addEventListener("click", async (event) => {
    const button = event.target.closest('[data-action="copy-code"]');

    if (!button) return;

    event.stopPropagation();
    const codeToCopy = button.getAttribute("data-code");

    if (codeToCopy) {
      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(codeToCopy);
        } else {
          const textArea = document.createElement("textarea");

          textArea.value = codeToCopy;
          Object.assign(textArea.style, {
            position: "fixed",
            left: "-999999px",
            top: "-999999px",
          });
          document.body.appendChild(textArea);
          textArea.focus();
          textArea.select();

          try {
            document.execCommand("copy");
          } catch (fallbackErr) {
            console.error("Fallback copy failed: ", fallbackErr);
            return;
          } finally {
            document.body.removeChild(textArea);
          }
        }

        button.classList.add("copied");
        const originalLabel = button.getAttribute("text") || "Copy Code";

        button.setAttribute("aria-label", "Copied!");

        setTimeout(() => {
          button.classList.remove("copied");
          button.setAttribute("aria-label", originalLabel);
        }, 3000);
      } catch (err) {
        console.error("Failed to copy code: ", err);
      }
    }
  });
});
