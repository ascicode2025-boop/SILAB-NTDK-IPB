import axios from "axios";
import { getAuthHeader } from "./AuthService"; 

const API_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";

// Add axios interceptor to handle 401 errors globally
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Token expired or invalid - redirect to login
      console.error("Session expired. Redirecting to login...");
      localStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

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
export const updateBookingStatus = async (id, statusOrPayload, alasan = null) => {
  try {
    let payload;
    
    // Support both old (string) and new (object) usage
    if (typeof statusOrPayload === 'object') {
      payload = statusOrPayload;
    } else {
      payload = { status: statusOrPayload };
      if (alasan) {
        payload.alasan_penolakan = alasan;
      }
    }
    
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

// --- 5. UPDATE HASIL ANALISIS (SIMPAN DRAFT) ---
export const updateAnalysisResult = async (id, data) => {
  try {
    const headers = getAuthHeader();
    console.log('Update analysis result - Headers:', headers);
    console.log('Update analysis result - Data:', data);
    
    const response = await axios.put(`${API_URL}/bookings/${id}/results`, data, {
      headers: headers
    });
    return response.data;
  } catch (error) {
    console.error("Gagal menyimpan hasil analisis:", error);
    
    if (error.response) {
        console.error("Error response:", error.response);
        console.error("Error status:", error.response.status);
        console.error("Error data:", error.response.data);
        
        // Jika 401, token mungkin expired
        if (error.response.status === 401) {
          console.error("Token expired atau tidak valid! User perlu login ulang.");
        }
        
        throw error.response.data;
    } else {
        throw new Error("Gagal menyimpan data analisis.");
    }
  }
};

// --- 6. FINALIZE ANALISIS (SELESAIKAN) ---
export const finalizeAnalysis = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/bookings/${id}/finalize`, {}, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error("Gagal menyelesaikan analisis:", error);
    
    if (error.response) {
        throw error.response.data;
    } else {
        throw new Error("Gagal menyelesaikan analisis.");
    }
  }
};

// --- 7. KIRIM KE KOORDINATOR ---
export const kirimKeKoordinator = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/bookings/${id}/kirim-koordinator`, {}, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error("Gagal kirim ke koordinator:", error);
    
    if (error.response) {
        throw error.response.data;
    } else {
        throw new Error("Gagal kirim hasil analisis ke koordinator.");
    }
  }
};

// --- 8. VERIFIKASI KOORDINATOR ---
export const verifikasiKoordinator = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/bookings/${id}/verifikasi`, {}, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error("Gagal verifikasi:", error);
    
    if (error.response) {
        throw error.response.data;
    } else {
        throw new Error("Gagal verifikasi hasil analisis.");
    }
  }
};

// --- 9. BATALKAN PESANAN (KLIEN) ---
export const cancelBooking = async (id) => {
  try {
    const response = await axios.put(`${API_URL}/bookings/${id}/cancel`, {}, {
      headers: getAuthHeader()
    });
    return response.data;
  } catch (error) {
    console.error("Gagal membatalkan pesanan:", error);
    
    if (error.response) {
        throw error.response.data;
    } else {
        throw new Error("Gagal membatalkan pesanan.");
    }
  }
};