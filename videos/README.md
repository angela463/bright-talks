# Hero background video

The homepage hero loads **`hero-home-loop.mp4`** (H.264 MP4, compressed for the web).

The original **4K / 60fps** file is **not** kept in the repo (too large for Git). If you drop a new master clip in the project root, ignore it or re-encode first—see `.gitignore` patterns for raw `*_3840_*` filenames.

## Re-encode (macOS)

From the project root, with your source file:

```bash
./scripts/compress-hero-video.sh /path/to/your-source.mp4
```

This uses **`avconvert`** with **`Preset1280x720`** and writes `videos/hero-home-loop.mp4`.

If you need a smaller file at the cost of sharpness, edit the script and try `Preset960x540` instead.

## ffmpeg (any OS)

If you prefer **`ffmpeg`**, a typical web-friendly pass looks like:

```bash
ffmpeg -i source.mp4 -an -vf "scale=1280:-2" -c:v libx264 -crf 26 -preset medium -movflags +faststart videos/hero-home-loop.mp4
```

Then commit **`videos/hero-home-loop.mp4`** and point `index.html` at it (already wired).

## If the video doesn’t show after merge/deploy

1. **Pull latest on your machine** — `git pull origin main` so you have `videos/hero-home-loop.mp4` locally.
2. **Confirm the file is in the repo** — `git ls-files videos/hero-home-loop.mp4` should print that path.
3. **Hosted site** — open DevTools → **Network**, reload, filter by **media** or the filename. A **404** means the `videos/` folder wasn’t deployed (redeploy, or check the host isn’t excluding `*.mp4`).
4. **macOS / iOS “Reduce motion”** — System Settings → Accessibility → **Display** → *Reduce motion*. When on, the hero uses a **static image** instead of the looping video (by design).
5. **Open via local server** — e.g. `python3 -m http.server` in the project folder, then visit `http://localhost:8000/` — opening `index.html` as `file://` can block video in some browsers.
