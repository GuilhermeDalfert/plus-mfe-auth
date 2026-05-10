import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import { theme } from "./theme";

function DevHarness() {
  const [view, setView] = useState<"login" | "register">("login");

  return (
    <Box>
      <Box sx={{ p: 1.5, borderBottom: "1px solid #ccc", display: "flex", gap: 1 }}>
        <Button
          size="small"
          variant={view === "login" ? "contained" : "outlined"}
          onClick={() => setView("login")}
          sx={{ minWidth: 0, height: 32, fontSize: 14 }}
        >
          Login
        </Button>
        <Button
          size="small"
          variant={view === "register" ? "contained" : "outlined"}
          onClick={() => setView("register")}
          sx={{ minWidth: 0, height: 32, fontSize: 14 }}
        >
          Register
        </Button>
      </Box>
      {view === "login" ? (
        <LoginPage onLogin={(token) => console.log("Logado:", token)} />
      ) : (
        <RegisterPage onRegister={() => console.log("Registrado!")} />
      )}
    </Box>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <DevHarness />
    </ThemeProvider>
  </React.StrictMode>
);
