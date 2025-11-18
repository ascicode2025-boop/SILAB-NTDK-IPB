import React, { useState, useEffect } from "react";
import { Form, Button, InputGroup } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_BASE_URL;

function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [emailForPopup, setEmailForPopup] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    institusi: "",
    nomor_telpon: "",
    password: "",
    password_confirmation: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);

  // ===== HANDLE INPUT =====
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // ==============================================================
  //  POPUP CEK VERIFIKASI
  // ==============================================================

  const checkEmailVerified = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.get(`${API_URL}/user`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data.email_verified_at !== null) {
        setShowPopup(false);
        alert("Email berhasil diverifikasi!");
        window.location.href = "/login";
      }
    } catch (err) {
      console.log("Gagal cek verifikasi:", err);
    }
  };

  useEffect(() => {
    if (showPopup) {
      const interval = setInterval(() => {
        checkEmailVerified();
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [showPopup]);

  const resendEmail = async () => {
    try {
      const token = localStorage.getItem("token");

      await axios.post(
        `${API_URL}/email/verification-notification`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      alert("Email verifikasi baru telah dikirim!");
    } catch (err) {
      alert("Gagal mengirim ulang email verifikasi.");
    }
  };

  // ==============================================================
  //  HANDLE REGISTER
  // ==============================================================

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (formData.password !== formData.password_confirmation) {
      setError("Password dan Konfirmasi Password tidak cocok.");
      setLoading(false);
      return;
    }

    if (!formData.institusi) {
      setError("Silakan pilih tipe institusi Anda.");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${API_URL}/register`, formData);

      // Simpan token untuk cek verifikasi
      localStorage.setItem("token", res.data.token);

      setEmailForPopup(formData.email);
      setShowPopup(true);

      setSuccess("Registrasi berhasil!");
      setLoading(false);
    } catch (err) {
      setLoading(false);
      const errors = err.response?.data?.errors || {};
      const message = err.response?.data?.message || "";

      if (
        errors.email?.includes("The email has already been taken.") ||
        message.includes("email")
      ) {
        setError("Email sudah terdaftar, silakan login.");
      } else if (
        errors.name?.includes("The name has already been taken.") ||
        message.includes("username")
      ) {
        setError("Username sudah digunakan.");
      } else if (Object.keys(errors).length > 0) {
        const allErrors = Object.values(errors).flat().join(" ");
        setError(allErrors);
      } else {
        setError("Registrasi gagal.");
      }
    }
  };

  // ==============================================================
  //  POPUP KOMPONEN
  // ==============================================================

  const EmailVerificationPopup = () => (
    <div
      className="fixed-top d-flex justify-content-center align-items-center"
      style={{
        width: "100%",
        height: "100vh",
        background: "rgba(0,0,0,0.4)",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          background: "#fff",
          padding: "25px",
          borderRadius: "12px",
          width: "90%",
          maxWidth: "420px",
          textAlign: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
        }}
      >
        <h5 className="fw-bold mb-2">Verifikasi Email Anda</h5>
        <p className="text-muted" style={{ fontSize: "14px" }}>
          Kami telah mengirim email verifikasi ke:
        </p>
        <p className="fw-bold">{emailForPopup}</p>

        <p style={{ fontSize: "13px", color: "#666" }}>
          Setelah email diverifikasi, halaman akan otomatis dialihkan.
        </p>

        <Button
          className="mt-3"
          style={{
            backgroundColor: "#8D6E63",
            border: "none",
            width: "100%",
          }}
          onClick={resendEmail}
        >
          Kirim Ulang Email Verifikasi
        </Button>
      </div>
    </div>
  );

  // ==============================================================
  //  RENDER PAGE
  // ==============================================================

  return (
    <div
      className="login-page d-flex justify-content-center align-items-center"
      style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
        padding: "20px",
      }}
    >
      <div
        className="login-container text-center p-5 rounded shadow"
        style={{
          backgroundColor: "#fff",
          maxWidth: "450px",
          width: "100%",
          borderRadius: "12px",
        }}
      >
        <img
          src="/asset/gambarLogo.png"
          alt="IPB University"
          className="login-logo mb-4"
          style={{ width: "200px", maxWidth: "80%" }}
        />

        <h5 className="login-title fw-semibold mb-3" style={{ fontSize: "14px", color: "#8D6E63" }}>
          Sistem Informasi Laboratorium Nutrisi Ternak Daging dan Kerja
        </h5>

        {error && (
          <div
            style={{
              backgroundColor: "rgba(255,0,0,0.1)",
              border: "1px solid red",
              color: "red",
              padding: "8px 12px",
              borderRadius: "6px",
              marginBottom: "15px",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

        {success && (
          <div
            style={{
              backgroundColor: "rgba(0,128,0,0.1)",
              border: "1px solid green",
              color: "green",
              padding: "8px 12px",
              borderRadius: "6px",
              marginBottom: "15px",
              fontSize: "13px",
            }}
          >
            {success}
          </div>
        )}

        {/* ===== FORM REGISTER ===== */}
        <Form onSubmit={handleSubmit}>
          <Form.Group className="mb-3 text-start">
            <Form.Label className="fw-medium">Username</Form.Label>
            <Form.Control
              type="text"
              placeholder="Masukkan username"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              style={{ borderRadius: "8px", padding: "10px" }}
            />
          </Form.Group>

          <Form.Group className="mb-3 text-start">
            <Form.Label className="fw-medium">Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Masukkan email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={{ borderRadius: "8px", padding: "10px" }}
            />
          </Form.Group>

          <Form.Group className="mb-3 text-start">
            <Form.Label className="fw-medium">Institusi</Form.Label>
            <Form.Select
              name="institusi"
              value={formData.institusi}
              onChange={handleChange}
              required
              style={{ borderRadius: "8px", padding: "10px" }}
            >
              <option value="" disabled>
                Pilih tipe...
              </option>
              <option value="umum">Umum</option>
              <option value="mahasiswa">Mahasiswa</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3 text-start">
            <Form.Label className="fw-medium">Nomor Telpon</Form.Label>
            <Form.Control
              type="text"
              placeholder="Masukkan nomor telpon"
              name="nomor_telpon"
              value={formData.nomor_telpon}
              onChange={handleChange}
              required
              style={{ borderRadius: "8px", padding: "10px" }}
            />
          </Form.Group>

          <Form.Group className="mb-4 text-start">
            <Form.Label className="fw-medium">Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showPassword ? "text" : "password"}
                placeholder="Masukkan password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ borderRadius: "8px", padding: "10px" }}
              />
              <Button
                variant="light"
                onClick={() => setShowPassword(!showPassword)}
                className="border"
                style={{ borderRadius: "0 8px 8px 0" }}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
          </Form.Group>

          <Form.Group className="mb-4 text-start">
            <Form.Label className="fw-medium">Konfirmasi Password</Form.Label>
            <InputGroup>
              <Form.Control
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Konfirmasi password"
                name="password_confirmation"
                value={formData.password_confirmation}
                onChange={handleChange}
                required
                style={{ borderRadius: "8px", padding: "10px" }}
              />
              <Button
                variant="light"
                onClick={() =>
                  setShowConfirmPassword(!showConfirmPassword)
                }
                className="border"
                style={{ borderRadius: "0 8px 8px 0" }}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </Button>
            </InputGroup>
          </Form.Group>

          <Button
            type="submit"
            className="w-100 fw-semibold"
            disabled={loading}
            style={{
              background: "linear-gradient(90deg, #8D6E63, #8D6E63)",
              border: "none",
              color: "#fff",
              padding: "10px",
              fontSize: "15px",
              borderRadius: "8px",
              transition: "all 0.3s",
            }}
          >
            {loading ? "Mendaftar..." : "Register"}
          </Button>
        </Form>

        <p className="mt-3 mb-0" style={{ fontSize: "0.85rem" }}>
          Sudah punya akun?{" "}
          <a href="/login" style={{ color: "#4f46e5" }}>
            Login di sini
          </a>
        </p>
      </div>

      {/* POPUP VERIFIKASI */}
      {showPopup && <EmailVerificationPopup />}
    </div>
  );
}

export default RegisterPage;
