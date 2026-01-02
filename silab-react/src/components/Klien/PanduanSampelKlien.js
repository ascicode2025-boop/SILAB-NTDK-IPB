import React from "react";
import { Container, Card, Row, Col } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins";
import FooterSetelahLogin from "../FooterSetelahLogin";
import NavbarLoginKlien from "./NavbarLoginKlien";

const PanduanSampelKlien = () => {
  const panduanSteps = [
    {
      title: "Persiapan Sampel",
      text: "Pastikan sampel telah dikemas dalam wadah steril yang tertutup rapat untuk menghindari kontaminasi selama perjalanan."
    },
    {
      title: "Labeling",
      text: "Berikan label yang jelas pada setiap botol/wadah sampel mencakup ID sampel, tanggal pengambilan, dan jenis analisis."
    },
    {
      title: "Suhu Penyimpanan",
      text: "Gunakan ice pack dan thermal bag jika sampel memerlukan suhu dingin (4-8°C) untuk menjaga stabilitas zat metabolit."
    },
    {
      title: "Dokumen Pendukung",
      text: "Sertakan formulir pemesanan yang telah dicetak dari sistem ini di dalam paket pengiriman Anda."
    }
  ];

  return (
    <NavbarLoginKlien>
      <Container
        fluid
        className="py-5"
        style={{ 
          minHeight: "100vh", 
          backgroundColor: "#f8f9fa",
          fontFamily: "Poppins, sans-serif" 
        }}
      >
        <Row className="justify-content-center">
          <Col lg={8} md={10}>
            {/* Header Section */}
            <div className="text-center mb-5">
              <h2 style={{ fontWeight: "700", color: "#4e342e" }}>Panduan Pengiriman Sampel</h2>
              <p className="text-muted">Ikuti langkah-langkah di bawah ini untuk memastikan sampel Anda diterima dalam kondisi baik</p>
              <div style={{ 
                width: "80px", 
                height: "5px", 
                backgroundColor: "#8D6E63", 
                margin: "0 auto", 
                borderRadius: "10px" 
              }}></div>
            </div>

            <Card
              className="border-0 shadow-sm p-4 p-md-5"
              style={{
                borderRadius: "25px",
                backgroundColor: "#ffffff",
              }}
            >
              {panduanSteps.map((step, index) => (
                <div key={index} className="d-flex mb-4 last-child-mb-0">
                  <div className="me-4">
                    <div 
                      className="d-flex align-items-center justify-content-center shadow-sm"
                      style={{
                        width: "45px",
                        height: "45px",
                        backgroundColor: "#8D6E63",
                        color: "white",
                        borderRadius: "12px",
                        fontWeight: "600",
                        fontSize: "1.2rem"
                      }}
                    >
                      {index + 1}
                    </div>
                    {index !== panduanSteps.length - 1 && (
                      <div style={{
                        width: "2px",
                        height: "100%",
                        backgroundColor: "#e0e0e0",
                        margin: "10px auto"
                      }}></div>
                    )}
                  </div>
                  <div className="pb-3">
                    <h5 style={{ fontWeight: "600", color: "#333" }}>{step.title}</h5>
                    <p style={{ textAlign: "justify", color: "#666", lineHeight: "1.6" }}>
                      {step.text} Lorem ipsum dolor sit amet, consectetur adipiscing elit. 
                      Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                  </div>
                </div>
              ))}

              <div 
                className="mt-4 p-4 text-center" 
                style={{ 
                  backgroundColor: "#efebe9", 
                  borderRadius: "15px", 
                  borderLeft: "5px solid #8D6E63" 
                }}
              >
                <p className="mb-0 italic" style={{ fontSize: "0.9rem", color: "#5d4037" }}>
                  <strong>Catatan Penting:</strong> Kerusakan sampel akibat pengemasan yang tidak standar di luar tanggung jawab laboratorium.
                </p>
              </div>
            </Card>
          </Col>
        </Row>
      </Container>
      <FooterSetelahLogin />
    </NavbarLoginKlien>
  );
};

export default PanduanSampelKlien;