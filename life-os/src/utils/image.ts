// Canvas-based resize + JPEG compression so progress photos stay small enough
// for localStorage (which has no business holding full-resolution originals).

function drawToDataUrl(
  source: CanvasImageSource,
  srcWidth: number,
  srcHeight: number,
  maxWidth: number,
  quality: number,
): string {
  const scale = Math.min(1, maxWidth / srcWidth);
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(srcWidth * scale));
  canvas.height = Math.max(1, Math.round(srcHeight * scale));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D context unavailable");
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", quality);
}

export async function compressImageFile(
  file: File,
  maxWidth = 900,
  quality = 0.72,
): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const url = drawToDataUrl(bitmap, bitmap.width, bitmap.height, maxWidth, quality);
  bitmap.close();
  return url;
}

export function compressVideoFrame(
  video: HTMLVideoElement,
  maxWidth = 900,
  quality = 0.72,
): string {
  return drawToDataUrl(video, video.videoWidth, video.videoHeight, maxWidth, quality);
}
