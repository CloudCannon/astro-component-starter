function copyFallback(text: string): boolean {
  const textarea = document.createElement("textarea");

  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();

  const copied = document.execCommand("copy");

  textarea.remove();
  return copied;
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // Clipboard access may be unavailable outside a secure context.
  }

  return copyFallback(text);
}

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

  const button =
    container.querySelector<HTMLButtonElement>(".code-block-copy .button-inner") ??
    createCopyButton(container);
  const buttonRoot = button.closest<HTMLElement>(".code-block-copy");
  const label = button?.querySelector<HTMLElement>(".label-text");
  const status = block.querySelector<HTMLElement>(".code-block-status");

  if (!status) return;

  if (!buttonRoot || !label || button.dataset.copyInitialized === "true") return;
  button.dataset.copyInitialized = "true";

  button.addEventListener("click", async () => {
    const code = block.querySelector<HTMLElement>(".code-block-panel:not([hidden]) code");
    const copied = await copyText(code?.textContent || "");
    const nextLabel = copied ? container.dataset.copiedLabel : container.dataset.copyFailedLabel;
    const labelWidth = label.getBoundingClientRect().width;

    label.style.inlineSize = `${labelWidth}px`;
    label.textContent = nextLabel || buttonRoot.dataset.copyLabel || "Copy";
    status.textContent = copied ? "Code copied to clipboard." : "Unable to copy code.";

    window.setTimeout(() => {
      label.textContent = container.dataset.copyLabel || "Copy";
      label.style.inlineSize = "";
    }, 1500);
  });
}

export function setupAllCodeBlocks(root: ParentNode = document): void {
  const blocks = [
    ...(root instanceof HTMLElement && root.matches(".code-block") ? [root] : []),
    ...Array.from(root.querySelectorAll<HTMLElement>(".code-block")),
  ];

  blocks.forEach(setupCodeBlock);
}
