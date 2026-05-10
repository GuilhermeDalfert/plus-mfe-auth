import { createTheme } from "@mui/material/styles";
import { colors, fontFamily, radii, shadows } from "./tokens";

export const theme = createTheme({
  palette: {
    primary: { main: colors.primary, contrastText: "#ffffff" },
    secondary: { main: colors.brand },
    background: { default: colors.surface, paper: colors.surface },
    text: { primary: colors.brand, secondary: colors.label },
  },
  typography: {
    fontFamily,
    h1: { fontFamily, fontWeight: 800, fontSize: 36, color: colors.brand },
    h2: { fontFamily, fontWeight: 700, fontSize: 36, color: colors.brand },
    button: { fontFamily, fontWeight: 700, fontSize: 24, textTransform: "none" },
    body1: { fontFamily, color: colors.label },
  },
  shape: { borderRadius: radii.input },
  components: {
    MuiButton: {
      defaultProps: { disableElevation: true, variant: "contained" },
      styleOverrides: {
        root: {
          borderRadius: radii.button,
          height: 41,
          minWidth: 192,
          fontWeight: 700,
          fontSize: 24,
          textTransform: "none",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          borderRadius: radii.input,
          height: 40,
          backgroundColor: colors.surface,
          "& fieldset": { borderColor: colors.primary, borderWidth: 1 },
          "&:hover fieldset": { borderColor: colors.primary },
          "&.Mui-focused fieldset": { borderColor: colors.primary, borderWidth: 2 },
        },
        input: { padding: "8px 12px" },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          position: "static",
          transform: "none",
          color: colors.label,
          fontWeight: 700,
          fontSize: 20,
          marginBottom: 4,
          "&.Mui-focused": { color: colors.label },
        },
      },
    },
    MuiFormControl: {
      styleOverrides: {
        root: { width: "100%" },
      },
    },
  },
});

export { colors, radii, shadows, fontFamily };
