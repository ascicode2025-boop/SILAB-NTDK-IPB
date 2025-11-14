import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins";

function DaftarAnalisisLogin() {
  const Metabolit = [
    { kategori: "Metabolit", nama: "Analisis A", harga: "Rp. 40.000", img: "/daftarAnalisis/Rectangle19.png" },
    { kategori: "Metabolit", nama: "Analisis B", harga: "Rp. 50.000", img: "/daftarAnalisis/Rectangle19.png" },
    { kategori: "Metabolit", nama: "Analisis C", harga: "Rp. 60.000", img: "/daftarAnalisis/Rectangle19.png" },
    { kategori: "Metabolit", nama: "Analisis D", harga: "Rp. 70.000", img: "/daftarAnalisis/Rectangle19.png" },
  ];

  const Hematologi = [
    { kategori: "Hematologi", nama: "Analisis Darah Lengkap", harga: "Rp. 80.000", img: "/daftarAnalisis/Rectangle19.png" },
    { kategori: "Hematologi", nama: "Analisis Hemoglobin", harga: "Rp. 55.000", img: "/daftarAnalisis/Rectangle19.png" },
    { kategori: "Hematologi", nama: "Analisis Eritrosit", harga: "Rp. 60.000", img: "/daftarAnalisis/Rectangle19.png" },
  ];

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
                  src={item.img}
                  style={{
                    objectFit: "cover",
                    height: "180px",
                  }}
                />
                <Card.Body className="text-white">
                  <Card.Title style={{ fontSize: "1rem", fontWeight: "600" }}>
                    {item.nama}
                  </Card.Title>
                  <Card.Text style={{ fontSize: "0.9rem" }}>{item.harga}</Card.Text>
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
        <span className="fw-medium" style={{fontSize: "2rem", color: "#45352F"}}>Daftar Harga: </span>
        {/* Kategori Metabolit */}
        {renderKategori("Metabolit", Metabolit)}

        {/* Kategori Hematologi */}
        {renderKategori("Hematologi", Hematologi)}
      </section>
    </>
  );
}

export default DaftarAnalisisLogin;
