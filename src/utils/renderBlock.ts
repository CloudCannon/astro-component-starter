declare global {
  interface ImportMeta {
    glob(pattern: string, options?: { eager?: boolean }): Record<string, any>;
  }
}

const componentModules = import.meta.glob("../components/**/*.astro", {
  eager: true,
}) as Record<string, { default: any }>;

const componentMap: Record<string, any> = {};

Object.entries(componentModules).forEach(([filePath, module]) => {
  const pathParts = filePath.split("/");
  const category = pathParts[pathParts.length - 3];
  const fileName = pathParts[pathParts.length - 1];
  const componentName = fileName.replace(".astro", "");

  if (!category || category === "components" || pathParts.length < 3) {
    return;
  }

  // Only include elements, not layouts (to avoid circular dependencies)
  if (category !== "elements") {
    return;
  }

  const kebabName = componentName
    .replace(/([A-Z])/g, "-$1")
    .toLowerCase()
    .replace(/^-/, "");

  const bookshopName = `${category}/${kebabName}`;

  componentMap[bookshopName] = module.default;
});

export function resolveComponent(bookshopName: string) {
  if (!bookshopName) return null;

  const Component = componentMap[bookshopName];

  if (!Component) {
    console.warn(`Component not found: ${bookshopName}`);
    return null;
  }

  return Component;
}

// Helper function to filter out internal props
function filterInternalProps(props: any) {
  const { key, _bookshop_name, ...filteredProps } = props;

  return filteredProps;
}

export async function resolveBlocks(blocks: any[]) {
  if (!blocks || blocks.length === 0) {
    return [];
  }

  return blocks.map((block) => {
    if (!block || !block._bookshop_name) {
      return null;
    }

    const Component = resolveComponent(block._bookshop_name);

    return Component ? { Component, props: filterInternalProps(block) } : null;
  });
}

export function renderContentBlocks(contentBlocks: any[]) {
  if (!contentBlocks || contentBlocks.length === 0) {
    return [];
  }

  return contentBlocks.map((block) => {
    const Component = resolveComponent(block._bookshop_name);

    return Component ? { Component, props: filterInternalProps(block) } : null;
  });
}

export { componentMap };
