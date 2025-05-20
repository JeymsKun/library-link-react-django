import { supabase } from "../lib/supabase";

const fetchStaffData = async (email) => {
  if (!email) {
    throw new Error("Email is required to fetch staff data.");
  }

  const { data, error } = await supabase
    .from("staff")
    .select("staff_uuid")
    .eq("email", email)
    .single();

  if (error) {
    console.error("Error fetching staff data:", error.message);
    throw new Error("Failed to fetch staff data. Please try again.");
  }

  return data;
};

export { fetchStaffData };
