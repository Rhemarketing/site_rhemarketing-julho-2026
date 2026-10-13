"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Erro ao efetuar login");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Erro desconhecido ao autenticar.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-wrapper">
      <div className="admin-login-bg-grid" aria-hidden="true" />
      <div className="admin-login-glow" aria-hidden="true" />

      <header className="admin-login-header">
        <Link href="/" className="brand" aria-label="Patrick Mendes — início">
          <span>Patrick</span> Mendes
        </Link>
      </header>

      <main className="admin-login-card">
        <div className="admin-login-badge">Acesso Restrito</div>
        <h1>Painel Administrativo</h1>
        <p className="admin-login-desc">
          Gerenciamento das galerias de Design Gráfico e Edição de Vídeo
        </p>

        {error && (
          <div className="admin-alert-error" role="alert">
            <span>⚠</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="admin-field">
            <label htmlFor="username">Usuário</label>
            <input
              id="username"
              type="text"
              required
              autoComplete="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="seu-usuario"
            />
          </div>

          <div className="admin-field">
            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="admin-btn-primary"
          >
            {loading ? "Entrando..." : "Acessar Painel ↗"}
          </button>
        </form>

        <div className="admin-login-footer">
          <Link href="/">← Voltar para a página inicial</Link>
        </div>
      </main>
    </div>
  );
}
