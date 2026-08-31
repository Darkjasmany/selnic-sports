import type { IncidentType } from "../api/matches.api";

const INCIDENT_LABELS_BY_DISCIPLINE: Record<string, Partial<Record<IncidentType, string>>> = {
  FÚTBOL: {
    GOAL: "⚽ Gol",
    YELLOW_CARD: "🟨 Tarjeta amarilla",
    RED_CARD: "🟥 Tarjeta roja",
    CORNER: "🚩 Corner",
    FOUL: "⚠️ Falta",
    SUBSTITUTION: "🔄 Cambio",
    NOTE: "📝 Nota",
  },
  BÁSQUETBOL: {
    BASKET_2: "🏀 Doble (2 pts)",
    BASKET_3: "🏀 Triple (3 pts)",
    FREE_THROW: "🎯 Tiro libre",
    FOUL_BASKET: "⚠️ Falta (básquet)",
    REBOUND: "🔄 Rebote",
    ASSIST: "🤝 Asistencia",
    STEAL: "🖐️ Robo",
    BLOCK: "🚫 Bloqueo",
    TURNOVER: "❌ Pérdida",
    TIMEOUT: "⏸️ Tiempo muerto",
    SUBSTITUTION: "🔄 Cambio",
    NOTE: "📝 Nota",
  },
  AJEDREZ: {
    CHECK: "🛡️ Jaque",
    CHECKMATE: "👑 Jaque mate",
    RESIGNATION: "🏳️ Rendición",
    DRAW_CHESS: "🤝 Tablas",
    CAPTURED_PIECE: "♟️ Pieza capturada",
    NOTE: "📝 Nota",
  },
};

const DEFAULT_INCIDENT_LABELS: Partial<Record<IncidentType, string>> = {
  GOAL: "⚽ Gol",
  YELLOW_CARD: "🟨 Tarjeta amarilla",
  RED_CARD: "🟥 Tarjeta roja",
  CORNER: "🚩 Corner",
  FOUL: "⚠️ Falta",
  SUBSTITUTION: "🔄 Cambio",
  BASKET_2: "🏀 Doble (2 pts)",
  BASKET_3: "🏀 Triple (3 pts)",
  FREE_THROW: "🎯 Tiro libre",
  FOUL_BASKET: "⚠️ Falta (básquet)",
  REBOUND: "🔄 Rebote",
  ASSIST: "🤝 Asistencia",
  STEAL: "🖐️ Robo",
  BLOCK: "🚫 Bloqueo",
  TURNOVER: "❌ Pérdida",
  TIMEOUT: "⏸️ Tiempo muerto",
  CHECK: "🛡️ Jaque",
  CHECKMATE: "👑 Jaque mate",
  RESIGNATION: "🏳️ Rendición",
  DRAW_CHESS: "🤝 Tablas",
  CAPTURED_PIECE: "♟️ Pieza capturada",
  NOTE: "📝 Nota",
};

export function getDisciplineKey(name?: string): string {
  if (!name) return "DEFAULT";
  const n = name.toLowerCase();
  if (n.includes("básquet") || n.includes("basquet") || n.includes("basket")) return "BÁSQUETBOL";
  if (n.includes("ajedrez") || n.includes("chess")) return "AJEDREZ";
  return "FÚTBOL";
}

export function getIncidentLabels(disciplineName?: string): Partial<Record<IncidentType, string>> {
  const key = getDisciplineKey(disciplineName);
  return key === "DEFAULT"
    ? DEFAULT_INCIDENT_LABELS
    : (INCIDENT_LABELS_BY_DISCIPLINE[key] ?? DEFAULT_INCIDENT_LABELS);
}

export function getIncidentLabel(type: IncidentType, disciplineName?: string): string {
  return getIncidentLabels(disciplineName)[type] ?? type;
}
