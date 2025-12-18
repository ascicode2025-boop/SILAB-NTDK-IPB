import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { getAllBookings, updateBookingStatus } from "../../services/BookingService";
import { Button, Spin, Table, Tag, Card, Typography, Empty } from "antd";
import { EditOutlined, CheckCircleFilled } from "@ant-design/icons";
import "@fontsource/poppins";

const { Title, Text } = Typography;

function InputNilaiAnalisis() {
  const [approvedSamples, setApprovedSamples] = useState([]);
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const data = await getAllBookings();
      const allBookings = data?.data || [];

      const approved = allBookings.filter((booking) => booking.status === "Sampel Diterima" || booking.status === "Sedang Dianalisis");
      setApprovedSamples(approved);
    } catch (error) {
      console.error("Failed to fetch approved samples", error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputNilai = async (record) => {
    try {
      setLoading(true);

      // Hanya update status kalau masih Sampel Diterima
      if (record.status === "Sampel Diterima") {
        await updateBookingStatus(record.id, "Sedang Dianalisis");
      }

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
      title: "Kode Sampel",
      dataIndex: "kode_sampel",
      key: "kode_sampel",
      width: 380,
      render: (text) => (
        <Text
          strong
          style={{
            display: "inline-block",
            maxWidth: "360px",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
          title={text}
        >
          {text || "-"}
        </Text>
      ),
    },

    {
      title: "Nama Klien",
      dataIndex: ["user", "name"],
      key: "client_name",
      render: (text) => text || "-",
    },
    {
      title: "Jenis Analisis",
      dataIndex: "jenis_analisis",
      key: "jenis_analisis",
    },
    {
      title: "Analisis Item",
      dataIndex: "analysis_items",
      key: "analysis_items",
      width: 500, // <-- Diperlebar
      render: (items) => (
        <div style={{ maxWidth: "250px" }}>
          {Array.isArray(items) && items.length > 0
            ? items.map((i) => (
                <Tag color="blue" key={i.id} style={{ marginBottom: "4px" }}>
                  {i.nama_item}
                </Tag>
              ))
            : "Tidak ada data"}
        </div>
      ),
    },
    {
      title: "Aksi",
      key: "action",
      align: "center",
      width: 180,
      fixed: "right",
      render: (_, record) => {
        const isLanjut = record.status === "Sedang Dianalisis";

        return (
          <Button type={isLanjut ? "default" : "primary"} icon={<EditOutlined />} shape="round" loading={loading} onClick={() => handleInputNilai(record)}>
            {isLanjut ? "Lanjut Input Nilai" : "Input Nilai"}
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
          padding: "40px 20px",
        }}
      >
        <div className="container">
          <div className="mb-4">
            <Title level={3}>
              Input Nilai Analisis <span style={{ fontSize: "18px", fontWeight: "400", color: "#8c8c8c" }}>| Manajemen Sampel</span>
            </Title>
            <Text type="secondary">Silahkan masukkan parameter nilai untuk sampel yang telah dikonfirmasi diterima.</Text>
          </div>

          <Card bordered={false} className="shadow-sm" style={{ borderRadius: "16px", overflow: "hidden" }}>
            {loading ? (
              <div className="text-center py-5">
                <Spin size="large" tip="Memuat data sampel..." />
              </div>
            ) : (
              <Table dataSource={approvedSamples} columns={columns} rowKey="id" pagination={{ pageSize: 10 }} locale={{ emptyText: <Empty description="Belum ada sampel yang disetujui" /> }} className="custom-table" />
            )}
          </Card>
        </div>
      </div>
      <FooterSetelahLogin />
    </NavbarLoginTeknisi>
  );
}

export default InputNilaiAnalisis;
