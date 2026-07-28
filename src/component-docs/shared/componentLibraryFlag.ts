/**
 * Strict reader for the DISABLE_COMPONENT_LIBRARY env var.
 *
 * `npm run build` sets it to "true" to exclude /component-docs from production
 * builds; `npm run build:with-library` leaves it unset. Only "true", "false",
 * or unset are accepted — anything else (e.g. a typo like "ture") throws at
 * build time instead of silently including the library in a production build.
 */
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
