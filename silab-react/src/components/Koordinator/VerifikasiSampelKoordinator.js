import React, { useEffect, useState } from "react";
import { Table, Button, Spinner, Card, Container, Row, Col } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import { getAllBookings, updateBookingStatus } from "../../services/BookingService";
import NavbarLoginKoordinator from "./NavbarLoginKoordinator";
import FooterSetelahLogin from "../FooterSetelahLogin";

const VerifikasiSampelKoordinator = () => {
  const history = useHistory();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Warna custom sesuai gambar referensi
  const customColors = {
    brown: '#a3867a',
    textDark: '#45352F',
    lightGray: '#f4f4f4'
  };

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
      const filtered = all.filter((b) => b.status === "menunggu_verifikasi" || b.status === "menunggu_ttd" || b.status === "menunggu_sign");
      setBookings(filtered);
    } catch (err) {
      console.error("Gagal mengambil data booking:", err);
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
      await updateBookingStatus(item.id, { status: 'menunggu_verifikasi' });
      setBookings((prev) => prev.filter((b) => b.id !== item.id));
    } catch (err) {
      console.error('Gagal setuju:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <NavbarLoginKoordinator>
      <div style={{ backgroundColor: "#e9ecef", minHeight: "100vh" }}>
        <Container className="py-5">
          <Card className="border-0 shadow-sm" style={{ borderRadius: "20px", overflow: "hidden" }}>
            
            {/* Header - Disamakan dengan gambar referensi */}
            <div 
              className="card-header border-0 py-3" 
              style={{ 
                backgroundColor: customColors.brown, 
                color: 'white',
                borderBottomRightRadius: '50px',
                paddingLeft: '30px'
              }}
            >
              <h4 className="mb-0 fw-normal" style={{ fontFamily: 'serif' }}>Tanda Tangan Digital</h4>
            </div>

            <div className="card-body p-4 p-md-5 bg-white">
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" style={{ color: customColors.brown }} />
                  <p className="mt-2 text-muted">Mengambil data...</p>
                </div>
              ) : (
                <>
                  <div className="table-responsive">
                    <Table bordered hover className="align-middle text-center mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="py-3 fw-bold">Kode Sampel</th>
                          <th className="py-3 fw-bold">Jenis Analisis</th>
                          <th className="py-3 fw-bold">Tanggal</th>
                          <th className="py-3 fw-bold">Status</th>
                          <th className="py-3 fw-bold">Aksi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {bookings.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="py-5 text-muted">
                              Tidak ada sampel yang menunggu verifikasi saat ini.
                            </td>
                          </tr>
                        ) : (
                          bookings.map((item) => (
                            <tr key={item.id}>
                              <td className="py-3 fw-medium">{parseKodeSampel(item.kode_sampel)}</td>
                              <td className="py-3">{item.jenis_analisis || item.jenis || "-"}</td>
                              <td className="py-3">{item.tanggal || "5/11/2025"}</td>
                              <td className="py-3 text-secondary" style={{ fontSize: "0.9rem" }}>
                                {item.status === "menunggu_verifikasi" ? "Menunggu Verifikasi" : "Menunggu Tanda Tangan"}
                              </td>
                              <td className="py-3">
                                <div className="d-flex justify-content-center gap-2">
                                  <Button
                                    className="px-4 border-0 shadow-sm"
                                    style={{ 
                                      backgroundColor: customColors.brown, 
                                      borderRadius: "20px",
                                      fontSize: "0.85rem"
                                    }}
                                    onClick={() => history.push(`/koordinator/dashboard/verifikasiSampelKoordinator/lihatHasilPdfKoordinator/${item.id}`)}
                                  >
                                    Download
                                  </Button>
                                  {item.status === 'menunggu_verifikasi' && (
                                    <Button
                                      variant="success"
                                      className="px-4 rounded-pill shadow-sm"
                                      style={{ fontSize: "0.85rem" }}
                                      onClick={() => handleSetuju(item)}
                                    >
                                      Setuju
                                    </Button>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>

                  {/* Tombol tambahan sesuai gambar */}
                  <div className="mt-4">
                    <Button 
                      className="border-0 px-4 py-2 shadow" 
                      style={{ backgroundColor: customColors.brown, borderRadius: '25px' }}
                    >
                      Upload PDF
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>
        </Container>
        <FooterSetelahLogin />
      </div>
    </NavbarLoginKoordinator>
  );
};

export default VerifikasiSampelKoordinator;