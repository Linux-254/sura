# SURA Personalised Expression Validation

SURA now treats a member’s saved one-to-five aesthetic mix as a **creative reference**, not a judgement, promise, or replacement for their explicit brief.

| Area | Implementation and validation |
| --- | --- |
| Persisted preferences | The private AI Studio reads the signed-in member’s saved mix from the profile API and falls back safely to the local mix if no profile preference exists. |
| AI boundary | The server accepts at most five unique supported aesthetics and instructs the AI to treat the mix as optional creative context. The member’s written goal remains primary. |
| Local build brief | The build brief displays the same persisted mix as an expression lens while retaining an explicit, user-controlled active aesthetic. |
| Local recommendation logic | The deterministic matcher adds a bounded relevance weight when a demonstration build matches a saved aesthetic direction and returns an explicit note that this changes relevance, not demo vendors, prices, or availability. |
| Desktop review | At 1280 × 900, the AI Studio shows the preference chips separately from consent, brief inputs, and the primary action. |
| Mobile review | At 390 × 844, the mix remains readable above the request form; all consent, upload/camera, and submission controls are visible in a single-column flow. |

The local build brief was also reviewed at **1280 × 900** and **390 × 844**. The saved mix is distinct from the active single-direction control, and the input choices remain visible without crowding the expression-lens note.

The current member session used in visual review had two saved directions, **Tangerine Social** and **Comfort Official**, demonstrating that the private panel renders a real persisted mix rather than fabricated recommendations or customer content.
