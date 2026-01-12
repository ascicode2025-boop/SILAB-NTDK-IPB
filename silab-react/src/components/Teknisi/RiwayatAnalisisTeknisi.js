


import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, InputGroup, Form, Button, Modal } from 'react-bootstrap';
import NavbarLoginTeknisi from './NavbarLoginTeknisi';
import FooterSetelahLogin from '../FooterSetelahLogin';

// Helper untuk parsing hasil string ke array objek per kode sampel
function parseHasilToTable(namaItem, hasilString) {
  if (!hasilString) return [];
  const parts = hasilString.split(' | ');
  return parts.map((p) => {
    const codeMatch = p.match(/\[(.*?)\]/);
    const code = codeMatch ? codeMatch[1] : '-';
    let std = '', spl = '', input = '', hasil = '', unit = '', detail = '';
    if (p.includes('STD=') && p.includes('SPL=')) {
      std = (p.match(/STD=([\d.]+)/) || [])[1] || '';
      spl = (p.match(/SPL=([\d.]+)/) || [])[1] || '';
      hasil = (p.match(/HASIL=([\d.]+)/) || [])[1] || '';
      unit = (p.match(/HASIL=[\d.]+\s*([a-zA-Z%/]+)/) || [])[1] || '';
      return { code, std, spl, hasil, unit: unit && unit !== '(' ? unit : '' };
    } else if (p.includes('INPUT=') && p.includes('HASIL=')) {
      input = (p.match(/INPUT=([\d.]+)/) || [])[1] || '';
      hasil = (p.match(/HASIL=([\d.]+)/) || [])[1] || '';
      // Ambil satuan dari tanda kurung setelah HASIL=...
      let unitMatch = p.match(/HASIL=[\d.]+\s*\(([^)]+)\)/);
      unit = unitMatch && unitMatch[1] ? unitMatch[1] : '';
      return { code, input, hasil, unit };
    } else if (p.includes('Lim:') && p.includes('%')) {
      detail = p.replace(/\[.*?\]:\s*/, '');
      return { code, detail };
    } else {
      return { code, raw: p };
    }
  });
}

const RiwayatAnalisisTeknisi = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        // Ambil semua booking
        const res = await fetch(`${apiBase}/bookings/all`, { headers });
        const json = await res.json();
        // Filter: status selesai & minimal satu analysis_items punya hasil
        if (json && json.success) {
          const filtered = (json.data || []).filter(item => {
            if (item.status !== 'selesai') return false;
            if (!item.analysis_items || !Array.isArray(item.analysis_items)) return false;
            // Cek minimal satu analysis_items punya hasil tidak kosong
            return item.analysis_items.some(ai => ai.hasil && ai.hasil.trim() !== '');
          });
          setData(filtered);
        } else {
          setData([]);
        }
      } catch (e) {
        setData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <NavbarLoginTeknisi>
      <div style={{ background: '#F7F5F4', minHeight: '100vh', padding: '40px 0', display: 'flex', flexDirection: 'column' }}>
        <Container style={{ flex: 1 }}>
          <Row className="mb-4">
            <Col>
              <h2 className="fw-bold mb-1">Riwayat Analisis Selesai</h2>
              <p className="text-muted small">Daftar hasil analisis yang sudah selesai dan tervalidasi.</p>
            </Col>
          </Row>
          <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '20px' }}>
            <Card.Header className="bg-white p-4 border-0">
              <Row className="align-items-center">
                <Col md={4}>
                  <InputGroup className="rounded-pill border px-2 bg-light">
                    <InputGroup.Text className="bg-transparent border-0 text-muted">
                      <i className="bi bi-search" />
                    </InputGroup.Text>
                    <Form.Control placeholder="Cari kode batch..." className="bg-transparent border-0 py-2 shadow-none small" />
                  </InputGroup>
                </Col>
              </Row>
            </Card.Header>
            <Table responsive hover className="mb-0 custom-table-style">
              <thead>
                <tr className="text-center align-middle">
                  <th>No</th>
                  <th>Kode Batch</th>
                  <th>Jenis Analisis</th>
                  <th>Tanggal Selesai</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={6} className="text-center py-5 text-muted">Memuat data...</td></tr>
                ) : data.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-5 text-muted">Belum ada riwayat analisis selesai.</td></tr>
                ) : data.map((item, idx) => (
                  <tr key={item.id} className="text-center align-middle">
                    <td>{idx + 1}</td>
                    <td>{item.kode_batch || '-'}</td>
                    <td>{(item.analysis_items && item.analysis_items.length > 0) ? item.analysis_items.map(i => i.jenis_analisis || i.nama_item || '-').join(', ') : '-'}</td>
                    <td>{item.updated_at ? new Date(item.updated_at).toLocaleDateString('id-ID') : '-'}</td>
                    <td><span className="badge bg-success">Selesai</span></td>
                    <td>
                      <Button variant="outline-info" size="sm" onClick={() => { setSelectedBooking(item); setShowModal(true); }}>Lihat Detail</Button>
                      {item.pdf_path && (
                        <a className="btn btn-outline-primary btn-sm ms-2" href={`${process.env.REACT_APP_API_BASE_URL ? process.env.REACT_APP_API_BASE_URL.replace(/\/api$/, '') : 'http://127.0.0.1:8000'}/storage/${item.pdf_path}`} target="_blank" rel="noreferrer">Lihat Hasil</a>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
        </Container>
        {/* Modal Detail Analisis */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
          <Modal.Header closeButton>
            <Modal.Title>Detail Hasil Analisis</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            {selectedBooking ? (
              <div>
                <h5 className="mb-3">Kode Batch: <span className="text-primary">{selectedBooking.kode_batch}</span></h5>
                <div className="mb-2">Jenis Analisis: <b>{selectedBooking.jenis_analisis}</b></div>
                <div className="mb-2">Tanggal Selesai: <b>{selectedBooking.updated_at ? new Date(selectedBooking.updated_at).toLocaleDateString('id-ID') : '-'}</b></div>
                <div className="mb-4">Klien: <b>{selectedBooking.user?.full_name || selectedBooking.user?.nama_lengkap || selectedBooking.user_fullname || selectedBooking.user?.name || '-'}</b></div>
                {selectedBooking.analysis_items && selectedBooking.analysis_items.length > 0 ? (
                  selectedBooking.analysis_items.map((ai, i) => (
                    <Card className="mb-3" key={ai.id || i}>
                      <Card.Header className="bg-light fw-bold">{ai.nama_item || ai.jenis_analisis || '-'}</Card.Header>
                      <Card.Body style={{ padding: '1rem' }}>
                        {ai.hasil ? (
                          <>
                            {/* Kimia Klinik */}
                            {ai.hasil.includes('STD=') && ai.hasil.includes('SPL=') ? (() => {
                              const rows = parseHasilToTable(ai.nama_item, ai.hasil);
                              const showUnit = rows.some(r => r.unit && r.unit.trim() !== '');
                              return (
                                <Table bordered size="sm" className="mb-0">
                                  <thead>
                                    <tr>
                                      <th>Kode Sampel</th>
                                      <th>Abs Std</th>
                                      <th>Abs Sampel</th>
                                      <th>Hasil</th>
                                      {showUnit && <th>Satuan</th>}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {rows.map((row, idx) => (
                                      <tr key={idx}>
                                        <td>{row.code}</td>
                                        <td>{row.std}</td>
                                        <td>{row.spl}</td>
                                        <td>{row.hasil}</td>
                                        {showUnit && <td>{row.unit}</td>}
                                      </tr>
                                    ))}
                                  </tbody>
                                </Table>
                              );
                            })() : ai.hasil.includes('INPUT=') && ai.hasil.includes('HASIL=') ? (() => {
                              const rows = parseHasilToTable(ai.nama_item, ai.hasil);
                              const showUnit = rows.some(r => r.unit && r.unit.trim() !== '');
                              return (
                                <Table bordered size="sm" className="mb-0">
                                  <thead>
                                    <tr>
                                      <th>Kode Sampel</th>
                                      <th>Input</th>
                                      <th>Hasil</th>
                                      {showUnit && <th>Satuan</th>}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {rows.map((row, idx) => (
                                      <tr key={idx}>
                                        <td>{row.code}</td>
                                        <td>{row.input}</td>
                                        <td>{row.hasil}</td>
                                        {showUnit && <td>{row.unit}</td>}
                                      </tr>
                                    ))}
                                  </tbody>
                                </Table>
                              );
                            })() : ai.hasil.includes('Lim:') && ai.hasil.includes('%') ? (
                              <Table bordered size="sm" className="mb-0">
                                <thead><tr><th>Kode Sampel</th><th>Detail</th></tr></thead>
                                <tbody>
                                  {parseHasilToTable(ai.nama_item, ai.hasil).map((row, idx) => (
                                    <tr key={idx}>
                                      <td>{row.code}</td>
                                      <td style={{ fontFamily: 'monospace', fontSize: '0.95em' }}>{row.detail}</td>
                                    </tr>
                                  ))}
                                </tbody>
                              </Table>
                            ) : (
                              <div style={{ fontFamily: 'monospace', fontSize: '0.95em' }}>{ai.hasil}</div>
                            )}
                          </>
                        ) : <span className="text-muted">Belum ada hasil.</span>}
                        <div className="mt-2 small text-muted">Metode: {ai.metode || '-'}</div>
                      </Card.Body>
                    </Card>
                  ))
                ) : <div className="text-center text-muted">Tidak ada hasil analisis.</div>}
              </div>
            ) : <div className="text-center text-muted">Tidak ada data.</div>}
          </Modal.Body>
        </Modal>
        <FooterSetelahLogin />
      </div>
    </NavbarLoginTeknisi>
  );
};

export default RiwayatAnalisisTeknisi;
