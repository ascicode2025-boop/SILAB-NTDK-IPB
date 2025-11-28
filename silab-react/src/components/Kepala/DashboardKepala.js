import React from 'react';
import { Container, Navbar, Nav, Button, Row, Col, Card, Table } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { FaChartLine, FaFileAlt } from 'react-icons/fa';

const DashboardKepala = () => {
    const history = useHistory();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.clear();
        history.push('/login');
    };

    return (
        <div style={{ backgroundColor: '#e9ecef', minHeight: '100vh' }}>
            <Navbar style={{ backgroundColor: '#8D6E63' }} variant="dark" expand="lg" className="mb-4 shadow">
                <Container>
                    <Navbar.Brand href="#home">SILAB - Executive</Navbar.Brand>
                    <Nav className="ms-auto d-flex align-items-center">
                        <span className="text-white me-3">Prof. {user.name || 'Kepala Lab'}</span>
                        <Button variant="outline-light" size="sm" onClick={handleLogout}>Keluar</Button>
                    </Nav>
                </Container>
            </Navbar>

            <Container>
                <Row className="mb-4">
                    <Col md={8}>
                        <Card className="shadow-sm">
                            <Card.Body>
                                <Card.Title className="d-flex align-items-center">
                                    <FaChartLine className="me-2"/> Statistik Penggunaan Bulan Ini
                                </Card.Title>
                                <hr />
                                <div className="d-flex justify-content-around text-center mt-4">
                                    <div>
                                        <h2>120</h2>
                                        <small className="text-muted">Peminjaman Alat</small>
                                    </div>
                                    <div>
                                        <h2>45</h2>
                                        <small className="text-muted">Pengujian Sampel</small>
                                    </div>
                                    <div>
                                        <h2>98%</h2>
                                        <small className="text-muted">Alat Berfungsi</small>
                                    </div>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4}>
                         <Card className="shadow-sm bg-white text-dark h-100">
                            <Card.Body className="d-flex flex-column justify-content-center align-items-center">
                                <FaFileAlt size={50} style={{ color: '#8D6E63' }} className="mb-3"/>
                                <Card.Title>Laporan Bulanan</Card.Title>
                                <Button variant="outline-dark" className="mt-2">Unduh PDF</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                <Card className="shadow-sm">
                    <Card.Header>Aktivitas Terbaru Laboratorium</Card.Header>
                    <Table striped hover responsive className="mb-0">
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
                                <td><span className="badge bg-success">Selesai</span></td>
                            </tr>
                            <tr>
                                <td>28 Nov 2025</td>
                                <td>Peminjaman Mikroskop (Mhs)</td>
                                <td>Siti Koordinator</td>
                                <td><span className="badge bg-warning text-dark">Menunggu Validasi</span></td>
                            </tr>
                        </tbody>
                    </Table>
                </Card>
            </Container>
        </div>
    );
};

export default DashboardKepala;