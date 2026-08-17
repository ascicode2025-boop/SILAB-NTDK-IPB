import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, Modal } from "react-bootstrap";
import { FaChevronLeft, FaSave, FaPlus, FaTrashAlt } from "react-icons/fa";
import { useHistory, useLocation } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import NavbarLoginKlien from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";

const AVAILABLE_TOOLS = [
  "Mikropipet 20–200 µL",
  "Centrifuge",
  "Vortex Mixer",
  "Mikroskop",
  "Analytical Balance",
  "Water Bath",
  "Incubator",
];

const PengajuanPeminjamanAlat = () => {
  const history = useHistory();
  const location = useLocation();

  // Read stored user profile from localStorage
  const storedUser = JSON.parse(localStorage.getItem("user")) || {};
  const userIdentitas = {
    nama: storedUser.full_name || storedUser.name || "Nadine Maulia Fauzi",
    noTelp: storedUser.phone || storedUser.no_hp || storedUser.no_telp || "08xxxxxxxxxx",
    email: storedUser.email || "xxxx@gmail.com",
    institusi: storedUser.instansi || storedUser.institution || "IPB University",
  };

  // Get selected tool passed from DaftarAlat modal via state or search params
  const queryParams = new URLSearchParams(location.search);
  const toolFromState = location.state?.selectedTool || queryParams.get("alat") || "Mikropipet 20–200 µL";

  // Form State
  const [selectedTools, setSelectedTools] = useState([toolFromState]);
  const [tanggalPeminjaman, setTanggalPeminjaman] = useState("2026-07-02");
  const [tanggalPengembalian, setTanggalPengembalian] = useState("2026-07-08");
  const [tujuanPeminjaman, setTujuanPeminjaman] = useState("");
  const [kegiatanPenelitian, setKegiatanPenelitian] = useState("");
  const [dosenPenanggungJawab, setDosenPenanggungJawab] = useState("Prof. Yahdillah");
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    document.title = "SILAB-NTDK - Pengajuan Peminjaman Alat";
  }, []);

  // Update selected tools if user navigated from detail modal with a specific tool
  useEffect(() => {
    if (toolFromState && !selectedTools.includes(toolFromState)) {
      setSelectedTools([toolFromState]);
    }
  }, [toolFromState]);

  const handleToolChange = (index, value) => {
    const updated = [...selectedTools];
    updated[index] = value;
    setSelectedTools(updated);
  };

  const handleAddTool = () => {
    setSelectedTools([...selectedTools, AVAILABLE_TOOLS[0]]);
  };

  const handleRemoveTool = (index) => {
    if (selectedTools.length > 1) {
      setSelectedTools(selectedTools.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowConfirmModal(true);
  };

  const handleConfirmSubmit = () => {
    setShowConfirmModal(false);
    setSubmitSuccess(true);
    setTimeout(() => {
      setSubmitSuccess(false);
      history.push("/dashboard");
    }, 1800);
  };

  return (
    <NavbarLoginKlien>
      <Container
        fluid
        className="py-5 px-3 px-md-5"
        style={{
          minHeight: "100vh",
          backgroundColor: "#e9e9e9",
          fontFamily: "Poppins, sans-serif",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            width: "100%",
            maxWidth: "880px",
            backgroundColor: "#ffffff",
            borderRadius: "24px",
            overflow: "hidden",
            boxShadow: "0 15px 35px rgba(0, 0, 0, 0.12)",
          }}
        >
          {/* Header Banner (Dark Brown) */}
          <div
            className="text-center py-4 px-3"
            style={{
              backgroundColor: "#543D31",
              color: "#ffffff",
            }}
          >
            <h3 className="fw-bold mb-1" style={{ fontSize: "1.45rem", letterSpacing: "-0.2px" }}>
              Formulir Pengajuan Peminjaman Alat Analisis
            </h3>
            <p className="mb-0 opacity-85" style={{ fontSize: "0.92rem", color: "#F5EBE6" }}>
              Lengkapi data untuk syarat peminjaman
            </p>
          </div>

          {/* Form Content */}
          <Form onSubmit={handleSubmit} className="p-4 p-md-5">
            {submitSuccess && (
              <div className="alert alert-success rounded-4 text-center mb-4 fw-semibold">
                Pengajuan peminjaman alat berhasil disimpan! Mengarahkan ke Dashboard...
              </div>
            )}

            <Row className="g-4 mb-4">
              {/* Left Column: Identitasmu Box */}
              <Col xs={12} md={6}>
                <Card
                  className="border-0 shadow-sm h-100"
                  style={{
                    borderRadius: "18px",
                    overflow: "hidden",
                    border: "1px solid #E0E0E0",
                  }}
                >
                  {/* Identitas Header Badge */}
                  <div
                    className="text-center py-2 fw-semibold text-white"
                    style={{
                      backgroundColor: "#A6867B",
                      fontSize: "0.95rem",
                      letterSpacing: "0.3px",
                    }}
                  >
                    Identitasmu
                  </div>

                  <Card.Body className="p-4" style={{ backgroundColor: "#ffffff" }}>
                    <Row className="g-3">
                      <Col xs={6}>
                        <div className="text-muted small fw-medium">Nama Lengkap</div>
                        <div className="fw-bold text-dark" style={{ fontSize: "0.92rem" }}>
                          {userIdentitas.nama}
                        </div>
                      </Col>

                      <Col xs={6}>
                        <div className="text-muted small fw-medium">No. Telp</div>
                        <div className="fw-bold text-dark" style={{ fontSize: "0.92rem" }}>
                          {userIdentitas.noTelp}
                        </div>
                      </Col>

                      <Col xs={6}>
                        <div className="text-muted small fw-medium">Email</div>
                        <div className="fw-bold text-dark text-break" style={{ fontSize: "0.92rem" }}>
                          {userIdentitas.email}
                        </div>
                      </Col>

                      <Col xs={6}>
                        <div className="text-muted small fw-medium">Institusi</div>
                        <div className="fw-bold text-dark" style={{ fontSize: "0.92rem" }}>
                          {userIdentitas.institusi}
                        </div>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </Col>

              {/* Right Column: Alat Selector */}
              <Col xs={12} md={6}>
                <Form.Group className="h-100 d-flex flex-column justify-content-start">
                  <Form.Label className="fw-bold text-dark mb-2" style={{ fontSize: "1.05rem" }}>
                    Alat
                  </Form.Label>
                  <div className="d-flex flex-column gap-2">
                    {selectedTools.map((tool, index) => (
                      <div key={index} className="d-flex align-items-center gap-2">
                        <Form.Select
                          value={tool}
                          onChange={(e) => handleToolChange(index, e.target.value)}
                          style={{
                            backgroundColor: "#ECECEC",
                            border: "1px solid #D5D5D5",
                            borderRadius: "14px",
                            padding: "10px 16px",
                            fontSize: "0.92rem",
                            color: "#333333",
                            fontWeight: "500",
                            boxShadow: "none",
                          }}
                        >
                          {AVAILABLE_TOOLS.map((t) => (
                            <option key={t} value={t}>
                              {t}
                            </option>
                          ))}
                        </Form.Select>
                        {selectedTools.length > 1 && (
                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="rounded-circle p-2 d-flex align-items-center justify-content-center"
                            style={{ width: "36px", height: "36px", flexShrink: 0 }}
                            onClick={() => handleRemoveTool(index)}
                          >
                            <FaTrashAlt size={12} />
                          </Button>
                        )}
                      </div>
                    ))}

                    <Button
                      variant="link"
                      className="align-self-start text-decoration-none p-0 mt-1 fw-semibold"
                      style={{ color: "#8D6E63", fontSize: "0.85rem" }}
                      onClick={handleAddTool}
                    >
                      <FaPlus size={12} className="me-1" /> Tambah Alat Lain
                    </Button>
                  </div>
                </Form.Group>
              </Col>
            </Row>

            {/* Row 2: Tanggal Peminjaman & Tanggal Pengembalian */}
            <Row className="g-4 mb-4">
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold text-dark mb-2" style={{ fontSize: "1.05rem" }}>
                    Tanggal Peminjaman
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={tanggalPeminjaman}
                    onChange={(e) => setTanggalPeminjaman(e.target.value)}
                    style={{
                      backgroundColor: "#ECECEC",
                      border: "1px solid #D5D5D5",
                      borderRadius: "14px",
                      padding: "10px 16px",
                      fontSize: "0.92rem",
                      color: "#333333",
                      boxShadow: "none",
                    }}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold text-dark mb-2" style={{ fontSize: "1.05rem" }}>
                    Tanggal Pengembalian
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={tanggalPengembalian}
                    onChange={(e) => setTanggalPengembalian(e.target.value)}
                    style={{
                      backgroundColor: "#ECECEC",
                      border: "1px solid #D5D5D5",
                      borderRadius: "14px",
                      padding: "10px 16px",
                      fontSize: "0.92rem",
                      color: "#333333",
                      boxShadow: "none",
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Row 3: Tujuan Peminjaman & Kegiatan / Judul Penelitian */}
            <Row className="g-4 mb-4">
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold text-dark mb-2" style={{ fontSize: "1.05rem" }}>
                    Tujuan Peminjaman
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Berikan Alasan Peminjaman.."
                    value={tujuanPeminjaman}
                    onChange={(e) => setTujuanPeminjaman(e.target.value)}
                    style={{
                      backgroundColor: "#ECECEC",
                      border: "1px solid #D5D5D5",
                      borderRadius: "14px",
                      padding: "12px 16px",
                      fontSize: "0.92rem",
                      color: "#333333",
                      boxShadow: "none",
                      resize: "none",
                    }}
                  />
                </Form.Group>
              </Col>

              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold text-dark mb-2" style={{ fontSize: "1.05rem" }}>
                    Kegiatan / Judul Penelitian
                  </Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={2}
                    placeholder="Berikan Nama Kegiatan.."
                    value={kegiatanPenelitian}
                    onChange={(e) => setKegiatanPenelitian(e.target.value)}
                    style={{
                      backgroundColor: "#ECECEC",
                      border: "1px solid #D5D5D5",
                      borderRadius: "14px",
                      padding: "12px 16px",
                      fontSize: "0.92rem",
                      color: "#333333",
                      boxShadow: "none",
                      resize: "none",
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Row 4: Dosen / Penanggung Jawab */}
            <Row className="g-4 mb-4">
              <Col xs={12} md={6}>
                <Form.Group>
                  <Form.Label className="fw-bold text-dark mb-2" style={{ fontSize: "1.05rem" }}>
                    Dosen / Penanggung Jawab
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Prof. Yahdillah"
                    value={dosenPenanggungJawab}
                    onChange={(e) => setDosenPenanggungJawab(e.target.value)}
                    style={{
                      backgroundColor: "#ECECEC",
                      border: "1px solid #D5D5D5",
                      borderRadius: "14px",
                      padding: "10px 16px",
                      fontSize: "0.92rem",
                      color: "#333333",
                      boxShadow: "none",
                    }}
                  />
                </Form.Group>
              </Col>
            </Row>

            {/* Action Buttons */}
            <div className="d-flex justify-content-between align-items-center mt-5 pt-2">
              <Button
                variant="light"
                type="button"
                style={{
                  backgroundColor: "#CCCCCC",
                  borderColor: "#CCCCCC",
                  color: "#333333",
                  borderRadius: "30px",
                  padding: "10px 30px",
                  fontWeight: "600",
                  fontSize: "0.95rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 10px rgba(0,0,0,0.08)",
                }}
                onClick={() => history.goBack()}
              >
                <FaChevronLeft size={13} /> Kembali
              </Button>

              <Button
                type="submit"
                style={{
                  backgroundColor: "#543D31",
                  borderColor: "#543D31",
                  color: "#FFFFFF",
                  borderRadius: "30px",
                  padding: "10px 36px",
                  fontWeight: "600",
                  fontSize: "0.95rem",
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  boxShadow: "0 4px 12px rgba(84,61,49,0.3)",
                }}
              >
                <FaSave size={14} /> Simpan
              </Button>
            </div>
          </Form>
        </div>

        {/* Confirmation Modal Pop Up */}
        <Modal
          show={showConfirmModal}
          onHide={() => setShowConfirmModal(false)}
          centered
          dialogClassName="modal-confirm-custom"
        >
          <div
            className="p-4 p-md-5 text-center bg-white"
            style={{
              borderRadius: "28px",
              boxShadow: "0 20px 40px rgba(0, 0, 0, 0.15)",
            }}
          >
            <h4
              className="fw-bold mb-3"
              style={{
                color: "#1A1A1A",
                fontSize: "1.25rem",
                fontFamily: "Poppins, sans-serif",
              }}
            >
              Apakah data yang diberikan sudah sesuai?
            </h4>

            <p
              className="mb-4 mx-auto"
              style={{
                fontSize: "0.95rem",
                lineHeight: "1.6",
                maxWidth: "340px",
                color: "#4A4A4A",
              }}
            >
              Mohon lakukan crosscheck untuk menghindari kesalahan input data
            </p>

            <div className="d-flex justify-content-center gap-3 pt-2">
              <Button
                style={{
                  backgroundColor: "#DCDCDC",
                  borderColor: "#DCDCDC",
                  color: "#222222",
                  borderRadius: "30px",
                  padding: "10px 28px",
                  fontWeight: "600",
                  fontSize: "0.92rem",
                  boxShadow: "0 3px 8px rgba(0,0,0,0.08)",
                }}
                onClick={() => setShowConfirmModal(false)}
              >
                Cek kembali
              </Button>

              <Button
                style={{
                  backgroundColor: "#4E382C",
                  borderColor: "#4E382C",
                  color: "#FFFFFF",
                  borderRadius: "30px",
                  padding: "10px 28px",
                  fontWeight: "600",
                  fontSize: "0.92rem",
                  boxShadow: "0 4px 12px rgba(78,56,44,0.35)",
                }}
                onClick={handleConfirmSubmit}
              >
                Sudah, Ajukan
              </Button>
            </div>
          </div>
        </Modal>

        {/* Custom CSS for confirmation modal */}
        <style>{`
          .modal-confirm-custom {
            max-width: 440px !important;
            width: 92% !important;
            margin: 1.75rem auto !important;
          }
          .modal-confirm-custom .modal-content {
            border: none !important;
            background: transparent !important;
            border-radius: 28px !important;
            box-shadow: none !important;
          }
        `}</style>
      </Container>
      <FooterSetelahLogin />
    </NavbarLoginKlien>
  );
};

export default PengajuanPeminjamanAlat;
