import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { AppSidebar } from "@/components/app-sidebar";

export default async function DashboardLayout({ children }) {
  const session = await getSession();
  if (!session) {
    redirect("/");
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AppSidebar user={session} />
      <main className="flex-1 overflow-y-auto bg-background">
        {children}
      </main>
    </div>
  );
}
