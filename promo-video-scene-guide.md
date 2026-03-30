# Bright Talks homepage promo slideshow (scene guide)

Short promotional sequence: **visual slides only** (no voiceover), **looping instrumental music** (“Warm Windows, Open Minds”), **crossfade** between images, **one or two lines** of text per slide. **Play** starts the sequence; **Pause**, **Replay**, and **Mute** remain. Total runtime ≈ **34 seconds** of slide time plus transition overlap.

---

## Scene-by-scene breakdown

| # | Role | On-screen text | Duration |
|---|------|----------------|----------|
| 1 | Opening: welcoming, calm family moment | Some conversations matter more than others. | 4s |
| 2 | Problem awareness | Kids are curious… and they’re learning from somewhere. | 4s |
| 3 | Parent tension | But many parents don’t know how to start. | 4s |
| 4 | Reframe | What if those conversations started with you? | 4s |
| 5 | Solution | Bright Talks helps you guide age appropriate conversations about bodies, boundaries, and safety. | 5s |
| 6 | Benefit | Build trust. Create safety. Stay connected. | 4s |
| 7 | Emotional outcome | So your child always has a safe place to ask. | 4s |
| 8 | Closing CTA | Bright Talks. Start the conversation at home. | 5s |

**Total slide time:** 4 + 4 + 4 + 4 + 5 + 4 + 4 + 5 = **34s** (implementation uses the same; minor rounding vs. 36s if transitions are counted separately).

---

## Promo images (implemented assets)

Files live in `images/promo/` (PNG). Scene order in `js/promo-slideshow.js`:

| # | Scene | File |
|---|--------|------|
| 1 | Opening | `promo-01-family-tent.png` |
| 2 | Child curiosity | `promo-02-family-bed.png` |
| 3 | Parent tension / path | `promo-03-hiking.png` |
| 4 | Reframe / learning | `promo-04-classroom.png` |
| 5 | Solution | `promo-05-tablet-learning.png` |
| 6 | Benefit | `promo-08-teen-desk.png` |
| 7 | Emotional outcome | `promo-07-family-walk.png` |
| 8 | Closing CTA | `promo-02-family-bed.png` |

The older `promo-06-laptop-couch.png` was removed (overlapped the teen-at-desk mood).

Slides use **local files only** (no external image CDN) so the promo works offline and when opening the site from disk.

---

## Audio

- **Track:** `audio files/Warm Windows, Open Minds.mp3` (the only promo music; no synthesized fallback).

---

## Style notes

- No voiceover; **mute** controls music only.
- Typography: Fraunces overlay, white type, soft scrim for contrast.
- Transitions: **crossfade** between background layers (~900ms; shorter if `prefers-reduced-motion`).
