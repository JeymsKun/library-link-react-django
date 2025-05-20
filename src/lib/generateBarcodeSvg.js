import bwipjs from "bwip-js";

export async function generateBarcodeSvg(isbn) {
  try {
    const pngBuffer = await bwipjs.toBuffer({
      bcid: "code128",
      text: isbn,
      scale: 3,
      height: 10,
      includetext: true,
    });

    const base64 = `data:image/png;base64,${pngBuffer.toString("base64")}`;
    return base64;
  } catch (err) {
    console.error("Barcode generation failed:", err);
    return null;
  }
}
