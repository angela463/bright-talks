Bright Talks homepage promo audio

The slideshow uses these files (referenced in `js/promo-slideshow.js`):

  audio files/Warm Windows, Open Minds.mp3
  audio/Bright Talks Voice Over.m4a   (female narration — first part of the promo script)
  audio/promo-recording.m4a           (male narration — second part; both tracks play in full)

Slides follow the voiceover clock (not a separate timer). Timing uses two segments so the
male file starts with slide `PROMO_MALE_VO_STARTS_AT_SCENE_INDEX` (see `js/promo-slideshow.js`).
If a line still feels early or late, change that index or the relative `duration` values on
each scene (within the female block vs within the male block).

If you replace a track, keep the same path and filename or update the matching constants.
