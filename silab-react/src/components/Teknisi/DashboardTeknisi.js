import React, { useState, useEffect } from "react";
import NavbarLoginTeknisi from "./NavbarLoginTeknisi";
import { getAllBookings } from "../../services/BookingService"; 
import FooterSetelahLogin from "../FooterSetelahLogin";
import { Spin, message } from "antd";
import dayjs from "dayjs"; 

const DashboardTeknisi = () => {
  const [dataBookings, setDataBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Helper function to parse kode_sampel
  const generateSampleCodes = (booking) => {
    if (!booking.kode_sampel) return [];
    
    try {
      // If it's already an array, return it
      if (Array.isArray(booking.kode_sampel)) {
        return booking.kode_sampel;
      }
      
      // If it's a JSON string, parse it
      if (typeof booking.kode_sampel === 'string') {
        const parsed = JSON.parse(booking.kode_sampel);
        return Array.isArray(parsed) ? parsed : [booking.kode_sampel];
      }
      
      return [booking.kode_sampel];
    } catch (error) {
      // If parsing fails, return as single item array
      return [booking.kode_sampel];
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getAllBookings();
        setDataBookings(response.data);
      } catch (error) {
        console.error(error);
        message.error("Gagal memuat data dashboard.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const filteredData = dataBookings.filter((item) => {
    const query = search.toLowerCase();
    const userName = item.user ? (item.user.full_name || item.user.name).toLowerCase() : "";
    const sampleCodes = generateSampleCodes(item);
    const kode = sampleCodes.join(' ').toLowerCase();
    const status = item.status.toLowerCase();
    const analisis = item.jenis_analisis.toLowerCase();

    // Filter out "dibatalkan" and "ditolak" status
    if (status === "dibatalkan" || status === "ditolak") {
      return false;
    }

    return (
      kode.includes(query) ||
      userName.includes(query) ||
      analisis.includes(query) ||
      status.includes(query)
    );
  });

 
  const getStatusBadge = (status) => {
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case "menunggu":
        return "bg-warning text-dark";
      case "disetujui":
        return "text-white";
      case "proses":
        return "text-white";
      case "menunggu_verifikasi":
        return "text-white";
      case "menunggu_pembayaran":
        return "text-white";
      case "selesai":
        return "bg-success text-white";
      case "ditolak":
        return "bg-danger text-white";
      case "dibatalkan":
        return "bg-secondary text-white";
      default:
        return "bg-secondary text-white";
    }
  };

  const getStatusStyle = (status) => {
    const lowerStatus = status.toLowerCase();
    switch (lowerStatus) {
      case "disetujui":
        return { backgroundColor: '#0d6efd' }; // Biru
      case "proses":
        return { backgroundColor: '#6f42c1' }; // Ungu
      case "menunggu_verifikasi":
        return { backgroundColor: '#d63384' }; // Pink
      case "menunggu_pembayaran":
        return { backgroundColor: '#fd7e14' }; // Orange
      default:
        return {};
    }
  };

  return (
    <NavbarLoginTeknisi>
      <div className="font-poppins container py-5" style={{ background: "#f2f2f2", minHeight: "100vh" }}>
        
        {/* Search Bar */}
        <div className="mb-4 d-flex justify-content-center">
          <div className="input-group" style={{ maxWidth: "400px" }}>
            <input
              type="text"
              className="form-control rounded-start-pill"
              placeholder="Cari Kode / Nama / Status..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <span className="input-group-text rounded-end-pill bg-white">
              <i className="bi bi-search"></i>
            </span>
          </div>
        </div>

        {/* Table Container */}
        <div className="table-responsive bg-white rounded-4 shadow p-3">
          <Spin spinning={loading} tip="Memuat data...">
            <table className="table table-bordered align-middle text-center table-hover">
              <thead className="table-light">
                <tr>
                  <th>No</th>
                  <th>Kode Sampel</th>
                  <th>Nama Klien</th>
                  <th>Jenis Analisis</th>
                  <th>Tanggal Kirim</th>
                  <th>Status</th>
                </tr>
              </thead>
              
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((row, index) => {
                    const sampleCodes = generateSampleCodes(row);
                    return (
                    <tr key={row.id}>
                      <td>{index + 1}</td>
                      <td className="fw-bold" style={{ minWidth: '200px' }}>
                        <div className="d-flex flex-column">
                          <span>{sampleCodes[0] || row.kode_sampel}</span>
                          {sampleCodes.length > 1 && (
                            <small className="text-muted" style={{ fontSize: '0.75rem', marginTop: '2px' }}>
                              +{sampleCodes.length - 1} sampel lainnya
                            </small>
                          )}
                        </div>
                      </td>
                      <td style={{ maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={row.user ? (row.user.full_name || row.user.name) : "Guest"}>
                        {row.user ? (row.user.full_name || row.user.name) : "Guest"}
                      </td>
                      <td>{row.jenis_analisis}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>{dayjs(row.tanggal_kirim).format("DD MMM YYYY")}</td>
                      
                      {/* Status Badge */}
                      <td>
                        <span className={`badge ${getStatusBadge(row.status)}`} style={getStatusStyle(row.status)}>
                          {row.status}
                        </span>
                      </td>
                    </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center py-4 text-muted">
                      {loading ? "Sedang memuat..." : "Tidak ada data ditemukan."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Spin>
        </div>
      </div>
      <FooterSetelahLogin/>
    </NavbarLoginTeknisi>
  );
};

export default DashboardTeknisi;