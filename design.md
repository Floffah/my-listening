# Design — My Listening

A locked design system for the app. Project-specific instructions in
`AGENTS.md` take precedence over Hallmark.

## Genre and tone

- Genre: atmospheric
- Tone: technical, candid, calm
- Voice: explain the actual data work; be direct about Spotify API limits

## Macrostructure family

- Marketing: Split Studio with an H2 split diptych
- App: Workbench with the analysis state as the central surface
- Guides: Narrative Workflow with a vertical F4 step sequence

## Theme

Dark, green-tinted charcoal surfaces with warm off-white text. Spotify green is
the single brand accent and stays below roughly five percent of each viewport.
Amber and red appear only as semantic warning and error colours.

## Typography

- Display: JetBrains Mono, upright, 700
- Body: Nunito, upright, 400
- Data and labels: JetBrains Mono, 500

## Styling source

All tokens live in `src/app/globals.css` under `:root` and are exposed through
Tailwind v4's `@theme inline` block. Do not create `tokens.css`, `tokens.json`,
or parallel token exports.

## Motion

- CSS transitions first; Motion only for page-state crossfades
- Transform and opacity only
- Reduced-motion fallback at 150 ms or less

## Component voice

- Navigation: N9 edge-aligned minimal
- Primary CTA: compact, one-line, Spotify-green fill
- Secondary CTA: quiet outline or typographic link
- Footer: Ft5 statement, with a compact metadata row
- Cards: one containment layer, elevated by surface lightness rather than glow

## Page behavior

- The hosted app explains that Spotify Development Mode is allowlisted.
- Playlist creation appears only when the Clerk account has Spotify connected
  and Spotify accepts the user's access token.
- Every other completed analysis ends with a JSON download of Spotify URIs.
- Analysis progress names each real phase rather than showing a numeric step.
