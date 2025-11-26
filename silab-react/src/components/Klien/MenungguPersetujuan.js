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
      <div className="container py-5 progress-container" style={{marginTop: "7rem"}}>

        {/* Progress Wrapper */}
        <div className="progress-wrapper">
          {/* Step 1 */}
          <div className="step">
            <div className={`icon-wrapper ${currentStep >= 1 ? "active" : ""}`}>
              <i className="bi bi-list-check"></i>
            </div>
            <p className="label">Mengisi Form</p>
          </div>

          {/* Line */}
          <div
            className={`progress-line ${currentStep >= 2 ? "filled" : ""}`}
          ></div>

          {/* Step 2 */}
          <div className="step">
            <div className={`icon-wrapper ${currentStep >= 2 ? "active big" : ""}`}>
              <i className="bi bi-clock"></i>
            </div>
            <p className="label active-text">Menunggu Persetujuan</p>
          </div>

          {/* Line */}
          <div
            className={`progress-line ${currentStep >= 3 ? "filled" : ""}`}
          ></div>

          {/* Step 3 */}
          <div className="step">
            <div className={`icon-wrapper ${currentStep === 3 ? "active" : ""}`}>
              <i className="bi bi-check2"></i>
            </div>
            <p className="label">Selesai</p>
          </div>
        </div>

        {/* Card Info */}
        <div className="d-flex justify-content-center">
          <div className="info-card text-center shadow-sm">
            <h4 className="fw-semibold mb-3">Menunggu Persetujuan Teknisi</h4>
            <p className="text-muted mb-4">
              Data kamu telah dikirim dan sedang ditinjau oleh teknisi. Mohon
              tunggu beberapa saat. Silahkan Konfirmasi melalui WhatsApp jika ada
              pertanyaan lebih lanjut.
            </p>

            <a
              href="https://wa.me/6281234567890"
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
