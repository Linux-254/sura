# Sura Social Model

Sura is an aesthetic discovery network, not a general-purpose social chat app. People follow points of view, businesses publish visual signals, and users can save, like, and repost useful discoveries into their own public Sura space.

## First social slice

| Capability | Sura behavior | Why it belongs in the first release |
| --- | --- | --- |
| Follow | A person follows another public person or a verified company. | Builds a personal local signal without requiring a messaging system. |
| Like | A signed-in user likes or unlikes a public business post. | Gives businesses a simple engagement signal and helps Sura understand interest. |
| Repost | A signed-in user reposts a public business post to their own public profile, optionally with a short note. | Lets people build a visible point of view and helps good local work travel through the network. |
| Following feed | Shows posts from followed people and verified companies, plus posts liked by followed people. | Makes the social graph useful without building a complex ranking engine. |
| Profile activity | A public profile shows follower/following counts and a small repost shelf. | Makes a user’s taste visible and gives reposts a home. |
| Business contact | Keep the existing inquiry/contact route for now. | It is moderated, auditable, and lower-maintenance than live chat. |

## Content and ownership rules

- Only verified companies can publish public business posts in the first slice.
- A repost never copies ownership. It points back to the original company post and keeps the original attribution.
- Likes and reposts require authentication and are protected by unique database constraints so repeated taps are idempotent.
- Private profiles do not appear in public discovery. A private user can still follow and like content for their own private experience.
- Reposts are visible on a public profile only when the profile is public. Removing a repost removes the user’s distribution of it, not the company’s original post.
- Business inquiries remain separate from social interactions. A user can discover, like, repost, and then contact a business through its public contact route or inquiry form; Sura does not promise instant chat in this phase.

## Aesthetic language

Sura should organize discovery around broad lifestyle directions rather than narrow social categories. The first taxonomy expansion covers **home, furniture, appliances, art, tattoos, fashion, vehicles, car care, pets, accessories, and gifting**, with names that describe a feeling rather than a demographic.

Candidate directions include: Soft Comfort, Warm Minimal, Quiet Utility, Earthbound Home, Bright Play, Heritage Modern, Thrift Remix, Coastal Ease, Savanna Atelier, Ink & Ivory, Orchid After Dark, Tangerine Social, Moss & Marigold, Cobalt Ritual, Thermal Bloom, Street Archive, Studio Calm, Pet Piece, Object Story, and Motion Detail.

The taxonomy remains a preference and discovery vocabulary. It is not a permanent category enum for inventory, and it should be safe to expand without rewriting commerce records.

## Later, not now

A full message board or open-ended direct-message system should wait until Sura has enough verified businesses and repeat discovery behavior to justify moderation, abuse handling, unread states, notification delivery, and support work. Until then, inquiry records and business contact channels provide a clear path from interest to purchase while keeping the product focused on aesthetic discovery and commerce.

## Recommended feed language

Use Sura terms in the interface:

- **Live Signal**: recent visual posts from businesses and people.
- **Following**: signals from accounts the user chose to follow.
- **Repost to my direction**: user distribution action.
- **Curate**: like/save-style interest action where useful.
- **Contact the business**: moderated inquiry or published contact route.
- **Sura Shelf**: the visual collection of a public profile, including reposted signals.
