import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useHistory, useLocation } from "react-router-dom";
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { formatDataForPDF } from "../../utils/pdfHelpers";
import { message, Spin, Table, Tag, Button, Space } from "antd";
import { EyeOutlined, SendOutlined, EditOutlined, DownloadOutlined } from "@ant-design/icons";
import { kirimKeKoordinator, getAllBookings } from "../../services/BookingService";

export default function GeneratePdfAnalysis({ autoGenerate = true, filename = "hasil_analisis.pdf", booking: propBooking = null }) {
  const location = useLocation();
  const history = useHistory();
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingList, setBookingList] = useState([]);
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  
  // Get booking from props or route state
  const bookingFromRoute = propBooking || location.state?.booking;

  useEffect(() => {
    // Jika ada booking dari route (baru selesai input), langsung tampilkan detail
    if (bookingFromRoute?.id) {
      fetchBookingData(bookingFromRoute.id);
      setViewMode('detail');
    } else {
      // Jika tidak, tampilkan list
      fetchAllVerificationBookings();
      setViewMode('list');
    }
  }, [bookingFromRoute]);

  const fetchAllVerificationBookings = async () => {
    try {
      setLoading(true);
      const response = await getAllBookings();
      const allBookings = response?.data || [];
      
      // Filter booking dengan status menunggu_verifikasi
      const verificationBookings = allBookings.filter(b => 
        b.status === 'menunggu_verifikasi'
      );
      
      setBookingList(verificationBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      message.error("Gagal memuat daftar booking.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookingData = async (bookingId) => {
    try {
      setLoading(true);
      console.log('Fetching booking with ID:', bookingId);
      
      const response = await getAllBookings();
      console.log('All bookings response:', response);
      
      const allBookings = response?.data || [];
      console.log('Total bookings:', allBookings.length);
      
      const booking = allBookings.find(b => b.id === bookingId);
      
      if (booking) {
        console.log('=== BOOKING DATA FOUND ===');
        console.log('Booking:', booking);
        console.log('Has analysis_items?', !!booking.analysis_items);
        console.log('Analysis items count:', booking.analysis_items?.length);
        
        if (booking.analysis_items && booking.analysis_items.length > 0) {
          console.log('First item:', booking.analysis_items[0]);
          booking.analysis_items.forEach((item, idx) => {
            console.log(`Item ${idx}: ${item.nama_item}, hasil: "${item.hasil}"`);
          });
        }
        
        setBookingData(booking);
        setSelectedBooking(booking);
      } else {
        console.error('Booking not found with ID:', bookingId);
        message.error("Data booking tidak ditemukan!");
      }
    } catch (error) {
      console.error("Error fetching booking:", error);
      message.error("Gagal memuat data booking.");
    } finally {
      setLoading(false);
    }
  };

  const parseKodeSampel = (kodeSampel) => {
    try {
      let codes = [];
      
      if (typeof kodeSampel === 'string') {
        const parsed = JSON.parse(kodeSampel);
        codes = Array.isArray(parsed) ? parsed : [parsed];
      } else if (Array.isArray(kodeSampel)) {
        codes = kodeSampel;
      } else {
        codes = [kodeSampel];
      }
      
      // Filter empty values dan return sebagai array untuk ditampilkan dengan Tag
      return codes.filter(c => c && c.trim() !== '');
    } catch (e) {
      return [kodeSampel];
    }
  };

  const handleViewDetail = (booking) => {
    setSelectedBooking(booking);
    setBookingData(booking);
    setViewMode('detail');
  };

  const handleBackToList = () => {
    setViewMode('list');
    setSelectedBooking(null);
    setBookingData(null);
    setPdfUrl(null);
    fetchAllVerificationBookings();
  };

  const handleEditData = () => {
    if (!selectedBooking) return;
    history.push(`/teknisi/dashboard/inputNilaiAnalisis/input-analisis/${selectedBooking.id}`);
  };

  const columns = [
    {
      title: 'Kode Sampel',
      dataIndex: 'kode_sampel',
      key: 'kode_sampel',
      width: 200,
      fixed: 'left',
      render: (text, record) => {
        const codes = parseKodeSampel(text);
        const count = codes.length;
        
        if (count === 0) return '-';
        
        return (
          <div>
            <div style={{ marginBottom: '4px' }}>
              <Tag color="blue" style={{ fontSize: '12px' }}>{codes[0]}</Tag>
            </div>
            {count > 1 && (
              <Tag color="cyan" style={{ fontSize: '11px' }}>
                +{count - 1} lainnya
              </Tag>
            )}
          </div>
        );
      },
    },
    {
      title: 'Nama Lengkap',
      dataIndex: 'user',
      key: 'user',
      width: 180,
      ellipsis: true,
      render: (user) => user?.full_name || user?.nama_lengkap || '-',
    },
    {
      title: 'Jenis Analisis',
      dataIndex: 'jenis_analisis',
      key: 'jenis_analisis',
      width: 200,
      ellipsis: true,
      render: (text) => text || '-',
    },
    {
      title: 'Tanggal Pemesanan',
      key: 'tanggal_pemesanan',
      width: 150,
      render: (_, record) => {
        const tanggal = record.tanggal_booking || record.created_at;
        if (!tanggal) return '-';
        
        const date = new Date(tanggal);
        return (
          <span style={{ whiteSpace: 'nowrap' }}>
            {date.toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric'
            })}
          </span>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 170,
      align: 'center',
      render: (status) => {
        const color = status === 'menunggu_verifikasi' ? 'warning' : 'default';
        const text = status === 'menunggu_verifikasi' ? 'Menunggu Verifikasi' : status;
        return <Tag color={color}>{text}</Tag>;
      },
    },
    {
      title: 'Aksi',
      key: 'aksi',
      width: 150,
      fixed: 'right',
      align: 'center',
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          size="small"
          onClick={() => handleViewDetail(record)}
        >
          Lihat PDF
        </Button>
      ),
    },
  ];

  const instituteHeader = [
    "KEMENTERIAN RISET, TEKNOLOGI DAN PENDIDIKAN TINGGI",
    "INSTITUT PERTANIAN BOGOR",
    "FAKULTAS PETERNAKAN",
    "DEPARTEMEN ILMU NUTRISI DAN TEKNOLOGI PAKAN",
    "LABORATORIUM NUTRISI TERNAK DAGING DAN KERJA",
    "Jl. Agathis Kampus IPB Darmaga, Bogor 16680",
  ];

  const defaultData = {
    header: {
      kepada: "Kepada Yth.",
      instansi: "****",
      tempat: "Di Tempat",
      tanggal: "**/**/****",
      title1: "Tabel 1. Hasil Analisis Hematologi pada hewan ternak Ayam",
      title2: "Tabel 2. Hasil Analisis Metabolit pada hewan ternak Ayam",
    },
    table1: [
      ["Kode", "BDM\n(10⁶/µL)", "BDP\n(10³/µL)", "HB\n(G%)", "PCV\n(%)", "Limfosit\n(%)", "Heterofil\n(%)", "Eosinofil\n(%)", "Monosit\n(%)", "Basofil\n(%)"],
      ["A", 4.26, 14.3, 8.0, 28, 54.35, 26.81, 8.7, 9.42, 0.72],
      ["B", 6.53, 9.75, 10.0, 31, 51.41, 28.17, 11.27, 8.45, 0.7],
    ],
    table2: [
      ["No", "Kode", "Glukosa\n(mg/dL)", "Total P.\n(g/dL)", "Albumin\n(mg/dL)"],
      [1, "A", 61.31, 7.82, 3.02],
      [2, "B", 66.29, 6.52, 2.91],
    ],
  };

  // Generate data dari booking atau gunakan default
  const payload = bookingData ? formatDataForPDF(bookingData) : defaultData;

  function buildPDF(download = false) {
    const doc = new jsPDF("p", "mm", "a4");
    const leftMargin = 14;
    let cursorY = 20;
    const pageWidth = doc.internal.pageSize.getWidth();

    /// ===== Tambahkan logo IPB =====
    const logoWidth = 43;
    const logoHeight = 30;
    const logoX = 12; // posisi dari kiri
    const logoY = 5; // posisi mendekati atas

    doc.addImage("/asset/Logo-IPB.png", "PNG", logoX, logoY, logoWidth, logoHeight);

    let headerY = 10; // mulai dekat atas halaman
    const offsetX = 15; // geser sedikit ke kanan

    doc.setFontSize(12); // ukuran font header
    doc.setFont("Times New Roman", "bold");

    instituteHeader.forEach((line) => {
      doc.text(line, pageWidth / 2 + offsetX, headerY, { align: "center" });
      headerY += 6; // jarak antar baris
    });

    cursorY = headerY + 4; // update cursorY setelah header

    // Garis pemisah
    const lineOffsetUp = 2;

    headerY -= lineOffsetUp;
    doc.setLineWidth(0.5);
    doc.line(14, headerY, pageWidth - 14, headerY);
    cursorY = headerY + 10;

    // ===== Header "Kepada Yth." =====
    doc.setFontSize(11);
    doc.setFont("Times New Roman", "400");
    doc.text(payload.header.kepada, leftMargin, cursorY);
    if (payload.header.tanggal) {
      doc.text(`Tanggal ${payload.header.tanggal}`, 160, cursorY);
    }
    cursorY += 6;
    doc.text(payload.header.instansi, leftMargin, cursorY);
    cursorY += 6;
    doc.text(payload.header.tempat, leftMargin, cursorY);

    cursorY += 10;

    // ===== Table 1 (Hematologi) - hanya tampilkan jika ada data =====
    if (payload.table1 && payload.header.title1) {
      doc.setFontSize(12);
      doc.text(payload.header.title1, leftMargin, cursorY);
      cursorY += 6;
      const [table1Head, ...table1Body] = payload.table1;
      
      // Hitung jumlah kolom untuk distribusi lebar otomatis
      const numCols = table1Head.length;
      const availableWidth = pageWidth - leftMargin - 14; // total lebar yang tersedia
      const kodeWidth = 25; // lebar khusus untuk kolom kode
      const remainingWidth = availableWidth - kodeWidth;
      const colWidth = remainingWidth / (numCols - 1); // distribusi merata untuk kolom lainnya
      
      // Build columnStyles dynamically
      const columnStyles = { 0: { cellWidth: kodeWidth, halign: 'center' } };
      for (let i = 1; i < numCols; i++) {
        columnStyles[i] = { cellWidth: colWidth, halign: 'center' };
      }
      
      autoTable(doc, { 
        startY: cursorY, 
        head: [table1Head], 
        body: table1Body, 
        styles: { 
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak',
          halign: 'center',
          valign: 'middle'
        }, 
        headStyles: { 
          fillColor: [220, 220, 220],
          fontSize: 7,
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          minCellHeight: 10
        },
        columnStyles: columnStyles,
        margin: { left: leftMargin, right: 14 },
        tableWidth: 'auto'
      });

      let finalY = doc.lastAutoTable?.finalY || cursorY + 40;
      cursorY = finalY + 12;
    }

    // ===== Table 2 (Metabolit) - hanya tampilkan jika ada data =====
    if (payload.table2 && payload.header.title2) {
      doc.setFontSize(12);
      doc.text(payload.header.title2, leftMargin, cursorY);
      cursorY += 6;
      const [table2Head, ...table2Body] = payload.table2;
      
      // Hitung jumlah kolom untuk distribusi lebar otomatis
      const numCols = table2Head.length;
      const availableWidth = pageWidth - leftMargin - 14;
      const noWidth = 10; // kolom No sangat kecil
      const kodeWidth = 25; // kolom Kode
      const remainingWidth = availableWidth - noWidth - kodeWidth;
      const colWidth = remainingWidth / (numCols - 2); // distribusi untuk kolom parameter
      
      // Build columnStyles dynamically
      const columnStyles = { 
        0: { cellWidth: noWidth, halign: 'center' },
        1: { cellWidth: kodeWidth, halign: 'center' }
      };
      for (let i = 2; i < numCols; i++) {
        columnStyles[i] = { cellWidth: colWidth, halign: 'center' };
      }
      
      autoTable(doc, { 
        startY: cursorY, 
        head: [table2Head], 
        body: table2Body, 
        styles: { 
          fontSize: 8,
          cellPadding: 2,
          overflow: 'linebreak',
          halign: 'center',
          valign: 'middle'
        }, 
        headStyles: { 
          fillColor: [220, 220, 220],
          fontSize: 7,
          fontStyle: 'bold',
          halign: 'center',
          valign: 'middle',
          minCellHeight: 10
        },
        columnStyles: columnStyles,
        margin: { left: leftMargin, right: 14 },
        tableWidth: 'auto'
      });
    }

    // ===== Preview / Download PDF =====
    if (!download) {
      const blob = doc.output("blob");

      // Revoke previous object URL if any to avoid memory leaks
      try {
        if (pdfUrl) URL.revokeObjectURL(pdfUrl);
      } catch (e) {
        // ignore
      }

      // Wrap blob into a File with a filename so browsers' PDF viewers
      // and download buttons can use the intended filename.
      const file = new File([blob], filename, { type: "application/pdf" });
      const url = URL.createObjectURL(file);
      setPdfUrl(url);
      return;
    }

    doc.save(filename);
  }

  useEffect(() => {
    if (autoGenerate && payload && bookingData && viewMode === 'detail') buildPDF(false);
  }, [bookingData, viewMode]);

  const handleKirimKeKoordinator = async () => {
    if (!bookingData) {
      message.error("Data booking tidak ditemukan!");
      return;
    }

    try {
      setLoading(true);
      
      // Panggil API untuk kirim ke koordinator
      await kirimKeKoordinator(bookingData.id);
      
      message.success("Hasil analisis berhasil dikirim ke Koordinator Lab!");
      
      // Redirect ke list view
      setTimeout(() => {
        handleBackToList();
      }, 1500);
    } catch (error) {
      console.error("Gagal kirim ke koordinator:", error);
      message.error("Terjadi kesalahan saat mengirim ke koordinator.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <NavbarLoginTeknisi>
      <div className="container-fluid p-4" style={{ minHeight: "calc(100vh - 160px)" }}>
        {loading && (
          <div className="text-center py-5">
            <Spin size="large" />
          </div>
        )}
        
        {!loading && viewMode === 'list' && (
          <div className="row">
            <div className="col-12">
              <div className="card shadow-sm">
                <div className="card-header bg-primary text-white">
                  <h5 className="mb-0">Daftar Hasil Analisis yang Menunggu Verifikasi</h5>
                </div>
                <div className="card-body">
                  <p className="text-muted mb-3">
                    Berikut adalah daftar pesanan yang telah selesai dianalisis dan menunggu dikirim ke koordinator untuk verifikasi.
                  </p>
                  <Table
                    columns={columns}
                    dataSource={bookingList}
                    rowKey="id"
                    pagination={{ pageSize: 10 }}
                    scroll={{ x: 1100 }}
                    locale={{ emptyText: 'Tidak ada data yang menunggu verifikasi' }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
        
        {!loading && viewMode === 'detail' && (
          <div className="row">
            <div className="col-12 d-flex flex-column">
              <div className="mb-3">
                <h5 className="mb-3">Preview Hasil Analisis (PDF)</h5>
                <p>Preview PDF ditampilkan di bawah, klik tombol untuk download, edit data, atau kirim ke koordinator.</p>
                <div className="d-flex gap-2 mb-3 flex-wrap">
                  <Button 
                    type="default" 
                    icon={<DownloadOutlined />}
                    onClick={() => buildPDF(true)}
                  >
                    Download PDF
                  </Button>
                  <Button 
                    type="default"
                    icon={<EditOutlined />}
                    onClick={handleEditData}
                    disabled={!bookingData}
                  >
                    Edit Data
                  </Button>
                  <Button 
                    type="primary"
                    icon={<SendOutlined />}
                    onClick={handleKirimKeKoordinator} 
                    disabled={!bookingData}
                  >
                    Kirim Ke Koordinator Lab
                  </Button>
                  <Button 
                    onClick={handleBackToList}
                  >
                    Kembali ke Daftar
                  </Button>
                </div>
              </div>

              <div style={{ minHeight: "750px" }}>
                {pdfUrl && (
                  <iframe
                    src={pdfUrl}
                    title="PDF Preview"
                    style={{
                      width: "100%",
                      height: "100%",
                      border: "1px solid #ddd",
                    }}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      <FooterSetelahLogin />
    </NavbarLoginTeknisi>
  );
}
