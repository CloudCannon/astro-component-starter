const ROLES = new Set(["none", "tight", "loose"]);

// `default` (or unset) leaves the block's CSS type default in charge.
export function spaceBeforeAttr(spaceBefore) {
  return ROLES.has(spaceBefore) ? spaceBefore : undefined;
}
