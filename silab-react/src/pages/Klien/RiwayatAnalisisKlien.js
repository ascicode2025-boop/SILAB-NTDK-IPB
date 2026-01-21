import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Button, Form, InputGroup } from "react-bootstrap";
import { Search, FileText, ChevronRight, Hash, Calendar as CalendarIcon, Beaker } from "lucide-react";
import { motion } from "framer-motion";
import "bootstrap/dist/css/bootstrap.min.css";
import NavbarLogin from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";

const RiwayatAnalisisKlien = () => {
  useEffect(() => {
    document.title = "SILAB-NTDK - Riwayat Analisis";
  }, []);

  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const apiBase = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8000/api";
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await fetch(`${apiBase}/bookings`, { headers });
        const json = await res.json();

        if (json && json.success) {
          const finished = (json.data || []).filter((b) => {
            const st = (b.status || "").toLowerCase();
            return ["selesai", "lunas", "paid", "ditandatangani", "verified"].includes(st);
          });

          setHistoryData(
            finished.map((b, idx) => {
              let jenisAnalisis = "-";
              if (b.analysis_items && b.analysis_items.length > 0) {
                jenisAnalisis = b.analysis_items.map((i) => i.nama_item || i.namaItem || "-").join(", ");
              }
              return {
                no: idx + 1,
                kode_batch: b.kode_batch || "-",
                jenis: jenisAnalisis,
                tanggal: b.updated_at
                  ? new Date(b.updated_at).toLocaleDateString("id-ID", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })
                  : "-",
                status: (b.status || "").toLowerCase(),
                pdf_path: b.pdf_path,
                id: b.id,
              };
            }),
          );
        }
      } catch (e) {
        setHistoryData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const theme = {
    primary: "#8D766B",
    btnCokelat: "#9E8379",
    background: "#F8F9FA",
    textDark: "#2D3436",
    textMuted: "#636E72",
  };

  const getStatusBadge = (status) => {
    const config = {
      lunas: { bg: "#E3F9E5", color: "#1F922B", label: "Lunas" },
      paid: { bg: "#E3F9E5", color: "#1F922B", label: "Lunas" },
      verified: { bg: "#E3F9E5", color: "#1F922B", label: "Terverifikasi" },
      ditandatangani: { bg: "#E1F5FE", color: "#0288D1", label: "Ditandatangani" },
      default: { bg: "#F3F0EF", color: "#8D766B", label: "Selesai" },
    };
    const style = config[status] || config.default;
    return (
      <span
        style={{
          backgroundColor: style.bg,
          color: style.color,
          padding: "6px 14px",
          borderRadius: "8px",
          fontSize: "12px",
          fontWeight: "600",
          display: "inline-block",
        }}
      >
        {style.label}
      </span>
    );
  };

  // Search filter function
  const getFilteredData = () => {
    return historyData.filter((item) => {
      return item.kode_batch.toLowerCase().includes(searchTerm.toLowerCase()) || item.jenis.toLowerCase().includes(searchTerm.toLowerCase());
    });
  };

  return (
    <NavbarLogin>
      <div style={{ backgroundColor: theme.background, minHeight: "100vh", padding: "60px 0" }}>
        <Container>
          {/* Header Section */}
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="mb-5">
            <div className="d-flex align-items-center gap-2 mb-2">
              <div style={{ width: "30px", height: "3px", backgroundColor: theme.primary }}></div>
              <span className="text-uppercase fw-bold" style={{ color: theme.primary, fontSize: "12px", letterSpacing: "1px" }}>
                Client Dashboard
              </span>
            </div>
            <h2 className="fw-bold" style={{ color: theme.textDark, fontSize: "2.2rem" }}>
              Riwayat Analisis
            </h2>
            <p style={{ color: theme.textMuted }}>Kelola dan unduh hasil sertifikat pengujian laboratorium Anda.</p>
          </motion.div>

          {/* Main Table Card */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-0 shadow-sm" style={{ borderRadius: "24px", overflow: "hidden" }}>
              <Card.Header className="bg-white p-4 border-0">
                <Row className="g-3 align-items-center">
                  <Col md={5}>
                    <InputGroup className="bg-light border-0 px-3 py-1" style={{ borderRadius: "15px" }}>
                      <InputGroup.Text className="bg-transparent border-0 text-muted">
                        <Search size={18} />
                      </InputGroup.Text>
                      <Form.Control placeholder="Cari berdasarkan kode batch atau jenis..." className="bg-transparent border-0 shadow-none" style={{ fontSize: "14px" }} onChange={(e) => setSearchTerm(e.target.value)} />
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
                        <td colSpan={6} className="text-center py-5">
                          Memuat data...
                        </td>
                      </tr>
                    ) : historyData.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-5">
                          Belum ada riwayat analisis.
                        </td>
                      </tr>
                    ) : getFilteredData().length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-5">
                          <div className="text-muted">
                            <Search size={40} className="mb-3 opacity-50" />
                            <p className="mb-2">Tidak ditemukan hasil</p>
                            <small>Coba ubah kata kunci pencarian Anda</small>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      getFilteredData().map((item, index) => (
                        <tr key={item.id}>
                          <td className="ps-4 text-muted">{index + 1}</td>
                          <td className="fw-bold" style={{ color: theme.textDark }}>
                            {item.kode_batch}
                          </td>
                          <td>
                            <div className="text-truncate" style={{ maxWidth: "250px" }}>
                              {item.jenis}
                            </div>
                          </td>
                          <td className="text-muted">{item.tanggal}</td>
                          <td className="text-center">{getStatusBadge(item.status)}</td>
                          <td className="text-center pe-4">
                            {item.pdf_path ? (
                              <Button
                                as="a"
                                href={`${process.env.REACT_APP_API_BASE_URL ? process.env.REACT_APP_API_BASE_URL.replace(/\/api$/, "") : "http://127.0.0.1:8000"}/storage/${item.pdf_path}`}
                                target="_blank"
                                className="btn-lihat-new"
                              >
                                <span>Hasil</span>
                                <ChevronRight size={16} />
                              </Button>
                            ) : (
                              <span className="text-muted small italic">Sertifikat diproses</span>
                            )}
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
            border-top: none;
            border-bottom: 1px solid #F1F2F6;
          }

          .custom-table tbody td {
            padding: 20px 15px;
            vertical-align: middle;
            font-size: 14px;
            border-bottom: 1px solid #F1F2F6;
            color: #2D3436;
          }

          .custom-table tbody tr:hover {
            background-color: #F8F9FA !important;
            transition: all 0.2s ease;
          }

          .btn-lihat-new {
            background-color: ${theme.btnCokelat};
            border: none;
            border-radius: 10px;
            padding: 8px 20px;
            font-size: 13px;
            font-weight: 600;
            color: white;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
            transition: all 0.3s ease;
            box-shadow: 0 4px 6px rgba(158, 131, 121, 0.2);
          }

          .btn-lihat-new:hover {
            background-color: #8D766B;
            color: white;
            transform: translateY(-2px);
            box-shadow: 0 6px 12px rgba(158, 131, 121, 0.3);
          }

          .btn-lihat-new:active {
            transform: translateY(0);
          }
        `}</style>
      </div>
      <FooterSetelahLogin />
    </NavbarLogin>
  );
};

export default RiwayatAnalisisKlien;
