/**
 * Client-seitige Bild-Kompression und -Skalierung.
 *
 * Problem: Vercel Serverless Functions haben ein 4.5 MB Request-Body-Limit.
 * iPhone-Fotos sind oft 5–10 MB und werden daher abgelehnt bevor unsere
 * Upload-Route überhaupt läuft. Lösung: vor dem Upload im Browser
 * herunterrechnen auf max. 1920px Breite und als JPEG bei 0.85 Quality
 * kodieren — das ergibt typischerweise < 800 KB und verliert visuell
 * praktisch nichts.
 *
 * SVG und GIF werden unverändert durchgereicht (keine Rasterisierung).
 */
export async function resizeImage(
  file: File,
  maxWidth = 1920,
  quality = 0.85
): Promise<File> {
  if (file.type === "image/svg+xml" || file.type === "image/gif") {
    return file;
  }

  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const image = new window.Image();
      image.onload = () => resolve(image);
      image.onerror = () =>
        reject(new Error("Bild konnte nicht gelesen werden"));
      image.src = url;
    });

    // Nicht hochskalieren
    const scale = Math.min(1, maxWidth / img.width);
    const newWidth = Math.max(1, Math.round(img.width * scale));
    const newHeight = Math.max(1, Math.round(img.height * scale));

    const canvas = document.createElement("canvas");
    canvas.width = newWidth;
    canvas.height = newHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas-Context konnte nicht erstellt werden");

    // Weisser Hintergrund für transparente PNGs (sonst wird JPEG-Output schwarz)
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, newWidth, newHeight);
    ctx.drawImage(img, 0, 0, newWidth, newHeight);

    const blob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (b) =>
          b ? resolve(b) : reject(new Error("Bild-Konvertierung fehlgeschlagen")),
        "image/jpeg",
        quality
      );
    });

    const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
    return new File([blob], newName || "image.jpg", {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } finally {
    URL.revokeObjectURL(url);
  }
}
