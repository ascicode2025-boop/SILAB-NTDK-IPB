import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import NavbarLogin from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";
import "../../css/ProsesAnalisis.css";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import { getUserBookings } from "../../services/BookingService";
import { message } from "antd";
import dayjs from "dayjs";

/* ================== STATUS → STEP ================== */
const statusToStep = (status) => {
  const lowerStatus = (status || "").toLowerCase();
  switch (lowerStatus) {
    case "proses":
    case "sedang_dianalisis":
    case "sedang dianalisis":
      return 2;
    case "menunggu_verifikasi":
    case "menunggu verifikasi":
    case "menunggu_verifikasi_kepala":
    case "menunggu verifikasi kepala":
      return 3;
    case "menunggu_pembayaran":
    case "menunggu pembayaran":
      return 4;
    case "selesai":
    case "ditandatangani":
      return 5;
    default:
      return 1;
  }
};

const formatStatus = (status) => {
  if (!status) return "";
  const lowerStatus = status.toLowerCase();

  if (lowerStatus === "proses" || lowerStatus === "sedang_dianalisis" || lowerStatus === "sedang dianalisis") {
    return "Sedang Dianalisis";
  }
  if (lowerStatus === "menunggu_verifikasi_kepala" || lowerStatus === "menunggu verifikasi kepala") {
    return "Menunggu Verifikasi";
  }

  return status.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

const getStatusBadge = (status) => {
  const lowerStatus = (status || "").toLowerCase();
  switch (lowerStatus) {
    case "selesai":
    case "ditandatangani":
      return "bg-success";
    case "menunggu_pembayaran":
    case "menunggu pembayaran":
      return "bg-info";
    case "menunggu_verifikasi":
    case "menunggu verifikasi":
    case "menunggu_verifikasi_kepala":
    case "menunggu verifikasi kepala":
      return "bg-warning";
    case "proses":
    case "sedang dianalisis":
    case "sedang_dianalisis":
      return "bg-primary";
    default:
      return "bg-secondary";
  }
};

const ProsesAnalisis = () => {
  useEffect(() => {
    document.title = "SILAB-NTDK - Proses Analisis";
  }, []);

  const [bookingList, setBookingList] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [priceMap, setPriceMap] = useState({});
  const apiBase = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";
  const apiHost = apiBase.replace(/\/api$/, "");
  const [showPreview, setShowPreview] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");

  // Helper function untuk parse kode_sampel JSON
  const generateSampleCodes = (booking) => {
    if (!booking) return [];
    try {
      let codes = [];
      if (typeof booking.kode_sampel === "string") {
        try {
          codes = JSON.parse(booking.kode_sampel);
          if (Array.isArray(codes)) return codes;
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
    let mounted = true;

    // Fetch analysis prices once
    const fetchPrices = async () => {
      try {
        const apiBase = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";
        const res = await fetch(`${apiBase}/analysis-prices`);
        if (res.ok) {
          const prices = await res.json();
          const map = {};
          if (Array.isArray(prices)) {
            prices.forEach((p) => {
              const keys = [p.nama_analisis, p.jenis_analisis, p.nama_item].filter((k) => k);
              keys.forEach((key) => {
                if (key) map[key] = Number(p.harga) || 0;
              });
            });
          }
          if (mounted) setPriceMap(map);
        }
      } catch (err) {
        console.error("Gagal memuat harga analisis:", err);
      }
    };

    fetchPrices();

    const fetchBookings = async () => {
      try {
        const res = await getUserBookings();
        const bookings = res.data || [];

        // Tampilkan booking untuk semua status proses/verifikasi/pembayaran/selesai
        // Termasuk yang sudah terverifikasi pembayarannya sehingga klien tetap melihat progres
        const filtered = bookings.filter((b) => {
          const status = (b.status || "").toLowerCase();
          return (
            status === "proses" || status === "sedang_dianalisis" || status === "menunggu_verifikasi" || status === "menunggu_verifikasi_kepala" || status === "menunggu_pembayaran" || status === "selesai" || status === "ditandatangani"
          );
        });

        if (!mounted) return;
        setBookingList(filtered);

        if (selectedBooking) {
          const updated = filtered.find((b) => b.id === selectedBooking.id);
          if (updated) {
            if ((updated.status || "") !== (selectedBooking.status || "")) {
              setSelectedBooking(updated);
              setCurrentStep(statusToStep(updated.status));
            } else {
              setSelectedBooking(updated);
            }

            // Only mark as finished (step 5) when booking is paid AND a PDF result exists
            const hasPaid = updated.is_paid || updated.paid || updated.paid_at || (updated.invoice && (updated.invoice.status || "").toLowerCase().includes("paid")) || false;
            const hasPdf = updated.pdf_path || updated.pdfPath || updated.has_pdf;
            if (hasPaid && hasPdf) {
              setCurrentStep(5);
            }
          }
        }
      } catch (err) {
        console.error(err);
        message.error("Gagal memuat proses analisis.");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchBookings();
    const interval = setInterval(fetchBookings, 15000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [selectedBooking]);

  const refreshBooking = async (id) => {
    try {
      const res = await getUserBookings();
      const bookings = res.data || [];
      const b = bookings.find((x) => String(x.id) === String(id));
      if (b) {
        setSelectedBooking(b);
        setCurrentStep(statusToStep(b.status));
        // Only advance to finished if both paid and PDF are present
        const hasPaid = b.is_paid || b.paid || b.paid_at || (b.invoice && (b.invoice.status || "").toLowerCase().includes("paid")) || false;
        const hasPdf = b.pdf_path || b.pdfPath || b.has_pdf;
        if (hasPaid && hasPdf) {
          setCurrentStep(5);
        }
      }
    } catch (err) {
      console.error("Failed to refresh booking", err);
    }
  };

  const renderList = () => (
    <div className="container" style={{ maxWidth: "800px", marginTop: "2rem" }}>
      <div className="row g-3">
        {bookingList.map((item) => {
          const hasPaid = item.is_paid || item.paid || item.paid_at || (item.invoice && (item.invoice.status || "").toLowerCase().includes("paid")) || false;
          const hasPdf = item.pdf_path || item.pdfPath || item.has_pdf;
          const isFinished = hasPaid && hasPdf;
          // Default: tampilkan kartu aktif
          return (
            <div key={item.id} className="col-12">
              <div
                className="card border-0 shadow-sm transition-all hover-card-modern"
                style={{
                  cursor: "pointer",
                  borderRadius: "12px",
                  borderLeft: `5px solid ${item.status.toLowerCase() === "proses" ? "#0dcaf0" : "#0d6efd"}`,
                }}
                onClick={() => refreshBooking(item.id)}
              >
                <div className="card-body p-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="bg-light rounded-3 p-2 me-3 d-none d-sm-block">
                        <i className="bi bi-flask text-primary" style={{ fontSize: "1.2rem" }}></i>
                      </div>
                      <div>
                        <h6 className="fw-bold mb-1 text-dark">{item.kode_batch || "-"}</h6>
                        <div className="text-muted small">
                          <i className="bi bi-calendar-event me-1"></i> {dayjs(item.tanggal_kirim).format("DD MMM YYYY")}
                          <span className="mx-2">|</span>
                          <i className="bi bi-gear me-1"></i> {item.jenis_analisis}
                        </div>
                      </div>
                    </div>
                    <div className="text-end">
                      <span className={`badge ${isFinished ? "bg-success" : getStatusBadge(item.status)} px-3 py-2 rounded-pill shadow-sm`} style={{ fontSize: "0.75rem" }}>
                        {isFinished ? "Selesai" : formatStatus(item.status)}
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

    // Only allow result access if paid and verified
    const isPaid = selectedBooking && (selectedBooking.status === "paid" || selectedBooking.status === "lunas" || selectedBooking.status === "verified" || selectedBooking.status === "selesai" || selectedBooking.status === "ditandatangani");
    const isVerified =
      selectedBooking && (selectedBooking.verified === true || selectedBooking.status === "lunas" || selectedBooking.status === "verified" || selectedBooking.status === "selesai" || selectedBooking.status === "ditandatangani");
    const canViewResult = isPaid && isVerified;

    return (
      <div className="fade-in" style={{ marginTop: "1rem" }}>
        <button className="btn btn-outline-secondary btn-sm mb-4" onClick={() => setSelectedBooking(null)}>
          <i className="bi bi-arrow-left me-2" /> Kembali ke Daftar
        </button>

        {/* ===== STEPPER BESAR ===== */}
        <div className="progress-analisis-wrapper mb-5 mt-4">
          <div className="analisis-step">
            <div className={`analisis-icon active big-step`}>
              <i className="bi bi-box-seam" />
            </div>
            <p className="label active-text">Sampel Diterima</p>
          </div>
          <div className={`analisis-line big-line ${currentStep >= 2 ? "filled" : ""}`} />

          <div className="analisis-step">
            <div className={`analisis-icon ${currentStep >= 2 ? "active" : ""} ${currentStep === 2 ? "pulse-active" : ""} big-step`}>
              <i className="bi bi-arrow-repeat" />
            </div>
            <p className={`label ${currentStep >= 2 ? "active-text" : ""}`}>Sedang Dianalisis</p>
          </div>
          <div className={`analisis-line big-line ${currentStep >= 3 ? "filled" : ""}`} />

          <div className="analisis-step">
            <div className={`analisis-icon ${currentStep >= 3 ? "active" : ""} ${currentStep === 3 ? "pulse-active" : ""} big-step`}>
              <i className="bi bi-file-earmark-check" />
            </div>
            <p className={`label ${currentStep >= 3 ? "active-text" : ""}`}>Verifikasi</p>
          </div>
          <div className={`analisis-line big-line ${currentStep >= 4 ? "filled" : ""}`} />

          <div className="analisis-step">
            <div className={`analisis-icon ${currentStep >= 4 ? "active" : ""} ${currentStep === 4 ? "pulse-active" : ""} big-step`}>
              <i className="bi bi-credit-card" />
            </div>
            <p className={`label ${currentStep >= 4 ? "active-text" : ""}`}>Pembayaran</p>
          </div>
          <div className={`analisis-line big-line ${currentStep >= 5 ? "filled" : ""}`} />

          <div className="analisis-step">
            <div className={`analisis-icon ${currentStep >= 5 ? "active" : ""} ${currentStep === 5 ? "pulse-active" : ""} big-step`}>
              <i className="bi bi-check2" />
            </div>
            <p className={`label ${currentStep >= 5 ? "active-text" : ""}`}>Selesai</p>
          </div>
        </div>

        {/* ===== KARTU STATUS ===== */}
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
                    {selectedBooking && selectedBooking.jumlah_sampel && (
                      <div className="mt-1">
                        <strong>Total:</strong> Rp{" "}
                        {(() => {
                          const jumlahSampel = Number(selectedBooking.jumlah_sampel) || 1;
                          let total = 0;
                          const analysisItems = selectedBooking.analysis_items;
                          if (analysisItems && Array.isArray(analysisItems) && analysisItems.length > 0) {
                            analysisItems.forEach((item) => {
                              const itemName = item.nama_item || "";
                              const harga = priceMap[itemName] || 50000;
                              total += harga * jumlahSampel;
                            });
                          } else {
                            const jenis = selectedBooking.jenis_analisis || "";
                            if (priceMap[jenis]) {
                              total = jumlahSampel * priceMap[jenis];
                            } else {
                              total = jumlahSampel * 50000;
                            }
                          }
                          if (!total || isNaN(total) || total === 0) total = jumlahSampel * 50000;
                          return total.toLocaleString("id-ID");
                        })()}
                      </div>
                    )}
                  </div>
                </div>
              )}
              {currentStep === 5 && "Hasil analisis telah diverifikasi dan selesai. Anda dapat mengunduh dokumen hasil di bawah ini."}
            </div>

            {currentStep === 5 &&
              (selectedBooking && (selectedBooking.pdf_path || selectedBooking.pdfPath) && canViewResult ? (
                <button className="btn btn-success w-100 mt-3" onClick={() => window.open(`${apiHost}/storage/${selectedBooking.pdf_path || selectedBooking.pdfPath}`, "_blank")}>
                  <i className="bi bi-download me-2"></i>
                  Download Hasil Analisis (PDF)
                </button>
              ) : (
                <button className="btn btn-success w-100 mt-3" disabled>
                  <i className="bi bi-download me-2"></i>
                  Download Hasil Analisis (PDF)
                </button>
              ))}

            {currentStep === 4 && (
              <button className="btn btn-primary w-100 mt-3" onClick={() => (window.location.href = `/dashboard/pembayaranKlien?bookingId=${selectedBooking.id}`)}>
                <i className="bi bi-credit-card me-2"></i>
                Lakukan Pembayaran
              </button>
            )}

            <button
              className="btn wa-btn text-white w-100 mt-3"
              disabled={!canViewResult}
              title={canViewResult ? "Lihat hasil analisis" : "Silakan lakukan pembayaran dan tunggu verifikasi koordinator untuk melihat hasil"}
              style={{
                backgroundColor: canViewResult ? "#8c6b60" : "#d5c8c3",
                cursor: canViewResult ? "pointer" : "not-allowed",
              }}
              onClick={() => {
                if (!canViewResult) return;
                if (selectedBooking && (selectedBooking.pdf_path || selectedBooking.pdfPath)) {
                  const url = `${apiHost}/storage/${selectedBooking.pdf_path || selectedBooking.pdfPath}`;
                  setPreviewUrl(url);
                  setShowPreview(true);
                } else {
                  message.info("Hasil belum tersedia untuk ditampilkan.");
                }
              }}
            >
              <i className="bi bi-file-earmark-pdf me-2" /> Lihat Hasil Analisis
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderEmptyState = () => (
    <div className="d-flex justify-content-center">
      <div
        className="text-center py-5 px-4 shadow-sm mt-4"
        style={{
          backgroundColor: "#ffffff",
          borderRadius: "24px",
          border: "1px dashed #dee2e6",
          maxWidth: "600px",
          width: "100%",
        }}
      >
        <div className="mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center"
            style={{
              width: "110px",
              height: "110px",
              backgroundColor: "#FDFBF7",
              borderRadius: "50%",
              color: "#8c6b60",
            }}
          >
            <i className="bi bi-flask" style={{ fontSize: "3.2rem" }} />
          </div>
        </div>

        <h4 className="fw-bold mb-2" style={{ color: "#4E342E" }}>
          Belum Ada Proses Analisis
        </h4>

        <p className="text-muted mb-4" style={{ fontSize: "0.95rem" }}>
          Anda belum memiliki sampel yang sedang dianalisis. Silakan ajukan pemesanan analisis sampel untuk memulai proses.
        </p>

        <button
          className="btn text-white fw-bold px-5 py-3 shadow-sm"
          style={{
            backgroundColor: "#8c6b60",
            borderRadius: "16px",
          }}
          onClick={() => (window.location.href = "/dashboard/pemesananSampelKlien")}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Buat Pesanan Sampel
        </button>

        <div className="mt-4">
          <small className="text-muted">
            Butuh bantuan? <span style={{ color: "#8c6b60", cursor: "pointer" }}>Hubungi admin laboratorium</span>
          </small>
        </div>
      </div>
    </div>
  );

  return (
    <NavbarLogin>
      <div className="container py-5 progress-container mb-5">
        {/* ===== JUDUL ===== */}
        {!selectedBooking && (
          <div className="text-center">
            <h2 className="fw-bold text-dark">Daftar Proses Analisis</h2>
            <p className="text-muted">Pantau perkembangan analisis sampel laboratorium Anda</p>
          </div>
        )}

        {/* ===== CONTENT STATE ===== */}
        {loading ? (
          <div className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "50vh" }}>
            <LoadingSpinner text="Memuat data Analisis..." />
          </div>
        ) : selectedBooking ? (
          renderDetail()
        ) : bookingList.length === 0 ? (
          renderEmptyState()
        ) : (
          renderList()
        )}
      </div>

      {/* ===== MODAL PREVIEW PDF ===== */}
      {showPreview && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)", zIndex: 1055 }} onClick={() => setShowPreview(false)}>
          <div className="modal-dialog modal-xl modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content shadow-lg" style={{ borderRadius: "12px" }}>
              <div className="modal-header border-bottom-0">
                <h5 className="modal-title fw-bold">Preview Hasil Analisis</h5>
                <button className="btn-close" onClick={() => setShowPreview(false)} />
              </div>
              <div className="modal-body p-0" style={{ height: "80vh" }}>
                <iframe src={previewUrl} title="Preview PDF" style={{ width: "100%", height: "100%", border: "none" }} />
              </div>
              <div className="modal-footer border-top-0">
                <a className="btn btn-primary rounded-pill px-4" href={previewUrl} target="_blank" rel="noreferrer">
                  <i className="bi bi-box-arrow-up-right me-2" />
                  Buka di Tab Baru
                </a>
                <button className="btn btn-secondary rounded-pill px-4" onClick={() => setShowPreview(false)}>
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <FooterSetelahLogin />
    </NavbarLogin>
  );
};

export default ProsesAnalisis;
