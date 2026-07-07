/**
 * Component manifest library — the authoring API for `*.manifest.mjs` files.
 *
 * A manifest is the single source of truth for a component's editor contract.
 * `scripts/manifest/generate.mjs` turns it into the committed
 * `*.cloudcannon.inputs.yml` and `*.cloudcannon.structure-value.yml` files.
 * See docs/component-manifest-design.md for the design.
 */

/**
 * @typedef {Object} FieldDef
 * @property {Record<string, unknown>} input  CloudCannon `_inputs` entry for the field
 * @property {unknown} [default]              Default value emitted into the structure's `value`
 */

/**
 * Common per-field options.
 * `cloudcannon` is an escape hatch deep-merged last into the emitted input,
 * for editor config the builders don't model.
 *
 * @param {string} type
 * @param {{comment?: string, label?: string, hidden?: string | boolean, default?: unknown, cloudcannon?: Record<string, unknown>}} opts
 * @param {Record<string, unknown>} [extra]  builder-specific input keys (e.g. `options`)
 * @returns {FieldDef}
 */
function make(type, opts = {}, extra = {}) {
  const { comment, label, hidden, default: def, cloudcannon } = opts;
  const input = { type };

  if (label !== undefined) input.label = label;
  if (comment !== undefined) input.comment = comment;
  if (hidden !== undefined) input.hidden = hidden;
  Object.assign(input, extra);
  if (cloudcannon) deepMerge(input, cloudcannon);

  return { input, default: def };
}

/** @param {Record<string, unknown>} target @param {Record<string, unknown>} source */
function deepMerge(target, source) {
  for (const [key, value] of Object.entries(source)) {
    const existing = target[key];

    if (isPlainObject(existing) && isPlainObject(value)) {
      deepMerge(existing, value);
    } else {
      target[key] = value;
    }
  }
  return target;
}

/** @param {unknown} value */
function isPlainObject(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export const field = {
  /** @param {Parameters<typeof make>[1]} [opts] */
  text: (opts) => make("text", opts),
  /** @param {Parameters<typeof make>[1]} [opts] */
  textarea: (opts) => make("textarea", opts),
  /** @param {Parameters<typeof make>[1]} [opts] */
  url: (opts) => make("url", opts),
  /** @param {Parameters<typeof make>[1]} [opts] */
  switch: (opts) => make("switch", opts),
  /** @param {Parameters<typeof make>[1] & {min: number, max: number, step: number}} opts */
  range: ({ min, max, step, ...opts }) => make("range", opts, { options: { min, max, step } }),

  /**
   * @param {Parameters<typeof make>[1] & {options: {values: unknown, preview?: unknown}}} opts
   *   `options.values` is either an inline `{id, name}` list or a CloudCannon
   *   data reference string like `_select_data.icons`.
   */
  select: ({ options: selectOptions, ...opts }) => {
    const optionsEntry = { values: selectOptions.values };

    if (selectOptions.preview !== undefined) optionsEntry.preview = selectOptions.preview;
    return make("select", opts, { options: optionsEntry });
  },

  /** @param {Parameters<typeof make>[1] & {paths?: Record<string, string>, resize?: Record<string, unknown>}} [opts] */
  image: ({ paths, resize, ...opts } = {}) =>
    make("image", opts, { options: { ...(paths ? { paths } : {}), ...(resize ?? {}) } }),
};

/** Shared select vocabularies — defined once, referenced from any manifest. */
export const options = {
  icons: {
    values: "_select_data.icons",
    preview: {
      text: [{ key: "name" }],
      image: [{ template: "src/icons/{id}.svg" }],
    },
  },
  iconColors: {
    values: [
      { id: "default", name: "Default" },
      { id: "blue", name: "Blue" },
      { id: "green", name: "Green" },
      { id: "yellow", name: "Yellow" },
      { id: "orange", name: "Orange" },
      { id: "red", name: "Red" },
      { id: "purple", name: "Purple" },
      { id: "pink", name: "Pink" },
      { id: "cyan", name: "Cyan" },
    ],
  },
  iconPositions: {
    values: [
      { id: "before", name: "Before" },
      { id: "after", name: "After" },
    ],
  },
  buttonVariants: {
    values: [
      { id: "primary", name: "Primary" },
      { id: "secondary", name: "Secondary" },
      { id: "tertiary", name: "Tertiary" },
      { id: "ghost", name: "Ghost" },
      { id: "text", name: "Text" },
    ],
  },
  sizesSml: {
    values: [
      { id: "sm", name: "Small" },
      { id: "md", name: "Medium" },
      { id: "lg", name: "Large" },
    ],
  },
};

/**
 * @typedef {Object} ComponentManifest
 * @property {string} component   Component path as used in `_component` (e.g. "building-blocks/core-elements/button")
 * @property {string} label
 * @property {string} icon        CloudCannon icon name
 * @property {string} description
 * @property {Record<string, FieldDef>} fields
 * @property {{subtextKey?: string, picker_subtext?: string}} [preview]
 */

/** @param {ComponentManifest} manifest */
export function defineComponentManifest(manifest) {
  return manifest;
}

/**
 * Build the `_inputs` object (contents of `*.cloudcannon.inputs.yml`).
 * @param {ComponentManifest} manifest
 */
export function buildInputs(manifest) {
  return Object.fromEntries(
    Object.entries(manifest.fields).map(([name, fieldDef]) => [name, fieldDef.input])
  );
}

/**
 * Build the structure (contents of `*.cloudcannon.structure-value.yml`).
 * @param {ComponentManifest} manifest
 */
export function buildStructureValue(manifest) {
  const value = { _component: manifest.component };

  for (const [name, fieldDef] of Object.entries(manifest.fields)) {
    if (fieldDef.default !== undefined) value[name] = fieldDef.default;
  }

  const componentName = manifest.component.split("/").at(-1);
  const structure = {
    label: manifest.label,
    icon: manifest.icon,
    description: manifest.description,
    value,
    preview: {
      text: [manifest.label],
      ...(manifest.preview?.subtextKey ? { subtext: [{ key: manifest.preview.subtextKey }] } : {}),
      icon: manifest.icon,
    },
    picker_preview: {
      text: manifest.label,
      subtext: manifest.preview?.picker_subtext ?? manifest.description,
    },
    _inputs_from_glob: [
      `/src/components/${manifest.component}/${componentName}.cloudcannon.inputs.yml`,
    ],
  };

  return structure;
}
