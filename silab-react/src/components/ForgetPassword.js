import React, { useState } from "react";
import axios from "axios";
import { useHistory} from "react-router-dom"; // Impor useNavigate

// Ganti dengan URL API Laravel Anda
const API_URL = "http://127.0.0.1:8000/api";

function ForgetPassword() {
  // State untuk mengontrol langkah (email, otp, password)
  const [step, setStep] = useState("email"); 
  
  // State untuk data form
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  // State untuk UI feedback
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  
  const history = useHistory(); // Hook untuk navigasi

  // Fungsi untuk menangani pengiriman email (Langkah 1)
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await axios.post(`${API_URL}/send-otp`, { email });
      setMessage(response.data.message); // "OTP telah dikirim ke email Anda."
      setStep("otp"); // Pindah ke langkah OTP
    } catch (err) {
      setError(err.response?.data?.message || "Email tidak ditemukan.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk menangani submit OTP (Langkah 2)
  // Kita gabungkan verifikasi di langkah akhir saja agar efisien
  const handleVerifyOtp = (e) => {
    e.preventDefault();
    if (otp.length === 6) {
        setError(null);
        setStep("password"); // Langsung pindah ke langkah password
    } else {
        setError("OTP harus 6 digit.");
    }
  };

  // Fungsi untuk menangani reset password (Langkah 3)
  const handleResetPassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);
    setError(null);

    if (password !== passwordConfirmation) {
      setError("Konfirmasi password tidak cocok.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/reset-password`, {
        email,
        otp,
        password,
        password_confirmation: passwordConfirmation,
      });
      
      setMessage(response.data.message); // "Password berhasil direset."
      
      // Redirect ke login setelah 3 detik
      setTimeout(() => {
        history.push("/login"); // Ganti '/login' dengan rute login Anda
      }, 3000);

    } catch (err) {
      setError(err.response?.data?.message || "Gagal mereset password.");
    } finally {
      setIsLoading(false);
    }
  };

  // Fungsi untuk render form berdasarkan langkah saat ini
  const renderStep = () => {
    
    // LANGKAH 1: FORM EMAIL
    if (step === "email") {
      return (
        <>
          <h3 className="text-center mb-3">Lupa Password</h3>
          <p className="text-center text-muted mb-4">
            Masukkan email Anda untuk menerima kode OTP.
          </p>
          <form onSubmit={handleSendOtp}>
            <div className="mb-3">
              <label>Email</label>
              <input
                type="email"
                className="form-control"
                placeholder="Masukkan email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 py-2 rounded-3" disabled={isLoading}>
              {isLoading ? "Mengirim..." : "Kirim OTP"}
            </button>
          </form>
        </>
      );
    }

    // LANGKAH 2: FORM OTP
    if (step === "otp") {
      return (
        <>
          <h3 className="text-center mb-3">Masukkan OTP</h3>
          <p className="text-center text-muted mb-4">
            Kami telah mengirimkan 6 digit kode OTP ke <strong>{email}</strong>.
          </p>
          <form onSubmit={handleVerifyOtp}>
            <div className="mb-3">
              <label>Kode OTP</label>
              <input
                type="text"
                className="form-control"
                placeholder="Masukkan 6 digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                maxLength={6}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 py-2 rounded-3">
              Verifikasi OTP
            </button>
          </form>
        </>
      );
    }

    // LANGKAH 3: FORM PASSWORD BARU
    if (step === "password") {
      return (
        <>
          <h3 className="text-center mb-3">Password Baru</h3>
          <p className="text-center text-muted mb-4">
            Masukkan password baru Anda.
          </p>
          <form onSubmit={handleResetPassword}>
            <div className="mb-3">
              <label>Password Baru</label>
              <input
                type="password"
                className="form-control"
                placeholder="Minimal 8 karakter"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="mb-3">
              <label>Konfirmasi Password Baru</label>
              <input
                type="password"
                className="form-control"
                placeholder="Ulangi password baru"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100 py-2 rounded-3" disabled={isLoading}>
              {isLoading ? "Menyimpan..." : "Reset Password"}
            </button>
          </form>
        </>
      );
    }
  };

  return (
    <div className="d-flex justify-content-center align-items-center min-vh-100 p-3">
      <div className="w-100" style={{ maxWidth: "420px" }}>
        <div className="card shadow p-4 rounded-4">
          
          {/* Tampilkan Notifikasi Global (Sukses atau Error) */}
          {message && (
            <div className="alert alert-success text-center p-2 rounded-3 mb-3">
              {message}
            </div>
          )}
          {error && (
            <div className="alert alert-danger text-center p-2 rounded-3 mb-3">
              {error}
            </div>
          )}
          
          {/* Render form yang sesuai dengan langkah saat ini */}
          {renderStep()}

        </div>
      </div>
    </div>
  );
}

export default ForgetPassword;