// Throws on anything but "true", "false" or unset, so a typo can't silently ship the
// component library in a production build.
let logged = false;

export function isComponentLibraryDisabled(): boolean {
  const raw = process.env.DISABLE_COMPONENT_LIBRARY;

  let disabled: boolean;

  if (raw === undefined || raw === "" || raw === "false") {
    disabled = false;
  } else if (raw === "true") {
    disabled = true;
  } else {
    throw new Error(
      `DISABLE_COMPONENT_LIBRARY must be "true", "false", or unset — got "${raw}". ` +
        `Use \`npm run build\` (library excluded) or \`npm run build:with-library\` (library included).`
    );
  }

  if (!logged && !import.meta.env.DEV) {
    console.log(
      `[component-library] Component library ${disabled ? "EXCLUDED from" : "INCLUDED in"} this build (DISABLE_COMPONENT_LIBRARY=${raw ?? "unset"})`
    );
    logged = true;
  }

  return disabled;
}
