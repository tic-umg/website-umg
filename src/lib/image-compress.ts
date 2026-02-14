export type ImageCompressOptions = {
  maxDimension?: number;
  quality?: number;
  maxSizeBytes?: number;
};

const DEFAULT_OPTIONS: Required<ImageCompressOptions> = {
  maxDimension: 2000,
  quality: 0.8,
  maxSizeBytes: 1_000_000,
};

function shouldCompress(file: File, options: Required<ImageCompressOptions>) {
  if (!file.type.startsWith("image/")) return false;
  if (file.size > options.maxSizeBytes) return true;
  return false;
}

async function loadImage(file: File): Promise<HTMLImageElement> {
  const imageUrl = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.decoding = "async";
    img.src = imageUrl;
    await img.decode();
    return img;
  } finally {
    URL.revokeObjectURL(imageUrl);
  }
}

export async function compressImageFile(file: File, opts?: ImageCompressOptions): Promise<File> {
  const options = { ...DEFAULT_OPTIONS, ...opts };
  if (!shouldCompress(file, options)) return file;

  const img = await loadImage(file);
  const { width, height } = img;
  const scale = Math.min(1, options.maxDimension / Math.max(width, height));
  const targetWidth = Math.max(1, Math.round(width * scale));
  const targetHeight = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = targetWidth;
  canvas.height = targetHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

  const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";

  const blob = await new Promise<Blob | null>((resolve) => {
    canvas.toBlob(resolve, outputType, outputType === "image/jpeg" ? options.quality : undefined);
  });

  if (!blob) return file;

  const name = outputType === file.type ? file.name : file.name.replace(/\.[^.]+$/, ".jpg");
  return new File([blob], name, { type: outputType, lastModified: file.lastModified });
}
