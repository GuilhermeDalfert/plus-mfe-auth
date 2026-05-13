import { useEffect, useState, type FormEvent } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import OutlinedInput from "@mui/material/OutlinedInput";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate, useParams } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import ConfirmDialog from "../components/ConfirmDialog";
import Sidebar from "../components/Sidebar";
import {
  deleteUser,
  listUsers,
  updateUser,
  UsersApiError,
  type User,
} from "../api/users";
import { USER_ROLES, type UserRole } from "../api/auth";
import { useSidebarState } from "../hooks/useSidebarState";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { theme } from "../theme";
import { colors } from "../theme/tokens";

const TITLE_COLOR = "#4c372a";
const LABEL_COLOR = "#545454";
const BORDER_COLOR = "#2a414d";
const CANCEL_BG = "#545454";
const PRIMARY_BG = "#2a414d";
const DANGER_BG = "#ff5757";

export default function UpdateUserPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [sidebarOpen, setSidebarOpen] = useSidebarState();
  const currentUser = useCurrentUser();

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<UserRole>(USER_ROLES[0]);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (currentUser && currentUser.role !== "ADMIN") {
      navigate("/users", { replace: true });
    }
  }, [currentUser, navigate]);

  useEffect(() => {
    if (!id) return;
    let alive = true;
    setLoading(true);
    setLoadError(null);
    listUsers()
      .then((users) => {
        if (!alive) return;
        const found = users.find((u) => u.id === id);
        if (!found) {
          setLoadError("Usuário não encontrado");
          return;
        }
        setUser(found);
        setUsername(found.username);
        setEmail(found.email);
        if ((USER_ROLES as readonly string[]).includes(found.role)) {
          setRole(found.role as UserRole);
        }
      })
      .catch((err) => {
        if (!alive) return;
        setLoadError(err instanceof Error ? err.message : "Erro ao carregar usuário");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [id]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!id) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updateUser(id, isSelf ? { username, email } : { username, email, role });
      navigate("/users");
    } catch (err) {
      const msg =
        err instanceof UsersApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Erro ao atualizar usuário";
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!id) return;
    setDeleting(true);
    setSaveError(null);
    try {
      await deleteUser(id);
      setConfirmOpen(false);
      navigate("/users");
    } catch (err) {
      const msg =
        err instanceof UsersApiError
          ? err.message
          : err instanceof Error
          ? err.message
          : "Erro ao deletar usuário";
      setSaveError(msg);
      setConfirmOpen(false);
    } finally {
      setDeleting(false);
    }
  };

  const isSelf = currentUser?.id === id;

  const FIELD_WIDTH = 316;
  const HALF_WIDTH = (FIELD_WIDTH - 10) / 2 ;

  const fieldSx = {
    width: FIELD_WIDTH,
    height: 40,
    borderRadius: "9px",
    backgroundColor: "#fff",
    "& fieldset": { borderColor: BORDER_COLOR, borderWidth: 1 },
    "&:hover fieldset": { borderColor: BORDER_COLOR },
    "&.Mui-focused fieldset": { borderColor: BORDER_COLOR, borderWidth: 1 },
    "& input": { fontSize: 16, color: LABEL_COLOR, fontWeight: 500 },
    "& .MuiSelect-select": { fontSize: 16, color: LABEL_COLOR, fontWeight: 500, py: 0, height: "40px !important", display: "flex", alignItems: "center" },
  };

  const labelSx = {
    color: LABEL_COLOR,
    fontWeight: 700,
    fontSize: 20,
    lineHeight: 1,
    mb: "9px",
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
          <Box
            component="main"
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "flex-start",
              justifyContent: "center",
              py: "60px",
              px: "20px",
            }}
          >
            <Box
              sx={{
                width: 346,
                backgroundColor: "#fff",
                border: `3px solid ${colors.brandBorder}`,
                borderRadius: "15px",
                boxShadow: "0px 0px 15px 0px rgba(0,0,0,0.22)",
                p: "30px 15px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "30px",
              }}
            >
              <Typography
                component="h1"
                sx={{ color: TITLE_COLOR, fontWeight: 700, fontSize: 36, lineHeight: 1 }}
              >
                Editar usuário
              </Typography>

              {loading && <CircularProgress size={24} />}
              {!loading && loadError && (
                <Alert severity="error" sx={{ width: FIELD_WIDTH }}>
                  {loadError}
                </Alert>
              )}

              {!loading && !loadError && user && (
                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  sx={{ display: "flex", flexDirection: "column", gap: "15px", alignItems: "center" }}
                >
                  <Box>
                    <Typography sx={labelSx}>Usuário</Typography>
                    <OutlinedInput
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      required
                      sx={fieldSx}
                    />
                  </Box>

                  <Box>
                    <Typography sx={labelSx}>E-mail</Typography>
                    <OutlinedInput
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      sx={fieldSx}
                    />
                  </Box>

                  <Box>
                    <Typography sx={labelSx}>Perfil</Typography>
                    <Select
                      value={role}
                      onChange={(e) => setRole(e.target.value as UserRole)}
                      input={<OutlinedInput notched={false} />}
                      sx={fieldSx}
                      disabled={isSelf}
                    >
                      {USER_ROLES.map((r) => (
                        <MenuItem key={r} value={r}>
                          {r}
                        </MenuItem>
                      ))}
                    </Select>
                    {isSelf && (
                      <Typography sx={{ color: LABEL_COLOR, fontSize: 12, mt: "4px" }}>
                        Você não pode alterar seu próprio cargo
                      </Typography>
                    )}
                  </Box>

                  {saveError && (
                    <Alert severity="error" sx={{ width: FIELD_WIDTH }}>
                      {saveError}
                    </Alert>
                  )}

                  <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "10px", mt: "5px" }}>
                    <Box sx={{ display: "flex", justifyContent: "center", gap: "10px" }}>
                      <Button
                        type="button"
                        onClick={() => navigate("/users")}
                        disabled={saving || deleting}
                        sx={{
                          backgroundColor: CANCEL_BG,
                          color: "#fff",
                          width: HALF_WIDTH,
                          minWidth: HALF_WIDTH,
                          height: 41,
                          borderRadius: "15px",
                          fontSize: 20,
                          fontWeight: 600,
                          textTransform: "none",
                          "&:hover": { backgroundColor: CANCEL_BG, opacity: 0.92 },
                        }}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        disabled={saving || deleting}
                        sx={{
                          backgroundColor: PRIMARY_BG,
                          color: "#fff",
                          width: HALF_WIDTH,
                          minWidth: HALF_WIDTH,
                          height: 41,
                          borderRadius: "15px",
                          fontSize: 20,
                          fontWeight: 600,
                          textTransform: "none",
                          "&.Mui-disabled": { backgroundColor: PRIMARY_BG, color: "#fff", opacity: 0.6 },
                          "&:hover": { backgroundColor: PRIMARY_BG, opacity: 0.92 },
                        }}
                      >
                        {saving ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Atualizar"}
                      </Button>
                    </Box>
                    {currentUser?.role === "ADMIN" && !isSelf && (
                      <Button
                        type="button"
                        onClick={() => setConfirmOpen(true)}
                        disabled={saving || deleting}
                        sx={{
                          backgroundColor: DANGER_BG,
                          color: "#fff",
                          width: FIELD_WIDTH,
                          minWidth: FIELD_WIDTH,
                          height: 42,
                          borderRadius: "15px",
                          fontSize: 20,
                          fontWeight: 600,
                          textTransform: "none",
                          "&.Mui-disabled": { backgroundColor: DANGER_BG, color: "#fff", opacity: 0.6 },
                          "&:hover": { backgroundColor: DANGER_BG, opacity: 0.92 },
                        }}
                      >
                        {deleting ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Deletar Usuário"}
                      </Button>
                    )}
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
      <ConfirmDialog
        open={confirmOpen}
        title="Confirmar exclusão"
        message={`Deletar o usuário ${user?.username}?`}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onClose={() => setConfirmOpen(false)}
      />
    </ThemeProvider>
  );
}
