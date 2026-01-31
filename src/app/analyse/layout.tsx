import { PropsWithChildren } from "react";

export default function Layout({ children }: PropsWithChildren) {
    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            {children}
        </div>
    );
}
