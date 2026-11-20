/* -------------------------------------------------------
   IMPORTS
------------------------------------------------------- */

import { useState } from "react";
import "./themes.css";
import type { ThemeDefinition } from "./themeTypes";
import { ThemeCard } from "./themeCard";
import { ThemeBuilder } from "./themeBuilder/themeBuilder";
import { useTheme } from "./themeContext";

/* -------------------------------------------------------
   COMPONENT
------------------------------------------------------- */

export function Themes() {
  const { themes, setThemes } = useTheme();

  const [showBuilder, setShowBuilder] = useState(false);
  const [editingTheme, setEditingTheme] = useState<ThemeDefinition | null>(null);

  // -----------------------------
  // DELETE THEME (IPC to backend)
  // -----------------------------
  const handleDelete = async (id: string) => {
    try {
      if (window.themeAPI && typeof (window.themeAPI as any).delete === "function") {
        const themeName = themes.find(t => t.id === id)?.name ?? id;
        const confirmed = window.confirm(
          `Delete theme "${themeName}"? This cannot be undone.`
        );
        if (!confirmed) return;

        await (window.themeAPI as any).delete(id);
        const updated = await window.themeAPI.loadAll();
        setThemes(updated);
        setShowBuilder(false);
        return;
      }
    } catch (e) {
      console.error("Failed to delete theme:", e);
      alert("Failed to delete theme.");
      return;
    }

    // Fallback (dev): remove from memory only
    setThemes(themes.filter((t: ThemeDefinition) => t.id !== id));
  };

  // -----------------------------
  // SAVE THEME (IPC if available)
  // -----------------------------
  const handleSave = (newTheme: ThemeDefinition) => {
    // If Electron API exists, persist to disk
    if (window.themeAPI?.save && window.themeAPI?.loadAll) {
      window.themeAPI
        .save(newTheme)
        .then(() => window.themeAPI.loadAll())
        .then((updatedThemes: ThemeDefinition[]) => {
          setThemes(updatedThemes);
          setShowBuilder(false);
        })
        .catch(err => console.error("Failed to save theme:", err));
      return;
    }

    // Browser fallback (Vite dev mode)
    setThemes((prev: ThemeDefinition[]) => {
      const idx = prev.findIndex((t: ThemeDefinition) => t.id === newTheme.id);
      if (idx === -1) return [...prev, newTheme];
      const copy = [...prev];
      copy[idx] = newTheme;
      return copy;
    });

    setShowBuilder(false);
  };

  return (
    <div className="themes-tab">
      <button
        className="add-theme-btn"
        type="button"
        onClick={() => {
          setEditingTheme(null);
          setShowBuilder(true);
        }}
      >
        Add Theme
      </button>

      <div className="theme-list">
        {themes.map((t: ThemeDefinition) => (
          <ThemeCard
            key={t.id}
            theme={t}
            onEdit={() => {
              setEditingTheme(t);
              setShowBuilder(true);
            }}
            onDelete={() => handleDelete(t.id)}
          />
        ))}
      </div>

      {showBuilder && (
        <ThemeBuilder
          initial={editingTheme || undefined}
          onSave={handleSave}
          onClose={() => setShowBuilder(false)}
        />
      )}
    </div>
  );
}
