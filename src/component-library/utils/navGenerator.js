import { getCollection } from "astro:content";

const DISPLAY_NAME_OVERRIDES = {
  ctas: "CTAs",
  cta: "CTA",
};

const formatDisplayName = (value = "") => {
  const lower = value.toLowerCase();

  if (DISPLAY_NAME_OVERRIDES[lower]) {
    return DISPLAY_NAME_OVERRIDES[lower];
  }

  return value
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

export async function generateNavData(navData) {
  const allComponents = await getCollection("docs-components");

  const componentsByCategory = {};

  allComponents.forEach((component) => {
    const slug = component.id.replace(/^components\//, "").replace(/\/index$/, "");
    const parts = slug.split("/").filter(Boolean);

    if (slug.includes("/examples/") || (!component.data.title && !component.data.name)) {
      return;
    }

    if (parts.length >= 1) {
      const path = `/component-library/components/${slug}/`;
      const componentName = parts[parts.length - 1];

      if (parts.length >= 2) {
        const topCategory = parts[0];
        const subCategory = parts[1];

        if (!componentsByCategory[topCategory]) {
          componentsByCategory[topCategory] = {};
        }

        if (topCategory === "navigation") {
          if (!componentsByCategory[topCategory]["default"]) {
            componentsByCategory[topCategory]["default"] = [];
          }
          componentsByCategory[topCategory]["default"].push({
            name: component.data.title || componentName.replace(/-/g, " "),
            path,
            order: Number(component.data.order) || 999,
          });
        } else if (parts.length === 2) {
          if (!componentsByCategory[topCategory]["default"]) {
            componentsByCategory[topCategory]["default"] = [];
          }
          componentsByCategory[topCategory]["default"].push({
            name: component.data.title || componentName.replace(/-/g, " "),
            path,
            order: Number(component.data.order) || 999,
          });
        } else {
          if (!componentsByCategory[topCategory][subCategory]) {
            componentsByCategory[topCategory][subCategory] = [];
          }
          componentsByCategory[topCategory][subCategory].push({
            name: component.data.title || componentName.replace(/-/g, " "),
            path,
            order: Number(component.data.order) || 999,
          });
        }
      } else if (parts.length === 1) {
        const category = parts[0];

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
              if (item.group || (item.items && Array.isArray(item.items))) {
                return {
                  name: item.group || item.name || "",
                  path: "#",
                  children: (item.items || []).map((subItem) => ({
                    name: subItem.name,
                    path: subItem.path,
                    children: [],
                  })),
                };
              }
              return {
                name: item.name || "",
                path: item.path || "#",
                children: [],
              };
            }),
          };
        }

        if (section.path) {
          return {
            name: section.name || "",
            path: section.path,
            children: section.children || [],
          };
        }

        return null;
      })
      .filter(Boolean);
  };

  const populatedNavData = navData.map((section) => {
    if (section.group) {
      const category = section.group.toLowerCase().replace(/\s+/g, "-");
      const categoryData = componentsByCategory[category] || {};

      const subcategories = Object.keys(categoryData).filter((key) => key !== "default");

      const flatItems = categoryData.default || [];
      const sortedFlatItems = flatItems.sort((a, b) => {
        if (a.order !== b.order) {
          return a.order - b.order;
        }
        return a.name.localeCompare(b.name);
      });

      const nestedItems = subcategories.map((subCategory) => {
        const childData = categoryData[subCategory] || [];
        const sortedItems = childData.sort((a, b) => {
          if (a.order !== b.order) {
            return a.order - b.order;
          }
          return a.name.localeCompare(b.name);
        });

        const displayName = formatDisplayName(subCategory);

        return {
          group: displayName,
          items: sortedItems,
        };
      });

      const allItems = [...sortedFlatItems, ...nestedItems];

      return {
        ...section,
        items: allItems,
      };
    }

    return section;
  });

  return convertToNavData(populatedNavData);
}
