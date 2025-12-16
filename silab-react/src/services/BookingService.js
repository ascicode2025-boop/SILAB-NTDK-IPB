import axios from "axios";
import { getAuthHeader } from "./AuthService"; 

const API_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";

// --- 1. BUAT BOOKING BARU (KLIEN) ---
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

// --- 2. LIHAT RIWAYAT SAYA (KLIEN) ---
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

// --- 3. LIHAT SEMUA BOOKING (TEKNISI) ---
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

// --- 4. UPDATE STATUS (SETUJU/TOLAK) ---
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

// --- 5. UPDATE HASIL ANALISIS (BARU DITAMBAHKAN) ---
// Fungsi ini dipanggil saat teknisi menekan tombol "Simpan Data & Selesai"
export const updateAnalysisResult = async (id, data) => {
  try {
    // Endpoint ini harus sesuai dengan route di Laravel: Route::put('/bookings/{id}/results', ...)
    const response = await axios.put(`${API_URL}/bookings/${id}/results`, data, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error("Gagal menyimpan hasil analisis:", error);
    
    if (error.response) {
        throw error.response.data;
    } else {
        throw new Error("Gagal menyimpan data analisis.");
    }
  }
};