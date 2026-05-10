import { useState, type FormEvent } from "react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { register, USER_ROLES, type UserRole } from "../api/auth";

type RegisterPageProps = {
  onRegister?: () => void;
};

export default function RegisterPage({ onRegister }: RegisterPageProps) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>(USER_ROLES[0]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      await register({ username, email, password, role });
      setSuccess(true);
      setUsername("");
      setEmail("");
      setPassword("");
      setRole(USER_ROLES[0]);
      onRegister?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao registrar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="xs" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Stack spacing={3}>
          <Box>
            <Typography variant="h5" component="h1" sx={{ fontWeight: 600 }}>
              Novo usuário
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Cadastre um colaborador no sistema
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2}>
              <TextField
                label="Usuário"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                fullWidth
                autoFocus
                autoComplete="username"
                disabled={loading}
              />
              <TextField
                label="E-mail"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                fullWidth
                autoComplete="email"
                disabled={loading}
              />
              <TextField
                label="Senha"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                fullWidth
                autoComplete="new-password"
                disabled={loading}
              />
              <TextField
                select
                label="Perfil"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                required
                fullWidth
                disabled={loading}
              >
                {USER_ROLES.map((r) => (
                  <MenuItem key={r} value={r}>
                    {r}
                  </MenuItem>
                ))}
              </TextField>

              {error && <Alert severity="error">{error}</Alert>}
              {success && <Alert severity="success">Usuário cadastrado com sucesso.</Alert>}

              <Button
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={loading}
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : null}
              >
                {loading ? "Cadastrando..." : "Cadastrar"}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Container>
  );
}
