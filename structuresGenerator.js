import fs from "fs";
import { glob } from "glob";
import yaml from "js-yaml";
import path from "path";

const CONFIG_FILE = "cloudcannon.config.yml";

async function generateStructures() {
  console.log("🔍 Scanning for component config files...");

  // Read existing CloudCannon config to check for structure aliases
  let existingConfig = {};

  if (fs.existsSync(CONFIG_FILE)) {
    const content = fs.readFileSync(CONFIG_FILE, "utf8");

    existingConfig = yaml.load(content) || {};
  }

  // Get structure aliases configuration
  // Format: { aliasName: targetName } - e.g., { firstContentBlocks: 'contentBlocks' }
  const structureAliases = existingConfig.structure_aliases || {};

  if (Object.keys(structureAliases).length > 0) {
    console.log("\n📋 Structure aliases detected:");
    for (const [alias, target] of Object.entries(structureAliases)) {
      console.log(`   - ${alias} → ${target}`);
    }
  }

  // Find all *.config.yml files in src/components
  const configFiles = await glob("src/components/**/*.config.yml", {
    ignore: ["**/node_modules/**"],
  });

  console.log(`\n   Found ${configFiles.length} component config files`);

  // Structure to hold aggregated components
  // Format: { structureName: [component1, component2, ...] }
  const structures = {};

  // Read and process each component config file
  for (const configFile of configFiles) {
    try {
      const content = fs.readFileSync(configFile, "utf8");
      const config = yaml.load(content);

      // Skip files without required fields
      if (!config.structures || !config.label) {
        continue;
      }

      const componentPath = path.relative("src/components", configFile);

      console.log(`   Processing: ${componentPath}`);

      // Fix _component path if it has duplicate folder names
      // e.g., wrappers/container/container -> wrappers/container
      if (config.value && config.value._component) {
        const parts = config.value._component.split("/");
        if (parts.length >= 2 && parts[parts.length - 1] === parts[parts.length - 2]) {
          parts.pop(); // Remove the duplicate last segment
          config.value._component = parts.join("/");
        }
      }

      // Extract the component definition (everything except 'structures' and nested '_structures')
      const {
        structures: targetStructures,
        _structures: nestedStructures,
        ...componentDef
      } = config;

      if (!targetStructures || !Array.isArray(targetStructures)) {
        console.warn(`   ⚠️  Warning: ${componentPath} has no structures array`);
        continue;
      }

      // If the component defines nested structures (like for array items), merge them
      if (nestedStructures) {
        for (const [structName, structConfig] of Object.entries(nestedStructures)) {
          if (!structures[structName]) {
            structures[structName] = {
              id_key: "_component",
              style: "modal",
              ...structConfig,
            };
          }
        }
      }

      // Expand structures to include aliases
      // If a component specifies 'contentBlocks' and there's an alias
      // 'firstContentBlocks: contentBlocks', include 'firstContentBlocks' too
      const expandedStructures = new Set(targetStructures);

      for (const structureName of targetStructures) {
        // Find any aliases that point to this structure
        for (const [alias, target] of Object.entries(structureAliases)) {
          if (target === structureName) {
            expandedStructures.add(alias);
          }
        }
      }

      // Add this component to each structure (including aliases)
      for (const structureName of expandedStructures) {
        if (!structures[structureName]) {
          structures[structureName] = {
            id_key: "_component",
            style: "modal",
            values: [],
          };
        }

        structures[structureName].values.push(componentDef);
      }
    } catch (error) {
      console.error(`   ❌ Error processing ${configFile}:`, error.message);
    }
  }

  console.log("\n📦 Generated structures:");
  for (const [name, config] of Object.entries(structures)) {
    console.log(`   - ${name}: ${config.values.length} components`);
  }

  // Merge any existing _structures from the cloudcannon.config.yml that aren't generated
  // (This preserves manually defined structures)
  const finalStructures = {
    ...structures,
  };

  // Merge in the generated structures (preserve structure_aliases and other config)
  const updatedConfig = {
    ...existingConfig,
    _structures: finalStructures,
  };

  // Write back to cloudcannon.config.yml
  const yamlContent = yaml.dump(updatedConfig, {
    lineWidth: -1, // Don't wrap lines
    quotingType: '"',
    forceQuotes: false,
    noRefs: false,
  });

  fs.writeFileSync(CONFIG_FILE, yamlContent, "utf8");

  console.log(`\n✅ Updated ${CONFIG_FILE} with generated structures`);
  console.log(`   Total structures: ${Object.keys(structures).length}`);
  console.log(
    `   Total component entries: ${Object.values(structures).reduce((sum, s) => sum + s.values.length, 0)}`
  );
}

// Run the generator
generateStructures().catch((error) => {
  console.error("❌ Failed to generate structures:", error);
  process.exit(1);
});
