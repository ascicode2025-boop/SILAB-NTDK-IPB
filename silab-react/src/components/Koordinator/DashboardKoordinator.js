import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { FaFlask, FaClipboardCheck, FaCheckCircle, FaBell } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import NavbarLoginKoordinator from "./NavbarLoginKoordinator";
import "@fontsource/poppins";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { getAllBookings } from "../../services/BookingService";

const DashboardKoordinator = () => {
  const history = useHistory();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // INI NANTI DARI BACKEND / API (SEKARANG DUMMY)
  const [totalSampelMasukHariIni, setTotalSampelMasukHariIni] = useState(0);
  const [totalMenungguTTD, setTotalMenungguTTD] = useState(0);
  const [totalSampelSelesai, setTotalSampelSelesai] = useState(0);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  const fetchMetrics = async () => {
    try {
      setLoadingMetrics(true);
      const res = await getAllBookings();
      const all = res?.data || [];

      const today = new Date();
      const isSameDay = (dStr) => {
        if (!dStr) return false;
        const d = new Date(dStr);
        return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
      };

      const masukHariIni = all.filter((b) => isSameDay(b.tanggal_booking || b.created_at)).length;

      // Hitung menunggu TTD: terima kedua status umum yang mungkin dipakai
      const menungguTTD = all.filter((b) => b.status === "menunggu_ttd" || b.status === "menunggu_verifikasi").length;

      // Hitung selesai / sudah ditandatangani
      const selesai = all.filter((b) => b.status === "selesai" || b.status === "ditandatangani").length;

      setTotalSampelMasukHariIni(masukHariIni);
      setTotalMenungguTTD(menungguTTD);
      setTotalSampelSelesai(selesai);
    } catch (err) {
      console.error("Gagal mengambil metrik:", err);
    } finally {
      setLoadingMetrics(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, []);

  return (
    <NavbarLoginKoordinator>
      <div
        className="dashboard-page p-4"
        style={{
          fontFamily: "Poppins, sans-serif",
          backgroundColor: "#f1efed",
          minHeight: "70Vh",
        }}
      >
        <Container fluid>
          {/* HEADER */}
          <div className="p-4 mb-4 shadow-sm" style={{ backgroundColor: "#fff", borderRadius: 24 }}>
            <h4 className="fw-semibold mb-1" style={{ color: "#4e342e" }}>
              Selamat Datang, {user.name || "Koordinator"} 👋
            </h4>
            <p className="mb-0" style={{ color: "#7b6f6a" }}>
              Ringkasan aktivitas laboratorium hari ini
            </p>
          </div>

          {/* CARD 1 */}
          <Row className="mb-4">
            <Col md={4} className="mb-3">
              <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: 22 }}>
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <FaFlask size={30} className="me-3" color="#6d4c41" />
                    <div>
                      <Card.Title className="mb-0">{totalSampelMasukHariIni} Sampel Masuk</Card.Title>
                      <Card.Text style={{ color: "#8d6e63" }}>Sampel diterima hari ini</Card.Text>
                    </div>
                  </div>
                  <Button
                    className="mt-3 w-100"
                    style={{
                      backgroundColor: "#8d6e63",
                      border: "none",
                      borderRadius: 18,
                    }}
                  >
                    Lihat Detail
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            {/* CARD 2 */}
            <Col md={4} className="mb-3">
              <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: 22 }}>
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <FaClipboardCheck size={30} className="me-3" color="#6d4c41" />
                    <div>
                      <Card.Title className="mb-0">{loadingMetrics ? "..." : totalMenungguTTD} Menunggu TTD</Card.Title>
                      <Card.Text style={{ color: "#8d6e63" }}>Hasil belum ditandatangani</Card.Text>
                    </div>
                  </div>
                  <Button
                    className="mt-3 w-100"
                    style={{
                      backgroundColor: "#8d6e63",
                      border: "none",
                      borderRadius: 18,
                    }}
                    onClick={() => history.push("/koordinator/dashboard/verifikasiSampelKoordinator")}
                  >
                    Proses Sekarang
                  </Button>
                </Card.Body>
              </Card>
            </Col>

            {/* CARD 3 */}
            <Col md={4} className="mb-3">
              <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: 22 }}>
                <Card.Body>
                  <div className="d-flex align-items-center">
                    <FaCheckCircle size={30} className="me-3" color="#6d4c41" />
                    <div>
                      <Card.Title className="mb-0">{totalSampelSelesai} Sampel Selesai</Card.Title>
                      <Card.Text style={{ color: "#8d6e63" }}>Analisis telah selesai</Card.Text>
                    </div>
                  </div>
                  <Button
                    className="mt-3 w-100"
                    style={{
                      backgroundColor: "#8d6e63",
                      border: "none",
                      borderRadius: 18,
                    }}
                  >
                    Lihat Hasil
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* POP UP */}
          <Row>
            <Col md={12}>
              <Card
                className="border-0 shadow-sm"
                style={{
                  borderRadius: 26,
                  backgroundColor: "#d7ccc8",
                }}
              >
                <Card.Body className="d-flex justify-content-between align-items-center flex-wrap">
                  <div className="d-flex align-items-center">
                    <div
                      style={{
                        backgroundColor: "#fff",
                        padding: 14,
                        borderRadius: 18,
                      }}
                    >
                      <FaBell size={26} color="#6d4c41" />
                    </div>
                    <div className="ms-3">
                      <h6 className="fw-semibold mb-1">Sampel Baru Dikirim Hari Ini</h6>
                      <small style={{ color: "#5d4037" }}>Perlu verifikasi hasil analisis</small>
                    </div>
                  </div>

                  <Button
                    onClick={() => history.push("/koordinator/verifikasi")}
                    style={{
                      backgroundColor: "#8d6e63",
                      border: "none",
                      borderRadius: 20,
                      padding: "8px 22px",
                    }}
                  >
                    Verifikasi Sekarang
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
      <FooterSetelahLogin />
    </NavbarLoginKoordinator>
  );
};

export default DashboardKoordinator;
