# LineRun — AirConsole Edition

A 4-player party conversion of the original single-player Three.js endless
runner, built for the [AirConsole](https://www.airconsole.com) platform.

## Files

- **screen.html** — what's shown on the TV/big screen. Handles the lobby
  (waiting for controllers, showing who's connected/ready), the split-screen
  gameplay (1 player = full screen, 2 = side by side, 3–4 = 2×2 grid, each
  player running their own independent 3D lane), and the final scoreboard.
- **controller.html** — what loads on each player's phone. Lets them pick a
  nickname, suit/accent/skin colors and a hairstyle, choose between **button
  controls** (left/right/jump/duck pads) or **swipe controls** (drag on a pad
  to change lanes, jump, or slide), and drives their runner in-game.

Both files must stay in the same folder — AirConsole loads `controller.html`
onto phones automatically once `screen.html` is running as the game screen.

## How multiplayer works

- Up to **4 active players** (`AirConsole.setActivePlayers(4)`); anyone who
  joins after that connects as a spectator only.
- The **first controller to connect** is the host (AirConsole's "master
  controller") and gets an extra **"Iniciar partida"** button in the lobby.
- Each player customizes their runner and taps **"Estoy listo"**; the host
  can start the round any time with 1–4 players connected.
- During play every player has their own camera/scene/physics — running
  into an obstacle only ends that player's run; the round ends once everyone
  has crashed, then the scoreboard (sorted by score) is broadcast to every
  phone before returning to the lobby.

## Testing locally

AirConsole provides a browser-based simulator so you don't need real phones
to test:

1. Host the folder anywhere reachable over HTTPS (AirConsole requires HTTPS
   in production; for quick local testing you can use the
   [AirConsole Simulator](https://developers.airconsole.com/#!/guides/simulator),
   which serves your local files and simulates 1–4 virtual controllers in
   browser tabs).
2. Open `screen.html` through the simulator — it plays the role of the TV.
3. Open the generated controller URLs (or the simulator's virtual controller
   tabs) to join as players.

## Publishing

To ship it for real, create a game on the
[AirConsole Developer Center](https://developers.airconsole.com/), point it
at your hosted `screen.html`, and upload/verify `controller.html` alongside
it per their submission checklist (icon, screenshots, `AIRCONSOLE-DEBUG`
removed, etc.).

## Notes / simplifications made during the conversion

- Music and sound effects are generated with the Web Audio API (as in the
  original) but are now a **single shared soundtrack** for the whole screen
  rather than per-player audio, since all players share one screen/speaker.
- Each player's 3D character preview was simplified from a live rotating
  canvas (used in the original single-player customization screen) to flat
  color swatches on the phone, since the controller is a 2D web page — the
  chosen colors/hat still apply to their in-game 3D model on the TV.
- Difficulty, speed ramp, obstacle patterns, coin values and physics
  constants are unchanged from the original single-player build.