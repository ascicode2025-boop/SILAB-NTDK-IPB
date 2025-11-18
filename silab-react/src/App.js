import React from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import NavbarLandingPage from "./components/NavbarLandingPage";
import LandingPage from "./components/LandingPage";
import LoginPage from "./components/LoginPage";
import RegisterPage from "./components/RegisterPage";
import Profile from "./components/Profile";
import DaftarAnalisis from "./components/DaftarAnalisis";
import Dashboard from "./components/Klien/Dashboard";
import ForgetPassword from "./components/ForgetPassword";

// Komponen pembungkus untuk halaman yang menampilkan navbar
function AppLayoutWithNavbar() {
  return (
    <>
      <NavbarLandingPage />

      <Switch>
        <Route path="/landingPage" component={LandingPage} />
        <Route path="/profile" component={Profile} />
        <Route path="/daftarAnalisis" component={DaftarAnalisis} />
        <Route path="/" component={LandingPage} />
      </Switch>
    </>
  );
}

// Komponen pembungkus untuk halaman tanpa navbar (login, register, dashboard)
function AppLayoutWithoutNavbar() {
  return (
    <Switch>
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/forgetPassword" component={ForgetPassword} />
    </Switch>
  );
}

function App() {
  return (
    <Router>
      <Switch>
        {/* Routes tanpa navbar */}
        <Route path="/dashboard" component={AppLayoutWithoutNavbar} />
        <Route path="/login" component={AppLayoutWithoutNavbar} />
        <Route path="/register" component={AppLayoutWithoutNavbar} />
        <Route path="/forgetPassword" component={AppLayoutWithoutNavbar} />
        {/* Routes dengan navbar */}
        <Route component={AppLayoutWithNavbar} />
      </Switch>
    </Router>
  );
}

export default App;
