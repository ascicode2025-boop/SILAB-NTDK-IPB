import React from "react";
import { Container, Row, Col, Card, Badge } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins/400.css";
import "@fontsource/poppins/600.css";
import "@fontsource/poppins/700.css";
import NavbarLogin from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";

function DaftarAnalisisLogin() {
  const dataAnalisis = {
    Metabolit: [
      { nama: "Analisis A", harga: "Rp 40.000", img: "/asset/daftarAnalisis/Rectangle19.png" },
      { nama: "Analisis B", harga: "Rp 50.000", img: "/asset/daftarAnalisis/Rectangle19.png" },
      { nama: "Analisis C", harga: "Rp 60.000", img: "/asset/daftarAnalisis/Rectangle19.png" },
      { nama: "Analisis D", harga: "Rp 70.000", img: "/asset/daftarAnalisis/Rectangle19.png" },
    ],
    Hematologi: [
      { nama: "Analisis Darah Lengkap", harga: "Rp 80.000", img: "/asset/daftarAnalisis/Rectangle19.png" },
      { nama: "Analisis Hemoglobin", harga: "Rp 55.000", img: "/asset/daftarAnalisis/Rectangle19.png" },
      { nama: "Analisis Eritrosit", harga: "Rp 60.000", img: "/asset/daftarAnalisis/Rectangle19.png" },
    ],
  };

  const CardAnalisis = ({ item, kategori }) => (
    <Col xs={12} sm={6} lg={3}>
      <Card
        className="h-100 border-0 shadow-sm"
        style={{
          borderRadius: "20px",
          overflow: "hidden",
          transition: "all 0.3s ease",
          backgroundColor: "#ffffff",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-8px)";
          e.currentTarget.style.boxShadow = "0 12px 24px rgba(0,0,0,0.1)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow = "0 4px 6px rgba(0,0,0,0.05)";
        }}
      >
        <div style={{ position: "relative" }}>
          <Card.Img
            variant="top"
            src={item.img}
            style={{ height: "180px", objectFit: "cover" }}
          />
          <Badge 
            bg="light" 
            text="dark" 
            className="position-absolute top-0 end-0 m-3 shadow-sm"
            style={{ borderRadius: "8px", fontWeight: "500", opacity: "0.9" }}
          >
            {kategori}
          </Badge>
        </div>
        <Card.Body className="p-4">
          <Card.Title 
            className="mb-2" 
            style={{ fontSize: "1.1rem", fontWeight: "700", color: "#2D3436" }}
          >
            {item.nama}
          </Card.Title>
          <Card.Text 
            style={{ 
              color: "#8D6E63", 
              fontSize: "1.15rem", 
              fontWeight: "600" 
            }}
          >
            {item.harga}
          </Card.Text>
        </Card.Body>
      </Card>
    </Col>
  );

  return (
    <NavbarLogin> 
      <Container style={{marginTop: "2rem"}}>
        <div className="mb-3 text-center text-md-start">
          <h2 className="fw-bold" style={{ color: "#45352F", fontSize: "2.5rem" }}>
            Daftar <span style={{ color: "#8D6E63" }}>Layanan Analisis</span>
          </h2>
          <p className="text-muted">Pilih jenis analisis laboratorium yang Anda butuhkan</p>
        </div>

        {Object.entries(dataAnalisis).map(([kategori, items]) => (
          <div key={kategori} className="mb-5">
            <div className="d-flex align-items-center mb-4">
              <div style={{ 
                width: "5px", 
                height: "30px", 
                backgroundColor: "#8D6E63", 
                borderRadius: "10px",
                marginRight: "15px" 
              }}></div>
              <h4 className="fw-bold m-0" style={{ color: "#4E342E" }}>
                Kategori {kategori}
              </h4>
            </div>
            
            <Row className="g-4">
              {items.map((item, idx) => (
                <CardAnalisis key={idx} item={item} kategori={kategori} />
              ))}
            </Row>
          </div>
        ))}
      </Container>
    <FooterSetelahLogin />
    </NavbarLogin>
  );
}

export default DaftarAnalisisLogin;