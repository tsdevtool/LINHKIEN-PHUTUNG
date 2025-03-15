import axios from "axios";

export const fetchHomeData = async () => {
  const response = await axios.get("/api/home");

  // Kiểm tra cấu trúc dữ liệu
  if (!response.data) {
    throw new Error("Invalid response format");
  }

  return response.data;
};
