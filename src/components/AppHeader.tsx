import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import PersonOutlineIcon from "@mui/icons-material/PersonOutlined";
import { colors, shadows } from "../theme/tokens";

type AppHeaderUser = {
  username: string;
  role: string;
};

type AppHeaderProps = {
  leading?: ReactNode;
  currentUser?: AppHeaderUser | null;
};

export default function AppHeader({ leading, currentUser }: AppHeaderProps) {
  return (
    <Box
      component="header"
      sx={{
        height: 71,
        backgroundColor: colors.surface,
        borderBottom: `3px solid ${colors.brandBorder}`,
        boxShadow: shadows.header,
        display: "flex",
        alignItems: "center",
        gap: "18px",
        px: "17px",
      }}
    >
      {leading}
      <Typography
        sx={{
          fontWeight: 800,
          fontSize: 36,
          color: colors.brand,
          lineHeight: 1,
        }}
      >
        PLUS
      </Typography>
      <Box sx={{ flex: 1 }} />
      {currentUser && (
        <Box sx={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
            <Typography sx={{ fontSize: 16, color: "#000", lineHeight: 1.2 }}>
              {currentUser.username}
            </Typography>
            <Typography sx={{ fontSize: 15, color: "#545454", lineHeight: 1.2 }}>
              {currentUser.role}
            </Typography>
          </Box>
          <PersonOutlineIcon sx={{ fontSize: 34, color: "#000" }} />
        </Box>
      )}
    </Box>
  );
}
