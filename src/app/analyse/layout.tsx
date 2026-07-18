import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { PropsWithChildren } from "react";

export default async function Layout({ children }: PropsWithChildren) {
    const { isAuthenticated } = await auth();

    if (!isAuthenticated) {
        redirect("/");
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed top-4 right-4">
                <UserButton />
            </div>
            {children}
        </div>
    );
}
