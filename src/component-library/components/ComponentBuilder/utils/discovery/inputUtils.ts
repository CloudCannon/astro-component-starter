import type { InputConfig, StructureValue } from "../../types";

/** True when an input is an array using a structures reference. */
export function isArrayStructureInput(inputDef: InputConfig): boolean {
  return (
    typeof inputDef === "object" &&
    inputDef !== null &&
    inputDef.type === "array" &&
    typeof inputDef.options === "object" &&
    inputDef.options !== null &&
    typeof inputDef.options.structures === "string"
  );
}

/** True when a structure definition contains component blocks (`value._component`). */
export function structureHasComponentValues(
  structureValue: StructureValue | null | undefined,
  structureName: string
): boolean {
  if (!structureValue?._structures || !structureName) return false;

  const structureDef = structureValue._structures[structureName];
  const values = structureDef?.values;

  if (!Array.isArray(values)) return false;

  return values.some((entry) => {
    const valueObj =
      entry && typeof entry === "object" && "value" in entry
        ? (entry.value as Record<string, unknown> | undefined)
        : undefined;

    return !!valueObj && typeof valueObj._component === "string";
  });
}
