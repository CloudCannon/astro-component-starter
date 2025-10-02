import { getCollection } from "astro:content";

export async function generateNavData(navData) {
  const allComponents = await getCollection("docs-components");

  const componentsByCategory = {};

  allComponents.forEach((component) => {
    const slug = component.id.replace(/^components\//, "").replace(/\/index$/, "");
    const parts = slug.split("/").filter(Boolean);

    if (
      slug.includes("/examples/") ||
      slug.includes("bookshop") ||
      (!component.data.title && !component.data.name)
    ) {
      return;
    }

    if (parts.length >= 1) {
      const category = parts[0];
      const componentName = parts.length > 1 ? parts[1] : parts[0];
      const path = `/component-library/components/${category}/${componentName}/`;

      if (!componentsByCategory[category]) {
        componentsByCategory[category] = {};
      }

      if (!componentsByCategory[category]["default"]) {
        componentsByCategory[category]["default"] = [];
      }

      componentsByCategory[category]["default"].push({
        name: component.data.title || componentName.replace(/-/g, " "),
        path,
        order: Number(component.data.order) || 999,
      });
    }
  });

  const convertToNavData = (sections) => {
    return sections
      .map((section) => {
        if (section.group && section.items && Array.isArray(section.items)) {
          return {
            name: section.group,
            path: "#",
            children: section.items.map((item) => {
              if (item.items && Array.isArray(item.items)) {
                return {
                  name: item.name,
                  path: "#",
                  children: item.items.map((subItem) => ({
                    name: subItem.name,
                    path: subItem.path,
                    children: [],
                  })),
                };
              }
              return {
                name: item.name,
                path: item.path,
                children: [],
              };
            }),
          };
        }

        if (section.path) {
          return {
            name: section.name || "",
            path: section.path,
            children: [],
          };
        }

        return null;
      })
      .filter(Boolean);
  };

  const populatedNavData = navData.map((section) => {
    if (section.group) {
      const category = section.group.toLowerCase();
      const categoryData = componentsByCategory[category] || {};

      if (category === "blocks" && categoryData.navigation) {
        const navigationItems = categoryData.navigation.sort((a, b) => {
          if (a.order !== b.order) {
            return a.order - b.order;
          }
          return a.name.localeCompare(b.name);
        });

        return {
          ...section,
          items: [
            {
              name: "Navigation",
              items: navigationItems,
            },
            ...Object.entries(categoryData)
              .filter(([key]) => key !== "navigation")
              .map(([subcategory, items]) => ({
                name: subcategory.charAt(0).toUpperCase() + subcategory.slice(1),
                items: items.sort((a, b) => {
                  if (a.order !== b.order) {
                    return a.order - b.order;
                  }
                  return a.name.localeCompare(b.name);
                }),
              })),
          ],
        };
      } else {
        const items = categoryData.default || [];
        const sortedItems = items.sort((a, b) => {
          if (a.order !== b.order) {
            return a.order - b.order;
          }
          return a.name.localeCompare(b.name);
        });

        return {
          ...section,
          items: sortedItems,
        };
      }
    }

    return section;
  });

  return convertToNavData(populatedNavData);
}
