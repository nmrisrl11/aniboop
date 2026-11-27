# Feature blueprint

The homepage repeats the character catalog across a pannable grid. On the first visit in a browser tab (when reduced motion is off), a short splash intro bounces the AniBoop logo and docks it into the header; clicking or activating the header logo replays an in-place boop. Visible mascots follow an unpressed fine pointer while the grid is still. Click, tap, Enter, or Space plays a reaction using the selected Boop order (persisted across visits via local storage). In order cycles through the configured reactions, Random picks one each time, and Build up plays a dizzy reaction after four quick boops. A hold or two-finger pinch on the mascot triggers a separate reaction. Dragging pans without triggering a boop, and reduced motion disables gaze tracking and deformation. The top bar opens the catalog, where users can search by character name or series and filter by series. A floating bottom dock also filters the live grid to a single anime series (syncing `/?series=<slug>` via `nuqs` with a one-click clear button while keeping the catalog searchable across all characters). Users can view character details and download assets from the catalog or through the card action on each character tile; opening a character syncs `/?character=<id>` for shareable deep links and browser Back/Forward navigation, and the detail footer provides **Try in Playground** (`/playground?character=<id>`) and **Copy link** actions. All mascot WebP tiers (`previews/`, `gallery-sheets/`, and 1080 HD `sheets/`) are delivered from Cloudflare R2 via `NEXT_PUBLIC_R2_ASSETS_URL` with `?v=<hash>` cache busting, falling back to local `/mascots/` files when unset.

| Area              | Behavior                                                                                                                        | Status      |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| Gallery           | Let users open character details from the catalog or grid tiles.                                                                | Implemented |
| Character details | Open a character through a separate View & download action with resolution selection.                                           | Implemented |
| Downloads         | Offer high-resolution (1080 HD) and web-ready (504 Web) sprite sheets for directional poses and reactions.                      | Implemented |
| Performance       | Keep grid previews small, load full sheets on demand, and serve all mascot WebP tiers from Cloudflare R2 with zero egress fees. | Implemented |

## Reaction sounds

Use the speaker button in the header or **More options → Reaction sounds** on smaller screens. Sound preference persists across visits via local storage (defaulting to off). Turn it on to hear a cue for each displayed expression across all boop orders. For a hold or pinch, the default cues are surprised when it starts, dizzy if it lasts 1.4 seconds, and delighted when released. Panning and gaze tracking are silent.

See [Reaction audio](ARCHITECTURE.md#reaction-audio) for the sound mapping and callback integration.

[Thiings Grid reference](https://github.com/charlieclark/thiings-grid)
