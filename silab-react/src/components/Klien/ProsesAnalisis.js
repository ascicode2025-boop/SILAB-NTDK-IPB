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
/* UPDATED: Gunakan lowercase status dari backend */
const statusToStep = (status) => {
  const lowerStatus = (status || '').toLowerCase();
  switch (lowerStatus) {
    case "proses": 
    case "sedang dianalisis": 
      return 2; // Step 2: Sedang Dianalisis
    case "menunggu_verifikasi":
    case "menunggu verifikasi":
      return 3; // Step 3: Verifikasi (menunggu koordinator)
    case "menunggu_pembayaran":
    case "menunggu pembayaran":
      return 4; // Step 4: Menunggu Pembayaran
    case "selesai": 
      return 5; // Step 5: Selesai
    default: 
      return 1; // Step 1: Sampel Diterima (default)
  }
};

const getStatusBadge = (status) => {
  const lowerStatus = (status || '').toLowerCase();
  switch (lowerStatus) {
    case "selesai": 
      return "bg-success";
    case "menunggu_pembayaran":
    case "menunggu pembayaran":
      return "bg-info";
    case "menunggu_verifikasi":
    case "menunggu verifikasi":
      return "bg-warning";
    case "proses":
    case "sedang dianalisis": 
      return "bg-primary";
    default: 
      return "bg-secondary";
  }
};

const ProsesAnalisis = () => {
  const [bookingList, setBookingList] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);

  // Helper function untuk parse kode_sampel JSON
  const generateSampleCodes = (booking) => {
    if (!booking) return [];
    
    try {
      let codes = [];
      
      if (typeof booking.kode_sampel === 'string') {
        try {
          codes = JSON.parse(booking.kode_sampel);
          if (Array.isArray(codes)) {
            return codes;
          }
        } catch (e) {
          codes = [booking.kode_sampel];
        }
      } else if (Array.isArray(booking.kode_sampel)) {
        codes = booking.kode_sampel;
      }
      
      return codes;
    } catch (error) {
      console.error('Error parsing kode_sampel:', error);
      return [];
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await getUserBookings();
        const bookings = res.data || [];
        // UPDATED: Filter dengan lowercase status "proses", "menunggu_verifikasi", dan "selesai"
        const filtered = bookings.filter((b) => {
          const status = (b.status || '').toLowerCase();
          return status === "proses" || status === "menunggu_verifikasi" || status === "selesai";
        });
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
                  <h6 className="fw-bold mb-1">{generateSampleCodes(item)[0] || item.kode_sampel}</h6>
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
            <p className={`label ${currentStep >= 2 ? "active-text" : ""}`}>Sedang Dianalisis</p>
          </div>

          <div className={`analisis-line big-line ${currentStep >= 3 ? "filled" : ""}`} />

          {/* Step 3 */}
          <div className="analisis-step">
            <div className={`analisis-icon ${currentStep >= 3 ? "active" : ""} ${currentStep === 3 ? "pulse-active" : ""} big-step`}>
              <i className="bi bi-file-earmark-check" />
            </div>
            <p className={`label ${currentStep >= 3 ? "active-text" : ""}`}>Verifikasi</p>
          </div>

          <div className={`analisis-line big-line ${currentStep >= 4 ? "filled" : ""}`} />

          {/* Step 4 - Pembayaran */}
          <div className="analisis-step">
            <div className={`analisis-icon ${currentStep >= 4 ? "active" : ""} ${currentStep === 4 ? "pulse-active" : ""} big-step`}>
              <i className="bi bi-credit-card" />
            </div>
            <p className={`label ${currentStep >= 4 ? "active-text" : ""}`}>Pembayaran</p>
          </div>

          <div className={`analisis-line big-line ${currentStep >= 5 ? "filled" : ""}`} />

          {/* Step 5 - Selesai */}
          <div className="analisis-step">
            <div className={`analisis-icon ${currentStep >= 5 ? "active" : ""} ${currentStep === 5 ? "pulse-active" : ""} big-step`}>
              <i className="bi bi-check2" />
            </div>
            <p className={`label ${currentStep >= 5 ? "active-text" : ""}`}>Selesai</p>
          </div>
        </div>

        {/* ===== KARTU STATUS (Identik dengan Menunggu Persetujuan) ===== */}
        <div className="d-flex justify-content-center">
          <div
            className={`info-card text-center shadow-sm`}
            style={{
              maxWidth: "600px",
              borderTop: currentStep === 2 ? "6px solid #198754" : "6px solid #8c6b60",
              backgroundColor: "#fff",
            }}
          >
            <div className="mb-3" style={{ color: currentStep === 2 ? "#198754" : "#8c6b60" }}>
              {currentStep === 2 ? (
                <i className="bi bi-check-circle-fill" style={{ fontSize: "3.5rem" }} />
              ) : (
                <i className="bi bi-gear-fill rotate-icon-slow" style={{ fontSize: "3.5rem", display: "inline-block" }} />
              )}
            </div>

            <h4 className="fw-bold mb-3">
              {currentStep === 5 ? "Analisis Selesai!" : currentStep === 4 ? "Menunggu Pembayaran" : "Sampel Dalam Proses"}
            </h4>

            <div className={`alert ${currentStep === 5 ? "alert-success" : currentStep === 4 ? "alert-info" : currentStep === 3 ? "alert-warning" : "alert-info"} text-start`}>
              {currentStep === 1 && "Sampel Anda telah kami terima dan sedang dalam antrean analisis."}
              {currentStep === 2 && "Tim teknisi kami sedang melakukan pengujian laboratorium pada sampel Anda."}
              {currentStep === 3 && "Hasil analisis telah selesai dan sedang menunggu verifikasi dari Koordinator Lab."}
              {currentStep === 4 && (
                <div>
                  <i className="bi bi-credit-card me-2"></i>
                  Hasil analisis Anda sudah siap. Silakan lakukan pembayaran untuk mendapatkan hasil lengkap.
                  <div className="mt-2">
                    <strong>Biaya:</strong> Rp 50.000 per sampel
                  </div>
                </div>
              )}
              {currentStep === 5 && "Hasil analisis telah diverifikasi dan selesai. Anda dapat mengunduh dokumen hasil di bawah ini."}
            </div>

            {currentStep === 5 && (
              <button
                className="btn btn-success w-100 mt-3"
                onClick={() => message.info('Fitur download PDF akan segera hadir')}
              >
                <i className="bi bi-download me-2"></i>
                Download Hasil Analisis (PDF)
              </button>
            )}

            {currentStep === 4 && (
              <button
                className="btn btn-primary w-100 mt-3"
                onClick={() => message.info('Fitur pembayaran akan segera hadir')}
              >
                <i className="bi bi-credit-card me-2"></i>
                Lakukan Pembayaran
              </button>
            )}

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