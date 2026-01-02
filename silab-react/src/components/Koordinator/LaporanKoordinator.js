import React from 'react';
import { Container, Row, Col, Form, Button, Table, Card } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Calendar, Download, FileText, Filter } from 'lucide-react';
import { motion } from 'framer-motion'; // Untuk animasi smooth
import 'bootstrap/dist/css/bootstrap.min.css';
import NavbarLoginKoordinator from "./NavbarLoginKoordinator";
import FooterSetelahLogin from "../FooterSetelahLogin";


const LaporanKoordinator = () => {
  const chartData = [
    { name: 'Q1', value: 20 },
    { name: 'Q2', value: 28 },
    { name: 'Q3', value: 35 },
    { name: 'Q4', value: 38 },
  ];

  // Objek styling yang lebih terorganisir
  const theme = {
    primary: '#8D766B',
    primaryDark: '#6D5950',
    secondary: '#3E322E',
    background: '#E9E9E9',
    cardRadius: '16px',
  };

  const cardStyle = {
    borderRadius: theme.cardRadius,
    border: 'none',
    boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
    transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  };

  return (
    <NavbarLoginKoordinator>
    <div style={{ backgroundColor: theme.background, minHeight: '100vh', padding: '50px 0', fontFamily: "'Inter', sans-serif" }}>
      <Container>
        {/* Header & Filter Section */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Row className="mb-4 g-3 align-items-end">
            <Col lg={4} md={6}>
              <Form.Group>
                <Form.Label className="fw-bold text-dark d-flex align-items-center mb-2">
                  <Filter size={16} className="me-2" /> Jenis Analisis
                </Form.Label>
                <Form.Select className="shadow-sm border-0 py-2 px-3" style={{ borderRadius: '12px' }}>
                  <option>Hematologi</option>
                  <option>Metabolit</option>
                </Form.Select>
              </Form.Group>
            </Col>
            <Col lg={3} md={6}>
              <Form.Label className="fw-bold text-dark mb-2">Bulan</Form.Label>
              <div className="position-relative">
                <Form.Control type="text" placeholder="Pilih Bulan" className="shadow-sm border-0 py-2" style={{ borderRadius: '12px' }} />
                <Calendar className="position-absolute end-0 top-50 translate-middle-y me-3 text-muted" size={18} />
              </div>
            </Col>
            <Col lg={3} md={6}>
              <Form.Label className="fw-bold text-dark mb-2">Tahun</Form.Label>
              <div className="position-relative">
                <Form.Control type="text" placeholder="Pilih Tahun" className="shadow-sm border-0 py-2" style={{ borderRadius: '12px' }} />
                <Calendar className="position-absolute end-0 top-50 translate-middle-y me-3 text-muted" size={18} />
              </div>
            </Col>
            <Col lg={2} md={6}>
              <Button 
                className="w-100 border-0 py-2 fw-bold" 
                style={{ backgroundColor: theme.primary, borderRadius: '12px', boxShadow: '0 4px 12px rgba(141, 118, 107, 0.3)' }}
              >
                Tampilkan
              </Button>
            </Col>
          </Row>
        </motion.div>

        {/* Chart Section */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }} 
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="mb-5 p-3" style={cardStyle}>
            <Card.Body>
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div>
                  <h5 className="fw-bold mb-0 text-dark" style={{ letterSpacing: '-0.5px' }}>Aktivitas Lab</h5>
                  <small className="text-muted">Persentase kenaikan performa kuartal</small>
                </div>
              </div>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <Tooltip cursor={{fill: '#f5f5f5'}} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12}} dy={10} />
                    <YAxis tickFormatter={(val) => `${val}%`} axisLine={false} tickLine={false} tick={{fill: '#666', fontSize: 12}} />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]} barSize={40}>
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 3 ? theme.secondary : '#8D766B'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card.Body>
          </Card>
        </motion.div>

        {/* Tabel Laporan Section */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h5 className="fw-bold mb-0">Tabel Laporan</h5>
          </div>
          <Card className="mb-4 overflow-hidden" style={cardStyle}>
            <Table hover responsive className="mb-0">
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr className="text-muted small text-uppercase">
                  <th className="py-3 px-4">Tanggal</th>
                  <th className="py-3">Kode Sampel</th>
                  <th className="py-3">Jenis Analisis</th>
                  <th className="py-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {[
                  { tgl: '3/11/2025', kode: 'H001', jenis: 'Hematologi', status: 'Selesai' },
                  { tgl: '4/11/2025', kode: 'M014', jenis: 'Metabolit', status: 'Selesai' }
                ].map((item, i) => (
                  <tr key={i} style={{ verticalAlign: 'middle' }}>
                    <td className="py-3 px-4 fw-medium">{item.tgl}</td>
                    <td><span className="badge bg-light text-dark border">{item.kode}</span></td>
                    <td>{item.jenis}</td>
                    <td className="text-center">
                      <span className="badge bg-success-subtle text-success px-3 py-2" style={{ borderRadius: '8px' }}>● {item.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card>
          <div className="text-center mb-5">
            <Button variant="outline-dark" className="px-4 py-2 fw-bold" style={{ borderRadius: '12px', borderColor: theme.primary, color: theme.primary }}>
              <Download size={18} className="me-2" /> Unduh Laporan
            </Button>
          </div>
        </motion.div>

        {/* Riwayat Laporan Section */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>
          <h5 className="fw-bold mb-3 text-dark">Riwayat Laporan</h5>
          <Card style={cardStyle} className="overflow-hidden">
            <Table hover responsive className="mb-0">
              <thead style={{ backgroundColor: '#f8f9fa' }}>
                <tr className="text-muted small text-uppercase">
                  <th className="py-3 px-4">Bulan</th>
                  <th className="py-3">File</th>
                  <th className="py-3">Tanggal Buat</th>
                  <th className="py-3">Status</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="py-3 px-4 fw-bold">Sep-25</td>
                  <td>
                    <div className="d-flex align-items-center text-primary cursor-pointer" style={{ cursor: 'pointer' }}>
                      <FileText size={16} className="me-2" />
                      <span className="text-decoration-underline">laporan_sep2025.pdf</span>
                    </div>
                  </td>
                  <td>30/09/25</td>
                  <td><span className="badge bg-info-subtle text-info px-2">Dikirim ke Kepala Lab</span></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 fw-bold">Oktober 2025</td>
                  <td>
                    <div className="d-flex align-items-center text-primary" style={{ cursor: 'pointer' }}>
                      <FileText size={16} className="me-2" />
                      <span className="text-decoration-underline">laporan_okt2025.pdf</span>
                    </div>
                  </td>
                  <td>31/10/25</td>
                  <td><span className="badge bg-secondary-subtle text-secondary px-2">Arsip</span></td>
                </tr>
              </tbody>
            </Table>
          </Card>
        </motion.div>
      </Container>
      
      {/* CSS internal untuk hover effect */}
      <style>{`
        .card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 40px rgba(0,0,0,0.12) !important;
        }
        .table tbody tr {
          transition: background-color 0.2s ease;
        }
        .badge {
          font-weight: 600;
        }
      `}</style>
    </div>
    <FooterSetelahLogin/>
    </NavbarLoginKoordinator>
  );
};

export default LaporanKoordinator;