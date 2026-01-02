import React, { useState, useRef } from 'react';
import { Modal, Button, Form } from 'react-bootstrap'; // Tambahkan import Modal
import 'bootstrap/dist/css/bootstrap.min.css';
import NavbarLoginKoordinator from './NavbarLoginKoordinator';
import FooterSetelahLogin from '../FooterSetelahLogin';

const TandaTanganKoordinator = () => {
  const [isUploadMode, setIsUploadMode] = useState(false);
  
  // State baru untuk Modal Upload
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);

  const dataSampel = [
    { id: 1, kode: 'M024', namaKlien: 'PT. Pangan Sejahtera', jenisAnalisis: 'Metabolit', kategori: 'BDM', tanggal: '5/11/2025', status: 'Menunggu Tanda Tangan' },
    { id: 2, kode: 'M025', namaKlien: 'Lab Kimia Terpadu', jenisAnalisis: 'Metabolit', kategori: 'BDP', tanggal: '5/11/2025', status: 'Menunggu Tanda Tangan' },
    { id: 3, kode: 'M026', namaKlien: 'Universitas Riset', jenisAnalisis: 'Metabolit', kategori: 'BDM', tanggal: '6/11/2025', status: 'Menunggu Tanda Tangan' },
  ];

  const customColors = {
    brown: '#a3867a',
    lightGray: '#e9ecef'
  };

  const handleActionClick = (item) => {
    if (isUploadMode) {
      setSelectedItem(item);
      setShowUploadModal(true); // Buka Modal jika dalam mode upload
    } else {
      alert(`Mendownload file untuk kode: ${item.kode}`);
    }
  };

  const handleUploadSubmit = () => {
    if (!file) {
      alert("Silakan pilih file terlebih dahulu!");
      return;
    }
    alert(`File ${file.name} berhasil diunggah untuk kode ${selectedItem.kode}`);
    // Reset state setelah upload
    setShowUploadModal(false);
    setFile(null);
  };

  return (
    <NavbarLoginKoordinator>
      <div className="container-fluid min-vh-100 p-4" style={{ backgroundColor: customColors.lightGray }}>
        <div className="card border-0 shadow-sm" style={{ borderRadius: '20px', overflow: 'hidden' }}>
          
          <div 
            className="card-header border-0 py-3" 
            style={{ 
              backgroundColor: customColors.brown, 
              color: 'white',
              borderBottomRightRadius: '50px' 
            }}
          >
            <h4 className="ms-4 mb-0 fw-normal" style={{ fontFamily: 'serif' }}>Tanda Tangan Digital</h4>
          </div>

          <div className="card-body p-5 bg-white">
            <div className="table-responsive">
              <table className="table table-bordered align-middle text-center">
                <thead className="table-light">
                  <tr>
                    <th className="py-3">Kode Sampel</th>
                    <th className="py-3">Nama Klien</th>
                    <th className="py-3">Jenis Analisis</th>
                    <th className="py-3">Kategori</th>
                    <th className="py-3">Tanggal</th>
                    <th className="py-3">Status</th>
                    <th className="py-3">Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {dataSampel.map((item, index) => (
                    <tr key={index}>
                      <td className="py-3 fw-bold">{item.kode}</td>
                      <td className="py-3 text-start ps-4">{item.namaKlien}</td>
                      <td className="py-3">{item.jenisAnalisis}</td>
                      <td className="py-3">
                        <span className="badge px-3 py-2" style={{ backgroundColor: '#f8f9fa', color: '#45352F', fontSize: '0.75rem', border: `1px solid ${customColors.brown}`, borderRadius: '10px' }}>
                          {item.kategori}
                        </span>
                      </td>
                      <td className="py-3">{item.tanggal}</td>
                      <td className="py-3 text-secondary" style={{ fontSize: '0.9rem' }}>{item.status}</td>
                      <td className="py-3">
                        <button 
                          className={`btn text-white px-4 shadow-sm`} 
                          style={{ 
                            backgroundColor: isUploadMode ? '#28a745' : customColors.brown, 
                            borderRadius: '20px', 
                            fontSize: '0.85rem',
                            transition: 'all 0.3s ease'
                          }}
                          onClick={() => handleActionClick(item)}
                        >
                          {isUploadMode ? 'Upload PDF' : 'Download'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 d-flex gap-2">
              <button 
                className="btn text-white px-4 py-2 shadow" 
                style={{ backgroundColor: customColors.brown, borderRadius: '25px' }}
                onClick={() => setIsUploadMode(!isUploadMode)}
              >
                {isUploadMode ? 'Batal Upload' : 'Mode Upload PDF'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MODAL UPLOAD PDF */}
      <Modal 
        show={showUploadModal} 
        onHide={() => setShowUploadModal(false)} 
        centered
        style={{ zIndex: 1060 }} // Menghindari modal tertutup navbar
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold" style={{ color: customColors.brown, fontFamily: 'serif' }}>
            Upload Hasil Analisis
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="px-4 pb-4">
          <div className="mb-3">
            <p className="text-muted small mb-1">KODE SAMPEL</p>
            <h5 className="fw-bold">{selectedItem?.kode}</h5>
          </div>
          <Form.Group>
            <Form.Label className="small fw-bold text-muted text-uppercase">Pilih File PDF</Form.Label>
            <Form.Control 
              type="file" 
              accept=".pdf"
              onChange={(e) => setFile(e.target.files[0])}
              className="rounded-3 shadow-sm"
            />
            <Form.Text className="text-muted">
              Pastikan file dalam format .pdf
            </Form.Text>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0 px-4 pb-4">
          <Button 
            variant="light" 
            className="rounded-pill px-4" 
            onClick={() => setShowUploadModal(false)}
          >
            Batal
          </Button>
          <Button 
            className="rounded-pill px-4 text-white shadow-sm" 
            style={{ backgroundColor: customColors.brown, border: 'none' }}
            onClick={handleUploadSubmit}
          >
            Unggah Sekarang
          </Button>
        </Modal.Footer>
      </Modal>

      <FooterSetelahLogin />
    </NavbarLoginKoordinator>
  );
};

export default TandaTanganKoordinator;