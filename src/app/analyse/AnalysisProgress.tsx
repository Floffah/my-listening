import { CheckIcon, CircleIcon, Loader2Icon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const steps = [
    {
        title: "Open the ZIP",
        description: "Find and read the streaming history files.",
    },
    {
        title: "Match duplicate tracks",
        description:
            "Add plays for the same track together, even when they appear in different files.",
    },
    {
        title: "Apply the ten-play cutoff",
        description: "Remove tracks with fewer than ten plays.",
    },
    {
        title: "Sort the result",
        description: "Put tracks in order by their first play in the archive.",
    },
];

export default function AnalysisProgress({
    analysisStep,
    completed = false,
}: {
    analysisStep?: number;
    completed?: boolean;
}) {
    const activeIndex = Math.max(analysisStep ?? 0, 0);

    return (
        <section aria-labelledby="analysis-progress-title">
            <div className="flex items-center justify-between gap-4">
                <h2
                    id="analysis-progress-title"
                    className="font-display text-sm font-bold"
                >
                    What we're doing
                </h2>
                <Badge variant={completed ? "default" : "secondary"}>
                    {completed ? "Done" : "In progress"}
                </Badge>
            </div>
            <ol className="mt-6 flex flex-col gap-5">
                {steps.map((step, index) => {
                    const isComplete = completed || index < activeIndex;
                    const isActive = !completed && index === activeIndex;
                    const Icon = isComplete
                        ? CheckIcon
                        : isActive
                          ? Loader2Icon
                          : CircleIcon;

                    return (
                        <li
                            key={step.title}
                            className={cn(
                                "flex items-start gap-3",
                                !isComplete &&
                                    !isActive &&
                                    "text-muted-foreground",
                            )}
                            aria-current={isActive ? "step" : undefined}
                        >
                            <Icon
                                aria-hidden="true"
                                className={cn(
                                    "mt-0.5 size-5",
                                    isActive &&
                                        "animate-spin text-spotify motion-reduce:animate-none",
                                    isComplete && "text-spotify",
                                )}
                            />
                            <div className="min-w-0 flex-1">
                                <p className="font-medium">{step.title}</p>
                                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                                    {step.description}
                                </p>
                            </div>
                        </li>
                    );
                })}
            </ol>
        </section>
    );
}
