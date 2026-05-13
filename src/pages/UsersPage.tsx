import { useEffect, useMemo, useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Checkbox from "@mui/material/Checkbox";
import InputBase from "@mui/material/InputBase";
import Link from "@mui/material/Link";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Tooltip from "@mui/material/Tooltip";
import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import MenuIcon from "@mui/icons-material/Menu";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import BadgeOutlinedIcon from "@mui/icons-material/BadgeOutlined";
import { useNavigate } from "react-router-dom";
import AppHeader from "../components/AppHeader";
import Sidebar from "../components/Sidebar";
import { deleteUser, listUsers, UsersApiError, type User } from "../api/users";
import { useSidebarState } from "../hooks/useSidebarState";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { theme } from "../theme";
import { colors } from "../theme/tokens";

type UsersPageProps = {
  onAddUser?: () => void;
};

const HEADING_COLOR = "#2a414d";
const DANGER_BG = "#ff5757";
const FILTERS_BG = "#545454";
const PANEL_BG = "#e0e0e0";
const SEARCH_BG = "#f2f2f2";
const ROW_BORDER = "rgba(0, 0, 0, 0.22)";

export default function UsersPage({ onAddUser }: UsersPageProps) {
  const navigate = useNavigate();
  const handleAddUser = () => {
    if (onAddUser) onAddUser();
    else navigate("/register");
  };
  const [sidebarOpen, setSidebarOpen] = useSidebarState();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const currentUser = useCurrentUser();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setError(null);
    listUsers()
      .then((data) => {
        if (!alive) return;
        setUsers(data);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Erro ao carregar usuários");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) =>
      [u.username, u.email, u.role].some((field) => field.toLowerCase().includes(q))
    );
  }, [users, search]);

  const toggleRow = (id: string) => {
    if (currentUser && id === currentUser.id) return;
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const canDelete = currentUser?.role === "ADMIN" && selected.size > 0;

  const handleConfirmDelete = async () => {
    setDeleting(true);
    setDeleteError(null);
    const ids = Array.from(selected);
    const results = await Promise.allSettled(ids.map((id) => deleteUser(id)));
    const succeededIds = new Set<string>();
    const failures: PromiseRejectedResult[] = [];
    results.forEach((r, i) => {
      if (r.status === "fulfilled") succeededIds.add(ids[i]);
      else failures.push(r);
    });
    setUsers((prev) => prev.filter((u) => !succeededIds.has(u.id)));
    setSelected(new Set());
    setConfirmOpen(false);
    if (failures.length > 0) {
      const first = failures[0].reason;
      const msg =
        first instanceof UsersApiError
          ? first.message
          : first instanceof Error
          ? first.message
          : "Erro desconhecido";
      setDeleteError(`${failures.length} falha(s) ao deletar. ${msg}`);
    }
    setDeleting(false);
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
          <Box component="main" sx={{ flex: 1, px: "20px", py: "20px" }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: "20px",
                mb: "20px",
              }}
            >
              <Typography
                component="h1"
                sx={{ color: HEADING_COLOR, fontWeight: 600, fontSize: 32, lineHeight: 1 }}
              >
                Usuários cadastrados
              </Typography>
              <Box sx={{ display: "flex", gap: "20px", alignItems: "center" }}>
                {canDelete && (
                  <Button
                    onClick={() => setConfirmOpen(true)}
                    disabled={deleting}
                    sx={{
                      backgroundColor: DANGER_BG,
                      color: "#fff",
                      height: 50,
                      minWidth: 215,
                      borderRadius: "5px",
                      fontSize: 20,
                      fontWeight: 600,
                      "&.Mui-disabled": { backgroundColor: DANGER_BG, color: "#fff", opacity: 0.6 },
                      "&:hover": { backgroundColor: DANGER_BG },
                    }}
                  >
                    {deleting ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : "Deletar Usuário(s)"}
                  </Button>
                )}
                {currentUser?.role === "ADMIN" && (
                  <Button
                    onClick={handleAddUser}
                    startIcon={<AddIcon />}
                    sx={{
                      backgroundColor: HEADING_COLOR,
                      color: "#fff",
                      height: 50,
                      minWidth: 251,
                      borderRadius: "5px",
                      fontSize: 20,
                      fontWeight: 600,
                      "&:hover": { backgroundColor: HEADING_COLOR, opacity: 0.92 },
                    }}
                  >
                    adicionar usuario
                  </Button>
                )}
              </Box>
            </Box>

            <Box sx={{ backgroundColor: PANEL_BG, borderRadius: "5px", p: "20px" }}>
              {deleteError && (
                <Alert severity="error" sx={{ mb: "16px" }} onClose={() => setDeleteError(null)}>
                  {deleteError}
                </Alert>
              )}
              <Box sx={{ display: "flex", gap: "20px", alignItems: "center", mb: "16px" }}>
                <Box
                  sx={{
                    flex: 1,
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    height: 39,
                    px: "12px",
                    backgroundColor: SEARCH_BG,
                    border: `1px solid ${HEADING_COLOR}`,
                    borderRadius: "3px",
                  }}
                >
                  <SearchIcon sx={{ color: FILTERS_BG, fontSize: 20 }} />
                  <InputBase
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Nome, e-mail, cargo, ..."
                    sx={{ flex: 1, fontSize: 16, color: "#000" }}
                    inputProps={{ "aria-label": "Buscar usuários" }}
                  />
                </Box>
              </Box>

              <TableContainer sx={{ backgroundColor: "transparent" }}>
                <Table sx={{ "& td, & th": { borderBottom: `1px solid ${ROW_BORDER}` } }}>
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontSize: 16, color: "#000", width: 282 }}>Usuário</TableCell>
                      <TableCell sx={{ fontSize: 16, color: "#000", width: 279 }}>E-mail</TableCell>
                      <TableCell sx={{ fontSize: 16, color: "#000", width: 210 }}>Cargo</TableCell>
                      <TableCell sx={{ fontSize: 16, color: "#000" }}>Ações</TableCell>
                      <TableCell padding="checkbox" />
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                          <CircularProgress size={24} />
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading && error && (
                      <TableRow>
                        <TableCell colSpan={5} sx={{ py: 2 }}>
                          <Alert severity="error">{error}</Alert>
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading && !error && filteredUsers.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} align="center" sx={{ py: 4, color: FILTERS_BG }}>
                          Nenhum usuário encontrado.
                        </TableCell>
                      </TableRow>
                    )}
                    {!loading &&
                      !error &&
                      filteredUsers.map((u) => {
                        const isSelected = selected.has(u.id);
                        const isSelf = currentUser?.id === u.id;
                        return (
                          <TableRow key={u.id} hover selected={isSelected}>
                            <TableCell sx={{ fontSize: 16, color: "#000" }}>{u.username}</TableCell>
                            <TableCell sx={{ fontSize: 16 }}>
                              <Link
                                href={`mailto:${u.email}`}
                                sx={{ color: "#000", textDecoration: "underline" }}
                              >
                                {u.email}
                              </Link>
                            </TableCell>
                            <TableCell sx={{ fontSize: 16, color: "#000" }}>{u.role}</TableCell>
                            <TableCell>
                              <IconButton
                                aria-label={`Editar ${u.username}`}
                                onClick={() => navigate(`/users/${u.id}/edit`)}
                                sx={{ color: "#000" }}
                              >
                                <BadgeOutlinedIcon />
                              </IconButton>
                            </TableCell>
                            <TableCell padding="checkbox">
                              {isSelf ? (
                                <Tooltip title="Você não pode deletar a si mesmo">
                                  <span>
                                    <Checkbox
                                      checked={false}
                                      disabled
                                      slotProps={{ input: { "aria-label": `Selecionar ${u.username}` } }}
                                      sx={{
                                        color: FILTERS_BG,
                                        "&.Mui-checked": { color: HEADING_COLOR },
                                      }}
                                    />
                                  </span>
                                </Tooltip>
                              ) : (
                                <Checkbox
                                  checked={isSelected}
                                  onChange={() => toggleRow(u.id)}
                                  slotProps={{ input: { "aria-label": `Selecionar ${u.username}` } }}
                                  sx={{
                                    color: FILTERS_BG,
                                    "&.Mui-checked": { color: HEADING_COLOR },
                                  }}
                                />
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </Box>
      </Box>
      <Dialog open={confirmOpen} onClose={() => (deleting ? null : setConfirmOpen(false))}>
        <DialogTitle>Confirmar exclusão</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Deletar {selected.size} usuário(s)?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)} disabled={deleting}>
            Cancelar
          </Button>
          <Button onClick={handleConfirmDelete} disabled={deleting} autoFocus>
            {deleting ? <CircularProgress size={18} /> : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>
    </ThemeProvider>
  );
}
