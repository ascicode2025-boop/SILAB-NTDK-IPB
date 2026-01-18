import React, { useEffect, useState } from "react";
import { Table, Button, Spinner, Card, Badge, Container, Row, Col, Modal, Form } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import NavbarLoginKepala from "./NavbarLoginKepala";
import FooterSetelahLogin from "../tamu/FooterSetelahLogin";
import { getAllBookings, updateBookingStatus } from "../../services/BookingService";
import CustomPopup from "../../components/Common/CustomPopup";

const VerifikasiKepala = () => {
  const history = useHistory();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null); // 'setuju' | 'tolak'
  const [selectedBooking, setSelectedBooking] = useState(null);

  // Form State
  const [alasanTolak, setAlasanTolak] = useState("");
  const [processing, setProcessing] = useState(false);

  // Price Map State
  const [priceMap, setPriceMap] = useState({});
  const [popup, setPopup] = useState({ show: false, title: "", message: "", type: "info" });

  const parseKodeSampel = (kodeSampel) => {
    try {
      if (!kodeSampel) return "-";
      if (typeof kodeSampel === "string") {
        const parsed = JSON.parse(kodeSampel);
        const arr = Array.isArray(parsed) ? parsed : [parsed];
        return arr.filter(Boolean).join(", ");
      }
      if (Array.isArray(kodeSampel)) return kodeSampel.join(", ");
      return String(kodeSampel);
    } catch {
      return String(kodeSampel);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await getAllBookings();
      const all = res?.data || [];

      // PERBAIKAN 1: Filter harus sesuai dengan yang dikirim Koordinator
      const filtered = all.filter((b) => {
        const st = (b.status || "").toLowerCase();
        // Koordinator mengirim dengan status 'menunggu_verifikasi_kepala'
        return st === "menunggu_verifikasi_kepala";
      });

      // Sort dari terbaru
      filtered.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      setBookings(filtered);
    } catch (err) {
      console.error("Gagal mengambil data booking (kepala):", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch analysis prices from API
  const fetchPrices = async () => {
    try {
      const apiBase = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";
      const res = await fetch(`${apiBase}/analysis-prices`);
      if (res.ok) {
        const prices = await res.json();
        const map = {};
        if (Array.isArray(prices)) {
          prices.forEach((p) => {
            // Support multiple field names: jenis_analisis, nama_analisis, nama_item
            const keys = [p.jenis_analisis, p.nama_analisis, p.nama_item].filter((k) => k);
            keys.forEach((key) => {
              if (key) map[key] = Number(p.harga) || 0;
            });
          });
        }
        setPriceMap(map);
      }
    } catch (err) {
      console.error("Gagal memuat harga analisis:", err);
    }
  };

  useEffect(() => {
    fetchBookings();
    fetchPrices();
  }, []);

  const openModal = (type, item) => {
    setModalType(type);
    setSelectedBooking(item);
    setShowModal(true);
    setAlasanTolak("");
  };

  const handleSetuju = async () => {
    if (!selectedBooking) return;
    setProcessing(true);
    try {
      // Send status with timestamp so backend records when kepala approved
      await updateBookingStatus(selectedBooking.id, {
        status: "menunggu_ttd_koordinator",
        status_updated_at: new Date().toISOString(),
      });

      setShowModal(false);
      fetchBookings(); // Refresh tabel
    } catch (err) {
      console.error(err);
      setPopup({ show: true, title: "Gagal", message: "Terjadi kesalahan saat menyetujui hasil analisis.", type: "error" });
    } finally {
      setProcessing(false);
    }
  };

  const handleTolak = async () => {
    if (!selectedBooking || !alasanTolak.trim()) return;
    setProcessing(true);
    try {
      // Jika ditolak, status jadi 'ditolak_kepala' dan simpan alasannya
      await updateBookingStatus(selectedBooking.id, {
        status: "ditolak_kepala",
        alasan_tolak: alasanTolak,
      });
      setShowModal(false);
      fetchBookings();
    } catch (err) {
      console.error(err);
      setPopup({ show: true, title: "Gagal", message: "Terjadi kesalahan saat menolak hasil analisis.", type: "error" });
    } finally {
      setProcessing(false);
    }
  };

  return (
    <NavbarLoginKepala>
      <div style={{ backgroundColor: "#f8f9fa", minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <Container className="py-5" style={{ flex: 1 }}>
          <Row className="mb-4 align-items-center">
            <Col md={8}>
              <h3 className="fw-bold" style={{ color: "#45352F" }}>
                Verifikasi Akhir
              </h3>
              <p className="text-muted">Daftar hasil analisis yang menunggu persetujuan Kepala Laboratorium.</p>
            </Col>
            <Col md={4} className="text-md-end">
              <Card className="border-0 shadow-sm bg-white p-3 text-center d-inline-block" style={{ minWidth: "150px", borderRadius: "12px" }}>
                <small className="text-uppercase fw-bold text-muted" style={{ fontSize: "11px", letterSpacing: "1px" }}>
                  Menunggu Aksi
                </small>
                <h2 className="mb-0 fw-bold" style={{ color: "#45352F" }}>
                  {bookings.length}
                </h2>
              </Card>
            </Col>
          </Row>

          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" style={{ color: "#45352F" }} />
              <p className="mt-2 text-muted">Memuat data...</p>
            </div>
          ) : (
            <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: "16px" }}>
              <Table hover responsive className="mb-0 align-middle">
                <thead style={{ backgroundColor: "#f1f3f5" }}>
                  <tr>
                    <th className="px-4 py-3 border-0 text-secondary text-uppercase" style={{ fontSize: "0.8rem", fontWeight: "600" }}>
                      Kode Batch
                    </th>
                    <th className="py-3 border-0 text-secondary text-uppercase" style={{ fontSize: "0.8rem", fontWeight: "600" }}>
                      Pemesan
                    </th>
                    <th className="py-3 border-0 text-secondary text-uppercase" style={{ fontSize: "0.8rem", fontWeight: "600" }}>
                      Jenis Analisis
                    </th>
                    <th className="py-3 border-0 text-secondary text-uppercase" style={{ fontSize: "0.8rem", fontWeight: "600" }}>
                      Status
                    </th>
                    <th className="text-center py-3 border-0 text-secondary text-uppercase" style={{ fontSize: "0.8rem", fontWeight: "600" }}>
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-5">
                        <div className="text-muted my-3">
                          <p className="mb-0">Tidak ada laporan yang menunggu verifikasi saat ini.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    bookings.map((item) => (
                      <tr key={item.id} style={{ borderBottom: "1px solid #f0f0f0" }}>
                        <td className="px-4 fw-bold" style={{ color: "#45352F" }}>
                          {item.kode_batch || parseKodeSampel(item.kode_sampel)}
                        </td>
                        <td className="text-dark">{item.user?.full_name || item.user?.name || "-"}</td>
                        <td className="text-secondary">{item.jenis_analisis || item.jenis || "-"}</td>
                        <td>
                          <Badge bg="warning" text="dark" className="px-3 py-2 rounded-pill fw-normal">
                            Perlu Verifikasi
                          </Badge>
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-2">
                            {/* Tombol Lihat PDF (Pindah ke halaman detail) */}
                            <Button variant="outline-secondary" size="sm" className="px-3 rounded-pill" onClick={() => history.push(`/kepala/dashboard/verifikasiKepala/lihatHasilPdfKepala/${item.id}`)}>
                              Lihat PDF
                            </Button>

                            {/* Tombol Quick Action */}
                            <Button variant="success" size="sm" className="px-3 rounded-pill" onClick={() => openModal("setuju", item)}>
                              Setuju
                            </Button>
                            <Button variant="danger" size="sm" className="px-3 rounded-pill" onClick={() => openModal("tolak", item)}>
                              Tolak
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </Card>
          )}
        </Container>

        <FooterSetelahLogin />

        <CustomPopup show={popup.show} title={popup.title} message={popup.message} type={popup.type} onClose={() => setPopup((p) => ({ ...p, show: false }))} />

        {/* Modal Konfirmasi */}
        <Modal show={showModal} onHide={() => setShowModal(false)} centered>
          <Modal.Header closeButton>
            <Modal.Title className="h5 fw-bold">{modalType === "setuju" ? "Konfirmasi Persetujuan" : "Tolak Hasil Analisis"}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {modalType === "setuju" ? (
              <div>
                <p>Apakah Anda yakin hasil analisis ini sudah valid?</p>
                <p className="mb-0 text-muted small">
                  Dengan menyetujui, dokumen akan masuk ke tahap <strong>Tanda Tangan Digital</strong>.
                </p>
                {/* TABEL DETAIL ANALYSIS ITEMS */}
                {selectedBooking && Array.isArray(selectedBooking.analysis_items) && selectedBooking.analysis_items.length > 0 && (
                  <div className="mt-3">
                    <h6 className="fw-bold mb-2">Detail Analisis</h6>
                    <table className="table table-sm table-bordered">
                      <thead>
                        <tr>
                          <th>Nama Item</th>
                          <th>Harga Satuan</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBooking.analysis_items.map((item, idx) => {
                          const harga = priceMap[item.nama_item] || 0;
                          const jumlahSampel = Number(selectedBooking.jumlah_sampel) || 1;
                          return (
                            <tr key={idx}>
                              <td>{item.nama_item}</td>
                              <td>Rp {harga.toLocaleString("id-ID")}</td>
                              <td>Rp {(harga * jumlahSampel).toLocaleString("id-ID")}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <Form>
                <Form.Group>
                  <Form.Label className="fw-semibold">
                    Alasan Penolakan <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control as="textarea" rows={4} value={alasanTolak} onChange={(e) => setAlasanTolak(e.target.value)} placeholder="Jelaskan alasan mengapa hasil ini ditolak..." disabled={processing} className="bg-light" />
                  <Form.Text className="text-muted">Alasan ini akan dikirimkan kembali ke Koordinator/Teknisi.</Form.Text>
                </Form.Group>
              </Form>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={processing}>
              Batal
            </Button>
            {modalType === "setuju" ? (
              <Button variant="success" onClick={handleSetuju} disabled={processing} className="px-4">
                {processing ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : "Ya, Setujui"}
              </Button>
            ) : (
              <Button variant="danger" onClick={handleTolak} disabled={processing || !alasanTolak.trim()} className="px-4">
                {processing ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : "Kirim Penolakan"}
              </Button>
            )}
          </Modal.Footer>
        </Modal>
      </div>
    </NavbarLoginKepala>
  );
};

export default VerifikasiKepala;
