# Hero background video

The homepage hero uses **`hero-home-loop.mp4`** (H.264 MP4, optimized for web).

- **Current encode:** 1280×720–class compression via macOS `avconvert` (see `scripts/compress-hero-video.sh`).
- **Do not commit** raw 4K/60fps source files; re-run the script if you replace the footage.

To recompress a new source file:

```bash
./scripts/compress-hero-video.sh /path/to/source.mp4
```

Requires macOS (`avconvert`). For finer control, use `ffmpeg` with `-crf` / `-preset` and replace `videos/hero-home-loop.mp4`.
