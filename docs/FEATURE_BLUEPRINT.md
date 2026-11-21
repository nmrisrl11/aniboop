# Feature blueprint

The homepage repeats the character catalog across a pannable grid. Visible mascots follow an unpressed fine pointer while the grid is still. Click, tap, Enter, or Space plays a reaction using the selected Boop order. In order cycles through the configured reactions, Random picks one each time, and Build up plays a dizzy reaction after four quick boops. A hold or two-finger pinch on the mascot triggers a separate reaction. Dragging pans without triggering a boop, and reduced motion disables gaze tracking and deformation. The top bar opens the catalog, where users can search by character name or series and filter by series. Character details and downloads are planned.

| Area              | Planned behavior                                                                               | Acceptance criteria                                                                                        |
| ----------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- |
| Gallery           | Let users open character details from the catalog.                                             | Mouse and touch can explore the grid. Users have a keyboard-accessible way to find and select characters.  |
| Character details | Open a character through a separate View & download action. Show its Directions and Reactions. | Opening details is independent of booping, and each asset has a preview and format label.                  |
| Downloads         | Offer the selected character’s directional poses and reactions.                                | Downloads match their labels. Confirm distribution rights and show applicable usage terms and attribution. |
| Performance       | Keep grid previews small and load full reaction or download assets on demand.                  | Check panning, first-boop latency, and cold-load transfer on a representative mobile connection.           |

[Thiings Grid reference](https://github.com/charlieclark/thiings-grid)
