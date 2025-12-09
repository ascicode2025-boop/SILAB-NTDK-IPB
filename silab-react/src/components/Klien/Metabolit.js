import React, { useState, useEffect } from "react";
import { Form, Card, Row, Col, Button, Alert, Modal, InputGroup } from "react-bootstrap";
import DatePicker from "react-datepicker";
import NavbarLogin from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";
import "react-datepicker/dist/react-datepicker.css";
import { createBooking } from "../../services/BookingService"; 
import dayjs from "dayjs";
import { useHistory } from "react-router-dom";

export default function Metabolit() {
  const history = useHistory();
  const [tanggalKirim, setTanggalKirim] = useState(null);
  
  const [analyses, setAnalyses] = useState([]);
  const [jumlahSampel, setJumlahSampel] = useState(1);
  const [kodeSampel, setKodeSampel] = useState([""]);
  
  const [jenisHewan, setJenisHewan] = useState("");
  const [jenisHewanLain, setJenisHewanLain] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [umur, setUmur] = useState("");
  const [statusFisiologis, setStatusFisiologis] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const ANIMAL_CODES = {
      "Ayam": "AY", "Bebek": "BB", "Domba": "DB", "Ikan": "IK",
      "Kambing": "KB", "Kerbau": "KR", "Puyuh": "PY", "Sapi": "SP",
      "Lainnya": "XX"
  };

  const getCurrentPrefix = () => {
      if (jenisHewan === "Lainnya") {
          return jenisHewanLain ? jenisHewanLain.substring(0, 2).toUpperCase() : "XX";
      }
      return ANIMAL_CODES[jenisHewan] || "";
  };

  useEffect(() => {
      const savedDate = localStorage.getItem("selected_booking_date");
      if (savedDate) setTanggalKirim(new Date(savedDate));
  }, []);

  const analysisOptions = [
      "Glukosa", "Total Protein", "Albumin", "Trigliserida", 
      "Kolestrol", "HDL-kol", "LDL-kol", "Urea/BUN", 
      "Kreatinin", "Kalsium"
  ];

  const handleCheckboxChange = (value) => {
    setAnalyses((prev) => (prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    if (!tanggalKirim) {
        setErrorMsg("Harap pilih Tanggal Kirim!");
        setLoading(false);
        window.scrollTo(0, 0);
        return;
    }

    try {
        const payload = {
            tanggal_kirim: dayjs(tanggalKirim).format("YYYY-MM-DD"),
            jenis_analisis: "metabolit", 
            jenis_hewan: jenisHewan,
            jenis_hewan_lain: jenisHewanLain,
            jenis_kelamin: jenisKelamin,
            umur: umur,
            status_fisiologis: statusFisiologis,
            jumlah_sampel: jumlahSampel,
            analisis_items: analyses,
            
        };

        await createBooking(payload);
        
        setShowSuccess(true);
        localStorage.removeItem("selected_booking_date");

    } catch (err) {
        console.error("Error:", err);
        setErrorMsg(err.message || "Gagal mengirim data.");
        window.scrollTo(0, 0);
    } finally {
        setLoading(false);
    }
  };

  const handleCloseSuccess = () => {
      setShowSuccess(false);
      history.push("/dashboard/menungguPersetujuan");
  };

  return (
    <NavbarLogin>
      <div className="min-vh-100 d-flex justify-content-center align-items-start py-5 px-3" style={{ background: "#eceae8" }}>
        <Card className="shadow-lg rounded-4" style={{ width: "700px", border: "none", overflow: "hidden" }}>
          
          <div className="text-center text-white py-3" style={{ background: "#45352F", fontSize: "1.5rem", fontWeight: "600", letterSpacing: "1px" }}>
            Metabolit
          </div>

          <Card.Body className="p-4">
            
            {errorMsg && <Alert variant="danger" onClose={() => setErrorMsg("")} dismissible>{errorMsg}</Alert>}

            <Form onSubmit={onSubmit}>
              
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Jenis Hewan</Form.Label>
                <Form.Select className="rounded-3 shadow-sm" value={jenisHewan} onChange={(e) => setJenisHewan(e.target.value)} required>
                  <option value="">Pilih...</option>
                  {Object.keys(ANIMAL_CODES).map(hewan => (
                      <option key={hewan} value={hewan}>{hewan}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              {jenisHewan === "Lainnya" && (
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Jenis Hewan Lain</Form.Label>
                    <Form.Control className="rounded-3 shadow-sm" value={jenisHewanLain} onChange={(e) => setJenisHewanLain(e.target.value)} placeholder="Sebutkan jenis hewan..." required />
                  </Form.Group>
              )}

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Jenis Kelamin</Form.Label>
                <Form.Select className="rounded-3 shadow-sm" value={jenisKelamin} onChange={(e) => setJenisKelamin(e.target.value)} required>
                  <option value="">Pilih...</option>
                  <option>Jantan</option>
                  <option>Betina</option>
                  <option>Campuran</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Umur</Form.Label>
                <Form.Control className="rounded-3 shadow-sm" value={umur} onChange={(e) => setUmur(e.target.value)} placeholder="Contoh: 2 Tahun" required />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Status Fisiologis</Form.Label>
                <Form.Select className="rounded-3 shadow-sm" value={statusFisiologis} onChange={(e) => setStatusFisiologis(e.target.value)} required>
                  <option value="">Pilih...</option>
                  <option>Bunting/Hamil</option>
                  <option>Tidak Bunting/Tidak Hamil</option>
                  <option>Laktasi</option>
                  <option>Dara</option>
                  <option>Pejantan</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Jumlah Sampel</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  max={15}
                  value={jumlahSampel}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setJumlahSampel(val);
                    let arr = [...kodeSampel];
                    if (val > arr.length) {
                      while (arr.length < val) arr.push("");
                    } else {
                      arr.length = val;
                    }
                    setKodeSampel(arr);
                  }}
                  className="rounded-3 shadow-sm"
                  required
                />
              </Form.Group>

              {/* --- KODE OTOMATIS (INPUT GROUP) --- */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Kode Sampel (Label Botol)</Form.Label>
                {!jenisHewan && <div className="text-muted small mb-2">Pilih jenis hewan dulu untuk memunculkan kode otomatis.</div>}
                
                {kodeSampel.map((kode, index) => (
                  <InputGroup key={index} className="mb-2 shadow-sm">
                    <InputGroup.Text style={{backgroundColor: '#e9ecef', fontWeight: 'bold', color: '#555'}}>
                        {getCurrentPrefix()}-
                    </InputGroup.Text>
                    <Form.Control
                      placeholder={`Nomor Sampel ${index + 1} (Contoh: 01)`}
                      value={kode}
                      onChange={(e) => {
                        const arr = [...kodeSampel];
                        arr[index] = e.target.value;
                        setKodeSampel(arr);
                      }}
                      required
                    />
                  </InputGroup>
                ))}
              </Form.Group>

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

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Tanggal Kirim</Form.Label>
                <div className="position-relative w-100">
                  <DatePicker 
                    selected={tanggalKirim} 
                    onChange={(date) => setTanggalKirim(date)} 
                    className="form-control rounded-3 shadow-sm pe-5 w-100" 
                    dateFormat="dd/MM/yyyy" 
                    placeholderText="Pilih tanggal pengiriman"
                    required
                  />
                </div>
                <Form.Text className="text-muted">*Tanggal otomatis terisi dari Kalender.</Form.Text>
              </Form.Group>

              <div className="text-center mt-4">
                <Button type="submit" disabled={loading} className="px-5 py-2 rounded-3 text-white" style={{ background: "#5c3d35", border: "none", fontSize: "1rem", fontWeight: "500" }}>
                  {loading ? "Mengirim..." : "Kirim"}
                </Button>
              </div>

            </Form>
          </Card.Body>
        </Card>
      </div>

      <Modal show={showSuccess} onHide={handleCloseSuccess} centered>
        <Modal.Header closeButton><Modal.Title className="text-success fw-bold">Berhasil!</Modal.Title></Modal.Header>
        <Modal.Body><p className="text-center">Pemesanan sampel <strong>Metabolit</strong> berhasil dibuat.</p></Modal.Body>
        <Modal.Footer><Button variant="success" onClick={handleCloseSuccess}>OK</Button></Modal.Footer>
      </Modal>

      <FooterSetelahLogin />
    </NavbarLogin>
  );
}