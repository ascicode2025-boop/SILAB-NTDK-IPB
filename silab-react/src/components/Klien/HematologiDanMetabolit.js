import React, { useState, useEffect } from "react";
import { Form, Card, Row, Col, Button, Alert, Modal, InputGroup } from "react-bootstrap";
import DatePicker from "react-datepicker";
import NavbarLogin from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";
import "react-datepicker/dist/react-datepicker.css";
import { createBooking } from "../../services/BookingService";
import dayjs from "dayjs";
import { useHistory } from "react-router-dom";

export default function HematologiDanMetabolit() {
  const history = useHistory();
  const [tanggalKirim, setTanggalKirim] = useState(null);

  // State Data
  const [analyses, setAnalyses] = useState([]);
  const [jumlahSampel, setJumlahSampel] = useState(1);
  const [kodeSampel, setKodeSampel] = useState(["01"]);

  const [jenisHewan, setJenisHewan] = useState("");
  const [jenisHewanLain, setJenisHewanLain] = useState("");
  const [jenisKelamin, setJenisKelamin] = useState("");
  const [umurAngka, setUmurAngka] = useState("");
  const [umurSatuan, setUmurSatuan] = useState("Tahun");
  const [statusFisiologis, setStatusFisiologis] = useState("");

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const ANIMAL_CODES = {
    Ayam: "AY", Bebek: "BB", Domba: "DB", Ikan: "IK", Kambing: "KB",
    Kerbau: "KR", Puyuh: "PY", Sapi: "SP", Lainnya: "XX",
  };

  const getCurrentPrefix = () => {
    let hewanCode = "";
    if (jenisHewan === "Lainnya") {
      hewanCode = jenisHewanLain ? jenisHewanLain.substring(0, 2).toUpperCase() : "XX";
    } else {
      hewanCode = ANIMAL_CODES[jenisHewan] || "";
    }
    return `HM-${hewanCode}`;
  };

  useEffect(() => {
    const savedDate = localStorage.getItem("selected_booking_date");
    if (savedDate) {
      setTanggalKirim(new Date(savedDate));
    }
  }, []);

  const analysisOptions = ["BDM", "BDP", "Hemoglobin Darah", "Hematokrit", "Diferensiasi Leukosit", "Glukosa", "Total Protein", "Albumin", "Trigliserida", "Kolestrol", "HDL-kol", "LDL-kol", "Urea/BUN", "Kreatinin", "Kalsium"];

  const handleCheckboxChange = (value) => {
    setAnalyses((prev) => (prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]));
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setAnalyses([...analysisOptions]);
    } else {
      setAnalyses([]);
    }
  };

  const isAllSelected = analysisOptions.length > 0 && analyses.length === analysisOptions.length;

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

    // Hematologi & Metabolit unlimited
    if (jumlahSampel > 999) {
      setErrorMsg("Jumlah sampel maksimal 999!");
      setLoading(false);
      window.scrollTo(0, 0);
      return;
    }

    try {
      const payload = {
        tanggal_kirim: dayjs(tanggalKirim).format("YYYY-MM-DD"),
        jenis_analisis: "hematologi dan metabolit",
        jenis_hewan: jenisHewan,
        jenis_hewan_lain: jenisHewanLain,
        jenis_kelamin: jenisKelamin,
        umur: `${umurAngka} ${umurSatuan}`,
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
            Hematologi & Metabolit
          </div>

          <Card.Body className="p-4">
            <div className="mb-4">
              <Button 
                variant="light"
                className="d-flex align-items-center gap-2 px-3 py-2 shadow-sm"
                onClick={() => history.goBack()}
                style={{
                  border: '1px solid #dee2e6',
                  borderRadius: '8px',
                  fontWeight: '500',
                  transition: 'all 0.2s ease',
                  backgroundColor: '#f8f9fa'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#e9ecef';
                  e.currentTarget.style.transform = 'translateX(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#f8f9fa';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <i className="bi bi-arrow-left" style={{ fontSize: '1.1rem' }}></i>
                <span>Kembali</span>
              </Button>
            </div>
            
            {errorMsg && (
              <Alert variant="danger" onClose={() => setErrorMsg("")} dismissible>
                {errorMsg}
              </Alert>
            )}

            <Form onSubmit={onSubmit}>
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Jenis Hewan</Form.Label>
                <Form.Select className="rounded-3 shadow-sm" value={jenisHewan} onChange={(e) => setJenisHewan(e.target.value)} required>
                  <option value="">Pilih...</option>
                  {Object.keys(ANIMAL_CODES).map((hewan) => (
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
                <Row>
                  <Col xs={6}>
                    <Form.Control 
                      type="number" 
                      min="1"
                      className="rounded-3 shadow-sm" 
                      value={umurAngka} 
                      onChange={(e) => setUmurAngka(e.target.value)} 
                      placeholder="Masukkan angka" 
                      required 
                    />
                  </Col>
                  <Col xs={6}>
                    <Form.Select 
                      className="rounded-3 shadow-sm" 
                      value={umurSatuan} 
                      onChange={(e) => setUmurSatuan(e.target.value)}
                      required
                    >
                      <option value="Hari">Hari</option>
                      <option value="Minggu">Minggu</option>
                      <option value="Bulan">Bulan</option>
                      <option value="Tahun">Tahun</option>
                    </Form.Select>
                  </Col>
                </Row>
                <Form.Text className="text-muted">Contoh: 2 Tahun, 6 Bulan, 3 Minggu, atau 45 Hari</Form.Text>
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
                <Form.Label className="fw-semibold">Jumlah Sampel (Maksimal 999)</Form.Label>
                <Form.Control
                  type="number"
                  min={1}
                  max={999}
                  value={jumlahSampel}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "") {
                      setJumlahSampel("");
                      setKodeSampel([]);
                      return;
                    }
                    const num = Number(val);
                    setJumlahSampel(num);

                    const newCodes = Array.from({ length: num }, (_, i) => 
                        String(i + 1).padStart(2, "0")
                    );
                    setKodeSampel(newCodes);
                  }}
                  className="rounded-3 shadow-sm"
                  required
                />
                <Form.Text className="text-muted">*Kombinasi Hematologi & Metabolit tidak dibatasi jumlah sampel</Form.Text>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Kode Sampel (Label Botol)</Form.Label>
                {!jenisHewan && <div className="text-muted small mb-2">Pilih jenis hewan dulu untuk memunculkan kode otomatis.</div>}

                {kodeSampel.map((kode, index) => (
                  <InputGroup key={index} className="mb-2 shadow-sm">
                    <InputGroup.Text style={{ backgroundColor: "#e9ecef", fontWeight: "bold", color: "#555" }}>{getCurrentPrefix()}-</InputGroup.Text>
                    <Form.Control
                      placeholder={`Nomor Sampel ${index + 1} (Contoh: 01)`}
                      value={kode}
                      onChange={(e) => {
                        const arr = [...kodeSampel];
                        arr[index] = e.target.value;
                        setKodeSampel(arr);
                      }}
                      className="rounded-3 shadow-sm"
                      required
                    />
                  </InputGroup>
                ))}
                <Form.Text className="text-muted">*Kode otomatis disesuaikan: HM-[Kode Hewan]-[Nomor] (Contoh: HM-SP-01)</Form.Text>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Analisis (Hematologi & Metabolit)</Form.Label>
                <div className="mb-3 p-2 bg-light rounded">
                  <Form.Check 
                    type="checkbox" 
                    label={<strong>Pilih Semua</strong>}
                    checked={isAllSelected}
                    onChange={handleSelectAll}
                  />
                </div>
                <div className="d-flex flex-column gap-2">
                  {analysisOptions.map((item, index) => (
                    <Form.Check 
                      key={index} 
                      type="checkbox" 
                      label={item} 
                      checked={analyses.includes(item)}
                      onChange={() => handleCheckboxChange(item)} 
                    />
                  ))}
                </div>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold">Tanggal Kirim</Form.Label>
                <div className="w-100">
                  <DatePicker selected={tanggalKirim} onChange={(date) => setTanggalKirim(date)} className="form-control rounded-3 shadow-sm pe-5 w-100" dateFormat="dd/MM/yyyy" placeholderText="Pilih tanggal pengiriman" required />
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
        <Modal.Header closeButton>
          <Modal.Title className="text-success fw-bold">Berhasil!</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-center">
            Pemesanan <strong>Hematologi & Metabolit</strong> berhasil dibuat.
          </p>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success" onClick={handleCloseSuccess}>OK</Button>
        </Modal.Footer>
      </Modal>

      <FooterSetelahLogin />
    </NavbarLogin>
  );
}