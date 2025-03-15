import { useQuery } from "@tanstack/react-query";
import axios from "axios";

const fetchCategories = async () => {
  try {
    const response = await axios.get("/api/categories");

    // Kiểm tra cấu trúc dữ liệu
    if (!response.data || !response.data.categories) {
      throw new Error("Invalid response format");
    }

    return response.data.categories;
  } catch (error) {
    if (error.response?.data?.message) {
      throw new Error(error.response.data.message);
    }
    throw new Error("Failed to fetch categories");
  }
};

export const useCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
    select: (data) => {
      try {
        // Transform parent categories and their children
        return data.map((parentCategory) => ({
          id: parentCategory.id,
          title: parentCategory.name,
          items:
            parentCategory.categories?.map((childCategory) => ({
              id: childCategory.id,
              name: childCategory.name,
              parentId: childCategory.parent.id,
            })) || [],
        }));
      } catch {
        return [];
      }
    },
  });
};
