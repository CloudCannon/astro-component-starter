/**
 * Syncs data attributes on child elements to parent styles in the
 * CloudCannon editor. This works around CloudCannon's inability to
 * re-render props on a component's root element.
 */

function syncBentoBoxSpans(target) {
  const parent = target.closest(".bento-box-item");

  if (!parent) return;

  const colSpan = Number(target.dataset.colSpan) || 1;
  const rowSpan = Number(target.dataset.rowSpan) || 1;

  parent.style.gridColumn = colSpan > 1 ? `span ${colSpan}` : "";
  parent.style.gridRow = rowSpan > 1 ? `span ${rowSpan}` : "";
}

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    if (
      mutation.type === "attributes" &&
      (mutation.attributeName === "data-col-span" || mutation.attributeName === "data-row-span")
    ) {
      syncBentoBoxSpans(mutation.target);
    }

    if (mutation.type === "childList") {
      for (const node of mutation.addedNodes) {
        if (node.nodeType !== Node.ELEMENT_NODE) continue;

        if (node.dataset?.colSpan || node.dataset?.rowSpan) {
          syncBentoBoxSpans(node);
        }

        for (const child of node.querySelectorAll("[data-col-span], [data-row-span]")) {
          syncBentoBoxSpans(child);
        }
      }
    }
  }
});

observer.observe(document.body, {
  attributes: true,
  attributeFilter: ["data-col-span", "data-row-span"],
  childList: true,
  subtree: true,
});

export {};
