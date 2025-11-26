import React from "react";
import { Container, Row, Col, Image } from "react-bootstrap";
import "../css/Galeri.css"; // Pastikan file CSS ini ada dan berisi style tambahan
import Footer from "./Footer";


function Galeri() {
  const images = [
    {
      // Gambar 1: Ruangan/Kantor (Atas Kiri)
      src: "/asset/Galeri_Landing_Page/galeriLandingPage1.png",
      text: "Laboratorium modern dengan teknologi terbaru",
    },
    {
      // Gambar 2: Grup Foto Kiri (Tengah Kiri)
      src: "/asset/Galeri_Landing_Page/galeriLandingPage6.png",
      text: "Proses analisis sampel yang cepat dan akurat",
    },
    {
      // Gambar 3: Grup Foto Kanan (Tengah Kanan)
      src: "/asset/Galeri_Landing_Page/galeriLandingPage2.png",
      text: "Layanan pemeriksaan lengkap untuk berbagai kebutuhan",
    },
    {
      // Gambar 4: Meja Peralatan (Lebar Tengah)
      src: "/asset/Galeri_Landing_Page/galeriLandingPage3.png",
      text: "Tenaga ahli profesional dan berpengalaman. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    },
    {
      // Gambar 5: Pabrik/Produksi (Lebar Bawah)
      src: "/asset/Galeri_Landing_Page/galeriLandingPage5.png",
      text: "Standar kualitas internasional dalam setiap pengujian. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    },
    {
      // Teks 1: Keterangan (Atas Kanan)
      src: "/asset/Galeri_Landing_Page/galeriLandingPage4.png", // Gambar ini tidak digunakan di baris 1
      text: "Dilengkapi fasilitas laboratorium yang nyaman dan aman, mendukung kinerja optimal, serta memastikan keselamatan bagi semua pengguna. Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.",
    },
  ];

  // Teks Dummy untuk Bagian yang tidak memiliki data dalam array images
  const dummyText = "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s.";


  return (
    <section className="gallery-section bg-light" id="galeri" style={{ fontFamily: "Poppins, sans-serif", padding: "50px 0 0 0" }}>
      <Container>
        <h4
          className="text-center mb-5 gallery-title"
          style={{ marginTop: "1rem", color: "#45352F" }}
        >
          Selamat Datang di Galeri Divisi NTDK
        </h4>

        {/* ================= BARIS 1: Gambar Kiri & Teks Kanan ================= */}
        <Row className="justify-content-center mb-5">
          <Col md={10} sm={12}>
            <div className="content-box p-3 p-md-4">
              <Row className="align-items-center">
                <Col md={6} className="mb-3 mb-md-0 d-flex justify-content-center">
                  <div className="gallery-image-wrapper">
                    {/* Gambar Ruangan/Kantor */}
                    <Image src={images[0].src} className="gallery-image shadow-sm" style={{ maxHeight: '350px' }} />
                  </div>
                </Col>
                <Col md={6} className="gallery-description">
                  {/* Teks Keterangan Atas Kanan */}
                  <p>{images[5].text}</p>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>
        
        {/* ================= BARIS 2: Gambar Kiri, Teks Tengah, Gambar Kanan ================= */}
        <Row className="justify-content-center mb-5">
          <Col md={10} sm={12}>
            <div className="content-box p-3 p-md-4">
              <Row className="align-items-center">
                {/* Kolom Kiri: Gambar Grup Kiri */}
                <Col md={4} className="mb-3 mb-md-0 d-flex justify-content-center">
                  <div className="gallery-image-wrapper">
                    <Image src={images[1].src} className="gallery-image shadow-sm" style={{ maxHeight: '250px' }} />
                  </div>
                </Col>
                {/* Kolom Tengah: Teks */}
                <Col md={4} className="gallery-description text-center mb-3 mb-md-0">
                  <p>{dummyText}</p>
                </Col>
                {/* Kolom Kanan: Gambar Grup Kanan */}
                <Col md={4} className="d-flex justify-content-center">
                  <div className="gallery-image-wrapper">
                    <Image src={images[2].src} className="gallery-image shadow-sm" style={{ maxHeight: '250px' }} />
                  </div>
                </Col>
              </Row>
            </div>
          </Col>
        </Row>

        {/* ================= BARIS 3: Gambar Lebar Tengah ================= */}
        <Row className="justify-content-center mb-5">
          <Col md={10} sm={12}>
            <div className="content-box p-3 p-md-4 text-center">
              <div className="gallery-image-wrapper mb-3">
                {/* Gambar Meja Peralatan */}
                <Image src={images[3].src} className="gallery-image shadow-sm" style={{ maxHeight: '450px' }} />
              </div>
              <p className="gallery-description small">{images[3].text}</p>
            </div>
          </Col>
        </Row>

        {/* ================= BARIS 4: Gambar Lebar Bawah ================= */}
        <Row className="justify-content-center mb-5">
          <Col md ={10} sm={12}>
            <div className="content-box p-3 p-md-4 text-center">
              <div className="gallery-image-wrapper mb-3">
                {/* Gambar Pabrik/Produksi */}
                <Image src={images[4].src} className="gallery-image shadow-sm" style={{ maxHeight: '450px' }} />
              </div>
              <p className="gallery-description small">{images[4].text}</p>
            </div>
          </Col>
        </Row>

      </Container>
       <Footer style={{ margin: 0, padding: 0 }} />
    </section>
  );
}

export default Galeri;