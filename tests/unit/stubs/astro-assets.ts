/** `astro:assets` stub (aliased in vitest.config.ts); only what the unit tests touch. */
export async function getImage(options: { src: string | { src?: string } }): Promise<{
  src: string;
}> {
  const { src } = options;

  return { src: typeof src === "string" ? src : (src?.src ?? "") };
}
