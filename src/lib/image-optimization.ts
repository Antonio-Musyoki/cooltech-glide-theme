interface OptimizeOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: "image/webp" | "image/jpeg" | "image/png";
}

interface OptimizedResult {
  optimized: File;
  thumbnail: File;
  originalSize: number;
  optimizedSize: number;
  thumbnailSize: number;
}

const THUMBNAIL_SIZE = 300;
const DEFAULT_MAX_WIDTH = 1600;
const DEFAULT_MAX_HEIGHT = 1600;
const DEFAULT_QUALITY = 0.82;

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    const url = URL.createObjectURL(file);
    img.src = url;
  });
}

function resizeToCanvas(
  img: HTMLImageElement,
  maxWidth: number,
  maxHeight: number
): HTMLCanvasElement {
  let { naturalWidth: w, naturalHeight: h } = img;

  if (w > maxWidth || h > maxHeight) {
    const ratio = Math.min(maxWidth / w, maxHeight / h);
    w = Math.round(w * ratio);
    h = Math.round(h * ratio);
  }

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, w, h);
  return canvas;
}

function canvasToFile(
  canvas: HTMLCanvasElement,
  fileName: string,
  format: string,
  quality: number
): Promise<File> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) return reject(new Error("Canvas toBlob failed"));
        resolve(new File([blob], fileName, { type: blob.type }));
      },
      format,
      quality
    );
  });
}

export async function optimizeImage(
  file: File,
  options: OptimizeOptions = {}
): Promise<OptimizedResult> {
  const {
    maxWidth = DEFAULT_MAX_WIDTH,
    maxHeight = DEFAULT_MAX_HEIGHT,
    quality = DEFAULT_QUALITY,
    format = "image/webp",
  } = options;

  const img = await loadImage(file);

  // Optimized version
  const optimizedCanvas = resizeToCanvas(img, maxWidth, maxHeight);
  const ext = format === "image/webp" ? "webp" : format === "image/jpeg" ? "jpg" : "png";
  const baseName = file.name.replace(/\.[^.]+$/, "");
  const optimized = await canvasToFile(
    optimizedCanvas,
    `${baseName}.${ext}`,
    format,
    quality
  );

  // Thumbnail version (square crop from center)
  const thumbCanvas = document.createElement("canvas");
  thumbCanvas.width = THUMBNAIL_SIZE;
  thumbCanvas.height = THUMBNAIL_SIZE;
  const thumbCtx = thumbCanvas.getContext("2d")!;
  thumbCtx.imageSmoothingEnabled = true;
  thumbCtx.imageSmoothingQuality = "high";

  const { naturalWidth: iw, naturalHeight: ih } = img;
  const cropSize = Math.min(iw, ih);
  const sx = (iw - cropSize) / 2;
  const sy = (ih - cropSize) / 2;
  thumbCtx.drawImage(img, sx, sy, cropSize, cropSize, 0, 0, THUMBNAIL_SIZE, THUMBNAIL_SIZE);

  const thumbnail = await canvasToFile(
    thumbCanvas,
    `${baseName}-thumb.${ext}`,
    format,
    0.75
  );

  // Clean up
  URL.revokeObjectURL(img.src);

  return {
    optimized,
    thumbnail,
    originalSize: file.size,
    optimizedSize: optimized.size,
    thumbnailSize: thumbnail.size,
  };
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
