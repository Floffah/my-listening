"use client";

import { useAuthActions } from "@convex-dev/auth/react";
import { SiSpotify } from "@icons-pack/react-simple-icons";
import { ComponentProps } from "react";

import { Button } from "@/components/ui/button";

export default function LoginWithSpotify(
    props: Omit<ComponentProps<typeof Button>, "children">,
) {
    const { signIn } = useAuthActions();

    return (
        <Button
            className="transition-transform hover:scale-105"
            onClick={() => signIn("spotify")}
            {...props}
        >
            <SiSpotify />
            Login with Spotify
        </Button>
    );
}
