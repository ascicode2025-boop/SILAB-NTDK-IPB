import React, { useState } from "react";
import { Form, Button, InputGroup } from "react-bootstrap";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useHistory } from "react-router-dom";
import axios from "axios";
import { setSession } from "../services/AuthService"; 
import "../css/LoginPage.css";

const API_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";

function LoginPage() {
  const history = useHistory();
  const [showPassword, setShowPassword] = useState(false);
  
  // PERBAIKAN 1: Ganti state 'email' menjadi 'name'
  const [formData, setFormData] = useState({
    name: "", 
    password: "",
  });
  
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validasi Username
    if (!formData.name.trim()) {
      setLoading(false);
      setError("Username tidak boleh kosong.");
      return;
    }

    try {
      // PERBAIKAN 2: Kirim { name, password } ke Backend
      const response = await axios.post(`${API_URL}/login`, formData);
      const { token, user } = response.data;

      // Debugging: Cek role di console browser (Tekan F12)
      console.log("Login Berhasil, Role:", user.role);

      // Simpan Sesi
      setSession(token, user); 
      localStorage.setItem("role", user.role);

      setLoading(false);

      // PERBAIKAN 3: Redirect Sesuai Role
      switch (user.role) {
        case "teknisi":
          history.push("/teknisi/dashboard");
          break;
        case "koordinator":
          history.push("/koordinator/dashboard");
          break;
        case "kepala":
          history.push("/kepala/dashboard");
          break;
        case "klien":
          history.push("/dashboard"); 
          break;
        default:
          history.push("/dashboard");
          break;
      }

    } catch (err) {
      setLoading(false);
      if (err.response) {
        // Handle error 401 (Unauthorized)
        if (err.response.status === 401) {
          setError("Username atau password salah.");
        } else if (err.response.status === 422) {
          const validationErrors = err.response.data.errors;
          let errorMessage = "Data tidak valid. ";
          if (validationErrors) {
             // Menangani validasi detail dari Laravel
             const errorFields = Object.keys(validationErrors);
             errorMessage += errorFields
               .map((field) => `${field}: ${validationErrors[field].join(", ")}`)
               .join("; ");
          } else {
             errorMessage += err.response.data.message || "Periksa input Anda.";
          }
          setError(errorMessage);
        } else {
          setError(
            `Error ${err.response.status}: ${err.response.data.message || "Terjadi kesalahan di server."}`
          );
        }
      } else if (err.request) {
        setError("Tidak dapat terhubung ke server. Periksa koneksi internet atau URL API.");
      } else {
        setError("Terjadi kesalahan tak terduga.");
      }
    }
  };

  return (
    <>
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
            maxWidth: "400px",
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
                backgroundColor: "rgba(255, 0, 0, 0.1)",
                border: "1px solid red",
                color: "red",
                padding: "8px 12px",
                borderRadius: "6px",
                marginBottom: "15px",
                fontSize: "13px",
                transition: "all 0.3s ease-in-out",
              }}
            >
              {error}
            </div>
          )}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3 text-start">
              <Form.Label className="fw-medium">Username</Form.Label>
              {/* PERBAIKAN 4: Input Type Text & Name='name' */}
              <Form.Control
                type="text" 
                placeholder="Masukkan Username"
                name="name"
                value={formData.name}
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
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    setShowPassword((s) => !s);
                  }}
                  className="border"
                  style={{
                    borderRadius: "0 8px 8px 0",
                  }}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
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
              onMouseEnter={(e) => (e.currentTarget.style.filter = "brightness(1.1)")}
              onMouseLeave={(e) => (e.currentTarget.style.filter = "brightness(1)")}
            >
              {loading ? "Memuat..." : "Login"}
            </Button>
          </Form>

          <p className="mt-3 mb-0" style={{ fontSize: "0.85rem" }}>
            Tidak Punya Akun?{" "}
            <Link to="/register" className="text-link" style={{ color: "#4f46e5" }}>
              Register Disini!
            </Link>
          </p>

          <p className="mt-3 mb-0" style={{ fontSize: "0.85rem" }}>
            <Link to="/forgetPassword" className="text-link" style={{ color: "#4f46e5" }}>
              Lupa Password?
            </Link>
          </p>
        </div>
      </div>

      <style>
        {`
          @media (max-width: 576px) {
            .login-container {
              padding: 30px 20px !important;
              max-width: 95% !important;
              box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            }

            .login-title {
              font-size: 12px !important;
              line-height: 1.4;
            }

            .login-logo {
              width: 150px !important;
            }

            .form-label, .form-control, button, p {
              font-size: 0.9rem !important;
            }

            button[type="submit"] {
              padding: 8px 10px !important;
            }
          }
        `}
      </style>
    </>
  );
}

export default LoginPage;