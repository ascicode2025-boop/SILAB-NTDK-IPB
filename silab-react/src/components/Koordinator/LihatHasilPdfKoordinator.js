import React, { useEffect, useState } from "react";
import { useParams, useHistory } from "react-router-dom";
import NavbarLoginKoordinator from "./NavbarLoginKoordinator";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { getAllBookings, updateBookingStatus, kirimKeKepala } from "../../services/BookingService";
import { getAuthHeader } from "../../services/AuthService";
import { Button, Spinner, Container, Card } from "react-bootstrap";
import Modal from "react-bootstrap/Modal";

export default function LihatHasilPdfKoordinator() {
  const { id } = useParams();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [pdfError, setPdfError] = useState(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [priceMap, setPriceMap] = useState({});

  const fetchPrices = async () => {
    try {
      const apiBase = (process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api');
      const res = await fetch(`${apiBase}/analysis-prices`);
      if (res.ok) {
        const prices = await res.json();
        const map = {};
        if (Array.isArray(prices)) {
          prices.forEach(p => {
            const keys = [p.jenis_analisis, p.nama_analisis, p.nama_item].filter(k => k);
            keys.forEach(key => { if (key) map[key] = Number(p.harga) || 0; });
          });
        }
        setPriceMap(map);
      }
    } catch (err) {
      console.error('Gagal memuat harga analisis:', err);
    }
  };

  useEffect(() => { fetchPrices(); }, []);

  // --- LOGIKA GENERATE PDF IDENTIK DENGAN TEKNISI ---
  const instituteHeader = [
    "KEMENTERIAN RISET, TEKNOLOGI DAN PENDIDIKAN TINGGI",
    "INSTITUT PERTANIAN BOGOR",
    "FAKULTAS PETERNAKAN",
    "DEPARTEMEN ILMU NUTRISI DAN TEKNOLOGI PAKAN",
    "LABORATORIUM NUTRISI TERNAK DAGING DAN KERJA",
    "Jl. Agathis Kampus IPB Darmaga, Bogor 16680",
  ];

  const getFilename = () => {
    let kodeBatch = "unknown";
    if (bookingData) {
      if (bookingData.kode_batch) {
        kodeBatch = bookingData.kode_batch;
      } else if (bookingData.kode_sampel) {
        try {
            if (typeof bookingData.kode_sampel === 'string' && bookingData.kode_sampel.trim().startsWith('[')) {
                const parsed = JSON.parse(bookingData.kode_sampel);
                if (Array.isArray(parsed) && parsed.length > 0) kodeBatch = parsed[0];
            } else {
                kodeBatch = bookingData.kode_sampel;
            }
        } catch (e) {
            kodeBatch = bookingData.kode_sampel;
        }
      }
    }
    const safeKode = String(kodeBatch).replace(/[^a-zA-Z0-9\-_]/g, "_");
    return `Laporan_Analisis_${safeKode}.pdf`;
  };

  useEffect(() => {
    if (id) fetchBookingById(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchBookingById = async (bookingId) => {
    try {
      setLoading(true);
      const res = await getAllBookings();
      const all = res?.data || [];
      const booking = all.find((b) => String(b.id) === String(bookingId));
      setBookingData(booking || null);

      if (booking) {
        // Cek file dari server (TTD atau Generated Teknisi)
        const apiBase = (process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api");
        const storageBase = apiBase.replace(/\/api\/?$/, '');
        let fileUrl = null;
        // 1. Prioritas: file_ttd_path (hasil upload ttd manual)
        if (booking.file_ttd_path) {
          fileUrl = `${storageBase}/storage/${booking.file_ttd_path}`;
        // 2. Jika belum ada, gunakan pdf_path (hasil generate teknisi)
        } else if (booking.pdf_path) {
          fileUrl = `${storageBase}/storage/${booking.pdf_path}`;
        // 3. Fallback: endpoint backend untuk generate PDF on the fly
        } else {
          fileUrl = `${apiBase}/bookings/${booking.id}/pdf`;
        }
        setPdfUrl(fileUrl);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getStoredPdfUrl = () => {
    if (!bookingData) return null;
    const apiBase = (process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api");
    const storageBase = apiBase.replace(/\/api\/?$/, '');
    
    if (bookingData.file_ttd_path) return `${storageBase}/storage/${bookingData.file_ttd_path}`;
    if (bookingData.pdf_path) return `${storageBase}/storage/${bookingData.pdf_path}`;
    return null;
  };

  // Fungsi untuk fetch PDF dari backend (blade template)
  const fetchPdfBlob = async (bookingId) => {
    const apiBase = (process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api');
    // Try stored/uploaded PDF first
    try {
      const res = await fetch(`${apiBase}/bookings/${bookingId}/pdf`, { 
        headers: { ...getAuthHeader(), 'Accept': 'application/pdf' } 
      });
      if (res.ok) return await res.blob();
    } catch (e) {}
    // Fallback ke generated PDF (blade template)
    try {
      const genRes = await fetch(`${apiBase}/bookings/${bookingId}/pdf-generated`, { 
        headers: { ...getAuthHeader(), 'Accept': 'application/pdf' } 
      });
      if (genRes.ok) return await genRes.blob();
    } catch (e) {}
    throw new Error('No PDF available');
  };

  useEffect(() => {
    const fetchPdf = async () => {
      if (!bookingData) return;
      setPdfLoading(true);
      setPdfError(null);
      try {
        const blob = await fetchPdfBlob(bookingData.id);
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
        const url = URL.createObjectURL(blob);
        setPdfUrl(url);
      } catch (e) {
        setPdfUrl(null);
        setPdfError('PDF belum tersedia. Kemungkinan teknisi belum meng-upload hasil analisis.');
        console.error('Error fetching PDF:', e);
      } finally {
        setPdfLoading(false);
      }
    };
    fetchPdf();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bookingData]);

  // --- 3. Logika SETUJU (Simpan Status) ---
  const handleSetuju = async () => {
    if (!bookingData) return;
    setProcessing(true);
    try {
      // Jika booking sudah disetujui oleh Kepala (menunggu tanda tangan Koordinator),
      // langsung arahkan ke halaman Tanda Tangan Koordinator untuk upload PDF signed.
      const st = (bookingData.status || '').toLowerCase();
      if (st === 'menunggu_ttd_koordinator' || st === 'menunggu_ttd') {
        history.push(`/koordinator/dashboard/tandaTanganKoordinator?bookingId=${bookingData.id}`);
      } else {
        // Panggil endpoint kirim-ke-kepala yang tersedia di backend
        await kirimKeKepala(bookingData.id);
        setBookingData({ ...bookingData, status: "menunggu_verifikasi_kepala" });
      }
      setShowConfirmModal(false);
      setTimeout(() => {
        alert("Berhasil dikirim! Data telah dikirim ke Kepala Laboratorium.");
        history.push("/koordinator/dashboard/verifikasiSampelKoordinator");
      }, 300);
    } catch (err) {
      console.error("Gagal mengirim ke verifikasi kepala:", err);
      alert("Terjadi kesalahan sistem saat menyimpan data.");
    } finally {
      setProcessing(false);
    }
  };

  // --- 4. Logika Download ---
  const handleDownload = () => {
    const stored = getStoredPdfUrl();
    const fileName = getFilename(); 

    if (stored) {
      fetch(stored, { headers: getAuthHeader() })
        .then(response => {
          if (!response.ok) throw new Error('Network response was not ok');
          return response.blob();
        })
        .then(blob => {
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.style.display = 'none';
          a.href = url;
          a.download = fileName;
          document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          document.body.removeChild(a);
        })
        .catch(err => {
          console.error('Download error:', err);
          window.open(stored, '_blank');
        });
    } // buildPDF(true) dihapus, tidak ada fallback generate PDF lokal
  };

  return (
    <NavbarLoginKoordinator>
      <div className="container-fluid p-4" style={{ minHeight: "calc(100vh - 160px)" }}>
        {loading && (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
          </div>
        )}

        {!loading && (
          <>
            <Card className="shadow-sm border-0 mb-3">
                <Card.Body className="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="mb-1 text-primary">Preview Hasil Analisis</h5>
                        <p className="mb-0 text-muted small">
                            Kode Batch: <strong>{bookingData?.kode_batch || '-'}</strong> | 
                            Status: <strong className="text-uppercase">{bookingData?.status?.replace(/_/g, ' ') || '-'}</strong>
                        </p>
                    </div>
                    <div className="d-flex gap-2">
                        <Button variant="secondary" onClick={() => history.push('/koordinator/dashboard/verifikasiSampelKoordinator')}>
                            Kembali
                        </Button>
                        
                        <Button variant="primary" onClick={handleDownload}>
                            Download PDF
                        </Button>

                        {/* TOMBOL SETUJU - Hanya muncul jika status 'menunggu_verifikasi' */}
                        {bookingData && (bookingData.status || "").toLowerCase() === "menunggu_verifikasi" && (
                          <Button 
                            variant="success" 
                            onClick={() => setShowConfirmModal(true)} 
                            disabled={processing}
                            style={{ backgroundColor: '#28a745', borderColor: '#28a745' }}
                          >
                            {processing ? (
                              <>
                                <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/>
                                Menyimpan...
                              </>
                            ) : (
                              "Setuju & Kirim ke Kepala"
                            )}
                          </Button>
                        )}
                          {/* Modal Konfirmasi Kirim ke Kepala */}
                          <Modal show={showConfirmModal} onHide={() => setShowConfirmModal(false)} centered>
                            <Modal.Header closeButton>
                              <Modal.Title>Konfirmasi Kirim ke Kepala</Modal.Title>
                            </Modal.Header>
                            <Modal.Body>
                              <p>Apakah Anda yakin hasil analisis ini sudah benar dan siap dikirim ke Kepala Laboratorium?</p>
                            </Modal.Body>
                            <Modal.Footer>
                              <Button variant="secondary" onClick={() => setShowConfirmModal(false)} disabled={processing}>
                                Batal
                              </Button>
                              <Button variant="success" onClick={handleSetuju} disabled={processing}>
                                {processing ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2"/> : null}
                                Ya, Kirim ke Kepala
                              </Button>
                            </Modal.Footer>
                          </Modal>
                    </div>
                </Card.Body>
            </Card>

            <div
              style={{
                width: "100%",
                minHeight: "800px",
                height: "calc(100vh - 260px)",
                border: "1px solid #ddd",
                borderRadius: "8px",
                overflow: "hidden",
                backgroundColor: "#525659", // Warna background PDF viewer native
              }}
            >
              {/* Tampilkan ringkasan item analisis dan harga di atas preview */}
              {bookingData && Array.isArray(bookingData.analysis_items) && bookingData.analysis_items.length > 0 && (
                <Card className="mb-2" style={{ margin: '12px' }}>
                  <Card.Body>
                    <h6 className="fw-bold">Detail Analisis & Harga</h6>
                    <div className="table-responsive">
                      <table className="table table-sm table-bordered mb-0">
                        <thead>
                          <tr>
                            <th>Nama Item</th>
                            <th>Harga Satuan</th>
                            <th>Total</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bookingData.analysis_items.map((it, idx) => {
                            const harga = priceMap[it.nama_item] || 0;
                            const jumlah = Number(bookingData.jumlah_sampel) || 1;
                            return (
                              <tr key={idx}>
                                <td>{it.nama_item}</td>
                                <td>Rp {harga.toLocaleString('id-ID')}</td>
                                <td>Rp {(harga * jumlah).toLocaleString('id-ID')}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </Card.Body>
                </Card>
              )}
              {pdfLoading ? (
                <div className="text-center py-5 text-white">
                  <p>Memuat Preview PDF...</p>
                </div>
              ) : pdfUrl ? (
                <object
                  data={pdfUrl}
                  type="application/pdf"
                  width="100%"
                  height="100%"
                  aria-label="PDF Preview"
                >
                  <p className="text-white">PDF tidak dapat ditampilkan. <a href={pdfUrl} target="_blank" rel="noopener noreferrer">Klik di sini untuk membuka PDF</a>.</p>
                </object>
              ) : pdfError ? (
                <div className="text-center py-5 text-danger">
                  <p>{pdfError}</p>
                  <p className="text-white">Silakan hubungi teknisi untuk meng-upload hasil analisis.</p>
                </div>
              ) : (
                <div className="text-center py-5 text-white">
                  <p>Preview PDF tidak tersedia.</p>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <FooterSetelahLogin />
    </NavbarLoginKoordinator>
  );
}