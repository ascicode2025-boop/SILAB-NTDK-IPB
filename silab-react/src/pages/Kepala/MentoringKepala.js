import React, { useState, useEffect } from "react";
import { Container, Row, Col, Card, Table, Button, Spinner } from "react-bootstrap";
import NavbarLoginKepala from "./NavbarLoginKepala";
import FooterSetelahLogin from "../FooterSetelahLogin";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from "chart.js";
import { getAllBookings, getInvoices } from "../../services/BookingService";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const MentoringKepala = () => {
  useEffect(() => {
    document.title = "SILAB-NTDK - Mentoring Kepala";
  }, []);

  const [loading, setLoading] = useState(true);
  const [chartData, setChartData] = useState(null);
  const [rekaptulasi, setRekaptulasi] = useState([]);
  const [rekapDetail, setRekapDetail] = useState([]);

  const customColors = {
    brown: "#a3867a",
    lightGray: "#e9ecef",
    darkBrown: "#6b5a52",
  };

  const fetchData = async () => {
    try {
      setLoading(true);

      // Fetch bookings dan invoices
      const bookingsRes = await getAllBookings();
      const invoicesRes = await getInvoices();

      const bookings = bookingsRes?.data || [];
      const invoices = invoicesRes?.data || [];

      // Process chart data - aktivitas per bulan
      const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"];
      const activityData = new Array(12).fill(0);

      bookings.forEach((booking) => {
        if (booking.created_at) {
          const date = new Date(booking.created_at);
          activityData[date.getMonth()]++;
        }
      });

      // Hitung persentase (max 100)
      const maxActivity = Math.max(...activityData, 1);
      const percentageData = activityData.map((val) => Math.round((val / maxActivity) * 100));

      setChartData({
        labels: months,
        datasets: [
          {
            label: "Aktivitas Lab",
            data: percentageData,
            backgroundColor: customColors.darkBrown,
            borderRadius: 4,
          },
        ],
      });

      // Process Rekaptulasi (last 2 months)
      const monthlyAnalysis = {};
      bookings.forEach((booking) => {
        if (booking.created_at) {
          const date = new Date(booking.created_at);
          const monthKey = date.toLocaleString("id-ID", { month: "long", year: "numeric" });
          if (!monthlyAnalysis[monthKey]) {
            monthlyAnalysis[monthKey] = {
              sampel: 0,
              totalWaktu: [],
              createdAt: date,
            };
          }
          monthlyAnalysis[monthKey].sampel += booking.jumlah_sampel || 1;

          // Hitung waktu pengerjaan jika ada
          if (booking.created_at && booking.updated_at) {
            const createdDate = new Date(booking.created_at);
            const updatedDate = new Date(booking.updated_at);
            const diffTime = Math.abs(updatedDate - createdDate);
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            monthlyAnalysis[monthKey].totalWaktu.push(diffDays);
          }
        }
      });

      const rekapData = Object.entries(monthlyAnalysis)
        .sort((a, b) => b[1].createdAt - a[1].createdAt)
        .slice(0, 2)
        .map(([month, data]) => {
          const avgWaktu = data.totalWaktu.length > 0 ? (data.totalWaktu.reduce((a, b) => a + b, 0) / data.totalWaktu.length).toFixed(1) : "0";
          const status = avgWaktu < 2 ? "Stabil" : avgWaktu < 3 ? "Sedikit menurun" : "Menurun";
          return {
            bulan: month,
            sampel: data.sampel,
            rata_rata: `${avgWaktu} hari`,
            keterangan: status,
          };
        });

      setRekaptulasi(rekapData);

      // Process Tabel Rekap Detail (per bulan dengan invoice data)
      const monthlyInvoice = {};
      invoices.forEach((invoice) => {
        if (invoice.created_at) {
          const date = new Date(invoice.created_at);
          const monthKey = date.toLocaleString("id-ID", { month: "long", year: "numeric" });
          if (!monthlyInvoice[monthKey]) {
            monthlyInvoice[monthKey] = {
              transaksi: 0,
              totalPendapatan: 0,
              createdAt: date,
            };
          }
          monthlyInvoice[monthKey].transaksi++;
          monthlyInvoice[monthKey].totalPendapatan += invoice.amount || 0;
        }
      });

      const rekapDetailData = Object.entries(monthlyInvoice)
        .sort((a, b) => b[1].createdAt - a[1].createdAt)
        .slice(0, 3)
        .map(([month, data]) => {
          const prevMonth = Object.entries(monthlyInvoice)
            .sort((a, b) => b[1].createdAt - a[1].createdAt)
            .find((entry) => entry[1].createdAt < data.createdAt);

          let status = "Stabil";
          if (prevMonth && data.totalPendapatan > prevMonth[1].totalPendapatan) {
            status = "Naik";
          } else if (prevMonth && data.totalPendapatan < prevMonth[1].totalPendapatan) {
            status = "Turun";
          }

          return {
            bulan: month,
            transaksi: data.transaksi,
            total: `Rp ${data.totalPendapatan.toLocaleString("id-ID")}`,
            keterangan: status,
          };
        });

      setRekapDetail(rekapDetailData);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: function (value) {
            return value + "%";
          },
        },
      },
    },
  };

  const handleExportLaporan = () => {
    alert("Fitur export laporan sedang dikembangkan");
  };

  if (loading) {
    return (
      <NavbarLoginKepala>
        <div style={{ backgroundColor: customColors.lightGray, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <Spinner animation="border" role="status" style={{ color: customColors.brown }}>
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      </NavbarLoginKepala>
    );
  }

  return (
    <NavbarLoginKepala>
      <div style={{ backgroundColor: customColors.lightGray, minHeight: "100vh", paddingTop: "2rem", paddingBottom: "2rem" }}>
        <Container>
          {/* CHART AKTIVITAS LAB */}
          <Row className="mb-5">
            <Col lg={10} className="mx-auto">
              <Card className="border-0 shadow-sm" style={{ borderRadius: "15px", overflow: "hidden" }}>
                <Card.Body className="p-4">
                  <div className="mb-3">
                    <h6 className="fw-bold text-uppercase" style={{ color: customColors.brown, fontSize: "0.9rem" }}>
                      aktivitas lab
                    </h6>
                    <small className="text-muted">Persentase aktivitas per bulan</small>
                  </div>
                  <div style={{ height: "250px" }}>{chartData ? <Bar data={chartData} options={chartOptions} /> : <p>No data available</p>}</div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* REKAPTULASI */}
          <Row className="mb-5">
            <Col lg={10} className="mx-auto">
              <h5 className="fw-bold mb-3" style={{ color: "#333" }}>
                Rekaptulasi
              </h5>
              <Card className="border-0 shadow-sm" style={{ borderRadius: "15px", overflow: "hidden" }}>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table className="mb-0" style={{ fontSize: "0.95rem" }}>
                      <thead style={{ backgroundColor: "#f8f9fa" }}>
                        <tr>
                          <th className="py-3 px-4 fw-bold text-dark border-bottom">Bulan</th>
                          <th className="py-3 px-4 fw-bold text-dark border-bottom text-center">Jumlah Sampel Dianalisis</th>
                          <th className="py-3 px-4 fw-bold text-dark border-bottom text-center">Rata-rata Waktu Pengerjaan</th>
                          <th className="py-3 px-4 fw-bold text-dark border-bottom text-center">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rekaptulasi.length > 0 ? (
                          rekaptulasi.map((row, idx) => (
                            <tr key={idx}>
                              <td className="py-3 px-4 border-bottom">{row.bulan}</td>
                              <td className="py-3 px-4 border-bottom text-center fw-bold">{row.sampel}</td>
                              <td className="py-3 px-4 border-bottom text-center">{row.rata_rata}</td>
                              <td className="py-3 px-4 border-bottom text-center">
                                <span
                                  style={{
                                    color: row.keterangan === "Stabil" ? "#198754" : "#fd7e14",
                                    fontWeight: "500",
                                  }}
                                >
                                  {row.keterangan}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-3 px-4 text-center text-muted">
                              Tidak ada data
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* TABEL REKAP DETAIL */}
          <Row className="mb-5">
            <Col lg={10} className="mx-auto">
              <h5 className="fw-bold mb-3 text-center" style={{ color: "#333" }}>
                Tabel Rekap Detail (per Bulan)
              </h5>
              <Card className="border-0 shadow-sm" style={{ borderRadius: "15px", overflow: "hidden" }}>
                <Card.Body className="p-0">
                  <div className="table-responsive">
                    <Table className="mb-0" style={{ fontSize: "0.95rem" }}>
                      <thead style={{ backgroundColor: "#f8f9fa" }}>
                        <tr>
                          <th className="py-3 px-4 fw-bold text-dark border-bottom">Bulan</th>
                          <th className="py-3 px-4 fw-bold text-dark border-bottom text-center">Jumlah Transaksi</th>
                          <th className="py-3 px-4 fw-bold text-dark border-bottom text-center">Total Pendapatan</th>
                          <th className="py-3 px-4 fw-bold text-dark border-bottom text-center">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rekapDetail.length > 0 ? (
                          rekapDetail.map((row, idx) => (
                            <tr key={idx}>
                              <td className="py-3 px-4 border-bottom">{row.bulan}</td>
                              <td className="py-3 px-4 border-bottom text-center fw-bold">{row.transaksi}</td>
                              <td className="py-3 px-4 border-bottom text-center fw-bold">{row.total}</td>
                              <td className="py-3 px-4 border-bottom text-center">
                                <span
                                  style={{
                                    color: row.keterangan === "Stabil" ? "#198754" : row.keterangan === "Naik" ? "#0d6efd" : "#dc3545",
                                    fontWeight: "500",
                                  }}
                                >
                                  {row.keterangan}
                                </span>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td colSpan={4} className="py-3 px-4 text-center text-muted">
                              Tidak ada data
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* EKSPOR LAPORAN BUTTON */}
          <Row className="mb-5">
            <Col lg={10} className="mx-auto" style={{ textAlign: "center" }}>
              <Button
                onClick={handleExportLaporan}
                className="px-5 py-2 fw-bold rounded-pill shadow-sm"
                style={{
                  backgroundColor: customColors.brown,
                  color: "white",
                  border: "none",
                  fontSize: "0.95rem",
                }}
              >
                Ekspor Laporan
              </Button>
            </Col>
          </Row>
        </Container>
      </div>
      <FooterSetelahLogin />
    </NavbarLoginKepala>
  );
};

export default MentoringKepala;
