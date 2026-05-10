import React, { useState } from "react";
import ReactDOM from "react-dom/client";
import {
  AppBar,
  Box,
  Button,
  CssBaseline,
  ThemeProvider,
  Toolbar,
  createTheme,
} from "@mui/material";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";

const theme = createTheme({
  palette: { mode: "light" },
});

function DevHarness() {
  const [view, setView] = useState<"login" | "register">("login");

  return (
    <Box>
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar sx={{ gap: 1 }}>
          <Button
            variant={view === "login" ? "contained" : "text"}
            onClick={() => setView("login")}
          >
            Login
          </Button>
          <Button
            variant={view === "register" ? "contained" : "text"}
            onClick={() => setView("register")}
          >
            Register
          </Button>
        </Toolbar>
      </AppBar>
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
