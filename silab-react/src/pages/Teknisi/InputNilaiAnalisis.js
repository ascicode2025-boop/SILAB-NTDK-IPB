import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import FooterSetelahLogin from "../tamu/FooterSetelahLogin";
import { getAllBookings, updateBookingStatus } from "../../services/BookingService";
import { Button, Table, Tag, Card, Typography, Empty } from "antd";
import LoadingSpinner from "../../components/Common/LoadingSpinner";
import { EditOutlined, CheckCircleFilled } from "@ant-design/icons";
import "@fontsource/poppins";

const { Title, Text } = Typography;

function InputNilaiAnalisis() {
  const [approvedSamples, setApprovedSamples] = useState([]);
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  useEffect(() => {
    fetchData();
    // Auto-refresh setiap 10 detik
    const interval = setInterval(() => {
      fetchData();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getAllBookings();
      const allBookings = data?.data || [];

      // Filter status untuk input/edit: "proses", "selesai_di_analisis", "menunggu_verifikasi", "draft", "ditolak" dan status yang menunjukkan dikembalikan ke teknisi (dikirim_ke_teknisi)
      const approved = allBookings.filter((booking) => {
        const status = (booking.status || '').toLowerCase();
        return (
          status === "proses" ||
          status === "selesai_di_analisis" ||
          status === "menunggu_verifikasi" ||
          status === "draft" ||
          status === "ditolak" ||
          status === "dikirim_ke_teknisi" ||
          status === "dikirim ke teknisi"
        );
      });
      setApprovedSamples(approved);
    } catch (error) {
      console.error("Failed to fetch approved samples", error);
    } finally {
      setLoading(false);
    }
  };

  // Helper function untuk parse kode_sampel JSON
  const generateSampleCodes = (booking) => {
    if (!booking) return [];
    
    try {
      let codes = [];
      
      if (typeof booking.kode_sampel === 'string') {
        try {
          codes = JSON.parse(booking.kode_sampel);
          if (Array.isArray(codes)) {
            return codes;
          }
        } catch (e) {
          codes = [booking.kode_sampel];
        }
      } else if (Array.isArray(booking.kode_sampel)) {
        codes = booking.kode_sampel;
      }
      
      return codes;
    } catch (error) {
      console.error('Error parsing kode_sampel:', error);
      return [];
    }
  };

  const handleInputNilai = async (record) => {
    try {
      setLoading(true);

      // Redirect langsung ke halaman input analisis
      history.push(`/teknisi/dashboard/inputNilaiAnalisis/input-analisis/${record.id}`);
    } catch (error) {
      console.error("Gagal memperbarui status:", error);
    } finally {
      setLoading(false);
    }
  };

  // Menggunakan Kolom Ant Design untuk tampilan lebih rapi & responsif
  const columns = [
    {
      title: "No",
      key: "index",
      render: (text, record, index) => index + 1,
      width: 60,
    },
    {
      title: "Kode Batch",
      dataIndex: "kode_batch",
      key: "kode_batch",
      width: 220, // Perlebar kolom agar kode batch tidak terpotong
      render: (text, record) => (
        <Tag color="blue" style={{ marginBottom: '2px', fontWeight: 600, fontSize: '1rem', letterSpacing: '1px', whiteSpace: 'nowrap' }}>
          {record.kode_batch || '-'}
        </Tag>
      ),
    },

    {
      title: "Nama Lengkap",
      dataIndex: ["user", "full_name"],
      key: "client_name",
      width: 150,
      render: (text, record) => text || record.user?.name || "-",
    },
    {
      title: "Jenis Analisis",
      dataIndex: "jenis_analisis",
      key: "jenis_analisis",
      width: 150,
    },
    {
      title: "Analisis Item",
      dataIndex: "analysis_items",
      key: "analysis_items",
      width: 200,
      render: (items) => (
        <div style={{ 
          display: 'flex', 
          flexWrap: 'wrap', 
          gap: '4px',
          maxHeight: '80px',
          overflowY: 'auto'
        }}>
          {Array.isArray(items) && items.length > 0
            ? items.map((i) => (
                <Tag color="blue" key={i.id} style={{ margin: 0, fontSize: '0.75rem' }}>
                  {i.nama_item}
                </Tag>
              ))
            : <Text type="secondary">-</Text>}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      width: 160,
      align: "center",
      render: (status) => {
        if (status === "menunggu_verifikasi") {
          return <Tag color="orange">Menunggu Verifikasi</Tag>;
        }
        if (status === "selesai_di_analisis") {
          return <Tag color="green">Selesai di Analisis</Tag>;
        }
        if (status === "draft") {
          return <Tag color="gold">Draft</Tag>;
        }
        if (status === "ditolak") {
          return <Tag color="red">Ditolak</Tag>;
        }
        if (status === "dikirim_ke_teknisi" || status === "dikirim ke teknisi") {
          return <Tag color="blue">Dikirim ke Teknisi</Tag>;
        }
        return <Tag color="blue">Proses</Tag>;
      },
    },
    {
      title: "Aksi",
      key: "action",
      align: "center",
      width: 200,
      fixed: "right",
      render: (_, record) => {
        let buttonText = "Input";
        let disabled = false;
        if (record.status === "menunggu_verifikasi") {
          buttonText = "Edit";
          disabled = true; // Tidak bisa input/edit jika sudah dikirim ke koordinator
        }
        if (record.status === "selesai_di_analisis") {
          buttonText = "Kirim ke Koordinator";
        }
        // Jika booking dikirim kembali ke teknisi oleh koordinator, teknisi dapat mengedit
        if (record.status === "dikirim_ke_teknisi" || record.status === "dikirim ke teknisi") {
          buttonText = "Edit (Dikirim Kembali)";
          disabled = false;
        }
        if (record.status === "draft") buttonText = "Lanjutkan Pengerjaan";
        if (record.status === "ditolak") {
          buttonText = "Perbaiki Hasil (Ditolak)";
          disabled = false; // Bisa edit jika ditolak
        }
        return (
          <Button 
            type="primary" 
            icon={<EditOutlined />} 
            size="middle"
            loading={loading} 
            disabled={disabled}
            onClick={() => handleInputNilai(record)}
          >
            {buttonText}
          </Button>
        );
      },
    },
  ];

  return (
    <NavbarLoginTeknisi>
      <div
        style={{
          minHeight: "90vh",
          backgroundColor: "#f8f9fa",
          fontFamily: "Poppins, sans-serif",
          padding: "30px 20px",
        }}
      >
        <div className="container" style={{ maxWidth: '1400px' }}>
          <div className="mb-4">
            <Title level={3} style={{ marginBottom: '8px' }}>
              Input Nilai Analisis <span style={{ fontSize: "16px", fontWeight: "400", color: "#8c8c8c" }}>| Manajemen Sampel</span>
            </Title>
            <Text type="secondary">Silahkan masukkan parameter nilai untuk sampel yang telah dikonfirmasi diterima.</Text>
          </div>

          <Card bordered={false} className="shadow-sm" style={{ borderRadius: "12px", overflow: "hidden" }}>
            {loading ? (
              <div className="text-center py-5">
                <LoadingSpinner spinning={loading} tip="Memuat data sampel..." />
              </div>
            ) : (
              <Table 
                dataSource={approvedSamples} 
                columns={columns} 
                rowKey="id" 
                pagination={{ pageSize: 10, showSizeChanger: true, showTotal: (total) => `Total ${total} sampel` }} 
                locale={{ emptyText: <Empty description="Belum ada sampel yang disetujui" /> }} 
                scroll={{ x: 1200 }}
                size="middle"
              />
            )}
          </Card>
        </div>
      </div>
      <FooterSetelahLogin />
    </NavbarLoginTeknisi>
  );
}

export default InputNilaiAnalisis;
