"use client";

import { useMemo, useState } from "react";
import { GameCard } from "@/components/game-card";
import type { Game, GameCategory } from "@/lib/games";

interface LibraryScreenProps {
  games: Game[];
  categories: ("TODOS" | GameCategory)[];
}

export function LibraryScreen({ games, categories }: LibraryScreenProps) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<"TODOS" | GameCategory>("TODOS");

  const filtered = useMemo(() => {
    return games.filter(
      (g) => (category === "TODOS" || g.cat === category) && g.title.toLowerCase().includes(query.toLowerCase())
    );
  }, [games, query, category]);

  return (
    <div className="fade-in">
      <section className="av-hero">
        <h1 className="flicker">ARCADE VAULT</h1>
        <div className="sub">
          INSERTA UNA MONEDA PARA JUGAR <span className="blink">_</span>
        </div>
      </section>

      <div className="av-filters">
        <div className="av-search">
          <span className="ico">⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar un juego por nombre…"
          />
        </div>
        <div className="av-chips">
          {categories.map((c) => (
            <button
              key={c}
              className={"chip" + (category === c ? " active" : "")}
              onClick={() => setCategory(c)}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      <div className="av-grid">
        {filtered.map((g) => (
          <GameCard key={g.id} game={g} />
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: 80, color: "var(--ink-faint)" }}>
            <div className="pixel" style={{ fontSize: 14, color: "var(--magenta)", marginBottom: 12 }}>
              NO HAY RESULTADOS
            </div>
            <div>Intenta otra búsqueda o categoría.</div>
          </div>
        )}
      </div>
    </div>
  );
}
