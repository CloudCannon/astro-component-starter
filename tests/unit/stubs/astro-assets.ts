/**
 * Minimal stand-in for the `astro:assets` virtual module (aliased in
 * vitest.config.ts) so `src/components/utils/image.ts` can be imported under
 * Vitest. Only what the unit tests touch is stubbed: the tests exercise the
 * pure code paths of `prepareImageData` / `resolveImageSource`, which never
 * call `getImage`.
 */
export async function getImage(options: { src: string | { src?: string } }): Promise<{
  src: string;
}> {
  const { src } = options;

  return { src: typeof src === "string" ? src : (src?.src ?? "") };
}
