# SURA Personal Edit Studio: Safety and Interaction Principles

The Personal Edit Studio is a **private creative-planning space**, not a virtual fitting room, tattoo service, medical tool, electrical design service, stock guarantee, or marketplace inventory simulator. A member may explore an outfit, tattoo concept, room, bookshelf, or lighting direction and retain their own inspiration as a revisable edit.

| Area | SURA product decision |
| --- | --- |
| Rotating explorer | The explorer must be **manually controlled by default**, with labelled previous/next controls, a visible current item, keyboard access, and no auto-advance. It must respect `prefers-reduced-motion` by removing rotational transitions. |
| Personal images | Any uploaded or saved image is private by default, attached to a user-owned collection, and only analysed when a separate purpose consent is provided. Local storage/cookies may remember only non-sensitive presentation choices such as active theme, selected edit category, or rotation preference. |
| Wardrobe and inspirations | Members can save their own item notes, purchase references, and inspiration images. SURA must not infer body measurements, guarantee fit, or present an illustrative item as live company inventory. |
| Tattoo exploration | The studio may offer a reversible **concept and placement conversation** only. It must state that it is not health, suitability, or permanence advice; it cannot assess skin, pain, healing, or infection risk; and it must direct a member to a qualified local tattoo artist and appropriate health guidance before any procedure. |
| Rooms, books, and lights | Visual prompts can suggest composition, mood, and practical next questions. They cannot approve load-bearing changes, electrical installation, fire safety, or structural arrangements. |
| Vibe of the day | A daily prompt combines the optional saved aesthetic mix with private collection tags. It is a creative cue, not an identity score, behavioural prediction, or purchase recommendation guarantee. |

> SURA should favour a member-controlled **edit rail** over an auto-rotating carousel. WebAIM recommends pausing animated content by default and requires keyboard-accessible controls for moving content; it also describes `prefers-reduced-motion` as an important support for people distracted by movement.[1]

> Tattoo artwork can be inspirational, but tattooing is permanent and carries meaningful risks. The FDA describes infection, allergic reaction, removal problems, and local regulatory variation; SURA must therefore keep its feature at concept exploration and clearly point people to professional consultation.[2]

## Proposed private data boundary

The initial build should store collection metadata in the database and image bytes in managed object storage. Each collection belongs to one account, is private by default, and can hold a typed entry: `wardrobe`, `tattoo_concept`, `room`, `books`, `lighting`, or `general_inspiration`. A saved entry contains a title, optional private image reference, optional note, tags, and an explicit consent record if the member asks SURA AI to analyse the image.

## References

[1]: https://webaim.org/techniques/carousels/ "WebAIM: Animation and Carousels"
[2]: https://www.fda.gov/cosmetics/cosmetic-products/tattoos-permanent-makeup-fact-sheet "FDA: Tattoos & Permanent Makeup Fact Sheet"
