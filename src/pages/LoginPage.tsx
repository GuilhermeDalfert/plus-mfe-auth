import { useState, type FormEvent } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Alert from "@mui/material/Alert";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { login } from "../api/auth";
import AppHeader from "../components/AppHeader";
import AuthCard from "../components/AuthCard";
import { theme } from "../theme";

type LoginPageProps = {
  onLogin?: (token: string) => void;
};

export default function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { accessToken, refreshToken } = await login({ email, password });
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);
      onLogin?.(accessToken);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao fazer login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
    <Box>
      <AppHeader />
      <AuthCard title="ENTRAR">
        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ width: "100%", display: "flex", flexDirection: "column", gap: "15px", alignItems: "center" }}
        >
          <FormControl variant="outlined">
            <InputLabel shrink htmlFor="login-email">E-mail</InputLabel>
            <OutlinedInput
              id="login-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              label={null}
              notched={false}
            />
          </FormControl>

          <FormControl variant="outlined">
            <InputLabel shrink htmlFor="login-password">Senha</InputLabel>
            <OutlinedInput
              id="login-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              label={null}
              notched={false}
            />
          </FormControl>

          {error && <Alert severity="error" sx={{ width: "100%" }}>{error}</Alert>}

          <Button type="submit" disabled={loading} sx={{ mt: "15px" }}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </Box>
      </AuthCard>
    </Box>
    </ThemeProvider>
  );
}
