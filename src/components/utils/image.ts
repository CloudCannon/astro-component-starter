import type { ImageMetadata } from "astro";
import { getImage } from "astro:assets";

const VIDEO_POSTER_MAX_WIDTH = 1920;
const VIDEO_POSTER_MAX_HEIGHT = 1080;

type ImageModule = string | ImageMetadata;

const imageFiles = import.meta.glob("/src/assets/images/**/*", {
  import: "default",
  eager: true,
}) as Record<string, ImageModule>;

const ASPECT_RATIO_MAP: Record<string, number> = {
  square: 1,
  landscape: 4 / 3,
  portrait: 3 / 4,
  widescreen: 16 / 9,
  "horizontal-strip": 16 / 5,
};

const POSITION_MAP: Record<string, string> = {
  "top-left": "northwest",
  "top-center": "north",
  "top-right": "northeast",
  "center-left": "west",
  "center-center": "center",
  "center-right": "east",
  "bottom-left": "southwest",
  "bottom-center": "south",
  "bottom-right": "southeast",
};

interface BasePreparedImageData {
  imageWidth: number | undefined;
  imageHeight: number | undefined;
  finalWidth: number | undefined;
  finalHeight: number | undefined;
  filteredWidths: number[];
  useFit: "cover" | undefined;
  usePosition: string | undefined;
}

interface OptimizedPreparedImageData extends BasePreparedImageData {
  imageSrc: ImageMetadata;
  shouldRenderOptimizedPicture: true;
}

interface StandardPreparedImageData extends BasePreparedImageData {
  imageSrc: string | undefined;
  shouldRenderOptimizedPicture: false;
}

export type PreparedImageData = OptimizedPreparedImageData | StandardPreparedImageData;

interface PrepareImageOptions {
  source?: string;
  width?: number;
  height?: number;
  widths?: unknown;
  aspectRatio?: string | null;
  positionVertical?: string;
  positionHorizontal?: string;
}

const getLocalImageAsset = (source: string) => {
  const imageKey = Object.keys(imageFiles).find((key) => key.endsWith(source));

  return imageKey ? imageFiles[imageKey] : null;
};

const getResponsiveWidths = (candidates: unknown, maxWidth?: number) => {
  const normalizedWidths = Array.isArray(candidates)
    ? [
        ...new Set(
          candidates
            .map((value) => Number(value))
            .filter((value) => Number.isFinite(value) && value > 0)
            .map((value) => Math.round(value))
        ),
      ].sort((a, b) => a - b)
    : [];

  if (!maxWidth) {
    return normalizedWidths;
  }

  const maxCandidateWidth = Math.max(1, Math.round(maxWidth));
  const filteredWidths = normalizedWidths.filter(
    (candidateWidth) => candidateWidth <= maxCandidateWidth
  );

  return filteredWidths.length > 0 ? filteredWidths : [maxCandidateWidth];
};

export function resolveImageSource(source: string) {
  if (!source.startsWith("/src/")) {
    return source;
  }

  const resolvedImage = getLocalImageAsset(source);

  if (!resolvedImage) {
    return source;
  }

  return typeof resolvedImage === "string" ? resolvedImage : resolvedImage.src;
}

export async function resolveVideoPosterSource(source: string): Promise<string> {
  const trimmed = source.trim();

  if (!trimmed.startsWith("/src/")) {
    return trimmed;
  }

  const resolvedImage = getLocalImageAsset(trimmed);

  if (!resolvedImage) {
    return trimmed;
  }

  if (typeof resolvedImage === "string") {
    return resolvedImage;
  }

  if (trimmed.toLowerCase().endsWith(".svg")) {
    return resolvedImage.src;
  }

  const w = resolvedImage.width;
  const h = resolvedImage.height;

  if (!w || !h) {
    const { src } = await getImage({
      src: resolvedImage,
      width: VIDEO_POSTER_MAX_WIDTH,
    });

    return src;
  }

  const scale = Math.min(1, VIDEO_POSTER_MAX_WIDTH / w, VIDEO_POSTER_MAX_HEIGHT / h);
  const outW = Math.max(1, Math.round(w * scale));
  const outH = Math.max(1, Math.round(h * scale));

  const { src } = await getImage({
    src: resolvedImage,
    width: outW,
    height: outH,
  });

  return src;
}

export function prepareImageData({
  source,
  width,
  height,
  widths,
  aspectRatio,
  positionVertical = "center",
  positionHorizontal = "center",
}: PrepareImageOptions): PreparedImageData {
  const isLocalSource = typeof source === "string" && source.startsWith("/src/");
  const isSvg = typeof source === "string" && source.toLowerCase().endsWith(".svg");

  let imageSrc = source;
  let imageWidth = width;
  let imageHeight = height;
  let shouldRenderOptimizedPicture = false;

  if (isLocalSource && source) {
    const resolvedImage = getLocalImageAsset(source);

    if (resolvedImage) {
      if (typeof resolvedImage === "string") {
        imageSrc = resolvedImage;
      } else if (isSvg) {
        imageSrc = resolvedImage.src;
        imageWidth = imageWidth || resolvedImage.width;
        imageHeight = imageHeight || resolvedImage.height;
      } else {
        imageSrc = resolvedImage;
        imageWidth = imageWidth || resolvedImage.width;
        imageHeight = imageHeight || resolvedImage.height;
        shouldRenderOptimizedPicture = true;
      }
    } else {
      console.warn(`Local image not found for path: ${source}`);
    }
  }

  let finalWidth = imageWidth;
  let finalHeight = imageHeight;
  let useFit: "cover" | undefined;
  let usePosition: string | undefined;

  if (
    aspectRatio &&
    aspectRatio !== "none" &&
    shouldRenderOptimizedPicture &&
    imageSrc &&
    imageWidth
  ) {
    const targetAspect = ASPECT_RATIO_MAP[aspectRatio];

    if (targetAspect) {
      let maxWidth: number;
      let maxHeight: number;

      if (targetAspect === 1 && imageHeight) {
        const dimension = Math.min(imageWidth, imageHeight);

        maxWidth = dimension;
        maxHeight = dimension;
      } else if (imageHeight) {
        const heightFromWidth = imageWidth / targetAspect;

        if (heightFromWidth <= imageHeight) {
          maxWidth = imageWidth;
          maxHeight = Math.round(imageWidth / targetAspect);
        } else {
          maxWidth = Math.round(imageHeight * targetAspect);
          maxHeight = imageHeight;
        }
      } else {
        maxWidth = imageWidth;
        maxHeight = Math.round(imageWidth / targetAspect);
      }

      finalWidth = maxWidth;
      finalHeight = maxHeight;
      useFit = "cover";

      const positionKey = `${positionVertical}-${positionHorizontal}`;

      usePosition = POSITION_MAP[positionKey] || "center";
    }
  }

  const filteredWidths =
    shouldRenderOptimizedPicture && finalWidth
      ? getResponsiveWidths(widths, finalWidth)
      : getResponsiveWidths(widths);

  if (shouldRenderOptimizedPicture && typeof imageSrc !== "string") {
    return {
      imageSrc,
      imageWidth,
      imageHeight,
      finalWidth,
      finalHeight,
      filteredWidths,
      shouldRenderOptimizedPicture: true,
      useFit,
      usePosition,
    };
  }

  return {
    imageSrc: typeof imageSrc === "string" ? imageSrc : imageSrc?.src,
    imageWidth,
    imageHeight,
    finalWidth,
    finalHeight,
    filteredWidths,
    shouldRenderOptimizedPicture: false,
    useFit,
    usePosition,
  };
}
