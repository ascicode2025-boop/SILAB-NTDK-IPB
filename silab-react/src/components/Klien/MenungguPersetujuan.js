// Updated MenungguPersetujuan.jsx with animation similar to ProsesAnalisis
import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import NavbarLogin from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";
import "../../css/MenungguPersetujuan.css";

const MenungguPersetujuan = () => {
  const currentStep = 2; // 1: Form - 2: Menunggu - 3: Selesai

  return (
    <NavbarLogin>
      <div className="container py-5 progress-container" style={{ marginTop: "7rem" }}>
        <div className="progress-wrapper">
          {/* Step 1 */}
          <div className="step fade-in">
            <div className={`icon-wrapper ${currentStep >= 1 ? "active" : ""}`}>
              <i className="bi bi-list-check"></i>
            </div>
            <p className="label">Mengisi Form</p>
          </div>

          <div className={`progress-line ${currentStep >= 2 ? "filled grow-line" : ""}`}></div>

          {/* Step 2 */}
          <div className="step fade-in delay-1">
            <div className={`icon-wrapper ${currentStep >= 2 ? "active big rotate-icon" : ""}`}>
              <i className="bi bi-clock"></i>
            </div>
            <p className="label active-text">Menunggu Persetujuan</p>
          </div>

          <div className={`progress-line ${currentStep >= 3 ? "filled grow-line" : ""}`}></div>

          {/* Step 3 */}
          <div className="step fade-in delay-2">
            <div className={`icon-wrapper ${currentStep === 3 ? "active" : ""}`}>
              <i className="bi bi-check2"></i>
            </div>
            <p className="label">Selesai</p>
          </div>
        </div>

        {/* Card Info */}
        <div className="d-flex justify-content-center fade-in delay-3">
          <div className="info-card text-center shadow-sm">
            <h4 className="fw-semibold mb-3">Menunggu Persetujuan Teknisi</h4>
            <p className="text-muted mb-4">
              Data kamu telah dikirim dan sedang ditinjau oleh teknisi. Mohon tunggu sebentar.
            </p>

            <a
              href="https://wa.me/6282111485562?text=Halo%2C%20saya%20ingin%20menanyakan%20status%20persetujuan%20data%20saya%20di%20SILAB."
              className="btn wa-btn text-white"
            >
              Konfirmasi Melalui WhatsApp
            </a>
          </div>
        </div>
      </div>

      <FooterSetelahLogin />
    </NavbarLogin>
  );
};

export default MenungguPersetujuan;