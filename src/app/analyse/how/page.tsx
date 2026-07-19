import { ArrowLeftIcon, ExternalLinkIcon } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import GetSpotifyData from "@/public/data.png";
import ReceivedSpotifyData from "@/public/received.png";

const steps = [
    {
        number: "1.0",
        title: "Request your Extended Streaming History",
        body: (
            <>
                On Spotify&apos;s privacy page, request Extended Streaming
                History. You do not need the smaller Account data download.
            </>
        ),
        image: (
            <Image
                src={GetSpotifyData}
                alt="Spotify privacy settings with Extended Streaming History selected"
                className="rounded-xl"
                priority
            />
        ),
    },
    {
        number: "2.0",
        title: "Wait for Spotify's email",
        body: (
            <>
                Spotify says this can take several days, and large archives can
                take a few weeks. The download link in the email expires, so
                grab the ZIP when it arrives.
            </>
        ),
    },
    {
        number: "3.0",
        title: "Download the ZIP",
        body: <>Keep the ZIP intact, then come back here and upload it.</>,
        image: (
            <Image
                src={ReceivedSpotifyData}
                alt="Spotify email containing a link to download account data"
                className="rounded-xl"
            />
        ),
    },
];

export default function Page() {
    return (
        <article className="flex flex-col gap-12">
            <header className="flex max-w-3xl flex-col items-start gap-6">
                <Button variant="link" size="lg" asChild>
                    <Link href="/analyse">
                        <ArrowLeftIcon data-icon="inline-start" />
                        Back to upload
                    </Link>
                </Button>
                <Badge variant="secondary">Getting the archive</Badge>
                <h1 className="font-display text-4xl leading-tight font-bold tracking-tighter sm:text-6xl">
                    Get your Spotify archive first.
                </h1>
                <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                    This tool needs the Extended Streaming History ZIP. Request
                    it from Spotify&apos;s privacy page, then upload the ZIP
                    here.
                </p>
                <Button variant="outline" size="lg" asChild>
                    <a
                        href="https://www.spotify.com/account/privacy/"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Open Spotify&apos;s privacy page
                        <ExternalLinkIcon data-icon="inline-end" />
                    </a>
                </Button>
            </header>

            <Separator />

            <ol className="flex flex-col gap-16">
                {steps.map((step, index) => (
                    <li
                        key={step.number}
                        className="grid gap-6 lg:grid-cols-3 lg:gap-12"
                    >
                        <p className="font-mono text-sm text-spotify">
                            {step.number}
                        </p>
                        <div className="flex min-w-0 flex-col gap-4 lg:col-span-2">
                            <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
                                {step.title}
                            </h2>
                            <p className="max-w-2xl text-lg leading-relaxed text-muted-foreground">
                                {step.body}
                            </p>
                            {step.image && (
                                <figure className="mt-2 max-w-2xl overflow-hidden rounded-xl ring-1 ring-foreground/10">
                                    {step.image}
                                </figure>
                            )}
                            {index < steps.length - 1 && (
                                <Separator className="mt-8" />
                            )}
                        </div>
                    </li>
                ))}
            </ol>

            <div className="flex justify-end">
                <Button size="lg" asChild>
                    <Link href="/analyse">Choose the ZIP</Link>
                </Button>
            </div>
        </article>
    );
}
