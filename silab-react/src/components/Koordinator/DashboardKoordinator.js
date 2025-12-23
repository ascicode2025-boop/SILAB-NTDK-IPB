import React, { useEffect, useState } from 'react';
import { Container, Navbar, Nav, Button, Row, Col, Card, Table, Badge, Spinner } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { FaCalendarAlt, FaCheckCircle, FaUsers, FaEye } from 'react-icons/fa';
import { getAllBookings } from '../../services/BookingService';

const DashboardKoordinator = () => {
    const history = useHistory();
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchPendingBookings();
    }, []);

    const fetchPendingBookings = async () => {
        try {
            setLoading(true);
            const response = await getAllBookings();
            const data = response?.data || [];
            
            // Filter hanya booking yang menunggu verifikasi
            const pending = data.filter(b => b.status === 'menunggu_verifikasi');
            setBookings(pending);
        } catch (error) {
            console.error('Error fetching bookings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        history.push('/login');
    };

    const parseKodeSampel = (kodeSampel) => {
        try {
            if (typeof kodeSampel === 'string') {
                const parsed = JSON.parse(kodeSampel);
                return Array.isArray(parsed) ? parsed[0] : kodeSampel;
            }
            return Array.isArray(kodeSampel) ? kodeSampel[0] : kodeSampel;
        } catch (e) {
            return kodeSampel;
        }
    };

    return (
        <div style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
            <Navbar bg="primary" variant="dark" expand="lg" className="mb-4">
                <Container>
                    <Navbar.Brand href="#home">SILAB - Koordinator</Navbar.Brand>
                    <Nav className="ms-auto d-flex align-items-center">
                        <span className="text-white me-3">Halo, {user.name || 'Koordinator'}</span>
                        <Button variant="light" size="sm" onClick={handleLogout}>Logout</Button>
                    </Nav>
                </Container>
            </Navbar>

            <Container>
                <div className="p-5 mb-4 bg-light rounded-3 shadow-sm">
                    <h1>Selamat Datang, Koordinator!</h1>
                    <p className="lead">Silakan kelola jadwal dan validasi permintaan laboratorium di sini.</p>
                </div>

                {/* Tabel Hasil Analisis Menunggu Verifikasi */}
                <Card className="mb-4 shadow-sm">
                    <Card.Header className="bg-primary text-white">
                        <h5 className="mb-0"><FaCheckCircle className="me-2" />Hasil Analisis Menunggu Verifikasi</h5>
                    </Card.Header>
                    <Card.Body>
                        {loading ? (
                            <div className="text-center py-5">
                                <Spinner animation="border" variant="primary" />
                                <p className="mt-3">Memuat data...</p>
                            </div>
                        ) : bookings.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <FaCheckCircle size={50} className="mb-3" />
                                <p>Tidak ada hasil analisis yang menunggu verifikasi</p>
                            </div>
                        ) : (
                            <Table striped bordered hover responsive>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Kode Sampel</th>
                                        <th>Nama Klien</th>
                                        <th>Jenis Analisis</th>
                                        <th>Tanggal Kirim</th>
                                        <th>Status</th>
                                        <th>Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking, index) => (
                                        <tr key={booking.id}>
                                            <td>{index + 1}</td>
                                            <td><strong>{parseKodeSampel(booking.kode_sampel)}</strong></td>
                                            <td>{booking.user?.name || '-'}</td>
                                            <td>
                                                <Badge bg="info">
                                                    {booking.jenis_analisis?.replace('_', ' ').toUpperCase()}
                                                </Badge>
                                            </td>
                                            <td>{new Date(booking.tanggal_kirim).toLocaleDateString('id-ID')}</td>
                                            <td>
                                                <Badge bg="warning" text="dark">Menunggu Verifikasi</Badge>
                                            </td>
                                            <td>
                                                <Button 
                                                    variant="outline-primary" 
                                                    size="sm"
                                                    onClick={() => alert('Fitur verifikasi akan segera hadir')}
                                                >
                                                    <FaEye className="me-1" /> Lihat & Verifikasi
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        )}
                    </Card.Body>
                </Card>

                <Row>
                    <Col md={4} className="mb-3">
                        <Card border="primary" className="h-100">
                            <Card.Header>Validasi Peminjaman</Card.Header>
                            <Card.Body>
                                <div className="d-flex align-items-center">
                                    <FaCheckCircle size={30} className="text-primary me-3" />
                                    <div>
                                        <Card.Title>5 Permintaan Baru</Card.Title>
                                        <Card.Text>Menunggu persetujuan Anda.</Card.Text>
                                    </div>
                                </div>
                                <Button variant="outline-primary" className="mt-3 w-100">Validasi Sekarang</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-3">
                        <Card border="info" className="h-100">
                            <Card.Header>Jadwal Lab</Card.Header>
                            <Card.Body>
                                <div className="d-flex align-items-center">
                                    <FaCalendarAlt size={30} className="text-info me-3" />
                                    <div>
                                        <Card.Title>Jadwal Minggu Ini</Card.Title>
                                        <Card.Text>Atur slot waktu penggunaan lab.</Card.Text>
                                    </div>
                                </div>
                                <Button variant="outline-info" className="mt-3 w-100">Lihat Kalender</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-3">
                        <Card border="secondary" className="h-100">
                            <Card.Header>Manajemen Asisten</Card.Header>
                            <Card.Body>
                                <div className="d-flex align-items-center">
                                    <FaUsers size={30} className="text-secondary me-3" />
                                    <div>
                                        <Card.Title>Data Asisten</Card.Title>
                                        <Card.Text>Kelola jadwal shift asisten lab.</Card.Text>
                                    </div>
                                </div>
                                <Button variant="outline-secondary" className="mt-3 w-100">Kelola</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default DashboardKoordinator;