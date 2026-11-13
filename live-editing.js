import { registerAstroComponent } from "@cloudcannon/editable-regions/astro";
import { componentKeyFromPath } from "./src/components/utils/componentKey.mjs";

const componentModules = import.meta.glob("./src/components/**/*.astro", { eager: true });

// The editor renders a block from its bare data; default the binding on, as `renderBlock.astro` does.
function withDefaultBinding(Component) {
  const Wrapped = (result, props, slots) =>
    Component(result, { useDefaultEditableBinding: true, ...props }, slots);

  return Object.assign(Wrapped, Component);
}

for (const [path, module] of Object.entries(componentModules)) {
  const match = path.match(/\.\/src\/components\/(.+)\.astro$/);

  if (match) {
    // Path relative to src/components, e.g. 'wrappers/grid/Grid'.
    const registrationPath = componentKeyFromPath(match[1]);

    registerAstroComponent(registrationPath, withDefaultBinding(module.default));
  }
}
