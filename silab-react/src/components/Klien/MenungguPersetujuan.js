import React, { useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import NavbarLogin from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";
import "../../css/MenungguPersetujuan.css";
import { getUserBookings } from "../../services/BookingService"; 
import { useHistory } from "react-router-dom";
import dayjs from "dayjs";
import { Spin, message } from "antd"; 

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
            message.warning("Anda belum memiliki pesanan aktif.");
            history.push("/dashboard/pemesananSampelKlien");
            return;
        }

        setBookingList(bookings);
        if (bookings.length === 1) {
            handleSelectBooking(bookings[0]);
        }
      } catch (error) {
        console.error("Gagal memuat data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [history]);

  const handleSelectBooking = (booking) => {
    setSelectedBooking(booking);
    if (booking.status === 'Disetujui' || booking.status === 'Selesai' || booking.status === 'Menunggu Dianalisis') {
        setCurrentStep(3);
    } else {
        setCurrentStep(2);
    }
  };

  const getStatusBadge = (status) => {
      switch(status) {
          case 'Disetujui': return 'bg-success';
          case 'Menunggu Dianalisis': return 'bg-success';
          case 'Ditolak': return 'bg-danger';
          case 'Selesai': return 'bg-primary';
          default: return 'bg-warning text-dark';
      }
  };
  const generateSampleCodes = (booking) => {
    if (!booking) return [];
    const count = booking.jumlah_sampel;
    const mainCode = booking.kode_sampel;
    if (count <= 1) return [mainCode];

    let codes = [];
    for (let i = 1; i <= count; i++) {
        codes.push(`${mainCode}-${i}`);
    }
    return codes;
  };
  const getWALink = () => {
    if (!selectedBooking) return "#";
    
    const phone = "6282111485562"; 
    const userName = localStorage.getItem("user_name") || "Klien SILAB"; 
    
    // Ambil semua kode sampel
    const allCodes = generateSampleCodes(selectedBooking);
    const codesString = allCodes.join(", ");
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

  // --- TAMPILAN LIST ---
  const renderList = () => (
      <div className="container" style={{maxWidth: "800px"}}>
          <h4 className="fw-bold mb-4 text-center text-secondary">Daftar Pesanan Anda</h4>
          <div className="row g-3">
              {bookingList.map((item) => (
                  <div key={item.id} className="col-12">
                      <div className="card shadow-sm border-0 h-100 hover-card" style={{cursor: 'pointer'}} onClick={() => handleSelectBooking(item)}>
                          <div className="card-body d-flex justify-content-between align-items-center">
                              <div>
                                  <h6 className="fw-bold mb-1 text-dark">
                                    {item.kode_sampel} 
                                    <span className="badge bg-light text-secondary ms-2 border" style={{fontSize: '0.75rem'}}>{item.jumlah_sampel} Sampel</span>
                                  </h6>
                                  <small className="text-muted d-block">{dayjs(item.tanggal_kirim).format("DD MMM YYYY")}</small>
                                  <small className="text-muted">{item.jenis_analisis}</small>
                              </div>
                              <div className="text-end">
                                  <span className={`badge ${getStatusBadge(item.status)} px-3 py-2 rounded-pill`}>{item.status}</span>
                                  <div className="text-muted mt-2 small">Detail <i className="bi bi-chevron-right"></i></div>
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
    const sampleCodes = generateSampleCodes(selectedBooking);

    return (
        <div className="fade-in">
            <button className="btn btn-outline-secondary btn-sm mb-4" onClick={() => setSelectedBooking(null)}>
                <i className="bi bi-arrow-left me-2"></i> Kembali ke Daftar
            </button>

            {/* Stepper */}
            <div className="progress-wrapper mb-5">
                <div className="step fade-in">
                    <div className="icon-wrapper active"><i className="bi bi-list-check"></i></div>
                    <p className="label">Mengisi Form</p>
                </div>
                <div className={`progress-line ${currentStep >= 2 ? "filled" : ""}`}></div>
                <div className="step fade-in">
                    <div className={`icon-wrapper ${currentStep >= 2 ? "active big" : ""} ${selectedBooking.status === 'Menunggu Persetujuan' ? 'rotate-icon' : ''}`}>
                         {selectedBooking.status === 'Ditolak' ? <i className="bi bi-x-lg"></i> : <i className="bi bi-clock"></i>}
                    </div>
                    <p className="label active-text">{selectedBooking.status === 'Ditolak' ? 'Ditolak' : 'Menunggu Persetujuan'}</p>
                </div>
                <div className={`progress-line ${currentStep >= 3 ? "filled" : ""}`}></div>
                <div className="step fade-in">
                    <div className={`icon-wrapper ${currentStep === 3 ? "active" : ""}`}><i className="bi bi-check2"></i></div>
                    <p className="label">Disetujui</p>
                </div>
            </div>

            {/* Kartu Status + List Kode */}
            <div className="d-flex justify-content-center">
                <div className={`info-card text-center shadow-sm ${selectedBooking.status === 'Ditolak' ? 'border-danger' : selectedBooking.status === 'Disetujui' || selectedBooking.status === 'Menunggu Dianalisis' ? 'border-success' : ''}`} 
                     style={{maxWidth: "600px", borderTop: selectedBooking.status === 'Ditolak' ? "5px solid #dc3545" : selectedBooking.status === 'Disetujui' || selectedBooking.status === 'Menunggu Dianalisis' ? "5px solid #198754" : ""}}>
                    
                    {/* Header Icon & Title */}
                    {selectedBooking.status === 'Ditolak' ? (
                        <>
                            <div className="mb-3 text-danger"><i className="bi bi-x-circle-fill" style={{fontSize: "4rem"}}></i></div>
                            <h4 className="fw-bold text-danger mb-3">Pesanan Ditolak</h4>
                            <div className="alert alert-danger text-start"><strong>Alasan:</strong><br/>{selectedBooking.alasan_penolakan || "Hubungi Admin."}</div>
                        </>
                    ) : (selectedBooking.status === 'Disetujui' || selectedBooking.status === 'Menunggu Dianalisis') ? (
                        <>
                            <div className="mb-3 text-success"><i className="bi bi-check-circle-fill" style={{fontSize: "4rem"}}></i></div>
                            <h4 className="fw-bold text-success mb-3">Pesanan Disetujui!</h4>
                            <div className="alert alert-success text-start"><i className="bi bi-info-circle me-2"></i> Silakan beri label botol sesuai kode di bawah ini.</div>
                        </>
                    ) : (
                        <>
                           <h4 className="fw-semibold mb-3">Menunggu Persetujuan</h4>
                           <p className="text-muted mb-4">Sedang ditinjau teknisi.</p>
                        </>
                    )}

                    {/* LIST KODE SAMPEL DI UI */}
                    <div className="text-start bg-light p-3 rounded mb-3 border">
                        <h6 className="fw-bold text-secondary mb-2">Daftar Label Sampel Anda:</h6>
                        <ul className="list-group list-group-flush small" style={{maxHeight: '150px', overflowY: 'auto'}}>
                            {sampleCodes.map((code, idx) => (
                                <li key={idx} className="list-group-item bg-transparent py-1">
                                    <i className="bi bi-tag-fill me-2 text-primary"></i> 
                                    <span className="fw-bold text-dark">{code}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="mt-2 text-end">
                            <small className="text-muted fst-italic">Total: {selectedBooking.jumlah_sampel} Sampel</small>
                        </div>
                    </div>

                    {/* Tombol Aksi */}
                    {selectedBooking.status === 'Ditolak' ? (
                        <button onClick={() => history.push("/dashboard/pemesananSampelKlien")} className="btn btn-outline-danger w-100 mt-2">Buat Pesanan Baru</button>
                    ) : (
                        <>
                            {selectedBooking.status === 'Menunggu Persetujuan' && <div className="alert alert-warning text-start py-2 mb-2"><small><i className="bi bi-info-circle me-1"></i> Konfirmasi WA mempercepat verifikasi.</small></div>}
                            <a href={getWALink()} target="_blank" rel="noopener noreferrer" className="btn wa-btn text-white w-100 mt-2">
                                <i className="bi bi-whatsapp me-2"></i> {selectedBooking.status === 'Menunggu Persetujuan' ? 'Konfirmasi ke WhatsApp' : 'Hubungi Admin via WA'}
                            </a>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
  };

  if (loading) return <NavbarLogin><div className="d-flex justify-content-center align-items-center" style={{height: '80vh'}}><Spin size="large" tip="Memuat data..." /></div></NavbarLogin>;

  return (
    <NavbarLogin>
      <div className="container py-5 progress-container" style={{ marginTop: "5rem" }}>
        {selectedBooking ? renderDetail() : renderList()}
      </div>
      <FooterSetelahLogin />
      <style>{`.hover-card:hover { transform: translateY(-3px); box-shadow: 0 5px 15px rgba(0,0,0,0.1) !important; background-color: #f8f9fa; }`}</style>
    </NavbarLogin>
  );
};

export default MenungguPersetujuan;