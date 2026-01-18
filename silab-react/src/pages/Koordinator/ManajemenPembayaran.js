import React, { useState, useEffect } from "react";
import {
  Container, Row, Col, Card, Table, Button,
  Form, InputGroup, Modal, Stack
} from "react-bootstrap";
import NavbarLoginKoordinator from "./NavbarLoginKoordinator";
import FooterSetelahLogin from "../tamu/FooterSetelahLogin";
import { getInvoices, uploadInvoicePaymentProof, confirmInvoicePayment, getAllBookings, updateBookingStatus, verifikasiKoordinator } from '../../services/BookingService';
import { sendInvoiceEmail } from '../../services/BookingService';
import { getAuthHeader } from '../../services/AuthService';

// axios used for uploading payment proof
import axios from 'axios';

const ManajemenPembayaran = () => {
  const [invoices, setInvoices] = useState([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showProofModal, setShowProofModal] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fileToUpload, setFileToUpload] = useState(null);
  const [uploadTarget, setUploadTarget] = useState(null);
  const [proofBlobUrl, setProofBlobUrl] = useState(null);
  const [proofMime, setProofMime] = useState(null);
  
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

  const [summaryTotals, setSummaryTotals] = useState({ totalAll:0, paid:0, unpaid:0 });
  const [pendingBookings, setPendingBookings] = useState([]);
  const [analysisSummary, setAnalysisSummary] = useState([]);

  const handleShowDetail = (item) => {
    // Check if this is a pending booking or an invoice
    const isBooking = item.type === 'booking';
    
    if (isBooking) {
      // For pending bookings, use pre-calculated itemized data or calculate fresh
      const booking = item.booking || {};
      const enrich = async () => {
        try {
          const apiBase = (process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api');
          const priceRes = await fetch(`${apiBase}/analysis-prices`);
          const priceData = await priceRes.json();
          const priceMap = {};
          if (priceData && Array.isArray(priceData)) {
            priceData.forEach(p => {
              // Support multiple field names for compatibility
              const keys = [p.jenis_analisis, p.nama_analisis, p.nama_item].filter(k => k);
              keys.forEach(key => {
                if (key) priceMap[key] = Number(p.harga) || 0;
              });
            });
          }
          console.log('Price map loaded:', priceMap); // DEBUG

          const analysisItems = booking.analysis_items || [];
          const jumlahSampel = Number(item.jumlah_sampel || booking.jumlah_sampel) || 1;
          
          console.log('Analysis items untuk booking:', analysisItems); // DEBUG
          
          const itemized = analysisItems.length > 0 ? analysisItems.map(ai => {
            const price = priceMap[ai.nama_item] || 50000;
            return {
              nama: ai.nama_item || 'Item tidak tersedia',
              hargaSatuan: Number(price) || 0,  // Ensure it's a number
              total: (Number(price) || 0) * jumlahSampel
            };
          }) : [{
            nama: 'Item tidak tersedia',
            hargaSatuan: 0,
            total: 0
          }];
          
          console.log('Itemized array untuk booking:', itemized); // DEBUG

          const enriched = { 
            ...item,
            itemized,
            jumlah_sampel: jumlahSampel,
            tanggal_kirim: booking.tanggal_kirim ? new Date(booking.tanggal_kirim).toLocaleDateString('id-ID') : (item.dueDate || '-'),
            jenis_analisis: booking.jenis_analisis || item.deskripsi || 'Pending',
            klien: item.namaKlien || '-',
            total: itemized.reduce((s, i) => s + Number(i.total || 0), 0)
          };
          setSelectedInvoice(enriched);
          setShowDetailModal(true);
        } catch (e) {
          console.error('Gagal memuat harga analisis untuk booking', e);
          // Show modal with available data even if price fetch fails
          setSelectedInvoice({
            ...item,
            itemized: [],
            klien: item.namaKlien || '-',
            jenis_analisis: booking.jenis_analisis || item.deskripsi || 'Pending'
          });
          setShowDetailModal(true);
        }
      };
      enrich();
      return;
    }

    // For invoices, enrich with itemized prices
    const enrich = async () => {
      try {
        const apiBase = (process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api');
        const resp = await fetch(`${apiBase}/analysis-prices`);
        const prices = resp.ok ? await resp.json() : [];
        const priceMap = {};
        prices.forEach(p => { if (p.jenis_analisis) priceMap[p.jenis_analisis] = Number(p.harga); });

        // Access booking from mapped state object
        const booking = item.booking || {};
        const items = booking.analysis_items || booking.analysisItems || [];
        const jumlahSampel = Number(booking.jumlah_sampel ?? item.jumlah_sampel ?? 0);
        const itemized = (items || []).map(it => {
          const name = it.nama_item || it.nama_analisis || it.nama || it;
          const unitPrice = Number(priceMap[name]) || 0;
          return { 
            name: name || 'Item tidak tersedia', 
            unitPrice: unitPrice || 0,
            hargaSatuan: unitPrice || 0,  // Add hargaSatuan as fallback field name
            total: (unitPrice || 0) * jumlahSampel 
          };
        });

        const enriched = { 
          ...item, 
          itemized, 
          jumlah_sampel: jumlahSampel, 
          tanggal_kirim: booking.tanggal_kirim ? new Date(booking.tanggal_kirim).toLocaleDateString('id-ID') : (item.tanggal || '-'),
          // Set jenis_analisis from booking or build from itemized names
          jenis_analisis: booking.jenis_analisis || item.deskripsi || (itemized && itemized.length > 0 ? itemized.map(i => i.name || i.nama).join(', ') : '-'),
          // Use itemized total as the authoritative total (override backend amount)
          total: itemized.reduce((s, i) => s + Number(i.total || 0), 0)
        };
        setSelectedInvoice(enriched);
        setShowDetailModal(true);
      } catch (e) {
        console.error('Gagal memuat harga analisis', e);
        setSelectedInvoice(item);
        setShowDetailModal(true);
      }
    };
    enrich();
  };

  useEffect(() => { fetchInvoicesFromServer(); }, []);

  const fetchInvoicesFromServer = async () => {
    setLoadingInvoices(true);
    try {
      const res = await getInvoices();
        if (res && res.data && Array.isArray(res.data)) {
        // Map invoices directly
        // Keep booking object reference in state for detail modal to access analysisItems etc.
        const mapped = res.data.map(inv => ({
          invoiceId: inv.invoice_number,
          namaKlien: inv.user?.full_name || inv.user?.name || '-',
          institusi: inv.user?.institution || inv.user?.company || '-',
          tanggal: inv.created_at ? new Date(inv.created_at).toLocaleDateString('id-ID') : '-',
          dueDate: inv.due_date ? new Date(inv.due_date).toLocaleDateString('id-ID') : '-',
          total: inv.amount || 0,
          status: inv.status || 'DRAFT',
          deskripsi: inv.booking?.jenis_analisis || '-',
          invoiceIdRaw: inv.id,
          bookingId: inv.booking?.id,
          uploadedProof: !!inv.payment_proof_path,
          paidAt: inv.paid_at ? new Date(inv.paid_at).toLocaleString('id-ID') : null,
          confirmedBy: inv.confirmer?.name || null,
          booking: inv.booking || {},  // Store full booking object for detail modal
          invoice_number: inv.invoice_number,
          jumlah_sampel: inv.booking?.jumlah_sampel || 0,  // Extract jumlah_sampel from booking for display
        }));

        // compute totals for summary from invoices
        const totalAllInvoices = mapped.reduce((s, i) => s + (Number(i.total)||0), 0);
        const paid = mapped.filter(i => (i.status || '').toString().toUpperCase() === 'PAID').reduce((s, i) => s + (Number(i.total)||0),0);
        const unpaidInvoices = mapped.filter(i => (i.status || '').toString().toUpperCase() === 'UNPAID').reduce((s, i) => s + (Number(i.total)||0),0);
        // set invoices into state first
        setInvoices(mapped);

        // Always fetch pending bookings and include their expected totals into the 'MENUNGGU' bucket
        let pendingTotal = 0;
        let mappedPend = [];
        try {
          const bres = await getAllBookings();
          if (bres && bres.data && Array.isArray(bres.data)) {
            // Get booking IDs that already have invoices to avoid duplicates
            const invoiceBookingIds = mapped.map(inv => inv.bookingId).filter(id => id != null);
            // Filter pending bookings: hanya yang status menunggu_pembayaran AND belum punya invoice
            const pend = bres.data.filter(b => 
              (['menunggu_pembayaran','menunggu_konfirmasi_pembayaran'].includes((b.status||'').toLowerCase())) && !invoiceBookingIds.includes(b.id)
            );
            // Fetch analysis prices for accurate calculation
            const apiBase = (process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api');
            const priceRes = await fetch(`${apiBase}/analysis-prices`);
            const priceData = await priceRes.json();
            const priceMap = {};
            if (priceData && Array.isArray(priceData)) {
              priceData.forEach(p => {
                // Support multiple field names for compatibility
                const keys = [p.jenis_analisis, p.nama_analisis, p.nama_item].filter(k => k);
                keys.forEach(key => {
                  if (key) priceMap[key] = Number(p.harga) || 0;
                });
              });
            }
            mappedPend = pend.map(b => {
              const jumlahSampel = Number(b.jumlah_sampel) || 0;
              const analysisItems = b.analysis_items || [];
              // Calculate accurate total from analysis items
              let itemTotal = 0;
              if (analysisItems.length > 0) {
                analysisItems.forEach(item => {
                  const price = priceMap[item.nama_item] || 50000;
                  itemTotal += price * jumlahSampel;
                });
              } else {
                itemTotal = jumlahSampel * 50000; // fallback
              }
              return {
                bookingId: b.id,
                invoiceId: b.kode_batch ? `INV-${b.kode_batch}` : `INV-DRAFT-${b.id}`,
                namaKlien: b.user?.full_name || b.user?.name || '-',
                institusi: b.user?.institution || b.user?.company || '-',
                dueDate: b.status_updated_at ? new Date(b.status_updated_at).toLocaleDateString('id-ID') : '-',
                tanggal: b.created_at ? new Date(b.created_at).toLocaleDateString('id-ID') : '-',
                total: itemTotal,
                status: b.status || 'UNPAID',
                uploadedProof: !!b.payment_proof_path,
                type: 'booking',
                booking: b,
                deskripsi: b.jenis_analisis || '-',
                jumlah_sampel: jumlahSampel
              };
            });
            setPendingBookings(mappedPend);
            pendingTotal = mappedPend.reduce((s, p) => s + (Number(p.total)||0), 0);
          } else {
            setPendingBookings([]);
          }
        } catch (e) {
          console.error('Gagal memuat pending bookings', e);
          setPendingBookings([]);
        }

        // combine invoice totals and pending bookings into displayed summary
        const totalAll = totalAllInvoices + pendingTotal;
        const unpaid = unpaidInvoices + pendingTotal;
        // Build per-analysis-type summary
        try {
          const combinedList = [
            ...mapped.map(i => ({
              jenis: i.deskripsi || i.jenis_analisis || '-',
              total: Number(i.total)||0,
              paid: ((i.status||'').toString().toUpperCase() === 'PAID')
            })),
            ...(typeof mappedPend !== 'undefined' ? mappedPend.map(p => ({
              jenis: p.deskripsi || p.jenis_analisis || '-',
              total: Number(p.total)||0,
              paid: false
            })) : (pendingBookings || []).map(p => ({
              jenis: p.deskripsi || p.jenis_analisis || '-',
              total: Number(p.total)||0,
              paid: false
            })))
          ];
          const summaryMap = {};
          combinedList.forEach(it => {
            const key = (it.jenis || 'Lainnya').toString();
            if (!summaryMap[key]) summaryMap[key] = { jenis: key, paidCount:0, paidTotal:0, waitingCount:0, waitingTotal:0 };
            if (it.paid) {
              summaryMap[key].paidCount += 1;
              summaryMap[key].paidTotal += it.total;
            } else {
              summaryMap[key].waitingCount += 1;
              summaryMap[key].waitingTotal += it.total;
            }
          });
          setAnalysisSummary(Object.values(summaryMap));
        } catch (e) {
          console.warn('Failed to compute analysis summary', e);
          setAnalysisSummary([]);
        }

        setSummaryTotals({ totalAll, paid, unpaid });
      }
    } catch (e) {
      console.error('Gagal memuat invoices dari server', e);
    } finally {
      setLoadingInvoices(false);
    }
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
    // Normalize incoming status to uppercase string for mapping
    const key = (status || '').toString().toUpperCase().replace(/\s+/g, '_');
    const statusMap = {
      DRAFT: { color: "#6c757d", label: "Draft" },
      UNPAID: { color: "#dc3545", label: "Belum Bayar" },
      PAID: { color: "#198754", label: "Lunas" }
    };

    const current = statusMap[key];
    // Fallback when status is unknown or mapping missing
    const fallback = { color: '#6c757d', label: (status && status.toString()) || 'Unknown' };
    const use = current || fallback;

    return (
      <span style={{ 
        fontSize: '0.8rem', 
        color: use.color, 
        border: `1px solid ${use.color}`,
        padding: '2px 12px',
        borderRadius: '10px',
        fontWeight: '500'
      }}>
        {use.label}
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
                { label: "TOTAL TAGIHAN", val: summaryTotals.totalAll ? `Rp ${summaryTotals.totalAll.toLocaleString('id-ID')}` : 'Rp 0', color: customColors.brown },
                { label: "SUDAH DIBAYAR", val: summaryTotals.paid ? `Rp ${summaryTotals.paid.toLocaleString('id-ID')}` : 'Rp 0', color: "#198754" },
                { label: "MENUNGGU", val: summaryTotals.unpaid ? `Rp ${summaryTotals.unpaid.toLocaleString('id-ID')}` : 'Rp 0', color: "#dc3545" }
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
              <div>
                {/* Manual invoice creation removed: invoices are auto-created when booking status becomes 'menunggu_pembayaran' */}
              </div>
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
                      <th className="py-3">Klien</th>
                      <th className="py-3">Total</th>
                      <th className="py-3">Status</th>
                      <th className="py-3">Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(() => {
                      // Combine invoices and pending bookings into one list
                      const combined = [
                        ...invoices.map(inv => ({ ...inv, type: 'invoice' })),
                        ...pendingBookings.map(b => ({
                          ...b,
                          type: 'booking',
                          // Keep formatted invoiceId if available; otherwise build from kode_batch
                          invoiceId: b.invoiceId || (b.kode_batch ? `INV-${b.kode_batch}` : `INV-DRAFT-${b.bookingId}`),
                          invoiceIdRaw: null
                        }))
                      ];
                      
                      if (combined.length === 0) {
                        return <tr><td colSpan={5} className="py-4 text-center text-muted">Belum ada invoice atau booking menunggu pembayaran</td></tr>;
                      }
                      
                      return combined.map((item) => (
                        <tr key={item.type === 'invoice' ? item.invoiceId : `booking-${item.bookingId}`}>
                          <td className="py-3 fw-bold text-primary">{item.invoiceId}</td>
                          <td className="py-3 text-start ps-4">
                            <div className="fw-bold">{item.namaKlien}</div>
                          </td>
                          <td className="py-3 fw-bold">Rp {item.total.toLocaleString("id-ID")}</td>
                          <td className="py-3">{getStatusBadge(item.status)}</td>
                          <td className="py-3">
                            <Stack direction="horizontal" gap={2} className="justify-content-center">
                              <Button 
                                size="sm" className="text-white px-3" 
                                style={{ backgroundColor: customColors.brown, border: 'none', borderRadius: '15px' }}
                                onClick={() => handleShowDetail(item)}
                              >
                                Detail
                              </Button>
                              {item.type === 'invoice' && item.uploadedProof && item.status === 'UNPAID' && (
                                <Button 
                                  size="sm" 
                                  variant="success"
                                  style={{ borderRadius: '15px' }} 
                                  onClick={async () => {
                                    if (!window.confirm('Konfirmasi pembayaran untuk invoice ' + item.invoiceId + '?')) return;
                                    try {
                                      // Confirm invoice (backend should update invoice.status)
                                      await confirmInvoicePayment(item.invoiceIdRaw);
                                      // If invoice is linked to a booking, ensure booking-level verification runs too
                                      if (item.bookingId) {
                                        try {
                                          await verifikasiKoordinator(item.bookingId);
                                        } catch (innerErr) {
                                          console.warn('verifikasiKoordinator failed after confirmInvoicePayment', innerErr);
                                        }
                                      }
                                      await fetchInvoicesFromServer();
                                      alert('Pembayaran berhasil dikonfirmasi.');
                                    } catch (e) {
                                      console.error('Gagal konfirmasi pembayaran', e);
                                      alert('Gagal mengonfirmasi pembayaran. Cek console.');
                                    }
                                  }}
                                >
                                  Konfirmasi Pembayaran
                                </Button>
                              )}
                              {(item.type === 'booking') && item.uploadedProof && (item.status === 'menunggu_konfirmasi_pembayaran' || (item.status||'').toLowerCase() === 'menunggu_konfirmasi_pembayaran') && (
                                <Button
                                  size="sm"
                                  variant="success"
                                  style={{ borderRadius: '15px' }}
                                  onClick={async () => {
                                    if (!window.confirm('Konfirmasi pembayaran untuk booking ' + (item.invoiceId || item.bookingId) + '?')) return;
                                    try {
                                      // Use coordinator verification endpoint which will set booking as paid and update related invoice if any
                                      await verifikasiKoordinator(item.bookingId);
                                      await fetchInvoicesFromServer();
                                      alert('Pembayaran berhasil dikonfirmasi (booking).');
                                    } catch (e) {
                                      console.error('Gagal konfirmasi pembayaran booking', e);
                                      alert('Gagal mengonfirmasi pembayaran. Cek console.');
                                    }
                                  }}
                                >
                                  Konfirmasi Pembayaran
                                </Button>
                              )}
                            </Stack>
                          </td>
                        </tr>
                      ));
                    })()}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Container>
        <FooterSetelahLogin />
      </div>

      {/* MODAL UPLOAD BUKTI PEMBAYARAN */}
      <Modal show={showUploadModal} onHide={() => setShowUploadModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Unggah Bukti Pembayaran</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>Unggah file bukti pembayaran (PDF atau gambar). Setelah berhasil, tombol akan berubah menjadi "Sudah Unggah".</p>
          <p className="text-muted small mb-3">Invoice: <strong>{uploadTarget?.invoiceId}</strong></p>
          <Form.Group controlId="formFilePayment" className="mb-3">
            <Form.Label>Pilih File</Form.Label>
            <Form.Control 
              type="file" 
              accept="application/pdf,image/*"
              onChange={(e) => setFileToUpload(e.target.files[0])}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowUploadModal(false)} disabled={uploading}>Batal</Button>
          <Button 
            variant="primary" 
            onClick={async () => {
              if (!uploadTarget || !fileToUpload) return alert('Pilih file terlebih dahulu.');
              setUploading(true);
              try {
                const apiBase = (process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api');
                const fd = new FormData();
                fd.append('file', fileToUpload, fileToUpload.name);
                const url = `${apiBase}/bookings/${uploadTarget.bookingId}/upload-payment-proof`;
                const headers = { ...getAuthHeader() };
                // axios will set proper multipart boundary
                await axios.post(url, fd, { headers });
                // refresh from server to stay fully synchronized with DB
                await fetchInvoicesFromServer();
                setShowUploadModal(false);
                setFileToUpload(null);
                alert('Bukti pembayaran berhasil diunggah.');
              } catch (e) {
                console.error('Gagal mengunggah bukti pembayaran', e);
                alert('Gagal mengunggah bukti pembayaran. Periksa koneksi atau coba lagi.');
              } finally {
                setUploading(false);
              }
            }}
            disabled={uploading || !fileToUpload}
          >
            {uploading ? 'Mengunggah...' : 'Unggah dan Selesai'}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Manual create-from-booking modal removed (invoices are auto-created). */}

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
                <Col xs={5} className="text-muted small fw-bold">REF</Col>
                <Col xs={7} className="fw-bold text-primary">{selectedInvoice.invoiceId || selectedInvoice.invoice_number || ('Booking #' + (selectedInvoice.bookingId || selectedInvoice.id))}</Col>
              </Row>
              <Row className="mb-3">
                <Col xs={5} className="text-muted small fw-bold">KLIEN</Col>
                <Col xs={7} className="fw-bold">{selectedInvoice.klien || selectedInvoice.namaKlien || selectedInvoice.user_fullname || '-'}</Col>
              </Row>
              <hr />
              <Row className="mb-3">
                <Col xs={5} className="text-muted small fw-bold">JENIS ANALISIS</Col>
                <Col xs={7}>
                  {(selectedInvoice.itemized && Array.isArray(selectedInvoice.itemized) && selectedInvoice.itemized.length > 0) ? (
                    <ul className="mb-0 ps-3 text-start">
                      {selectedInvoice.itemized.map((it, idx) => {
                        const displayName = it.nama || it.name || 'Item tidak tersedia';
                        return <li key={idx}>{displayName}</li>;
                      })}
                    </ul>
                  ) : (selectedInvoice.jenis_analisis && selectedInvoice.jenis_analisis.trim() !== '' ? selectedInvoice.jenis_analisis : (selectedInvoice.deskripsi && selectedInvoice.deskripsi.trim() !== '' ? selectedInvoice.deskripsi : '-'))}
                </Col>
              </Row>
              <Row className="mb-3">
                <Col xs={5} className="text-muted small fw-bold">JUMLAH SAMPEL</Col>
                <Col xs={7}>{selectedInvoice.jumlah_sampel && selectedInvoice.jumlah_sampel > 0 ? selectedInvoice.jumlah_sampel : '-'}</Col>
              </Row>
              <Row className="mb-3">
                <Col xs={5} className="text-muted small fw-bold">TANGGAL KIRIM</Col>
                <Col xs={7}>{selectedInvoice.tanggal_kirim || selectedInvoice.tanggal || '-'}</Col>
              </Row>
              <Row className="mb-3">
                <Col xs={5} className="text-muted small fw-bold">STATUS</Col>
                <Col xs={7}>{getStatusBadge(selectedInvoice.status || selectedInvoice.status)}</Col>
              </Row>

              {/* Signature info if available on booking */}
              {selectedInvoice.booking && selectedInvoice.booking.signature && (
                <Row className="mb-3">
                  <Col xs={5} className="text-muted small fw-bold">TANDA TANGAN</Col>
                  <Col xs={7}>
                    {selectedInvoice.booking.signature.status === 'signed' ? (
                      <div>
                        <a href={selectedInvoice.booking.signature.file_path} target="_blank" rel="noreferrer">Lihat Dokumen Ditandatangani</a>
                        <div className="small text-success">Ditandatangani oleh {selectedInvoice.booking.signature.signed_by || '-'}</div>
                      </div>
                    ) : (
                      <div className="small text-warning">{selectedInvoice.booking.signature.status || 'pending'}</div>
                    )}
                  </Col>
                </Row>
              )}

              {/* Price breakdown per analysis item */}
              {selectedInvoice.itemized && selectedInvoice.itemized.length > 0 && (
                <div className="mt-3">
                  <small className="text-muted d-block mb-2 fw-bold">RINCIAN HARGA</small>
                  <table className="table table-sm mb-0">
                    <thead>
                      <tr>
                        <th>Analisis</th>
                        <th className="text-end">Harga / sampel</th>
                        <th className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedInvoice.itemized.map((it, idx) => {
                        const displayName = it.nama || it.name || 'Item tidak tersedia';
                        const displayPrice = Number(it.hargaSatuan || it.unitPrice || 0) || 0;
                        const displayTotal = Number(it.total || 0) || 0;
                        return (
                          <tr key={idx}>
                            <td>{displayName}</td>
                            <td className="text-end">Rp {displayPrice.toLocaleString('id-ID')}</td>
                            <td className="text-end">Rp {displayTotal.toLocaleString('id-ID')}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="mt-4 p-3 bg-white border rounded">
                <small className="text-muted d-block mb-1 fw-bold">TOTAL</small>
                <h3 className="fw-bold mb-0" style={{ color: customColors.brown }}>
                  Rp {(selectedInvoice.itemized ? selectedInvoice.itemized.reduce((s,i)=>s+Number(i.total||0),0) : (selectedInvoice.total || selectedInvoice.total_amount || 0)).toLocaleString("id-ID")}
                </h3>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 justify-content-center">
            <div className="d-flex gap-2 w-100 justify-content-center">
              {/* If there's a booking, allow opening its analysis PDF */}
              {/* Only allow coordinator to view result if paid and verified */}
              {selectedInvoice && selectedInvoice.booking && (['lunas','verified','selesai','ditandatangani'].includes((selectedInvoice.booking.status||'').toLowerCase())) && (
                <Button
                  variant="outline-primary"
                  onClick={async () => {
                    try {
                      // ...existing code...
                      const apiBase = (process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api');
                      const headers = { ...getAuthHeader(), Accept: 'application/pdf' };
                      const stored = selectedInvoice.booking.file_ttd_path || selectedInvoice.booking.pdf_path ?
                        (apiBase.replace(/\/api\/?$/, '') + '/storage/' + (selectedInvoice.booking.file_ttd_path || selectedInvoice.booking.pdf_path)) : null;
                      if (stored) {
                        try {
                          const res = await fetch(stored);
                          if (res.ok) {
                            const blob = await res.blob();
                            const url = window.URL.createObjectURL(blob);
                            setProofBlobUrl(url);
                            setProofMime(blob.type || 'application/octet-stream');
                            setShowProofModal(true);
                            return;
                          }
                          window.open(stored, '_blank');
                          return;
                        } catch (e) {
                          window.open(stored, '_blank');
                          return;
                        }
                      }
                      const res = await fetch(`${apiBase}/bookings/${selectedInvoice.bookingId || selectedInvoice.booking.id}/pdf-generated`, { headers });
                      if (!res.ok) throw new Error('Tidak dapat memuat PDF');
                      const blob = await res.blob();
                      const url = window.URL.createObjectURL(blob);
                      setProofBlobUrl(url);
                      setProofMime(blob.type || 'application/octet-stream');
                      setShowProofModal(true);
                    } catch (e) {
                      alert('Gagal membuka hasil analisis.');
                    }
                  }}
                >
                  Lihat Hasil Analisis
                </Button>
              )}

              {/* Preview Bukti Pembayaran jika tersedia */}
              {selectedInvoice && (selectedInvoice.uploadedProof || (selectedInvoice.booking && selectedInvoice.booking.payment_proof_path)) && (
                <>
                  <Button
                    variant="outline-info"
                    onClick={async () => {
                      try {
                        const apiBaseRoot = (process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api').replace(/\/api\/?$/, '');
                        const path = selectedInvoice.payment_proof_path || (selectedInvoice.booking && selectedInvoice.booking.payment_proof_path);
                        if (!path) return alert('Tidak ada bukti pembayaran untuk ditampilkan.');
                        const full = `${apiBaseRoot}/storage/${path}`;
                        const token = localStorage.getItem('token');
                        const headers = token ? { Authorization: `Bearer ${token}` } : {};
                        // Try fetching the proof file directly without auth headers to avoid CORS/auth redirect issues
                        try {
                          console.debug('Fetching proof via:', full);
                          const res = await fetch(full);
                          if (!res.ok) throw new Error('Gagal mengambil file bukti, status=' + res.status);
                          const blob = await res.blob();
                          const url = window.URL.createObjectURL(blob);
                          setProofBlobUrl(url);
                          setProofMime(blob.type || 'application/octet-stream');
                          setShowProofModal(true);
                        } catch (e) {
                          console.warn('Fetch proof failed, fallback to open:', e);
                          // fallback: open directly in new tab
                          window.open(full, '_blank');
                        }
                      } catch (e) {
                        console.error('Gagal memuat bukti pembayaran', e);
                        alert('Gagal memuat bukti pembayaran.');
                      }
                    }}
                  >
                    Preview Bukti Pembayaran
                  </Button>
                  {/* Konfirmasi Persetujuan Pembayaran */}
                  {((selectedInvoice.booking && !['lunas','verified','selesai','ditandatangani'].includes((selectedInvoice.booking.status||'').toLowerCase())) ||
                    (!selectedInvoice.booking && !['lunas','verified','selesai','ditandatangani'].includes((selectedInvoice.status||'').toLowerCase()))) && (
                    <Button
                      variant="success"
                      className="ms-2"
                      onClick={async () => {
                        if (!window.confirm('Setujui pembayaran ini?')) return;
                        try {
                          const apiBase = (process.env.REACT_APP_API_BASE_URL || 'http://127.0.0.1:8000/api');
                          const token = localStorage.getItem('token');
                          const headers = token ? { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` } : { 'Content-Type': 'application/json' };
                          let id = selectedInvoice.booking ? selectedInvoice.booking.id : selectedInvoice.bookingId || selectedInvoice.id;
                          // Call backend endpoint to verify payment (adjust endpoint as needed)
                          const res = await fetch(`${apiBase}/bookings/${id}/verify-payment`, { method: 'POST', headers });
                          if (!res.ok) throw new Error('Gagal menyetujui pembayaran');
                          alert('Pembayaran telah disetujui!');
                          setShowDetailModal(false);
                          fetchInvoicesFromServer();
                        } catch (e) {
                          alert('Gagal menyetujui pembayaran.');
                        }
                      }}
                    >
                      Setujui Pembayaran
                    </Button>
                  )}
                </>
              )}

              {/* If this is an invoice record, allow sending invoice via email */}
              {selectedInvoice && selectedInvoice.type !== 'booking' && (
                <Button
                  variant="outline-success"
                  onClick={async () => {
                    if (!selectedInvoice || !selectedInvoice.invoiceIdRaw) {
                      if (window.showAppPopup) {
                        window.showAppPopup({ title: 'Gagal', message: 'Tidak ada invoice untuk dikirim.', type: 'error' });
                      } else {
                        alert('Tidak ada invoice untuk dikirim.');
                      }
                      return;
                    }

                    try {
                        // Inform user (non-blocking info) — CustomPopup is modal, so we keep it minimal
                        if (window.showAppPopup) {
                          window.showAppPopup({ title: 'Mengirim Invoice', message: 'Sedang mengirim invoice ke email klien. Mohon tunggu…', type: 'info' });
                        }

                        const resp = await sendInvoiceEmail(selectedInvoice.invoiceIdRaw);
                        // Log full backend response to help debugging when popup behavior is unexpected
                        console.debug('sendInvoiceEmail response:', resp);

                        // Determine success message robustly
                        const successMsg = (resp && (resp.message || resp.msg || resp.data || resp.success)) ? (resp.message || resp.msg || (typeof resp.data === 'string' ? resp.data : 'Invoice dikirim.')) : 'Invoice dikirim.';

                        if (window.showAppPopup) {
                          window.showAppPopup({ title: 'Sukses', message: String(successMsg), type: 'success' });
                        } else {
                          alert(String(successMsg));
                        }
                      } catch (e) {
                        // Log full error to console for debugging
                        console.error('Gagal kirim invoice -- full error:', e);

                        // Try to extract server message from multiple shapes
                        let serverMsg = null;
                        try {
                          if (e && e.response && e.response.data) {
                            serverMsg = e.response.data.message || e.response.data.msg || JSON.stringify(e.response.data);
                          } else if (e && e.message) {
                            serverMsg = e.message;
                          } else {
                            serverMsg = String(e);
                          }
                        } catch (ex) {
                          serverMsg = 'Gagal mengirim invoice. Cek console.';
                        }

                        if (window.showAppPopup) {
                          window.showAppPopup({ title: 'Gagal mengirim invoice', message: serverMsg, type: 'error' });
                        } else {
                          alert(serverMsg ? `Gagal mengirim invoice: ${serverMsg}` : 'Gagal mengirim invoice. Cek console.');
                        }
                      }
                  }}
                >
                  Kirim Invoice via Email
                </Button>
              )}

              {/* Button Kirim Hasil ke Klien untuk booking/invoice yang sudah lunas/verified/selesai/ditandatangani dan ada pdf_path */}
              {selectedInvoice && (
                ((selectedInvoice.booking && selectedInvoice.booking.pdf_path && ['lunas','verified','selesai','ditandatangani'].includes((selectedInvoice.booking.status||'').toLowerCase()))
                ||
                (selectedInvoice.pdf_path && ['lunas','verified','selesai','ditandatangani'].includes((selectedInvoice.status||'').toLowerCase()))
                ) && (
                  <Button
                    variant="outline-primary"
                    onClick={async () => {
                      if (!window.confirm('Kirim ulang hasil analisis ke email klien?')) return;
                      try {
                        const idToSend = selectedInvoice.booking?.id || selectedInvoice.bookingId || selectedInvoice.id;
                        const resp = await (await import('../../services/BookingService')).sendBookingResultEmail(idToSend);
                        alert(resp.message || 'Email dikirim.');
                      } catch (e) {
                        const serverMsg = e?.response?.data?.message || e.message || null;
                        alert(serverMsg ? `Gagal mengirim hasil analisis: ${serverMsg}` : 'Gagal mengirim hasil analisis. Cek console.');
                      }
                    }}
                  >
                    Kirim Hasil ke Klien
                  </Button>
                )
              )}

              <Button 
                className="w-50 rounded-pill text-white shadow-sm" 
                style={{ backgroundColor: customColors.brown, border: 'none' }}
                onClick={() => setShowDetailModal(false)}
              >
                Kembali ke Daftar
              </Button>
            </div>
        </Modal.Footer>
      </Modal>

      {/* MODAL PREVIEW BUKTI PEMBAYARAN */}
      <Modal show={showProofModal} onHide={() => {
        setShowProofModal(false);
        if (proofBlobUrl) {
          try { window.URL.revokeObjectURL(proofBlobUrl); } catch (e) {}
          setProofBlobUrl(null);
          setProofMime(null);
        }
      }} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title>Preview Bukti Pembayaran</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ minHeight: '60vh' }}>
          {proofBlobUrl ? (
            proofMime && proofMime.indexOf('pdf') !== -1 ? (
              <object data={proofBlobUrl} type="application/pdf" width="100%" height="520">PDF tidak didukung di browser ini.</object>
            ) : (
              <img src={proofBlobUrl} alt="Bukti Pembayaran" style={{ maxWidth: '100%', maxHeight: '70vh', display: 'block', margin: '0 auto' }} />
            )
          ) : (
            <div className="text-center text-muted">Tidak ada bukti pembayaran untuk ditampilkan.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => {
            setShowProofModal(false);
            if (proofBlobUrl) {
              try { window.URL.revokeObjectURL(proofBlobUrl); } catch (e) {}
              setProofBlobUrl(null);
              setProofMime(null);
            }
          }}>Tutup</Button>
        </Modal.Footer>
      </Modal>

      {/* Manual invoice modal removed — invoices are generated automatically from booking data */}
    </NavbarLoginKoordinator>
  );
};

export default ManajemenPembayaran;