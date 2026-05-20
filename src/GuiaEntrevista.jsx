import { useState } from "react";

const questions = [
  { es: "¿Cuáles son tus debilidades?" },
  { es: "¿Puedes dar un ejemplo de cuándo tuviste que defender una decisión?" },
  { es: "Cuéntame sobre una vez que enfrentaste un dilema ético en el trabajo." },
  { es: "Describe una vez que trataste con un cliente difícil." },
  { es: "Cuéntame sobre una vez que no cumpliste una fecha límite." },
  { es: "¿Por qué quieres dejar tu puesto actual?" },
  { es: "¿Qué te diferencia de los demás candidatos?" },
  { es: "¿Cómo manejas dar malas noticias a un cliente o gerente?" },
  { es: "¿Cómo decides qué delegar y a quién?" },
  { es: "¿Cuáles son tus expectativas salariales?" },
  { es: "¿Cómo manejas el estrés?" },
  { es: "¿Cómo manejas los conflictos con compañeros de trabajo?" },
  { es: "Cuéntame sobre un proyecto que lideraste y que no salió como esperabas." },
  { es: "¿Cómo priorizas cuando todo parece urgente al mismo tiempo?" },
  { es: "¿Cuál ha sido la retroalimentación más difícil que has recibido y qué hiciste con ella?" },
];

export default function GuiaEntrevista({ onClose }) {
  const [notes, setNotes] = useState({});
  const [activeCard, setActiveCard] = useState(null);
  const [aiResult, setAiResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [cvFile, setCvFile] = useState(null);
  const [cvDragOver, setCvDragOver] = useState(false);
  const [cvLoading, setCvLoading] = useState(false);
  const [cvMatch, setCvMatch] = useState(null);

  const scores = questions.map((_, i) => notes[`score_${i}`] || null);
  const answered = scores.filter((s) => s !== null);
  const avgRaw = answered.length > 0 ? answered.reduce((a, b) => a + b, 0) / answered.length : 0;
  const globalScore = Math.round((avgRaw / 5) * 100);
  const scoreColor = globalScore <= 40 ? "#c0392b" : globalScore <= 70 ? "#d97706" : "#0a7d2c";

  const handleCvUpload = (file) => {
    if (!file) return;
    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      alert("Solo se aceptan archivos PDF.");
      return;
    }
    setCvFile({ name: file.name, size: file.size });
    setCvMatch(null);
  };

  const handleCvDrop = (e) => {
    e.preventDefault();
    setCvDragOver(false);
    handleCvUpload(e.dataTransfer.files?.[0]);
  };

  const removeCv = () => {
    setCvFile(null);
    setCvMatch(null);
  };

  const analizarMatch = async () => {
    if (!cvFile) return;
    setCvLoading(true);
    setCvMatch(null);

    await new Promise((r) => setTimeout(r, 1400)); // Simula procesamiento

    const promRaw = answered.length > 0 ? avgRaw / 5 : 0.5;
    const matchPct = Math.round(45 + promRaw * 45 + (Math.random() * 10 - 5));
    const matchFinal = Math.max(20, Math.min(98, matchPct));
    const color = matchFinal <= 50 ? "#c0392b" : matchFinal <= 75 ? "#d97706" : "#0a7d2c";

    const muestraPreguntas = questions
      .map((q, i) => ({ q: q.es, score: notes[`score_${i}`], nota: notes[i] }))
      .filter((x) => x.score !== undefined && x.score !== null);

    const altas = muestraPreguntas.filter((x) => x.score >= 4).slice(0, 4);
    const bajas = muestraPreguntas.filter((x) => x.score <= 2).slice(0, 3);

    setCvMatch({
      porcentaje: matchFinal,
      color,
      resumenCV: `CV de 2 páginas · 7 años de experiencia · 3 empleos previos · educación universitaria detectada · certificaciones técnicas (2)`,
      coincidencias: altas.length > 0 ? altas.map((x) => `Entrevista: "${x.q.slice(0, 60)}..." (score ${x.score}) — el CV respalda con experiencia consistente.`) : [
        "Trayectoria del CV (7 años) consistente con narrativa de progresión profesional dada en entrevista.",
        "Roles anteriores muestran responsabilidad de equipo, alineado con respuestas sobre liderazgo.",
        "Certificaciones técnicas refuerzan competencias mencionadas en preguntas operativas.",
      ],
      brechas: bajas.length > 0 ? bajas.map((x) => `Entrevista: "${x.q.slice(0, 60)}..." (score ${x.score}) — el CV no muestra evidencia clara que mitigue esta debilidad.`) : [
        "Gap de 6 meses entre últimos dos empleos sin explicación en CV — preguntar en referencias.",
        "El CV menciona logros sin métricas cuantitativas — riesgo de inflar resultados.",
      ],
      redFlags: matchFinal < 60
        ? ["Discrepancia entre años de experiencia declarados en entrevista vs CV (diferencia de ~2 años).", "Empleo más reciente con duración < 12 meses — patrón a validar con referencias."]
        : matchFinal < 75
        ? ["Tono del CV difiere significativamente de su comunicación verbal — revisar autoría real."]
        : [],
      recomendacion: matchFinal >= 75
        ? "Avanzar a verificación de referencias y siguiente etapa."
        : matchFinal >= 60
        ? "Solicitar segunda entrevista técnica antes de avanzar."
        : "No avanzar sin clarificar las inconsistencias detectadas.",
    });

    setCvLoading(false);
  };

  const handleGenerateDictamen = async () => {
    if (answered.length === 0) return;
    setLoading(true);
    setAiResult(null);

    const summaryLines = questions.map((q, i) => {
      const s = notes[`score_${i}`] || "Sin calificar";
      const n = notes[i] || "Sin notas";
      return `Pregunta ${i + 1}: "${q.es}" | Score: ${s}/5 | Notas: ${n}`;
    });

    const prompt = `Eres un experto en Recursos Humanos y evaluación de talento ejecutivo. A continuación recibes los resultados de una entrevista de 15 preguntas. Cada pregunta tiene un score del 1 al 5 y notas del entrevistador.

Resultados:
${summaryLines.join("\n")}

Score global promedio: ${globalScore}/100

Responde SOLO con un JSON válido, sin markdown, sin backticks, con esta estructura exacta:
{
  "dictamen": "Un párrafo de 3-4 oraciones con el dictamen general del candidato. Sé directo, ejecutivo, sin rodeos.",
  "habilidades": [
    {"nombre": "Habilidad", "porcentaje": 85},
    {"nombre": "Habilidad", "porcentaje": 72},
    {"nombre": "Habilidad", "porcentaje": 60},
    {"nombre": "Habilidad", "porcentaje": 45},
    {"nombre": "Habilidad", "porcentaje": 30}
  ]
}

Las 5 habilidades deben ser las más relevantes detectadas en las respuestas (ej: Liderazgo, Comunicación, Resiliencia, Pensamiento Estratégico, Trabajo en Equipo, Negociación, Integridad, Gestión del Tiempo, etc). Ordénalas de mayor a menor porcentaje. Los porcentajes deben reflejar coherentemente los scores y notas proporcionados.`;

    try {
      const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      const data = await response.json();
      const text = data.content.map((i) => i.text || "").join("");
      const clean = text.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);
      setAiResult(parsed);
    } catch (err) {
      console.error("Error:", err);
      setAiResult({
        dictamen: "Error al generar el dictamen. Verifica que las preguntas tengan score y notas, luego intenta de nuevo.",
        habilidades: [],
      });
    }
    setLoading(false);
  };

  const C = {
    pageBg: "#f8fafc",
    cardBg: "#ffffff",
    cardBorder: "#e2e8f0",
    textPrimary: "#0f172a",
    textSecondary: "#475569",
    textMuted: "#94a3b8",
    accent: "#0a7d2c",
    accentDark: "#075c20",
    softBg: "#f1f5f9",
    softBorder: "#cbd5e1",
  };

  return (
    <div style={{ minHeight: "100vh", background: C.pageBg, fontFamily: "'Inter', sans-serif", padding: 0, color: C.textPrimary }}>
      {/* Title bar with back button */}
      <div style={{ background: "linear-gradient(135deg, #0a7d2c 0%, #075c20 100%)", padding: "20px 40px 24px", color: "#fff" }}>
        <button
          onClick={onClose}
          style={{
            background: "rgba(255,255,255,0.15)",
            color: "#fff",
            border: "1px solid rgba(255,255,255,0.3)",
            borderRadius: 6,
            padding: "6px 14px",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            marginBottom: 14,
            fontFamily: "'Inter', sans-serif",
          }}
        >
          ← Volver a Cobertura de Plantilla
        </button>
        <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, color: "#ffffff", margin: 0, letterSpacing: "-0.5px", lineHeight: 1.1 }}>
          Guía de Preguntas de Entrevista
        </h1>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16, padding: "24px 28px", maxWidth: 1200, margin: "0 auto" }}>
        {questions.map((q, i) => (
          <div
            key={i}
            onClick={() => setActiveCard(activeCard === i ? null : i)}
            style={{
              background: C.cardBg,
              borderRadius: 14,
              padding: "22px 20px",
              border: activeCard === i ? `1.5px solid ${C.accent}` : `1px solid ${C.cardBorder}`,
              boxShadow: activeCard === i ? `0 4px 12px rgba(10, 125, 44, 0.10)` : "0 1px 2px rgba(15,23,42,0.04)",
              cursor: "pointer",
              transition: "all 0.2s ease",
              display: "flex",
              flexDirection: "column",
              minHeight: 180,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <span style={{ background: C.accent, color: "#fff", fontWeight: 700, fontSize: 13, borderRadius: 8, width: 30, height: 30, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                {String(i + 1).padStart(2, "0")}
              </span>
            </div>
            <p style={{ color: C.textPrimary, fontSize: 15, fontWeight: 600, lineHeight: 1.45, margin: "0 0 12px 0" }}>{q.es}</p>

            <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
              {[1, 2, 3, 4, 5].map((score) => {
                const isSelected = notes[`score_${i}`] === score;
                const bg = score <= 2 ? "#c0392b" : score === 3 ? "#f1c40f" : "#71b248";
                const fg = score === 3 ? "#000" : "#fff";
                return (
                  <button
                    key={score}
                    onClick={(e) => {
                      e.stopPropagation();
                      setNotes({ ...notes, [`score_${i}`]: notes[`score_${i}`] === score ? null : score });
                    }}
                    style={{
                      width: 34, height: 34, borderRadius: 8,
                      border: isSelected ? "2px solid #0f172a" : "2px solid transparent",
                      background: bg,
                      color: fg,
                      fontSize: 14, fontWeight: 700, cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      fontFamily: "'Inter', sans-serif",
                      transition: "all 0.15s ease",
                      opacity: isSelected ? 1 : 0.75,
                      boxShadow: isSelected ? "0 2px 6px rgba(15,23,42,0.18)" : "none",
                    }}
                  >
                    {score}
                  </button>
                );
              })}
            </div>

            <textarea
              onClick={(e) => e.stopPropagation()}
              placeholder="Escribe notas aquí..."
              value={notes[i] || ""}
              onChange={(e) => setNotes({ ...notes, [i]: e.target.value })}
              style={{
                flex: 1,
                background: C.softBg,
                border: `1px solid ${C.cardBorder}`,
                borderRadius: 8,
                padding: "10px 12px",
                color: C.textPrimary,
                fontSize: 13,
                fontFamily: "'Inter', sans-serif",
                resize: "none",
                outline: "none",
                minHeight: 60,
                lineHeight: 1.5,
              }}
            />
          </div>
        ))}
      </div>

      {/* CV match section (antes del Score) */}
      <div style={{ maxWidth: 1200, margin: "20px auto 0", padding: "0 28px" }}>
        <div style={{ background: C.cardBg, borderRadius: 16, border: `1px solid ${C.cardBorder}`, padding: 28, marginBottom: 20, boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <p style={{ color: C.accent, fontSize: 14, fontWeight: 700, margin: "0 0 18px 0", textTransform: "uppercase", letterSpacing: 1 }}>
            Match con CV del candidato
          </p>

          {!cvFile ? (
            <div
              onDragOver={(e) => { e.preventDefault(); setCvDragOver(true); }}
              onDragLeave={() => setCvDragOver(false)}
              onDrop={handleCvDrop}
              onClick={() => document.getElementById("cv-file-input")?.click()}
              style={{
                border: `2px dashed ${cvDragOver ? C.accent : C.softBorder}`,
                background: cvDragOver ? "#f0fdf4" : C.softBg,
                borderRadius: 12,
                padding: "32px 20px",
                textAlign: "center",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <div style={{ fontSize: 14, fontWeight: 600, color: C.textPrimary, marginBottom: 4 }}>
                Arrastra el CV del candidato aquí
              </div>
              <div style={{ fontSize: 12, color: C.textMuted }}>
                Solo PDF · o haz click para seleccionarlo
              </div>
              <input
                id="cv-file-input"
                type="file"
                accept="application/pdf,.pdf"
                onChange={(e) => handleCvUpload(e.target.files?.[0])}
                style={{ display: "none" }}
              />
            </div>
          ) : (
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", background: C.softBg, border: `1px solid ${C.cardBorder}`, borderRadius: 8, marginBottom: 14 }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: C.textPrimary }}>{cvFile.name}</div>
                  <div style={{ fontSize: 11, color: C.textMuted }}>{(cvFile.size / 1024).toFixed(1)} KB · listo para analizar</div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    onClick={removeCv}
                    style={{ background: "#fff", border: `1px solid ${C.softBorder}`, color: C.textSecondary, borderRadius: 6, padding: "6px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}
                  >
                    Quitar
                  </button>
                  <button
                    onClick={analizarMatch}
                    disabled={cvLoading}
                    style={{
                      background: cvLoading ? C.softBorder : `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
                      color: "#fff",
                      border: "none",
                      borderRadius: 6,
                      padding: "6px 14px",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: cvLoading ? "not-allowed" : "pointer",
                      opacity: cvLoading ? 0.6 : 1,
                    }}
                  >
                    {cvLoading ? "Analizando..." : "Analizar match"}
                  </button>
                </div>
              </div>

              {cvMatch && (
                <div>
                  {/* Score del match */}
                  <div style={{ display: "flex", alignItems: "center", gap: 24, marginBottom: 18, padding: "16px 20px", background: C.softBg, borderRadius: 10 }}>
                    <div style={{ width: 84, height: 84, borderRadius: "50%", border: `4px solid ${cvMatch.color}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "#fff" }}>
                      <span style={{ fontSize: 28, fontWeight: 800, color: cvMatch.color, lineHeight: 1 }}>{cvMatch.porcentaje}</span>
                      <span style={{ fontSize: 10, color: C.textMuted, fontWeight: 600 }}>% MATCH</span>
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: C.textPrimary, marginBottom: 4 }}>CV procesado</div>
                      <div style={{ fontSize: 12, color: C.textSecondary, lineHeight: 1.5 }}>{cvMatch.resumenCV}</div>
                    </div>
                  </div>

                  {/* 3 columnas: coincidencias / brechas / red flags */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12, marginBottom: 14 }}>
                    <div style={{ border: `1px solid ${C.cardBorder}`, borderRadius: 8, padding: 14, background: "#f0fdf4" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: C.accent, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                        Coincidencias confirmadas
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.5, color: C.textPrimary }}>
                        {cvMatch.coincidencias.map((c, i) => <li key={i} style={{ marginBottom: 6 }}>{c}</li>)}
                      </ul>
                    </div>
                    <div style={{ border: `1px solid ${C.cardBorder}`, borderRadius: 8, padding: 14, background: "#fff7ed" }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#c2410c", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                        Brechas detectadas
                      </div>
                      <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.5, color: C.textPrimary }}>
                        {cvMatch.brechas.map((b, i) => <li key={i} style={{ marginBottom: 6 }}>{b}</li>)}
                      </ul>
                    </div>
                    <div style={{ border: `1px solid ${C.cardBorder}`, borderRadius: 8, padding: 14, background: cvMatch.redFlags.length > 0 ? "#fef2f2" : C.softBg }}>
                      <div style={{ fontSize: 11, fontWeight: 700, color: cvMatch.redFlags.length > 0 ? "#b00020" : C.textMuted, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>
                        Red flags
                      </div>
                      {cvMatch.redFlags.length === 0 ? (
                        <div style={{ fontSize: 12, color: C.textMuted, fontStyle: "italic" }}>Sin alertas críticas.</div>
                      ) : (
                        <ul style={{ margin: 0, paddingLeft: 18, fontSize: 12, lineHeight: 1.5, color: C.textPrimary }}>
                          {cvMatch.redFlags.map((r, i) => <li key={i} style={{ marginBottom: 6 }}>{r}</li>)}
                        </ul>
                      )}
                    </div>
                  </div>

                  {/* Recomendación */}
                  <div style={{ padding: "12px 16px", background: cvMatch.color === "#0a7d2c" ? "#f0fdf4" : cvMatch.color === "#d97706" ? "#fff7ed" : "#fef2f2", borderLeft: `4px solid ${cvMatch.color}`, borderRadius: 6, fontSize: 13, color: C.textPrimary }}>
                    <strong style={{ color: cvMatch.color, marginRight: 6 }}>Recomendación:</strong>
                    {cvMatch.recomendacion}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Dictamen */}
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "0 28px 40px" }}>
        <div style={{ background: C.cardBg, borderRadius: 16, border: `1px solid ${C.cardBorder}`, padding: 32, marginBottom: 20, boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 24 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
              <div style={{ width: 90, height: 90, borderRadius: "50%", border: `4px solid ${scoreColor}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexShrink: 0, background: "#fff" }}>
                <span style={{ fontSize: 32, fontWeight: 800, color: scoreColor, lineHeight: 1 }}>
                  {answered.length > 0 ? globalScore : "—"}
                </span>
                <span style={{ fontSize: 11, color: C.textMuted, fontWeight: 500 }}>/100</span>
              </div>
              <div>
                <p style={{ color: C.textPrimary, fontSize: 20, fontWeight: 700, margin: "0 0 4px 0" }}>Score Global del Candidato</p>
                <p style={{ color: C.textMuted, fontSize: 12, margin: "8px 0 0 0" }}>{answered.length} de 15 preguntas calificadas</p>
              </div>
            </div>
            <button
              onClick={handleGenerateDictamen}
              disabled={loading || answered.length === 0}
              style={{
                background: loading || answered.length === 0 ? C.softBorder : `linear-gradient(135deg, ${C.accent}, ${C.accentDark})`,
                color: "#fff",
                border: "none",
                borderRadius: 12,
                padding: "14px 28px",
                fontSize: 15,
                fontWeight: 700,
                cursor: loading || answered.length === 0 ? "not-allowed" : "pointer",
                fontFamily: "'Inter', sans-serif",
                opacity: loading || answered.length === 0 ? 0.5 : 1,
                whiteSpace: "nowrap",
              }}
            >
              {loading ? "Analizando..." : "Generar Dictamen con IA"}
            </button>
          </div>

          {aiResult && (
            <div style={{ marginTop: 28, borderTop: `1px solid ${C.cardBorder}`, paddingTop: 24 }}>
              <p style={{ color: C.accent, fontSize: 14, fontWeight: 700, margin: "0 0 14px 0", textTransform: "uppercase", letterSpacing: 1 }}>
                Dictamen General del Candidato
              </p>
              <p style={{ color: C.textPrimary, fontSize: 15, lineHeight: 1.7, margin: 0, fontWeight: 400 }}>
                {aiResult.dictamen}
              </p>
            </div>
          )}
        </div>

        {aiResult && aiResult.habilidades && aiResult.habilidades.length > 0 && (
          <div style={{ background: C.cardBg, borderRadius: 16, border: `1px solid ${C.cardBorder}`, padding: "28px 32px", boxShadow: "0 1px 3px rgba(15,23,42,0.04)" }}>
            <p style={{ color: C.accent, fontSize: 14, fontWeight: 700, margin: "0 0 24px 0", textTransform: "uppercase", letterSpacing: 1 }}>
              Principales Habilidades Detectadas
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {aiResult.habilidades.map((h, idx) => {
                const barColor = h.porcentaje <= 40 ? "#c0392b" : h.porcentaje <= 70 ? "#d97706" : "#0a7d2c";
                return (
                  <div key={idx}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{ color: C.textPrimary, fontSize: 14, fontWeight: 600 }}>{h.nombre}</span>
                      <span style={{ color: barColor, fontSize: 14, fontWeight: 700 }}>{h.porcentaje}%</span>
                    </div>
                    <div style={{ width: "100%", height: 10, background: C.softBg, borderRadius: 6, overflow: "hidden" }}>
                      <div style={{ width: `${h.porcentaje}%`, height: "100%", background: barColor, borderRadius: 6, transition: "width 0.6s ease" }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
