# Feature blueprint

The gallery, mascot integration, and downloads are planned. The repository currently shows the branded landing page while the dedicated mascot component and character assets are prepared for integration.

| Area              | Planned behavior                                                                                                                      | Acceptance criteria                                                                                                          |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Gallery           | Put the character collection on the homepage. Use freeform panning inspired by Thiings Grid and offer search for specific characters. | Mouse and touch can explore the grid. Users have a keyboard-accessible way to find and select characters.                    |
| Booping           | Use the dedicated mascot component to play a reaction on activation.                                                                  | Tapping or keyboard activation triggers a response. Dragging avoids accidental boops. Reduced-motion settings are respected. |
| Character details | Open a character through a separate View & download action. Show its Directions and Reactions.                                        | Opening details is independent of booping, and each asset has a preview and format label.                                    |
| Downloads         | Offer the selected character’s directional poses and reactions.                                                                       | Downloads match their labels. Confirm distribution rights and show applicable usage terms and attribution.                   |
| Performance       | Keep grid previews small and load full reaction or download assets on demand.                                                         | Check panning, first-boop latency, and cold-load transfer on a representative mobile connection.                             |

[Thiings Grid reference](https://github.com/charlieclark/thiings-grid)
