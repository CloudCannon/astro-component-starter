import fs from "fs";
import { glob } from "glob";
import yaml from "js-yaml";
import path from "path";

/**
 * CloudCannon Structures Generator
 *
 * This script aggregates component configurations from *.config.yml files
 * and generates the _structures section in cloudcannon.config.yml.
 *
 * Structure Aliases:
 * -----------------
 * You can define 1:1 relationships between structures in cloudcannon.config.yml:
 *
 *   structure_aliases:
 *     firstContentBlocks: contentBlocks
 *     secondContentBlocks: contentBlocks
 *
 * When a component specifies it belongs to 'contentBlocks', it will automatically
 * be added to 'firstContentBlocks' and 'secondContentBlocks' as well.
 *
 * This eliminates the need to specify all three structures in every component config.
 */

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

      // Skip files without a component definition
      if (!config.component) {
        continue;
      }

      const component = config.component;
      const componentPath = path.relative("src/components", configFile);

      console.log(`   Processing: ${componentPath}`);

      // Extract the component definition (everything except 'structures')
      const { structures: targetStructures, ...componentDef } = component;

      // Include _inputs if they exist in the config file
      // This ensures each structure value has the correct input configuration
      if (config._inputs) {
        componentDef._inputs = config._inputs;
      }

      if (!targetStructures || !Array.isArray(targetStructures)) {
        console.warn(`   ⚠️  Warning: ${componentPath} has no structures array`);
        continue;
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

  // Merge in the generated structures (preserve structure_aliases)
  const updatedConfig = {
    ...existingConfig,
    _structures: structures,
  };

  // Write back to cloudcannon.config.yml
  const yamlContent = yaml.dump(updatedConfig, {
    lineWidth: -1, // Don't wrap lines
    quotingType: '"',
    forceQuotes: false,
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
