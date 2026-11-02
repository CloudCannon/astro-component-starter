import { bindCopyButton } from "@component-utils/copyCode";

function decorate(pre: HTMLPreElement, template: HTMLTemplateElement, status: HTMLElement): void {
  const wrapper = template.content.firstElementChild?.cloneNode(true) as HTMLElement | null;
  const button = wrapper?.querySelector<HTMLButtonElement>(".prose-code-copy .button-inner");

  if (!wrapper || !button) return;

  pre.replaceWith(wrapper);
  wrapper.prepend(pre);

  const copy = template.dataset.copyLabel || "Copy";

  bindCopyButton(
    button,
    () => pre.querySelector("code")?.textContent || "",
    {
      copy,
      copied: template.dataset.copiedLabel || copy,
      failed: template.dataset.copyFailedLabel || copy,
    },
    status
  );
}

export function setupAllProseCode(root: ParentNode = document): void {
  // The blog body is an editable text region: an injected button would be saved into the post.
  if (window.inEditorMode) return;

  const template = document.querySelector<HTMLTemplateElement>("template.prose-code-template");
  const status = document.querySelector<HTMLElement>(".prose-code-status");

  if (!template || !status) return;

  root.querySelectorAll<HTMLPreElement>(".prose pre.astro-code").forEach((pre) => {
    if (!pre.parentElement?.classList.contains("prose-code")) decorate(pre, template, status);
  });
}
