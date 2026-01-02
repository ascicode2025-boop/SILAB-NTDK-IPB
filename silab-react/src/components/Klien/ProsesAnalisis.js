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
  const lowerStatus = (status || "").toLowerCase();
  switch (lowerStatus) {
    case "proses":
    case "sedang_dianalisis":
    case "sedang dianalisis":
      return 2;
    case "menunggu_verifikasi":
    case "menunggu verifikasi":
      return 3;
    case "menunggu_pembayaran":
    case "menunggu pembayaran":
      return 4;
    case "selesai":
      return 5;
    default:
      return 1;
  }
};

const formatStatus = (status) => {
  if (!status) return "";
  const lowerStatus = status.toLowerCase();

  // Custom mapping untuk status proses
  if (lowerStatus === "proses" || lowerStatus === "sedang_dianalisis") {
    return "Sedang Dianalisis";
  }

  // Menghapus underscore dan capitalize untuk status lainnya
  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const getStatusBadge = (status) => {
  const lowerStatus = (status || "").toLowerCase();
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

      if (typeof booking.kode_sampel === "string") {
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
      console.error("Error parsing kode_sampel:", error);
      return [];
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await getUserBookings();
        const bookings = res.data || [];
        // UPDATED: Filter agar menampilkan booking yang masih berproses termasuk pembayaran
        const filtered = bookings.filter((b) => {
          const status = (b.status || "").toLowerCase();
          return status === "proses" || status === "menunggu_verifikasi" || status === "menunggu_pembayaran" || status === "selesai";
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
    <div className="container" style={{ maxWidth: "800px", marginTop: "-3rem" }}>
      <div className="text-center mb-4">
        <h4 className="fw-bold text-dark">Daftar Proses Analisis</h4>
        <p className="text-muted small">Pantau perkembangan analisis sampel laboratorium Anda</p>
      </div>

      <div className="row g-3">
        {bookingList.map((item) => {
          const sampleCodes = generateSampleCodes(item);
          return (
            <div key={item.id} className="col-12">
              <div
                className="card border-0 shadow-sm transition-all hover-card-modern"
                style={{
                  cursor: "pointer",
                  borderRadius: "12px",
                  borderLeft: `5px solid ${item.status.toLowerCase() === "proses" ? "#0dcaf0" : "#0d6efd"}`,
                }}
                onClick={() => {
                  setSelectedBooking(item);
                  setCurrentStep(statusToStep(item.status));
                }}
              >
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      {/* Ikon Botol Sampel */}
                      <div className="bg-light rounded-3 p-2 me-3 d-none d-sm-block">
                        <i className="bi bi-flask text-primary" style={{ fontSize: "1.2rem" }}></i>
                      </div>

                      <div>
                        <h6 className="fw-bold mb-1 text-dark">
                          {sampleCodes[0] || item.kode_sampel}
                          {sampleCodes.length > 1 && (
                            <span className="ms-2 badge bg-info-subtle text-info fw-normal" style={{ fontSize: "0.7rem" }}>
                              +{sampleCodes.length - 1} sampel
                            </span>
                          )}
                        </h6>
                        <div className="text-muted small">
                          <i className="bi bi-calendar-event me-1"></i> {dayjs(item.tanggal_kirim).format("DD MMM YYYY")}
                          <span className="mx-2">|</span>
                          <i className="bi bi-gear me-1"></i> {item.jenis_analisis}
                        </div>
                      </div>
                    </div>

                    <div className="text-end">
                      <span className={`badge ${getStatusBadge(item.status)} px-3 py-2 rounded-pill shadow-sm`} style={{ fontSize: "0.75rem" }}>
                        {formatStatus(item.status)}
                      </span>
                      <div className="text-primary mt-1 d-none d-md-block" style={{ fontSize: "0.7rem", fontWeight: "600" }}>
                        Lihat Progress <i className="bi bi-chevron-right small"></i>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const renderDetail = () => {
    if (!selectedBooking) return null;

    return (
      <div className="fade-in" style={{ marginTop: "-6rem" }}>
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
              {currentStep === 2 ? <i className="bi bi-check-circle-fill" style={{ fontSize: "3.5rem" }} /> : <i className="bi bi-gear-fill rotate-icon-slow" style={{ fontSize: "3.5rem", display: "inline-block" }} />}
            </div>

            <h4 className="fw-bold mb-3">{currentStep === 5 ? "Analisis Selesai!" : currentStep === 4 ? "Menunggu Pembayaran" : "Sampel Dalam Proses"}</h4>

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
              <button className="btn btn-success w-100 mt-3" onClick={() => message.info("Fitur download PDF akan segera hadir")}>
                <i className="bi bi-download me-2"></i>
                Download Hasil Analisis (PDF)
              </button>
            )}

            {currentStep === 4 && (
              <button className="btn btn-primary w-100 mt-3" onClick={() => message.info("Fitur pembayaran akan segera hadir")}>
                <i className="bi bi-credit-card me-2"></i>
                Lakukan Pembayaran
              </button>
            )}

            <button
              className="btn wa-btn text-white w-100 mt-3"
              disabled={currentStep !== 4}
              style={{
                backgroundColor: currentStep === 4 ? "#8c6b60" : "#d5c8c3",
                cursor: currentStep === 4 ? "pointer" : "not-allowed",
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
