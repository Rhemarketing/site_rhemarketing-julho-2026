"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { DiarioEntry } from "@/lib/db";

interface Props {
  username: string;
}

interface AvailableDate {
  entry_date: string;
  total_entries: number;
  billable_entries: number;
}

function calculateDuration(start: string, end: string): string {
  try {
    const [sH, sM] = start.split(":").map(Number);
    const [eH, eM] = end.split(":").map(Number);
    if (isNaN(sH) || isNaN(sM) || isNaN(eH) || isNaN(eM)) return "00:00:00";
    let diff = eH * 60 + eM - (sH * 60 + sM);
    if (diff < 0) diff += 24 * 60; // cruza meia-noite
    const h = Math.floor(diff / 60);
    const m = diff % 60;
    return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:00`;
  } catch {
    return "00:00:00";
  }
}

function formatDateBr(isoDate: string): string {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-");
  return `${d}/${m}/${y}`;
}

function getDayOfWeekName(isoDate: string): string {
  if (!isoDate) return "";
  const [y, m, d] = isoDate.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const days = [
    "Domingo",
    "Segunda-feira",
    "Terça-feira",
    "Quarta-feira",
    "Quinta-feira",
    "Sexta-feira",
    "Sábado",
  ];
  return days[date.getDay()] || "";
}

function sumDurations(durations: string[]): string {
  let totalMinutes = 0;
  for (const d of durations) {
    if (!d) continue;
    const parts = d.split(":").map(Number);
    const h = parts[0] || 0;
    const m = parts[1] || 0;
    totalMinutes += h * 60 + m;
  }
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  return `${String(h).padStart(2, "0")}h ${String(m).padStart(2, "0")}min`;
}

export default function DiarioBordoClient({ username }: Props) {
  const router = useRouter();

  // Estados principais
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [availableDates, setAvailableDates] = useState<AvailableDate[]>([]);
  const [entries, setEntries] = useState<DiarioEntry[]>([]);
  const [originalEntries, setOriginalEntries] = useState<DiarioEntry[]>([]);
  const [deletedIds, setDeletedIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Sugestões para autocompletar
  const [suggestions, setSuggestions] = useState<{
    categories: string[];
    clients: string[];
    locations: string[];
  }>({
    categories: [],
    clients: [],
    locations: [],
  });

  // Estado da célula em edição
  const [editingCell, setEditingCell] = useState<{
    rowId: number;
    field: keyof DiarioEntry;
  } | null>(null);

  // Modo de visualização (tabela ou cartões no mobile)
  const [viewMode, setViewMode] = useState<"table" | "cards">("table");

  // Ref para focar no input de edição
  const editInputRef = useRef<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>(null);

  // Carregar dados da API
  const loadData = async (dateToLoad?: string) => {
    try {
      setLoading(true);
      setErrorMsg("");
      const url = dateToLoad
        ? `/api/admin/diario?date=${encodeURIComponent(dateToLoad)}`
        : `/api/admin/diario`;

      const res = await fetch(url);
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        throw new Error("Erro ao buscar dados do diário de bordo.");
      }

      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Erro desconhecido.");

      setAvailableDates(data.availableDates || []);
      setSelectedDate(data.selectedDate || "");
      setEntries(data.entries || []);
      setOriginalEntries(JSON.parse(JSON.stringify(data.entries || [])));
      setDeletedIds([]);
      setEditingCell(null);

      if (data.suggestions) {
        setSuggestions(data.suggestions);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Erro inesperado ao carregar dados.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Focar no input quando entrar em edição
  useEffect(() => {
    if (editingCell && editInputRef.current) {
      editInputRef.current.focus();
      if ("select" in editInputRef.current) {
        editInputRef.current.select();
      }
    }
  }, [editingCell]);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  // Detectar alterações não salvas
  const isDirty = useMemo(() => {
    if (deletedIds.length > 0) return true;
    if (entries.length !== originalEntries.length) return true;

    for (let i = 0; i < entries.length; i++) {
      const current = entries[i];
      const orig = originalEntries.find((o) => o.id === current.id);
      if (!orig) return true; // novo registro
      if (
        current.start_time !== orig.start_time ||
        current.end_time !== orig.end_time ||
        current.duration !== orig.duration ||
        current.category !== orig.category ||
        current.project_client !== orig.project_client ||
        current.context_location !== orig.context_location ||
        current.description !== orig.description ||
        current.billable !== orig.billable
      ) {
        return true;
      }
    }
    return false;
  }, [entries, originalEntries, deletedIds]);

  // Navegação entre dias
  const currentIndex = availableDates.findIndex((d) => d.entry_date === selectedDate);

  const handlePrevDay = () => {
    if (isDirty) {
      if (!confirm("Você tem alterações não salvas neste dia. Deseja descartar e mudar de data?")) {
        return;
      }
    }
    if (currentIndex >= 0 && currentIndex < availableDates.length - 1) {
      const prevDate = availableDates[currentIndex + 1].entry_date;
      loadData(prevDate);
    } else {
      // Se não há na lista, subtrai 1 dia
      const [y, m, d] = selectedDate.split("-").map(Number);
      const prev = new Date(y, m - 1, d - 1);
      const iso = prev.toISOString().split("T")[0];
      loadData(iso);
    }
  };

  const handleNextDay = () => {
    if (isDirty) {
      if (!confirm("Você tem alterações não salvas neste dia. Deseja descartar e mudar de data?")) {
        return;
      }
    }
    if (currentIndex > 0) {
      const nextDate = availableDates[currentIndex - 1].entry_date;
      loadData(nextDate);
    } else {
      // Se não há na lista, avança 1 dia
      const [y, m, d] = selectedDate.split("-").map(Number);
      const next = new Date(y, m - 1, d + 1);
      const iso = next.toISOString().split("T")[0];
      loadData(iso);
    }
  };

  const handleDateChange = (newDate: string) => {
    if (isDirty) {
      if (!confirm("Você tem alterações não salvas neste dia. Deseja descartar e mudar de data?")) {
        return;
      }
    }
    loadData(newDate);
  };

  // Edição de células
  const handleStartEdit = (rowId: number, field: keyof DiarioEntry) => {
    setEditingCell({ rowId, field });
  };

  const handleCellChange = (rowId: number, field: keyof DiarioEntry, value: any) => {
    setEntries((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;
        const updated = { ...row, [field]: value };

        // Recalcular duração se início ou fim mudarem
        if (field === "start_time" || field === "end_time") {
          updated.duration = calculateDuration(updated.start_time, updated.end_time);
        }
        return updated;
      })
    );
  };

  const handleFinishEdit = () => {
    setEditingCell(null);
  };

  // Adicionar novo registro ao dia
  const handleAddRow = () => {
    const lastEntry = entries[entries.length - 1];
    const defaultStart = lastEntry ? lastEntry.end_time : "08:30";
    const [h, m] = defaultStart.split(":").map(Number);
    let nextH = h;
    let nextM = m + 30;
    if (nextM >= 60) {
      nextH = (nextH + 1) % 24;
      nextM = nextM - 60;
    }
    const defaultEnd = `${String(nextH).padStart(2, "0")}:${String(nextM).padStart(2, "0")}`;

    const newRow: DiarioEntry = {
      id: -Date.now(), // ID temporário negativo
      entry_date: selectedDate,
      start_time: defaultStart,
      end_time: defaultEnd,
      duration: calculateDuration(defaultStart, defaultEnd),
      category: "Trabalho",
      project_client: "Rhemarketing",
      context_location: "Espaço Vip",
      description: "Nova atividade...",
      billable: "Não",
    };

    setEntries((prev) => [...prev, newRow]);
    setEditingCell({ rowId: newRow.id, field: "description" });
  };

  // Excluir registro
  const handleDeleteRow = (id: number) => {
    if (!confirm("Deseja realmente remover este registro?")) return;
    if (id > 0) {
      setDeletedIds((prev) => [...prev, id]);
    }
    setEntries((prev) => prev.filter((row) => row.id !== id));
  };

  // Salvar alterações no banco
  const handleSave = async () => {
    try {
      setSaving(true);
      setErrorMsg("");
      setSuccessMsg("");

      // Identificar itens que foram criados ou modificados
      const upsertItems = entries.filter((current) => {
        if (current.id < 0) return true; // novo
        const orig = originalEntries.find((o) => o.id === current.id);
        if (!orig) return true;
        return (
          current.start_time !== orig.start_time ||
          current.end_time !== orig.end_time ||
          current.duration !== orig.duration ||
          current.category !== orig.category ||
          current.project_client !== orig.project_client ||
          current.context_location !== orig.context_location ||
          current.description !== orig.description ||
          current.billable !== orig.billable
        );
      });

      const payload = {
        date: selectedDate,
        upsert: upsertItems,
        deleteIds: deletedIds,
      };

      const res = await fetch("/api/admin/diario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar alterações.");

      setSuccessMsg("Todas as alterações foram salvas com sucesso no banco de dados!");
      setEntries(data.entries || []);
      setOriginalEntries(JSON.parse(JSON.stringify(data.entries || [])));
      setDeletedIds([]);
      setAvailableDates(data.availableDates || availableDates);
      setEditingCell(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Erro ao salvar alterações.");
      }
    } finally {
      setSaving(false);
    }
  };

  // Métricas do dia
  const totalDayHours = useMemo(() => {
    return sumDurations(entries.map((e) => e.duration));
  }, [entries]);

  const billableDayHours = useMemo(() => {
    return sumDurations(entries.filter((e) => e.billable === "Sim").map((e) => e.duration));
  }, [entries]);

  const nonBillableDayHours = useMemo(() => {
    return sumDurations(entries.filter((e) => e.billable === "Não").map((e) => e.duration));
  }, [entries]);

  return (
    <div className="admin-container diario-admin-page">
      {/* Autocomplete Datalists */}
      <datalist id="categories-list">
        {suggestions.categories.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <datalist id="clients-list">
        {suggestions.clients.map((c) => (
          <option key={c} value={c} />
        ))}
      </datalist>
      <datalist id="locations-list">
        {suggestions.locations.map((l) => (
          <option key={l} value={l} />
        ))}
      </datalist>

      {/* Barra Superior */}
      <header className="admin-topbar">
        <div className="admin-topbar-left">
          <Link href="/" className="brand">
            <span>Patrick</span> Mendes
          </Link>
          <span className="admin-pill">Painel Administrativo</span>
        </div>

        <div className="admin-topbar-right">
          <span className="admin-user-info">
            Logado como <b>{username}</b>
          </span>
          <button onClick={handleLogout} className="admin-btn-logout">
            Sair
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="admin-main">
        {/* Abas Superiores de Navegação Admin */}
        <div className="admin-section-header">
          <div className="admin-tabs">
            <Link href="/admin" className="admin-tab">
              🖼️ Galerias (Portfólio)
            </Link>
            <Link href="/admin/diario-de-bordo" className="admin-tab active">
              📋 Diário de Bordo & Rotina
            </Link>
          </div>
        </div>

        {/* Notificações */}
        {errorMsg && (
          <div className="admin-banner error">
            <span>⚠</span> {errorMsg}
            <button onClick={() => setErrorMsg("")}>✕</button>
          </div>
        )}
        {successMsg && (
          <div className="admin-banner success">
            <span>✓</span> {successMsg}
            <button onClick={() => setSuccessMsg("")}>✕</button>
          </div>
        )}

        {/* Bloco de Navegação de Datas */}
        <div className="diario-controls-card">
          <div className="diario-date-selector">
            <button
              onClick={handlePrevDay}
              className="diario-btn-nav"
              title="Dia anterior"
              disabled={loading}
            >
              ← Dia Anterior
            </button>

            <div className="diario-date-picker-wrap">
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => handleDateChange(e.target.value)}
                className="diario-date-input"
              />
              <span className="diario-day-label">
                {getDayOfWeekName(selectedDate)} • {formatDateBr(selectedDate)}
              </span>
            </div>

            <button
              onClick={handleNextDay}
              className="diario-btn-nav"
              title="Próximo dia"
              disabled={loading}
            >
              Próximo Dia →
            </button>

            <select
              value={selectedDate}
              onChange={(e) => handleDateChange(e.target.value)}
              className="diario-quick-date-select"
              title="Ir direto para uma data gravada"
            >
              {availableDates.map((d) => (
                <option key={d.entry_date} value={d.entry_date}>
                  {formatDateBr(d.entry_date)} ({getDayOfWeekName(d.entry_date)}) — {d.total_entries} regs
                </option>
              ))}
            </select>
          </div>

          <div className="diario-actions-bar">
            <button
              onClick={handleAddRow}
              className="admin-btn-secondary diario-btn-add"
              disabled={loading || saving}
            >
              + Adicionar Linha
            </button>

            <button
              onClick={handleSave}
              className={`admin-btn-primary diario-btn-save ${isDirty ? "dirty" : ""}`}
              disabled={loading || saving || !isDirty}
            >
              {saving ? "Salvando no Banco..." : isDirty ? "💾 Salvar Alterações *" : "✓ Salvo no Banco"}
            </button>
          </div>
        </div>

        {/* Cartões de Métricas do Dia */}
        <div className="diario-kpi-grid">
          <div className="diario-kpi-card">
            <span className="kpi-label">Total de Horas do Dia</span>
            <span className="kpi-value">{totalDayHours}</span>
            <span className="kpi-sub">{entries.length} registros</span>
          </div>
          <div className="diario-kpi-card faturavel">
            <span className="kpi-label">Horas Faturáveis</span>
            <span className="kpi-value text-green">{billableDayHours}</span>
            <span className="kpi-sub">
              {entries.filter((e) => e.billable === "Sim").length} atividades faturáveis
            </span>
          </div>
          <div className="diario-kpi-card nao-faturavel">
            <span className="kpi-label">Não Faturáveis (Gestão/Pausa)</span>
            <span className="kpi-value text-muted">{nonBillableDayHours}</span>
            <span className="kpi-sub">
              {entries.filter((e) => e.billable === "Não").length} atividades internas
            </span>
          </div>
        </div>

        {/* Dica de Duplo Clique e Toggle de Visualização Mobile */}
        <div className="diario-table-toolbar">
          <div className="diario-hint">
            💡 <b>Dica:</b> Dê <b>duplo clique</b> em qualquer célula para editar seu conteúdo. Pressione <b>Enter</b> para confirmar.
          </div>

          <div className="diario-view-toggle">
            <button
              className={`toggle-btn ${viewMode === "table" ? "active" : ""}`}
              onClick={() => setViewMode("table")}
            >
              Tabela
            </button>
            <button
              className={`toggle-btn ${viewMode === "cards" ? "active" : ""}`}
              onClick={() => setViewMode("cards")}
            >
              Cartões
            </button>
          </div>
        </div>

        {/* Tabela de Registros */}
        {loading ? (
          <div className="admin-loading-state">
            <div className="spinner"></div>
            <p>Carregando registros do dia {formatDateBr(selectedDate)}...</p>
          </div>
        ) : entries.length === 0 ? (
          <div className="diario-empty-state">
            <p>Nenhum registro encontrado para {formatDateBr(selectedDate)}.</p>
            <button onClick={handleAddRow} className="admin-btn-primary">
              + Criar Primeiro Registro do Dia
            </button>
          </div>
        ) : viewMode === "table" ? (
          <div className="diario-table-container">
            <table className="diario-table">
              <thead>
                <tr>
                  <th style={{ width: "110px" }}>Início</th>
                  <th style={{ width: "110px" }}>Fim</th>
                  <th style={{ width: "90px" }}>Duração</th>
                  <th style={{ width: "140px" }}>Categoria</th>
                  <th style={{ width: "180px" }}>Cliente / Projeto</th>
                  <th style={{ width: "130px" }}>Local</th>
                  <th>Descrição Detalhada</th>
                  <th style={{ width: "100px" }}>Faturável</th>
                  <th style={{ width: "60px" }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {entries.map((row) => {
                  const isRowNew = row.id < 0;
                  return (
                    <tr key={row.id} className={isRowNew ? "row-new" : ""}>
                      {/* Início */}
                      <td
                        onDoubleClick={() => handleStartEdit(row.id, "start_time")}
                        className="cell-editable"
                        title="Dê duplo clique para editar"
                      >
                        {editingCell?.rowId === row.id && editingCell?.field === "start_time" ? (
                          <input
                            ref={editInputRef as any}
                            type="time"
                            value={row.start_time}
                            onChange={(e) => handleCellChange(row.id, "start_time", e.target.value)}
                            onBlur={handleFinishEdit}
                            onKeyDown={(e) => e.key === "Enter" && handleFinishEdit()}
                            className="cell-inline-input"
                          />
                        ) : (
                          <span className="time-badge">{row.start_time}</span>
                        )}
                      </td>

                      {/* Fim */}
                      <td
                        onDoubleClick={() => handleStartEdit(row.id, "end_time")}
                        className="cell-editable"
                        title="Dê duplo clique para editar"
                      >
                        {editingCell?.rowId === row.id && editingCell?.field === "end_time" ? (
                          <input
                            ref={editInputRef as any}
                            type="time"
                            value={row.end_time}
                            onChange={(e) => handleCellChange(row.id, "end_time", e.target.value)}
                            onBlur={handleFinishEdit}
                            onKeyDown={(e) => e.key === "Enter" && handleFinishEdit()}
                            className="cell-inline-input"
                          />
                        ) : (
                          <span className="time-badge">{row.end_time}</span>
                        )}
                      </td>

                      {/* Duração */}
                      <td className="cell-duration">
                        <span className="duration-pill">{row.duration}</span>
                      </td>

                      {/* Categoria */}
                      <td
                        onDoubleClick={() => handleStartEdit(row.id, "category")}
                        className="cell-editable"
                        title="Dê duplo clique para editar"
                      >
                        {editingCell?.rowId === row.id && editingCell?.field === "category" ? (
                          <input
                            ref={editInputRef as any}
                            list="categories-list"
                            value={row.category}
                            onChange={(e) => handleCellChange(row.id, "category", e.target.value)}
                            onBlur={handleFinishEdit}
                            onKeyDown={(e) => e.key === "Enter" && handleFinishEdit()}
                            className="cell-inline-input"
                          />
                        ) : (
                          <span className="category-pill">{row.category}</span>
                        )}
                      </td>

                      {/* Cliente / Projeto */}
                      <td
                        onDoubleClick={() => handleStartEdit(row.id, "project_client")}
                        className="cell-editable"
                        title="Dê duplo clique para editar"
                      >
                        {editingCell?.rowId === row.id && editingCell?.field === "project_client" ? (
                          <input
                            ref={editInputRef as any}
                            list="clients-list"
                            value={row.project_client}
                            onChange={(e) => handleCellChange(row.id, "project_client", e.target.value)}
                            onBlur={handleFinishEdit}
                            onKeyDown={(e) => e.key === "Enter" && handleFinishEdit()}
                            className="cell-inline-input"
                          />
                        ) : (
                          <span className="client-text">{row.project_client}</span>
                        )}
                      </td>

                      {/* Local */}
                      <td
                        onDoubleClick={() => handleStartEdit(row.id, "context_location")}
                        className="cell-editable"
                        title="Dê duplo clique para editar"
                      >
                        {editingCell?.rowId === row.id && editingCell?.field === "context_location" ? (
                          <input
                            ref={editInputRef as any}
                            list="locations-list"
                            value={row.context_location}
                            onChange={(e) => handleCellChange(row.id, "context_location", e.target.value)}
                            onBlur={handleFinishEdit}
                            onKeyDown={(e) => e.key === "Enter" && handleFinishEdit()}
                            className="cell-inline-input"
                          />
                        ) : (
                          <span className="location-text">{row.context_location}</span>
                        )}
                      </td>

                      {/* Descrição Detalhada */}
                      <td
                        onDoubleClick={() => handleStartEdit(row.id, "description")}
                        className="cell-editable cell-desc"
                        title="Dê duplo clique para editar"
                      >
                        {editingCell?.rowId === row.id && editingCell?.field === "description" ? (
                          <textarea
                            ref={editInputRef as any}
                            value={row.description}
                            onChange={(e) => handleCellChange(row.id, "description", e.target.value)}
                            onBlur={handleFinishEdit}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" && !e.shiftKey) {
                                e.preventDefault();
                                handleFinishEdit();
                              }
                            }}
                            className="cell-inline-textarea"
                            rows={3}
                          />
                        ) : (
                          <p className="description-text">{row.description}</p>
                        )}
                      </td>

                      {/* Faturável */}
                      <td className="cell-editable text-center">
                        <button
                          type="button"
                          onClick={() =>
                            handleCellChange(
                              row.id,
                              "billable",
                              row.billable === "Sim" ? "Não" : "Sim"
                            )
                          }
                          className={`billable-badge ${row.billable === "Sim" ? "yes" : "no"}`}
                          title="Clique para alternar Sim/Não"
                        >
                          {row.billable}
                        </button>
                      </td>

                      {/* Ações */}
                      <td className="text-center">
                        <button
                          onClick={() => handleDeleteRow(row.id)}
                          className="btn-delete-row"
                          title="Excluir linha"
                        >
                          🗑
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* Visualização alternativa em Cartões (Mobile First) */
          <div className="diario-cards-grid">
            {entries.map((row) => (
              <div key={row.id} className="diario-entry-card">
                <div className="card-top">
                  <span className="time-badge">
                    {row.start_time} - {row.end_time}
                  </span>
                  <span className="duration-pill">{row.duration}</span>
                  <button
                    onClick={() =>
                      handleCellChange(row.id, "billable", row.billable === "Sim" ? "Não" : "Sim")
                    }
                    className={`billable-badge ${row.billable === "Sim" ? "yes" : "no"}`}
                  >
                    {row.billable === "Sim" ? "Faturável" : "Interno"}
                  </button>
                  <button
                    onClick={() => handleDeleteRow(row.id)}
                    className="btn-delete-row"
                    title="Excluir"
                  >
                    🗑
                  </button>
                </div>

                <div className="card-meta">
                  <span className="category-pill">{row.category}</span>
                  <span className="client-text">{row.project_client}</span>
                  <span className="location-text">📍 {row.context_location}</span>
                </div>

                <div
                  className="card-desc cell-editable"
                  onDoubleClick={() => handleStartEdit(row.id, "description")}
                >
                  {editingCell?.rowId === row.id && editingCell?.field === "description" ? (
                    <textarea
                      ref={editInputRef as any}
                      value={row.description}
                      onChange={(e) => handleCellChange(row.id, "description", e.target.value)}
                      onBlur={handleFinishEdit}
                      className="cell-inline-textarea"
                      rows={3}
                    />
                  ) : (
                    <p>{row.description}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
