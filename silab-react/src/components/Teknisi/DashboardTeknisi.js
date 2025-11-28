import React from 'react';
import { Container, Navbar, Nav, Button, Row, Col, Card } from 'react-bootstrap';
import { useHistory } from 'react-router-dom';
import { FaTools, FaClipboardList, FaBoxOpen } from 'react-icons/fa'; // Pastikan install react-icons

const DashboardTeknisi = () => {
    const history = useHistory();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        localStorage.clear();
        history.push('/login');
    };

    return (
        <div style={{ backgroundColor: '#f4f6f9', minHeight: '100vh' }}>
            {/* Navbar */}
            <Navbar bg="dark" variant="dark" expand="lg" className="mb-4">
                <Container>
                    <Navbar.Brand href="#home">SILAB - Teknisi</Navbar.Brand>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
                        <Nav.Item className="text-white me-3 d-flex align-items-center">
                            Halo, {user.name || 'Teknisi'}
                        </Nav.Item>
                        <Button variant="outline-danger" size="sm" onClick={handleLogout}>Logout</Button>
                    </Navbar.Collapse>
                </Container>
            </Navbar>

            {/* Content */}
            <Container>
                <h3 className="mb-4">Dashboard Operasional</h3>
                <Row>
                    <Col md={4} className="mb-3">
                        <Card className="text-center shadow-sm h-100">
                            <Card.Body>
                                <FaTools size={40} className="text-primary mb-3" />
                                <Card.Title>Perbaikan Alat</Card.Title>
                                <Card.Text>
                                    Cek daftar alat yang perlu diperbaiki atau dikalibrasi.
                                </Card.Text>
                                <Button variant="primary">Lihat Daftar</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-3">
                        <Card className="text-center shadow-sm h-100">
                            <Card.Body>
                                <FaBoxOpen size={40} className="text-success mb-3" />
                                <Card.Title>Inventaris Lab</Card.Title>
                                <Card.Text>
                                    Kelola stok bahan kimia dan peralatan gelas.
                                </Card.Text>
                                <Button variant="success">Cek Stok</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                    <Col md={4} className="mb-3">
                        <Card className="text-center shadow-sm h-100">
                            <Card.Body>
                                <FaClipboardList size={40} className="text-warning mb-3" />
                                <Card.Title>Log Harian</Card.Title>
                                <Card.Text>
                                    Isi laporan kegiatan harian laboratorium.
                                </Card.Text>
                                <Button variant="warning" className="text-white">Isi Log</Button>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>
            </Container>
        </div>
    );
};

export default DashboardTeknisi;