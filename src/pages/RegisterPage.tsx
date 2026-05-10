import { useState, type FormEvent } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import { register, USER_ROLES, type UserRole } from "../api/auth";
import AppHeader from "../components/AppHeader";
import AuthCard from "../components/AuthCard";

type RegisterPageProps = {
  onRegister?: () => void;
};

export default function RegisterPage({ onRegister }: RegisterPageProps) {
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
    <Box>
      <AppHeader />
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

          <Button type="submit" disabled={loading} sx={{ mt: "15px" }}>
            {loading ? "Enviando..." : "Cadastrar"}
          </Button>
        </Box>
      </AuthCard>
    </Box>
  );
}
