import axios from "axios";

const API_URL = process.env.REACT_APP_API_BASE_URL || "http://https://api.silabntdk.com/api";

// Mendapatkan daftar harga analisis dari backend
export const getAnalysisPrices = async () => {
  const response = await axios.get(`${API_URL}/analysis-prices-grouped`);
  return response.data;
};
