import { Loader2Icon } from "lucide-react";
import { ComponentProps } from "react";

import { cn } from "@/lib/utils";

export default function Loader({
    className,
    ...props
}: ComponentProps<typeof Loader2Icon>) {
    return <Loader2Icon className={cn("size-5 animate-spin", className)} />;
}
