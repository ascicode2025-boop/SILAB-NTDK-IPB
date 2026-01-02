import React, { useEffect, useState } from "react";
import { Table, Button, Spinner, Card, Badge, Container, Row, Col } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import NavbarLoginKepala from "./NavbarLoginKepala";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { getAllBookings, updateBookingStatus } from "../../services/BookingService";

const VerifikasiKepala = () => {
  const history = useHistory();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

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
      // Tampilkan item yang berpotensi membutuhkan verifikasi akhir kepala
      const filtered = all.filter((b) => {
        const st = (b.status || "").toLowerCase();
        return st === "menunggu_verifikasi" || st === "menunggu_ttd" || st === "menunggu_sign";
      });
      setBookings(filtered);
    } catch (err) {
      console.error("Gagal mengambil data booking (kepala):", err);
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleSetuju = async (item) => {
    try {
      setLoading(true);
      // Set status menjadi menunggu pembayaran
      await updateBookingStatus(item.id, { status: "menunggu_pembayaran" });
      fetchBookings();
    } catch (err) {
      console.error("Gagal verifikasi kepala:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <NavbarLoginKepala>
      <Container className="py-5" style={{ minHeight: "80vh" }}>
        <Row className="mb-4 align-items-center">
          <Col md={8}>
            <h3 className="fw-bold" style={{ color: "#45352F" }}>
              Verifikasi Akhir
            </h3>
            <p className="text-muted">Verifikasi akhir hasil analisis oleh Kepala.</p>
          </Col>
          <Col md={4} className="text-md-end">
            <Card className="border-0 shadow-sm bg-white p-2 text-center">
              <small className="text-uppercase fw-bold text-muted" style={{ fontSize: "10px" }}>
                Menunggu
              </small>
              <h4 className="mb-0 fw-bold" style={{ color: "#45352F" }}>
                {bookings.length}
              </h4>
            </Card>
          </Col>
        </Row>

        {loading ? (
          <div className="text-center py-5">
            <Spinner animation="border" variant="primary" />
            <p className="mt-2 text-muted">Mengambil data...</p>
          </div>
        ) : (
          <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: "15px" }}>
            <Table hover responsive className="mb-0 align-middle">
              <thead style={{ backgroundColor: "#f8f9fa", borderBottom: "2px solid #dee2e6" }}>
                <tr>
                  <th className="px-4 py-3" style={{ color: "#45352F" }}>
                    Kode Sampel
                  </th>
                  <th className="py-3" style={{ color: "#45352F" }}>
                    Jenis Analisis
                  </th>
                  <th className="py-3" style={{ color: "#45352F" }}>
                    Status
                  </th>
                  <th className="text-center py-3" style={{ color: "#45352F" }}>
                    Aksi
                  </th>
                </tr>
              </thead>
              <tbody>
                {bookings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-5">
                      <div className="text-muted my-3">
                        <p className="mb-0">Tidak ada laporan yang menunggu verifikasi akhir.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  bookings.map((item) => (
                    <tr key={item.id}>
                      <td className="px-4 fw-semibold text-primary" style={{ fontSize: "0.9rem" }}>
                        {parseKodeSampel(item.kode_sampel)}
                      </td>
                      <td className="text-secondary">{item.jenis_analisis || item.jenis || "-"}</td>
                      <td>
                        <Badge pill bg={item.status === "menunggu_verifikasi" ? "warning text-dark" : "info"} className="px-3 py-2 fw-medium">
                          {item.status?.replace("_", " ")}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <Button
                            variant="primary"
                            className="px-4 py-1 rounded-pill shadow-sm"
                            style={{ fontSize: "0.85rem", backgroundColor: "#45352F", borderColor: "#45352F" }}
                            onClick={() => history.push(`/kepala/dashboard/verifikasiKepala/lihatHasilPdfKepala/${item.id}`)}
                          >
                            Lihat Detail
                          </Button>
                          <Button variant="success" className="px-4 py-1 rounded-pill" onClick={() => handleSetuju(item)}>
                            Setuju
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
    </NavbarLoginKepala>
  );
};

export default VerifikasiKepala;
