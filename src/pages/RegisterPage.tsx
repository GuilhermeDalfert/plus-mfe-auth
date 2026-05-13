import { useState, type FormEvent } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import { register, USER_ROLES, type UserRole } from "../api/auth";
import AppHeader from "../components/AppHeader";
import AuthCard from "../components/AuthCard";
import Sidebar from "../components/Sidebar";
import { useSidebarState } from "../hooks/useSidebarState";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { theme } from "../theme";
import { colors } from "../theme/tokens";

type RegisterPageProps = {
  onRegister?: () => void;
};

export default function RegisterPage({ onRegister }: RegisterPageProps) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useSidebarState();
  const currentUser = useCurrentUser();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(USER_ROLES[0]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await register({ username, email, password, role });
      onRegister?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
        <AppHeader
          currentUser={currentUser}
          leading={
            <IconButton
              aria-label={sidebarOpen ? "Fechar menu" : "Abrir menu"}
              onClick={() => setSidebarOpen((o) => !o)}
              sx={{ color: colors.brand, p: 0 }}
            >
              <MenuIcon sx={{ fontSize: 34 }} />
            </IconButton>
          }
        />
        <Box sx={{ display: "flex", flex: 1, minHeight: 0 }}>
          <Sidebar
            active="users"
            open={sidebarOpen}
            onMinimize={() => setSidebarOpen(false)}
          />
          <Box component="main" sx={{ flex: 1 }}>
            <AuthCard title="CADASTRAR">
              <Box
                component="form"
                onSubmit={handleSubmit}
                sx={{ width: "100%", display: "flex", flexDirection: "column", gap: "15px", alignItems: "center" }}
              >
          <FormControl variant="outlined">
            <InputLabel shrink htmlFor="reg-username">Usuário</InputLabel>
            <OutlinedInput
              id="reg-username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              label={null}
              notched={false}
            />
          </FormControl>

          <FormControl variant="outlined">
            <InputLabel shrink htmlFor="reg-email">E-mail</InputLabel>
            <OutlinedInput
              id="reg-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              label={null}
              notched={false}
            />
          </FormControl>

          <FormControl variant="outlined">
            <InputLabel shrink htmlFor="reg-password">Senha</InputLabel>
            <OutlinedInput
              id="reg-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              label={null}
              notched={false}
            />
          </FormControl>

          <FormControl variant="outlined">
            <InputLabel shrink htmlFor="reg-role">Perfil</InputLabel>
            <Select
              id="reg-role"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              input={<OutlinedInput notched={false} label={null} />}
            >
              {USER_ROLES.map((r) => (
                <MenuItem key={r} value={r}>{r}</MenuItem>
              ))}
            </Select>
          </FormControl>

                {error && <Alert severity="error" sx={{ width: "100%" }}>{error}</Alert>}

                <Box sx={{ display: "flex", justifyContent: "center", gap: "10px", mt: "15px" }}>
                  <Button
                    type="button"
                    onClick={() => navigate("/users")}
                    disabled={loading}
                    sx={{
                      backgroundColor: "#545454",
                      color: "#fff",
                      width: 153,
                      minWidth: 153,
                      "&:hover": { backgroundColor: "#545454", opacity: 0.92 },
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={loading} sx={{ width: 153, minWidth: 153 }}>
                    {loading ? "Enviando..." : "Cadastrar"}
                  </Button>
                </Box>
              </Box>
            </AuthCard>
          </Box>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
