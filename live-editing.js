import { registerAstroComponent } from "@cloudcannon/editable-regions/astro";
import { componentKeyFromPath } from "./src/components/utils/componentKey.mjs";

const componentModules = import.meta.glob("./src/components/**/*.astro", { eager: true });

for (const [path, module] of Object.entries(componentModules)) {
  const match = path.match(/\.\/src\/components\/(.+)\.astro$/);

  if (match) {
    // match[1] is the path relative to src/components, e.g. 'wrappers/grid/Grid'.
    const registrationPath = componentKeyFromPath(match[1]);

    registerAstroComponent(registrationPath, module.default);
  }
}
