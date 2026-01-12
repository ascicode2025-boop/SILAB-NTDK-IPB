import React, { useEffect, useState } from 'react';
import NavbarLogin from './NavbarLoginKlien';
import FooterSetelahLogin from '../FooterSetelahLogin';
import { motion } from 'framer-motion';
import { Copy, Clock, CheckCircle, Wallet } from 'lucide-react';
import 'bootstrap/dist/css/bootstrap.min.css';

const PembayaranKlien = () => {
  const [detailBooking, setDetailBooking] = useState(null);
  const [data, setData] = useState({
    vaNumber: "02835230893",
    expiryDate: "27 Oktober 2025, 13:00 WIB",
    method: "Bank Mandiri",
    total: "0"
  });
  const [invoiceIdRaw, setInvoiceIdRaw] = useState(null);
  const [invoiceProofPath, setInvoiceProofPath] = useState(null);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [pendingBookings, setPendingBookings] = useState([]);

  // --- FUNGSI FETCH UTAMA (PERBAIKAN GLITCH TOTAL) ---
  // Parameter isBackground = true mencegah loading screen muncul saat auto-refresh
  const fetchInvoiceForBooking = async (useBookingId, isBackground = false) => {
    if (!useBookingId) return;
    
    if (!isBackground) setLoading(true);

    try {
      const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';
      const token = localStorage.getItem('token');
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      
      // 1. Coba ambil invoice
      const res = await fetch(`${apiBase}/invoices?booking_id=${useBookingId}`, { headers });
      const json = await res.json();
      
      if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
        const inv = json.data[0];
        setInvoiceIdRaw(inv.id);
        setInvoiceProofPath(inv.payment_proof_path || null);
        
        // Cek status lunas
        const paid = (inv.status && inv.status.toUpperCase() === 'PAID') || !!inv.paid_at;
        setPaymentSuccess(paid);
        
        setData({
          vaNumber: '02835230893',
          expiryDate: inv.due_date ? new Date(inv.due_date).toLocaleDateString('id-ID') : '7 hari dari sekarang',
          method: 'Bank Mandiri',
          total: (inv.amount || 0).toLocaleString('id-ID')
        });
        
        if (inv.booking) {
          const merged = { ...inv.booking, pdf_path: inv.booking.pdf_path || inv.pdf_path || inv.booking.pdfPath };
          setDetailBooking(merged);
          // Double check status booking jika invoice belum paid tapi booking statusnya selesai
          if (merged.is_paid || (merged.status && ['selesai', 'ditandatangani', 'lunas', 'paid'].includes((merged.status||'').toLowerCase()))) {
             setPaymentSuccess(true);
          }
        }
      } else {
        // 2. Fallback: Ambil data dari Booking jika invoice belum ada
        const userRes = await fetch(`${apiBase}/bookings`, { headers });
        const userJson = await userRes.json();
        
        if (userJson && userJson.success) {
          const bookings = userJson.data || [];
          const b = bookings.find(x => String(x.id) === String(useBookingId));
          
          if (b) {
            // Hitung harga
            try {
              const pricesRes = await fetch(`${apiBase}/analysis-prices`, { headers });
              const pricesJson = await pricesRes.json();
              const priceMap = {};
              if (Array.isArray(pricesJson)) {
                pricesJson.forEach(p => { priceMap[(p.jenis_analisis||p.jenisAnalisis||'').toString().toLowerCase()] = Number(p.harga || 0); });
              }
              const items = b.analysis_items || b.analysisItems || [];
              let sumPrices = 0;
              if (Array.isArray(items) && items.length > 0) {
                items.forEach(it => {
                  const name = (it.nama_item || it.namaItem || it || '').toString().toLowerCase();
                  const p = priceMap[name];
                  sumPrices += (typeof p === 'number' && !isNaN(p)) ? p : 50000;
                });
              } else {
                sumPrices = 50000;
              }
              const total = (Number(b.jumlah_sampel) || 0) * sumPrices;
              
              setData({
                vaNumber: '02835230893',
                expiryDate: new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString('id-ID'),
                method: 'Bank Mandiri',
                total: total.toLocaleString('id-ID')
              });
            } catch (err) {
              const total = (Number(b.jumlah_sampel) || 0) * 50000;
              setData({
                vaNumber: '02835230893',
                expiryDate: new Date(Date.now() + 7*24*60*60*1000).toLocaleDateString('id-ID'),
                method: 'Bank Mandiri',
                total: total.toLocaleString('id-ID')
              });
            }
            setInvoiceIdRaw(null);
            setInvoiceProofPath(b.payment_proof_path || null);
            setPaymentSuccess(!!b.is_paid || (b.status && ['selesai','ditandatangani','lunas','paid'].includes((b.status||'').toLowerCase())));
            setDetailBooking(b);
          }
        }
      }
    } catch (e) {
      console.error('Gagal memuat invoice', e);
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  // --- EFFECT: Load Awal & Polling List Pending ---
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('bookingId');
    if (bookingId) fetchInvoiceForBooking(bookingId);

    const fetchPending = async () => {
      try {
        // Jika sedang detail, jangan refresh list pending (hemat resource)
        if (params.get('bookingId')) return;
        
        const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';
        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const userRes = await fetch(`${apiBase}/bookings`, { headers });
        const userJson = await userRes.json();
        
        if (userJson && userJson.success) {
          // Tampilkan booking dengan status pembayaran relevan
          const pending = (userJson.data || []).filter(b => {
            const st = (b.status || '').toLowerCase();
            return (
              st.includes('pembayaran') ||
              st === 'menunggu_konfirmasi_pembayaran' ||
              st === 'lunas' ||
              st === 'paid' ||
              st === 'verified' ||
              st === 'selesai' ||
              st === 'ditandatangani'
            );
          });
          setPendingBookings(pending);
        }
      } catch (e) {
        console.error('Gagal memuat daftar booking', e);
      }
    };
    fetchPending();
    
    // Polling list pending setiap 10 detik (jika tidak sedang di mode detail)
    const listInterval = setInterval(() => {
        if (!new URLSearchParams(window.location.search).get('bookingId')) {
            fetchPending();
        }
    }, 10000);

    return () => clearInterval(listInterval);
  }, []);

  // --- EFFECT: Polling Detail (SINKRONISASI STATUS) ---
  useEffect(() => {
    const id = detailBooking ? detailBooking.id : invoiceIdRaw;
    if (!id) return;
    
    // Refresh detail setiap 5 detik dengan mode background (isBackground=true)
    // Ini memperbaiki masalah GLITCH loading
    const iv = setInterval(() => fetchInvoiceForBooking(id, true), 5000);
    
    // Fetch pertama kali tetap normal
    // fetchInvoiceForBooking(id, false); // Sudah dipanggil di handleViewProgress
    
    return () => clearInterval(iv);
  }, [detailBooking?.id, invoiceIdRaw]);

  // Update jika status berubah jadi success secara tiba-tiba
  useEffect(() => {
    if (!paymentSuccess) return;
    if (detailBooking || invoiceIdRaw) return;
    const params = new URLSearchParams(window.location.search);
    const bookingId = params.get('bookingId');
    if (bookingId) fetchInvoiceForBooking(bookingId);
  }, [paymentSuccess, detailBooking, invoiceIdRaw]);

  const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';
  const apiHost = apiBase.replace(/\/api$/, '');

  const theme = {
    primary: '#483D3F',
    secondary: '#8D766B',
    background: '#F7F5F4',
  };

  // Payment is considered successful only if paid and verified by coordinator
  const isPaid = detailBooking && (detailBooking.status === 'paid' || detailBooking.status === 'lunas' || detailBooking.status === 'verified' || detailBooking.status === 'selesai' || detailBooking.status === 'ditandatangani');
  const isVerified = detailBooking && (detailBooking.verified === true || detailBooking.status === 'lunas' || detailBooking.status === 'verified' || detailBooking.status === 'selesai' || detailBooking.status === 'ditandatangani');
  const alreadyUploaded = (detailBooking && (detailBooking.payment_proof_path || invoiceProofPath));
  const canUpload = !uploading && !alreadyUploaded;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(data.vaNumber);
    alert("Nomor VA berhasil disalin!");
  };

  // --- PERBAIKAN TAMPILAN TOTAL (MENCEGAH GLITCH) ---
  const getDisplayedTotal = () => {
    // Prioritas 1: Jika data sudah ada, tampilkan langsung (ABAINKAN LOADING BACKGROUND)
    if (data && data.total && String(data.total).trim() !== '' && String(data.total).trim() !== '0') return data.total;
    
    // Prioritas 2: Hitung dari detailBooking jika ada
    const b = detailBooking;
    const candidates = [b && b.amount, b && b.total_amount, b && b.invoice_amount, b && b.harga, b && b.jumlah_sampel && b.jumlah_sampel * 50000];
    for (const c of candidates) {
      if (typeof c === 'number' && !isNaN(c) && c > 0) return Number(c).toLocaleString('id-ID');
      if (typeof c === 'string' && c.trim() !== '') {
        const n = Number(c);
        if (!isNaN(n) && n > 0) return n.toLocaleString('id-ID');
      }
    }

    // Prioritas 3: Baru cek loading jika data benar-benar kosong
    if (loading) return '...';
    
    return '0';
  };

  const handleViewProgress = (b) => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.set('bookingId', b.id);
      window.history.replaceState({}, '', url.toString());
    } catch (e) {
      window.location.search = `?bookingId=${b.id}`;
    }
    setDetailBooking(b);
    fetchInvoiceForBooking(b.id, false);
    
    setTimeout(() => {
      const el = document.getElementById('payment-info');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 150);
  };

  // --- PERBAIKAN TOMBOL KEMBALI ---
  const handleBackToList = () => {
    try {
      const url = new URL(window.location.href);
      url.searchParams.delete('bookingId');
      window.history.replaceState({}, '', url.toString());
    } catch (e) {
      window.location.search = '';
    }
    // Reset SEMUA state detail agar tampilan bersih kembali ke list
    setDetailBooking(null);
    setInvoiceIdRaw(null);
    setInvoiceProofPath(null);
    setPaymentSuccess(false);
    setSelectedFile(null);
    
    // Scroll ke atas
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 80);
  };

  return (
    <NavbarLogin>
      <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center py-5" 
           style={{ backgroundColor: theme.background }}>
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.45 }}
          className="card border-0 shadow-sm p-4 p-md-5"
          style={{ width: '100%', maxWidth: '900px', borderRadius: '18px', backgroundColor: '#ffffff' }}
        >
          
          <div className="text-center mb-4">
            <h3 className="fw-bold mb-1" style={{ color: theme.primary, letterSpacing: '0.6px' }}>Pembayaran</h3>
            <p className="text-muted small">Selesaikan transaksi Anda agar pesanan diproses oleh laboratorium</p>
          </div>

          {/* LIST VIEW */}
          {!detailBooking && new URLSearchParams(window.location.search).get('bookingId') == null ? (
            <div className="mb-4">
              <h4 className="fw-bold text-center mb-2" style={{ fontSize: '1.35rem', color: theme.primary }}>Daftar Pembayaran</h4>
              
              {pendingBookings.length > 0 ? (
                <div className="d-flex flex-column gap-3 mt-4">
                  {pendingBookings.map(b => {
                    const st = (b.status || '').toLowerCase();
                    let badge = null;
                    if (st === 'menunggu_konfirmasi_pembayaran') {
                      badge = <span className="badge bg-warning text-dark">Menunggu Verifikasi</span>;
                    } else if (st.includes('pembayaran') || st === 'belum bayar') {
                      badge = <span className="badge bg-info text-white">Belum Bayar</span>;
                    } else if (st === 'lunas' || st === 'paid' || st === 'verified' || st === 'selesai' || st === 'ditandatangani') {
                      badge = <span className="badge bg-success text-white">Terverifikasi</span>;
                    } else {
                      badge = <span className="badge bg-secondary text-white">{b.status}</span>;
                    }
                    return (
                      <div key={b.id} className="d-flex align-items-center justify-content-between payment-card px-4 py-3" style={{ borderRadius: '12px', background: '#fff', minHeight: 84, border: '1px solid #eee' }}>
                        <div className="d-flex align-items-center gap-3">
                          <div className="icon-wrap d-flex align-items-center justify-content-center" style={{ background: '#eef2ff', width: 48, height: 48, borderRadius: 12 }}>
                            <Wallet size={24} color="#4361ee" />
                          </div>
                          <div>
                            <div className="fw-bold text-dark" style={{ fontSize: '1rem' }}>{b.kode_batch || ('ID: ' + b.id)}</div>
                            <div className="small text-muted mt-1">
                                <span className="me-3">{b.created_at ? new Date(b.created_at).toLocaleDateString('id-ID') : '-'}</span> 
                                {badge}
                            </div>
                          </div>
                        </div>
                        <div>
                          <button className="btn btn-sm btn-outline-primary fw-semibold rounded-pill px-3" onClick={() => handleViewProgress(b)}>
                            Lihat Detail
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-5 text-muted">
                    <p>Tidak ada tagihan yang perlu dibayar saat ini.</p>
                </div>
              )}
            </div>
          ) : (
            // DETAIL VIEW
            <div id="payment-info">
              {/* Tombol Kembali */}
              <div className="mb-3">
                <button className="btn btn-sm btn-link text-decoration-none text-muted ps-0" onClick={handleBackToList}>
                  ← Kembali ke Daftar
                </button>
              </div>
              
              {/* Progress Stepper */}
              <div className="progress-stepper mb-4 position-relative">
                <div className="d-flex justify-content-between align-items-center">
                    <div className="text-center">
                      <div className={`step-circle d-flex align-items-center justify-content-center shadow-sm ${paymentSuccess ? 'step-circle--inactive' : ''}`} style={{ backgroundColor: paymentSuccess ? '#ffffff' : theme.primary, color: paymentSuccess ? '#cfcfcf' : '#fff' }}>
                        <Clock size={18} />
                      </div>
                      <div className="step-label mt-2 fw-bold" style={{ color: paymentSuccess ? '#6c757d' : theme.primary }}>{paymentSuccess ? 'Selesai' : 'Menunggu'}</div>
                    </div>

                    <div className="text-center">
                      <div className={`step-circle d-flex align-items-center justify-content-center shadow-sm ${paymentSuccess ? '' : 'step-circle--inactive'}`} style={{ backgroundColor: paymentSuccess ? theme.primary : '#ffffff', color: paymentSuccess ? '#fff' : '#cfcfcf' }}>
                        <CheckCircle size={18} />
                      </div>
                      <div className={`step-label mt-2 ${paymentSuccess ? 'fw-bold' : 'text-muted fw-medium'}`} style={{ color: paymentSuccess ? theme.primary : '#6c757d' }}>{paymentSuccess ? 'Berhasil' : 'Berhasil'}</div>
                    </div>
                </div>

                <div className="progress-track mx-auto mt-3">
                  <div className="progress-fill">
                    <motion.div initial={{ width: 0 }} animate={{ width: paymentSuccess ? '100%' : (detailBooking && (detailBooking.payment_proof_path || invoiceProofPath) ? '70%' : '48%') }} transition={{ duration: 0.6 }} style={{ height: '100%', borderRadius: 8, backgroundColor: paymentSuccess ? '#28a745' : (detailBooking && (detailBooking.payment_proof_path || invoiceProofPath) ? '#28a745' : theme.secondary) }} />
                  </div>
                </div>
              </div>

              {/* Status Info */}
              <div className="mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="small text-muted">Status Pembayaran</div>
                    <div className="mt-1">
                        { isPaid && isVerified ? (
                          <span className="badge bg-success text-white">Pembayaran Terverifikasi</span>
                        ) : isPaid ? (
                          <span className="badge bg-warning text-dark">Menunggu Verifikasi Koordinator</span>
                        ) : (detailBooking && (detailBooking.payment_proof_path || invoiceProofPath)) ? (
                          <span className="badge bg-warning text-dark">Bukti Dikirim (Menunggu Verifikasi)</span>
                        ) : (
                          <span className="badge bg-info text-white">Belum Mengirim Bukti</span>
                        )}
                    </div>
                  </div>
                  <div>
                      { (detailBooking && (detailBooking.payment_proof_path || invoiceProofPath)) && (
                        <a className="btn btn-sm btn-outline-secondary" target="_blank" rel="noreferrer" href={`${apiHost}/storage/${detailBooking.payment_proof_path || invoiceProofPath}`}>
                          Lihat Bukti
                        </a>
                      )}
                      {/* Only show result if paid and verified */}
                      { detailBooking && detailBooking.pdf_path && isPaid && isVerified && (
                        <a className="btn btn-sm btn-outline-primary ms-2" target="_blank" rel="noreferrer" href={`${apiHost}/storage/${detailBooking.pdf_path}`}>
                          Lihat Hasil Analisis
                        </a>
                      )}
                  </div>
                </div>
              </div>

              {/* Info Expiry */}
              {!paymentSuccess && (
                <div className="text-center mb-4">
                  <div className="d-inline-flex align-items-center gap-2 px-3 py-2 rounded-pill bg-danger-subtle text-danger border border-danger-subtle small fw-bold">
                    <Clock size={14} className="animate-pulse" />
                    Bayar sebelum: {data.expiryDate}
                  </div>
                </div>
              )}

              {/* Detail Tagihan */}
              <div className="w-100 mb-4 p-3 rounded-3 border bg-light-subtle payment-summary">
                <div className="d-flex justify-content-between py-2 border-bottom border-secondary-subtle">
                  <span className="text-muted small">Metode Pembayaran</span>
                  <span className="fw-bold text-dark">{data.method}</span>
                </div>
                
                {/* Nomor VA (Muncul jika belum lunas) */}
                {!paymentSuccess && (
                    <div className="d-flex justify-content-between py-2 border-bottom border-secondary-subtle align-items-center">
                        <span className="text-muted small">No. Virtual Account</span>
                        <div className="d-flex align-items-center gap-2">
                            <span className="fw-bold text-dark fs-5">{data.vaNumber}</span>
                            <button onClick={copyToClipboard} className="btn btn-sm btn-light border rounded-circle p-1" title="Salin">
                                <Copy size={14} />
                            </button>
                        </div>
                    </div>
                )}

                <div className="d-flex justify-content-between pt-3 align-items-center">
                  <div>
                    <div className="text-muted small">Total yang harus dibayar</div>
                    <div className="fs-5 fw-bold" style={{ color: theme.primary }}>
                      <span className="fs-7 fw-medium me-1">Rp</span>{getDisplayedTotal()}
                    </div>
                  </div>
                  <div className="text-end small text-muted">Kode: <strong className="text-dark">{detailBooking ? (detailBooking.kode_batch || ('BOOK-' + detailBooking.id)) : (invoiceIdRaw || '-')}</strong></div>
                </div>
              </div>

              {/* Tombol Aksi Upload */}
              {!paymentSuccess && (
                  <div className="d-grid gap-3">
                    <div className="d-flex gap-2">
                      <div className="flex-grow-1 position-relative">
                        <input type="file" id="file-upload" accept="application/pdf,image/*" className="form-control" onChange={(e) => setSelectedFile(e.target.files[0])} disabled={!canUpload} />
                        <small className="text-muted">Pilih file (jpg/png/pdf) sebagai bukti pembayaran</small>
                      </div>
                      <button className="btn btn-primary px-4 fw-semibold" disabled={!canUpload} onClick={async () => {
                          if (!selectedFile) return alert('Pilih file terlebih dahulu.');
                          setUploading(true);
                          try {
                            const apiBase = process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api';
                            const token = localStorage.getItem('token');
                            const headers = token ? { Authorization: `Bearer ${token}`, Accept: 'application/json' } : { Accept: 'application/json' };
                            const fd = new FormData();
                            fd.append('file', selectedFile);
                            
                            const id = detailBooking ? detailBooking.id : new URLSearchParams(window.location.search).get('bookingId');
                            if (!id) return alert('Tidak ada booking yang dipilih.');
                            
                            const res = await fetch(`${apiBase}/bookings/${id}/upload-payment-proof`, {
                              method: 'POST',
                              headers,
                              body: fd
                            });
                            
                            if (!res.ok) {
                              let body = null;
                              try { body = await res.json(); } catch(e) { body = await res.text(); }
                              console.error('Upload failed', res.status, body);
                              alert('Gagal mengunggah bukti. Coba lagi.');
                              return;
                            }
                            
                            const json = await res.json();
                            if (json && json.success) {
                              alert('Bukti pembayaran berhasil diunggah. Terima kasih.');
                              setSelectedFile(null);
                              if (json.data) {
                                setDetailBooking(json.data);
                                setInvoiceProofPath(json.data.payment_proof_path || null);
                              }
                            }
                          } catch (err) {
                            console.error(err);
                            alert('Terjadi kesalahan saat mengunggah.');
                          } finally {
                            setUploading(false);
                          }
                        }}>
                        {alreadyUploaded ? 'Sudah Dikirim' : (uploading ? 'Mengunggah...' : 'Unggah')}
                      </button>
                    </div>
                  </div>
              )}
            </div>
          )}
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
        .step-circle { width: 60px; height: 60px; border-radius: 50%; display: inline-flex; }
        .step-circle--inactive { background: #ffffff; border: 1px solid #ececec; color: #cfcfcf; }
        .progress-track { width: 60%; height: 8px; background: #EDEDED; border-radius: 8px; position: relative; }
        .progress-fill { width: 100%; height: 100%; border-radius: 8px; overflow: hidden; }
      `}</style>
      
      <FooterSetelahLogin />  
    </NavbarLogin>
  );
}
export default PembayaranKlien;