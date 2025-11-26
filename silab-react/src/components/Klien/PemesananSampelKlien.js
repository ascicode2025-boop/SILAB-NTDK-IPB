import React from "react";
import { Container, Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import NavbarLogin from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";
import "@fontsource/poppins";
import { useHistory } from "react-router-dom";

export default function PemesananSampelKlien() {
  const history = useHistory();

  const brownButton = {
    backgroundColor: "#8D6E63",
    borderColor: "#8D6E63",
    color: "white",
    fontWeight: "400",
    fontFamily: "Poppins, sans-serif",
  };

  return (
    <NavbarLogin>
      <Container fluid className="d-flex flex-column justify-content-center align-items-center" style={{ minHeight: "70vh", backgroundColor: "#eee9e6" }}>
        <h2
          className="mb-4"
          style={{
            color: "#333",
            marginTop: "-2rem",
            fontWeight: "600",
            fontFamily: "Poppins, sans-serif",
          }}
        >
          Pemesanan Sampel
        </h2>

        <div className="d-flex flex-column gap-3" style={{ width: "300px" }}>
          <Button style={brownButton} size="lg" onClick={() => history.push("/dashboard/pemesananSampelKlien/hematologi")}>
            Hematologi
          </Button>

          <Button style={brownButton} size="lg" onClick={() => history.push("/dashboard/pemesananSampelKlien/metabolit")}>
            Metabolit
          </Button>

          <Button style={brownButton} size="lg" onClick={() => history.push("/dashboard/pemesananSampelKlien/hematologiDanMetabolit")}>
            Hematologi & Metabolit
          </Button>
        </div>
      </Container>
      <FooterSetelahLogin />
    </NavbarLogin>
  );
}
