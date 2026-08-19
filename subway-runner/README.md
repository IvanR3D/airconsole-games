# LINE RUN — AirConsole Edition

A 4‑player split‑screen endless runner for [AirConsole](https://www.airconsole.com), adapted from the
original single‑player `subway-runner.html`.

## Files

| File | Role |
|---|---|
| `screen.html` | The **TV/screen** app: lobby, countdown, up‑to‑4‑player split‑screen gameplay, scoreboard. |
| `controller.html` | The **phone** app: lobby "Start" button (host only), button‑pad or swipe controls, results screen. |
| `audio.js` | Shared, dependency‑free music + sound‑effects engine (Web Audio API, no binary assets). |
| `README.md` | This file. |

Both HTML files load `three.js r128` and the AirConsole API from their public CDNs, so no build step
or bundler is needed — it's plain static files, exactly what AirConsole expects.

## How the multiplayer flow works

1. **Lobby** (`screen.html` shows 4 slots, `controller.html` shows a nickname + Start button on the
   host's phone). Up to 4 controllers can join; slots are assigned with
   `airconsole.setActivePlayers(4)`, so the first four phones to connect become Player 1‑4 and any
   extra phones become spectators.
2. The **host** (the first/master controller) taps **"Empezar partida"**, which sends
   `{action:'start'}` to the screen. Everyone else's phone just waits.
3. A shared **3‑2‑1‑GO** countdown plays on the screen (with beeps), then the screen builds one
   independent 3D track per connected player and splits the canvas:
   - 1 player → full screen
   - 2 players → side‑by‑side
   - 3‑4 players → 2×2 grid
   Each quadrant has its own camera and HUD (name tag, score, coins, level) rendered with a single
   shared `THREE.WebGLRenderer` using scissor/viewport splitting, so it stays cheap even with 4 tracks
   running at once.
4. Each phone sends `{action:'input', type:'lane'|'jump'|'duck', dir}` messages to the screen, which
   routes them to that player's track via `airconsole.convertDeviceIdToPlayerNumber`.
5. When a player crashes, only their quadrant freezes with an "ELIMINADO" banner — the others keep
   racing. Once everyone has crashed, the screen shows a ranked **scoreboard** and every phone gets its
   own final score/rank.
6. The host's phone gets a **"Jugar de nuevo"** button that restarts the countdown with whoever is
   still connected — no need to return to the lobby.

## Controller input modes

Each phone has a switch at the top of the lobby screen:

- **Botones** — an on‑screen D‑pad (Left / Right / Jump / Duck) using `touchstart` for low latency,
  with a quick click sound + haptic buzz (`navigator.vibrate`) per tap.
- **Deslizar** — the whole screen becomes a swipe surface: swipe up to jump, down to duck, left/right
  to change lanes (same gesture mapping as the original single‑player build).

The choice is saved in `localStorage`, so it's remembered between rounds.

## Audio

`audio.js` synthesizes everything on the fly with the Web Audio API — a looping chiptune‑style
background track, jump/duck/lane‑change blips, a coin chime, a crash noise burst, countdown beeps, a
join chime, and win/game‑over jingles. There are no external audio files, so there's nothing extra to
upload or license.

## Testing locally

AirConsole devices need the game served over HTTP(S) (not `file://`) and requires a screen + at least
one controller to connect. The easiest way to iterate locally:

1. Serve this folder, e.g. `npx serve .` or `python3 -m http.server 8080`.
2. Use [AirConsole's Screen/Controller simulator](https://developers.airconsole.com/#!/guide/hosting)
   during development, or upload the folder as a new game in the
   [AirConsole Dev Center](https://developers.airconsole.com) to test with real phones.

## Deploying to AirConsole

1. Zip the contents of this folder (not the folder itself — `screen.html` should be at the zip root).
2. Create a new game in the [AirConsole Dev Center](https://developers.airconsole.com) and upload the
   zip.
3. AirConsole automatically serves `screen.html` on the TV/host device and `controller.html` on each
   connected phone.

## Notes / possible next steps

- Obstacle layouts, speed ramp, and scoring are unchanged from the original single‑player game — only
  the presentation layer (lobby/split‑screen/scoreboard) and I/O (AirConsole messages, synth audio)
  are new.
- Shadows are automatically disabled once more than one player is active to keep frame rate stable
  across 2‑4 simultaneous tracks; solo play keeps full shadow quality.
- Want persistent high scores across rounds, power‑ups, or a "ghost" of the leader on each quadrant?
  Those would be natural follow‑ups on top of this structure.
