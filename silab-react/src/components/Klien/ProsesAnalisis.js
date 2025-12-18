import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import NavbarLogin from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";
import "../../css/ProsesAnalisis.css";
import { getUserBookings } from "../../services/BookingService";
import { Spin, message } from "antd";
import dayjs from "dayjs";

/* ================== STATUS → STEP ================== */
/* Logic Anda yang sudah benar dan akan otomatis sinkron */
const statusToStep = (status) => {
  switch (status) {
    case "Sampel Diterima": return 1;
    case "Sedang Dianalisis": return 2; // Stepper akan otomatis ke sini
    case "Sedang Diverifikasi": return 3;
    case "Selesai": return 4;
    default: return 0;
  }
};

const getStatusBadge = (status) => {
  switch (status) {
    case "Selesai": return "bg-success";
    case "Sedang Dianalisis":
    case "Sedang Diverifikasi": return "bg-primary";
    case "Sampel Diterima": return "bg-warning text-dark";
    default: return "bg-secondary";
  }
};

const ProsesAnalisis = () => {
  const [bookingList, setBookingList] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await getUserBookings();
        const bookings = res.data || [];
        const filtered = bookings.filter((b) =>
          ["Sampel Diterima", "Sedang Dianalisis", "Sedang Diverifikasi", "Selesai"].includes(b.status)
        );
        setBookingList(filtered);
      } catch (err) {
        console.error(err);
        message.error("Gagal memuat proses analisis.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const renderList = () => (
    <div className="container" style={{ maxWidth: "800px", marginTop: "-5rem" }}>
      <h4 className="fw-bold mb-4 text-center text-secondary">Daftar Proses Analisis</h4>
      <div className="row g-3">
        {bookingList.map((item) => (
          <div key={item.id} className="col-12">
            <div
              className="card shadow-sm border-0 hover-card"
              style={{ cursor: "pointer" }}
              onClick={() => {
                setSelectedBooking(item);
                setCurrentStep(statusToStep(item.status));
              }}
            >
              <div className="card-body d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="fw-bold mb-1">{item.kode_sampel}</h6>
                  <small className="text-muted d-block">
                    {dayjs(item.tanggal_kirim).format("DD MMM YYYY")} | {item.jenis_analisis}
                  </small>
                </div>
                <div className="text-end">
                  <span className={`badge ${getStatusBadge(item.status)} px-3 py-2 rounded-pill`}>
                    {item.status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderDetail = () => {
    if (!selectedBooking) return null;

    return (
      <div className="fade-in" style={{marginTop: "-6rem"}}>
        <button className="btn btn-outline-secondary btn-sm mb-4" onClick={() => setSelectedBooking(null)}>
          <i className="bi bi-arrow-left me-2" /> Kembali ke Daftar
        </button>

        {/* ===== STEPPER BESAR ===== */}
        <div className="progress-analisis-wrapper mb-5 mt-4">
          {/* Step 1 */}
          <div className="analisis-step">
            <div className={`analisis-icon active big-step`}>
              <i className="bi bi-box-seam" />
            </div>
            <p className="label active-text">Sampel Diterima</p>
          </div>

          <div className={`analisis-line big-line ${currentStep >= 2 ? "filled" : ""}`} />

          {/* Step 2 */}
          <div className="analisis-step">
            <div className={`analisis-icon ${currentStep >= 2 ? "active" : ""} ${currentStep === 2 ? "pulse-active" : ""} big-step`}>
              <i className="bi bi-arrow-repeat" />
            </div>
            <p className={`label ${currentStep === 2 ? "active-text" : ""}`}>Sedang Dianalisis</p>
          </div>

          <div className={`analisis-line big-line ${currentStep >= 3 ? "filled" : ""}`} />

          {/* Step 3 */}
          <div className="analisis-step">
            <div className={`analisis-icon ${currentStep >= 3 ? "active" : ""} ${currentStep === 3 ? "pulse-active" : ""} big-step`}>
              <i className="bi bi-file-earmark-check" />
            </div>
            <p className={`label ${currentStep === 3 ? "active-text" : ""}`}>Verifikasi</p>
          </div>

          <div className={`analisis-line big-line ${currentStep >= 4 ? "filled" : ""}`} />

          {/* Step 4 */}
          <div className="analisis-step">
            <div className={`analisis-icon ${currentStep === 4 ? "active pulse-active" : ""} big-step`}>
              <i className="bi bi-check2" />
            </div>
            <p className={`label ${currentStep === 4 ? "active-text" : ""}`}>Selesai</p>
          </div>
        </div>

        {/* ===== KARTU STATUS (Identik dengan Menunggu Persetujuan) ===== */}
        <div className="d-flex justify-content-center">
          <div
            className={`info-card text-center shadow-sm`}
            style={{
              maxWidth: "600px",
              borderTop: currentStep === 4 ? "6px solid #198754" : "6px solid #8c6b60",
              backgroundColor: "#fff",
            }}
          >
            <div className="mb-3" style={{ color: currentStep === 4 ? "#198754" : "#8c6b60" }}>
              {currentStep === 4 ? (
                <i className="bi bi-check-circle-fill" style={{ fontSize: "3.5rem" }} />
              ) : (
                <i className="bi bi-gear-fill rotate-icon-slow" style={{ fontSize: "3.5rem", display: "inline-block" }} />
              )}
            </div>

            <h4 className="fw-bold mb-3">
              {currentStep === 4 ? "Analisis Selesai!" : "Sampel Dalam Proses"}
            </h4>

            <div className={`alert ${currentStep === 4 ? "alert-success" : "alert-info"} text-start`}>
              {currentStep === 1 && "Sampel Anda telah kami terima dan sedang dalam antrean analisis."}
              {currentStep === 2 && "Tim teknisi kami sedang melakukan pengujian laboratorium pada sampel Anda."}
              {currentStep === 3 && "Hasil pengujian sedang divalidasi oleh manajer teknis kami."}
              {currentStep === 4 && "Hasil analisis telah keluar. Anda dapat mengunduh atau melihat dokumen hasil."}
            </div>

            <button
              className="btn wa-btn text-white w-100 mt-3"
              disabled={currentStep !== 4}
              style={{ 
                backgroundColor: currentStep === 4 ? "#8c6b60" : "#d5c8c3",
                cursor: currentStep === 4 ? "pointer" : "not-allowed" 
              }}
              onClick={() => (window.location.href = "/hasil-analisis")}
            >
              <i className="bi bi-file-earmark-pdf me-2" /> Lihat Hasil Analisis
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <NavbarLogin>
        <div className="d-flex justify-content-center align-items-center" style={{ height: "80vh" }}>
          <Spin size="large" tip="Memuat proses analisis..." />
        </div>
      </NavbarLogin>
    );
  }

  return (
    <NavbarLogin>
      <div className="container py-5 progress-container" style={{ marginTop: "5rem" }}>
        {selectedBooking ? renderDetail() : renderList()}
      </div>
      <FooterSetelahLogin />
    </NavbarLogin>
  );
};

export default ProsesAnalisis;