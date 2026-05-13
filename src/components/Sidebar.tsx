import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import ButtonBase from "@mui/material/ButtonBase";
import DesktopWindowsOutlinedIcon from "@mui/icons-material/DesktopWindowsOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import KeyboardDoubleArrowLeftIcon from "@mui/icons-material/KeyboardDoubleArrowLeft";
import { useNavigate } from "react-router-dom";

export type SidebarItemKey = "home" | "users" | "logout" | "minimize";

type SidebarProps = {
  active?: SidebarItemKey;
  onNavigate?: (key: SidebarItemKey) => void;
  open?: boolean;
  onMinimize?: () => void;
};

type Item = {
  key: SidebarItemKey;
  label: string;
  icon: ReactNode;
};

const topItems: Item[] = [
  { key: "home", label: "Início", icon: <DesktopWindowsOutlinedIcon /> },
  { key: "users", label: "Usuários", icon: <GroupOutlinedIcon /> },
];

const bottomItems: Item[] = [
  { key: "logout", label: "Sair", icon: <LogoutOutlinedIcon /> },
  { key: "minimize", label: "Minimizar menu", icon: <KeyboardDoubleArrowLeftIcon /> },
];

const SIDEBAR_BG = "rgba(76, 55, 42, 0.5)";
const ACTIVE_BG = "rgba(76, 55, 42, 0.51)";
const DIVIDER = "rgba(76, 55, 42, 0.25)";

function NavItem({
  item,
  active,
  onClick,
}: {
  item: Item;
  active: boolean;
  onClick?: () => void;
}) {
  return (
    <ButtonBase
      onClick={onClick}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: "15px",
        width: "100%",
        height: 39,
        px: "10px",
        borderRadius: "5px",
        color: "#ffffff",
        backgroundColor: active ? ACTIVE_BG : "transparent",
        border: active ? `2px solid ${SIDEBAR_BG}` : "2px solid transparent",
        justifyContent: "flex-start",
        "& .MuiSvgIcon-root": { fontSize: 26 },
        "&:hover": { backgroundColor: ACTIVE_BG },
      }}
    >
      {item.icon}
      <Typography sx={{ color: "#ffffff", fontWeight: 500, fontSize: 20, lineHeight: 1 }}>
        {item.label}
      </Typography>
    </ButtonBase>
  );
}

const ROUTES: Partial<Record<SidebarItemKey, string>> = {
  home: "/",
  users: "/users",
};

export default function Sidebar({ active, onNavigate, open = true, onMinimize }: SidebarProps) {
  const navigate = useNavigate();
  const handleClick = (key: SidebarItemKey) => {
    if (key === "minimize") {
      onMinimize?.();
      return;
    }
    if (key === "logout") {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      navigate("/login");
      return;
    }
    if (onNavigate) {
      onNavigate(key);
      return;
    }
    const route = ROUTES[key];
    if (route) navigate(route);
  };
  if (!open) return null;
  return (
    <Box
      component="nav"
      sx={{
        width: 231,
        backgroundColor: SIDEBAR_BG,
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      <Box
        sx={{
          py: "16px",
          px: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          borderBottom: `1px solid ${DIVIDER}`,
        }}
      >
        {topItems.map((item) => (
          <NavItem
            key={item.key}
            item={item}
            active={active === item.key}
            onClick={() => handleClick(item.key)}
          />
        ))}
      </Box>
      <Box sx={{ flex: 1 }} />
      <Box
        sx={{
          py: "16px",
          px: "10px",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
          borderTop: `1px solid ${DIVIDER}`,
        }}
      >
        {bottomItems.map((item) => (
          <NavItem
            key={item.key}
            item={item}
            active={active === item.key}
            onClick={() => handleClick(item.key)}
          />
        ))}
      </Box>
    </Box>
  );
}

