import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card} from "react-bootstrap";
import Footer from "./Footer";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins";

function DaftarAnalisis() {
  const [groupedAnalisis, setGroupedAnalisis] = useState({});
  const API_URL = process.env.REACT_APP_API_BASE_URL;
  useEffect(() => {
    if (API_URL) {
      fetch(`${API_URL}/analysis-prices-grouped`)
        .then(res => res.json())
        .then(data => setGroupedAnalisis(data))
        .catch(err => console.error('Gagal mengambil daftar analisis:', err));
    }
  }, [API_URL]);

  const renderKategori = (title, data) => (
    <>
      <h4
        className="fw-bold mb-4 text-center text-md-start"
        style={{
          color: "#4E342E",
          marginTop: "3rem",
          marginLeft: "2rem",
          marginRight: "2rem",
        }}
      >
        {title}
      </h4>

      <Container className="py-2">
        <Row className="g-4 justify-content-center justify-content-md-start">
          {data.map((item, index) => (
            <Col key={index} xs={12} sm={6} md={4} lg={3}>
              <Card
                className="h-100 shadow-sm border-0 daftarAnalisis-card"
                style={{
                  background: "linear-gradient(160deg, #8D6E63, #8D6E63)",
                  borderRadius: "16px",
                  overflow: "hidden",
                  transition: "transform 0.3s ease, box-shadow 0.3s ease",
                  cursor: "pointer",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.03)";
                  e.currentTarget.style.boxShadow = "0 6px 20px rgba(0,0,0,0.2)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <Card.Img
                  variant="top"
                  src={"/asset/daftarAnalisis/Rectangle19.png"}
                  style={{
                    objectFit: "cover",
                    height: "180px",
                  }}
                />
                <Card.Body className="text-white">
                  <Card.Title style={{ fontSize: "1rem", fontWeight: "600" }}>
                    {item.jenis_analisis}
                  </Card.Title>
                  <Card.Text style={{ fontSize: "0.9rem" }}>Rp. {item.harga.toLocaleString('id-ID')}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>
    </>
  );

  return (
    <>
      <section
        id="daftarAnalisis"
        style={{
          fontFamily: "Poppins, sans-serif",
          backgroundColor: "#FAF7F5",
          padding: "50px 0 0 0",
        }}
      >
        {/* Render semua kategori dari API */}
        {Object.keys(groupedAnalisis).length === 0 ? (
          <div className="text-center">Memuat daftar analisis...</div>
        ) : (
          Object.entries(groupedAnalisis).map(([kategori, data]) => renderKategori(kategori, data))
        )}
      </section>

      {/* ✅ Footer dipanggil di bawah halaman */}
      <Footer />
    </>
  );
}

export default DaftarAnalisis;
