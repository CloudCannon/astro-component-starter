export type CopyLabels = {
  copy: string;
  copied: string;
  failed: string;
};

const RESET_DELAY = 1500;

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

export async function copyText(text: string): Promise<boolean> {
  if (!navigator.clipboard?.writeText) return copyFallback(text);

  return navigator.clipboard.writeText(text).then(
    () => true,
    () => copyFallback(text)
  );
}

/** Wires a Button-markup copy control: copies `read()`, flashes the outcome on its label, announces it in `status`. */
export function bindCopyButton(
  button: HTMLButtonElement,
  read: () => string,
  labels: CopyLabels,
  status: HTMLElement | null
): void {
  const label = button.querySelector<HTMLElement>(".label-text");

  if (!label || button.dataset.copyInitialized === "true") return;
  button.dataset.copyInitialized = "true";

  button.addEventListener("click", async () => {
    const copied = await copyText(read());
    const labelWidth = label.getBoundingClientRect().width;

    label.style.inlineSize = `${labelWidth}px`;
    label.textContent = copied ? labels.copied : labels.failed;
    if (status) status.textContent = copied ? "Code copied to clipboard." : "Unable to copy code.";

    window.setTimeout(() => {
      label.textContent = labels.copy;
      label.style.inlineSize = "";
    }, RESET_DELAY);
  });
}
