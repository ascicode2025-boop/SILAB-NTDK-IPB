import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup } from 'react-bootstrap';
import { Search, Download, Calendar, Filter, FileSpreadsheet } from 'lucide-react';
import { motion } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavbarLogin from './NavbarLoginKlien';  
import FooterSetelahLogin from "../tamu/FooterSetelahLogin";

const RiwayatAnalisisKlien = () => {

  // State untuk data riwayat
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      setLoading(true);
      try {
        const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        // Ambil data booking yang statusnya selesai/lunas/ditandatangani
        const res = await fetch(`${apiBase}/bookings`, { headers });
        const json = await res.json();
        if (json && json.success) {
          const finished = (json.data || []).filter(b => {
            const st = (b.status || '').toLowerCase();
            return [
              'selesai',
              'lunas',
              'paid',
              'ditandatangani',
              'verified'
            ].includes(st);
          });
          // Log isi analysis_items untuk debugging
          finished.forEach((b, idx) => {
            console.log(`Booking #${b.id} full object:`, b);
          });
          // Map ke format tampilan
          setHistoryData(finished.map((b, idx) => {
            // ...existing code...
            let namaAnalisis = '-';
            let jenisAnalisis = '-';
            if (b.analysis_items && b.analysis_items.length > 0) {
              const arrJenis = b.analysis_items.map(i => (i.jenis_analisis || i.jenisAnalisis || '').toLowerCase().trim()).filter(j => j);
              const namaUnik = [...new Set(arrJenis)].filter(j => j && j !== '-');
              namaAnalisis = namaUnik.length > 0 ? namaUnik.map(j => j.charAt(0).toUpperCase() + j.slice(1)).join(', ') : '-';
              jenisAnalisis = b.analysis_items.map(i => i.nama_item || i.namaItem || '-').join(', ');
            }
            return {
              no: idx + 1,
              kode_batch: b.kode_batch || '-',
              jenis: jenisAnalisis,
              tanggal: b.updated_at ? new Date(b.updated_at).toLocaleDateString('id-ID') : '-',
              status: b.status,
              pdf_path: b.pdf_path,
              invoice_path: b.invoice_path || (b.invoice && b.invoice.file_path),
              id: b.id
            };
          }));
        }
      } catch (e) {
        setHistoryData([]);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const theme = {
    primary: '#8D766B',      // Cokelat SILAB
    btnCokelat: '#9E8379',   // Cokelat tombol dari gambar
    background: '#F7F5F4',
    white: '#FFFFFF',
  };

  return (
    <NavbarLogin>
      <div style={{ backgroundColor: theme.background, minHeight: '100vh', padding: '40px 0' }}>
        <Container>
          {/* Header Section */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-5">
            <Row className="align-items-center">
              <Col>
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div style={{ width: '40px', height: '4px', backgroundColor: theme.primary, borderRadius: '2px' }}></div>
                  <h6 className="text-uppercase fw-bold mb-0" style={{ color: theme.primary, letterSpacing: '2px', fontSize: '12px' }}>SILAB-NTDK System</h6>
                </div>
                <h2 className="fw-bold mb-1">Riwayat Analisis</h2>
                <p className="text-muted small">Hasil pengujian laboratorium yang telah divalidasi dan selesai.</p>
              </Col>
              {/* Hapus tombol download PDF/Excel */}
            </Row>
          </motion.div>

          {/* Table Card - Desain sesuai Gambar Referensi */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '20px' }}>
              <Card.Header className="bg-white p-4 border-0">
                <Row className="align-items-center">
                  <Col md={4}>
                    <InputGroup className="rounded-pill border px-2 bg-light">
                      <InputGroup.Text className="bg-transparent border-0 text-muted">
                        <Search size={18} />
                      </InputGroup.Text>
                      <Form.Control 
                        placeholder="Cari analisis..." 
                        className="bg-transparent border-0 py-2 shadow-none small"
                      />
                    </InputGroup>
                  </Col>
                  <Col className="text-end">
                    <Button variant="link" className="text-decoration-none text-muted small fw-bold">
                      <Filter size={16} className="me-2" /> Filter
                    </Button>
                  </Col>
                </Row>
              </Card.Header>

              <Table responsive hover className="mb-0 custom-table-style">
                <thead>
                  <tr className="text-center align-middle">
                    <th style={{ width: '60px' }}>No</th>
                    <th>Kode Batch</th>
                    <th>Jenis Analisis</th>
                    <th>Tanggal Selesai</th>
                    <th>Status</th>
                    <th style={{ width: '160px' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={6} className="text-center py-5 text-muted">Memuat data...</td></tr>
                  ) : historyData.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-5 text-muted">Belum ada riwayat analisis selesai.</td></tr>
                  ) : historyData.map((item) => (
                    <tr key={item.no} className="text-center align-middle">
                      <td className="py-4 border-end">{item.no}</td>
                      <td className="py-4 border-end">{item.kode_batch}</td>
                      <td className="py-4 border-end">{item.jenis}</td>
                      <td className="py-4 border-end">{item.tanggal}</td>
                      <td className="py-4 border-end">
                        {['lunas','paid','verified'].includes((item.status||'').toLowerCase()) ? (
                          <span className="badge bg-success">Lunas</span>
                        ) : (item.status||'').toLowerCase() === 'ditandatangani' ? (
                          <span className="badge bg-primary">Ditandatangani</span>
                        ) : (
                          <span className="badge bg-info text-dark">Selesai</span>
                        )}
                      </td>
                      <td className="py-4 d-flex flex-wrap gap-2 justify-content-center align-items-center">
                        {item.pdf_path && (
                          <a className="btn btn-lihat-custom" href={`${process.env.REACT_APP_API_BASE_URL ? process.env.REACT_APP_API_BASE_URL.replace(/\/api$/, '') : 'http://127.0.0.1:8000'}/storage/${item.pdf_path}`} target="_blank" rel="noreferrer">Lihat Hasil</a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </motion.div>
        </Container>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
          
          body { font-family: 'Plus Jakarta Sans', sans-serif; }

          /* Style Tabel sesuai Gambar */
          .custom-table-style thead th {
            font-weight: 800;
            padding: 25px;
            background-color: #FFFFFF;
            border-bottom: 1px solid #F0F0F0;
            font-size: 1.1rem;
          }

          .custom-table-style tbody tr {
            transition: background-color 0.2s;
          }

          .custom-table-style tbody td {
            font-size: 1rem;
            color: #333;
          }

          /* Style Tombol LIHAT sesuai Gambar */
          .btn-lihat-custom {
            background-color: ${theme.btnCokelat} !important;
            border: none !important;
            padding: 8px 45px !important;
            border-radius: 50px !important; /* Oval sempurna */
            font-weight: 500 !important;
            font-size: 1rem !important;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.15) !important;
            transition: all 0.3s ease !important;
          }

          .btn-lihat-custom:hover {
            transform: translateY(-2px);
            box-shadow: 0 6px 15px rgba(0, 0, 0, 0.2) !important;
            filter: brightness(1.1);
          }

          /* Style Tombol Export */
          .btn-export {
            background-color: #FFFFFF;
            color: ${theme.primary};
            border: 1px solid ${theme.primary};
            border-radius: 12px;
            font-weight: 600;
            padding: 8px 20px;
            transition: 0.3s;
          }

          .btn-export:hover {
            background-color: ${theme.primary};
            color: #FFF;
          }
        `}</style>
      </div>
      <FooterSetelahLogin />
    </NavbarLogin>
  );
};

export default RiwayatAnalisisKlien;