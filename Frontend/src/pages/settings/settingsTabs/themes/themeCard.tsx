import "./themeCard.css";
import type { ThemeDefinition } from "./themeTypes";
import { useTheme } from "./themeContext";
import { useEffect } from "react";

export interface ThemeCardProps {
  theme: ThemeDefinition;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ThemeCard({ theme, onEdit, onDelete }: ThemeCardProps) {
  const { activeTheme, setActiveTheme } = useTheme();

  const isActive = activeTheme?.id === theme.id;

  function guessFormat(url: string) {
    if (url.endsWith(".woff2")) return "woff2";
    if (url.endsWith(".woff")) return "woff";
    if (url.endsWith(".ttf")) return "truetype";
    if (url.endsWith(".otf")) return "opentype";
    return "truetype";
  }

  useEffect(() => {
    if (theme.font) {
      try {
        const fmt = guessFormat(theme.font);
        const display = new FontFace(`${theme.id}-display`, `url(${theme.font}) format("${fmt}")`);
        display.load().then(loaded => document.fonts.add(loaded)).catch(e => console.warn("Font load failed:", e));
      } catch (e) {
        console.warn("FontFace error:", e);
      }
    }

    if (theme.bodyFont) {
      try {
        const fmt = guessFormat(theme.bodyFont);
        const body = new FontFace(`${theme.id}-body`, `url(${theme.bodyFont}) format("${fmt}")`);
        body.load().then(loaded => document.fonts.add(loaded)).catch(e => console.warn("Font load failed:", e));
      } catch (e) {
        console.warn("FontFace error:", e);
      }
    }
  }, [theme]);



  return (
    <div
      className={`theme-card theme-${theme.id} ${isActive ? "active" : ""} theme-bg-${theme.id}`}
      onClick={() => setActiveTheme(theme)}
    >
      <style>
        {`
  .theme-${theme.id} {
    --theme-card-bg: ${theme.colors.background};
    --card-text: ${theme.colors.text};
    --card-text-muted: ${theme.colors.textMuted};
    --card-primary-bg: ${theme.colors.primaryBg};
    --card-primary-text: ${theme.colors.primaryText};
    --card-glow: ${theme.colors.accent}55;
    --card-dangerBg: ${theme.colors.dangerBg};
    --card-dangerText: ${theme.colors.dangerText};
    --card-font-title: ${theme.font ? `${theme.id}-display` : "inherit"
          };
    --card-font-body: ${theme.bodyFont ? `${theme.id}-body` : "inherit"
          };
  }
`}
      </style>


      {/* Default / Custom tag */}
      <div className="theme-tags">
        <div className={`theme-tag ${theme.isDefault ? "default" : "custom"}`}>
          {theme.isDefault ? "Default" : "Custom"}
        </div>

        {isActive && <div className="theme-active-badge">Active</div>}
      </div>

      {/* Logo */}
      <div className="theme-card-logo">
        {theme.logo && <img src={theme.logo} alt={`${theme.name} logo`} />}
      </div>

      {/* Font previews */}
      <div className="theme-font-title">{theme.name} Title</div>
      <div className="theme-font-body">{theme.name} Body</div>

      {/* Preview button */}
      {theme.isDefault && (
        <button className="theme-preview-btn" type="button">
          Button
        </button>
      )}

      {/* Custom theme actions */}
      {!theme.isDefault && (
        <div className="theme-actions">
          <button
            className="theme-edit-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.();
            }}
          >
            Edit
          </button>

          <button
            className="theme-delete-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onDelete?.();
            }}
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
}
