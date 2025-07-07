document.addEventListener("DOMContentLoaded", () => {
  // Find all component viewers on the page
  const componentViewers = document.querySelectorAll(".component-viewer");

  componentViewers.forEach((viewer) => {
    const viewCodeBtn = viewer.querySelector('[data-action="view-code"]') as HTMLElement;
    const viewComponentBtn = viewer.querySelector('[data-action="view-component"]') as HTMLElement;
    const previews = viewer.querySelectorAll(".preview");
    const codeBlocks = viewer.querySelectorAll(".code");
    const exampleSelect = viewer.querySelector("select") as HTMLSelectElement;

    // Function to switch to a specific example
    const switchToExample = (exampleId: string) => {
      // Remove active class from all previews
      previews.forEach((preview) => {
        preview.classList.remove("active");
      });

      // Add active class to the selected preview
      const selectedPreview = viewer.querySelector(`#${exampleId}`) as HTMLElement;

      if (selectedPreview) {
        selectedPreview.classList.add("active");
      }

      // Update display based on current view mode
      const isCodeView = viewComponentBtn && !viewComponentBtn.classList.contains("hide");

      if (isCodeView) {
        // In code view: show only the selected code block, hide all previews
        previews.forEach((preview) => {
          (preview as HTMLElement).style.display = "none";
        });

        // Show only the code block that corresponds to the selected example
        codeBlocks.forEach((codeBlock) => {
          const codeBlockId = codeBlock.id;

          if (codeBlockId === `code-${exampleId}`) {
            (codeBlock as HTMLElement).style.display = "block";
          } else {
            (codeBlock as HTMLElement).style.display = "none";
          }
        });
      } else {
        // In component view: show only active preview, hide all code blocks
        previews.forEach((preview) => {
          if (preview.classList.contains("active")) {
            (preview as HTMLElement).style.display = "block";
          } else {
            (preview as HTMLElement).style.display = "none";
          }
        });
        codeBlocks.forEach((codeBlock) => {
          (codeBlock as HTMLElement).style.display = "none";
        });
      }
    };

    // Initialize: sync select with active preview
    if (exampleSelect) {
      const activePreview = viewer.querySelector(".preview.active") as HTMLElement;

      if (activePreview) {
        const activeId = activePreview.id;

        // Update select to match active preview
        if (exampleSelect.value !== activeId) {
          exampleSelect.value = activeId;
        }
      }
    }

    // Add event listener for select dropdown
    if (exampleSelect) {
      exampleSelect.addEventListener("change", (event) => {
        const selectedValue = (event.target as HTMLSelectElement).value;

        switchToExample(selectedValue);
      });
    }

    if (viewCodeBtn && viewComponentBtn) {
      viewCodeBtn.addEventListener("click", () => {
        // Hide view-code button and show view-component button
        viewCodeBtn.classList.add("hide");
        viewComponentBtn.classList.remove("hide");

        // Get the currently active example and switch to code view
        const activePreview = viewer.querySelector(".preview.active") as HTMLElement;

        if (activePreview) {
          const activeId = activePreview.id;

          switchToExample(activeId);
        }
      });

      viewComponentBtn.addEventListener("click", () => {
        // Show view-code button and hide view-component button
        viewCodeBtn.classList.remove("hide");
        viewComponentBtn.classList.add("hide");

        // Get the currently active example and switch to component view
        const activePreview = viewer.querySelector(".preview.active") as HTMLElement;

        if (activePreview) {
          const activeId = activePreview.id;

          switchToExample(activeId);
        }
      });
    }
  });
});
