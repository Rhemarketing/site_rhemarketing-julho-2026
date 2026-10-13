"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
 
  useEffect(() => {
    const handleErr = (e: ErrorEvent) => {
      if (e.message && e.message.includes("ResizeObserver")) {
        e.stopImmediatePropagation();
        e.stopPropagation();
      }
    };
    window.addEventListener("error", handleErr, true);
    return () => window.removeEventListener("error", handleErr, true);
  }, []);

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
            <div className="admin-password-field-wrapper">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
              />
              <button
                type="button"
                className="admin-password-toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Ocultar senha" : "Exibir senha"}
                title={showPassword ? "Ocultar senha" : "Exibir senha"}
              >
                {showPassword ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                    <line x1="2" x2="22" y1="2" y2="22" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
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
