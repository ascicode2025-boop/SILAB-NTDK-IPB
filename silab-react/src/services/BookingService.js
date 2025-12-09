import axios from "axios";
import { getAuthHeader } from "./AuthService"; 

const API_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";

export const createBooking = async (bookingData) => {
  try {
    const response = await axios.post(`${API_URL}/bookings`, bookingData, {
      headers: getAuthHeader() 
    });
    return response.data;
  } catch (error) {
    console.error("Gagal membuat booking:", error);

    if (error.response) {
        throw error.response.data; 
    } else if (error.request) {
        throw new Error("Tidak dapat terhubung ke server. Periksa koneksi internet Anda.");
    } else {
        throw new Error("Terjadi kesalahan sistem.");
    }
  }
};


export const getUserBookings = async () => {
  try {
    const response = await axios.get(`${API_URL}/bookings`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil riwayat:", error);

    if (error.response) {
        throw error.response.data;
    } else if (error.request) {
        throw new Error("Tidak dapat terhubung ke server.");
    } else {
        throw new Error("Terjadi kesalahan sistem saat mengambil data.");
    }
  }
};



export const getAllBookings = async () => {
  try {
    
    const response = await axios.get(`${API_URL}/bookings/all`, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error("Gagal mengambil semua data:", error);
    
    if (error.response) {
        throw error.response.data;
    } else {
        throw new Error("Gagal mengambil data verifikasi.");
    }
  }
};

export const updateBookingStatus = async (id, status, alasan = null) => {
  try {
    const payload = { status, alasan };
    const response = await axios.put(`${API_URL}/bookings/${id}/status`, payload, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error("Gagal update status:", error);
    
    if (error.response) {
        throw error.response.data;
    } else {
        throw new Error("Gagal update status pesanan.");
    }
  }
};