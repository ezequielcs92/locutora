import { redirect } from "next/navigation";
import AdminNav from "@/components/admin/AdminNav";
import { getAdminSession } from "@/lib/admin-auth";

/** Layout del panel: sidebar simple, sin Lenis ni animaciones pesadas. */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getAdminSession();
  if (!session) redirect("/admin/login");

  return (
    <div className="flex min-h-screen flex-col bg-bg md:flex-row">
      <AdminNav userEmail={session.email} />
      <main className="min-w-0 flex-1 p-4 sm:p-8">{children}</main>
    </div>
  );
}
