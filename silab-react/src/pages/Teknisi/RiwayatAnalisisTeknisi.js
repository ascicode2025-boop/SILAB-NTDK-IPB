import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, InputGroup, Form, Button, Modal } from "react-bootstrap";
import { Search, Hash, Beaker, Calendar as CalendarIcon, Eye, FileText, ChevronRight, User } from "lucide-react";
import { motion } from "framer-motion";
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import FooterSetelahLogin from "../FooterSetelahLogin";

// Helper tetap sama (logika tidak berubah)
function parseHasilToTable(namaItem, hasilString) {
  if (!hasilString) return [];
  const parts = hasilString.split(" | ");
  return parts.map((p) => {
    const codeMatch = p.match(/\[(.*?)\]/);
    const code = codeMatch ? codeMatch[1] : "-";
    let std = "",
      spl = "",
      input = "",
      hasil = "",
      unit = "",
      detail = "";
    if (p.includes("STD=") && p.includes("SPL=")) {
      std = (p.match(/STD=([\d.]+)/) || [])[1] || "";
      spl = (p.match(/SPL=([\d.]+)/) || [])[1] || "";
      hasil = (p.match(/HASIL=([\d.]+)/) || [])[1] || "";
      unit = (p.match(/HASIL=[\d.]+\s*([a-zA-Z%/]+)/) || [])[1] || "";
      return { code, std, spl, hasil, unit: unit && unit !== "(" ? unit : "" };
    } else if (p.includes("INPUT=") && p.includes("HASIL=")) {
      input = (p.match(/INPUT=([\d.]+)/) || [])[1] || "";
      hasil = (p.match(/HASIL=([\d.]+)/) || [])[1] || "";
      let unitMatch = p.match(/HASIL=[\d.]+\s*\(([^)]+)\)/);
      unit = unitMatch && unitMatch[1] ? unitMatch[1] : "";
      return { code, input, hasil, unit };
    } else if (p.includes("Lim:") && p.includes("%")) {
      detail = p.replace(/\[.*?\]:\s*/, "");
      return { code, detail };
    } else {
      return { code, raw: p };
    }
  });
}

const RiwayatAnalisisTeknisi = () => {
  useEffect(() => {
    document.title = "SILAB-NTDK - Riwayat Analisis Teknisi";
  }, []);

  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  const theme = {
    primary: "#8D766B",
    btnCokelat: "#9E8379",
    background: "#F8F9FA",
    textDark: "#2D3436",
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const apiBase = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${apiBase}/bookings/all`, { headers });
        const json = await res.json();
        if (json && json.success) {
          const filtered = (json.data || []).filter((item) => {
            if (item.status !== "selesai") return false;
            return item.analysis_items?.some((ai) => ai.hasil && ai.hasil.trim() !== "");
          });
          setData(filtered);
        }
      } catch (e) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filteredData = data.filter((item) => item.kode_batch?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <NavbarLoginTeknisi>
      <div style={{ backgroundColor: theme.background, minHeight: "100vh", padding: "60px 0" }}>
        <Container>
          {/* Header Section */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-5">
            <div className="d-flex align-items-center gap-2 mb-2">
              <div style={{ width: "30px", height: "3px", backgroundColor: theme.primary }}></div>
              <span className="text-uppercase fw-bold" style={{ color: theme.primary, fontSize: "12px", letterSpacing: "1px" }}>
                Technician Dashboard
              </span>
            </div>
            <h2 className="fw-bold" style={{ color: theme.textDark, fontSize: "2.2rem" }}>
              Riwayat Analisis Selesai
            </h2>
            <p className="text-muted">Pantau hasil validasi pengujian laboratorium yang telah tuntas.</p>
          </motion.div>

          {/* Table Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-sm" style={{ borderRadius: "24px", overflow: "hidden" }}>
              <Card.Header className="bg-white p-4 border-0">
                <Row className="g-3 align-items-center">
                  <Col md={5}>
                    <InputGroup className="bg-light border-0 px-3 py-1" style={{ borderRadius: "15px" }}>
                      <InputGroup.Text className="bg-transparent border-0 text-muted">
                        <Search size={18} />
                      </InputGroup.Text>
                      <Form.Control placeholder="Cari kode batch..." className="bg-transparent border-0 shadow-none" style={{ fontSize: "14px" }} onChange={(e) => setSearchTerm(e.target.value)} />
                    </InputGroup>
                  </Col>
                </Row>
              </Card.Header>

              <div className="table-responsive">
                <Table hover className="mb-0 custom-table">
                  <thead>
                    <tr>
                      <th className="ps-4">No</th>
                      <th>
                        <Hash size={14} className="me-1" /> Kode Batch
                      </th>
                      <th>
                        <Beaker size={14} className="me-1" /> Jenis Analisis
                      </th>
                      <th>
                        <CalendarIcon size={14} className="me-1" /> Tanggal Selesai
                      </th>
                      <th className="text-center">Status</th>
                      <th className="text-center pe-4">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="text-center py-5 text-muted">
                          Memuat data...
                        </td>
                      </tr>
                    ) : filteredData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-5 text-muted">
                          Tidak ada riwayat ditemukan.
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((item, idx) => (
                        <tr key={item.id}>
                          <td className="ps-4 text-muted">{idx + 1}</td>
                          <td className="fw-bold" style={{ color: theme.textDark }}>
                            {item.kode_batch || "-"}
                          </td>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: "250px" }}>
                              {item.analysis_items?.map((i) => i.jenis_analisis || i.nama_item || "-").join(", ")}
                            </div>
                          </td>
                          <td className="text-muted">{item.updated_at ? new Date(item.updated_at).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) : "-"}</td>
                          <td className="text-center">
                            <span style={{ backgroundColor: "#E3F9E5", color: "#1F922B", padding: "6px 14px", borderRadius: "8px", fontSize: "12px", fontWeight: "600" }}>Selesai</span>
                          </td>
                          <td className="text-center pe-4">
                            <div className="d-flex justify-content-center gap-2">
                              <Button
                                variant="light"
                                size="sm"
                                className="d-inline-flex align-items-center gap-2 rounded-pill px-3"
                                onClick={() => {
                                  setSelectedBooking(item);
                                  setShowModal(true);
                                }}
                              >
                                <Eye size={14} /> Detail
                              </Button>
                              {item.pdf_path && (
                                <Button
                                  as="a"
                                  href={`${process.env.REACT_APP_API_BASE_URL ? process.env.REACT_APP_API_BASE_URL.replace(/\/api$/, "") : "http://127.0.0.1:8000"}/storage/${item.pdf_path}`}
                                  target="_blank"
                                  className="btn-hasil-teknisi"
                                >
                                  Hasil <ChevronRight size={14} />
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
            </Card>
          </motion.div>
        </Container>

        {/* Modal Detail Analisis */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered className="custom-modal">
          <Modal.Header closeButton className="border-0 pb-0 px-4 pt-4">
            <Modal.Title className="fw-bold">Detail Laporan Analisis</Modal.Title>
          </Modal.Header>
          <Modal.Body className="p-4">
            {selectedBooking && (
              <>
                <div className="p-3 bg-light rounded-4 mb-4 border d-flex flex-wrap gap-4">
                  <div>
                    <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: "10px" }}>
                      Kode Batch
                    </small>
                    <span className="fw-bold text-primary">{selectedBooking.kode_batch}</span>
                  </div>
                  <div>
                    <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: "10px" }}>
                      Klien
                    </small>
                    <span className="fw-bold">
                      <User size={14} className="me-1" />
                      {selectedBooking.user?.full_name || "N/A"}
                    </span>
                  </div>
                  <div>
                    <small className="text-muted d-block text-uppercase fw-bold" style={{ fontSize: "10px" }}>
                      Selesai Pada
                    </small>
                    <span className="fw-bold">{new Date(selectedBooking.updated_at).toLocaleDateString("id-ID")}</span>
                  </div>
                </div>

                {selectedBooking.analysis_items?.map((ai, i) => (
                  <Card key={ai.id || i} className="border-0 shadow-sm mb-3" style={{ borderRadius: "15px", overflow: "hidden" }}>
                    <Card.Header className="bg-white fw-bold py-3 border-bottom d-flex align-items-center gap-2">
                      <div style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: theme.primary }}></div>
                      {ai.nama_item || ai.jenis_analisis}
                    </Card.Header>
                    <Card.Body>
                      {ai.hasil ? (
                        <div className="table-responsive rounded-3 border">
                          {/* Render tabel dinamis (Logika internal disederhanakan untuk tampilan) */}
                          <Table size="sm" className="mb-0">
                            {/* Konten tabel parsing Anda tetap ada di sini */}
                            <thead className="bg-light">
                              <tr style={{ fontSize: "12px" }}>
                                {ai.hasil.includes("STD=") ? (
                                  <>
                                    <th>Kode</th>
                                    <th>Abs Std</th>
                                    <th>Abs Sampel</th>
                                    <th>Hasil</th>
                                  </>
                                ) : (
                                  <>
                                    <th>Kode Sampel</th>
                                    <th>Data Analisis</th>
                                  </>
                                )}
                              </tr>
                            </thead>
                            <tbody style={{ fontSize: "13px" }}>
                              {parseHasilToTable(ai.nama_item, ai.hasil).map((row, idx) => (
                                <tr key={idx}>
                                  <td>{row.code}</td>
                                  {row.std ? (
                                    <>
                                      {<td>{row.std}</td>}
                                      <td>{row.spl}</td>
                                      <td>
                                        {row.hasil} {row.unit}
                                      </td>
                                    </>
                                  ) : (
                                    <td>{row.detail || row.hasil || row.raw}</td>
                                  )}
                                </tr>
                              ))}
                            </tbody>
                          </Table>
                        </div>
                      ) : (
                        <span className="text-muted italic small">Hasil belum diinputkan.</span>
                      )}
                      <div className="mt-2 text-muted" style={{ fontSize: "12px" }}>
                        Metode: <b>{ai.metode || "-"}</b>
                      </div>
                    </Card.Body>
                  </Card>
                ))}
              </>
            )}
          </Modal.Body>
        </Modal>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
          
          .custom-table {
            font-family: 'Inter', sans-serif;
            border-collapse: separate;
            border-spacing: 0;
          }

          .custom-table thead th {
            background-color: #FAFAFB;
            color: #636E72;
            font-weight: 600;
            text-transform: uppercase;
            font-size: 11px;
            letter-spacing: 0.5px;
            padding: 20px 15px;
            border-bottom: 1px solid #F1F2F6;
          }

          .custom-table tbody td {
            padding: 20px 15px;
            vertical-align: middle;
            font-size: 14px;
            border-bottom: 1px solid #F1F2F6;
          }

          .btn-hasil-teknisi {
            background-color: ${theme.btnCokelat};
            border: none;
            border-radius: 10px;
            padding: 6px 16px;
            font-size: 13px;
            font-weight: 600;
            color: white;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 6px;
            transition: 0.3s;
          }

          .btn-hasil-teknisi:hover {
            background-color: #8D766B;
            color: white;
            transform: translateY(-1px);
          }

          .custom-modal .modal-content {
            border-radius: 25px;
            border: none;
          }
        `}</style>
      </div>
      <FooterSetelahLogin />
    </NavbarLoginTeknisi>
  );
};

export default RiwayatAnalisisTeknisi;
