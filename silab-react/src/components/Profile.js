import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins";
import { FaFacebookF, FaLinkedinIn, FaYoutube, FaInstagram } from "react-icons/fa";
import Footer from "./Footer";

function Profile() {
  return (
    <section id="profil" style={{ fontFamily: "Poppins, sans-serif", padding: "50px 0" }}>
      <Container>
        {/* VISI */}
        <Row className="mb-5">
          <Col md={12}>
            <h2 className="fw-bold" style={{ color: "#3a3a3a" }}>
              VISI
            </h2>
            <p className="text-muted mt-3" style={{ textAlign: "justify", lineHeight: "1.8" }}>
              Menjadi Bagian Unggulan dan Terkemuka dibidang Industri Ternak
            </p>
          </Col>
        </Row>

        {/* MISI */}
        <Row>
          <Col md={12}>
            <h2 className="fw-bold" style={{ color: "#3a3a3a" }}>
              MISI
            </h2>
            <ol className="text-muted mt-3" style={{ textAlign: "justify", lineHeight: "1.8", paddingLeft: "20px" }}>
              <li>
                Mengimplementasikan Pendidikan Tinggi Modern Untuk Menghasilkan Berkualitas dan Terampil Dalam Memanfaatkan Sumberdaya Pakan Lokal dan Dalam Mengembangkan Industri Ternak Daging dan Kerja Serta Mempunyai Jiwa Kewirausahaan
                sehingga dapat Bersaing di Pasar Global
              </li>
              <li>Mengembangkan dan mengaplikasikan Ilmu Pengetahuan dibidang Nutrisi Ternak Daging dan Kerja Melalui Proses Pendidikan dan Penyelesaian Masalah yang berhubungan dengan Bidang Nutrisi Ternak Daging dan Kerja</li>
              <li>Meningkatkan Tanggung Jawab dalam Pengabdian pada Masyarakat dengan mengembangkan keahlian dan Program Profesional yang berhubungan dengan Bidang Nutrisi dan Ternak Kerja</li>
            </ol>
          </Col>
        </Row>
      </Container>

      {/* =======================
          Struktur 
      ======================= */}
      <h4 className="text-center mb-5 gallery-title" style={{ marginTop: "5rem", fontFamily: "Poppins, sans-serif", fontWeight: "bold" }}>
        Struktur Departemen Ilmu Nutrisi Dan Teknologi Pakan Fakultas Perternakan
      </h4>

      <Container>
        <Row className="g-4 justify-content-center">
          <Col xs={12} sm={6} md={4} lg={3}>
            <Card className="profile-card text-center" style={{ width: "230px" }}>
              <div className="image-container">
                <Card.Img variant="top" src={"#"} />
              </div>
              <Card.Body>
                <Card.Title className="profile-Nama" style={{ fontWeight: "200", fontSize: "13px" }}>
                  Prof. Dr. sc. ETH. Anuraga Jayanegara, S.Pt., M.Sc.
                </Card.Title>
                <Card.Text className="profile-Jabatan" style={{ fontSize: "10px" }}>
                  Ketua Departemen
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      <Footer />
    </section>
  );
}

export default Profile;
