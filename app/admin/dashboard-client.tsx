"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GalleryItem } from "@/lib/db";

interface Props {
  username: string;
}

export default function AdminDashboardClient({ username }: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"design" | "video">("design");
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoMode, setVideoMode] = useState<"upload" | "link">("upload");
  const [externalUrl, setExternalUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [file, setFile] = useState<File | null>(null);
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const thumbInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/items");
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/admin/login");
          return;
        }
        throw new Error("Erro ao carregar itens.");
      }
      const data = await res.json();
      setItems(data.items || []);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    router.push("/admin/login");
    router.refresh();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      if (selected.type.startsWith("image/")) {
        setPreviewUrl(URL.createObjectURL(selected));
      } else if (selected.type.startsWith("video/")) {
        setPreviewUrl(URL.createObjectURL(selected));
      } else {
        setPreviewUrl(null);
      }
    } else {
      setFile(null);
      setPreviewUrl(null);
    }
  };

  const handleThumbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    setThumbnailFile(selected || null);
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setExternalUrl("");
    setSortOrder("0");
    setFile(null);
    setThumbnailFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (thumbInputRef.current) thumbInputRef.current.value = "";
    setShowAddForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("type", activeTab);
      formData.append("title", title);
      formData.append("description", description);
      formData.append("sort_order", sortOrder);

      if (activeTab === "design") {
        if (!file) throw new Error("Selecione um arquivo de imagem para o design.");
        formData.append("file", file);
      } else {
        // Video
        if (videoMode === "upload") {
          if (!file) throw new Error("Selecione o arquivo de vídeo para envio.");
          formData.append("file", file);
        } else {
          if (!externalUrl.trim()) throw new Error("Informe o link do vídeo.");
          formData.append("external_url", externalUrl.trim());
        }

        if (thumbnailFile) {
          formData.append("thumbnail", thumbnailFile);
        }
      }

      const res = await fetch("/api/admin/items", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao salvar item");

      setSuccessMsg(`Item "${title}" cadastrado com sucesso!`);
      resetForm();
      fetchItems();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg("Erro inesperado ao cadastrar.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number, itemTitle: string) => {
    if (!confirm(`Deseja realmente excluir "${itemTitle}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      setErrorMsg("");
      const res = await fetch(`/api/admin/items/${id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erro ao excluir item");

      setSuccessMsg(`"${itemTitle}" foi excluído com sucesso.`);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch (err: unknown) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      }
    }
  };

  const filteredItems = items.filter((item) => item.type === activeTab);
  const designCount = items.filter((item) => item.type === "design").length;
  const videoCount = items.filter((item) => item.type === "video").length;

  return (
    <div className="admin-container">
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
          <Link
            href={activeTab === "design" ? "/design-grafico" : "/edicao-de-video"}
            target="_blank"
            className="admin-link-public"
            title="Ver galeria pública"
          >
            Ver Galeria ↗
          </Link>
          <button onClick={handleLogout} className="admin-btn-logout">
            Sair
          </button>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="admin-main">
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

        {/* Cabeçalho da Seção com Tabs */}
        <div className="admin-section-header">
          <div className="admin-tabs">
            <button
              className={`admin-tab ${activeTab === "design" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("design");
                setErrorMsg("");
                setSuccessMsg("");
              }}
            >
              🎨 Design Gráfico <span className="tab-badge">{designCount}</span>
            </button>
            <button
              className={`admin-tab ${activeTab === "video" ? "active" : ""}`}
              onClick={() => {
                setActiveTab("video");
                setErrorMsg("");
                setSuccessMsg("");
              }}
            >
              🎬 Edição de Vídeo <span className="tab-badge">{videoCount}</span>
            </button>
          </div>

          <button
            className="admin-btn-primary"
            onClick={() => setShowAddForm(!showAddForm)}
          >
            {showAddForm ? "✕ Fechar Formulário" : `+ Novo ${activeTab === "design" ? "Item de Design" : "Vídeo"}`}
          </button>
        </div>

        {/* Formulário de Cadastro */}
        {showAddForm && (
          <div className="admin-card-form">
            <h2>
              Cadastrar Novo {activeTab === "design" ? "Design Gráfico" : "Vídeo"}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="admin-form-grid">
                <div className="admin-field">
                  <label htmlFor="item-title">Título do Projeto *</label>
                  <input
                    id="item-title"
                    type="text"
                    required
                    placeholder={
                      activeTab === "design"
                        ? "Ex: Identidade Visual & Social Media"
                        : "Ex: Teaser Cinematográfico Comercial"
                    }
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                </div>

                <div className="admin-field">
                  <label htmlFor="item-sort">Ordem de Exibição (Maior = primeiro)</label>
                  <input
                    id="item-sort"
                    type="number"
                    value={sortOrder}
                    onChange={(e) => setSortOrder(e.target.value)}
                  />
                </div>

                <div className="admin-field full-width">
                  <label htmlFor="item-desc">Descrição / Detalhes (Opcional)</label>
                  <textarea
                    id="item-desc"
                    rows={2}
                    placeholder="Breve resumo da arte ou do objetivo do vídeo..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>

                {activeTab === "design" ? (
                  /* Campo de Upload de Imagem */
                  <div className="admin-field full-width">
                    <label>Arquivo da Arte (JPG, PNG, WebP) *</label>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      required
                      onChange={handleFileChange}
                      className="admin-file-input"
                    />
                    {previewUrl && (
                      <div className="admin-preview-box">
                        <p>Pré-visualização:</p>
                        <img src={previewUrl} alt="Preview" className="preview-img" />
                      </div>
                    )}
                  </div>
                ) : (
                  /* Campos de Vídeo */
                  <>
                    <div className="admin-field full-width">
                      <label>Tipo de Mídia do Vídeo</label>
                      <div className="admin-radio-group">
                        <label>
                          <input
                            type="radio"
                            name="vmode"
                            value="upload"
                            checked={videoMode === "upload"}
                            onChange={() => setVideoMode("upload")}
                          />
                          Upload de Arquivo (MP4 / WebM)
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="vmode"
                            value="link"
                            checked={videoMode === "link"}
                            onChange={() => setVideoMode("link")}
                          />
                          Link Externo (YouTube, Vimeo, Drive)
                        </label>
                      </div>
                    </div>

                    {videoMode === "upload" ? (
                      <div className="admin-field full-width">
                        <label>Arquivo de Vídeo *</label>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="video/*"
                          required
                          onChange={handleFileChange}
                          className="admin-file-input"
                        />
                      </div>
                    ) : (
                      <div className="admin-field full-width">
                        <label>URL do Vídeo *</label>
                        <input
                          type="url"
                          required
                          placeholder="https://www.youtube.com/watch?v=... ou https://vimeo.com/..."
                          value={externalUrl}
                          onChange={(e) => setExternalUrl(e.target.value)}
                        />
                      </div>
                    )}

                    <div className="admin-field full-width">
                      <label>Capa / Thumbnail do Vídeo (Opcional)</label>
                      <input
                        ref={thumbInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleThumbChange}
                        className="admin-file-input"
                      />
                    </div>
                  </>
                )}
              </div>

              <div className="admin-form-actions">
                <button
                  type="button"
                  onClick={resetForm}
                  className="admin-btn-secondary"
                  disabled={submitting}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="admin-btn-primary"
                  disabled={submitting}
                >
                  {submitting ? "Enviando arquivo e salvando..." : "Salvar no Banco de Dados ↗"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Listagem de Itens */}
        <div className="admin-items-section">
          <div className="admin-items-header">
            <h3>
              {activeTab === "design"
                ? "Artes de Design Cadastradas"
                : "Vídeos Cadastrados"}
            </h3>
            <span className="items-count">{filteredItems.length} itens encontrados</span>
          </div>

          {loading ? (
            <div className="admin-loading">Carregando itens...</div>
          ) : filteredItems.length === 0 ? (
            <div className="admin-empty">
              <p>Nenhum item cadastrado nesta categoria ainda.</p>
              <button
                onClick={() => setShowAddForm(true)}
                className="admin-btn-secondary"
              >
                Cadastrar o primeiro item
              </button>
            </div>
          ) : (
            <div className="admin-grid">
              {filteredItems.map((item) => (
                <div key={item.id} className="admin-item-card">
                  <div className="item-card-media">
                    {item.type === "design" ? (
                      <img src={item.file_path} alt={item.title} loading="lazy" />
                    ) : item.thumbnail_path ? (
                      <img
                        src={item.thumbnail_path}
                        alt={item.title}
                        loading="lazy"
                      />
                    ) : item.file_path.endsWith(".mp4") || item.file_path.endsWith(".webm") ? (
                      <video src={item.file_path} muted preload="metadata" />
                    ) : (
                      <div className="item-card-placeholder">
                        <span>🎬 Vídeo Externo</span>
                      </div>
                    )}
                    <span className="item-type-badge">
                      {item.type === "design" ? "Design" : "Vídeo"}
                    </span>
                  </div>

                  <div className="item-card-body">
                    <h4>{item.title}</h4>
                    {item.description && <p>{item.description}</p>}
                    <div className="item-card-meta">
                      <span>Ordem: {item.sort_order}</span>
                      <span>
                        {new Date(item.created_at).toLocaleDateString("pt-BR")}
                      </span>
                    </div>

                    <div className="item-card-actions">
                      <a
                        href={item.external_url || item.file_path}
                        target="_blank"
                        rel="noreferrer"
                        className="btn-view"
                      >
                        Visualizar ↗
                      </a>
                      <button
                        onClick={() => handleDelete(item.id, item.title)}
                        className="btn-delete"
                      >
                        Excluir
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
