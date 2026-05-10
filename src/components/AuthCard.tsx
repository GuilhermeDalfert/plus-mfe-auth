import type { ReactNode } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { colors, radii, shadows } from "../theme/tokens";

type AuthCardProps = {
  title: string;
  children: ReactNode;
};

export default function AuthCard({ title, children }: AuthCardProps) {
  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 71px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        py: 4,
      }}
    >
      <Box
        sx={{
          width: 346,
          backgroundColor: colors.surface,
          borderRadius: `${radii.card}px`,
          boxShadow: shadows.card,
          px: "15px",
          py: "25px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "30px",
        }}
      >
        <Typography
          component="h1"
          sx={{ fontWeight: 700, fontSize: 36, color: colors.brand, lineHeight: 1 }}
        >
          {title}
        </Typography>
        {children}
      </Box>
    </Box>
  );
}
