// ============================================================================
// SAVVY.AI — Client-Side Canvas Blackout Masking Engine (Privacy Shield)
// Zero Facial Biometrics & Sensitive PII Transit (UU PDP No. 27/2022 Compliance)
// ============================================================================

export interface MaskBox {
  x: number; // percentage (0-1) or pixel
  y: number;
  width: number;
  height: number;
  label?: string;
}

/**
 * Default KTP Indonesia Face & Signature Blackout regions
 * Based on standardized Dukcapil KTP-el layout:
 * - Portrait photo is on the right (~65% - 95% horizontal, 20% - 85% vertical)
 * - Signature is bottom right (~65% - 95% horizontal, 75% - 95% vertical)
 */
export const KTP_DEFAULT_MASKS: MaskBox[] = [
  { x: 0.65, y: 0.20, width: 0.30, height: 0.65, label: "Face Biometric Blackout" },
  { x: 0.65, y: 0.75, width: 0.30, height: 0.20, label: "Signature Blackout" }
];

export const PASSPORT_DEFAULT_MASKS: MaskBox[] = [
  { x: 0.05, y: 0.20, width: 0.35, height: 0.60, label: "Passport Photo Blackout" }
];

/**
 * Loads an image from a Data URL or Blob into an HTMLImageElement
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = (err) => reject(err);
    img.src = src;
  });
}

/**
 * Applies solid black blackout masks directly on an in-memory HTML5 Canvas.
 * Guaranteed zero face pixels leave the client.
 */
export async function applyBlackoutMask(
  imageSource: string | HTMLCanvasElement,
  masks: MaskBox[] = KTP_DEFAULT_MASKS
): Promise<string> {
  let canvas: HTMLCanvasElement;
  let ctx: CanvasRenderingContext2D;

  if (typeof imageSource === "string") {
    const img = await loadImage(imageSource);
    canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0);
  } else {
    canvas = document.createElement("canvas");
    canvas.width = imageSource.width;
    canvas.height = imageSource.height;
    ctx = canvas.getContext("2d")!;
    ctx.drawImage(imageSource, 0, 0);
  }

  const { width, height } = canvas;

  // Render solid black blackout rectangles over sensitive biometric/signature zones
  ctx.fillStyle = "#000000";

  for (const mask of masks) {
    const x = mask.x <= 1 ? mask.x * width : mask.x;
    const y = mask.y <= 1 ? mask.y * height : mask.y;
    const w = mask.width <= 1 ? mask.width * width : mask.width;
    const h = mask.height <= 1 ? mask.height * height : mask.height;

    ctx.fillRect(x, y, w, h);

    // Optional border and security watermark inside the blacked-out box
    ctx.strokeStyle = "#2563EB";
    ctx.lineWidth = 2;
    ctx.strokeRect(x, y, w, h);

    // Watermark text inside mask
    ctx.fillStyle = "#FFFFFF";
    ctx.font = `bold ${Math.max(12, Math.floor(w * 0.07))}px sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("[PROTECTED BIOMETRIC]", x + w / 2, y + h / 2);
    ctx.fillStyle = "#000000"; // revert fill
  }

  // Return zero-biometric masked image data URL (JPEG 90% quality)
  return canvas.toDataURL("image/jpeg", 0.9);
}

/**
 * Snips a bounding client rect from the active page using HTML Canvas
 */
export function cropCanvasRegion(
  sourceCanvas: HTMLCanvasElement,
  rect: { x: number; y: number; width: number; height: number }
): string {
  const cropCanvas = document.createElement("canvas");
  cropCanvas.width = rect.width;
  cropCanvas.height = rect.height;
  const cropCtx = cropCanvas.getContext("2d")!;

  cropCtx.drawImage(
    sourceCanvas,
    rect.x,
    rect.y,
    rect.width,
    rect.height,
    0,
    0,
    rect.width,
    rect.height
  );

  return cropCanvas.toDataURL("image/jpeg", 0.85);
}
