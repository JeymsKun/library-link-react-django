import { supabase } from "../lib/supabase";

export const fetchBookInfo = async (barcode) => {
  if (!barcode) {
    throw new Error("Barcode is required to fetch book information.");
  }

  const { data, error } = await supabase
    .from("books")
    .select("*, genres:genre_id(name)")
    .eq("barcode", barcode)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      throw new Error("No book found for the provided barcode.");
    }
    console.error("Error fetching book data:", error);
    throw new Error("An unexpected error occurred while fetching book data.");
  }
  const coverUrl = supabase.storage
    .from("library")
    .getPublicUrl(data.cover_image_url.trim()).data.publicUrl;

  const imageUrls = Array.isArray(data.image_urls)
    ? data.image_urls.map(
        (imgPath) =>
          supabase.storage.from("library").getPublicUrl(imgPath.trim()).data
            .publicUrl
      )
    : [];

  return {
    ...data,
    genre: data.genres?.name || "Unknown Genre",
    coverUrl,
    imageUrls,
  };
};
