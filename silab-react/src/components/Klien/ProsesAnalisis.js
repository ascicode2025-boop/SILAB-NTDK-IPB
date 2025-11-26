import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "../../css/ProsesAnalisis.css";
import NavbarLogin from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";

const ProsesAnalisis = () => {
  const currentStep = 2; 
  // 1 = diterima, 
  // 2 = dianalisis, 
  // 3 = verifikasi, 
  // 4 = selesai

  return (
    <NavbarLogin>
    <div className="container progress-analisis-container" style={{marginTop: "7rem"}} >

      <div className="progress-analisis-wrapper">

        {/* STEP 1 */}
        <div className="analisis-step">
          <div className={`analisis-icon ${currentStep >= 1 ? "active" : ""}`}>
            <i className="bi bi-box-seam"></i>
          </div>
          <p className="label">Sampel Diterima</p>
        </div>

        <div className={`analisis-line ${currentStep >= 2 ? "filled" : ""}`}></div>

        {/* STEP 2 */}
        <div className="analisis-step">
          <div className={`analisis-icon ${currentStep >= 2 ? "active big" : ""}`}>
            <i className="bi bi-arrow-repeat"></i>
          </div>
          <p className="label active-text">Sedang Dianalisis</p>
        </div>

        <div className={`analisis-line ${currentStep >= 3 ? "filled" : ""}`}></div>

        {/* STEP 3 */}
        <div className="analisis-step">
          <div className={`analisis-icon ${currentStep >= 3 ? "active" : ""}`}>
            <i className="bi bi-file-earmark-check"></i>
          </div>
          <p className="label">Sedang Diverifikasi</p>
        </div>

        <div className={`analisis-line ${currentStep >= 4 ? "filled" : ""}`}></div>

        {/* STEP 4 */}
        <div className="analisis-step">
          <div className={`analisis-icon ${currentStep === 4 ? "active" : ""}`}>
            <i className="bi bi-check2"></i>
          </div>
          <p className="label">Selesai</p>
        </div>

      </div>

       {/* ===========================
            🔘 BUTTON LIHAT ANALISIS
        ============================ */}
        <div className="text-center mt-4 mb-5">
          <button
            className="btn px-4 py-2"
            disabled={currentStep !== 4}
            style={{
              opacity: currentStep === 4 ? 1 : 0.5,
              cursor: currentStep === 4 ? "pointer" : "not-allowed",
              transition: "0.3s",
              fontSize: "1rem",
              fontWeight: "500",
              borderRadius: "8px",
              backgroundColor: "#8c6b60",
              color: "white",
            }}
            onClick={() => {
              if (currentStep === 4) {
                window.location.href = "/hasil-analisis";
              }
            }}
          >
            Lihat Hasil Analisis
          </button>
        </div>
    </div>
    <FooterSetelahLogin />
    </NavbarLogin>
  );
};

export default ProsesAnalisis;
