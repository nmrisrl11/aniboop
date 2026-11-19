# Feature blueprint

The homepage repeats the character catalog across a pannable grid. Visible mascots follow an unpressed fine pointer while the grid is still. Click, tap, Enter, or Space cycles through the mascot's configured reactions. A hold or two-finger pinch on the mascot triggers a separate reaction. Search, character details, and downloads are planned.

| Area              | Planned behavior                                                                               | Acceptance criteria                                                                                                          |
| ----------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Gallery           | Add search to the character catalog.                                                           | Mouse and touch can explore the grid. Users have a keyboard-accessible way to find and select characters.                    |
| Booping           | Use the dedicated mascot component to play a reaction on activation.                           | Tapping or keyboard activation triggers a response. Dragging avoids accidental boops. Reduced-motion settings are respected. |
| Character details | Open a character through a separate View & download action. Show its Directions and Reactions. | Opening details is independent of booping, and each asset has a preview and format label.                                    |
| Downloads         | Offer the selected character’s directional poses and reactions.                                | Downloads match their labels. Confirm distribution rights and show applicable usage terms and attribution.                   |
| Performance       | Keep grid previews small and load full reaction or download assets on demand.                  | Check panning, first-boop latency, and cold-load transfer on a representative mobile connection.                             |

[Thiings Grid reference](https://github.com/charlieclark/thiings-grid)
