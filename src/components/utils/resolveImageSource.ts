const imageFiles = import.meta.glob("/src/assets/images/**/*", {
  import: "default",
  eager: true,
}) as Record<string, any>;

export function resolveImageSource(source: string) {
  if (!source.startsWith("/src/")) {
    return source;
  }

  const imageKey = Object.keys(imageFiles).find((key) => key.endsWith(source));
  const resolvedImage = imageKey ? imageFiles[imageKey] : null;

  if (!resolvedImage) {
    return source;
  }

  return typeof resolvedImage === "string" ? resolvedImage : resolvedImage.src;
}
