# Feature blueprint

The homepage repeats the character catalog across a pannable grid. On the first visit in a browser tab (when reduced motion is off), a short splash intro bounces the AniBoop logo and docks it into the header; clicking or activating the header logo replays an in-place boop. Visible mascots follow an unpressed fine pointer while the grid is still. Click, tap, Enter, or Space plays a reaction using the selected Boop order. In order cycles through the configured reactions, Random picks one each time, and Build up plays a dizzy reaction after four quick boops. A hold or two-finger pinch on the mascot triggers a separate reaction. Dragging pans without triggering a boop, and reduced motion disables gaze tracking and deformation. The top bar opens the catalog, where users can search by character name or series and filter by series. Users can view character details and download assets from the catalog or through the card action on each character tile. Full-size raw downloads use Cloudflare R2 when enabled via `NEXT_PUBLIC_R2_ASSETS_URL`, with fallback to compact local sheets.

| Area              | Behavior                                                                                                                    | Status      |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------- | ----------- |
| Gallery           | Let users open character details from the catalog or grid tiles.                                                            | Implemented |
| Character details | Open a character through a separate View & download action with resolution selection.                                       | Implemented |
| Downloads         | Offer high-resolution (1080 HD) and web-ready (504 Web) sprite sheets for directional poses and reactions.                  | Implemented |
| Performance       | Keep grid previews small, load full sheets on demand, and offload master sheet downloads to Cloudflare R2 with zero egress. | Implemented |

## Reaction sounds

Use the speaker button in the header or **More options → Reaction sounds** on smaller screens. Sound starts off each time the page loads. Turn it on to hear a cue for each displayed expression across all boop orders. For a hold or pinch, the default cues are surprised when it starts, dizzy if it lasts 1.4 seconds, and delighted when released. Panning and gaze tracking are silent.

See [Reaction audio](ARCHITECTURE.md#reaction-audio) for the sound mapping and callback integration.

[Thiings Grid reference](https://github.com/charlieclark/thiings-grid)
