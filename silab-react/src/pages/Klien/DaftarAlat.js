import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Form, Button, InputGroup, Modal } from "react-bootstrap";
import { FaSearch, FaTools, FaCalendarAlt } from "react-icons/fa";
import { useHistory } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import NavbarLoginKlien from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";
import DaftarAlatComponent, { LabBannerSVG, INITIAL_TOOLS } from "../../components/DaftarAlat/DaftarAlatComponent";

const DaftarAlat = () => {
  const history = useHistory();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTool, setSelectedTool] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    document.title = "SILAB-NTDK - Daftar Alat Analisis";
  }, []);

  const handleOpenModal = (tool) => {
    setSelectedTool(tool);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedTool(null);
  };

  const handleAjukanPeminjaman = () => {
    const toolName = selectedTool ? selectedTool.nama : "";
    handleCloseModal();
    history.push({
      pathname: "/dashboard/pengajuanPeminjaman",
      state: { selectedTool: toolName },
      search: toolName ? `?alat=${encodeURIComponent(toolName)}` : "",
    });
  };

  const filteredTools = INITIAL_TOOLS.filter(
    (tool) =>
      tool.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.ringkasan.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.deskripsi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tool.kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <NavbarLoginKlien>
      <Container
        fluid
        className="py-4 px-3 px-md-5"
        style={{
          minHeight: "100vh",
          backgroundColor: "#fafafa",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        {/* Header Title Section */}
        <div className="mb-4">
          <div
            style={{
              width: "45px",
              height: "4px",
              backgroundColor: "#8D6E63",
              borderRadius: "2px",
              marginBottom: "8px",
            }}
          />
          <span
            className="fw-semibold text-uppercase"
            style={{
              color: "#8D6E63",
              fontSize: "0.8rem",
              letterSpacing: "1.2px",
            }}
          >
            SILAB-NTDK SYSTEM
          </span>
          <h2
            className="fw-bold text-dark mt-1 mb-1"
            style={{
              fontSize: "2rem",
              color: "#2D3436",
            }}
          >
            Daftar Alat-Alat Analisis
          </h2>
          <p className="text-muted mb-0" style={{ fontSize: "0.95rem" }}>
            Klik Alat untuk melihat detail ketersediaan.
          </p>
        </div>

        {/* Search Bar */}
        <Row className="mb-4">
          <Col xs={12} sm={8} md={6} lg={4}>
            <Form onSubmit={(e) => e.preventDefault()}>
              <InputGroup className="shadow-sm rounded-pill overflow-hidden bg-white">
                <Form.Control
                  type="text"
                  placeholder="Cari alat.."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{
                    border: "none",
                    paddingLeft: "20px",
                    paddingTop: "10px",
                    paddingBottom: "10px",
                    fontSize: "0.95rem",
                    boxShadow: "none",
                  }}
                />
                <Button
                  variant="custom"
                  type="button"
                  style={{
                    backgroundColor: "#8D6E63",
                    color: "#ffffff",
                    border: "none",
                    paddingLeft: "22px",
                    paddingRight: "25px",
                    fontWeight: "600",
                    fontSize: "0.95rem",
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <FaSearch size={14} /> Cari
                </Button>
              </InputGroup>
            </Form>
          </Col>
        </Row>

        {/* Equipment Cards Grid */}
        <Row className="g-4 mb-5">
          {filteredTools.length > 0 ? (
            filteredTools.map((tool) => (
              <DaftarAlatComponent key={tool.id} tool={tool} onClick={handleOpenModal} />
            ))
          ) : (
            <Col xs={12}>
              <div className="text-center py-5 bg-white rounded-4 shadow-sm">
                <FaTools size={48} className="text-muted mb-3" />
                <h5 className="fw-semibold text-secondary">Alat tidak ditemukan</h5>
                <p className="text-muted">Coba kata kunci pencarian yang lain.</p>
              </div>
            </Col>
          )}
        </Row>

        {/* Modal Detail Ketersediaan Alat (Matches Uploaded Screenshot UI) */}
        <Modal
          show={showModal}
          onHide={handleCloseModal}
          centered
          dialogClassName="modal-custom-detail"
        >
          {selectedTool && (
            <div
              style={{
                backgroundColor: "#ffffff",
                borderRadius: "24px",
                overflow: "hidden",
                boxShadow: "0 20px 40px rgba(0, 0, 0, 0.18)",
              }}
            >
              {/* Top Banner Illustration */}
              <LabBannerSVG height="165px" />

              {/* Modal Inner Content */}
              <div className="px-4 pt-3 pb-4 text-center">
                {/* Equipment Title */}
                <h3
                  className="fw-bold mb-2"
                  style={{
                    color: "#3E2723",
                    fontFamily: "Poppins, sans-serif",
                    fontSize: "1.35rem",
                    letterSpacing: "-0.3px",
                  }}
                >
                  {selectedTool.nama}
                </h3>

                {/* Status Badge & Unit Count */}
                <div className="d-flex align-items-center justify-content-center gap-2 mb-3">
                  <span
                    className="px-3 py-1 fw-bold"
                    style={{
                      backgroundColor: "#A8E6CF",
                      color: "#1E5E27",
                      borderRadius: "20px",
                      fontSize: "0.8rem",
                    }}
                  >
                    {selectedTool.status}
                  </span>
                  <span
                    style={{
                      color: "#8D6E63",
                      fontSize: "0.85rem",
                      fontWeight: "700",
                    }}
                  >
                    – {selectedTool.jumlah} Unit
                  </span>
                </div>

                {/* Two Columns: Lokasi & Kategori */}
                <Row className="mb-3 text-center">
                  <Col xs={6}>
                    <div className="fw-bold mb-1" style={{ color: "#3E2723", fontSize: "0.9rem" }}>
                      Lokasi
                    </div>
                    <div className="text-secondary" style={{ fontSize: "0.82rem" }}>
                      {selectedTool.lokasi}
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div className="fw-bold mb-1" style={{ color: "#3E2723", fontSize: "0.9rem" }}>
                      Kategori
                    </div>
                    <div className="text-secondary" style={{ fontSize: "0.82rem" }}>
                      {selectedTool.kategori}
                    </div>
                  </Col>
                </Row>

                {/* Deskripsi Section */}
                <div className="mb-4">
                  <div className="fw-bold mb-1" style={{ color: "#3E2723", fontSize: "0.9rem" }}>
                    Deskripsi
                  </div>
                  <p
                    className="mb-0 px-2"
                    style={{
                      color: "#5D4037",
                      fontSize: "0.82rem",
                      lineHeight: "1.5",
                      textAlign: "center",
                    }}
                  >
                    {selectedTool.deskripsi}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="d-flex justify-content-center gap-3 pt-1">
                  <Button
                    style={{
                      backgroundColor: "#9E9E9E",
                      borderColor: "#9E9E9E",
                      color: "#FFFFFF",
                      borderRadius: "28px",
                      padding: "8px 28px",
                      fontWeight: "600",
                      fontSize: "0.86rem",
                      boxShadow: "0 3px 8px rgba(0,0,0,0.12)",
                    }}
                    onClick={handleCloseModal}
                  >
                    Tutup
                  </Button>
                  <Button
                    style={{
                      backgroundColor: "#A6867B",
                      borderColor: "#A6867B",
                      color: "#FFFFFF",
                      borderRadius: "28px",
                      padding: "8px 22px",
                      fontWeight: "600",
                      fontSize: "0.86rem",
                      boxShadow: "0 3px 8px rgba(166,134,123,0.35)",
                    }}
                    onClick={handleAjukanPeminjaman}
                  >
                    Ajukan Peminjaman
                  </Button>
                </div>
              </div>
            </div>
          )}
        </Modal>

        {/* Custom CSS for modal width, centering, and downward position */}
        <style>{`
          .modal-custom-detail {
            max-width: 400px !important;
            width: 92% !important;
            margin: 1.75rem auto !important;
            transform: translateY(57px) !important;
          }
          .modal-custom-detail .modal-content {
            border: none !important;
            background: transparent !important;
            border-radius: 24px !important;
            box-shadow: none !important;
          }
        `}</style>
      </Container>
      <FooterSetelahLogin />
    </NavbarLoginKlien>
  );
};

export default DaftarAlat;
