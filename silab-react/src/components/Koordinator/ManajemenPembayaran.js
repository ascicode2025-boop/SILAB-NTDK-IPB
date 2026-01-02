import React, { useState } from "react";
import {
  Container, Row, Col, Card, Table, Button,
  Form, InputGroup, Modal, Stack
} from "react-bootstrap";
import NavbarLoginKoordinator from "./NavbarLoginKoordinator";
import FooterSetelahLogin from "../FooterSetelahLogin";

const ManajemenPembayaran = () => {
  const [invoices, setInvoices] = useState([
    {
      invoiceId: "INV-2026-001",
      namaKlien: "Andi Herlambang",
      institusi: "Universitas Indonesia",
      tanggal: "2026-01-01",
      dueDate: "2026-01-07",
      total: 500000,
      status: "UNPAID",
      deskripsi: "Analisis Metabolit Sampel M024"
    },
    {
      invoiceId: "INV-2026-002",
      namaKlien: "Siti Aminah",
      institusi: "PT. Maju Mundur",
      tanggal: "2026-01-02",
      dueDate: "2026-01-09",
      total: 750000,
      status: "PAID",
      deskripsi: "Uji Proksimat Bahan Pangan"
    }
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  
  const [formData, setFormData] = useState({
    namaKlien: "",
    institusi: "",
    tanggal: "",
    dueDate: "",
    total: "",
    status: "DRAFT"
  });

  const customColors = {
    brown: '#a3867a',
    lightGray: '#e9ecef',
    textDark: '#45352F'
  };

  const handleShowDetail = (inv) => {
    setSelectedInvoice(inv);
    setShowDetailModal(true);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newInvoice = {
      invoiceId: `INV-2026-0${invoices.length + 1}`,
      ...formData,
      total: parseInt(formData.total)
    };
    setInvoices([newInvoice, ...invoices]);
    setShowModal(false);
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      "DRAFT": { color: "#6c757d", label: "Draft" },
      "UNPAID": { color: "#dc3545", label: "Belum Bayar" },
      "PAID": { color: "#198754", label: "Lunas" }
    };
    const current = statusMap[status];
    return (
      <span style={{ 
        fontSize: '0.8rem', 
        color: current.color, 
        border: `1px solid ${current.color}`,
        padding: '2px 12px',
        borderRadius: '10px',
        fontWeight: '500'
      }}>
        {current.label}
      </span>
    );
  };

  return (
    <NavbarLoginKoordinator>
      <div style={{ backgroundColor: customColors.lightGray, minHeight: "100vh" }}>
        <Container className="py-5">
          
          {/* STATS SUMMARY SECTION */}
          <Row className="mb-4 g-3 text-center">
            {[
              { label: "TOTAL TAGIHAN", val: "Rp 1.250.000", color: customColors.brown },
              { label: "SUDAH DIBAYAR", val: "Rp 750.000", color: "#198754" },
              { label: "MENUNGGU", val: "Rp 500.000", color: "#dc3545" }
            ].map((stat, i) => (
              <Col md={4} key={i}>
                <Card className="border-0 shadow-sm" style={{ borderRadius: '15px' }}>
                  <Card.Body className="p-3">
                    <small className="fw-bold text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>{stat.label}</small>
                    <h4 className="fw-bold mb-0" style={{ color: stat.color }}>{stat.val}</h4>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>

          {/* MAIN TABLE CARD */}
          <Card className="border-0 shadow-sm" style={{ borderRadius: '20px', overflow: 'hidden' }}>
            <div 
              className="card-header border-0 py-3 d-flex justify-content-between align-items-center" 
              style={{ backgroundColor: customColors.brown, color: 'white', borderBottomRightRadius: '50px', padding: '0 30px' }}
            >
              <h4 className="mb-0 fw-normal py-2" style={{ fontFamily: 'serif' }}>Manajemen Invoice</h4>
              <Button 
                variant="light" size="sm" className="rounded-pill px-3 fw-bold"
                style={{ color: customColors.brown }} onClick={() => setShowModal(true)}
              >
                + Invoice Baru
              </Button>
            </div>

            <Card.Body className="p-4 p-md-5 bg-white">
              <div className="mb-4" style={{ maxWidth: '400px' }}>
                <InputGroup className="shadow-sm rounded-pill overflow-hidden border">
                  <Form.Control placeholder="Cari klien..." className="border-0 ps-4" style={{ fontSize: '0.9rem' }} />
                  <Button variant="white" className="border-0 px-3 text-muted">Cari</Button>
                </InputGroup>
              </div>

              <div className="table-responsive">
                <table className="table table-bordered align-middle text-center mb-0">
                  <thead className="table-light">
                    <tr>
                      <th className="py-3">No Invoice</th>
                      <th className="py-3">Klien & Institusi</th>
                      <th className="py-3">Jatuh Tempo</th>
                      <th className="py-3">Total</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.map((inv) => (
                      <tr key={inv.invoiceId}>
                        <td className="py-3 fw-bold text-primary">{inv.invoiceId}</td>
                        <td className="py-3 text-start ps-4">
                          <div className="fw-bold">{inv.namaKlien}</div>
                          <div className="small text-muted">{inv.institusi}</div>
                        </td>
                        <td className="py-3">{inv.dueDate}</td>
                        <td className="py-3 fw-bold">Rp {inv.total.toLocaleString("id-ID")}</td>
                        <td className="py-3">{getStatusBadge(inv.status)}</td>
                        <td className="py-3">
                          <Stack direction="horizontal" gap={2} className="justify-content-center">
                            <Button 
                              size="sm" className="text-white px-3" 
                              style={{ backgroundColor: customColors.brown, border: 'none', borderRadius: '15px' }}
                              onClick={() => handleShowDetail(inv)}
                            >
                              Detail
                            </Button>
                            <Button variant="outline-danger" size="sm" style={{ borderRadius: '15px' }}>PDF</Button>
                          </Stack>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Container>
        <FooterSetelahLogin />
      </div>

      {/* MODAL DETAIL INVOICE */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} centered
        style={{
          marginTop: "3rem"
        }}
        
        >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold" style={{ color: customColors.brown, fontFamily: 'serif' }}>
            Detail Penagihan
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          {selectedInvoice && (
            <div className="p-3 rounded-3" style={{ backgroundColor: '#fdfbf9', border: `1px dashed ${customColors.brown}` }}>
              <Row className="mb-3">
                <Col xs={5} className="text-muted small fw-bold">NOMOR INVOICE</Col>
                <Col xs={7} className="fw-bold text-primary">{selectedInvoice.invoiceId}</Col>
              </Row>
              <Row className="mb-3">
                <Col xs={5} className="text-muted small fw-bold">NAMA KLIEN</Col>
                <Col xs={7} className="fw-bold">{selectedInvoice.namaKlien}</Col>
              </Row>
              <Row className="mb-3">
                <Col xs={5} className="text-muted small fw-bold">INSTITUSI</Col>
                <Col xs={7}>{selectedInvoice.institusi}</Col>
              </Row>
              <hr />
              <Row className="mb-3">
                <Col xs={5} className="text-muted small fw-bold">TANGGAL TAGIHAN</Col>
                <Col xs={7}>{selectedInvoice.tanggal}</Col>
              </Row>
              <Row className="mb-3">
                <Col xs={5} className="text-muted small fw-bold">JATUH TEMPO</Col>
                <Col xs={7} className="text-danger fw-medium">{selectedInvoice.dueDate}</Col>
              </Row>
              <Row className="mb-3">
                <Col xs={5} className="text-muted small fw-bold">STATUS</Col>
                <Col xs={7}>{getStatusBadge(selectedInvoice.status)}</Col>
              </Row>
              <div className="mt-4 p-3 bg-white border rounded">
                <small className="text-muted d-block mb-1 fw-bold">TOTAL PEMBAYARAN</small>
                <h3 className="fw-bold mb-0" style={{ color: customColors.brown }}>
                  Rp {selectedInvoice.total.toLocaleString("id-ID")}
                </h3>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center">
          <Button 
            className="w-75 rounded-pill text-white shadow-sm" 
            style={{ backgroundColor: customColors.brown, border: 'none' }}
            onClick={() => setShowDetailModal(false)}
          >
            Tutup Detail
          </Button>
        </Modal.Footer>
      </Modal>

      {/* MODAL BUAT INVOICE (SAMA SEPERTI SEBELUMNYA) */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold" style={{ color: customColors.brown, fontFamily: 'serif' }}>Buat Invoice Baru</Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body className="px-4 pb-4">
            <Row className="g-3">
              <Col md={6}>
                <Form.Label className="small fw-bold text-muted">NAMA KLIEN</Form.Label>
                <Form.Control className="rounded-3 shadow-sm" name="namaKlien" required onChange={handleChange} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold text-muted">INSTITUSI</Form.Label>
                <Form.Control className="rounded-3 shadow-sm" name="institusi" required onChange={handleChange} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold text-muted">JATUH TEMPO</Form.Label>
                <Form.Control type="date" className="rounded-3 shadow-sm" name="dueDate" required onChange={handleChange} />
              </Col>
              <Col md={6}>
                <Form.Label className="small fw-bold text-muted">TOTAL (RP)</Form.Label>
                <Form.Control type="number" className="rounded-3 shadow-sm" name="total" required onChange={handleChange} />
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer className="border-0 px-4 pb-4">
            <Button variant="light" className="rounded-pill px-4" onClick={() => setShowModal(false)}>Batal</Button>
            <Button type="submit" className="rounded-pill px-4 text-white" style={{ backgroundColor: customColors.brown, border: 'none' }}>Simpan Invoice</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </NavbarLoginKoordinator>
  );
};

export default ManajemenPembayaran;