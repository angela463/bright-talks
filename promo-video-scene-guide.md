# Bright Talks — homepage promo slideshow (scene guide)

Short promotional sequence: **visual slides only** (no voiceover), **soft instrumental music**, **crossfade** between images, **1–2 lines** of text per slide. Total runtime ≈ **34 seconds** of slide time plus transition overlap.

---

## Scene-by-scene breakdown

| # | Role | On-screen text | Duration |
|---|------|----------------|----------|
| 1 | Opening — welcoming, calm family moment | Some conversations matter more than others. | 4s |
| 2 | Problem awareness | Kids are curious… and they’re learning from somewhere. | 4s |
| 3 | Parent tension | But many parents don’t know how to start. | 4s |
| 4 | Reframe | What if those conversations started with you? | 4s |
| 5 | Solution | Bright Talks helps you guide age-appropriate conversations about bodies, boundaries, and safety. | 5s |
| 6 | Benefit | Build trust. Create safety. Stay connected. | 4s |
| 7 | Emotional outcome | So your child always has a safe place to ask. | 4s |
| 8 | Closing CTA | Bright Talks — Start the conversation at home. | 5s |

**Total slide time:** 4 + 4 + 4 + 4 + 5 + 4 + 4 + 5 = **34s** (implementation uses the same; minor rounding vs. 36s if transitions are counted separately).

---

## Suggested image types (implemented assets)

| # | Suggested image type | Current implementation |
|---|----------------------|-------------------------|
| 1 | Warm family moment at home (connection, calm) | Local: `images/home-hero-yellow-3.jpg` |
| 2 | Child playing / exploring (curiosity) | Unsplash (diverse, natural light) |
| 3 | Parent + child learning together (homework, table) | Unsplash |
| 4 | Tender parent–infant moment (bonding) | Unsplash |
| 5 | Calm home, laptop / learning space | Local: `images/home-hero-yellow-2.jpg` |
| 6 | Parent and child together (trust) | Unsplash |
| 7 | Parent–child closeness (safety, listening) | Unsplash |
| 8 | Family / home warmth (closing, hopeful) | Unsplash |

Replace any Unsplash URL in `js/promo-slideshow.js` with your own licensed photography when ready. Unsplash photos are subject to the [Unsplash License](https://unsplash.com/license).

---

## Audio

- **Preferred:** add a soft instrumental loop as `audio/promo-ambient.mp3` (see `audio/README.txt`).
- **Fallback:** if the file is missing, the page uses a very gentle built-in ambient pad (Web Audio) so music still plays after **Play** (requires a user click for browser autoplay policies).

---

## Style notes

- No voiceover; **mute** controls music only.
- Typography: Fraunces overlay, white type, soft scrim for contrast.
- Transitions: **crossfade** between background layers (~900ms; shorter if `prefers-reduced-motion`).
