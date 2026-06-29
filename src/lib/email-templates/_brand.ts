// Shared style tokens for MBI branded auth emails.
// Mirrors the site palette (warm stone + clay accent).
// Body backgroundColor MUST stay #ffffff per email-template guidelines.

export const SITE_NAME = "Multicultural Bridge Initiative";
export const SITE_URL = "https://bridgeaway.org";

export const colors = {
  bg: "#ffffff",
  surface: "#faf6ef", // cream card
  ink: "#2d2418",     // deep walnut
  body: "#55483a",
  muted: "#8b7355",   // stone-warm
  accent: "#7a3b2e",  // clay
  accentInk: "#faf6ef",
  border: "#e6dcc8",
};

export const main = {
  backgroundColor: colors.bg,
  fontFamily: "'Inter','Helvetica Neue',Arial,sans-serif",
  margin: 0,
  padding: "32px 0",
};

export const container = {
  maxWidth: "560px",
  margin: "0 auto",
  backgroundColor: colors.surface,
  border: `1px solid ${colors.border}`,
  borderRadius: "4px",
  padding: "40px 44px",
};

export const brandBar = {
  borderBottom: `1px solid ${colors.border}`,
  paddingBottom: "20px",
  marginBottom: "28px",
};

export const eyebrow = {
  fontSize: "10px",
  letterSpacing: "0.22em",
  textTransform: "uppercase" as const,
  color: colors.accent,
  fontWeight: 600,
  margin: 0,
};

export const brandName = {
  fontFamily: "'Cormorant Garamond','Times New Roman',serif",
  fontSize: "22px",
  fontWeight: 600,
  color: colors.ink,
  margin: "6px 0 0",
  letterSpacing: "0.01em",
};

export const h1 = {
  fontFamily: "'Cormorant Garamond','Times New Roman',serif",
  fontSize: "30px",
  fontWeight: 500,
  color: colors.ink,
  margin: "0 0 18px",
  lineHeight: "1.2",
};

export const text = {
  fontSize: "15px",
  color: colors.body,
  lineHeight: "1.65",
  margin: "0 0 18px",
};

export const link = { color: colors.accent, textDecoration: "underline" };

export const button = {
  backgroundColor: colors.accent,
  color: colors.accentInk,
  fontSize: "12px",
  letterSpacing: "0.18em",
  textTransform: "uppercase" as const,
  fontWeight: 600,
  borderRadius: "2px",
  padding: "14px 28px",
  textDecoration: "none",
  display: "inline-block",
  margin: "8px 0 24px",
};

export const codeStyle = {
  fontFamily: "'SFMono-Regular',Menlo,Consolas,monospace",
  fontSize: "26px",
  letterSpacing: "0.4em",
  fontWeight: 600,
  color: colors.ink,
  backgroundColor: "#ffffff",
  border: `1px solid ${colors.border}`,
  padding: "16px 20px",
  textAlign: "center" as const,
  margin: "10px 0 28px",
};

export const divider = {
  border: "none",
  borderTop: `1px solid ${colors.border}`,
  margin: "28px 0 18px",
};

export const footer = {
  fontSize: "12px",
  color: colors.muted,
  lineHeight: "1.6",
  margin: 0,
};
