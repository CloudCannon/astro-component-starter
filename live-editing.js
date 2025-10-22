import { registerAstroComponent } from "@cloudcannon/editable-regions/astro";
import "@cloudcannon/editable-regions/astro-react-renderer";

// Dynamically import all components from the components directory
const componentModules = import.meta.glob("./src/components/**/*.astro", { eager: true });

for (const [path, module] of Object.entries(componentModules)) {
  const match = path.match(/\.\/src\/components\/(.+)\.astro$/);

  if (match) {
    const fullPath = match[1]; // e.g., 'wrappers/grid/grid', 'wrappers/grid/grid-item'
    const parts = fullPath.split("/");
    const filename = parts[parts.length - 1];
    const parentFolder = parts.length > 1 ? parts[parts.length - 2] : null;

    // If filename matches parent folder, it's not a subcomponent - remove redundant filename
    // e.g. 'wrappers/grid', 'wrappers/grid/grid-item'
    const registrationPath = filename === parentFolder ? parts.slice(0, -1).join("/") : fullPath;

    registerAstroComponent(registrationPath, module.default);
  }
}
