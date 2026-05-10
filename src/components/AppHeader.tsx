import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { colors, shadows } from "../theme/tokens";

export default function AppHeader() {
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
        px: "17px",
      }}
    >
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
    </Box>
  );
}
