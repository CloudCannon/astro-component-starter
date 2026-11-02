import { bindCopyButton } from "@component-utils/copyCode";

function createCopyButton(container: HTMLElement): HTMLButtonElement {
  const root = document.createElement("span");
  const button = document.createElement("button");
  const label = document.createElement("span");

  root.className = "button code-block-copy";
  button.className = "button-inner variant-ghost size-sm";
  button.type = "button";
  label.className = "label-text";
  label.textContent = container.dataset.copyLabel || "Copy";
  button.append(label);
  root.append(button);
  container.querySelector(".code-block-header")?.append(root);

  return button;
}

export function setupCodeBlock(block: HTMLElement): void {
  const container = block.querySelector<HTMLElement>(".code-block-inner");

  if (!container?.dataset.copyButton) return;

  const status = block.querySelector<HTMLElement>(".code-block-status");

  if (!status) return;

  const button =
    container.querySelector<HTMLButtonElement>(".code-block-copy .button-inner") ??
    createCopyButton(container);
  const copy = container.dataset.copyLabel || "Copy";

  bindCopyButton(
    button,
    () => block.querySelector(".code-block-panel:not([hidden]) code")?.textContent || "",
    {
      copy,
      copied: container.dataset.copiedLabel || copy,
      failed: container.dataset.copyFailedLabel || copy,
    },
    status
  );
}

export function setupAllCodeBlocks(root: ParentNode = document): void {
  const blocks = [
    ...(root instanceof HTMLElement && root.matches(".code-block") ? [root] : []),
    ...Array.from(root.querySelectorAll<HTMLElement>(".code-block")),
  ];

  blocks.forEach(setupCodeBlock);
}
