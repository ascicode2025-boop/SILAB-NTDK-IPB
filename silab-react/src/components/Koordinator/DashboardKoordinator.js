import React from 'react';
import { Container, Navbar, Nav, Button, Row, Col, Card } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { FaCalendarAlt, FaCheckCircle, FaUsers } from 'react-icons/fa';

const DashboardKoordinator = () => {
    const history = useHistory();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.clear();
        history.push('/login');
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