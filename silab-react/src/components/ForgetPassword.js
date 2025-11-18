import React, { useState } from "react";
import axios from "axios";
import { useHistory } from "react-router-dom";

const API_URL = "http://127.0.0.1:8000/api";

function ForgetPassword() {
  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const history = useHistory();

  const sendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await axios.post(`${API_URL}/send-otp`, { email });
      setMessage("OTP telah dikirim ke email Anda");
      setStep("otp");
    } catch (err) {
      setError(err.response?.data?.message || "Email tidak ditemukan");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = (e) => {
    e.preventDefault();
    if (otp.length === 6) {
      setStep("password");
      setError("");
    } else {
      setError("OTP harus 6 digit");
    }
  };

  const resetPassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");

    if (password !== confirmPassword) {
      setError("Password tidak cocok");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/reset-password`, {
        email,
        otp,
        password,
        password_confirmation: confirmPassword,
      });
      setMessage("Password berhasil direset");
      setTimeout(() => history.push("/login"), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Gagal reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "400px", margin: "50px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2 style={{ textAlign: "center" }}>Lupa Password</h2>

      {message && <div style={{ color: "green", marginBottom: "10px", textAlign: "center" }}>{message}</div>}
      {error && <div style={{ color: "red", marginBottom: "10px", textAlign: "center" }}>{error}</div>}

      {step === "email" && (
        <form onSubmit={sendOtp}>
          <div style={{ marginBottom: "15px" }}>
            <label>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ width: "100%", padding: "10px", backgroundColor: "#007bff", color: "white", border: "none", borderRadius: "4px" }}>
            {loading ? "Mengirim..." : "Kirim OTP"}
          </button>
        </form>
      )}

      {step === "otp" && (
        <form onSubmit={verifyOtp}>
          <div style={{ marginBottom: "15px" }}>
            <label>Kode OTP (6 digit):</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              maxLength={6}
              required
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            />
          </div>
          <button type="submit" style={{ width: "100%", padding: "10px", backgroundColor: "#28a745", color: "white", border: "none", borderRadius: "4px" }}>
            Verifikasi OTP
          </button>
        </form>
      )}

      {step === "password" && (
        <form onSubmit={resetPassword}>
          <div style={{ marginBottom: "15px" }}>
            <label>Password Baru:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            />
          </div>
          <div style={{ marginBottom: "15px" }}>
            <label>Konfirmasi Password:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ width: "100%", padding: "8px", marginTop: "5px" }}
            />
          </div>
          <button type="submit" disabled={loading} style={{ width: "100%", padding: "10px", backgroundColor: "#dc3545", color: "white", border: "none", borderRadius: "4px" }}>
            {loading ? "Menyimpan..." : "Reset Password"}
          </button>
        </form>
      )}

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button onClick={() => history.push("/login")} style={{ background: "none", border: "none", color: "#007bff", textDecoration: "underline" }}>
          Kembali ke Login
        </button>
      </div>
    </div>
  );
}

export default ForgetPassword;
