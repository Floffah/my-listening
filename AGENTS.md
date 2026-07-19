# Agent Instructions

This project is a tool for Spotify that will analyse users' various Spotify data (using things like Spotify Extended Streaming History downloads) in order to tell them about their listening habits, and provide them with insights into their music taste. The main features that currently exist are:

- Create a large "log" like playlist with all the songs a user has listened to more than x amount of times (currently 10) and sorts them chronologically by first listen.

This site is currently very early alpha and has **no** users. Breaking changes are fine, there is no need for migrations at this point.

## Useful Information

- Most convex and bun commands require sandbox elevation.

## Rules

- If a file changes under your feet while you are working, it is not necessarily a bad thing. If you can decipher that an automated tool did it, and it is not a desirable change, you are welcome to revert it. However, if another agent OR human may have made the change, you should assume it is a good change and adapt to it. If you believe it to be a bad change, stop and clarify.
- Use `bun test` for all tests. Do not use Vitest.

### Styling

The hallmark skill should be followed as closely as possible, however there are several overrides as follows:

- Use Tailwind CSS first for all UI implementation. Keep regular CSS limited to shared design tokens, global base rules, and cases Tailwind cannot express cleanly.
- Design tokens are defined in globals.css inside the `:root` block and turned into tailwind utilities via the `@theme inline` block.
- Do not create a standalone `tokens.css`; `src/app/globals.css` is the single source of truth for design tokens.
- Order of precedence for animations (instead of hallmark's suggestion): (tailwind) css transitions, tw-animate-css, motion.dev (framer-motion).
- Colours and tokens should attempt to use tailwind builtins as much as possible (e.g. `var(--color-green-400)` over an arbitrary oklch), but it is fine to escape them a bit within reason. Everything custom defined here should be exposed to tailwind so everything is accessible via utility rather than css `var()` calls.
- Avoid arbitrary tailwind utilities (`utility-[xyz]`) and prefer true tailwind utilities.
- Use ShadCN components and styling first and foremost.

Banned patterns examples:

- Arbitrary utilities that call variables: e.g. `text-[var(--color-paper)]`. instead, define paper as a token, pass it to the tailwind theme, and use `text-paper`
- Arbitrary utilities that use one-off non-tokenised values: e.g. `leading-[0.08rem]`. instead, check if tailwind has its own leading value that works (sometimes tailwind will automatically apply this when using font size) OR tokenise this value in the globals.css file, and use it like `leading-cta`. Generally, using tailwind's builtin theme values are preferred. But if a custom value is truly needed or used in multiple places, it can be tokenised and used based on the rules above.

### Tools

<!-- BEGIN:nextjs-agent-rules -->

#### This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->
