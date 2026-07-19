"use client";

import { SignInButton } from "@clerk/nextjs";
import { LogInIcon, Music2Icon } from "lucide-react";
import { ComponentProps } from "react";

import { Button } from "@/components/ui/button";

export default function LoginWithSpotify(
    props: Omit<ComponentProps<typeof Button>, "children">,
) {
    return (
        <SignInButton mode="modal" forceRedirectUrl="/analyse">
            <Button size="lg" {...props}>
                <LogInIcon data-icon="inline-start" />
                Continue to Login
            </Button>
        </SignInButton>
    );
}
