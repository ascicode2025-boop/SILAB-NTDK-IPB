import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import NavbarLogin from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";
import "../../css/MenungguPersetujuan.css";
import { getUserBookings, cancelBooking } from "../../services/BookingService";
import { useHistory } from "react-router-dom";
import dayjs from "dayjs";
import { Spin, message, Modal } from "antd";

const MenungguPersetujuan = () => {
  const history = useHistory();
  const [bookingList, setBookingList] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentStep, setCurrentStep] = useState(2);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await getUserBookings();
        const bookings = response.data;

        if (!bookings || bookings.length === 0) {
          setLoading(false);
          return;
        }

        // FILTER: Hanya tampilkan status tertentu (support lowercase dari backend)
        // Status proses dan selesai tidak akan muncul di sini
        const filtered = bookings.filter((b) => {
          const status = (b.status || '').toLowerCase();
          return status === "menunggu" || 
                 status === "menunggu persetujuan" ||
                 status === "disetujui" || 
                 status === "ditolak";
        });

        setBookingList(filtered);
      } catch (error) {
        console.error("Gagal memuat data:", error);
        message.error("Gagal mengambil data pesanan.");
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  const handleSelectBooking = (booking) => {
    setSelectedBooking(booking);
    // Step berdasarkan status - cukup sampai step 3 (disetujui)
    const status = (booking.status || '').toLowerCase();
    if (status === "disetujui") {
      setCurrentStep(3);
    } else {
      setCurrentStep(2);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    Modal.confirm({
      title: 'Batalkan Pesanan',
      content: 'Apakah Anda yakin ingin membatalkan pesanan ini?',
      okText: 'Ya, Batalkan',
      cancelText: 'Tidak',
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          setLoading(true);
          await cancelBooking(bookingId);
          message.success('Pesanan berhasil dibatalkan');
          
          // Reload data
          const response = await getUserBookings();
          const bookings = response.data;
          const filtered = bookings.filter((b) => {
            const status = (b.status || '').toLowerCase();
            return status === "menunggu" || 
                   status === "menunggu persetujuan" ||
                   status === "disetujui" || 
                   status === "ditolak";
          });
          setBookingList(filtered);
          setSelectedBooking(null);
        } catch (error) {
          console.error("Gagal membatalkan pesanan:", error);
          message.error(error.message || "Gagal membatalkan pesanan");
        } finally {
          setLoading(false);
        }
      }
    });
  };

  const getStatusBadge = (status) => {
    const lowerStatus = (status || '').toLowerCase();
    switch (lowerStatus) {
      case "proses":
        return "bg-info text-white";
      case "disetujui":
        return "bg-success";
      case "ditolak":
        return "bg-danger";
      case "menunggu":
      case "menunggu persetujuan":
      default:
        return "bg-warning text-dark";
    }
  };

  const generateSampleCodes = (booking) => {
    if (!booking) return [];
    
    // UPDATED: Parse kode_sampel dari JSON jika berbentuk string
    try {
      let codes = [];
      
      if (typeof booking.kode_sampel === 'string') {
        // Coba parse sebagai JSON
        try {
          codes = JSON.parse(booking.kode_sampel);
          if (Array.isArray(codes)) {
            return codes;
          }
        } catch (e) {
          // Jika bukan JSON, gunakan sebagai single code
          codes = [booking.kode_sampel];
        }
      } else if (Array.isArray(booking.kode_sampel)) {
        codes = booking.kode_sampel;
      }
      
      return codes;
    } catch (error) {
      console.error('Error parsing kode_sampel:', error);
      return ['Error loading codes'];
    }
  };

  const getWALink = () => {
    if (!selectedBooking) return "#";
    const phone = "6282111485562";
    const userName = localStorage.getItem("user_name") || "Klien SILAB";
    const allCodes = generateSampleCodes(selectedBooking);

    let text = `Halo Admin SILAB, konfirmasi pesanan:\n\n`;
    text += `👤 *Nama:* ${userName}\n`;
    text += `📦 *Jumlah:* ${selectedBooking.jumlah_sampel} Sampel\n`;
    text += `🏷️ *Daftar Kode Sampel:*\n${allCodes.join("\n")}\n\n`;
    text += `🔬 *Layanan:* ${selectedBooking.jenis_analisis}\n`;
    text += `📅 *Tanggal:* ${dayjs(selectedBooking.tanggal_kirim).format("DD-MM-YYYY")}\n`;
    text += `📊 *Status:* ${selectedBooking.status}\n\n`;
    text += `Mohon diproses. Terima kasih.`;

    return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
  };

  const renderDetail = () => {
    if (!selectedBooking) return null;
    const sampleCodes = generateSampleCodes(selectedBooking);
    const status = (selectedBooking.status || '').toLowerCase();
    const isRejected = status === "ditolak";
    const isApproved = status === "disetujui";

    return (
      <div className="fade-in">
        <button className="btn btn-outline-secondary btn-sm mb-4" onClick={() => setSelectedBooking(null)}>
          <i className="bi bi-arrow-left me-2"></i> Kembali ke Daftar
        </button>

        {/* Stepper dinamis */}
        <div className="progress-wrapper mb-5 mt-4">
          {/* Step 1 */}
          <div className="step">
            <div className="icon-wrapper active big-step">
              <i className="bi bi-list-check"></i>
            </div>
            <p className="label active-text">Mengisi Form</p>
          </div>

          <div className={`progress-line big-line filled`}></div>

          {/* Step 2 */}
          <div className="step">
            <div className={`icon-wrapper active ${currentStep === 2 ? "pulse-active" : ""} big-step ${status === "menunggu" || status === "menunggu persetujuan" ? "rotate-icon" : ""}`}>
              {isRejected ? <i className="bi bi-x-lg"></i> : <i className="bi bi-clock"></i>}
            </div>
            <p className={`label ${currentStep === 2 ? "active-text" : ""}`}>{isRejected ? "Ditolak" : "Verifikasi"}</p>
          </div>

          <div className={`progress-line big-line ${currentStep >= 3 ? "filled" : ""}`}></div>

          {/* Step 3 */}
          <div className="step">
            <div className={`icon-wrapper ${currentStep === 3 ? "active pulse-active" : ""} big-step`}>
              <i className="bi bi-check2"></i>
            </div>
            <p className={`label ${currentStep === 3 ? "active-text" : ""}`}>Disetujui</p>
          </div>
        </div>

        {/* Kartu Status */}
        <div className="d-flex justify-content-center">
          <div
            className={`info-card text-center shadow-sm ${isRejected ? "border-danger" : isApproved ? "border-success" : status === "proses" ? "border-info" : ""}`}
            style={{
              maxWidth: "600px",
              borderTop: isRejected ? "5px solid #dc3545" : isApproved ? "5px solid #198754" : status === "proses" ? "5px solid #0dcaf0" : "5px solid #ffc107",
              backgroundColor: "#fff",
            }}
          >
            {isRejected ? (
              <>
                <div className="mb-3 text-danger">
                  <i className="bi bi-x-circle-fill" style={{ fontSize: "3.5rem" }}></i>
                </div>
                <h4 className="fw-bold text-danger mb-3">Pesanan Ditolak</h4>
                <div className="alert alert-danger text-start">
                  <strong>Alasan:</strong> {selectedBooking.alasan_penolakan || "Hubungi Admin via WhatsApp."}
                </div>
              </>
            ) : status === "proses" ? (
              <>
                <div className="mb-3 text-info">
                  <i className="bi bi-graph-up-arrow" style={{ fontSize: "3.5rem" }}></i>
                </div>
                <h4 className="fw-bold text-info mb-3">Sedang Dianalisis</h4>
                <div className="alert alert-info text-start">
                  <i className="bi bi-info-circle me-2"></i> Sampel Anda sedang dalam proses analisis oleh teknisi laboratorium.
                </div>
              </>
            ) : isApproved ? (
              <>
                <div className="mb-3 text-success">
                  <i className="bi bi-check-circle-fill" style={{ fontSize: "3.5rem" }}></i>
                </div>
                <h4 className="fw-bold text-success mb-3">Pesanan Disetujui!</h4>
                <div className="alert alert-success text-start">
                  <i className="bi bi-info-circle me-2"></i> Silakan beri label botol sesuai daftar kode di bawah ini sebelum dikirim.
                </div>
              </>
            ) : (
              <>
                <h4 className="fw-semibold mb-3">Menunggu Persetujuan</h4>
                <p className="text-muted mb-4">Pesanan Anda sedang ditinjau oleh teknisi laboratorium kami.</p>
              </>
            )}

            <div className="text-start bg-light p-3 rounded mb-4 border">
              <h6 className="fw-bold text-secondary mb-3">
                <i className="bi bi-tags-fill me-2 text-primary"></i>
                Daftar Label Sampel ({sampleCodes.length} sampel)
              </h6>
              <div className="d-flex flex-wrap gap-2" style={{ maxHeight: "200px", overflowY: "auto" }}>
                {sampleCodes.map((code, idx) => (
                  <span 
                    key={idx} 
                    className="badge bg-white text-dark border py-2 px-3"
                    style={{ fontSize: '0.85rem', fontWeight: '500' }}
                  >
                    <i className="bi bi-tag-fill me-1 text-secondary"></i>
                    {code}
                  </span>
                ))}
              </div>
            </div>

            <a href={getWALink()} target="_blank" rel="noopener noreferrer" className="btn wa-btn text-white w-100 mb-2">
              <i className="bi bi-whatsapp me-2"></i>
              {selectedBooking.status === "Menunggu Persetujuan" ? "Konfirmasi via WhatsApp" : "Hubungi Admin"}
            </a>
            
            {/* Cancel button - only for menunggu or disetujui status */}
            {(() => {
              const status = (selectedBooking.status || '').toLowerCase();
              return (status === "menunggu" || status === "menunggu persetujuan" || status === "disetujui");
            })() && (
              <button 
                onClick={() => handleCancelBooking(selectedBooking.id)} 
                className="btn btn-danger w-100"
              >
                <i className="bi bi-x-circle me-2"></i>
                Batalkan Pesanan
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
      return (
        <NavbarLogin>
            <div className="d-flex justify-content-center align-items-center" style={{ height: "60vh" }}>
                <Spin size="large" tip="Memuat Pesanan..." />
            </div>
            <FooterSetelahLogin />
        </NavbarLogin>
      )
  }

  return (
    <NavbarLogin>
      <div className="container py-5 progress-container">
        {bookingList.length === 0 ? (
            <div className="text-center py-5">
                <i className="bi bi-box-seam text-muted" style={{ fontSize: "4rem" }}></i>
                <h5 className="mt-3 text-secondary">Tidak ada pesanan dalam tahap persetujuan.</h5>
                <button className="btn btn-primary mt-3" onClick={() => history.push("/dashboard/pemesananSampelKlien")}>Buat Pesanan Baru</button>
            </div>
        ) : selectedBooking ? (
          renderDetail()
        ) : (
          <div className="container" style={{ maxWidth: "800px" }}>
            <h4 className="fw-bold mb-4 text-center text-secondary">Daftar Persetujuan Pesanan</h4>
            <div className="row g-3">
              {bookingList.map((item) => (
                <div key={item.id} className="col-12">
                  <div className="card shadow-sm border-0 h-100 hover-card" style={{ cursor: "pointer" }} onClick={() => handleSelectBooking(item)}>
                    <div className="card-body d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="fw-bold mb-1 text-dark">
                          {generateSampleCodes(item)[0] || item.kode_sampel}
                        </h6>
                        {generateSampleCodes(item).length > 1 && (
                          <small className="text-muted d-block mb-1">
                            +{generateSampleCodes(item).length - 1} sampel lainnya
                          </small>
                        )}
                        <small className="text-muted d-block">
                          {dayjs(item.tanggal_kirim).format("DD MMM YYYY")} | {item.jenis_analisis}
                        </small>
                      </div>
                      <div className="text-end">
                        <span className={`badge ${getStatusBadge(item.status)} px-3 py-2 rounded-pill`}>{item.status}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <FooterSetelahLogin />
    </NavbarLogin>
  );
};

export default MenungguPersetujuan;