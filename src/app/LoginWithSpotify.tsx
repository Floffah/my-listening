"use client";

import { SignInButton } from "@clerk/nextjs";
import { SiSpotify } from "@icons-pack/react-simple-icons";
import { ComponentProps } from "react";

import { Button } from "@/components/ui/button";

export default function LoginWithSpotify(
    props: Omit<ComponentProps<typeof Button>, "children">,
) {
    return (
        <SignInButton mode="modal" forceRedirectUrl="/analyse">
            <Button className="transition-transform hover:scale-105" {...props}>
                <SiSpotify />
                Login with Spotify
            </Button>
        </SignInButton>
    );
}
