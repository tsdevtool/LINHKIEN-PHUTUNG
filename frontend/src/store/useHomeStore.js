import axios from "axios";

export const fetchHomeData = async () => {
  const res = await axios.get("/api/home");
  return res.data;
};
