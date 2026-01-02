import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Form, InputGroup, Modal } from 'react-bootstrap';
import { ShieldCheck, Edit3, Trash2, Plus, Search, Users, Settings, UserCircle, EyeOff, Eye, X } from 'lucide-react';
import { motion } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavbarLoginKoordinator from './NavbarLoginKoordinator';
import FooterSetelahLogin from '../FooterSetelahLogin';

const ManajemenAkun = () => {
  // State untuk Modal dan Visibilitas Password
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Data Dummy Pengguna
  const users = [
    { id: 1, name: 'Budi Santoso', email: 'budi@lab.com', role: 'Super Admin', status: 'Aktif', color: '#8D766B' },
    { id: 2, name: 'Siti Aminah', email: 'siti@lab.com', role: 'Koordinator', status: 'Aktif', color: '#A68A7D' },
    { id: 3, name: 'Dr. Ahmad', email: 'ahmad@lab.com', role: 'Kepala Lab', status: 'Aktif', color: '#634E44' },
    { id: 4, name: 'Rani Wijaya', email: 'rani@lab.com', role: 'Analis', status: 'Non-Aktif', color: '#BC9F8B' },
  ];

  const theme = {
    primary: '#8D766B',
    dark: '#3E322E',
    accent: '#D4C7C1',
    background: '#F7F5F4',
    white: '#FFFFFF',
  };

  const cardStyle = {
    borderRadius: '20px',
    border: '1px solid rgba(141, 118, 107, 0.1)',
    boxShadow: '0 10px 30px rgba(62, 50, 46, 0.05)',
    backgroundColor: theme.white,
  };

  return (
    <NavbarLoginKoordinator>
      <div style={{ backgroundColor: theme.background, minHeight: '100vh', padding: '40px 0', color: theme.dark }}>
        <Container>
          {/* Header Section */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Row className="mb-5 align-items-center">
              <Col>
                <div className="d-flex align-items-center gap-3 mb-2">
                  <div style={{ width: '40px', height: '4px', backgroundColor: theme.primary, borderRadius: '2px' }}></div>
                  <h6 className="text-uppercase fw-bold mb-0" style={{ color: theme.primary, letterSpacing: '2px', fontSize: '13px' }}>Administrator Only</h6>
                </div>
                <h2 className="fw-bold mb-1" style={{ fontSize: '2.2rem' }}>Manajemen Akun</h2>
                <p className="text-muted opacity-75">Kelola hak akses dan identitas digital personil laboratorium</p>
              </Col>
              <Col xs="auto">
                <Button 
                  onClick={() => setShowModal(true)}
                  className="d-flex align-items-center gap-2 border-0 py-2 px-4 fw-bold shadow"
                  style={{ backgroundColor: theme.primary, borderRadius: '14px' }}
                  id="btn-tambah"
                >
                  <Plus size={20} /> Tambah Akun
                </Button>
              </Col>
            </Row>
          </motion.div>

          {/* Statistik Ringkas */}
          <Row className="mb-5 g-4">
            {[
              { label: 'Total Pengguna', value: '22 User', icon: <Users size={24} />, color: theme.primary },
              { label: 'Admin Aktif', value: '5 Akun', icon: <ShieldCheck size={24} />, color: theme.dark },
              { label: 'Sistem Terintegrasi', value: '100%', icon: <Settings size={24} />, color: theme.accent }
            ].map((stat, idx) => (
              <Col md={4} key={idx}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.1 }}>
                  <Card style={cardStyle} className="p-2 border-0 stat-card shadow-sm">
                    <Card.Body className="d-flex align-items-center">
                      <div className="p-3 rounded-4 me-3" style={{ backgroundColor: `${stat.color}15`, color: stat.color }}>
                        {stat.icon}
                      </div>
                      <div>
                        <h6 className="text-muted mb-0 small text-uppercase fw-bold">{stat.label}</h6>
                        <h4 className="fw-bold mb-0">{stat.value}</h4>
                      </div>
                    </Card.Body>
                  </Card>
                </motion.div>
              </Col>
            ))}
          </Row>

          {/* Tabel Utama */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
            <Card style={cardStyle} className="overflow-hidden border-0 shadow-lg">
              <Card.Header className="bg-white border-0 p-4">
                <InputGroup className="rounded-4 overflow-hidden" style={{ border: `1.5px solid ${theme.accent}`, maxWidth: '400px' }}>
                  <InputGroup.Text className="bg-transparent border-0 pe-0">
                    <Search size={18} className="text-muted" />
                  </InputGroup.Text>
                  <Form.Control 
                    placeholder="Cari berdasarkan nama atau email..." 
                    className="bg-transparent border-0 py-2 shadow-none"
                    style={{ fontSize: '14px' }}
                  />
                </InputGroup>
              </Card.Header>
              
              <Table hover responsive className="mb-0 custom-table">
                <thead style={{ backgroundColor: '#FBF9F8' }}>
                  <tr className="small text-uppercase" style={{ color: theme.primary, letterSpacing: '1px' }}>
                    <th className="py-4 px-4">Informasi Pengguna</th>
                    <th className="py-4">Jabatan / Role</th>
                    <th className="py-4 text-center">Status Akses</th>
                    <th className="py-4 text-center">Navigasi</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} style={{ verticalAlign: 'middle' }}>
                      <td className="py-4 px-4">
                        <div className="d-flex align-items-center">
                          <div 
                            className="me-3 d-flex align-items-center justify-content-center rounded-circle shadow-sm"
                            style={{ width: '45px', height: '45px', backgroundColor: `${user.color}15`, color: user.color }}
                          >
                            <UserCircle size={28} strokeWidth={1.5} />
                          </div>
                          <div>
                            <div className="fw-bold">{user.name}</div>
                            <div className="text-muted small">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <Badge bg="none" style={{ backgroundColor: `${user.color}15`, color: user.color, borderRadius: '8px', padding: '8px 12px', fontWeight: '600', fontSize: '11px', border: `1px solid ${user.color}25` }}>
                          {user.role}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <div className="d-flex align-items-center justify-content-center gap-2">
                          <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: user.status === 'Aktif' ? '#2ECC71' : '#BDC3C7' }}></div>
                          <span className="fw-medium" style={{ fontSize: '13px' }}>{user.status}</span>
                        </div>
                      </td>
                      <td className="text-center">
                        <div className="d-flex justify-content-center gap-2">
                          <button className="action-btn edit"><Edit3 size={16} /></button>
                          <button className="action-btn settings"><Settings size={16} /></button>
                          <button className="action-btn delete"><Trash2 size={16} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card>
          </motion.div>
        </Container>

        {/* MODAL TAMBAH AKUN */}
        <Modal 
          show={showModal} 
          onHide={() => setShowModal(false)} 
          centered 
          contentClassName="border-0 shadow-lg custom-modal-content"
          style={{ zIndex: 1060 }}
        >
          <div className="p-2 text-end">
            <Button variant="link" onClick={() => setShowModal(false)} className="text-muted p-2 shadow-none">
              <X size={24} />
            </Button>
          </div>
          <Modal.Body className="px-4 px-md-5 pb-5 pt-0">
            <Form>
              <Form.Group className="mb-3">
                <Form.Label className="text-muted small ms-1">Username</Form.Label>
                <Form.Control type="text" className="custom-input shadow-sm" placeholder="Masukkan username" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-muted small ms-1">Email</Form.Label>
                <Form.Control type="email" className="custom-input shadow-sm" placeholder="Masukkan email" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-muted small ms-1">Institusi</Form.Label>
                <Form.Control type="text" className="custom-input shadow-sm" placeholder="Nama institusi" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-muted small ms-1">Nomor telfon</Form.Label>
                <Form.Control type="text" className="custom-input shadow-sm" placeholder="08xxxxxxxx" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-muted small ms-1">Role</Form.Label>
                <Form.Control type="text" className="custom-input shadow-sm" placeholder="Pilih peran" />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="text-muted small ms-1">Password</Form.Label>
                <InputGroup className="shadow-sm rounded-pill overflow-hidden border">
                  <Form.Control 
                    type={showPassword ? "text" : "password"} 
                    style={{ border: 'none' }} 
                    className="py-2 px-3 shadow-none" 
                  />
                  <InputGroup.Text 
                    className="bg-white border-0 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <Eye size={18} className="text-muted" /> : <EyeOff size={18} className="text-muted" />}
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="text-muted small ms-1">Confirm Password</Form.Label>
                <InputGroup className="shadow-sm rounded-pill overflow-hidden border">
                  <Form.Control 
                    type={showConfirmPassword ? "text" : "password"} 
                    style={{ border: 'none' }} 
                    className="py-2 px-3 shadow-none" 
                  />
                  <InputGroup.Text 
                    className="bg-white border-0 cursor-pointer"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? <Eye size={18} className="text-muted" /> : <EyeOff size={18} className="text-muted" />}
                  </InputGroup.Text>
                </InputGroup>
              </Form.Group>

              <div className="text-center mt-4">
                <Button 
                  className="w-50 border-0 py-2 shadow-sm btn-submit-cokelat" 
                  style={{ backgroundColor: '#92786D', borderRadius: '15px', fontWeight: '500' }}
                  onClick={() => setShowModal(false)}
                >
                  Buat akun
                </Button>
              </div>
            </Form>
          </Modal.Body>
        </Modal>

        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');
          
          body { font-family: 'Plus Jakarta Sans', sans-serif; }

          .custom-modal-content {
            border-radius: 30px !important;
          }

          .custom-input {
            border-radius: 20px !important;
            border: 1px solid #ced4da !important;
            padding: 0.6rem 1rem !important;
            font-size: 14px;
          }

          .custom-input:focus {
            border-color: ${theme.primary} !important;
            box-shadow: 0 0 0 0.2rem rgba(141, 118, 107, 0.25) !important;
          }

          .stat-card { transition: all 0.3s ease; }
          .stat-card:hover { transform: translateY(-8px); box-shadow: 0 15px 35px rgba(62, 50, 46, 0.1) !important; }

          .custom-table tbody tr { transition: all 0.2s ease; border-bottom: 1px solid rgba(141, 118, 107, 0.05); }
          .custom-table tbody tr:hover { background-color: #FDFBFA !important; }

          .action-btn {
            width: 36px; height: 36px; border-radius: 10px;
            border: 1px solid ${theme.accent}; background: white;
            display: flex; align-items: center; justify-content: center;
            transition: all 0.2s ease; color: ${theme.primary};
          }
          .action-btn:hover { transform: translateY(-2px); box-shadow: 0 4px 8px rgba(0,0,0,0.1); }
          .action-btn.edit:hover { color: #2980B9; border-color: #2980B9; }
          .action-btn.settings:hover { color: ${theme.dark}; border-color: ${theme.dark}; }
          .action-btn.delete:hover { color: #E74C3C; border-color: #E74C3C; }

          #btn-tambah:hover { filter: brightness(1.1); transform: scale(1.02); }
          .btn-submit-cokelat:hover { opacity: 0.9; transform: scale(1.02); }
          .cursor-pointer { cursor: pointer; }
          .modal-backdrop { z-index: 1050 !important; }
        `}</style>
      </div>
      <FooterSetelahLogin/>
    </NavbarLoginKoordinator>
  );
};

export default ManajemenAkun;