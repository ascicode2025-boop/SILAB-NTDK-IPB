import React from "react";
import { Container, Card, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import "@fontsource/poppins";
import Footer from "./Footer";

const PanduanSampel = () => {
  React.useEffect(() => {
    document.title = "SILAB-NTDK - Panduan Sampel";
  }, []);

  return (
    <>
      <Container fluid className="d-flex justify-content-center align-items-start py-5" style={{ minHeight: "100vh", backgroundColor: "#f1f1f1" }}>
        <Card
          className="p-4 p-md-5"
          style={{
            maxWidth: "700px",
            width: "100%",
            borderRadius: "20px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.08)",
            fontFamily: "Poppins",
          }}
        >
          <h4 className="text-center mb-4">Panduan Pengiriman Sampel Analisis</h4>

          <div style={{ textAlign: "justify", fontSize: "14px", color: "#333" }}>
            <p>
              <strong>Lorem Ipsum</strong> is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
              scrambled it to make a type specimen book.
            </p>

            <p>
              <strong>Lorem Ipsum</strong> is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
              scrambled it to make a type specimen book.
            </p>

            <p>
              <strong>Lorem Ipsum</strong> is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
              scrambled it to make a type specimen book.
            </p>

            <p>
              <strong>Lorem Ipsum</strong> is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and
              scrambled it to make a type specimen book.
            </p>
          </div>

          <div className="text-end mt-4 pe-2">
            <Button
              style={{
                backgroundColor: "#6c5245",
                borderRadius: "20px",
                padding: "8px 30px",
                border: "none",
              }}
              onClick={() => window.history.back()}
            >
              Kembali
            </Button>
          </div>
        </Card>
      </Container>
      <Footer />
    </>
  );
};

export default PanduanSampel;
