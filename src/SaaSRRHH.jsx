import { useState, useEffect, useMemo } from "react";
import GuiaEntrevista from "./GuiaEntrevista.jsx";

// =============================================================
// TABLERO DE CONTROL PARA RRHH (sin branding)
// Layout: sidebar de catálogo a la IZQUIERDA + contenido a la derecha
// =============================================================

const TABS = [
  { id: "dashboard", label: "Dashboard", num: "0" },
  { id: "nomina", label: "Variaciones de Nómina", num: "1" },
  { id: "clima", label: "Clima Laboral", num: "2" },
  { id: "denuncia", label: "Línea de Denuncia", num: "3" },
  { id: "cobertura", label: "Cobertura de Plantilla", num: "4" },
  { id: "rotacion", label: "Rotación", num: "5" },
  { id: "capacitacion", label: "Capacitación", num: "6" },
  { id: "seleccion", label: "Proceso de Selección", num: "7" },
];

// ---------- estilos base, sin branding ----------
const S = {
  page: { minHeight: "100vh", background: "#ffffff", color: "#000", fontFamily: "system-ui, -apple-system, sans-serif" },
  topbar: { borderBottom: "1px solid #ccc", padding: "16px 24px", display: "flex", alignItems: "center", justifyContent: "space-between" },
  title: { fontSize: 20, fontWeight: 700 },
  subtitle: { fontSize: 12, color: "#666" },

  // Layout principal: sidebar izquierdo + main
  layout: { display: "flex", minHeight: "calc(100vh - 70px)" },
  main: { flex: 1, padding: 24, maxWidth: "calc(100% - 280px)" },
  sidebar: {
    width: 280, flexShrink: 0, borderRight: "1px solid #ccc",
    background: "#fafafa", padding: "20px 0", position: "sticky", top: 0,
    height: "calc(100vh - 70px)", overflowY: "auto",
  },
  sidebarTitle: {
    fontSize: 11, fontWeight: 700, color: "#666", textTransform: "uppercase",
    letterSpacing: 0.8, padding: "0 20px 12px", borderBottom: "1px solid #e5e5e5",
  },
  sidebarItem: (active) => ({
    padding: "12px 20px", fontSize: 13,
    fontWeight: active ? 700 : 500,
    background: active ? "#fff" : "transparent",
    borderRight: active ? "3px solid #000" : "3px solid transparent",
    cursor: "pointer", display: "flex", alignItems: "center", gap: 10,
    color: active ? "#000" : "#333",
  }),
  sidebarNum: (active) => ({
    width: 22, height: 22, borderRadius: "50%",
    background: active ? "#000" : "#e5e5e5",
    color: active ? "#fff" : "#666",
    fontSize: 11, fontWeight: 700,
    display: "flex", alignItems: "center", justifyContent: "center",
    flexShrink: 0,
  }),
  sidebarSection: { padding: "20px 20px 12px", marginTop: 16, borderTop: "1px solid #e5e5e5" },
  sidebarFilter: {
    width: "100%", padding: "8px 10px", border: "1px solid #ccc",
    borderRadius: 4, fontSize: 12, background: "#fff", marginBottom: 8,
    fontFamily: "inherit",
  },

  h2: { fontSize: 18, fontWeight: 700, marginBottom: 4 },
  h3: { fontSize: 14, fontWeight: 700, marginTop: 20, marginBottom: 8 },
  hint: { fontSize: 12, color: "#666", marginBottom: 16 },
  card: { border: "1px solid #ccc", borderRadius: 6, padding: 16, marginBottom: 16, background: "#fff" },
  kpi: { border: "1px solid #ccc", borderRadius: 6, padding: 14, background: "#fff" },
  kpiLabel: { fontSize: 11, color: "#666", textTransform: "uppercase", letterSpacing: 0.5 },
  kpiValue: { fontSize: 28, fontWeight: 700, marginTop: 4 },
  kpiDelta: (positive) => ({ fontSize: 14, color: positive ? "#0a7d2c" : "#b00020", marginTop: 4 }),
  grid4: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 },
  grid3: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 },
  grid2: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { textAlign: "left", padding: "8px 10px", borderBottom: "2px solid #000", background: "#f5f5f5", fontWeight: 700 },
  td: { padding: "8px 10px", borderBottom: "1px solid #e5e5e5" },
  input: { width: "100%", padding: "8px 10px", border: "1px solid #ccc", borderRadius: 4, fontSize: 13, fontFamily: "inherit" },
  btn: { padding: "8px 14px", border: "1px solid #000", background: "#000", color: "#fff", borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: "pointer" },
  btnGhost: { padding: "8px 14px", border: "1px solid #ccc", background: "#fff", color: "#000", borderRadius: 4, fontSize: 12, fontWeight: 600, cursor: "pointer" },
  badge: (color) => ({ display: "inline-block", padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 600, background: color || "#eee", color: "#000" }),
  alert: (kind) => ({
    padding: "10px 12px", borderRadius: 4, fontSize: 12, marginBottom: 12,
    background: kind === "danger" ? "#fdecea" : kind === "warn" ? "#fff7e0" : "#eef5ff",
    border: `1px solid ${kind === "danger" ? "#e74c3c" : kind === "warn" ? "#f39c12" : "#3498db"}`,
    color: "#000",
  }),
};

// =============================================================
// DATOS MENSUALES — Suite simulada que opera en la realidad
// Cambia con el selector de periodo en el topbar
// =============================================================
const monthsOrder = ["Ene 2026", "Feb 2026", "Mar 2026", "Abr 2026", "May 2026"];

const dic2025Areas = [
  { area: "Comercial",      base: 1810000, comisiones: 850000, bonos: 130000, destajos: 0,     otros: 32000 },
  { area: "Posventa",       base: 1390000, comisiones: 105000, bonos: 195000, destajos: 80000, otros: 25000 },
  { area: "Operaciones",    base: 1195000, comisiones: 0,      bonos: 60000,  destajos: 0,     otros: 14000 },
  { area: "Administración", base: 668000,  comisiones: 0,      bonos: 45000,  destajos: 0,     otros: 8000 },
  { area: "Dirección",      base: 540000,  comisiones: 0,      bonos: 195000, destajos: 0,     otros: 30000 },
];

const monthlyAreasRaw = {
  // Variaciones intencionalmente cruzadas: cada área lleva su propia narrativa,
  // así que mes a mes algunas suben y otras bajan.
  "Ene 2026": [
    { area: "Comercial",      base: 1820000, comisiones: 920000, bonos: 85000,  destajos: 0,     otros: 42000, limite: 35 },
    { area: "Posventa",       base: 1395000, comisiones: 115000, bonos: 180000, destajos: 95000, otros: 22000, limite: 25 },
    { area: "Operaciones",    base: 1200000, comisiones: 0,      bonos: 55000,  destajos: 0,     otros: 16000, limite: 10 },
    { area: "Administración", base: 670000,  comisiones: 0,      bonos: 52000,  destajos: 0,     otros: 7000,  limite: 12 },
    { area: "Dirección",      base: 540000,  comisiones: 0,      bonos: 210000, destajos: 0,     otros: 24000, limite: 30 },
  ],
  "Feb 2026": [
    { area: "Comercial",      base: 1825000, comisiones: 780000, bonos: 120000, destajos: 0,     otros: 38000, limite: 35 },
    { area: "Posventa",       base: 1400000, comisiones: 108000, bonos: 210000, destajos: 85000, otros: 26000, limite: 25 },
    { area: "Operaciones",    base: 1205000, comisiones: 0,      bonos: 68000,  destajos: 0,     otros: 14000, limite: 10 },
    { area: "Administración", base: 672000,  comisiones: 0,      bonos: 48000,  destajos: 0,     otros: 9000,  limite: 12 },
    { area: "Dirección",      base: 540000,  comisiones: 0,      bonos: 170000, destajos: 0,     otros: 32000, limite: 30 },
  ],
  "Mar 2026": [
    { area: "Comercial",      base: 1850000, comisiones: 1100000, bonos: 240000, destajos: 0,      otros: 55000, limite: 35 },
    { area: "Posventa",       base: 1420000, comisiones: 95000,   bonos: 260000, destajos: 115000, otros: 28000, limite: 25 },
    { area: "Operaciones",    base: 1210000, comisiones: 0,       bonos: 85000,  destajos: 0,      otros: 19000, limite: 10 },
    { area: "Administración", base: 678000,  comisiones: 0,       bonos: 55000,  destajos: 0,      otros: 8000,  limite: 12 },
    { area: "Dirección",      base: 545000,  comisiones: 0,       bonos: 280000, destajos: 0,      otros: 40000, limite: 30 },
  ],
  "Abr 2026": [
    { area: "Comercial",      base: 1855000, comisiones: 870000, bonos: 195000, destajos: 0,      otros: 48000, limite: 35 },
    { area: "Posventa",       base: 1425000, comisiones: 120000, bonos: 235000, destajos: 100000, otros: 30000, limite: 25 },
    { area: "Operaciones",    base: 1215000, comisiones: 0,      bonos: 75000,  destajos: 0,      otros: 22000, limite: 10 },
    { area: "Administración", base: 680000,  comisiones: 0,      bonos: 62000,  destajos: 0,      otros: 9000,  limite: 12 },
    { area: "Dirección",      base: 545000,  comisiones: 0,      bonos: 210000, destajos: 0,      otros: 35000, limite: 30 },
  ],
  "May 2026": [
    { area: "Comercial",      base: 1865000, comisiones: 890000, bonos: 110000, destajos: 0,     otros: 45000, limite: 35 },
    { area: "Posventa",       base: 1430000, comisiones: 118000, bonos: 210000, destajos: 95000, otros: 28000, limite: 25 },
    { area: "Operaciones",    base: 1220000, comisiones: 0,      bonos: 82000,  destajos: 0,     otros: 24000, limite: 10 },
    { area: "Administración", base: 685000,  comisiones: 0,      bonos: 65000,  destajos: 0,     otros: 8000,  limite: 12 },
    { area: "Dirección",      base: 550000,  comisiones: 0,      bonos: 235000, destajos: 0,     otros: 38000, limite: 30 },
  ],
};

function getAreasFor(period) {
  const idx = monthsOrder.indexOf(period);
  const curr = monthlyAreasRaw[period] || monthlyAreasRaw["Abr 2026"];
  const prevList = idx <= 0 ? dic2025Areas : monthlyAreasRaw[monthsOrder[idx - 1]];
  return curr.map((c) => {
    const p = prevList.find((x) => x.area === c.area) || c;
    const prevTotal = p.base + p.comisiones + p.bonos + p.destajos + p.otros;
    return {
      ...c,
      prevTotal,
      prev: { comisiones: p.comisiones, bonos: p.bonos, destajos: p.destajos, otros: p.otros },
    };
  });
}

const monthlyBonos = {
  "Ene 2026": [
    { id: 101, fecha: "2026-01-09", empleado: "P. Hernández", area: "Comercial", monto: 30000,
      solicitante: "L. Martínez", gerenciaSolicitante: "Comercial",
      autoriza: "J. Beltrán (Director Comercial)", medioEvidencia: "Correo",
      tipo: "Cierre de cuenta clave",
      justificacion: "Cierre fiscal del año previo: cuenta enterprise renovada por $4.1M y crecimiento 18% YoY.",
      estado: "Aprobado", stage: "final" },
    { id: 102, fecha: "2026-01-22", empleado: "R. Estrada", area: "Operaciones", monto: 15000,
      solicitante: "S. Ortega", gerenciaSolicitante: "Operaciones",
      autoriza: "—", medioEvidencia: "Slack / Teams",
      tipo: "Proyecto especial",
      justificacion: "Lideró migración de almacén central durante diciembre, reduciendo inventario muerto $850K.",
      estado: "Pendiente", stage: "gerente" },
  ],
  "Feb 2026": [
    { id: 201, fecha: "2026-02-05", empleado: "M. López", area: "Posventa", monto: 22000,
      solicitante: "T. Aguilar", gerenciaSolicitante: "Posventa",
      autoriza: "C. Robles (Director)", medioEvidencia: "Firma electrónica",
      tipo: "Reconocimiento desempeño",
      justificacion: "NPS de su cartera de 91 puntos en enero, 12 puntos arriba del promedio de la gerencia.",
      estado: "Aprobado", stage: "final" },
    { id: 202, fecha: "2026-02-14", empleado: "J. Castillo", area: "Comercial", monto: 35000,
      solicitante: "L. Martínez", gerenciaSolicitante: "Comercial",
      autoriza: "—", medioEvidencia: "Correo",
      tipo: "Cierre de cuenta clave",
      justificacion: "Cuenta enterprise nueva $2.6M con SLA premium, dos años de contrato y referencia para industria.",
      estado: "Pendiente", stage: "director" },
    { id: 203, fecha: "2026-02-19", empleado: "A. Mendoza", area: "Administración", monto: 10000,
      solicitante: "G. Pérez", gerenciaSolicitante: "Administración",
      autoriza: "RRHH", medioEvidencia: "Memo formal",
      tipo: "Otro",
      justificacion: "Sin justificación documentada, solicitud devuelta a área para complementar evidencia.",
      estado: "Rechazado", stage: "final" },
  ],
  "Mar 2026": [
    { id: 301, fecha: "2026-03-08", empleado: "R. Domínguez", area: "Comercial", monto: 45000,
      solicitante: "L. Martínez", gerenciaSolicitante: "Comercial",
      autoriza: "P. Hernández (Director)", medioEvidencia: "Correo",
      tipo: "Cierre de cuenta clave",
      justificacion: "Cierre Q1: cuenta clave $3.2M cerrada fuera de cuota anual con margen del 26%.",
      estado: "Aprobado", stage: "final" },
    { id: 302, fecha: "2026-03-15", empleado: "F. Salazar", area: "Comercial", monto: 38000,
      solicitante: "L. Martínez", gerenciaSolicitante: "Comercial",
      autoriza: "P. Hernández (Director)", medioEvidencia: "Correo",
      tipo: "Cierre de cuenta clave",
      justificacion: "Cuenta enterprise región Bajío $2.8M con expansión a 3 plantas adicionales en H2.",
      estado: "Aprobado", stage: "final" },
    { id: 303, fecha: "2026-03-22", empleado: "T. Ríos", area: "Posventa", monto: 28000,
      solicitante: "T. Aguilar", gerenciaSolicitante: "Posventa",
      autoriza: "—", medioEvidencia: "Slack / Teams",
      tipo: "Retención",
      justificacion: "Recuperación de proveedor estratégico que iba a romper contrato, retención asegurada por 18 meses.",
      estado: "Pendiente", stage: "director" },
    { id: 304, fecha: "2026-03-26", empleado: "G. Mejía", area: "Dirección", monto: 50000,
      solicitante: "CEO", gerenciaSolicitante: "Dirección",
      autoriza: "—", medioEvidencia: "Memo formal",
      tipo: "Cierre de cuenta clave",
      justificacion: "Liderazgo cierre Q1 directiva, EBITDA al 110% de la meta y plan de Q2 firmado por consejo.",
      estado: "Pendiente", stage: "gerente" },
  ],
  "Abr 2026": [
    { id: 401, fecha: "2026-04-08", empleado: "R. Domínguez", area: "Comercial", monto: 45000,
      solicitante: "L. Martínez", gerenciaSolicitante: "Comercial",
      autoriza: "P. Hernández (Director)", medioEvidencia: "Correo",
      tipo: "Cierre de cuenta clave",
      justificacion: "Renovación anticipada de cuenta clave con upsell, $1.8M de ingreso recurrente extra anual.",
      estado: "Aprobado", stage: "final" },
    { id: 402, fecha: "2026-04-15", empleado: "M. Vázquez", area: "Posventa", monto: 18500,
      solicitante: "J. Ramírez", gerenciaSolicitante: "Posventa",
      autoriza: "—", medioEvidencia: "Slack / Teams",
      tipo: "Reconocimiento desempeño",
      justificacion: "NPS de 92 en su cartera durante el trimestre completo, 14 puntos arriba del promedio del área.",
      estado: "Pendiente", stage: "director" },
    { id: 403, fecha: "2026-04-12", empleado: "A. Solís", area: "Dirección", monto: 80000,
      solicitante: "CEO", gerenciaSolicitante: "Dirección",
      autoriza: "RRHH", medioEvidencia: "Memo formal",
      tipo: "Otro",
      justificacion: "Sin justificación documentada formal, requiere evidencia adicional antes de avanzar.",
      estado: "Rechazado", stage: "final" },
    { id: 404, fecha: "2026-04-22", empleado: "C. Ortiz", area: "Comercial", monto: 12000,
      solicitante: "L. Martínez", gerenciaSolicitante: "Comercial",
      autoriza: "—", medioEvidencia: "Correo",
      tipo: "Reconocimiento desempeño",
      justificacion: "Sobrecumplimiento de cuota mensual al 142% en abril, líder del ranking del equipo Norte.",
      estado: "Pendiente", stage: "gerente" },
  ],
  "May 2026": [
    { id: 501, fecha: "2026-05-06", empleado: "D. Vega", area: "Comercial", monto: 25000,
      solicitante: "L. Martínez", gerenciaSolicitante: "Comercial",
      autoriza: "—", medioEvidencia: "Correo",
      tipo: "Cierre de cuenta clave",
      justificacion: "Cuenta nueva sector salud $1.4M a 36 meses, primer cliente en este vertical para la compañía.",
      estado: "Pendiente", stage: "gerente" },
    { id: 502, fecha: "2026-05-12", empleado: "L. Ortega", area: "Posventa", monto: 14000,
      solicitante: "T. Aguilar", gerenciaSolicitante: "Posventa",
      autoriza: "C. Robles (Director)", medioEvidencia: "Firma electrónica",
      tipo: "Reconocimiento desempeño",
      justificacion: "Indicador de retención al 98% en su segmento durante el cuatrimestre, mejor del año.",
      estado: "Aprobado", stage: "final" },
  ],
};

const monthlyDashboardKpis = {
  "Ene 2026": [
    { label: "Costo total nómina (mes)", value: "$7.85M",  delta: "+1.5% vs mes anterior",   up: false, light: "yellow" },
    { label: "% variable / nómina",      value: "18.5%",   delta: "Límite: 18%",             up: false, light: "red"    },
    { label: "Rotación anual",           value: "19.8%",   delta: "Costo estimado: $1.9M",   up: false, light: "yellow" },
    { label: "Clima (último pulso)",     value: "7.0 / 10",delta: "0.0 vs trimestre",        up: true,  light: "green"  },
    { label: "Cobertura plantilla",      value: "91%",     delta: "14 vacantes abiertas",    up: false, light: "yellow" },
    { label: "Denuncias activas",        value: "3",       delta: "0 sin Hoja de Ruta",      up: true,  light: "green"  },
    { label: "Capacitación: ROI promedio", value: "1.6x",  delta: "5 cursos en curso",       up: true,  light: "green"  },
    { label: "Tiempo medio de cobertura", value: "36 días",delta: "Meta: 30",                up: false, light: "yellow" },
  ],
  "Feb 2026": [
    { label: "Costo total nómina (mes)", value: "$7.95M",  delta: "+1.3% vs mes anterior",   up: false, light: "yellow" },
    { label: "% variable / nómina",      value: "19.2%",   delta: "Límite: 18%",             up: false, light: "red"    },
    { label: "Rotación anual",           value: "20.1%",   delta: "Costo estimado: $1.95M",  up: false, light: "yellow" },
    { label: "Clima (último pulso)",     value: "7.1 / 10",delta: "+0.1 vs trimestre",       up: true,  light: "green"  },
    { label: "Cobertura plantilla",      value: "92%",     delta: "12 vacantes abiertas",    up: false, light: "yellow" },
    { label: "Denuncias activas",        value: "4",       delta: "1 sin Hoja de Ruta",      up: false, light: "yellow" },
    { label: "Capacitación: ROI promedio", value: "1.7x",  delta: "6 cursos en curso",       up: true,  light: "green"  },
    { label: "Tiempo medio de cobertura", value: "37 días",delta: "Meta: 30",                up: false, light: "yellow" },
  ],
  "Mar 2026": [
    { label: "Costo total nómina (mes)", value: "$8.65M",  delta: "+8.8% vs mes anterior",   up: false, light: "red"    },
    { label: "% variable / nómina",      value: "24.5%",   delta: "Límite: 18%",             up: false, light: "red"    },
    { label: "Rotación anual",           value: "21.0%",   delta: "Costo estimado: $2.05M",  up: false, light: "red"    },
    { label: "Clima (último pulso)",     value: "7.2 / 10",delta: "+0.1 vs trimestre",       up: true,  light: "green"  },
    { label: "Cobertura plantilla",      value: "93%",     delta: "11 vacantes abiertas",    up: false, light: "yellow" },
    { label: "Denuncias activas",        value: "5",       delta: "2 sin Hoja de Ruta",      up: false, light: "yellow" },
    { label: "Capacitación: ROI promedio", value: "1.8x",  delta: "7 cursos en curso",       up: true,  light: "green"  },
    { label: "Tiempo medio de cobertura", value: "39 días",delta: "Meta: 30",                up: false, light: "yellow" },
  ],
  "Abr 2026": [
    { label: "Costo total nómina (mes)", value: "$8.42M",  delta: "+4.2% vs mes anterior",   up: false, light: "yellow" },
    { label: "% variable / nómina",      value: "23.1%",   delta: "Límite: 18%",             up: false, light: "red"    },
    { label: "Rotación anual",           value: "21.3%",   delta: "Costo estimado: $2.1M",   up: false, light: "red"    },
    { label: "Clima (último pulso)",     value: "7.2 / 10",delta: "+0.3 vs trimestre",       up: true,  light: "green"  },
    { label: "Cobertura plantilla",      value: "92%",     delta: "12 vacantes abiertas",    up: false, light: "yellow" },
    { label: "Denuncias activas",        value: "5",       delta: "2 sin Hoja de Ruta",      up: false, light: "yellow" },
    { label: "Capacitación: ROI promedio", value: "1.8x",  delta: "8 cursos en curso",       up: true,  light: "green"  },
    { label: "Tiempo medio de cobertura", value: "38 días",delta: "Meta: 30",                up: false, light: "yellow" },
  ],
  "May 2026": [
    { label: "Costo total nómina (mes)", value: "$8.10M",  delta: "−3.8% vs mes anterior",   up: true,  light: "green"  },
    { label: "% variable / nómina",      value: "19.8%",   delta: "Límite: 18%",             up: false, light: "yellow" },
    { label: "Rotación anual",           value: "20.5%",   delta: "Costo estimado: $2.0M",   up: true,  light: "yellow" },
    { label: "Clima (último pulso)",     value: "7.4 / 10",delta: "+0.2 vs trimestre",       up: true,  light: "green"  },
    { label: "Cobertura plantilla",      value: "94%",     delta: "8 vacantes abiertas",     up: true,  light: "green"  },
    { label: "Denuncias activas",        value: "4",       delta: "1 sin Hoja de Ruta",      up: true,  light: "yellow" },
    { label: "Capacitación: ROI promedio", value: "1.9x",  delta: "9 cursos en curso",       up: true,  light: "green"  },
    { label: "Tiempo medio de cobertura", value: "35 días",delta: "Meta: 30",                up: false, light: "green"  },
  ],
};

const monthlyAlerts = {
  "Ene 2026": [
    { kind: "warn",   text: "Rotación de enero al 19.8% — área de Operaciones perdió 3 colaboradores en lo que va del mes" },
    { kind: "info",   text: "Plan de talento 2026 firmado por dirección, lanzamiento programado para Feb" },
  ],
  "Feb 2026": [
    { kind: "warn",   text: "% variable / nómina por encima del límite (19.2% vs 18%) — Comercial y Posventa concentran el exceso" },
    { kind: "warn",   text: "1 denuncia sin Hoja de Ruta asignada hace 9 días" },
    { kind: "info",   text: "Encuesta de pulso S07 en campo, cierre el 28-Feb" },
  ],
  "Mar 2026": [
    { kind: "danger", text: "Cierre Q1 disparó costo de nómina +8.8% MoM — revisar bonos discrecionales pendientes" },
    { kind: "danger", text: "5 vacantes con +60 días — Operaciones (2), Comercial (2), Adm (1)" },
    { kind: "warn",   text: "2 denuncias sin Hoja de Ruta hace +14 días" },
  ],
  "Abr 2026": [
    { kind: "danger", text: "3 vacantes con +60 días abiertas — Operaciones, Ventas LATAM, Contabilidad" },
    { kind: "warn",   text: "Bonos discrecionales superaron el límite mensual en 2 áreas (Comercial y Posventa)" },
    { kind: "warn",   text: "2 denuncias sin Hoja de Ruta asignada hace +14 días" },
    { kind: "info",   text: "Encuesta de clima Q2 lista para lanzarse a 248 colaboradores" },
  ],
  "May 2026": [
    { kind: "info",   text: "Inicia Q2: planeación de capacitación H2 lista para revisión" },
    { kind: "info",   text: "Clima sube a 7.4 — pulso S19 con participación 78%" },
    { kind: "warn",   text: "1 denuncia sin Hoja de Ruta asignada hace 11 días" },
  ],
};

// =============================================================
// DASHBOARD GENERAL
// =============================================================
function TrafficLight({ light }) {
  const on = {
    red: "#e53935",
    yellow: "#fdd835",
    green: "#43a047",
  };
  const off = "#2a2a2a";
  const dot = (color, glow) => ({
    width: 12,
    height: 12,
    borderRadius: "50%",
    background: color,
    boxShadow: glow
      ? `0 0 4px #fff, 0 0 8px ${glow}, 0 0 14px ${glow}, 0 0 22px ${glow}`
      : "inset 0 0 3px rgba(0,0,0,0.6)",
  });
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 7,
        alignItems: "center",
        justifyContent: "center",
        padding: "9px 7px",
        background: "#404040",
        borderRadius: 6,
        border: "1px solid #2a2a2a",
      }}
      aria-label={`Semáforo: ${light}`}
    >
      <div style={dot(light === "red" ? on.red : off, light === "red" ? on.red : null)} />
      <div style={dot(light === "yellow" ? on.yellow : off, light === "yellow" ? on.yellow : null)} />
      <div style={dot(light === "green" ? on.green : off, light === "green" ? on.green : null)} />
    </div>
  );
}

function Dashboard({ go, periodo = "Abr 2026" }) {
  const kpis = monthlyDashboardKpis[periodo] || monthlyDashboardKpis["Abr 2026"];
  const alerts = monthlyAlerts[periodo] || monthlyAlerts["Abr 2026"];

  return (
    <div>
      <h2 style={S.h2}>Dashboard General</h2>
      <p style={S.hint}>Vista ejecutiva. Cada KPI lleva al módulo correspondiente.</p>

      <div style={S.grid4}>
        {kpis.map((k) => (
          <div
            key={k.label}
            style={{ ...S.kpi, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}
          >
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={S.kpiLabel}>{k.label}</div>
              <div style={S.kpiValue}>{k.value}</div>
              <div style={S.kpiDelta(k.light === "green" || k.up)}>{k.delta}</div>
            </div>
            <TrafficLight light={k.light} />
          </div>
        ))}
      </div>

      <h3 style={S.h3}>Alertas y Pendientes</h3>
      {alerts.map((a, i) => (
        <div key={i} style={S.alert(a.kind)}>{a.text}</div>
      ))}
    </div>
  );
}

// =============================================================
// 1. VARIACIONES AL COSTO DE NÓMINA POR COMPENSACIONES
// =============================================================
function Nomina({ periodo = "Abr 2026" }) {
  const [chartView, setChartView] = useState(null); // null | "month" | "ytd"
  const [bonos, setBonos] = useState(() => monthlyBonos[periodo] || []);
  useEffect(() => {
    setBonos(monthlyBonos[periodo] || []);
  }, [periodo]);
  const [modalOpen, setModalOpen] = useState(false);
  const formInicial = {
    empleado: "",
    area: "Comercial",
    monto: "",
    tipo: "Cierre de cuenta clave",
    justificacion: "",
    impacto: "",
    evidencia: "",
    evidenciaArchivo: "",
    solicitante: "",
    gerenciaSolicitante: "Comercial",
    autoriza: "",
    medioEvidencia: "Correo",
  };
  const [form, setForm] = useState(formInicial);
  const [dragOverFile, setDragOverFile] = useState(false);

  const data = useMemo(() => getAreasFor(periodo), [periodo]);

  const calc = (r) => {
    const variable = r.comisiones + r.bonos + r.destajos + r.otros;
    const total = r.base + variable;
    const pctVar = (variable / total) * 100;
    const exceso = pctVar > r.limite;
    return { variable, total, pctVar, exceso };
  };

  const totales = data.reduce(
    (a, r) => {
      const { variable, total } = calc(r);
      return {
        base: a.base + r.base,
        variable: a.variable + variable,
        total: a.total + total,
      };
    },
    { base: 0, variable: 0, total: 0 }
  );

  const fmt = (n) => "$" + n.toLocaleString("es-MX");

  const fmtK = (n) => {
    const sign = n > 0 ? "+" : n < 0 ? "−" : "";
    const abs = Math.abs(n);
    return `${sign}$${(abs / 1000).toFixed(0)}K`;
  };
  // Convención de costos: subir es malo (rojo ▲), bajar es bueno (verde ▼)
  const bbergStyle = (n) => ({
    color: n > 0 ? "#b00020" : n < 0 ? "#0a7d2c" : "#666",
    fontVariantNumeric: "tabular-nums",
    whiteSpace: "nowrap",
    textAlign: "right",
  });
  const arrow = (n) => (n > 0 ? " ▲" : n < 0 ? " ▼" : "");
  const arrowOnly = (delta) => {
    if (delta > 0) return <span style={{ color: "#b00020", marginLeft: 4 }}>▲</span>;
    if (delta < 0) return <span style={{ color: "#0a7d2c", marginLeft: 4 }}>▼</span>;
    return null;
  };

  const tiposBono = ["Cierre de cuenta clave", "Reconocimiento desempeño", "Retención", "Proyecto especial", "Otro"];
  const mediosEvidencia = ["Correo", "Slack / Teams", "Firma electrónica", "Memo formal", "WhatsApp documentado"];

  // Monto formateado (es-MX: , miles · . decimales)
  const formatMonto = (raw) => {
    if (raw === "" || raw == null) return "";
    const cleaned = String(raw).replace(/[^\d.]/g, "");
    const firstDot = cleaned.indexOf(".");
    let intPart, decPart;
    if (firstDot >= 0) {
      intPart = cleaned.slice(0, firstDot);
      decPart = cleaned.slice(firstDot + 1).replace(/\./g, "").slice(0, 2);
    } else {
      intPart = cleaned;
      decPart = null;
    }
    const intFmt = (intPart || "0").replace(/^0+(?=\d)/, "").replace(/\B(?=(\d{3})+(?!\d))/g, ",") || "0";
    return decPart !== null ? `${intFmt}.${decPart}` : intFmt;
  };
  const parseMonto = (raw) => {
    const cleaned = String(raw).replace(/,/g, "").replace(/[^\d.]/g, "");
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
  };
  const aprobadoresPara = (m) => {
    const n = Number(m) || 0;
    if (n < 25000) return "Gerente";
    if (n <= 75000) return "Gerente + Director";
    return "Gerente + Director + CEO + RRHH";
  };
  const justLen = form.justificacion.trim().length;
  const montoNum = parseMonto(form.monto);
  const errores = [];
  if (!form.empleado.trim()) errores.push("Empleado obligatorio");
  if (montoNum <= 0) errores.push("Monto inválido");
  if (justLen < 80) errores.push(`Justificación: mín. 80 caracteres (actual: ${justLen})`);
  if (!form.impacto.trim()) errores.push("Impacto cuantificable obligatorio");
  if (!form.solicitante.trim()) errores.push("Nombre del solicitante obligatorio");
  if (!form.autoriza.trim()) errores.push("Autorizador obligatorio");
  if (!form.evidencia.trim() && !form.evidenciaArchivo) errores.push("Adjunta un PDF o pega un link de evidencia");

  const areaSel = data.find((d) => d.area === form.area);
  const newBonosArea = (areaSel?.bonos || 0) + montoNum;
  const newVariableArea = areaSel
    ? areaSel.comisiones + newBonosArea + areaSel.destajos + areaSel.otros
    : 0;
  const newTotalArea = areaSel ? areaSel.base + newVariableArea : 0;
  const newPctVarArea = newTotalArea > 0 ? (newVariableArea / newTotalArea) * 100 : 0;
  const rebasaLimite = areaSel ? newPctVarArea > areaSel.limite : false;

  // Semáforo del límite del área (solo cuando hay monto)
  const semaforoArea = !areaSel || montoNum <= 0
    ? "green"
    : newPctVarArea > areaSel.limite
    ? "red"
    : newPctVarArea > areaSel.limite - 3
    ? "yellow"
    : "green";

  // Bonos previos del empleado (match por nombre normalizado)
  const norm = (s) => s.trim().toLowerCase();
  const bonosDelEmpleado = form.empleado.trim().length >= 3
    ? bonos.filter((b) => norm(b.empleado) === norm(form.empleado))
    : [];
  const totalPrevioEmpleado = bonosDelEmpleado.reduce((a, b) => a + b.monto, 0);

  // Bonos del mes por gerencia solicitante
  const bonosGerencia = bonos.filter((b) => b.gerenciaSolicitante === form.gerenciaSolicitante);
  const totalGerencia = bonosGerencia.reduce((a, b) => a + b.monto, 0);
  const rechazadosGerencia = bonosGerencia.filter((b) => b.estado === "Rechazado").length;
  const empleadosGerencia = bonosGerencia.map((b) => norm(b.empleado));
  const dupEmpleadoGerencia = empleadosGerencia.filter((e, i) => empleadosGerencia.indexOf(e) !== i).length > 0;

  // Warnings de política para la gerencia solicitante
  const warningsGerencia = [];
  if (bonosGerencia.length >= 5) warningsGerencia.push(`Volumen alto: ${bonosGerencia.length} solicitudes este mes`);
  if (totalGerencia > 100000) warningsGerencia.push(`Monto acumulado supera $100K (${fmt(totalGerencia)})`);
  if (rechazadosGerencia > 0) warningsGerencia.push(`${rechazadosGerencia} solicitud(es) rechazada(s) recientemente`);
  if (dupEmpleadoGerencia) warningsGerencia.push("Empleado(s) con más de un bono este mes");
  if (bonosDelEmpleado.length >= 2) warningsGerencia.push(`${form.empleado} ya recibió ${bonosDelEmpleado.length} bonos`);

  const semaforoGerencia =
    warningsGerencia.length >= 2 || bonosGerencia.length >= 5 || totalGerencia > 100000
      ? "red"
      : warningsGerencia.length >= 1 || bonosGerencia.length >= 3 || totalGerencia > 50000
      ? "yellow"
      : "green";

  const cerrarModal = () => {
    setModalOpen(false);
    setForm(formInicial);
  };
  const verBono = (b) => {
    setForm({
      empleado: b.empleado || "",
      area: b.area || "Comercial",
      monto: formatMonto(String(b.monto ?? "")),
      tipo: b.tipo || "Cierre de cuenta clave",
      justificacion: b.justificacion || "",
      impacto: b.impacto || "",
      evidencia: b.evidenciaLink || "",
      evidenciaArchivo: b.evidenciaArchivo || "",
      solicitante: b.solicitante || "",
      gerenciaSolicitante: b.gerenciaSolicitante || "Comercial",
      autoriza: b.autoriza === "—" ? "" : (b.autoriza || ""),
      medioEvidencia: b.medioEvidencia || "Correo",
    });
    setModalOpen(true);
  };
  const enviarBono = () => {
    if (errores.length > 0) return;
    const hoy = new Date().toISOString().slice(0, 10);
    setBonos([
      ...bonos,
      {
        id: Date.now(),
        fecha: hoy,
        empleado: form.empleado.trim(),
        area: form.area,
        monto: montoNum,
        solicitante: form.solicitante.trim(),
        gerenciaSolicitante: form.gerenciaSolicitante,
        autoriza: form.autoriza.trim(),
        medioEvidencia: form.medioEvidencia,
        tipo: form.tipo,
        justificacion: form.justificacion.trim(),
        evidenciaArchivo: form.evidenciaArchivo,
        evidenciaLink: form.evidencia.trim(),
        estado: "Pendiente",
        stage: "solicitud",
      },
    ]);
    cerrarModal();
  };

  const handleDropFile = (e) => {
    e.preventDefault();
    setDragOverFile(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setForm((f) => ({ ...f, evidenciaArchivo: file.name }));
  };

  const badgeEstado = (estado) => {
    const colors = { Aprobado: "#e8f5e9", Pendiente: "#fff7e0", Rechazado: "#fdecea" };
    return <span style={S.badge(colors[estado] || "#eee")}>{estado}</span>;
  };

  // ==== KANBAN ====
  const stages = [
    { id: "solicitud", label: "Solicitud" },
    { id: "gerente", label: "Aprob. Gerente" },
    { id: "director", label: "Aprob. Director" },
    { id: "final", label: "Final" },
  ];
  const nextStage = { solicitud: "gerente", gerente: "director", director: "final" };

  const avanzar = (id) => {
    setBonos(bonos.map((b) => {
      if (b.id !== id) return b;
      const ns = nextStage[b.stage];
      if (!ns) return b;
      return {
        ...b,
        stage: ns,
        estado: ns === "final" ? "Aprobado" : "Pendiente",
      };
    }));
  };
  const rechazar = (id) => {
    setBonos(bonos.map((b) => b.id === id ? { ...b, stage: "final", estado: "Rechazado" } : b));
  };

  // Drag & drop entre columnas
  const [draggedId, setDraggedId] = useState(null);
  const [dragOverStage, setDragOverStage] = useState(null);

  const moverA = (id, newStage) => {
    setBonos((curr) => curr.map((b) => {
      if (b.id !== id) return b;
      if (b.stage === newStage) return b;
      if (newStage === "final") {
        return { ...b, stage: "final", estado: "Aprobado" };
      }
      // Vuelve al pipeline (incluye reabrir desde Final / Rechazado)
      return { ...b, stage: newStage, estado: "Pendiente" };
    }));
  };
  const onDropStage = (stageId) => {
    if (draggedId != null) moverA(draggedId, stageId);
    setDraggedId(null);
    setDragOverStage(null);
  };

  const stageColor = (estado) => {
    if (estado === "Aprobado") return { bg: "#e8f5e9", border: "#0a7d2c" };
    if (estado === "Rechazado") return { bg: "#fdecea", border: "#b00020" };
    return { bg: "#fff7e0", border: "#b58900" };
  };

  const inputStyle = {
    width: "100%",
    padding: "8px 10px",
    border: "1px solid #ccc",
    borderRadius: 4,
    fontSize: 13,
    fontFamily: "inherit",
    boxSizing: "border-box",
  };
  const labelStyle = { fontSize: 11, fontWeight: 600, color: "#444", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4, display: "block" };

  const pctVarConsolidado = (totales.variable / totales.total) * 100;
  const limiteConsolidado = 18;
  const variacionPp = pctVarConsolidado - limiteConsolidado;
  const semaforoVariable =
    pctVarConsolidado <= limiteConsolidado
      ? "green"
      : pctVarConsolidado <= limiteConsolidado + 3
      ? "yellow"
      : "red";

  const prevTotales = useMemo(() => {
    const idx = monthsOrder.indexOf(periodo);
    const prevAreas = idx <= 0 ? dic2025Areas : monthlyAreasRaw[monthsOrder[idx - 1]];
    return prevAreas.reduce(
      (a, r) => {
        const variable = r.comisiones + r.bonos + r.destajos + r.otros;
        return {
          base: a.base + r.base,
          variable: a.variable + variable,
          total: a.total + r.base + variable,
        };
      },
      { base: 0, variable: 0, total: 0 }
    );
  }, [periodo]);
  const deltaPct = (cur, prev) => ((cur - prev) / prev) * 100;
  const cmpColor = (d) => (d <= 0 ? "#0a7d2c" : d <= 5 ? "#d97706" : "#b00020");
  const cmpLight = (d) => (d <= 0 ? "green" : d <= 5 ? "yellow" : "red");
  const fmtDelta = (d) => `${d >= 0 ? "+" : ""}${d.toFixed(1)}% vs mes anterior`;
  const dBase = deltaPct(totales.base, prevTotales.base);
  const dVar = deltaPct(totales.variable, prevTotales.variable);
  const dTot = deltaPct(totales.total, prevTotales.total);

  return (
    <div>
      <h2 style={S.h2}>1. Variaciones al Costo de Nómina por Compensaciones</h2>
      <p style={S.hint}>
        Detecta cuánto de la nómina es base y cuánto es compensación variable (comisiones, bonos, destajos, otros).
        Define un % límite por área y dispara alerta cuando se rebase.
      </p>

      <div style={S.grid4}>
        <div style={{ ...S.kpi, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={S.kpiLabel}>Nómina base total</div>
            <div style={S.kpiValue}>{fmt(totales.base)}</div>
            <div style={{ fontSize: 14, color: cmpColor(dBase), marginTop: 4 }}>{fmtDelta(dBase)}</div>
          </div>
          <TrafficLight light={cmpLight(dBase)} />
        </div>
        <div style={{ ...S.kpi, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={S.kpiLabel}>Compensación variable</div>
            <div style={S.kpiValue}>{fmt(totales.variable)}</div>
            <div style={{ fontSize: 14, color: cmpColor(dVar), marginTop: 4 }}>{fmtDelta(dVar)}</div>
          </div>
          <TrafficLight light={cmpLight(dVar)} />
        </div>
        <div style={{ ...S.kpi, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={S.kpiLabel}>Total nómina</div>
            <div style={S.kpiValue}>{fmt(totales.total)}</div>
            <div style={{ fontSize: 14, color: cmpColor(dTot), marginTop: 4 }}>{fmtDelta(dTot)}</div>
          </div>
          <TrafficLight light={cmpLight(dTot)} />
        </div>
        <div style={{ ...S.kpi, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={S.kpiLabel}>% variable consolidado</div>
            <div style={S.kpiValue}>{pctVarConsolidado.toFixed(1)}%</div>
            <div style={S.kpiDelta(variacionPp <= 0)}>
              {variacionPp >= 0 ? "+" : ""}{variacionPp.toFixed(1)}% vs límite ({limiteConsolidado}%)
            </div>
          </div>
          <TrafficLight light={semaforoVariable} />
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 16, marginBottom: 6 }}>
        <h3 style={{ ...S.h3, margin: 0 }}>Detalle por área (variación vs. MA)</h3>
        <div style={{ display: "flex", gap: 6 }}>
          <button
            style={{
              ...S.btnGhost,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: chartView === "month" ? "#000" : "#fff",
              color: chartView === "month" ? "#fff" : "#000",
              borderColor: chartView === "month" ? "#000" : "#ccc",
            }}
            onClick={() => setChartView((v) => (v === "month" ? null : "month"))}
          >
            {chartView === "month" ? "Ocultar" : "Gráfica"}
          </button>
          <button
            style={{
              ...S.btnGhost,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: chartView === "areaMonth" ? "#000" : "#fff",
              color: chartView === "areaMonth" ? "#fff" : "#000",
              borderColor: chartView === "areaMonth" ? "#000" : "#ccc",
            }}
            onClick={() => setChartView((v) => (v === "areaMonth" ? null : "areaMonth"))}
          >
            {chartView === "areaMonth" ? "Ocultar" : "Por área mes a mes"}
          </button>
          <button
            style={{
              ...S.btnGhost,
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: chartView === "ytd" ? "#000" : "#fff",
              color: chartView === "ytd" ? "#fff" : "#000",
              borderColor: chartView === "ytd" ? "#000" : "#ccc",
            }}
            onClick={() => setChartView((v) => (v === "ytd" ? null : "ytd"))}
          >
            {chartView === "ytd" ? "Ocultar" : "Gráfica Acumulada"}
          </button>
        </div>
      </div>

      {chartView === "month" && (() => {
        const chartData = data
          .map((r) => {
            const c = calc(r);
            return { area: r.area, pctVar: c.pctVar };
          })
          .sort((a, b) => b.pctVar - a.pctVar);
        const dataMax = Math.max(...chartData.map((d) => d.pctVar));
        const yMax = Math.max(Math.ceil((dataMax + 5) / 10) * 10, 50);
        const yTicks = [];
        for (let i = 0; i <= yMax; i += 10) yTicks.push(i);
        yTicks.reverse();
        const mes = (periodo || "").split(" ")[0]?.toUpperCase() || "MES";
        const anio = (periodo || "").split(" ")[1] || "";
        const colorAbove = "#c2410c"; // amber-700, sophisticated burnt orange
        const colorBelow = "#475569"; // slate-600, neutral gray
        const gradAbove = "linear-gradient(180deg, #ea580c 0%, #c2410c 100%)";
        const gradBelow = "linear-gradient(180deg, #64748b 0%, #475569 100%)";
        return (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "24px 28px 20px",
              marginBottom: 16,
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)",
            }}
          >
            {/* Header */}
            <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 14, marginBottom: 18 }}>
              <div style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                color: "#64748b",
                marginBottom: 4,
              }}>
                Variación de compensación · {mes} {anio}
              </div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", letterSpacing: -0.2 }}>
                  Compensación variable por área
                </div>
                <div style={{ fontSize: 11, color: "#64748b", fontVariantNumeric: "tabular-nums" }}>
                  Promedio consolidado <strong style={{ color: "#0f172a", fontWeight: 600 }}>{pctVarConsolidado.toFixed(1)}%</strong>
                </div>
              </div>
            </div>

            {/* Chart body */}
            <div style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 8 }}>
              {/* Y axis labels */}
              <div style={{ position: "relative", height: 260 }}>
                {yTicks.map((y) => (
                  <div
                    key={y}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: `${((yMax - y) / yMax) * 100}%`,
                      transform: "translateY(-50%)",
                      fontSize: 10,
                      color: "#94a3b8",
                      fontVariantNumeric: "tabular-nums",
                      letterSpacing: 0.2,
                    }}
                  >
                    {y}%
                  </div>
                ))}
              </div>

              {/* Plot */}
              <div>
                <div style={{ position: "relative", height: 260 }}>
                  {/* Grid lines */}
                  {yTicks.map((y) => (
                    <div
                      key={y}
                      style={{
                        position: "absolute",
                        left: 0, right: 0,
                        top: `${((yMax - y) / yMax) * 100}%`,
                        height: 1,
                        background: y === 0 ? "#cbd5e1" : "#f1f5f9",
                      }}
                    />
                  ))}
                  {/* Average line */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0, right: 0,
                      top: `${((yMax - pctVarConsolidado) / yMax) * 100}%`,
                      height: 1,
                      borderTop: "1px dashed #94a3b8",
                      pointerEvents: "none",
                    }}
                  >
                    <span style={{
                      position: "absolute",
                      right: 0,
                      top: -16,
                      fontSize: 10,
                      color: "#475569",
                      fontWeight: 500,
                      background: "#fff",
                      padding: "0 6px",
                      letterSpacing: 0.2,
                    }}>
                      Promedio · {pctVarConsolidado.toFixed(1)}%
                    </span>
                  </div>
                  {/* Bars */}
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", gap: 14, padding: "0 8px" }}>
                    {chartData.map((d) => {
                      const isAbove = d.pctVar > pctVarConsolidado;
                      const color = isAbove ? colorAbove : colorBelow;
                      const grad = isAbove ? gradAbove : gradBelow;
                      const heightPct = (d.pctVar / yMax) * 100;
                      return (
                        <div
                          key={d.area}
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            height: "100%",
                            maxWidth: 84,
                            margin: "0 auto",
                          }}
                        >
                          <span style={{
                            color,
                            fontWeight: 600,
                            fontSize: 12,
                            marginBottom: 6,
                            fontVariantNumeric: "tabular-nums",
                            letterSpacing: -0.1,
                          }}>
                            {d.pctVar.toFixed(1)}%
                          </span>
                          <div
                            style={{
                              height: `${heightPct}%`,
                              width: "100%",
                              background: grad,
                              borderRadius: "3px 3px 0 0",
                              minHeight: 2,
                              boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.08)",
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* X axis labels */}
                <div style={{ display: "flex", gap: 14, padding: "10px 8px 0" }}>
                  {chartData.map((d) => (
                    <div
                      key={d.area}
                      style={{
                        flex: 1,
                        maxWidth: 84,
                        margin: "0 auto",
                        fontSize: 11,
                        textAlign: "center",
                        color: "#475569",
                        fontWeight: 500,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        letterSpacing: 0.1,
                      }}
                      title={d.area}
                    >
                      {d.area}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Legend & footer */}
            <div style={{
              borderTop: "1px solid #f1f5f9",
              marginTop: 16,
              paddingTop: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 10,
              color: "#64748b",
              letterSpacing: 0.3,
            }}>
              <div style={{ display: "flex", gap: 18 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 10, height: 10, background: gradAbove, borderRadius: 2 }} />
                  Por encima del promedio
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 10, height: 10, background: gradBelow, borderRadius: 2 }} />
                  Igual o por debajo
                </span>
              </div>
              <div style={{ textTransform: "uppercase", letterSpacing: 1.2, fontSize: 9 }}>
                Fuente · Nómina interna
              </div>
            </div>
          </div>
        );
      })()}

      {chartView === "areaMonth" && (() => {
        const idx = monthsOrder.indexOf(periodo);
        const months = monthsOrder.slice(0, idx + 1);
        const areasList = ["Comercial", "Posventa", "Operaciones", "Administración", "Dirección"];
        const areaAbbr = { Comercial: "Com", Posventa: "Pos", Operaciones: "Ope", "Administración": "Adm", "Dirección": "Dir" };
        const colorAbove = "#c2410c";
        const colorBelow = "#475569";
        const gradAbove = "linear-gradient(180deg, #ea580c 0%, #c2410c 100%)";
        const gradBelow = "linear-gradient(180deg, #64748b 0%, #475569 100%)";
        const series = months.map((m) => {
          const raw = monthlyAreasRaw[m];
          const totMes = raw.reduce(
            (a, r) => {
              const variable = r.comisiones + r.bonos + r.destajos + r.otros;
              return { variable: a.variable + variable, total: a.total + r.base + variable };
            },
            { variable: 0, total: 0 }
          );
          const promedio = (totMes.variable / totMes.total) * 100;
          return {
            mes: m.split(" ")[0],
            promedio,
            bars: areasList.map((a) => {
              const r = raw.find((x) => x.area === a);
              if (!r) return { area: a, pctVar: 0 };
              const variable = r.comisiones + r.bonos + r.destajos + r.otros;
              const total = r.base + variable;
              return { area: a, pctVar: (variable / total) * 100 };
            }),
          };
        });
        const allValues = series.flatMap((s) => s.bars.map((b) => b.pctVar));
        const dataMax = Math.max(...allValues);
        const yMax = Math.max(Math.ceil((dataMax + 5) / 10) * 10, 50);
        const yTicks = [];
        for (let i = 0; i <= yMax; i += 10) yTicks.push(i);
        yTicks.reverse();
        return (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "24px 28px 20px",
              marginBottom: 16,
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)",
            }}
          >
            {/* Header */}
            <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 14, marginBottom: 18 }}>
              <div style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                color: "#64748b",
                marginBottom: 4,
              }}>
                Comparativo por área · Ene–{series[series.length - 1].mes} 2026
              </div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", letterSpacing: -0.2 }}>
                  % Variable por área, mes a mes
                </div>
                <div style={{ fontSize: 11, color: "#64748b", fontVariantNumeric: "tabular-nums" }}>
                  {series.length} mes(es) · {areasList.length} áreas
                </div>
              </div>
            </div>

            {/* Chart body */}
            <div style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 8 }}>
              {/* Y axis */}
              <div style={{ position: "relative", height: 260 }}>
                {yTicks.map((y) => (
                  <div
                    key={y}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: `${((yMax - y) / yMax) * 100}%`,
                      transform: "translateY(-50%)",
                      fontSize: 10,
                      color: "#94a3b8",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {y}%
                  </div>
                ))}
              </div>

              {/* Plot */}
              <div>
                <div style={{ position: "relative", height: 260 }}>
                  {/* Grid */}
                  {yTicks.map((y) => (
                    <div
                      key={y}
                      style={{
                        position: "absolute",
                        left: 0, right: 0,
                        top: `${((yMax - y) / yMax) * 100}%`,
                        height: 1,
                        background: y === 0 ? "#cbd5e1" : "#f1f5f9",
                      }}
                    />
                  ))}
                  {/* Grouped bars */}
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", gap: 20, padding: "0 12px" }}>
                    {series.map((s) => (
                      <div
                        key={s.mes}
                        style={{
                          flex: 1,
                          display: "flex",
                          alignItems: "flex-end",
                          justifyContent: "center",
                          gap: 3,
                          height: "100%",
                          margin: "0 auto",
                        }}
                      >
                        {s.bars.map((b) => {
                          const isAbove = b.pctVar > s.promedio;
                          const color = isAbove ? colorAbove : colorBelow;
                          const grad = isAbove ? gradAbove : gradBelow;
                          const heightPct = (b.pctVar / yMax) * 100;
                          return (
                            <div
                              key={b.area}
                              title={`${b.area}: ${b.pctVar.toFixed(1)}%`}
                              style={{
                                width: 22,
                                height: "100%",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "flex-end",
                                alignItems: "center",
                              }}
                            >
                              <span style={{
                                fontSize: 9,
                                fontWeight: 600,
                                color,
                                fontVariantNumeric: "tabular-nums",
                                marginBottom: 3,
                                letterSpacing: -0.2,
                              }}>
                                {b.pctVar.toFixed(0)}%
                              </span>
                              <div
                                style={{
                                  width: "100%",
                                  height: `${heightPct}%`,
                                  background: grad,
                                  borderRadius: "2px 2px 0 0",
                                  minHeight: 2,
                                  boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.08)",
                                }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
                {/* X axis — abreviación por barra + mes debajo */}
                <div style={{ display: "flex", gap: 20, padding: "6px 12px 0" }}>
                  {series.map((s) => (
                    <div key={s.mes} style={{ flex: 1, margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center" }}>
                      <div style={{ display: "flex", justifyContent: "center", gap: 3 }}>
                        {s.bars.map((b) => (
                          <div
                            key={b.area}
                            style={{
                              width: 22,
                              fontSize: 9,
                              textAlign: "center",
                              color: "#64748b",
                              fontWeight: 500,
                              letterSpacing: 0.1,
                            }}
                          >
                            {areaAbbr[b.area]}
                          </div>
                        ))}
                      </div>
                      <div style={{
                        marginTop: 6,
                        fontSize: 11,
                        textAlign: "center",
                        color: "#475569",
                        fontWeight: 600,
                        letterSpacing: 0.1,
                      }}>
                        {s.mes}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Legend */}
            <div style={{
              borderTop: "1px solid #f1f5f9",
              marginTop: 16,
              paddingTop: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 10,
              color: "#64748b",
              letterSpacing: 0.3,
              flexWrap: "wrap",
              gap: 8,
            }}>
              <div style={{ display: "flex", gap: 18 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 10, height: 10, background: gradAbove, borderRadius: 2 }} />
                  Por encima del promedio del mes
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 10, height: 10, background: gradBelow, borderRadius: 2 }} />
                  Igual o por debajo
                </span>
              </div>
              <div style={{ textTransform: "uppercase", letterSpacing: 1.2, fontSize: 9 }}>
                Fuente · Nómina interna
              </div>
            </div>
          </div>
        );
      })()}

      {chartView === "ytd" && (() => {
        const idx = monthsOrder.indexOf(periodo);
        const months = monthsOrder.slice(0, idx + 1);
        const series = months.map((m) => {
          const areas = monthlyAreasRaw[m];
          const totales = areas.reduce(
            (a, r) => {
              const variable = r.comisiones + r.bonos + r.destajos + r.otros;
              return {
                base: a.base + r.base,
                variable: a.variable + variable,
                total: a.total + r.base + variable,
              };
            },
            { base: 0, variable: 0, total: 0 }
          );
          return {
            mes: m.split(" ")[0],
            pctVar: (totales.variable / totales.total) * 100,
            total: totales.total,
          };
        });
        const limite = 18;
        const dataMax = Math.max(...series.map((s) => s.pctVar), limite);
        const yMax = Math.max(Math.ceil((dataMax + 5) / 5) * 5, 30);
        const yTicks = [];
        for (let i = 0; i <= yMax; i += 5) yTicks.push(i);
        yTicks.reverse();
        const promedioYtd = series.reduce((a, s) => a + s.pctVar, 0) / series.length;
        return (
          <div
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: "24px 28px 20px",
              marginBottom: 16,
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04), 0 1px 3px rgba(15, 23, 42, 0.06)",
            }}
          >
            {/* Header */}
            <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 14, marginBottom: 18 }}>
              <div style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: 1.4,
                textTransform: "uppercase",
                color: "#64748b",
                marginBottom: 4,
              }}>
                Acumulado YTD · Ene–{series[series.length - 1].mes} 2026
              </div>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
                <div style={{ fontSize: 18, fontWeight: 600, color: "#0f172a", letterSpacing: -0.2 }}>
                  % Variable consolidado mes a mes
                </div>
                <div style={{ fontSize: 11, color: "#64748b", fontVariantNumeric: "tabular-nums" }}>
                  Promedio YTD <strong style={{ color: "#0f172a", fontWeight: 600 }}>{promedioYtd.toFixed(1)}%</strong>
                  {" · "}
                  Límite <strong style={{ color: "#0f172a", fontWeight: 600 }}>{limite}%</strong>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div style={{ display: "grid", gridTemplateColumns: "44px 1fr", gap: 8 }}>
              {/* Y axis */}
              <div style={{ position: "relative", height: 220 }}>
                {yTicks.map((y) => (
                  <div
                    key={y}
                    style={{
                      position: "absolute",
                      right: 10,
                      top: `${((yMax - y) / yMax) * 100}%`,
                      transform: "translateY(-50%)",
                      fontSize: 10,
                      color: "#94a3b8",
                      fontVariantNumeric: "tabular-nums",
                    }}
                  >
                    {y}%
                  </div>
                ))}
              </div>

              {/* Plot */}
              <div>
                <div style={{ position: "relative", height: 220 }}>
                  {/* Grid */}
                  {yTicks.map((y) => (
                    <div
                      key={y}
                      style={{
                        position: "absolute",
                        left: 0, right: 0,
                        top: `${((yMax - y) / yMax) * 100}%`,
                        height: 1,
                        background: y === 0 ? "#cbd5e1" : "#f1f5f9",
                      }}
                    />
                  ))}
                  {/* Limit line */}
                  <div
                    style={{
                      position: "absolute",
                      left: 0, right: 0,
                      top: `${((yMax - limite) / yMax) * 100}%`,
                      height: 1,
                      borderTop: "1px dashed #b00020",
                      pointerEvents: "none",
                    }}
                  >
                    <span style={{
                      position: "absolute",
                      right: 0,
                      top: -16,
                      fontSize: 10,
                      color: "#b00020",
                      fontWeight: 500,
                      background: "#fff",
                      padding: "0 6px",
                    }}>
                      Límite · {limite}%
                    </span>
                  </div>
                  {/* Bars */}
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", gap: 18, padding: "0 16px" }}>
                    {series.map((s) => {
                      const exceeds = s.pctVar > limite;
                      const color = exceeds ? "#c2410c" : "#475569";
                      const grad = exceeds
                        ? "linear-gradient(180deg, #ea580c 0%, #c2410c 100%)"
                        : "linear-gradient(180deg, #64748b 0%, #475569 100%)";
                      const heightPct = (s.pctVar / yMax) * 100;
                      return (
                        <div
                          key={s.mes}
                          style={{
                            flex: 1,
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "flex-end",
                            height: "100%",
                            maxWidth: 100,
                            margin: "0 auto",
                          }}
                        >
                          <span style={{
                            color,
                            fontWeight: 600,
                            fontSize: 12,
                            marginBottom: 6,
                            fontVariantNumeric: "tabular-nums",
                          }}>
                            {s.pctVar.toFixed(1)}%
                          </span>
                          <div
                            style={{
                              height: `${heightPct}%`,
                              width: "100%",
                              background: grad,
                              borderRadius: "3px 3px 0 0",
                              minHeight: 2,
                              boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.08)",
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
                {/* X axis */}
                <div style={{ display: "flex", gap: 18, padding: "10px 16px 0" }}>
                  {series.map((s) => (
                    <div
                      key={s.mes}
                      style={{
                        flex: 1,
                        maxWidth: 100,
                        margin: "0 auto",
                        fontSize: 11,
                        textAlign: "center",
                        color: "#475569",
                        fontWeight: 500,
                      }}
                    >
                      {s.mes}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer */}
            <div style={{
              borderTop: "1px solid #f1f5f9",
              marginTop: 16,
              paddingTop: 12,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              fontSize: 10,
              color: "#64748b",
            }}>
              <div style={{ display: "flex", gap: 18 }}>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 10, height: 10, background: "linear-gradient(180deg, #ea580c 0%, #c2410c 100%)", borderRadius: 2 }} />
                  Excede límite (18%)
                </span>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 7 }}>
                  <span style={{ width: 10, height: 10, background: "linear-gradient(180deg, #64748b 0%, #475569 100%)", borderRadius: 2 }} />
                  Dentro de política
                </span>
              </div>
              <div style={{ textTransform: "uppercase", letterSpacing: 1.2, fontSize: 9 }}>
                Fuente · Nómina interna
              </div>
            </div>
          </div>
        );
      })()}

      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Área</th>
            <th style={S.th}>Base</th>
            <th style={S.th}>Comisiones</th>
            <th style={S.th}>Bonos</th>
            <th style={S.th}>Destajos</th>
            <th style={S.th}>Otros</th>
            <th style={S.th}>Total</th>
            <th style={S.th}>Variación neta</th>
            <th style={S.th}>% Cambio</th>
            <th style={S.th}>% Variable</th>
            <th style={S.th}>Límite</th>
            <th style={S.th}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => {
            const c = calc(r);
            const varNeta = c.total - r.prevTotal;
            const pctCambio = (varNeta / r.prevTotal) * 100;
            return (
              <tr key={r.area}>
                <td style={S.td}><strong>{r.area}</strong></td>
                <td style={S.td}>{fmt(r.base)}</td>
                <td style={S.td}>{fmt(r.comisiones)}{arrowOnly(r.comisiones - r.prev.comisiones)}</td>
                <td style={S.td}>{fmt(r.bonos)}{arrowOnly(r.bonos - r.prev.bonos)}</td>
                <td style={S.td}>{fmt(r.destajos)}{arrowOnly(r.destajos - r.prev.destajos)}</td>
                <td style={S.td}>{fmt(r.otros)}{arrowOnly(r.otros - r.prev.otros)}</td>
                <td style={S.td}>{fmt(c.total)}{arrowOnly(c.total - r.prevTotal)}</td>
                <td style={{ ...S.td, ...bbergStyle(varNeta) }}>
                  {fmtK(varNeta)}{arrow(varNeta)}
                </td>
                <td style={{ ...S.td, ...bbergStyle(pctCambio) }}>
                  {pctCambio > 0 ? "+" : pctCambio < 0 ? "−" : ""}
                  {Math.abs(pctCambio).toFixed(2)}%{arrow(pctCambio)}
                </td>
                <td style={S.td}>{c.pctVar.toFixed(1)}%</td>
                <td style={S.td}>{r.limite}%</td>
                <td style={S.td}>
                  {c.exceso ? (
                    <span style={S.badge("#fdecea")}>EXCEDIDO</span>
                  ) : (
                    <span style={S.badge("#e8f5e9")}>OK</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <h3 style={S.h3}>Autorización de Bonos</h3>
      <div style={S.card}>
        <p style={S.hint}>
          Cada bono requiere autorizador, medio de evidencia, y avanza por el workflow de aprobación.
          Arrastra una tarjeta entre columnas para moverla, o usa los botones. Las rechazadas pueden volver al pipeline.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: `repeat(${stages.length}, 1fr)`, gap: 10 }}>
          {stages.map((s) => {
            const cards = bonos.filter((b) => b.stage === s.id);
            const isOver = dragOverStage === s.id;
            return (
              <div
                key={s.id}
                onDragOver={(e) => { e.preventDefault(); if (dragOverStage !== s.id) setDragOverStage(s.id); }}
                onDragLeave={(e) => { if (e.currentTarget === e.target) setDragOverStage(null); }}
                onDrop={() => onDropStage(s.id)}
                style={{
                  background: isOver ? "#eef5ff" : "#f6f6f6",
                  borderRadius: 6,
                  padding: 8,
                  minHeight: 160,
                  outline: isOver ? "2px dashed #2563eb" : "none",
                  outlineOffset: -2,
                  transition: "background 0.12s",
                }}
              >
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#444", marginBottom: 8, display: "flex", justifyContent: "space-between" }}>
                  <span>{s.label}</span>
                  <span style={{ background: "#fff", border: "1px solid #ccc", borderRadius: 10, padding: "0 6px", fontSize: 10 }}>{cards.length}</span>
                </div>
                {cards.map((b) => {
                  const sc = stageColor(b.estado);
                  const isDragging = draggedId === b.id;
                  return (
                    <div
                      key={b.id}
                      draggable
                      onDragStart={(e) => {
                        setDraggedId(b.id);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragEnd={() => { setDraggedId(null); setDragOverStage(null); }}
                      onClick={() => verBono(b)}
                      style={{
                        background: sc.bg,
                        border: `1px solid ${sc.border}`,
                        borderRadius: 5,
                        padding: 8,
                        marginBottom: 6,
                        fontSize: 11,
                        cursor: isDragging ? "grabbing" : "pointer",
                        opacity: isDragging ? 0.45 : 1,
                        boxShadow: isDragging ? "0 4px 12px rgba(0,0,0,0.15)" : "none",
                        userSelect: "none",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                        <strong style={{ fontSize: 12 }}>{b.empleado}</strong>
                        <span style={{ fontWeight: 700 }}>{fmt(b.monto)}</span>
                      </div>
                      <div style={{ color: "#444", marginBottom: 2 }}>{b.area} · {b.tipo}</div>
                      <div style={{ color: "#666", fontSize: 10, marginBottom: 4 }}>
                        Solicita: {b.solicitante} ({b.gerenciaSolicitante})
                      </div>
                      <div style={{ color: "#666", fontSize: 10, marginBottom: 6 }}>
                        Autoriza: {b.autoriza} · {b.medioEvidencia}
                      </div>
                      {b.stage !== "final" ? (
                        <div style={{ display: "flex", gap: 4 }}>
                          <button
                            onClick={(e) => { e.stopPropagation(); avanzar(b.id); }}
                            style={{ flex: 1, fontSize: 10, padding: "4px 6px", border: "1px solid #0a7d2c", background: "#0a7d2c", color: "#fff", borderRadius: 3, cursor: "pointer", fontWeight: 600 }}
                          >
                            ✓ Avanzar
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); rechazar(b.id); }}
                            style={{ flex: 1, fontSize: 10, padding: "4px 6px", border: "1px solid #b00020", background: "#fff", color: "#b00020", borderRadius: 3, cursor: "pointer", fontWeight: 600 }}
                          >
                            ✕ Rechazar
                          </button>
                        </div>
                      ) : (
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          {badgeEstado(b.estado)}
                          {b.estado === "Rechazado" && (
                            <span style={{ fontSize: 10, color: "#666", fontStyle: "italic" }}>arrastra para reabrir</span>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 12 }}>
          <button style={S.btn} onClick={() => setModalOpen(true)}>+ Solicitar bono</button>
        </div>
      </div>

      {modalOpen && (
        <div
          onClick={cerrarModal}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              borderRadius: 8,
              padding: 24,
              width: 720,
              maxWidth: "94vw",
              maxHeight: "92vh",
              overflowY: "auto",
              border: "1px solid #ccc",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>Solicitud de Bono</h3>
              <button
                onClick={cerrarModal}
                style={{ border: "none", background: "transparent", fontSize: 22, cursor: "pointer", color: "#666", lineHeight: 1 }}
                aria-label="Cerrar"
              >
                ×
              </button>
            </div>
            <p style={{ ...S.hint, marginTop: 0, marginBottom: 16 }}>
              Toda solicitud requiere justificación documentada y entra a workflow de aprobación.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
              <div>
                <label style={labelStyle}>Empleado</label>
                <input
                  style={inputStyle}
                  value={form.empleado}
                  onChange={(e) => setForm({ ...form, empleado: e.target.value })}
                  placeholder="Nombre del colaborador"
                />
              </div>
              <div>
                <label style={labelStyle}>Área</label>
                <select
                  style={inputStyle}
                  value={form.area}
                  onChange={(e) => setForm({ ...form, area: e.target.value })}
                >
                  {data.map((d) => (
                    <option key={d.area} value={d.area}>{d.area}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={labelStyle}>Monto ($)</label>
                <input
                  style={inputStyle}
                  type="text"
                  inputMode="decimal"
                  value={form.monto}
                  onChange={(e) => setForm({ ...form, monto: formatMonto(e.target.value) })}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label style={labelStyle}>Tipo</label>
                <select
                  style={inputStyle}
                  value={form.tipo}
                  onChange={(e) => setForm({ ...form, tipo: e.target.value })}
                >
                  {tiposBono.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Justificación (mín. 80 caracteres)</label>
              <textarea
                style={{ ...inputStyle, minHeight: 70, resize: "vertical" }}
                value={form.justificacion}
                onChange={(e) => setForm({ ...form, justificacion: e.target.value })}
                placeholder="Describe el desempeño, contexto y razón del bono."
              />
              <div style={{ fontSize: 11, color: justLen < 80 ? "#b00020" : "#0a7d2c", marginTop: 2 }}>
                {justLen} / 80
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <label style={labelStyle}>Impacto cuantificable</label>
              <input
                style={inputStyle}
                value={form.impacto}
                onChange={(e) => setForm({ ...form, impacto: e.target.value })}
                placeholder="Ej. cuenta cerrada $3.2M, NPS 92, ahorro $450K"
              />
            </div>

            <div style={{ marginBottom: 16 }}>
              <label style={labelStyle}>Evidencia (PDF o link a CRM)</label>
              <div
                onDragOver={(e) => { e.preventDefault(); if (!dragOverFile) setDragOverFile(true); }}
                onDragLeave={(e) => { if (e.currentTarget === e.target) setDragOverFile(false); }}
                onDrop={handleDropFile}
                style={{
                  border: `2px dashed ${dragOverFile ? "#2563eb" : form.evidenciaArchivo ? "#0a7d2c" : "#ccc"}`,
                  borderRadius: 6,
                  padding: 14,
                  textAlign: "center",
                  background: dragOverFile ? "#eef5ff" : form.evidenciaArchivo ? "#f6fbf6" : "#fafafa",
                  fontSize: 12,
                  color: "#444",
                  transition: "all 0.12s",
                }}
              >
                {form.evidenciaArchivo ? (
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 16 }}>📎</span>
                      <strong>{form.evidenciaArchivo}</strong>
                    </span>
                    <button
                      onClick={() => setForm({ ...form, evidenciaArchivo: "" })}
                      style={{ border: "1px solid #ccc", background: "#fff", borderRadius: 3, fontSize: 11, padding: "2px 8px", cursor: "pointer" }}
                    >
                      Quitar
                    </button>
                  </div>
                ) : (
                  <>
                    <div style={{ fontSize: 22, marginBottom: 2 }}>📥</div>
                    <div style={{ fontWeight: 600 }}>Arrastra un PDF aquí</div>
                    <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>(contrato firmado, encuesta NPS, evidencia formal)</div>
                  </>
                )}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "8px 0 4px", fontSize: 11, color: "#888" }}>
                <div style={{ flex: 1, height: 1, background: "#eee" }} />
                <span>o pega un link al CRM</span>
                <div style={{ flex: 1, height: 1, background: "#eee" }} />
              </div>
              <input
                style={inputStyle}
                value={form.evidencia}
                onChange={(e) => setForm({ ...form, evidencia: e.target.value })}
                placeholder="https://crm.empresa.com/oportunidad/..."
              />
            </div>

            {/* Sección: Solicita / Autoriza */}
            <div style={{ borderTop: "1px solid #eee", paddingTop: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: "#222" }}>SOLICITA / AUTORIZA</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={labelStyle}>Solicita (nombre)</label>
                  <input
                    style={inputStyle}
                    value={form.solicitante}
                    onChange={(e) => setForm({ ...form, solicitante: e.target.value })}
                    placeholder="Quien solicita el bono"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Gerencia solicitante</label>
                  <select
                    style={inputStyle}
                    value={form.gerenciaSolicitante}
                    onChange={(e) => setForm({ ...form, gerenciaSolicitante: e.target.value })}
                  >
                    {data.map((d) => (
                      <option key={d.area} value={d.area}>{d.area}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Autoriza (nombre)</label>
                  <input
                    style={inputStyle}
                    value={form.autoriza}
                    onChange={(e) => setForm({ ...form, autoriza: e.target.value })}
                    placeholder="Quien autoriza"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Medio de evidencia</label>
                  <select
                    style={inputStyle}
                    value={form.medioEvidencia}
                    onChange={(e) => setForm({ ...form, medioEvidencia: e.target.value })}
                  >
                    {mediosEvidencia.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#666" }}>
                El medio de evidencia es donde queda registrada la autorización (correo, firma electrónica, memorándum, etc.) para auditoría.
              </div>
            </div>

            {/* Indicadores en vivo */}
            <div style={{ borderTop: "1px solid #eee", paddingTop: 12, marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8, color: "#222" }}>VALIDACIONES EN VIVO</div>

              {/* Semáforo de límite del área */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  border: `1px solid ${semaforoArea === "red" ? "#b00020" : semaforoArea === "yellow" ? "#b58900" : "#ccc"}`,
                  borderRadius: 6,
                  padding: 10,
                  marginBottom: 8,
                  background: semaforoArea === "red" ? "#fdecea" : semaforoArea === "yellow" ? "#fff7e0" : "#f6fbf6",
                }}
              >
                <TrafficLight light={semaforoArea} />
                <div style={{ flex: 1, fontSize: 12 }}>
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>
                    Límite de compensación variable — {form.area}
                  </div>
                  {areaSel && (
                    <>
                      <div>
                        % variable actual: <strong>{((areaSel.comisiones + areaSel.bonos + areaSel.destajos + areaSel.otros) / (areaSel.base + areaSel.comisiones + areaSel.bonos + areaSel.destajos + areaSel.otros) * 100).toFixed(1)}%</strong>
                        {" → con este bono: "}
                        <strong style={{ color: semaforoArea === "red" ? "#b00020" : semaforoArea === "yellow" ? "#b58900" : "#0a7d2c" }}>
                          {newPctVarArea.toFixed(1)}%
                        </strong>
                        {" · Límite autorizado: "}<strong>{areaSel.limite}%</strong>
                      </div>
                      <div style={{ marginTop: 4, fontSize: 11, color: "#444" }}>
                        {semaforoArea === "red" && "⚠ Rebasa el monto autorizado del área. Requiere aprobación adicional."}
                        {semaforoArea === "yellow" && "Se acerca al límite. Revisar antes de autorizar."}
                        {semaforoArea === "green" && montoNum > 0 && "Dentro del rango autorizado."}
                        {montoNum <= 0 && "Captura el monto para validar."}
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Bonos previos del empleado */}
              {bonosDelEmpleado.length > 0 && (
                <div
                  style={{
                    background: bonosDelEmpleado.length >= 2 ? "#fdecea" : "#fff7e0",
                    border: `1px solid ${bonosDelEmpleado.length >= 2 ? "#b00020" : "#b58900"}`,
                    borderRadius: 6,
                    padding: 10,
                    marginBottom: 8,
                    fontSize: 12,
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: 4 }}>
                    {bonosDelEmpleado.length >= 2 ? "⚠ " : "ℹ "}
                    {form.empleado} ya tiene {bonosDelEmpleado.length} bono{bonosDelEmpleado.length > 1 ? "s" : ""} en el sistema · Total previo: {fmt(totalPrevioEmpleado)}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: 18, fontSize: 11, color: "#444" }}>
                    {bonosDelEmpleado.map((b) => (
                      <li key={b.id}>
                        {b.fecha} · {fmt(b.monto)} · {b.tipo} · <em>{b.estado}</em>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Bonos del mes por gerencia solicitante con semáforo */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  background: semaforoGerencia === "red" ? "#fdecea" : semaforoGerencia === "yellow" ? "#fff7e0" : "#f6fbf6",
                  border: `1px solid ${semaforoGerencia === "red" ? "#b00020" : semaforoGerencia === "yellow" ? "#b58900" : "#ccc"}`,
                  borderRadius: 6,
                  padding: 10,
                  marginBottom: 8,
                  fontSize: 12,
                }}
              >
                <TrafficLight light={semaforoGerencia} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, marginBottom: 2 }}>
                    Gerencia "{form.gerenciaSolicitante}" — bonos solicitados este mes
                  </div>
                  <div style={{ marginBottom: warningsGerencia.length > 0 ? 6 : 0 }}>
                    <strong>{bonosGerencia.length}</strong> solicitud{bonosGerencia.length === 1 ? "" : "es"} · Total: <strong>{fmt(totalGerencia)}</strong>
                  </div>
                  {warningsGerencia.length > 0 && (
                    <ul style={{ margin: 0, paddingLeft: 16, fontSize: 11, color: semaforoGerencia === "red" ? "#b00020" : "#7a5a00" }}>
                      {warningsGerencia.map((w, i) => (
                        <li key={i}>{w}</li>
                      ))}
                    </ul>
                  )}
                  {warningsGerencia.length === 0 && (
                    <div style={{ fontSize: 11, color: "#0a7d2c" }}>Dentro de política · sin alertas.</div>
                  )}
                </div>
              </div>

              {/* Workflow stepper */}
              <div style={{ background: "#fff", border: "1px solid #ddd", borderRadius: 6, padding: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 8 }}>Workflow de aprobación requerido</div>
                <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                  {(() => {
                    const n = montoNum;
                    const pasos = ["Solicitud", "Gerente"];
                    if (n >= 25000) pasos.push("Director");
                    if (n > 75000) pasos.push("CEO + RRHH");
                    pasos.push("Final");
                    return pasos.map((p, i) => (
                      <span key={p} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span style={{
                          padding: "4px 10px",
                          borderRadius: 14,
                          background: i === 0 ? "#000" : "#eee",
                          color: i === 0 ? "#fff" : "#333",
                          border: "1px solid #ccc",
                          fontSize: 11,
                          fontWeight: 600,
                        }}>{p}</span>
                        {i < pasos.length - 1 && <span style={{ color: "#999" }}>→</span>}
                      </span>
                    ));
                  })()}
                </div>
                <div style={{ fontSize: 11, color: "#666", marginTop: 6 }}>
                  Según el monto ({fmt(montoNum)}) → {aprobadoresPara(montoNum)}
                </div>
              </div>
            </div>

            {/* Errores */}
            {errores.length > 0 && (
              <ul style={{ background: "#fdecea", border: "1px solid #b00020", borderRadius: 4, padding: "8px 8px 8px 28px", fontSize: 12, color: "#b00020", marginBottom: 12 }}>
                {errores.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            )}

            <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
              <button style={S.btnGhost} onClick={cerrarModal}>Cancelar</button>
              <button
                style={{ ...S.btn, opacity: errores.length > 0 ? 0.4 : 1, cursor: errores.length > 0 ? "not-allowed" : "pointer" }}
                onClick={enviarBono}
                disabled={errores.length > 0}
              >
                Enviar a aprobación
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================
// 2. CLIMA LABORAL
// =============================================================
const INSTRUMENTOS = [
  {
    id: "pulso-rapido",
    name: "Pulso rápido",
    desc: "1-3 preguntas, semanal",
    estDefault: "Activo",
    escala: "1-10",
    preguntas: [
      "¿Cómo te sientes esta semana? (1-10)",
      "¿Tienes lo que necesitas para hacer tu trabajo? (Sí/No)",
      "¿Te sientes reconocido por tu jefe directo? (1-5)",
    ],
    resultado: {
      score: "7.2 / 10",
      respuestas: "168 / 248",
      distribucion: [
        { pregunta: "¿Cómo te sientes esta semana?", barras: [{ label: "1-3", pct: 8 }, { label: "4-6", pct: 22 }, { label: "7-8", pct: 48 }, { label: "9-10", pct: 22 }] },
        { pregunta: "¿Tienes lo que necesitas para tu trabajo?", barras: [{ label: "Sí", pct: 71 }, { label: "No", pct: 29 }] },
        { pregunta: "¿Te sientes reconocido por tu jefe?", barras: [{ label: "1-2", pct: 14 }, { label: "3", pct: 28 }, { label: "4-5", pct: 58 }] },
      ],
    },
  },
  {
    id: "compromiso",
    name: "Encuesta de compromiso",
    desc: "5 preguntas (Engagement)",
    estDefault: "Plantilla",
    escala: "1-5",
    preguntas: [
      "¿Recomendarías a un amigo trabajar aquí? (1-10)",
      "¿Sientes que tu trabajo tiene propósito? (1-5)",
      "¿Tienes oportunidades de crecimiento? (1-5)",
      "¿Confías en el liderazgo de tu área? (1-5)",
      "¿Te sientes respetado por tus compañeros? (1-5)",
    ],
    resultado: {
      score: "7.0 / 10",
      respuestas: "201 / 248",
      distribucion: [
        { pregunta: "¿Recomendarías a un amigo trabajar aquí?", barras: [{ label: "Detractor", pct: 24 }, { label: "Pasivo", pct: 34 }, { label: "Promotor", pct: 42 }] },
        { pregunta: "Propósito en el trabajo", barras: [{ label: "1-2", pct: 12 }, { label: "3", pct: 30 }, { label: "4-5", pct: 58 }] },
        { pregunta: "Oportunidades de crecimiento", barras: [{ label: "1-2", pct: 22 }, { label: "3", pct: 38 }, { label: "4-5", pct: 40 }] },
        { pregunta: "Confianza en liderazgo", barras: [{ label: "1-2", pct: 18 }, { label: "3", pct: 32 }, { label: "4-5", pct: 50 }] },
        { pregunta: "Respeto entre compañeros", barras: [{ label: "1-2", pct: 8 }, { label: "3", pct: 22 }, { label: "4-5", pct: 70 }] },
      ],
    },
  },
  {
    id: "360",
    name: "Evaluación 360°",
    desc: "Multi-evaluador formal",
    estDefault: "Plantilla",
    escala: "1-5",
    soloVer: true,
    preguntas: [
      "Liderazgo y dirección (1-5)",
      "Comunicación efectiva (1-5)",
      "Colaboración y trabajo en equipo (1-5)",
      "Toma de decisiones (1-5)",
      "Desarrollo de talento (1-5)",
      "Resultados y ejecución (1-5)",
    ],
    resultado360: {
      evaluado: "L. Martínez",
      puesto: "Gerente Comercial",
      ciclo: "Q1 2026",
      totalEvaluadores: 8,
      desglose: "1 jefe · 3 pares · 3 equipo · auto",
      escala: 5,
      competencias: [
        { nombre: "Liderazgo y dirección",       auto: 4.0, pares: 3.9, equipo: 4.2, jefe: 4.1 },
        { nombre: "Comunicación efectiva",       auto: 3.9, pares: 4.1, equipo: 3.75, jefe: 4.0 },
        { nombre: "Colaboración y trabajo en equipo", auto: 4.2, pares: 4.4, equipo: 4.3, jefe: 4.25 },
        { nombre: "Toma de decisiones",          auto: 4.4, pares: 3.7, equipo: 3.5, jefe: 3.9 },
        { nombre: "Desarrollo de talento",       auto: 3.5, pares: 3.9, equipo: 4.2, jefe: 4.0 },
        { nombre: "Resultados y ejecución",      auto: 4.3, pares: 4.2, equipo: 4.1, jefe: 4.4 },
      ],
      comentarios: [
        { rater: "Pares", texto: "Excelente para alinear al equipo en momentos críticos. Podría delegar más decisiones operativas." },
        { rater: "Equipo", texto: "Es accesible y nos respalda con dirección. Nos gustaría tener más espacio para proponer iniciativas." },
        { rater: "Jefe", texto: "Sólida ejecución comercial. Trabajar en visión a 12-18 meses, no solo trimestre." },
      ],
    },
  },
  {
    id: "salida",
    name: "Encuesta de salida",
    desc: "Exit interview estructurada",
    estDefault: "Plantilla",
    escala: "abiertas",
    individual: true,
    preguntas: [
      "Razón principal de salida",
      "¿Recomendarías a un amigo trabajar aquí? (1-10)",
      "¿Qué pudo haber sido mejor?",
      "¿Cómo fue tu relación con tu jefe directo? (1-5)",
      "¿Recibiste el onboarding y desarrollo esperados? (Sí/No)",
    ],
    resultado: {
      score: "6.4 / 10",
      respuestas: "12 / 12",
      distribucion: [
        { pregunta: "Razón principal de salida", barras: [{ label: "Sueldo", pct: 33 }, { label: "Jefe", pct: 25 }, { label: "Crecimiento", pct: 25 }, { label: "Otro", pct: 17 }] },
        { pregunta: "¿Recomendarías la empresa?", barras: [{ label: "Detractor", pct: 42 }, { label: "Pasivo", pct: 33 }, { label: "Promotor", pct: 25 }] },
        { pregunta: "Relación con jefe directo", barras: [{ label: "1-2", pct: 25 }, { label: "3", pct: 33 }, { label: "4-5", pct: 42 }] },
        { pregunta: "¿Onboarding adecuado?", barras: [{ label: "Sí", pct: 58 }, { label: "No", pct: 42 }] },
      ],
    },
    casoEjemplo: {
      empleado: "M. Hernández",
      area: "Comercial",
      puesto: "Ejecutivo de cuenta sr.",
      jefe: "L. Martínez",
      fechaIngreso: "2023-08-15",
      fechaBaja: "2026-04-18",
      antiguedad: "2 años 8 meses",
      razonPrelim: "Sueldo / compensación",
      enviadaPor: "Correo",
      estado: "Completada",
      scoreCaso: "6 / 10",
      respuestas: [
        { pregunta: "Razón principal de salida", respuesta: "Recibí una oferta con +30% de compensación y mejores prestaciones." },
        { pregunta: "¿Recomendarías a un amigo trabajar aquí? (1-10)", respuesta: "6 — Equipo bueno, pero el techo salarial es bajo y los aumentos llegan tarde." },
        { pregunta: "¿Qué pudo haber sido mejor?", respuesta: "Plan de carrera más claro, rangos salariales públicos y promociones con base en evidencia, no en antigüedad." },
        { pregunta: "¿Cómo fue tu relación con tu jefe directo? (1-5)", respuesta: "4 — Me apoyó en momentos clave; me hubiera gustado más feedback frecuente." },
        { pregunta: "¿Recibiste el onboarding y desarrollo esperados?", respuesta: "Onboarding sí. Desarrollo parcial — capacitación formal nunca arrancó tras el primer año." },
      ],
      alertas: ["3ª salida de Comercial este Q por motivo salarial — escalar a Compensaciones para revisar banda."],
    },
  },
  {
    id: "bienvenida",
    name: "Encuesta de bienvenida",
    desc: "Día 30 / 60 / 90",
    estDefault: "Plantilla",
    escala: "1-5",
    individual: true,
    preguntas: [
      "¿Qué tan bien recibiste el onboarding? (1-5)",
      "¿Tienes claridad de tu rol y objetivos? (1-5)",
      "¿Tu equipo te ha hecho sentir bienvenido? (1-5)",
      "¿Tienes las herramientas que necesitas? (Sí/No)",
      "¿Recomendarías unirse a la empresa? (1-10)",
    ],
    resultado: {
      score: "4.2 / 5",
      respuestas: "18 / 22",
      distribucion: [
        { pregunta: "Onboarding", barras: [{ label: "1-2", pct: 6 }, { label: "3", pct: 22 }, { label: "4-5", pct: 72 }] },
        { pregunta: "Claridad de rol", barras: [{ label: "1-2", pct: 11 }, { label: "3", pct: 28 }, { label: "4-5", pct: 61 }] },
        { pregunta: "Sentirse bienvenido", barras: [{ label: "1-2", pct: 0 }, { label: "3", pct: 17 }, { label: "4-5", pct: 83 }] },
        { pregunta: "¿Tienes herramientas?", barras: [{ label: "Sí", pct: 78 }, { label: "No", pct: 22 }] },
        { pregunta: "¿Recomendarías?", barras: [{ label: "Detractor", pct: 11 }, { label: "Pasivo", pct: 28 }, { label: "Promotor", pct: 61 }] },
      ],
    },
    casoEjemplo: {
      empleado: "J. Castillo",
      area: "Comercial",
      puesto: "Ejecutivo de cuenta jr.",
      jefe: "L. Martínez",
      fechaIngreso: "2026-02-14",
      checkpoint: "Día 60",
      enviadaPor: "WhatsApp",
      estado: "Completada",
      scoreCaso: "4.0 / 5",
      respuestas: [
        { pregunta: "¿Qué tan bien recibiste el onboarding? (1-5)", respuesta: "4 — Buen recibimiento del equipo, materiales claros." },
        { pregunta: "¿Tienes claridad de tu rol y objetivos? (1-5)", respuesta: "3 — Las cuotas cambiaron 2 veces en los primeros 30 días, eso confunde." },
        { pregunta: "¿Tu equipo te ha hecho sentir bienvenido? (1-5)", respuesta: "5 — El equipo me adoptó desde el día 1, muy buen ambiente." },
        { pregunta: "¿Tienes las herramientas que necesitas?", respuesta: "No — Acceso parcial al CRM y falta licencia de Sales Navigator." },
        { pregunta: "¿Recomendarías unirse a la empresa? (1-10)", respuesta: "8" },
      ],
      alertas: ["Falta licencia de Sales Navigator — ticket #4521 abierto con TI hace 45 días."],
    },
  },
  {
    id: "eventos",
    name: "Pulso de eventos",
    desc: "Tras cambio importante",
    estDefault: "Plantilla",
    escala: "1-5",
    preguntas: [
      "¿Qué tan bien entiendes el cambio? (1-5)",
      "¿Cómo te sientes respecto al cambio? (1-5)",
      "¿Tienes el apoyo que necesitas? (Sí/No)",
      "¿Qué te preocupa más? (abierta)",
    ],
    resultado: {
      score: "3.6 / 5",
      respuestas: "182 / 248",
      distribucion: [
        { pregunta: "Comprensión del cambio", barras: [{ label: "1-2", pct: 18 }, { label: "3", pct: 35 }, { label: "4-5", pct: 47 }] },
        { pregunta: "Sentir sobre el cambio", barras: [{ label: "1-2", pct: 22 }, { label: "3", pct: 40 }, { label: "4-5", pct: 38 }] },
        { pregunta: "Apoyo recibido", barras: [{ label: "Sí", pct: 62 }, { label: "No", pct: 38 }] },
      ],
    },
  },
];

const AREAS_LIST = ["Toda la empresa", "Comercial", "Posventa", "Operaciones", "Administración", "Dirección"];

function Clima() {
  const [modal, setModal] = useState({ open: false, instrumento: null, mode: null });
  const [audiencia, setAudiencia] = useState("Toda la empresa");
  const fechaHoy = new Date().toISOString().slice(0, 10);
  const fechaPlus7 = new Date(Date.now() + 7 * 86400000).toISOString().slice(0, 10);
  const [fechaLimite, setFechaLimite] = useState(fechaPlus7);
  const [recordatorio, setRecordatorio] = useState(true);
  const [anonima, setAnonima] = useState(true);
  const [preguntasEditadas, setPreguntasEditadas] = useState([]);
  const [editingIdx, setEditingIdx] = useState(null);
  const [editDraft, setEditDraft] = useState("");
  const [toastChannel, setToastChannel] = useState(null);
  const [empleadoForm, setEmpleadoForm] = useState({
    nombre: "",
    area: "Comercial",
    puesto: "",
    jefe: "",
    fechaIngreso: "",
    fechaBaja: "",
    razonPrelim: "Sueldo / compensación",
    checkpoint: "Día 30",
  });
  const [lanzamientos, setLanzamientos] = useState([
    { id: 1, instrumentoId: "pulso-rapido", instrumentoName: "Pulso semanal · S17", fecha: "21-abr", respuestas: "168/248", score: "7.2" },
    { id: 2, instrumentoId: "salida", instrumentoName: "Salida · M. Hernández", fecha: "18-abr", respuestas: "1/1", score: "—" },
    { id: 3, instrumentoId: "compromiso", instrumentoName: "Compromiso Q1", fecha: "03-mar", respuestas: "201/248", score: "7.0" },
  ]);

  const abrirModal = (instrumento, mode) => {
    setAudiencia("Toda la empresa");
    setFechaLimite(fechaPlus7);
    setRecordatorio(true);
    setAnonima(true);
    setPreguntasEditadas([...instrumento.preguntas]);
    setEditingIdx(null);
    setEditDraft("");
    setToastChannel(null);
    setEmpleadoForm({
      nombre: "",
      area: "Comercial",
      puesto: "",
      jefe: "",
      fechaIngreso: "",
      fechaBaja: instrumento.id === "salida" ? fechaHoy : "",
      razonPrelim: "Sueldo / compensación",
      checkpoint: "Día 30",
    });
    setModal({ open: true, instrumento, mode });
  };
  const cerrarModal = () => {
    setEditingIdx(null);
    setEditDraft("");
    setToastChannel(null);
    setModal({ open: false, instrumento: null, mode: null });
  };

  const iniciarEdicion = (idx) => {
    setEditingIdx(idx);
    setEditDraft(preguntasEditadas[idx]);
  };
  const guardarEdicion = () => {
    if (editingIdx === null) return;
    const texto = editDraft.trim();
    if (!texto) { setEditingIdx(null); return; }
    setPreguntasEditadas((prev) => prev.map((p, i) => (i === editingIdx ? texto : p)));
    setEditingIdx(null);
    setEditDraft("");
  };
  const cancelarEdicion = () => {
    setEditingIdx(null);
    setEditDraft("");
  };

  const camposIndividualValidos = () => {
    if (!modal.instrumento?.individual) return true;
    if (!empleadoForm.nombre.trim()) return false;
    if (!empleadoForm.jefe.trim()) return false;
    if (modal.instrumento.id === "bienvenida" && !empleadoForm.fechaIngreso) return false;
    if (modal.instrumento.id === "salida" && !empleadoForm.fechaBaja) return false;
    return true;
  };

  const lanzar = (canal) => {
    const ins = modal.instrumento;
    if (ins.individual && !camposIndividualValidos()) return;
    const fechaCorta = fechaHoy.slice(5).replace("-", "-") + "";
    const dia = fechaCorta.split("-")[1];
    const mesAbbr = ["ene","feb","mar","abr","may","jun","jul","ago","sep","oct","nov","dic"][parseInt(fechaCorta.split("-")[0], 10) - 1];
    let sufijo;
    if (ins.individual) {
      const detalle = ins.id === "bienvenida" ? ` (${empleadoForm.checkpoint})` : "";
      sufijo = ` · ${empleadoForm.nombre.trim()}${detalle}`;
    } else {
      sufijo = audiencia === "Toda la empresa" ? "" : ` · ${audiencia}`;
    }
    const canalLbl = canal === "whatsapp" ? " (WhatsApp)" : canal === "correo" ? " (Correo)" : "";
    setLanzamientos((prev) => [
      {
        id: Date.now(),
        instrumentoId: ins.id,
        instrumentoName: `${ins.name}${sufijo}${canalLbl}`,
        fecha: `${dia}-${mesAbbr}`,
        respuestas: "0/—",
        score: "Pendiente",
      },
      ...prev,
    ]);
    if (canal) {
      setToastChannel(canal);
      setTimeout(() => { cerrarModal(); }, 1200);
    } else {
      cerrarModal();
    }
  };

  const esActivo = (ins) => ins.estDefault === "Activo" || lanzamientos.some((l) => l.instrumentoId === ins.id && l.score === "Pendiente");

  return (
    <div>
      <h2 style={S.h2}>2. Clima Laboral</h2>
      <p style={S.hint}>Diagnósticos rápidos, 360° formal y encuestas de salida — todo en un solo lugar.</p>

      <div style={S.grid3}>
        <div style={S.kpi}>
          <div style={S.kpiLabel}>Pulso semanal (último)</div>
          <div style={S.kpiValue}>7.2 / 10</div>
          <div style={S.kpiDelta(true)}>+0.3 vs semana anterior</div>
        </div>
        <div style={S.kpi}>
          <div style={S.kpiLabel}>eNPS</div>
          <div style={S.kpiValue}>+18</div>
          <div style={S.kpiDelta(false)}>Promotores 42% / Detractores 24%</div>
        </div>
        <div style={S.kpi}>
          <div style={S.kpiLabel}>Tasa de respuesta</div>
          <div style={S.kpiValue}>68%</div>
          <div style={S.kpiDelta(true)}>168 / 248 colaboradores</div>
        </div>
      </div>

      <h3 style={S.h3}>Tipos de instrumento</h3>
      <div style={S.grid3}>
        {INSTRUMENTOS.map((i) => {
          const activo = esActivo(i);
          return (
            <div key={i.id} style={S.card}>
              <div style={{ fontWeight: 700, marginBottom: 4 }}>{i.name}</div>
              <div style={S.hint}>{i.desc}</div>
              <span style={S.badge(activo ? "#e8f5e9" : "#eee")}>{activo ? "Activo" : "Plantilla"}</span>
              <div style={{ marginTop: 12, display: "flex", gap: 6 }}>
                {!i.soloVer && <button style={S.btn} onClick={() => abrirModal(i, "lanzar")}>Lanzar</button>}
                <button style={i.soloVer ? S.btn : S.btnGhost} onClick={() => abrirModal(i, "ver")}>Ver resultados</button>
              </div>
            </div>
          );
        })}
      </div>

      <h3 style={S.h3}>Resultados recientes</h3>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Instrumento</th>
            <th style={S.th}>Lanzado</th>
            <th style={S.th}>Respuestas</th>
            <th style={S.th}>Score</th>
            <th style={S.th}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {lanzamientos.map((l) => {
            const ins = INSTRUMENTOS.find((x) => x.id === l.instrumentoId);
            return (
              <tr key={l.id}>
                <td style={S.td}>{l.instrumentoName}</td>
                <td style={S.td}>{l.fecha}</td>
                <td style={S.td}>{l.respuestas}</td>
                <td style={S.td}>{l.score}</td>
                <td style={S.td}>
                  <button style={S.btnGhost} onClick={() => ins && abrirModal(ins, "ver")}>Ver</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {modal.open && modal.instrumento && (
        <div
          onClick={cerrarModal}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 8, padding: 24,
              width: 680, maxWidth: "94vw", maxHeight: "92vh", overflowY: "auto",
              border: "1px solid #ccc",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
              <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                {modal.instrumento.name} — {modal.mode === "lanzar" ? "Lanzar" : "Resultados"}
              </h3>
              <button
                onClick={cerrarModal}
                style={{ border: "none", background: "transparent", fontSize: 22, cursor: "pointer", color: "#666", lineHeight: 1 }}
                aria-label="Cerrar"
              >×</button>
            </div>
            <p style={{ ...S.hint, marginTop: 0, marginBottom: 16 }}>{modal.instrumento.desc}</p>

            {modal.mode === "lanzar" && (
              <>
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#666", marginBottom: 6 }}>
                    Preguntas ({preguntasEditadas.length})
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {preguntasEditadas.map((p, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                        <span style={{ color: "#666", minWidth: 16 }}>{i + 1}.</span>
                        {editingIdx === i ? (
                          <>
                            <input
                              type="text"
                              value={editDraft}
                              onChange={(e) => setEditDraft(e.target.value)}
                              onKeyDown={(e) => { if (e.key === "Enter") guardarEdicion(); if (e.key === "Escape") cancelarEdicion(); }}
                              autoFocus
                              style={{ flex: 1, padding: "6px 8px", border: "1px solid #2563eb", borderRadius: 4, fontSize: 13 }}
                            />
                            <button
                              onClick={guardarEdicion}
                              style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.4, padding: "5px 9px", border: "1px solid #0a7d2c", background: "#0a7d2c", color: "#fff", borderRadius: 3, cursor: "pointer" }}
                            >GUARDAR</button>
                            <button
                              onClick={cancelarEdicion}
                              style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.4, padding: "5px 9px", border: "1px solid #ccc", background: "#fff", color: "#666", borderRadius: 3, cursor: "pointer" }}
                            >CANCELAR</button>
                          </>
                        ) : (
                          <>
                            <span style={{ flex: 1 }}>{p}</span>
                            <button
                              onClick={() => iniciarEdicion(i)}
                              style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.4, padding: "5px 9px", border: "1px solid #ccc", background: "#fff", color: "#333", borderRadius: 3, cursor: "pointer" }}
                            >EDITAR</button>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {modal.instrumento.individual && (() => {
                  const labelStyle = { fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#666", marginBottom: 4 };
                  const inputStyle = { width: "100%", padding: "8px 10px", border: "1px solid #ccc", borderRadius: 4, fontSize: 13, boxSizing: "border-box" };
                  const setF = (k, v) => setEmpleadoForm((prev) => ({ ...prev, [k]: v }));
                  const areasEmpresa = ["Comercial", "Posventa", "Operaciones", "Administración", "Dirección"];
                  return (
                    <div style={{ border: "1px solid #e2e8f0", borderRadius: 6, padding: 14, marginBottom: 14, background: "#f8fafc" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#0f172a", marginBottom: 10 }}>
                        Datos del empleado
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 10 }}>
                        <div>
                          <div style={labelStyle}>Nombre del empleado *</div>
                          <input
                            type="text"
                            value={empleadoForm.nombre}
                            onChange={(e) => setF("nombre", e.target.value)}
                            placeholder="Nombre completo"
                            style={inputStyle}
                          />
                        </div>
                        <div>
                          <div style={labelStyle}>Área *</div>
                          <select
                            value={empleadoForm.area}
                            onChange={(e) => setF("area", e.target.value)}
                            style={inputStyle}
                          >
                            {areasEmpresa.map((a) => <option key={a} value={a}>{a}</option>)}
                          </select>
                        </div>
                        <div>
                          <div style={labelStyle}>Puesto</div>
                          <input
                            type="text"
                            value={empleadoForm.puesto}
                            onChange={(e) => setF("puesto", e.target.value)}
                            placeholder="Ej. Ejecutivo de cuenta"
                            style={inputStyle}
                          />
                        </div>
                        <div>
                          <div style={labelStyle}>Jefe directo *</div>
                          <input
                            type="text"
                            value={empleadoForm.jefe}
                            onChange={(e) => setF("jefe", e.target.value)}
                            placeholder="Nombre del jefe"
                            style={inputStyle}
                          />
                        </div>
                        <div>
                          <div style={labelStyle}>Fecha de ingreso{modal.instrumento.id === "bienvenida" ? " *" : ""}</div>
                          <input
                            type="date"
                            value={empleadoForm.fechaIngreso}
                            onChange={(e) => setF("fechaIngreso", e.target.value)}
                            style={inputStyle}
                          />
                        </div>
                        {modal.instrumento.id === "salida" && (
                          <>
                            <div>
                              <div style={labelStyle}>Fecha de baja *</div>
                              <input
                                type="date"
                                value={empleadoForm.fechaBaja}
                                onChange={(e) => setF("fechaBaja", e.target.value)}
                                style={inputStyle}
                              />
                            </div>
                            <div style={{ gridColumn: "1 / -1" }}>
                              <div style={labelStyle}>Razón preliminar de salida</div>
                              <select
                                value={empleadoForm.razonPrelim}
                                onChange={(e) => setF("razonPrelim", e.target.value)}
                                style={inputStyle}
                              >
                                {["Sueldo / compensación", "Crecimiento / desarrollo", "Jefe directo", "Carga / balance", "Cambio personal", "Otra oferta", "Otra"].map((r) => (
                                  <option key={r} value={r}>{r}</option>
                                ))}
                              </select>
                            </div>
                          </>
                        )}
                        {modal.instrumento.id === "bienvenida" && (
                          <div>
                            <div style={labelStyle}>Checkpoint *</div>
                            <select
                              value={empleadoForm.checkpoint}
                              onChange={(e) => setF("checkpoint", e.target.value)}
                              style={inputStyle}
                            >
                              {["Día 30", "Día 60", "Día 90"].map((c) => <option key={c} value={c}>{c}</option>)}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
                  {!modal.instrumento.individual && (
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#666", marginBottom: 4 }}>
                        Audiencia
                      </div>
                      <select
                        value={audiencia}
                        onChange={(e) => setAudiencia(e.target.value)}
                        style={{ width: "100%", padding: "8px 10px", border: "1px solid #ccc", borderRadius: 4, fontSize: 13 }}
                      >
                        {AREAS_LIST.map((a) => <option key={a} value={a}>{a}</option>)}
                      </select>
                    </div>
                  )}
                  <div style={modal.instrumento.individual ? { gridColumn: "1 / -1" } : undefined}>
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#666", marginBottom: 4 }}>
                      Fecha límite
                    </div>
                    <input
                      type="date"
                      value={fechaLimite}
                      onChange={(e) => setFechaLimite(e.target.value)}
                      style={{ width: "100%", padding: "8px 10px", border: "1px solid #ccc", borderRadius: 4, fontSize: 13, boxSizing: "border-box" }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", gap: 16, marginBottom: 16, fontSize: 13 }}>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input type="checkbox" checked={anonima} onChange={(e) => setAnonima(e.target.checked)} />
                    Respuestas anónimas
                  </label>
                  <label style={{ display: "inline-flex", alignItems: "center", gap: 6, cursor: "pointer" }}>
                    <input type="checkbox" checked={recordatorio} onChange={(e) => setRecordatorio(e.target.checked)} />
                    Enviar recordatorio a los 3 días
                  </label>
                </div>

                {toastChannel && (
                  <div style={{
                    background: "#e8f5e9",
                    border: "1px solid #0a7d2c",
                    color: "#0a7d2c",
                    fontSize: 13,
                    fontWeight: 600,
                    padding: "10px 12px",
                    borderRadius: 4,
                    marginBottom: 12,
                  }}>
                    {(() => {
                      const destinatario = modal.instrumento.individual ? empleadoForm.nombre : audiencia;
                      if (toastChannel === "whatsapp") return `Encuesta enviada por WhatsApp a ${destinatario}`;
                      if (toastChannel === "correo") return `Encuesta enviada por correo a ${destinatario}`;
                      return null;
                    })()}
                  </div>
                )}

                {modal.instrumento.individual && !camposIndividualValidos() && (
                  <div style={{ fontSize: 12, color: "#b00020", marginBottom: 10 }}>
                    Completa los campos obligatorios (*) para enviar.
                  </div>
                )}

                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", justifyContent: "flex-end", borderTop: "1px solid #eee", paddingTop: 12 }}>
                  <button style={S.btnGhost} onClick={cerrarModal}>Cancelar</button>
                  <button
                    onClick={() => lanzar("correo")}
                    disabled={modal.instrumento.individual && !camposIndividualValidos()}
                    style={{
                      ...S.btnGhost,
                      borderColor: "#1e40af",
                      color: "#1e40af",
                      fontWeight: 700,
                      opacity: modal.instrumento.individual && !camposIndividualValidos() ? 0.4 : 1,
                      cursor: modal.instrumento.individual && !camposIndividualValidos() ? "not-allowed" : "pointer",
                    }}
                  >Enviar por correo</button>
                  <button
                    onClick={() => lanzar("whatsapp")}
                    disabled={modal.instrumento.individual && !camposIndividualValidos()}
                    style={{
                      ...S.btnGhost,
                      borderColor: "#0a7d2c",
                      color: "#0a7d2c",
                      fontWeight: 700,
                      opacity: modal.instrumento.individual && !camposIndividualValidos() ? 0.4 : 1,
                      cursor: modal.instrumento.individual && !camposIndividualValidos() ? "not-allowed" : "pointer",
                    }}
                  >Enviar por WhatsApp</button>
                  <button
                    onClick={() => lanzar(null)}
                    disabled={modal.instrumento.individual && !camposIndividualValidos()}
                    style={{
                      ...S.btn,
                      opacity: modal.instrumento.individual && !camposIndividualValidos() ? 0.4 : 1,
                      cursor: modal.instrumento.individual && !camposIndividualValidos() ? "not-allowed" : "pointer",
                    }}
                  >Lanzar (link directo)</button>
                </div>
              </>
            )}

            {modal.mode === "ver" && modal.instrumento.id === "360" && (() => {
              const r = modal.instrumento.resultado360;
              const raters = [
                { key: "auto",   label: "Auto",   color: "#475569", grad: "linear-gradient(180deg, #94a3b8 0%, #64748b 100%)" },
                { key: "pares",  label: "Pares",  color: "#0f172a", grad: "linear-gradient(180deg, #334155 0%, #1e293b 100%)" },
                { key: "equipo", label: "Equipo", color: "#7c2d12", grad: "linear-gradient(180deg, #c2410c 0%, #9a3412 100%)" },
                { key: "jefe",   label: "Jefe",   color: "#3f3f46", grad: "linear-gradient(180deg, #52525b 0%, #3f3f46 100%)" },
              ];
              const avgOtros = (c) => (c.pares + c.equipo + c.jefe) / 3;
              const promedioGlobal = (
                r.competencias.reduce((a, c) => a + (c.auto + c.pares + c.equipo + c.jefe) / 4, 0) / r.competencias.length
              );
              const fortalezas = [...r.competencias]
                .filter((c) => avgOtros(c) >= 4.0)
                .sort((a, b) => avgOtros(b) - avgOtros(a));
              const puntosCiegos = [...r.competencias]
                .map((c) => ({ ...c, gap: c.auto - avgOtros(c) }))
                .filter((c) => c.gap >= 0.3)
                .sort((a, b) => b.gap - a.gap);
              const fortalezasOcultas = [...r.competencias]
                .map((c) => ({ ...c, gap: avgOtros(c) - c.auto }))
                .filter((c) => c.gap >= 0.3)
                .sort((a, b) => b.gap - a.gap);
              return (
                <>
                  {/* Header */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid #e2e8f0" }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{r.evaluado}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{r.puesto} · {r.ciclo}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 11, color: "#64748b", textTransform: "uppercase", letterSpacing: 0.8 }}>Promedio global</div>
                      <div style={{ fontSize: 22, fontWeight: 700, color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>{promedioGlobal.toFixed(2)} / {r.escala}</div>
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 18 }}>
                    <div style={S.kpi}>
                      <div style={S.kpiLabel}>Evaluadores</div>
                      <div style={S.kpiValue}>{r.totalEvaluadores}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{r.desglose}</div>
                    </div>
                    <div style={S.kpi}>
                      <div style={S.kpiLabel}>Competencias evaluadas</div>
                      <div style={S.kpiValue}>{r.competencias.length}</div>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>Escala 1–{r.escala}</div>
                    </div>
                  </div>

                  {/* Legend */}
                  <div style={{ display: "flex", gap: 14, marginBottom: 10, flexWrap: "wrap" }}>
                    {raters.map((rt) => (
                      <span key={rt.key} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, color: "#475569" }}>
                        <span style={{ width: 12, height: 12, background: rt.grad, borderRadius: 2 }} />
                        {rt.label}
                      </span>
                    ))}
                  </div>

                  {/* Competency table */}
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#666", marginBottom: 10 }}>
                    Competencias por grupo de evaluador
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 16, marginBottom: 18 }}>
                    {r.competencias.map((c, idx) => {
                      const avgC = (c.auto + c.pares + c.equipo + c.jefe) / 4;
                      return (
                        <div key={idx}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#0f172a" }}>{c.nombre}</div>
                            <div style={{ fontSize: 11, color: "#64748b", fontVariantNumeric: "tabular-nums" }}>
                              Prom <strong style={{ color: "#0f172a" }}>{avgC.toFixed(2)}</strong>
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
                            {raters.map((rt) => {
                              const val = c[rt.key];
                              const widthPct = (val / r.escala) * 100;
                              return (
                                <div key={rt.key} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
                                  <div style={{ width: 60, color: "#475569" }}>{rt.label}</div>
                                  <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 3, height: 14, position: "relative", overflow: "hidden" }}>
                                    <div
                                      style={{
                                        width: `${widthPct}%`,
                                        height: "100%",
                                        background: rt.grad,
                                        borderRadius: 3,
                                      }}
                                    />
                                  </div>
                                  <div style={{ width: 48, textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: rt.color }}>{val.toFixed(2)}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Gap analysis */}
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#666", marginBottom: 10 }}>
                    Brechas Auto vs. Otros
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 16 }}>
                    <div style={{ border: "1px solid #e2e8f0", borderRadius: 6, padding: 12, background: "#f8fafc" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#0a7d2c", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Fortalezas</div>
                      <div style={{ fontSize: 10, color: "#64748b", marginBottom: 8 }}>Otros la valoran ≥ 4.0</div>
                      {fortalezas.length === 0 ? (
                        <div style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>Sin competencias en este rango.</div>
                      ) : fortalezas.map((c, i) => (
                        <div key={i} style={{ fontSize: 12, marginBottom: 4 }}>
                          <strong>{c.nombre}</strong>
                          <span style={{ color: "#64748b", fontVariantNumeric: "tabular-nums" }}> · {avgOtros(c).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ border: "1px solid #e2e8f0", borderRadius: 6, padding: 12, background: "#f8fafc" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#c2410c", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Puntos ciegos</div>
                      <div style={{ fontSize: 10, color: "#64748b", marginBottom: 8 }}>Auto &gt; Otros (sobreestima)</div>
                      {puntosCiegos.length === 0 ? (
                        <div style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>Sin brechas significativas.</div>
                      ) : puntosCiegos.map((c, i) => (
                        <div key={i} style={{ fontSize: 12, marginBottom: 4 }}>
                          <strong>{c.nombre}</strong>
                          <span style={{ color: "#64748b", fontVariantNumeric: "tabular-nums" }}> · gap +{c.gap.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ border: "1px solid #e2e8f0", borderRadius: 6, padding: 12, background: "#f8fafc" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Fortalezas ocultas</div>
                      <div style={{ fontSize: 10, color: "#64748b", marginBottom: 8 }}>Auto &lt; Otros (subestima)</div>
                      {fortalezasOcultas.length === 0 ? (
                        <div style={{ fontSize: 12, color: "#94a3b8", fontStyle: "italic" }}>Sin brechas significativas.</div>
                      ) : fortalezasOcultas.map((c, i) => (
                        <div key={i} style={{ fontSize: 12, marginBottom: 4 }}>
                          <strong>{c.nombre}</strong>
                          <span style={{ color: "#64748b", fontVariantNumeric: "tabular-nums" }}> · gap +{c.gap.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Comments */}
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#666", marginBottom: 10 }}>
                    Comentarios cualitativos
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                    {r.comentarios.map((co, i) => (
                      <div key={i} style={{ borderLeft: "3px solid #cbd5e1", padding: "6px 10px", background: "#f8fafc", fontSize: 12 }}>
                        <div style={{ fontWeight: 700, fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>{co.rater}</div>
                        <div style={{ color: "#0f172a" }}>"{co.texto}"</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", borderTop: "1px solid #eee", paddingTop: 12 }}>
                    <button style={S.btn} onClick={cerrarModal}>Cerrar</button>
                  </div>
                </>
              );
            })()}

            {modal.mode === "ver" && modal.instrumento.individual && modal.instrumento.casoEjemplo && (() => {
              const c = modal.instrumento.casoEjemplo;
              const esBaja = modal.instrumento.id === "salida";
              return (
                <>
                  {/* Header del caso */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 14, paddingBottom: 12, borderBottom: "1px solid #e2e8f0" }}>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 700, color: "#0f172a" }}>{c.empleado}</div>
                      <div style={{ fontSize: 12, color: "#64748b" }}>{c.puesto} · {c.area} · Jefe: {c.jefe}</div>
                    </div>
                    <div style={{ textAlign: "right" }}>
                      <span style={{ ...S.badge("#e8f5e9"), fontSize: 11 }}>{c.estado}</span>
                      <div style={{ fontSize: 11, color: "#64748b", marginTop: 4 }}>Enviada por {c.enviadaPor}</div>
                    </div>
                  </div>

                  {/* Datos del caso */}
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 16 }}>
                    <div style={S.kpi}>
                      <div style={S.kpiLabel}>Ingreso</div>
                      <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{c.fechaIngreso}</div>
                    </div>
                    {esBaja ? (
                      <>
                        <div style={S.kpi}>
                          <div style={S.kpiLabel}>Baja</div>
                          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{c.fechaBaja}</div>
                          <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{c.antiguedad}</div>
                        </div>
                        <div style={S.kpi}>
                          <div style={S.kpiLabel}>Razón preliminar</div>
                          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{c.razonPrelim}</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <div style={S.kpi}>
                          <div style={S.kpiLabel}>Checkpoint</div>
                          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{c.checkpoint}</div>
                        </div>
                        <div style={S.kpi}>
                          <div style={S.kpiLabel}>Score</div>
                          <div style={{ fontSize: 14, fontWeight: 700, marginTop: 2 }}>{c.scoreCaso}</div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Respuestas */}
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#666", marginBottom: 10 }}>
                    Respuestas del empleado
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
                    {c.respuestas.map((qa, i) => (
                      <div key={i} style={{ border: "1px solid #e2e8f0", borderRadius: 6, padding: "10px 12px", background: "#f8fafc" }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#475569", textTransform: "uppercase", letterSpacing: 0.4, marginBottom: 4 }}>
                          {i + 1}. {qa.pregunta}
                        </div>
                        <div style={{ fontSize: 13, color: "#0f172a", lineHeight: 1.5 }}>"{qa.respuesta}"</div>
                      </div>
                    ))}
                  </div>

                  {/* Alertas / acciones */}
                  {c.alertas && c.alertas.length > 0 && (
                    <>
                      <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#666", marginBottom: 8 }}>
                        Alertas y acciones sugeridas
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 16 }}>
                        {c.alertas.map((a, i) => (
                          <div key={i} style={{ borderLeft: "3px solid #c2410c", background: "#fff7ed", padding: "8px 12px", fontSize: 12, color: "#7c2d12" }}>
                            {a}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", borderTop: "1px solid #eee", paddingTop: 12 }}>
                    <button style={S.btn} onClick={cerrarModal}>Cerrar</button>
                  </div>
                </>
              );
            })()}

            {modal.mode === "ver" && modal.instrumento.id !== "360" && !modal.instrumento.individual && (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                  <div style={S.kpi}>
                    <div style={S.kpiLabel}>Score</div>
                    <div style={S.kpiValue}>{modal.instrumento.resultado.score}</div>
                  </div>
                  <div style={S.kpi}>
                    <div style={S.kpiLabel}>Respuestas</div>
                    <div style={S.kpiValue}>{modal.instrumento.resultado.respuestas}</div>
                  </div>
                </div>

                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#666", marginBottom: 10 }}>
                  Distribución por pregunta
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {modal.instrumento.resultado.distribucion.map((d, idx) => (
                    <div key={idx}>
                      <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 6, color: "#0f172a" }}>{d.pregunta}</div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {d.barras.map((b, j) => (
                          <div key={j} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
                            <div style={{ width: 90, color: "#475569" }}>{b.label}</div>
                            <div style={{ flex: 1, background: "#f1f5f9", borderRadius: 3, height: 14, position: "relative", overflow: "hidden" }}>
                              <div
                                style={{
                                  width: `${b.pct}%`,
                                  height: "100%",
                                  background: "linear-gradient(180deg, #64748b 0%, #475569 100%)",
                                  borderRadius: 3,
                                }}
                              />
                            </div>
                            <div style={{ width: 40, textAlign: "right", fontWeight: 600, fontVariantNumeric: "tabular-nums", color: "#0f172a" }}>{b.pct}%</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", borderTop: "1px solid #eee", paddingTop: 12, marginTop: 16 }}>
                  <button style={S.btn} onClick={cerrarModal}>Cerrar</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================
// 3. LÍNEA DE DENUNCIA
// =============================================================
const INCIDENCIAS = [
  {
    id: "DN-024", fecha: "12-abr", tipo: "Acoso laboral", area: "Comercial",
    estado: "En investigación", hr: "Sí", severidad: "Alta",
    canal: "Línea ética 800 (anónima)",
    denunciante: "Anónimo · Colaborador del área Comercial",
    denunciado: "Gerente de Comercial (J. B.)",
    confidencialidad: "Estricta",
    descripcion: "Reporte de trato hostil, gritos en juntas y comentarios despectivos hacia integrantes del equipo durante los últimos 3 meses. Cuatro testigos anónimos respaldan los hechos.",
    evidencias: [
      "Capturas de Teams — 3 conversaciones con tono agresivo (mar–abr)",
      "Acta de junta del 28-mar con observaciones del HRBP",
      "Pulso de clima del equipo: score 5.2/10 vs 7.8 promedio del área",
    ],
    comentariosComite: [
      { autor: "Comité Ético", fecha: "15-abr", texto: "Caso clasificado prioritario. Asignar acompañamiento psicológico al denunciante." },
      { autor: "Legal", fecha: "20-abr", texto: "Documentar hallazgos para potencial acción disciplinaria conforme al art. 47 LFT." },
    ],
    proximosPasos: [
      "Cerrar recolección de evidencias antes del 30-abr",
      "Sesión del Comité Ético programada 03-may",
      "Activar protocolo de no represalia con denunciante",
    ],
    hojaRuta: [
      { paso: 1, accion: "Entrevista con denunciante", responsable: "Gerente RH", fecha: "15-abr", estado: "Hecho" },
      { paso: 2, accion: "Entrevista con denunciado", responsable: "Gerente RH + Legal", fecha: "20-abr", estado: "Hecho" },
      { paso: 3, accion: "Recolección de evidencias", responsable: "Comité ético", fecha: "30-abr", estado: "En curso" },
      { paso: 4, accion: "Resolución y comunicación", responsable: "Director RH", fecha: "10-may", estado: "Pendiente" },
    ],
  },
  {
    id: "DN-025", fecha: "18-abr", tipo: "Conflicto interpersonal", area: "Posventa",
    estado: "Abierta", hr: "No", severidad: "Media",
    canal: "Conversación directa con HRBP",
    denunciante: "T. Aguilar · Supervisora Posventa",
    denunciado: "Dos técnicos del mismo turno",
    confidencialidad: "Estándar",
    descripcion: "Conflicto recurrente entre dos técnicos del turno matutino que está afectando el flujo de servicio. Ya hubo 2 quejas de clientes por demoras atribuibles a la fricción del equipo.",
    evidencias: [
      "2 tickets de clientes con tiempo de respuesta fuera de SLA",
      "Reporte de supervisora del 17-abr",
    ],
    comentariosComite: [],
    proximosPasos: [
      "Generar Hoja de Ruta antes del 30-abr (faltante)",
      "Sesión de mediación facilitada por HRBP",
      "Evaluar rotación temporal de turno si la mediación no resuelve",
    ],
    hojaRuta: [],
  },
  {
    id: "DN-026", fecha: "20-abr", tipo: "Sospecha de fraude", area: "Administración",
    estado: "En investigación", hr: "Sí", severidad: "Crítica",
    canal: "Línea ética 800 (anónima)",
    denunciante: "Anónimo · Colaborador de Administración",
    denunciado: "Auxiliar contable (A. M.)",
    confidencialidad: "Estricta · Comité Ejecutivo",
    descripcion: "Sospecha de duplicación de facturas a proveedor único en los últimos 90 días. Monto estimado en revisión: $480K. Auditoría interna ya replicó la inconsistencia en muestreo.",
    evidencias: [
      "Reporte preliminar de Auditoría Interna · 14 facturas con CFDI duplicado",
      "Conciliación bancaria con desfase de $312K (mar 2026)",
      "Bitácora de accesos al ERP fuera de horario (5 eventos)",
    ],
    comentariosComite: [
      { autor: "Auditoría Interna", fecha: "21-abr", texto: "Patrón consistente con esquema de duplicación. Solicitar bloqueo cautelar del usuario en ERP." },
      { autor: "Legal", fecha: "23-abr", texto: "Preparar denuncia ante autoridad competente si se confirma el desfalco." },
    ],
    proximosPasos: [
      "Bloqueo cautelar de acceso al ERP — ya ejecutado",
      "Cierre de auditoría forense · fecha objetivo 08-may",
      "Coordinación con Legal y Compliance para decisión final",
    ],
    hojaRuta: [
      { paso: 1, accion: "Bloqueo cautelar de accesos", responsable: "TI + Legal", fecha: "21-abr", estado: "Hecho" },
      { paso: 2, accion: "Auditoría forense de facturas", responsable: "Auditoría Interna", fecha: "08-may", estado: "En curso" },
      { paso: 3, accion: "Entrevista al colaborador investigado", responsable: "RH + Legal", fecha: "10-may", estado: "Pendiente" },
      { paso: 4, accion: "Resolución y reporte a Consejo", responsable: "Director General", fecha: "20-may", estado: "Pendiente" },
    ],
  },
  {
    id: "DN-027", fecha: "22-abr", tipo: "Discriminación", area: "Operaciones",
    estado: "Abierta", hr: "No", severidad: "Alta",
    canal: "Línea ética 800 (anónima)",
    denunciante: "Anónimo · Colaboradora de Operaciones",
    denunciado: "Supervisor de planta (R. C.)",
    confidencialidad: "Estricta",
    descripcion: "Reporte de trato diferenciado en asignación de turnos y oportunidades de capacitación entre colaboradores hombres y mujeres del mismo nivel. Datos preliminares de RH respaldan el patrón.",
    evidencias: [
      "Reporte de asignación de turnos Q1 2026 (sesgo del 38%)",
      "Solicitudes de capacitación rechazadas: 5/6 a mujeres",
    ],
    comentariosComite: [],
    proximosPasos: [
      "Generar Hoja de Ruta (faltante) — escalado a Comité Ético",
      "Solicitar reporte completo a People Analytics",
      "Definir entrevistas confidenciales con muestra del equipo",
    ],
    hojaRuta: [],
  },
  {
    id: "DN-028", fecha: "25-abr", tipo: "Violación de política", area: "Comercial",
    estado: "Resuelta", hr: "Sí", severidad: "Media",
    canal: "Reporte directo del Gerente",
    denunciante: "Gerente Comercial · L. Martínez",
    denunciado: "Ejecutivo de cuenta (F. S.)",
    confidencialidad: "Estándar",
    descripcion: "Uso de descuento por encima del rango autorizado en 3 oportunidades sin aprobación previa del Director. Impacto: -$185K en margen del trimestre.",
    evidencias: [
      "3 cotizaciones aprobadas en CRM fuera de política",
      "Comparativo de margen vs cuota: -4.2 puntos",
    ],
    comentariosComite: [
      { autor: "Director Comercial", fecha: "28-abr", texto: "Confirmada la violación. Se aplicó acción disciplinaria conforme al reglamento (acta administrativa)." },
    ],
    resolucion: "Acta administrativa en expediente. Capacitación obligatoria de Política Comercial completada el 05-may. Sin recurrencia hasta la fecha.",
    proximosPasos: [
      "Seguimiento de comportamiento por 90 días",
      "Refuerzo de capacitación en política comercial al equipo Comercial",
    ],
    hojaRuta: [
      { paso: 1, accion: "Revisión de evidencias en CRM", responsable: "Director Comercial", fecha: "26-abr", estado: "Hecho" },
      { paso: 2, accion: "Reunión disciplinaria con el ejecutivo", responsable: "Director Comercial + RH", fecha: "28-abr", estado: "Hecho" },
      { paso: 3, accion: "Capacitación de política comercial", responsable: "RH", fecha: "05-may", estado: "Hecho" },
      { paso: 4, accion: "Comunicación al equipo del área", responsable: "Director Comercial", fecha: "06-may", estado: "Hecho" },
    ],
  },
];

function Denuncia() {
  const [openId, setOpenId] = useState(null);
  const incidencia = INCIDENCIAS.find((i) => i.id === openId);

  const estadoBadgeColor = (estado) =>
    estado === "Resuelta" ? "#e8f5e9" : estado === "En investigación" ? "#fff7e0" : "#fdecea";
  const severidadColor = (sev) =>
    sev === "Crítica" ? "#b00020" : sev === "Alta" ? "#c2410c" : sev === "Media" ? "#a16207" : "#475569";
  const pasoEstadoColor = (estado) =>
    estado === "Hecho" ? "#e8f5e9" : estado === "En curso" ? "#fff7e0" : "#eee";

  return (
    <div>
      <h2 style={S.h2}>3. Línea de Denuncia</h2>
      <p style={S.hint}>
        Registro de incidencias → cada una genera una <strong>Hoja de Ruta</strong> (plan de trabajo con responsables, fechas y entregables).
      </p>

      <div style={S.grid4}>
        <div style={S.kpi}><div style={S.kpiLabel}>Activas</div><div style={S.kpiValue}>5</div></div>
        <div style={S.kpi}><div style={S.kpiLabel}>Sin Hoja de Ruta</div><div style={S.kpiValue}>2</div></div>
        <div style={S.kpi}><div style={S.kpiLabel}>Resueltas (mes)</div><div style={S.kpiValue}>3</div></div>
        <div style={S.kpi}><div style={S.kpiLabel}>Tiempo medio resolución</div><div style={S.kpiValue}>22 días</div></div>
      </div>

      <h3 style={S.h3}>Bandeja de incidencias</h3>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Folio</th>
            <th style={S.th}>Fecha</th>
            <th style={S.th}>Tipo</th>
            <th style={S.th}>Área</th>
            <th style={S.th}>Estado</th>
            <th style={S.th}>Hoja de Ruta</th>
            <th style={S.th}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {INCIDENCIAS.map((i) => (
            <tr key={i.id}>
              <td style={S.td}><strong>{i.id}</strong></td>
              <td style={S.td}>{i.fecha}</td>
              <td style={S.td}>{i.tipo}</td>
              <td style={S.td}>{i.area}</td>
              <td style={S.td}>
                <span style={S.badge(estadoBadgeColor(i.estado))}>{i.estado}</span>
              </td>
              <td style={S.td}>
                {i.hr === "Sí"
                  ? <span style={S.badge("#e8f5e9")}>Generada</span>
                  : <span style={S.badge("#fdecea")}>Faltante</span>}
              </td>
              <td style={S.td}>
                <button style={S.btnGhost} onClick={() => setOpenId(i.id)}>Abrir</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={S.h3}>Hoja de Ruta — Ejemplo</h3>
      <div style={S.card}>
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
          <strong>DN-024 · Acoso laboral · Comercial</strong>
          <span style={S.badge("#fff7e0")}>En investigación</span>
        </div>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>#</th>
              <th style={S.th}>Acción</th>
              <th style={S.th}>Responsable</th>
              <th style={S.th}>Fecha límite</th>
              <th style={S.th}>Estado</th>
            </tr>
          </thead>
          <tbody>
            <tr><td style={S.td}>1</td><td style={S.td}>Entrevista con denunciante</td><td style={S.td}>Gerente RH</td><td style={S.td}>15-abr</td><td style={S.td}><span style={S.badge("#e8f5e9")}>Hecho</span></td></tr>
            <tr><td style={S.td}>2</td><td style={S.td}>Entrevista con denunciado</td><td style={S.td}>Gerente RH + Legal</td><td style={S.td}>20-abr</td><td style={S.td}><span style={S.badge("#e8f5e9")}>Hecho</span></td></tr>
            <tr><td style={S.td}>3</td><td style={S.td}>Recolección de evidencias</td><td style={S.td}>Comité ético</td><td style={S.td}>30-abr</td><td style={S.td}><span style={S.badge("#fff7e0")}>En curso</span></td></tr>
            <tr><td style={S.td}>4</td><td style={S.td}>Resolución y comunicación</td><td style={S.td}>Director RH</td><td style={S.td}>10-may</td><td style={S.td}><span style={S.badge("#eee")}>Pendiente</span></td></tr>
          </tbody>
        </table>
      </div>

      {incidencia && (
        <div
          onClick={() => setOpenId(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff", borderRadius: 8, padding: 24,
              width: 760, maxWidth: "94vw", maxHeight: "92vh", overflowY: "auto",
              border: "1px solid #ccc",
            }}
          >
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4, gap: 12 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700 }}>
                  {incidencia.id} · {incidencia.tipo}
                </h3>
                <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>
                  {incidencia.area} · Recibida {incidencia.fecha} · {incidencia.canal}
                </div>
              </div>
              <button
                onClick={() => setOpenId(null)}
                style={{ border: "none", background: "transparent", fontSize: 22, cursor: "pointer", color: "#666", lineHeight: 1 }}
                aria-label="Cerrar"
              >×</button>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10, marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #e2e8f0" }}>
              <span style={S.badge(estadoBadgeColor(incidencia.estado))}>{incidencia.estado}</span>
              <span style={{ ...S.badge("#f1f5f9"), color: severidadColor(incidencia.severidad), fontWeight: 700 }}>
                Severidad: {incidencia.severidad}
              </span>
              <span style={S.badge("#f1f5f9")}>Confidencialidad: {incidencia.confidencialidad}</span>
              {incidencia.hr === "Sí"
                ? <span style={S.badge("#e8f5e9")}>Hoja de Ruta generada</span>
                : <span style={S.badge("#fdecea")}>Hoja de Ruta faltante</span>}
            </div>

            {/* Partes involucradas */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 16 }}>
              <div style={S.kpi}>
                <div style={S.kpiLabel}>Denunciante</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{incidencia.denunciante}</div>
              </div>
              <div style={S.kpi}>
                <div style={S.kpiLabel}>Denunciado</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 4 }}>{incidencia.denunciado}</div>
              </div>
            </div>

            {/* Descripción */}
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#666", marginBottom: 8 }}>
              Descripción del caso
            </div>
            <div style={{ fontSize: 13, color: "#0f172a", lineHeight: 1.5, marginBottom: 16, padding: "10px 12px", background: "#f8fafc", borderRadius: 6, border: "1px solid #e2e8f0" }}>
              {incidencia.descripcion}
            </div>

            {/* Evidencias */}
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#666", marginBottom: 8 }}>
              Evidencias ({incidencia.evidencias.length})
            </div>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
              {incidencia.evidencias.map((e, i) => <li key={i}>{e}</li>)}
            </ul>

            {/* Hoja de Ruta */}
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#666", marginBottom: 8 }}>
              Hoja de Ruta
            </div>
            {incidencia.hojaRuta.length === 0 ? (
              <div style={{ padding: 14, background: "#fdecea", border: "1px dashed #b00020", borderRadius: 6, marginBottom: 16, fontSize: 13, color: "#7f1d1d" }}>
                <strong>Pendiente de generar.</strong> Este caso aún no tiene plan de trabajo asignado.
                <div style={{ marginTop: 8 }}>
                  <button style={{ ...S.btn, fontSize: 12 }} onClick={() => setOpenId(null)}>Generar Hoja de Ruta</button>
                </div>
              </div>
            ) : (
              <table style={{ ...S.table, marginBottom: 16 }}>
                <thead>
                  <tr>
                    <th style={S.th}>#</th>
                    <th style={S.th}>Acción</th>
                    <th style={S.th}>Responsable</th>
                    <th style={S.th}>Fecha</th>
                    <th style={S.th}>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {incidencia.hojaRuta.map((p) => (
                    <tr key={p.paso}>
                      <td style={S.td}>{p.paso}</td>
                      <td style={S.td}>{p.accion}</td>
                      <td style={S.td}>{p.responsable}</td>
                      <td style={S.td}>{p.fecha}</td>
                      <td style={S.td}><span style={S.badge(pasoEstadoColor(p.estado))}>{p.estado}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Comentarios */}
            {incidencia.comentariosComite.length > 0 && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#666", marginBottom: 8 }}>
                  Comentarios del Comité
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                  {incidencia.comentariosComite.map((c, i) => (
                    <div key={i} style={{ borderLeft: "3px solid #cbd5e1", padding: "6px 10px", background: "#f8fafc", fontSize: 12 }}>
                      <div style={{ fontWeight: 700, fontSize: 10, color: "#475569", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 2 }}>
                        {c.autor} · {c.fecha}
                      </div>
                      <div style={{ color: "#0f172a" }}>"{c.texto}"</div>
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Resolución (solo en resueltas) */}
            {incidencia.resolucion && (
              <>
                <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#0a7d2c", marginBottom: 8 }}>
                  Resolución
                </div>
                <div style={{ fontSize: 13, color: "#0f172a", lineHeight: 1.5, marginBottom: 16, padding: "10px 12px", background: "#e8f5e9", borderRadius: 6, border: "1px solid #0a7d2c" }}>
                  {incidencia.resolucion}
                </div>
              </>
            )}

            {/* Próximos pasos */}
            <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, color: "#666", marginBottom: 8 }}>
              Próximos pasos
            </div>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>
              {incidencia.proximosPasos.map((p, i) => <li key={i}>{p}</li>)}
            </ul>

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", borderTop: "1px solid #eee", paddingTop: 12 }}>
              <button style={S.btn} onClick={() => setOpenId(null)}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// =============================================================
// 4. COBERTURA DE PLANTILLA
// =============================================================
function Cobertura({ onAbrirGuia }) {
  const vacantes = [
    { id: "REQ-101", puesto: "Asesor Comercial Sr.", area: "Comercial", solicita: "G. Pérez", abierta: 12, etapa: "Entrevistas", candidatos: 6 },
    { id: "REQ-102", puesto: "Mecánico A", area: "Posventa", solicita: "L. Cano", abierta: 28, etapa: "Sourcing", candidatos: 2 },
    { id: "REQ-103", puesto: "Contador General", area: "Administración", solicita: "R. Solís", abierta: 64, etapa: "Oferta", candidatos: 1 },
    { id: "REQ-104", puesto: "Gerente Operaciones", area: "Operaciones", solicita: "Dirección", abierta: 71, etapa: "Entrevistas", candidatos: 3 },
    { id: "REQ-105", puesto: "Asistente RH", area: "RH", solicita: "Dir. RH", abierta: 4, etapa: "Sourcing", candidatos: 0 },
    { id: "REQ-106", puesto: "Supervisor Posventa Turno B", area: "Posventa", solicita: "L. Cano", abierta: 18, etapa: "Filtro CV", candidatos: 4 },
    { id: "REQ-107", puesto: "Analista Financiero Jr.", area: "Administración", solicita: "R. Solís", abierta: 36, etapa: "Entrevistas", candidatos: 5 },
  ];

  const solicitudesMensuales = [
    { mes: "Nov 25", recibidas: 3, cerradas: 2 },
    { mes: "Dic 25", recibidas: 2, cerradas: 3 },
    { mes: "Ene 26", recibidas: 4, cerradas: 2 },
    { mes: "Feb 26", recibidas: 5, cerradas: 4 },
    { mes: "Mar 26", recibidas: 3, cerradas: 3 },
    { mes: "Abr 26", recibidas: 6, cerradas: 4 },
    { mes: "May 26", recibidas: 4, cerradas: 2 },
  ];
  const totalRecibidas = solicitudesMensuales.reduce((a, m) => a + m.recibidas, 0);
  const totalCerradas = solicitudesMensuales.reduce((a, m) => a + m.cerradas, 0);
  const maxBar = Math.max(...solicitudesMensuales.flatMap((m) => [m.recibidas, m.cerradas]));
  const yMaxMensual = Math.max(Math.ceil((maxBar + 1) / 2) * 2, 8);
  const yTicksMensual = [];
  for (let i = 0; i <= yMaxMensual; i += 2) yTicksMensual.push(i);
  yTicksMensual.reverse();
  let acumRec = 0;
  let acumCer = 0;
  const acumulado = solicitudesMensuales.map((m) => {
    acumRec += m.recibidas;
    acumCer += m.cerradas;
    return { mes: m.mes, acumRecibidas: acumRec, acumCerradas: acumCer };
  });
  const maxAcum = Math.max(...acumulado.map((m) => m.acumRecibidas));
  const yMaxAcum = Math.max(Math.ceil((maxAcum + 2) / 5) * 5, 10);

  const funnel = [
    { etapa: "Solicitudes recibidas", n: 27, dias: "—" },
    { etapa: "Candidatos sourceados", n: 286, dias: "3 días promedio" },
    { etapa: "Filtro de CV aprobado", n: 142, dias: "5 días promedio" },
    { etapa: "Entrevista RH", n: 64, dias: "9 días promedio" },
    { etapa: "Entrevista con gerente", n: 28, dias: "14 días promedio" },
    { etapa: "Entrega de papeles / pruebas", n: 14, dias: "21 días promedio" },
    { etapa: "Oferta enviada", n: 8, dias: "26 días promedio" },
    { etapa: "Contratación efectiva", n: 6, dias: "33 días promedio" },
  ];
  const topFunnel = funnel[1].n; // Para escala de barras: usamos sourceados como referencia
  const totalContratados = funnel[funnel.length - 1].n;
  const tasaGlobal = ((totalContratados / funnel[1].n) * 100).toFixed(1);

  const porArea = [
    { area: "Comercial",      recibidas: 8, cerradas: 6, dias: 28 },
    { area: "Posventa",       recibidas: 6, cerradas: 4, dias: 38 },
    { area: "Operaciones",    recibidas: 5, cerradas: 3, dias: 52 },
    { area: "Administración", recibidas: 4, cerradas: 3, dias: 41 },
    { area: "Dirección",      recibidas: 2, cerradas: 1, dias: 67 },
    { area: "RH",             recibidas: 2, cerradas: 1, dias: 22 },
  ];

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
        <div>
          <h2 style={S.h2}>4. Cobertura de Plantilla</h2>
          <p style={S.hint}>Seguimiento a solicitudes de otras áreas: solicitudes recibidas, embudo de reclutamiento, dónde se atoran los candidatos.</p>
        </div>
        <button
          onClick={onAbrirGuia}
          style={{
            ...S.btn,
            background: "linear-gradient(135deg, #71b248 0%, #5a9438 100%)",
            border: "none",
            color: "#fff",
            padding: "10px 18px",
            fontSize: 13,
            fontWeight: 700,
            whiteSpace: "nowrap",
            boxShadow: "0 1px 3px rgba(15,23,42,0.12)",
          }}
        >
          Guía de entrevista →
        </button>
      </div>

      <div style={S.grid4}>
        <div style={S.kpi}><div style={S.kpiLabel}>Plantilla autorizada</div><div style={S.kpiValue}>248</div></div>
        <div style={S.kpi}><div style={S.kpiLabel}>Cubierta</div><div style={S.kpiValue}>228</div></div>
        <div style={S.kpi}><div style={S.kpiLabel}>% cobertura</div><div style={S.kpiValue}>92%</div></div>
        <div style={S.kpi}><div style={S.kpiLabel}>Vacantes &gt; 60 días</div><div style={S.kpiValue}>2</div></div>
      </div>

      <h3 style={S.h3}>Solicitudes — mes a mes y acumulado</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
        {/* Mensual: barras agrupadas recibidas vs cerradas */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "20px 22px 16px", boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)" }}>
          <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase", color: "#64748b" }}>
              Mensual · últimos 7 meses
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 2 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>Recibidas vs Cerradas</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>
                <span style={{ color: "#c2410c", fontWeight: 700 }}>Recibidas</span> · <span style={{ color: "#475569", fontWeight: 700 }}>Cerradas</span>
              </div>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "36px 1fr", gap: 6 }}>
            <div style={{ position: "relative", height: 180 }}>
              {yTicksMensual.map((y) => (
                <div key={y} style={{ position: "absolute", right: 6, top: `${((yMaxMensual - y) / yMaxMensual) * 100}%`, transform: "translateY(-50%)", fontSize: 10, color: "#94a3b8", fontVariantNumeric: "tabular-nums" }}>
                  {y}
                </div>
              ))}
            </div>
            <div>
              <div style={{ position: "relative", height: 180 }}>
                {yTicksMensual.map((y) => (
                  <div key={y} style={{ position: "absolute", left: 0, right: 0, top: `${((yMaxMensual - y) / yMaxMensual) * 100}%`, height: 1, background: y === 0 ? "#cbd5e1" : "#f1f5f9" }} />
                ))}
                <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", gap: 12, padding: "0 8px" }}>
                  {solicitudesMensuales.map((m) => (
                    <div key={m.mes} style={{ flex: 1, display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 3, height: "100%" }}>
                      {[
                        { val: m.recibidas, grad: "linear-gradient(180deg, #ea580c 0%, #c2410c 100%)", color: "#c2410c" },
                        { val: m.cerradas,  grad: "linear-gradient(180deg, #64748b 0%, #475569 100%)", color: "#475569" },
                      ].map((b, j) => (
                        <div key={j} style={{ width: 14, height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center" }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: b.color, marginBottom: 2 }}>{b.val}</span>
                          <div style={{ width: "100%", height: `${(b.val / yMaxMensual) * 100}%`, background: b.grad, borderRadius: "2px 2px 0 0", minHeight: 2 }} />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, padding: "6px 8px 0" }}>
                {solicitudesMensuales.map((m) => (
                  <div key={m.mes} style={{ flex: 1, fontSize: 10, textAlign: "center", color: "#475569", fontWeight: 500 }}>{m.mes}</div>
                ))}
              </div>
            </div>
          </div>
          <div style={{ borderTop: "1px solid #f1f5f9", marginTop: 10, paddingTop: 8, display: "flex", justifyContent: "space-between", fontSize: 11, color: "#475569" }}>
            <span>Recibidas YTD: <strong style={{ color: "#c2410c" }}>{totalRecibidas}</strong></span>
            <span>Cerradas YTD: <strong style={{ color: "#475569" }}>{totalCerradas}</strong></span>
            <span>Pendientes: <strong style={{ color: "#0f172a" }}>{totalRecibidas - totalCerradas}</strong></span>
          </div>
        </div>

        {/* Acumulado: línea/área */}
        <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "20px 22px 16px", boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)" }}>
          <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 10, marginBottom: 14 }}>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase", color: "#64748b" }}>
              Acumulado · brecha recibidas vs cerradas
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: 2 }}>
              <div style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>Backlog del proceso</div>
              <div style={{ fontSize: 11, color: "#64748b" }}>
                Backlog actual <strong style={{ color: "#c2410c", fontVariantNumeric: "tabular-nums" }}>{totalRecibidas - totalCerradas}</strong>
              </div>
            </div>
          </div>
          {/* Acumulado en barras horizontales por mes */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {acumulado.map((a) => (
              <div key={a.mes} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11 }}>
                <div style={{ width: 50, color: "#475569", fontWeight: 500 }}>{a.mes}</div>
                <div style={{ flex: 1, position: "relative", height: 18, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ position: "absolute", inset: 0, width: `${(a.acumRecibidas / yMaxAcum) * 100}%`, background: "linear-gradient(90deg, #ea580c 0%, #c2410c 100%)", borderRadius: 3 }} />
                  <div style={{ position: "absolute", top: 2, bottom: 2, left: 0, width: `${(a.acumCerradas / yMaxAcum) * 100}%`, background: "linear-gradient(90deg, #64748b 0%, #475569 100%)", borderRadius: 3 }} />
                </div>
                <div style={{ width: 64, textAlign: "right", color: "#0f172a", fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                  {a.acumCerradas} / {a.acumRecibidas}
                </div>
              </div>
            ))}
          </div>
          <div style={{ borderTop: "1px solid #f1f5f9", marginTop: 12, paddingTop: 8, fontSize: 11, color: "#64748b" }}>
            Las barras naranjas marcan recibidas acumuladas; las grises encima muestran las cerradas. La diferencia es el backlog histórico.
          </div>
        </div>
      </div>

      <h3 style={S.h3}>Embudo de reclutamiento (YTD)</h3>
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "20px 28px 18px", marginBottom: 16, boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)" }}>
        <div style={{ borderBottom: "1px solid #f1f5f9", paddingBottom: 12, marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: 1.2, textTransform: "uppercase", color: "#64748b" }}>
              De sourcing a contratación
            </div>
            <div style={{ fontSize: 16, fontWeight: 600, color: "#0f172a" }}>Conversión por etapa</div>
          </div>
          <div style={{ fontSize: 11, color: "#64748b", textAlign: "right" }}>
            Tasa global <strong style={{ color: "#0f172a", fontVariantNumeric: "tabular-nums" }}>{tasaGlobal}%</strong> sourcing → contratación
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {funnel.map((s, idx) => {
            const widthPct = idx === 0 ? 100 : (s.n / topFunnel) * 100;
            const conversionFromPrev = idx > 1 ? ((s.n / funnel[idx - 1].n) * 100).toFixed(0) : null;
            const isSourcing = idx === 1;
            const grad = idx === 0
              ? "linear-gradient(90deg, #1e293b 0%, #0f172a 100%)"
              : "linear-gradient(90deg, #ea580c 0%, #c2410c 100%)";
            return (
              <div key={s.etapa} style={{ display: "grid", gridTemplateColumns: "200px 1fr 80px 110px", gap: 10, alignItems: "center", fontSize: 12 }}>
                <div style={{ color: "#0f172a", fontWeight: 600 }}>{s.etapa}</div>
                <div style={{ position: "relative", height: 28, background: "#f8fafc", border: "1px solid #f1f5f9", borderRadius: 4, overflow: "hidden" }}>
                  <div
                    style={{
                      position: "absolute",
                      left: "50%",
                      top: 0,
                      bottom: 0,
                      width: `${widthPct}%`,
                      transform: "translateX(-50%)",
                      background: grad,
                      borderRadius: 3,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontWeight: 700,
                      fontVariantNumeric: "tabular-nums",
                      fontSize: 12,
                      letterSpacing: 0.2,
                      boxShadow: "inset 0 -2px 0 rgba(0,0,0,0.08)",
                    }}
                  >
                    {s.n}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: "#64748b", textAlign: "right", fontVariantNumeric: "tabular-nums" }}>
                  {isSourcing ? "(base)" : conversionFromPrev !== null ? `${conversionFromPrev}% conversión` : `${s.n} casos`}
                </div>
                <div style={{ fontSize: 10, color: "#94a3b8", letterSpacing: 0.2 }}>
                  {s.dias}
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ borderTop: "1px solid #f1f5f9", marginTop: 14, paddingTop: 10, display: "flex", justifyContent: "space-between", fontSize: 11, color: "#475569" }}>
          <span>Mayor caída: <strong style={{ color: "#c2410c" }}>Sourcing → Filtro CV</strong> (50% queda fuera)</span>
          <span>Cuello de botella: <strong style={{ color: "#c2410c" }}>Entrevista RH → Gerente</strong> (44% conversión, 5 días extra)</span>
        </div>
      </div>

      <h3 style={S.h3}>Solicitudes por área (YTD)</h3>
      <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 8, padding: "16px 22px", marginBottom: 16, boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {porArea.map((a) => {
            const max = Math.max(...porArea.map((x) => x.recibidas));
            const pendientes = a.recibidas - a.cerradas;
            return (
              <div key={a.area} style={{ display: "grid", gridTemplateColumns: "130px 1fr 110px 90px", gap: 10, alignItems: "center", fontSize: 12 }}>
                <div style={{ color: "#0f172a", fontWeight: 600 }}>{a.area}</div>
                <div style={{ position: "relative", height: 18, background: "#f1f5f9", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${(a.recibidas / max) * 100}%`, background: "linear-gradient(90deg, #ea580c 0%, #c2410c 100%)", borderRadius: 3 }} />
                  <div style={{ position: "absolute", left: 0, top: 2, bottom: 2, width: `${(a.cerradas / max) * 100}%`, background: "linear-gradient(90deg, #64748b 0%, #475569 100%)", borderRadius: 3 }} />
                </div>
                <div style={{ textAlign: "right", fontVariantNumeric: "tabular-nums", color: "#0f172a", fontWeight: 600 }}>
                  {a.cerradas}/{a.recibidas} ({pendientes} pend.)
                </div>
                <div style={{ textAlign: "right", fontSize: 11, color: a.dias > 45 ? "#c2410c" : "#475569", fontVariantNumeric: "tabular-nums" }}>
                  {a.dias} días prom.
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <h3 style={S.h3}>Vacantes abiertas</h3>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Folio</th>
            <th style={S.th}>Puesto</th>
            <th style={S.th}>Área</th>
            <th style={S.th}>Solicita</th>
            <th style={S.th}>Días abierta</th>
            <th style={S.th}>Etapa actual</th>
            <th style={S.th}>Candidatos</th>
            <th style={S.th}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {vacantes.map((v) => (
            <tr key={v.id}>
              <td style={S.td}><strong>{v.id}</strong></td>
              <td style={S.td}>{v.puesto}</td>
              <td style={S.td}>{v.area}</td>
              <td style={S.td}>{v.solicita}</td>
              <td style={S.td}>{v.abierta}</td>
              <td style={S.td}>{v.etapa}</td>
              <td style={S.td}>{v.candidatos}</td>
              <td style={S.td}>
                {v.abierta > 60 ? <span style={S.badge("#fdecea")}>Crítica</span>
                  : v.abierta > 30 ? <span style={S.badge("#fff7e0")}>Alerta</span>
                  : <span style={S.badge("#e8f5e9")}>OK</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =============================================================
// 5. ROTACIÓN
// =============================================================
function Rotacion() {
  const bajas = [
    { area: "Comercial", n: 12, motivo: "Mejor oferta", tipo: "Voluntaria" },
    { area: "Posventa", n: 8, motivo: "Ambiente", tipo: "Voluntaria" },
    { area: "Operaciones", n: 4, motivo: "Desempeño", tipo: "Involuntaria" },
    { area: "Administración", n: 3, motivo: "Personal", tipo: "Voluntaria" },
  ];

  const costoUnitario = {
    directos: 25000, indirectos: 18000, ocultos: 35000, hundidos: 22000,
  };
  const totalBajas = bajas.reduce((a, r) => a + r.n, 0);
  const costoTotal = (costoUnitario.directos + costoUnitario.indirectos + costoUnitario.ocultos + costoUnitario.hundidos) * totalBajas;

  return (
    <div>
      <h2 style={S.h2}>5. Rotación</h2>
      <p style={S.hint}>
        % de rotación por área + costo total de cada baja: directos, indirectos, ocultos y hundidos.
        El objetivo es ponerle precio a algo que normalmente nadie cuantifica.
      </p>

      <div style={S.grid4}>
        <div style={S.kpi}><div style={S.kpiLabel}>Bajas YTD</div><div style={S.kpiValue}>{totalBajas}</div></div>
        <div style={S.kpi}><div style={S.kpiLabel}>% rotación anualizada</div><div style={S.kpiValue}>21.3%</div></div>
        <div style={S.kpi}><div style={S.kpiLabel}>Costo unitario promedio</div><div style={S.kpiValue}>$100,000</div></div>
        <div style={S.kpi}><div style={S.kpiLabel}>Costo total estimado</div><div style={S.kpiValue}>${(costoTotal / 1000000).toFixed(2)}M</div></div>
      </div>

      <h3 style={S.h3}>Anatomía del costo por baja</h3>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Concepto</th>
            <th style={S.th}>Tipo</th>
            <th style={S.th}>Monto unitario</th>
            <th style={S.th}>Total ({totalBajas} bajas)</th>
          </tr>
        </thead>
        <tbody>
          <tr><td style={S.td}>Liquidación / finiquito</td><td style={S.td}>Directo</td><td style={S.td}>$25,000</td><td style={S.td}>${(25000 * totalBajas).toLocaleString("es-MX")}</td></tr>
          <tr><td style={S.td}>Reclutamiento + capacitación reemplazo</td><td style={S.td}>Indirecto</td><td style={S.td}>$18,000</td><td style={S.td}>${(18000 * totalBajas).toLocaleString("es-MX")}</td></tr>
          <tr><td style={S.td}>Curva de aprendizaje + errores + clima</td><td style={S.td}>Oculto</td><td style={S.td}>$35,000</td><td style={S.td}>${(35000 * totalBajas).toLocaleString("es-MX")}</td></tr>
          <tr><td style={S.td}>Capacitación previa perdida</td><td style={S.td}>Hundido</td><td style={S.td}>$22,000</td><td style={S.td}>${(22000 * totalBajas).toLocaleString("es-MX")}</td></tr>
        </tbody>
      </table>

      <h3 style={S.h3}>Rotación por área</h3>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Área</th>
            <th style={S.th}>Bajas</th>
            <th style={S.th}>Motivo principal</th>
            <th style={S.th}>Tipo</th>
            <th style={S.th}>Costo estimado</th>
          </tr>
        </thead>
        <tbody>
          {bajas.map((b) => (
            <tr key={b.area}>
              <td style={S.td}><strong>{b.area}</strong></td>
              <td style={S.td}>{b.n}</td>
              <td style={S.td}>{b.motivo}</td>
              <td style={S.td}>{b.tipo}</td>
              <td style={S.td}>${(100000 * b.n).toLocaleString("es-MX")}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =============================================================
// 6. CAPACITACIÓN Y ENTRENAMIENTO
// =============================================================
function Capacitacion() {
  const cursos = [
    { id: "CAP-01", nombre: "Liderazgo nivel medio", solicita: "Operaciones", fechaIni: "01-may", fechaFin: "30-jun", costo: 85000, roi: "2.1x", est: "En curso" },
    { id: "CAP-02", nombre: "Cierre de ventas premium", solicita: "Comercial", fechaIni: "15-abr", fechaFin: "15-may", costo: 120000, roi: "3.4x", est: "En curso" },
    { id: "CAP-03", nombre: "NIIF actualización", solicita: "Administración", fechaIni: "10-jun", fechaFin: "20-jun", costo: 45000, roi: "1.2x", est: "Programado" },
    { id: "CAP-04", nombre: "Servicio al cliente posventa", solicita: "Posventa", fechaIni: "05-may", fechaFin: "12-may", costo: 38000, roi: "1.8x", est: "Solicitud" },
  ];

  return (
    <div>
      <h2 style={S.h2}>6. Capacitación y Entrenamiento</h2>
      <p style={S.hint}>Solicitudes, calendario, project manager, costos y ROI esperado de cada programa.</p>

      <div style={S.grid4}>
        <div style={S.kpi}><div style={S.kpiLabel}>Cursos activos</div><div style={S.kpiValue}>2</div></div>
        <div style={S.kpi}><div style={S.kpiLabel}>Programados</div><div style={S.kpiValue}>1</div></div>
        <div style={S.kpi}><div style={S.kpiLabel}>Inversión YTD</div><div style={S.kpiValue}>$288K</div></div>
        <div style={S.kpi}><div style={S.kpiLabel}>ROI promedio</div><div style={S.kpiValue}>1.8x</div></div>
      </div>

      <h3 style={S.h3}>Pipeline de capacitación</h3>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Folio</th>
            <th style={S.th}>Programa</th>
            <th style={S.th}>Solicita</th>
            <th style={S.th}>Inicio</th>
            <th style={S.th}>Fin</th>
            <th style={S.th}>Costo</th>
            <th style={S.th}>ROI esperado</th>
            <th style={S.th}>Estado</th>
          </tr>
        </thead>
        <tbody>
          {cursos.map((c) => (
            <tr key={c.id}>
              <td style={S.td}><strong>{c.id}</strong></td>
              <td style={S.td}>{c.nombre}</td>
              <td style={S.td}>{c.solicita}</td>
              <td style={S.td}>{c.fechaIni}</td>
              <td style={S.td}>{c.fechaFin}</td>
              <td style={S.td}>${c.costo.toLocaleString("es-MX")}</td>
              <td style={S.td}>{c.roi}</td>
              <td style={S.td}>
                <span style={S.badge(
                  c.est === "En curso" ? "#e8f5e9" :
                  c.est === "Programado" ? "#eef5ff" : "#fff7e0"
                )}>{c.est}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={S.h3}>Vista calendario (mock)</h3>
      <div style={S.card}>
        <p style={S.hint}>Aquí va el Gantt mensual con los programas activos, traslapes y responsables.</p>
        <div style={{ height: 120, border: "1px dashed #ccc", borderRadius: 4, display: "flex", alignItems: "center", justifyContent: "center", color: "#999" }}>
          [Gantt calendario]
        </div>
      </div>
    </div>
  );
}

// =============================================================
// 7. PROCESO DE SELECCIÓN
// =============================================================
function Seleccion() {
  const candidatos = [
    { nombre: "A. Ramírez", puesto: "Asesor Comercial Sr.", etapa: "Entrevista final", score: 8.5 },
    { nombre: "J. Torres", puesto: "Asesor Comercial Sr.", etapa: "Entrevista 1", score: 7.2 },
    { nombre: "M. Gómez", puesto: "Mecánico A", etapa: "Pruebas técnicas", score: 7.8 },
    { nombre: "S. Vega", puesto: "Contador General", etapa: "Oferta", score: 9.1 },
  ];

  const etapas = [
    "Solicitud (vacante autorizada)",
    "Sourcing y atracción",
    "Filtro de CV",
    "Entrevista RH",
    "Pruebas (técnicas / psicométricas)",
    "Entrevista con área solicitante",
    "Entrevista final / Dirección",
    "Oferta económica",
    "Verificación de referencias",
    "Contratación",
    "Onboarding 30-60-90+",
  ];

  return (
    <div>
      <h2 style={S.h2}>7. Proceso de Selección</h2>
      <p style={S.hint}>Pipeline completo: desde la solicitud autorizada hasta el onboarding 30-60-90+.</p>

      <div style={S.grid4}>
        <div style={S.kpi}><div style={S.kpiLabel}>Candidatos activos</div><div style={S.kpiValue}>28</div></div>
        <div style={S.kpi}><div style={S.kpiLabel}>Tiempo medio de cobertura</div><div style={S.kpiValue}>38 días</div></div>
        <div style={S.kpi}><div style={S.kpiLabel}>Tasa de oferta aceptada</div><div style={S.kpiValue}>78%</div></div>
        <div style={S.kpi}><div style={S.kpiLabel}>Onboardings activos</div><div style={S.kpiValue}>4</div></div>
      </div>

      <h3 style={S.h3}>Etapas del proceso</h3>
      <div style={S.card}>
        <ol style={{ paddingLeft: 18, margin: 0, lineHeight: 1.8 }}>
          {etapas.map((e, i) => (
            <li key={i} style={{ fontSize: 13 }}>{e}</li>
          ))}
        </ol>
      </div>

      <h3 style={S.h3}>Candidatos en pipeline</h3>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={S.th}>Candidato</th>
            <th style={S.th}>Puesto</th>
            <th style={S.th}>Etapa</th>
            <th style={S.th}>Score</th>
            <th style={S.th}>Acción</th>
          </tr>
        </thead>
        <tbody>
          {candidatos.map((c) => (
            <tr key={c.nombre}>
              <td style={S.td}><strong>{c.nombre}</strong></td>
              <td style={S.td}>{c.puesto}</td>
              <td style={S.td}>{c.etapa}</td>
              <td style={S.td}>{c.score}</td>
              <td style={S.td}><button style={S.btnGhost}>Ver expediente</button></td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3 style={S.h3}>Herramientas integradas</h3>
      <div style={S.grid3}>
        {[
          "Descripción de puesto",
          "Guía de preguntas de entrevista",
          "Base de datos de candidatos",
          "Análisis de compensación",
          "Checklist de nuevo empleado",
          "Roadmap onboarding 30-60-90+",
          "Matriz de habilidades",
          "Plan de desarrollo de carrera",
          "Análisis de necesidades de capacitación",
        ].map((h) => (
          <div key={h} style={S.card}>
            <strong style={{ fontSize: 13 }}>{h}</strong>
            <div style={{ marginTop: 8 }}>
              <button style={S.btnGhost}>Abrir</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// =============================================================
// SHELL — Layout con sidebar a la DERECHA
// =============================================================
export default function SaaSRRHH() {
  const [tab, setTab] = useState("dashboard");
  const [filter, setFilter] = useState("");
  const [periodo, setPeriodo] = useState("Abr 2026");
  const [vistaGuia, setVistaGuia] = useState(false);

  const PERIODOS = ["Ene 2026", "Feb 2026", "Mar 2026", "Abr 2026", "May 2026"];

  const filtered = TABS.filter((t) =>
    t.label.toLowerCase().includes(filter.toLowerCase())
  );

  const render = () => {
    switch (tab) {
      case "dashboard": return <Dashboard go={setTab} periodo={periodo} />;
      case "nomina": return <Nomina periodo={periodo} />;
      case "clima": return <Clima />;
      case "denuncia": return <Denuncia />;
      case "cobertura": return <Cobertura onAbrirGuia={() => setVistaGuia(true)} />;
      case "rotacion": return <Rotacion />;
      case "capacitacion": return <Capacitacion />;
      case "seleccion": return <Seleccion />;
      default: return null;
    }
  };

  if (vistaGuia) {
    return <GuiaEntrevista onClose={() => setVistaGuia(false)} />;
  }

  return (
    <div style={S.page}>
      {/* Topbar */}
      <div style={S.topbar}>
        <div>
          <div style={S.title}>TABLERO DE CONTROL PARA RRHH</div>
          <div style={S.subtitle}>Suite integral para Dirección y Gerencia de Recursos Humanos</div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.btnGhost}>Empresa: Demo S.A.</button>
          <select
            style={S.btnGhost}
            value={periodo}
            onChange={(e) => setPeriodo(e.target.value)}
          >
            {PERIODOS.map((p) => (
              <option key={p} value={p}>Periodo: {p}</option>
            ))}
          </select>
          <button style={S.btn}>Exportar</button>
        </div>
      </div>

      {/* Layout: sidebar izquierdo + contenido */}
      <div style={S.layout}>
        {/* Sidebar de catálogo a la IZQUIERDA */}
        <aside style={S.sidebar}>
          <div style={S.sidebarTitle}>Catálogo de Módulos</div>

          <div style={{ padding: "12px 20px 8px" }}>
            <input
              type="text"
              placeholder="Buscar módulo..."
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              style={S.sidebarFilter}
            />
          </div>

          <div>
            {filtered.map((t) => (
              <div
                key={t.id}
                style={S.sidebarItem(tab === t.id)}
                onClick={() => setTab(t.id)}
              >
                <div style={S.sidebarNum(tab === t.id)}>{t.num}</div>
                <span>{t.label}</span>
              </div>
            ))}
            {filtered.length === 0 && (
              <div style={{ padding: "20px", fontSize: 12, color: "#999", textAlign: "center" }}>
                Sin resultados
              </div>
            )}
          </div>

          {/* Sección de configuración / accesos rápidos */}
          <div style={S.sidebarSection}>
            <div style={S.sidebarTitle}>Accesos Rápidos</div>
          </div>
          <div style={S.sidebarItem(false)}>
            <span style={{ fontSize: 13 }}>+ Nueva incidencia</span>
          </div>
          <div style={S.sidebarItem(false)}>
            <span style={{ fontSize: 13 }}>+ Nueva vacante</span>
          </div>
          <div style={S.sidebarItem(false)}>
            <span style={{ fontSize: 13 }}>+ Solicitud de capacitación</span>
          </div>
          <div style={S.sidebarItem(false)}>
            <span style={{ fontSize: 13 }}>+ Lanzar pulso de clima</span>
          </div>

          <div style={S.sidebarSection}>
            <div style={S.sidebarTitle}>Configuración</div>
          </div>
          <div style={S.sidebarItem(false)}>
            <span style={{ fontSize: 13 }}>Usuarios y permisos</span>
          </div>
          <div style={S.sidebarItem(false)}>
            <span style={{ fontSize: 13 }}>Catálogos maestros</span>
          </div>
          <div style={S.sidebarItem(false)}>
            <span style={{ fontSize: 13 }}>Integraciones</span>
          </div>
        </aside>

        {/* Contenido principal */}
        <div style={S.main}>{render()}</div>
      </div>
    </div>
  );
}
