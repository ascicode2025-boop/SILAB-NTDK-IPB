import React, { useState } from 'react';
import { Container, Row, Col, Card, Table, Button, Form, InputGroup } from 'react-bootstrap';
import { Search, FileText, Download, Calendar, Filter, Archive, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import 'bootstrap/dist/css/bootstrap.min.css';
import NavbarLoginKepala from "./NavbarLoginKepala";
import FooterSetelahLogin from "../FooterSetelahLogin";

const LaporanKepala = () => {
  // Data Dummy Laporan sesuai gambar referensi
  const reportData = [
    { kode: 'M014', klien: 'Mahasiswa', jenis: 'Metabolit', status: 'Selesai' },
    { kode: 'H022', klien: 'Perusahaan A', jenis: 'Hematologi', status: 'Selesai' },
    { kode: 'P009', klien: 'Dosen UGM', jenis: 'Proksimat', status: 'Selesai' },
    { kode: 'M088', klien: 'Umum', jenis: 'Mikrobiologi', status: 'Selesai' },
  ];

  const theme = {
    primary: '#8D766B',      // Cokelat SILAB
    btnCokelat: '#9E8379',   // Cokelat tombol dari gambar
    btnAbu: '#7F8C8D',       // Abu-abu tombol Arsip
    background: '#F7F5F4',
    white: '#FFFFFF',
  };

  return (
    <NavbarLoginKepala>
      <div style={{ backgroundColor: theme.background, minHeight: '100vh', padding: '40px 0' }}>
        <Container>
          {/* Filter Section (Berdasarkan Gambar d14b0c) */}
          <Card className="border-0 shadow-sm p-4 mb-4" style={{ borderRadius: '20px' }}>
            <Row className="align-items-end g-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Jenis Analisis:</Form.Label>
                  <Form.Select className="custom-input shadow-sm">
                    <option>Hematologi</option>
                    <option>Metabolit</option>
                    <option>Proksimat</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Bulan:</Form.Label>
                  <InputGroup className="shadow-sm rounded-pill border overflow-hidden">
                    <Form.Control type="text" className="border-0 py-2 shadow-none" placeholder="Pilih Bulan" />
                    <InputGroup.Text className="bg-white border-0">
                      <div className="icon-calendar-bg"><Calendar size={16} color="white" /></div>
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="small fw-bold text-muted">Tahun:</Form.Label>
                  <InputGroup className="shadow-sm rounded-pill border overflow-hidden">
                    <Form.Control type="text" className="border-0 py-2 shadow-none" placeholder="Pilih Tahun" />
                    <InputGroup.Text className="bg-white border-0">
                      <div className="icon-calendar-bg"><Calendar size={16} color="white" /></div>
                    </InputGroup.Text>
                  </InputGroup>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Button className="w-100 btn-tampilkan">Tampilkan</Button>
              </Col>
            </Row>
          </Card>

          {/* Search & Table Section */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            <div className="mb-3 d-flex justify-content-start">
               <InputGroup className="rounded-pill border px-2 bg-white shadow-sm" style={{ maxWidth: '300px' }}>
                  <Form.Control placeholder="Search" className="bg-transparent border-0 py-2 shadow-none small" />
                  <InputGroup.Text className="bg-transparent border-0 text-muted">
                    <Search size={16} />
                  </InputGroup.Text>
               </InputGroup>
            </div>

            <Card className="border-0 shadow-sm overflow-hidden" style={{ borderRadius: '20px' }}>
              <Table responsive hover className="mb-0 custom-table-style text-center align-middle">
                <thead>
                  <tr>
                    <th>Kode Sampel</th>
                    <th>Klien</th>
                    <th>Jenis Analisis</th>
                    <th>Status</th>
                    <th style={{ width: '250px' }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.map((item, index) => (
                    <tr key={index}>
                      <td className="py-4 border-end">{item.kode}</td>
                      <td className="py-4 border-end">{item.klien}</td>
                      <td className="py-4 border-end">{item.jenis}</td>
                      <td className="py-4 border-end">{item.status}</td>
                      <td className="py-4 d-flex justify-content-center gap-2">
                        <Button className="btn-action-unduh">Unduh</Button>
                        <Button className="btn-action-arsip">Arsip</Button>
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

          .custom-input {
            border-radius: 20px !important;
            padding: 0.6rem 1rem !important;
            font-size: 14px;
          }

          .icon-calendar-bg {
            background-color: ${theme.btnCokelat};
            padding: 5px;
            border-radius: 8px;
            display: flex;
            align-items: center;
          }

          .btn-tampilkan {
            background-color: ${theme.btnCokelat} !important;
            border: none !important;
            border-radius: 50px !important;
            padding: 10px !important;
            font-weight: 600 !important;
            box-shadow: 0 4px 10px rgba(0,0,0,0.1);
          }

          .custom-table-style thead th {
            font-weight: 800;
            padding: 20px;
            background-color: #FFFFFF;
            border-bottom: 1px solid #F0F0F0;
          }

          .btn-action-unduh {
            background-color: ${theme.btnCokelat} !important;
            border: none !important;
            padding: 6px 25px !important;
            border-radius: 50px !important;
            font-size: 14px !important;
            box-shadow: 0 3px 8px rgba(0,0,0,0.15);
          }

          .btn-action-arsip {
            background-color: ${theme.btnAbu} !important;
            border: none !important;
            padding: 6px 25px !important;
            border-radius: 50px !important;
            font-size: 14px !important;
            box-shadow: 0 3px 8px rgba(0,0,0,0.15);
          }

          .border-end { border-right: 1px solid #F0F0F0 !important; }
        `}</style>
      </div>
      <FooterSetelahLogin />
    </NavbarLoginKepala>
  );
};

export default LaporanKepala;