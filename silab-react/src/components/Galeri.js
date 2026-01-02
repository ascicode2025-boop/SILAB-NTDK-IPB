import React from "react";
import { Container, Row, Col, Image } from "react-bootstrap";
import "../css/Galeri.css";
import Footer from "./Footer";

function Galeri() {
  const images = [
    { src: "/asset/Galeri_Landing_Page/galeriLandingPage1.png", text: "Laboratorium modern dengan teknologi terbaru" },
    { src: "/asset/Galeri_Landing_Page/galeriLandingPage6.png", text: "Proses analisis sampel yang cepat dan akurat" },
    { src: "/asset/Galeri_Landing_Page/galeriLandingPage2.png", text: "Layanan pemeriksaan lengkap untuk berbagai kebutuhan" },
    { src: "/asset/Galeri_Landing_Page/galeriLandingPage3.png", text: "Tenaga ahli profesional dan berpengalaman yang siap memberikan pelayanan terbaik." },
    { src: "/asset/Galeri_Landing_Page/galeriLandingPage5.png", text: "Standar kualitas internasional dalam setiap pengujian untuk akurasi data maksimal." },
    { src: "/asset/Galeri_Landing_Page/galeriLandingPage4.png", text: "Dilengkapi fasilitas laboratorium yang nyaman dan aman, mendukung kinerja optimal, serta memastikan keselamatan bagi semua pengguna." },
  ];

  return (
    <section className="gallery-section bg-light" id="galeri" style={{ fontFamily: "Poppins, sans-serif", paddingTop: "60px" }}>
      <Container>
        <div className="text-center mb-5 mt-4">
          <h2 className="gallery-title" style={{ color: "#45352F" }}>
            Selamat Datang di Galeri Divisi NTDK
          </h2>
          <p className="text-muted mt-2">Integritas dan Kualitas dalam Setiap Layanan</p>
        </div>

        {/* --- Bagian 1: Highlight Utama --- */}
        <Row className="justify-content-center mb-5 row-gap-mobile">
          <Col lg={10}>
            <div className="custom-card shadow-sm p-3 p-md-4">
              <Row className="align-items-center">
                <Col md={6} className="mb-3 mb-md-0">
                  <div className="img-wrapper shadow-sm">
                    <Image src={images[0].src} className="img-hover" style={{ height: "300px" }} alt="Lab" />
                  </div>
                </Col>
                <Col md={6}>
                  <div className="ps-md-3">
                    <h5 style={{ color: "#45352F", fontWeight: "600" }}>Fasilitas Kami</h5>
                    <p className="desc-text">{images[5].text}</p>
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>

        {/* --- Bagian 2: Grid 3 Kolom (Desktop) / Stacked (Mobile) --- */}
        <Row className="justify-content-center mb-5 g-4">
          <Col lg={10}>
            <Row>
              <Col md={4} className="mb-4">
                <div className="custom-card shadow-sm p-3">
                  <div className="img-wrapper mb-3">
                    <Image src={images[1].src} className="img-hover" style={{ height: "200px" }} />
                  </div>
                  <p className="desc-text text-center small mb-0">{images[1].text}</p>
                </div>
              </Col>
              <Col md={4} className="mb-4 d-flex align-items-center justify-content-center text-center">
                <div className="px-2">
                  <span style={{ fontSize: "3rem", color: "#45352F", opacity: "0.2", display: "block" }}>“</span>
                  <p className="fst-italic text-muted">Akurasi dan Kecepatan adalah Prioritas Kami.</p>
                </div>
              </Col>
              <Col md={4} className="mb-4">
                <div className="custom-card shadow-sm p-3">
                  <div className="img-wrapper mb-3">
                    <Image src={images[2].src} className="img-hover" style={{ height: "200px" }} />
                  </div>
                  <p className="desc-text text-center small mb-0">{images[2].text}</p>
                </div>
              </Col>
            </Row>
          </Col>
        </Row>

        {/* --- Bagian 3: Galeri Lebar --- */}
        <Row className="justify-content-center">
          <Col lg={12}>
            {[images[3], images[4]].map((item, index) => (
              <div key={index} className="wide-card-container mb-5">
                <div className="custom-card shadow-sm p-3">
                  <div className="img-wide-wrapper">
                    <Image src={item.src} className="img-wide" alt="Fasilitas NTDK" />
                  </div>
                  <div className="wide-desc mx-2">
                    <p className="mb-0">{item.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </Col>
        </Row>
      </Container>

      <Footer />
    </section>
  );
}

export default Galeri;
