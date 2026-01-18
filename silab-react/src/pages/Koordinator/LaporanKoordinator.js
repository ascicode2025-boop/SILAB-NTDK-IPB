import React, { useEffect, useState } from 'react';
import { Container, Row, Col, Form, Button, Table, Card, Spinner } from 'react-bootstrap';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { Calendar, Download, FileText, Filter } from 'lucide-react';
import { motion } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavbarLoginKoordinator from "./NavbarLoginKoordinator";
import FooterSetelahLogin from "../tamu/FooterSetelahLogin";
import { fetchKoordinatorReport } from '../../api/koordinatorReport';
import axios from 'axios';
import { getAuthHeader } from '../../services/AuthService';
const API_URL = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';

const LaporanKoordinator = () => {
  // State untuk data dan filter
  const [chartData, setChartData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [filters, setFilters] = useState({ jenisAnalisis: [], bulan: [], tahun: [] });
  const [filterForm, setFilterForm] = useState({ jenis_analisis: '', bulan: '', tahun: '' });
  const [reportHistory, setReportHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const monthNames = [
    '', // for index 0
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  // Ambil data awal dan saat filter berubah
  const loadData = async (params = {}) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetchKoordinatorReport(params);
      // debug: log full response to console to inspect why data might be empty
      console.debug('fetchKoordinatorReport response:', res);
      if (res.success) {
        setChartData(res.data.chartData || []);
        // prefer rich bookings if provided by API
        let initialTable = res.data.bookings || res.data.tableData || [];
        // If report returned empty, try fetching bookings directly from DB
        if ((!initialTable || initialTable.length === 0)) {
          try {
            const bk = await axios.get(`${API_URL}/bookings/all`, { headers: getAuthHeader() });
            const raw = (bk && bk.data && (bk.data.data || bk.data)) || [];
            const mapped = (raw || []).map(b => ({
              tgl: b.tanggal_kirim ? new Date(b.tanggal_kirim).toLocaleDateString('id-ID') : '-',
              kode_batch: b.kode_batch || b.kode || '-',
              user_name: (b.user && (b.user.full_name || b.user.name)) || '-',
              jenis_analisis: b.jenis_analisis || '-',
              analysis_items: Array.isArray(b.analysis_items) ? b.analysis_items.map(ai => ({ nama_item: ai.nama_item || ai.nama })) : [],
              jumlah_sampel: b.jumlah_sampel || b.jumlah || 1,
              total_harga: (Number(b.jumlah_sampel || b.jumlah || 1) * 50000),
              status: b.status || '-',
              pdf_path: b.pdf_path || b.pdfPath || null,
            }));
            initialTable = mapped;
            console.debug('Fallback bookings from /api/bookings/all:', mapped);
          } catch (e) {
            console.warn('Failed to fetch /api/bookings/all:', e);
          }
        }
        // If still empty, provide a non-persistent placeholder example row to show layout
        if ((!initialTable || initialTable.length === 0)) {
          initialTable = [{
            tgl: new Date().toLocaleDateString('id-ID'),
            kode_batch: 'EX-PLACEHOLDER-001',
            user_name: 'Contoh Pemesan',
            jenis_analisis: 'Hematologi',
            analysis_items: [{ nama_item: 'Hemoglobin' }, { nama_item: 'Eritrosit' }],
            jumlah_sampel: 2,
            total_harga: 100000,
            status: 'contoh',
            pdf_path: null
          }];
        }
        setTableData(initialTable);
        // Sort tahun dari terbaru
        let tahunList = (res.data.filters?.tahun || []).slice().sort((a, b) => b - a);
        setFilters({
          jenisAnalisis: res.data.filters?.jenisAnalisis || [],
          bulan: res.data.filters?.bulan || [],
          tahun: tahunList
        });
        setReportHistory(res.data.reportHistory || []);
      }
    } catch (e) {
      console.error('Gagal load koordinator report:', e);
      setErrorMsg('Gagal memuat data laporan. Periksa apakah backend berjalan di http://127.0.0.1:8000 dan Anda sudah login. Lihat console untuk detail.');
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  // Handler filter
  const handleChange = (e) => {
    setFilterForm({ ...filterForm, [e.target.name]: e.target.value });
  };
  const handleFilter = (e) => {
    e.preventDefault();
    loadData(filterForm);
  };

  // Styling
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
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Form onSubmit={handleFilter}>
              <Row className="mb-4 g-3 align-items-end">
                <Col lg={4} md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold text-dark d-flex align-items-center mb-2">
                      <Filter size={16} className="me-2" /> Jenis Analisis
                    </Form.Label>
                    <Form.Select
                      name="jenis_analisis"
                      value={filterForm.jenis_analisis}
                      onChange={handleChange}
                      className="shadow-sm border-0 py-2 px-3"
                      style={{ borderRadius: '12px' }}
                      disabled={filters.jenisAnalisis.length === 0}
                    >
                      <option value="">{filters.jenisAnalisis.length === 0 ? 'Tidak ada data' : 'Semua'}</option>
                      {filters.jenisAnalisis.map((j, i) => (
                        <option key={i} value={j}>{j}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col lg={3} md={6}>
                  <Form.Label className="fw-bold text-dark mb-2">Bulan</Form.Label>
                  <div className="position-relative">
                    <Form.Select
                      name="bulan"
                      value={filterForm.bulan}
                      onChange={handleChange}
                      className="shadow-sm border-0 py-2"
                      style={{ borderRadius: '12px' }}
                      disabled={filters.bulan.length === 0}
                    >
                      <option value="">{filters.bulan.length === 0 ? 'Tidak ada data' : 'Semua'}</option>
                      {filters.bulan.map((b, i) => (
                        <option key={i} value={b}>{monthNames[Number(b)] || b}</option>
                      ))}
                    </Form.Select>
                    <Calendar className="position-absolute end-0 top-50 translate-middle-y me-3 text-muted" size={18} />
                  </div>
                </Col>
                <Col lg={3} md={6}>
                  <Form.Label className="fw-bold text-dark mb-2">Tahun</Form.Label>
                  <div className="position-relative">
                    <Form.Select
                      name="tahun"
                      value={filterForm.tahun}
                      onChange={handleChange}
                      className="shadow-sm border-0 py-2"
                      style={{ borderRadius: '12px' }}
                      disabled={filters.tahun.length === 0}
                    >
                      <option value="">{filters.tahun.length === 0 ? 'Tidak ada data' : 'Semua'}</option>
                      {filters.tahun.map((t, i) => (
                        <option key={i} value={t}>{t}</option>
                      ))}
                    </Form.Select>
                    <Calendar className="position-absolute end-0 top-50 translate-middle-y me-3 text-muted" size={18} />
                  </div>
                </Col>
                <Col lg={2} md={6}>
                  <Button type="submit" className="w-100 border-0 py-2 fw-bold" style={{ backgroundColor: theme.primary, borderRadius: '12px', boxShadow: '0 4px 12px rgba(141, 118, 107, 0.3)' }}>
                    {loading ? <Spinner size="sm" animation="border" /> : 'Tampilkan'}
                  </Button>
                </Col>
              </Row>
            </Form>
          </motion.div>

          {/* Chart Section */}
          {errorMsg && (
            <div className="mb-3">
              <div className="alert alert-danger">{errorMsg}</div>
            </div>
          )}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }}>
            <Card className="mb-5 p-3" style={cardStyle}>
              <Card.Body>
                <div className="d-flex justify-content-between align-items-start mb-4">
                  <div>
                    <h5 className="fw-bold mb-0 text-dark" style={{ letterSpacing: '-0.5px' }}>Aktivitas Lab</h5>
                    <small className="text-muted">Jumlah pesanan (booking) per kuartal</small>
                  </div>
                </div>
                <div style={{ width: '100%', height: 300 }}>
                  <ResponsiveContainer>
                    <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <Tooltip cursor={{ fill: '#f5f5f5' }} contentStyle={{ borderRadius: '10px', border: 'none', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }} />
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fill: '#666', fontSize: 12 }} label={{ value: 'Jumlah Pesanan', angle: -90, position: 'insideLeft', fill: '#666', fontSize: 12 }} />
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
                    <th className="py-3">Kode Batch</th>
                    <th className="py-3">Pemesan</th>
                    <th className="py-3">Jenis Analisis</th>
                    <th className="py-3">Parameter</th>
                    <th className="py-3 text-center">Jumlah</th>
                    <th className="py-3 text-end">Total Harga</th>
                    <th className="py-3 text-center">Status</th>
                    <th className="py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody className="border-top-0">
                  {tableData.length === 0 && (
                    <tr><td colSpan={9} className="text-center py-4 text-muted">Tidak ada data</td></tr>
                  )}
                  {tableData.map((item, i) => (
                    <tr key={i} style={{ verticalAlign: 'middle' }}>
                      <td className="py-3 px-4 fw-medium">{item.tgl}</td>
                      <td><span className="badge bg-light text-dark border">{item.kode_batch || item.kode}</span></td>
                      <td>{item.user_name || '-'}</td>
                      <td>{item.jenis_analisis || item.jenis}</td>
                      <td>
                        <div className="d-flex gap-1 flex-wrap">
                          {(item.analysis_items || []).map((ai, idx) => (
                            <span key={idx} className="badge bg-light text-dark border fw-normal">{ai.nama_item}</span>
                          ))}
                        </div>
                      </td>
                      <td className="text-center">{item.jumlah_sampel || '-'}</td>
                      <td className="text-end">Rp {(item.total_harga || 0).toLocaleString('id-ID')}</td>
                      <td className="text-center">
                        <span className="badge bg-success-subtle text-success px-3 py-2" style={{ borderRadius: '8px' }}>● {item.status}</span>
                      </td>
                      <td>
                        <div className="d-flex gap-2">
                          {item.pdf_path ? (
                            <a className="btn btn-sm btn-outline-primary" href={`${(process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/api$/, '')}/storage/${item.pdf_path}`} target="_blank" rel="noreferrer">Preview</a>
                          ) : (
                            <button className="btn btn-sm btn-outline-secondary" disabled>Preview</button>
                          )}
                          {item.pdf_path ? (
                            <a className="btn btn-sm btn-primary" href={`${(process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/api$/, '')}/storage/${item.pdf_path}`} target="_blank" rel="noreferrer">Download</a>
                          ) : (
                            <button className="btn btn-sm btn-secondary" disabled>Download</button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
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
                  {reportHistory.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-4 text-muted">Tidak ada riwayat laporan</td></tr>
                  )}
                  {reportHistory.map((item, i) => (
                    <tr key={i} style={{ verticalAlign: 'middle' }}>
                      <td className="py-3 px-4 fw-bold">{item.bulan}</td>
                      <td>
                        <div className="d-flex flex-column gap-2">
                          {(item.files || []).map((f, idx) => {
                            const apiRoot = (process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/api$/, '');
                            const link = f.url && (f.url.startsWith('http') || f.url.startsWith('https')) ? f.url : (f.url ? `${apiRoot}${f.url}` : null);
                            return link ? (
                              <a key={idx} className="d-flex align-items-center text-primary" href={link} target="_blank" rel="noreferrer">
                                <FileText size={16} className="me-2" />
                                <span className="text-decoration-underline">{f.label}</span>
                              </a>
                            ) : (
                              <div key={idx} className="d-flex align-items-center text-muted">
                                <FileText size={16} className="me-2" />
                                <span>{f.label}</span>
                              </div>
                            );
                          })}
                        </div>
                      </td>
                      <td>{item.tanggal_buat}</td>
                      <td><span className="badge bg-info-subtle text-info px-2">{item.status}</span></td>
                    </tr>
                  ))}
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
      <FooterSetelahLogin />
    </NavbarLoginKoordinator>
  );
};

export default LaporanKoordinator;