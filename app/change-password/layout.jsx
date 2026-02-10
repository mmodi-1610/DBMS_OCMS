import { getSession } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function ChangePasswordLayout({ children }) {
    const session = await getSession();
    if (!session) {
        redirect("/");
    }

    return <>{children}</>;
}
