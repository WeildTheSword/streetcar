public/mascot.svg — Tulane's Angry Wave athletics mark, used in the demo
walkthrough with the university's authorization.

Source: https://upload.wikimedia.org/wikipedia/en/2/28/Tulane_Green_Wave_logo.svg

The walkthrough loads it at runtime from /mascot.svg. If the file is removed it
falls back to the original wave character in src/components/WaveGuide.jsx, so
the build never breaks either way.
