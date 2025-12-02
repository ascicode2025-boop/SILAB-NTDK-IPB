import React, { useState } from "react";
import { Form, Card, Row, Col, Button } from "react-bootstrap";
import DatePicker from "react-datepicker";
import NavbarLogin from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";
import "react-datepicker/dist/react-datepicker.css";

export default function Hematologi() {
  const [tanggalKirim, setTanggalKirim] = useState(null);
  const [analyses, setAnalyses] = useState([]);
  const [jumlahSampel, setJumlahSampel] = useState(1);
  const [kodeSampel, setKodeSampel] = useState([""]);

  // DAFTAR ANALISIS HEMATOLOGI
  const analysisOptions = ["BDP & BDM", "Hemoglobin Darah & Hematokrit", "Diferensiasi Leukosit"];

  const handleCheckboxChange = (value) => {
    setAnalyses((prev) => (prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]));
  };

  const onSubmit = (e) => {
    e.preventDefault();
    console.log({
      tanggalKirim,
      analyses,
      jumlahSampel,
      kodeSampel,
    });
  };

  return (
    <NavbarLogin>
      <div className="min-vh-100 d-flex justify-content-center align-items-start py-5 px-3" style={{ background: "#eceae8" }}>
        <Card
          className="shadow-lg rounded-4"
          style={{
            width: "700px",
            border: "none",
            overflow: "hidden",
          }}
        >
          {/* HEADER */}
          <div
            className="text-center text-white py-3"
            style={{
              background: "#45352F",
              fontSize: "1.5rem",
              fontWeight: "600",
              letterSpacing: "1px",
            }}
          >
            Hematologi
          </div>

          {/* FORM */}
          <Card.Body className="p-4">
            <Form onSubmit={onSubmit}>
              {/* JENIS HEWAN */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Jenis Hewan</Form.Label>
                <Form.Select className="rounded-3 shadow-sm">
                  <option value=""></option>
                  <option>Ayam</option>
                  <option>Bebek</option>
                  <option>Domba</option>
                  <option>Ikan</option>
                  <option>Kambing</option>
                  <option>Kerbau</option>
                  <option>Puyuh</option>
                  <option>Sapi</option>
                </Form.Select>
              </Form.Group>

              {/* JENIS HEWAN LAIN */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Jenis Hewan Lain (Isi Apabila Jenis Hewan Tidak Terdaftar)</Form.Label>
                <Form.Control className="rounded-3 shadow-sm" />
              </Form.Group>

              {/* JENIS KELAMIN */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Jenis Kelamin</Form.Label>
                <Form.Select className="rounded-3 shadow-sm">
                  <option value=""></option>
                  <option>Jantan</option>
                  <option>Betina</option>
                </Form.Select>
              </Form.Group>

              {/* UMUR */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Umur</Form.Label>
                <Form.Control className="rounded-3 shadow-sm" />
              </Form.Group>

              {/* STATUS FISIOLOGIS */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Status Fisiologis</Form.Label>
                <Form.Select className="rounded-3 shadow-sm">
                  <option value=""></option>
                  <option>Bunting/Hamil</option>
                  <option>Tidak Bunting/Tidak Hamil</option>
                </Form.Select>
              </Form.Group>

              {/* JUMLAH SAMPEL */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Jumlah Sampel</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  value={jumlahSampel}
                  onChange={(e) => {
                    const val = e.target.value;
                    setJumlahSampel(val);

                    let arr = [...kodeSampel];

                    if (!val) {
                      arr = [];
                    } else if (Number(val) > arr.length) {
                      while (arr.length < Number(val)) arr.push("");
                    } else {
                      arr.length = Number(val);
                    }

                    setKodeSampel(arr);
                  }}
                  className="rounded-3 shadow-sm"
                  placeholder="Masukkan jumlah sampel"
                />
              </Form.Group>

              {/* KODE SAMPEL */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Kode Sampel</Form.Label>
                {kodeSampel.map((kode, index) => (
                  <Form.Control
                    key={index}
                    className="rounded-3 shadow-sm mb-2"
                    placeholder={`Kode Sampel ${index + 1}`}
                    value={kode}
                    onChange={(e) => {
                      const arr = [...kodeSampel];
                      arr[index] = e.target.value;
                      setKodeSampel(arr);
                    }}
                  />
                ))}
              </Form.Group>

              {/* ANALISIS */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Analisis</Form.Label>

                <Row className="g-2">
                  {analysisOptions.map((item, index) => (
                    <Col xs={12} sm={6} md={4} lg={3} key={index}>
                      <Form.Check type="checkbox" label={item} className="text-secondary" onChange={() => handleCheckboxChange(item)} />
                    </Col>
                  ))}
                </Row>
              </Form.Group>

              {/* TANGGAL KIRIM */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Tanggal Kirim</Form.Label>

                <div className="position-relative w-100">
                  <DatePicker selected={tanggalKirim} onChange={(date) => setTanggalKirim(date)} className="form-control rounded-3 shadow-sm pe-5 w-100" dateFormat="dd/MM/yyyy" />
                </div>
              </Form.Group>

              {/* SUBMIT */}
              <div className="text-center mt-4">
                <Button
                  type="submit"
                  className="px-5 py-2 rounded-3 text-white"
                  style={{
                    background: "#5c3d35",
                    border: "none",
                    fontSize: "1rem",
                    fontWeight: "500",
                  }}
                >
                  Kirim
                </Button>
              </div>
            </Form>
          </Card.Body>
        </Card>
      </div>

      <FooterSetelahLogin />
    </NavbarLogin>
  );
}
