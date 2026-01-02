import React, { useState, useEffect } from "react";
import { Form, Card, Row, Col, Button, Alert, Modal, InputGroup, Container } from "react-bootstrap";
import DatePicker from "react-datepicker";
import NavbarLogin from "./NavbarLoginKlien";
import FooterSetelahLogin from "../FooterSetelahLogin";
import "react-datepicker/dist/react-datepicker.css";
import { createBooking } from "../../services/BookingService";
import dayjs from "dayjs";
import { useHistory } from "react-router-dom";

export default function Hematologi() {
  const history = useHistory();
  const [tanggalKirim, setTanggalKirim] = useState(null);

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
    Ayam: "AY",
    Bebek: "BB",
    Domba: "DB",
    Ikan: "IK",
    Kambing: "KB",
    Kerbau: "KR",
    Puyuh: "PY",
    Sapi: "SP",
    Lainnya: "XX",
  };

  const getCurrentPrefix = () => {
    if (jenisHewan === "Lainnya") {
      return jenisHewanLain ? jenisHewanLain.substring(0, 2).toUpperCase() : "XX";
    }
    return ANIMAL_CODES[jenisHewan] || "??";
  };

  useEffect(() => {
    const savedDate = localStorage.getItem("selected_booking_date");
    if (savedDate) setTanggalKirim(new Date(savedDate));
  }, []);

  const analysisOptions = ["BDM", "BDP", "Hemoglobin Darah", "Hematokrit", "Diferensiasi Leukosit"];

  const handleCheckboxChange = (value) => {
    setAnalyses((prev) => (prev.includes(value) ? prev.filter((x) => x !== value) : [...prev, value]));
  };

  const handleSelectAll = (e) => {
    setAnalyses(e.target.checked ? [...analysisOptions] : []);
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

    try {
      const payload = {
        tanggal_kirim: dayjs(tanggalKirim).format("YYYY-MM-DD"),
        jenis_analisis: "hematologi",
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

  const cardHeaderStyle = {
    background: "linear-gradient(135deg, #5c3d35 0%, #45352f 100%)",
    padding: "2rem 1rem",
    borderBottom: "none",
  };

  const labelStyle = {
    fontSize: "0.9rem",
    color: "#555",
    marginBottom: "0.5rem",
    display: "block",
  };

  return (
    <NavbarLogin>
      <div className="min-vh-100 py-5" style={{ background: "#f4f1ee", color: "#333" }}>
        <Container className="d-flex justify-content-center">
          <Card className="border-0 shadow-lg" style={{ maxWidth: "800px", width: "100%", borderRadius: "15px" }}>
            {/* Header */}
            <div className="text-center text-white rounded-top" style={cardHeaderStyle}>
              <h2 className="mb-1 fw-bold">Hematologi</h2>
              <p className="mb-0 opacity-75 small">Lengkapi detail sampel dan jenis analisis Anda</p>
            </div>

            <Card.Body className="p-4 p-md-5">
              {errorMsg && (
                <Alert variant="danger" className="border-0 shadow-sm" dismissible onClose={() => setErrorMsg("")}>
                  {errorMsg}
                </Alert>
              )}

              <Form onSubmit={onSubmit}>
                {/* Informasi Hewan */}
                <div className="mb-5">
                  <h5 className="mb-4 pb-2 border-bottom fw-bold text-secondary">
                    <i className="bi bi-info-circle me-2"></i>Informasi Hewan
                  </h5>

                  <Row className="g-4">
                    <Col md={6}>
                      <Form.Group>
                        <Form.Label style={labelStyle} className="fw-bold">Jenis Hewan</Form.Label>
                        <Form.Select className="py-2 px-3 shadow-sm border-0 bg-light" value={jenisHewan} onChange={(e) => setJenisHewan(e.target.value)} required>
                          <option value="">Pilih Hewan...</option>
                          {Object.keys(ANIMAL_CODES).map((h) => (
                            <option key={h} value={h}>{h}</option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    {jenisHewan === "Lainnya" && (
                      <Col md={6}>
                        <Form.Group>
                          <Form.Label style={labelStyle} className="fw-bold">Sebutkan Jenis Hewan</Form.Label>
                          <Form.Control className="py-2 px-3 shadow-sm border-0 bg-light" value={jenisHewanLain} onChange={(e) => setJenisHewanLain(e.target.value)} required />
                        </Form.Group>
                      </Col>
                    )}

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label style={labelStyle} className="fw-bold">Jenis Kelamin</Form.Label>
                        <Form.Select className="py-2 px-3 shadow-sm border-0 bg-light" value={jenisKelamin} onChange={(e) => setJenisKelamin(e.target.value)} required>
                          <option value="">Pilih...</option>
                          <option>Jantan</option>
                          <option>Betina</option>
                          <option>Campuran</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label style={labelStyle} className="fw-bold">Umur</Form.Label>
                        <InputGroup className="shadow-sm">
                          <Form.Control type="number" min="1" className="border-0 bg-light" value={umurAngka} onChange={(e) => setUmurAngka(e.target.value)} required />
                          <Form.Select className="border-0 bg-light" style={{ maxWidth: 120 }} value={umurSatuan} onChange={(e) => setUmurSatuan(e.target.value)}>
                            <option>Hari</option>
                            <option>Minggu</option>
                            <option>Bulan</option>
                            <option>Tahun</option>
                          </Form.Select>
                        </InputGroup>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group>
                        <Form.Label style={labelStyle} className="fw-bold">Status Fisiologis</Form.Label>
                        <Form.Select className="py-2 px-3 shadow-sm border-0 bg-light" value={statusFisiologis} onChange={(e) => setStatusFisiologis(e.target.value)} required>
                          <option value="">Pilih Status...</option>
                          <option>Bunting/Hamil</option>
                          <option>Tidak Bunting/Tidak Hamil</option>
                          <option>Laktasi</option>
                          <option>Dara</option>
                          <option>Pejantan</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>
                </div>

                {/* Detail Sampel */}
                <div className="mb-5 p-4 rounded-4" style={{ background: "#fdfcfb", border: "1px dashed #ddd" }}>
                  <h5 className="mb-4 fw-bold text-secondary">
                    <i className="bi bi-vial me-2"></i>Detail Sampel
                  </h5>

                  <Form.Group className="mb-4">
                    <Form.Label style={labelStyle} className="fw-bold">Jumlah Sampel</Form.Label>
                    <Form.Control
                      type="number"
                      min={1}
                      className="py-2 shadow-sm border-0 bg-light w-50"
                      value={jumlahSampel}
                      onChange={(e) => {
                        const num = Number(e.target.value || 0);
                        setJumlahSampel(num);
                        setKodeSampel(Array.from({ length: num }, (_, i) => String(i + 1).padStart(2, "0")));
                      }}
                      required
                    />
                  </Form.Group>

                  <Row>
                    {kodeSampel.map((kode, i) => (
                      <Col md={6} key={i} className="mb-2">
                        <InputGroup size="sm" className="shadow-sm">
                          <InputGroup.Text className="bg-secondary text-white border-0">{getCurrentPrefix()}-</InputGroup.Text>
                          <Form.Control value={kode} onChange={(e) => {
                            const arr = [...kodeSampel];
                            arr[i] = e.target.value;
                            setKodeSampel(arr);
                          }} required />
                        </InputGroup>
                      </Col>
                    ))}
                  </Row>
                </div>

                {/* Jenis Analisis */}
                <div className="mb-5">
                  <h5 className="mb-3 fw-bold text-secondary">
                    <i className="bi bi-list-check me-2"></i>Pilih Jenis Analisis
                  </h5>
                  <div className="p-3 bg-light rounded-3 shadow-sm">
                    <Form.Check type="checkbox" label={<strong>Pilih Semua</strong>} checked={isAllSelected} onChange={handleSelectAll} className="mb-3 pb-2 border-bottom" />
                    <Row>
                      {analysisOptions.map((item, i) => (
                        <Col md={6} key={i}>
                          <Form.Check type="checkbox" label={item} checked={analyses.includes(item)} onChange={() => handleCheckboxChange(item)} />
                        </Col>
                      ))}
                    </Row>
                  </div>
                </div>

                {/* Tanggal Kirim */}
                <Form.Group className="mb-5">
                  <Form.Label style={labelStyle} className="fw-bold">Tanggal Kirim Sampel</Form.Label>
                  <DatePicker
                    selected={tanggalKirim}
                    onChange={setTanggalKirim}
                    wrapperClassName="w-100"
                    className="form-control py-2 px-3 shadow-sm border-0 bg-light"
                    dateFormat="dd MMMM yyyy"
                    required
                  />
                </Form.Group>

                <div className="d-flex justify-content-between gap-3">
                  <Button variant="outline-secondary" onClick={() => history.goBack()}>
                    <i className="bi bi-chevron-left me-2"></i>Kembali
                  </Button>
                  <Button type="submit" disabled={loading} style={{ background: "#5c3d35" }}>
                    {loading ? "Mengirim..." : "Kirim Permohonan"}
                  </Button>
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Container>
      </div>

      <Modal show={showSuccess} onHide={handleCloseSuccess} centered backdrop="static">
        <Modal.Body className="text-center p-5">
          <i className="bi bi-check-circle-fill text-success" style={{ fontSize: "4rem" }} />
          <h3 className="fw-bold mt-3">Pemesanan Berhasil!</h3>
          <Button className="mt-3" onClick={handleCloseSuccess}>Lihat Status Pesanan</Button>
        </Modal.Body>
      </Modal>

      <FooterSetelahLogin />
    </NavbarLogin>
  );
}
