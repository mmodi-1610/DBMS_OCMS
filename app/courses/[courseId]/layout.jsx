import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AppSidebar } from "@/components/app-sidebar";

export default async function CoursesLayout({ children }) {
    const session = await getSession();

    if (!session) {
        redirect("/");
    }

    return (
        <div className="flex min-h-screen">
            <AppSidebar user={session} />
            <main className="flex-1 overflow-auto">{children}</main>
        </div>
    );
}
