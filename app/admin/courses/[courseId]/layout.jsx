import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";

export default async function AdminCoursesLayout({ children }) {
    const session = await getSession();

    if (!session || session.role !== "admin") {
        redirect("/");
    }

    return (
        <div className="flex h-screen overflow-hidden">
            <AppSidebar user={session} />
            <main className="flex-1 overflow-y-auto bg-background">{children}</main>
        </div>
    );
}
