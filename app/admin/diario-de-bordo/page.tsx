import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import DiarioBordoClient from "./diario-client";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Diário de Bordo & Rotina — Painel Admin",
  description: "Gestão diária e edição interativa de registros de trabalho e rotina.",
};

export default async function DiarioAdminPage() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }

  return <DiarioBordoClient username={session.username} />;
}
