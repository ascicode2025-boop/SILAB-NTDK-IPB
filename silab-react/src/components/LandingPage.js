import React, { useState, useEffect } from "react"; // <-- 'useEffect' DITAMBAHKAN
import axios from "axios"; // <-- INI DITAMBAHKAN
import { Carousel, Container, Row, Col, Image, Card, Button } from "react-bootstrap";
import { useHistory } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "./LandingPage.css";
import "@fontsource/poppins";
import Footer from "./Footer";

// --- MULAI KODE TES KONEKSI ---

// Karena Anda pakai 'npm start' (CRA), gunakan process.env
// Pastikan file .env.local Anda berisi:
// REACT_APP_API_BASE_URL=http://silab-ntdk.test/api
const API_URL = process.env.REACT_APP_API_BASE_URL;

// --- SELESAI KODE TES KONEKSI ---

function LandingPage() {
  const history = useHistory();

  // --- INI BAGIAN YANG DIPERBAIKI ---
  useEffect(() => {
    // Cek jika .env.local belum diatur
    if (!API_URL) {
      console.error("PERHATIAN: REACT_APP_API_BASE_URL belum diatur di file .env.local");
    } else {
      // PERBAIKAN: Kita panggil rute /hello (bukan /laboratories)
      axios
        .get(`${API_URL}/hello`)
        .then((response) => {
          // PERBAIKAN: Kita tampilkan response.data.message (bukan response.data)
          console.log("DARI API LARAVEL (Tes /hello):", response.data.message);
        })
        .catch((error) => {
          // Jika gagal, tampilkan error
          console.error("GAGAL TERHUBUNG KE API:", error);
        });
    }
  }, []); // [] berarti hanya jalan sekali saat komponen dimuat
  // --- BATAS PERBAIKAN ---

  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  const images = ["/asset/galeri1.jpg", "/asset/galeri2.jpg", "/asset/galeri3.jpg", "/asset/galeri4.jpg", "/asset/galeri5.jpg", "/asset/galeri6.jpg"];

  const daftarAnalisis = [
    { kategori: "Metabolit", nama: "Nama Analisis", harga: "Rp. 40.000", img: "/daftarAnalisis/Rectangle19.png" },
    { kategori: "Metabolit", nama: "Nama Analisis", harga: "Rp. 50.000", img: "/daftarAnalisis/Rectangle19.png" },
    { kategori: "Metabolit", nama: "Nama Analisis", harga: "Rp. 50.000", img: "/daftarAnalisis/Rectangle19.png" },
    { kategori: "Metabolit", nama: "Nama Analisis", harga: "Rp. 50.000", img: "/daftarAnalisis/Rectangle19.png" },
  ];

  return (
    <>
      {/* =======================
          BAGIAN SLIDER / CAROUSEL
      ======================= */}
      <section id="beranda" style={{ textAlign: "center", maxHeight: "1000vh" }}>
        <Carousel activeIndex={index} onSelect={handleSelect} fade interval={2000} indicators={false}>
          <Carousel.Item>
            <img className="d-block w-100" src="/asset/Slider1.jpg" alt="Slide 1" style={{ maxHeight: "100vh", objectFit: "cover" }} />
          </Carousel.Item>

          <Carousel.Item>
            <img className="d-block w-100" src="/asset/Slider2.jpg" alt="Slide 2" style={{ maxHeight: "100vh", objectFit: "cover" }} />
          </Carousel.Item>
        </Carousel>

        <div className="carousel-custom-indicators">
          {[0, 1].map((i) => (
            <span key={i} className={`indicator-dot ${index === i ? "active" : ""}`} onClick={() => setIndex(i)}></span>
          ))}
        </div>

        {/* =======================
          BAGIAN GALERI FOTO
      ======================= */}

        <h4 id="galeriHeader" className="text-center mb-5 gallery-title" style={{ marginTop: "4rem", fontFamily: "Poppins, sans-serif", padding: "1.5rem" }}>
          Galeri Departemen INTP
        </h4>
        <section id="galeri" className="gallery-section shadow-sm" style={{ backgroundColor: "#7a6259ff", paddingBottom: "30px" }}>
          <Container>
            <Row className="g-4">
              {images.map((src, index) => (
                <Col key={index} md={4} sm={6} xs={12} className="d-flex justify-content-center">
                  <div className="gallery-image-wrapper">
                    <Image src={src} alt={`Galeri ${index + 1}`} className="gallery-image" fluid style={{ marginTop: "3rem", borderRadius: "20px" }} />
                  </div>
                </Col>
              ))}
            </Row>
          </Container>
        </section>

        {/* =======================
     BAGIAN Daftar Harga
    ======================= */}
        <h4 className="text-center mb-5 gallery-title" style={{ marginTop: "9rem", fontFamily: "Poppins, sans-serif" }}>
          Daftar Jenis dan Biaya
        </h4>

        <Container className="py-4">
          <Row className="g-4 justify-content-start">
            {daftarAnalisis.map((item, index) => (
              <Col key={index} xs={12} sm={6} md={4} lg={3}>
                <Card
                  className="h-100 text-center shadow-sm daftarAnalisis-card"
                  style={{
                    backgroundColor: "#8D6E63",
                    fontSize: "15px",
                  }}
                >
                  <Card.Img variant="top" src={item.img} className="img-fluid" />
                  <Card.Body>
                    <Card.Title className="text-white">{item.nama}</Card.Title>
                    <Card.Text className="text-white">{item.harga}</Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>

        <div className="d-flex justify-content-end" id="buttonAnalisis">
          <Button
            variant="light"
            className="px-4"
            style={{
              backgroundColor: "#45352F",
              color: "#F2F2F2",
              borderRadius: "5px",
              fontSize: "0.75rem",
              fontWeight: "500",
              marginRight: "5rem"
            }}
            onClick={() => {
              history.push("/daftarAnalisis");
              window.scrollTo(0, 0);
            }}
          >
            Lihat Lebih Banyak
          </Button>
        </div>

        {/* =======================
     BAGIAN Footer
======================= */}
        <Footer />
      </section>
    </>
  );
}

export default LandingPage;
