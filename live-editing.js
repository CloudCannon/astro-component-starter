import { registerAstroComponent } from "@cloudcannon/editable-regions/astro";
import "@cloudcannon/editable-regions/astro-react-renderer";
import { pascalToKebab } from "./src/components/utils/pascalToKebab";

const componentModules = import.meta.glob("./src/components/**/*.astro", { eager: true });

for (const [path, module] of Object.entries(componentModules)) {
  const match = path.match(/\.\/src\/components\/(.+)\.astro$/);

  if (match) {
    const fullPath = match[1]; // e.g., 'wrappers/grid/Grid', 'wrappers/grid/GridItem'
    const parts = fullPath.split("/");
    const filename = parts[parts.length - 1];
    const parentFolder = parts.length > 1 ? parts[parts.length - 2] : null;

    // Convert PascalCase filename to kebab-case
    const kebabFilename = pascalToKebab(filename);
    const kebabParent = parentFolder ? pascalToKebab(parentFolder) : null;

    // If filename (in kebab-case) matches parent folder, it's not a subcomponent - remove redundant filename
    // e.g. 'wrappers/grid', 'wrappers/grid/grid-item'
    const registrationPath =
      kebabFilename === kebabParent
        ? parts.slice(0, -1).join("/")
        : parts.slice(0, -1).concat(kebabFilename).join("/");

    registerAstroComponent(registrationPath, module.default);
  }
}
