export const matHeroDesignTokens = {
  colors: {
    background: {
      base: "var(--mh-bg)",
      deep: "var(--mh-bg-deep)",
    },
    surface: {
      primary: "var(--mh-surface)",
      secondary: "var(--mh-surface-2)",
      tertiary: "var(--mh-surface-3)",
      overlay: "var(--mh-surface-overlay)",
    },
    border: {
      base: "var(--mh-line)",
      soft: "var(--mh-line-soft)",
      strong: "var(--mh-line-strong)",
    },
    text: {
      primary: "var(--mh-text)",
      secondary: "var(--mh-text-soft)",
      muted: "var(--mh-text-muted)",
      dim: "var(--mh-text-dim)",
    },
    accent: {
      cyan: "var(--mh-accent-cyan)",
      purple: "var(--mh-accent-purple)",
      fuchsia: "var(--mh-accent-fuchsia)",
      pink: "var(--mh-accent-pink)",
      lime: "var(--mh-accent-lime)",
      gold: "var(--mh-accent-gold)",
      amber: "var(--mh-accent-amber)",
    },
    semantic: {
      success: "var(--mh-success)",
      warning: "var(--mh-warning)",
      error: "var(--mh-error)",
    },
  },
  radius: {
    card: "var(--mh-radius-card)",
    cardLarge: "var(--mh-radius-card-lg)",
    button: "var(--mh-radius-button)",
    badge: "var(--mh-radius-badge)",
    input: "var(--mh-radius-input)",
    modal: "var(--mh-radius-modal)",
  },
  spacing: {
    section: "var(--mh-space-section)",
    card: "var(--mh-space-card)",
    cardLarge: "var(--mh-space-card-lg)",
    grid: "var(--mh-space-grid)",
    sidebar: "var(--mh-space-sidebar)",
    buttonX: "var(--mh-space-button-x)",
    buttonY: "var(--mh-space-button-y)",
  },
  glow: {
    cyan: "var(--mh-glow-cyan)",
    purple: "var(--mh-glow-purple)",
    pink: "var(--mh-glow-pink)",
    lime: "var(--mh-glow-lime)",
    active: "var(--mh-glow-active)",
  },
  shadow: {
    panel: "var(--mh-shadow-panel)",
    soft: "var(--mh-shadow-soft)",
  },
  typography: {
    labelSize: "var(--mh-label-size)",
    labelTracking: "var(--mh-label-tracking)",
    bodyLineHeight: "var(--mh-body-line)",
  },
} as const;
