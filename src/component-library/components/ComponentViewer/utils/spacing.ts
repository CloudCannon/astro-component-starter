export function getBodyPadding(spacing: string): string {
  switch (spacing) {
    case "all":
      return "padding: var(--spacing-md)";
    case "top":
      return "padding-top: var(--spacing-md)";
    case "sides":
      return "padding-left: var(--spacing-md); padding-right: var(--spacing-md);";
    default:
      return "";
  }
}
