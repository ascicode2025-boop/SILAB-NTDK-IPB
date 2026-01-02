import React from 'react';
import NavbarLogin from './NavbarLoginKlien';
import FooterSetelahLogin from '../FooterSetelahLogin';
import { motion } from 'framer-motion';
import { Copy, Clock, CheckCircle, Wallet, Calendar, UploadCloud, RefreshCw } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

const PembayaranKlien = () => {
  const data = {
    vaNumber: "02835230893",
    expiryDate: "27 Oktober 2025, 13:00 WIB",
    method: "Bank Mandiri",
    total: "100.000"
  };

  const theme = {
    primary: '#483D3F', // Cokelat Tua SILAB
    secondary: '#8D766B', // Cokelat Muda
    background: '#F7F5F4', // Krem Lembut
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(data.vaNumber);
    // Menggunakan alert bawaan atau bisa diganti toast
    alert("Nomor VA berhasil disalin!");
  };

  return (
    <NavbarLogin>
      <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center py-5" 
           style={{ backgroundColor: theme.background }}>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="card border-0 shadow-lg p-4 p-md-5" 
          style={{ width: '100%', maxWidth: '500px', borderRadius: '24px', backgroundColor: '#ffffff' }}
        >
          
          {/* Header & Status */}
          <div className="text-center mb-4">
            <h4 className="fw-bold mb-1" style={{ color: theme.primary }}>Pembayaran</h4>
            <p className="text-muted small">Selesaikan transaksi Anda agar pesanan diproses</p>
          </div>

          {/* Progress Stepper Modern */}
          <div className="d-flex justify-content-between align-items-center mb-5 position-relative px-4">
            <div className="text-center z-1">
              <div className="rounded-circle d-flex align-items-center justify-content-center mx-auto shadow" 
                   style={{ width: '50px', height: '50px', backgroundColor: theme.primary, color: 'white' }}>
                <Clock size={24} />
              </div>
              <small className="d-block mt-2 fw-bold" style={{ fontSize: '12px', color: theme.primary }}>Menunggu</small>
            </div>
            
            <div className="position-absolute top-50 start-50 translate-middle w-50" 
                 style={{ height: '3px', backgroundColor: '#E9E9E9', zIndex: 0, marginTop: '-12px' }}>
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '50%' }}
                  style={{ height: '100%', backgroundColor: theme.secondary }}
                />
            </div>
            
            <div className="text-center z-1">
              <div className="rounded-circle bg-white border d-flex align-items-center justify-content-center mx-auto shadow-sm" 
                   style={{ width: '50px', height: '50px', color: '#D1D1D1' }}>
                <CheckCircle size={24} />
              </div>
              <small className="d-block mt-2 text-muted fw-medium" style={{ fontSize: '12px' }}>Berhasil</small>
            </div>
          </div>

          {/* VA Card Section */}
          <div className="mb-4 p-4 rounded-4" style={{ backgroundColor: '#FDFBFA', border: '1.5px dashed #E5DEDC' }}>
            <div className="d-flex justify-content-between align-items-start mb-2">
                <span className="text-muted small fw-bold text-uppercase" style={{ letterSpacing: '1px' }}>Nomor Virtual Account</span>
                <img src="https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg" alt="Mandiri" style={{ height: '15px' }} />
            </div>
            <div className="d-flex align-items-center justify-content-between bg-white p-3 rounded-3 border shadow-sm">
              <h3 className="fw-bold mb-0" style={{ letterSpacing: '3px', color: '#2d3436', fontSize: '1.5rem' }}>{data.vaNumber}</h3>
              <button onClick={copyToClipboard} className="btn p-2 text-primary border-0 bg-light rounded-circle" title="Salin nomor">
                <Copy size={18} style={{ color: theme.secondary }} />
              </button>
            </div>
          </div>

          {/* Info Expiry */}
          <div className="text-center mb-4">
             <div className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill bg-danger-subtle text-danger border border-danger-subtle small fw-bold">
                <Clock size={14} className="animate-pulse" />
                Bayar sebelum: {data.expiryDate}
             </div>
          </div>

          {/* Detail Tagihan */}
          <div className="w-100 mb-4 p-3 rounded-4 border bg-light-subtle">
            <div className="d-flex justify-content-between py-2 border-bottom border-secondary-subtle">
              <span className="text-muted small">Metode Pembayaran</span>
              <span className="fw-bold text-dark">{data.method}</span>
            </div>
            <div className="d-flex justify-content-between pt-3">
              <span className="text-muted small">Total yang harus dibayar</span>
              <span className="fs-4 fw-bold text-dark" style={{ color: theme.primary }}>
                <span className="fs-6 fw-medium me-1">Rp</span>{data.total}
              </span>
            </div>
          </div>

          {/* Tombol Aksi */}
          <div className="d-grid gap-3">
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn py-3 rounded-pill fw-bold shadow-sm d-flex align-items-center justify-content-center gap-2"
              style={{ backgroundColor: theme.primary, color: 'white', border: 'none' }}
            >
              <UploadCloud size={20} />
              Unggah Bukti Pembayaran
            </motion.button>
            
            <button className="btn btn-outline-light py-2 rounded-pill text-muted small fw-medium border-0 d-flex align-items-center justify-content-center gap-2">
              <RefreshCw size={14} />
              Cek Status Otomatis
            </button>
          </div>
        </motion.div>
      </div>

      <style>{`
        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: .5; }
        }
        .z-1 { z-index: 1; }
        .bg-light-subtle { background-color: #fcfcfc; }
      `}</style>
      
      <FooterSetelahLogin />  
    </NavbarLogin>
  );
};

export default PembayaranKlien;