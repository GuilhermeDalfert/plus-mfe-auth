import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, NavLink, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import UsersPage from "./pages/UsersPage";
import UpdateUserPage from "./pages/UpdateUserPage";
import { theme } from "./theme";

function LoginRoute() {
  const navigate = useNavigate();
  return (
    <LoginPage
      onLogin={(token) => {
        console.log("Logado:", token);
        navigate("/users");
      }}
    />
  );
}

function RegisterRoute() {
  const navigate = useNavigate();
  return (
    <RegisterPage
      onRegister={() => {
        console.log("Registrado!");
        navigate("/users");
      }}
    />
  );
}

function DevHarness() {
  const tab = (to: string, label: string) => (
    <NavLink to={to} style={{ textDecoration: "none" }}>
      {({ isActive }) => (
        <Button
          size="small"
          variant={isActive ? "contained" : "outlined"}
          sx={{ minWidth: 0, height: 32, fontSize: 14 }}
        >
          {label}
        </Button>
      )}
    </NavLink>
  );

  return (
    <Box>
      <Box sx={{ p: 1.5, borderBottom: "1px solid #ccc", display: "flex", gap: 1 }}>
        {tab("/login", "Login")}
        {tab("/register", "Register")}
        {tab("/users", "Users")}
      </Box>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/register" element={<RegisterRoute />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/users/:id/edit" element={<UpdateUserPage />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Box>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <DevHarness />
      </BrowserRouter>
    </ThemeProvider>
  </React.StrictMode>
);
