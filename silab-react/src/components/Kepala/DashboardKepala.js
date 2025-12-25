import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import React from "react";
import { Row, Col, Card, Table, Button } from "react-bootstrap";
import {
  FaClock,
  FaCheckCircle,
  FaFileAlt,
  FaExclamationTriangle,
} from "react-icons/fa";
import NavbarLoginKepala from "./NavbarLoginKepala";

const dataAktivitas = [
  { bulan: "Jan", total: 10 },
  { bulan: "Feb", total: 15 },
  { bulan: "Mar", total: 22 },
  { bulan: "Apr", total: 30 },
];

function DashboardKepala() {
  return (
    <NavbarLoginKepala>
      <div className="dashboard-wrapper">

        <h5 className="mb-4 fw-semibold">Selamat Datang!</h5>

        {/* ===== SUMMARY ===== */}
        <Row className="g-4 mb-4">
          <Col md={4}>
            <Card className="summary-card">
              <FaClock className="icon" />
              <p>Menunggu Verifikasi</p>
              <h3>5</h3>
              <span>Laporan</span>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="summary-card">
              <FaCheckCircle className="icon" />
              <p>Sudah Disetujui</p>
              <h3>20</h3>
              <span>Hasil</span>
            </Card>
          </Col>

          <Col md={4}>
            <Card className="summary-card">
              <FaFileAlt className="icon" />
              <p>Laporan Bulan Ini</p>
              <h3>3</h3>
              <span>Dokumen</span>
            </Card>
          </Col>
        </Row>

       {/* ===== ALERT / VERIFIKASI ===== */}
<div className="verifikasi-wrapper">
  <Card className="verifikasi-card">
    <FaExclamationTriangle className="verifikasi-icon" />
    <div className="verifikasi-content">
      <p>
        Hasil analisis sampel <strong>K001</strong> siap diverifikasi
      </p>
      <Button size="sm" className="verifikasi-btn">
        Verifikasi Sekarang
      </Button>
    </div>
  </Card>
</div>


        {/* ===== CHART ===== */}
        <Card className="chart-card mb-5">
          <h6 className="fw-semibold mb-3">
            Statistik Aktivitas Laboratorium
          </h6>

          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={dataAktivitas}>
              <XAxis dataKey="bulan" />
              <YAxis />
              <Tooltip />
              <Bar
                dataKey="total"
                fill="#8d6e63"
                radius={[10, 10, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* ===== TABLE ===== */}
<Card className="table-card shadow-sm">
  <Card.Header className="table-header">
    Aktivitas Terbaru Laboratorium
  </Card.Header>

  <Table hover responsive className="mb-0 custom-table">
    <thead>
      <tr>
        <th>Tanggal</th>
        <th>Aktivitas</th>
        <th>Pelaksana</th>
        <th>Status</th>
      </tr>
    </thead>

    <tbody>
      <tr>
        <td>28 Nov 2025</td>
        <td>Kalibrasi Timbangan Digital</td>
        <td>Budi Teknisi</td>
        <td>
          <span className="status-badge selesai">Selesai</span>
        </td>
      </tr>

      <tr>
        <td>28 Nov 2025</td>
        <td>Peminjaman Mikroskop</td>
        <td>Siti Koordinator</td>
        <td>
          <span className="status-badge menunggu">
            Menunggu
          </span>
        </td>
      </tr>
    </tbody>
  </Table>
</Card>


        {/* ===== INLINE CSS (NYATU) ===== */}
        <style>{`
          .dashboard-wrapper {
            padding: 32px 40px;
            max-width: 1200px;
            margin: 0 auto;
          }

          .summary-card {
            text-align: center;
            padding: 32px 20px;
            border-radius: 20px;
            border: none;
            background: #ffffff;
            box-shadow: 0 8px 18px rgba(0,0,0,0.08);
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
          }

          .summary-card .icon {
            font-size: 42px;
            color: #5d4037;
            margin-bottom: 16px;
          }

          .summary-card h3 {
            margin: 6px 0;
            color: #3e2723;
            font-size: 1.8rem;
          }

          .alert-card {
            display: flex;
            align-items: center;
            gap: 18px;
            padding: 24px;
            border-radius: 18px;
            background: #fff3e0;
            border: none;
            box-shadow: 0 6px 16px rgba(0,0,0,0.08);
          }

          .chart-card {
            padding: 24px;
            border-radius: 20px;
            border: none;
            box-shadow: 0 6px 16px rgba(0,0,0,0.08);
          }

          .table-card {
            border-radius: 20px;
            overflow: hidden;
          }
          .verifikasi-wrapper {
            display: flex;
            justify-content: center;
            margin-bottom: 24px; 
            }


            .verifikasi-card {
            width: 100%;
            max-width: 500px;
            padding: 28px 32px;
            border-radius: 22px;
            border: none;
            background: linear-gradient(135deg, #8d6e63, #6d4c41);
            color: #fff;
            box-shadow: 0 10px 24px rgba(0,0,0,0.18);
            display: flex;
            align-items: center;
            gap: 20px;
            }

        .verifikasi-icon {
        font-size: 34px;
        color: #ffe0b2;
        flex-shrink: 0;
        }

        .verifikasi-content p {
        margin-bottom: 12px;
        font-size: 0.95rem;
        }

        .verifikasi-btn {
        background: #3e2723 !important;
        border: none !important;
        padding: 6px 16px;
        border-radius: 20px;
        font-weight: 500;
        }

        .verifikasi-btn:hover {
        background: #2e1b18 !important;
        }
        /* ===== TABLE COKLAT ===== */
        .table-card {
        border-radius: 20px;
        overflow: hidden;
        border: none;
        }

        .table-header {
        background: linear-gradient(135deg, #6d4c41, #4e342e);
        color: #fff;
        font-weight: 600;
        padding: 18px 24px;
        border-bottom: none;
        }

        .custom-table {
        background: #fff;
        }

        .custom-table thead th {
        background: #efebe9;
        color: #4e342e;
        font-weight: 600;
        border: none;
        padding: 14px 18px;
        }

        .custom-table tbody td {
        padding: 14px 18px;
        vertical-align: middle;
        border-top: 1px solid #d7ccc8;
        color: #4e342e;
        }

        .custom-table tbody tr:hover {
        background: #f3ece9;
        }

        /* ===== STATUS BADGE ===== */
        .status-badge {
        padding: 6px 14px;
        border-radius: 14px;
        font-size: 0.75rem;
        font-weight: 600;
        display: inline-block;
        }

        .status-badge.selesai {
        background: #a1887f;
        color: #3e2723;
        }

        .status-badge.menunggu {
        background: #d7ccc8;
        color: #4e342e;
        }


        `}</style>

      </div>
    </NavbarLoginKepala>
  );
}

export default DashboardKepala;
