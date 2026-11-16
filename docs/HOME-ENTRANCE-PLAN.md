# Homepage entrance animation: plan

## Revision 2 — Enter the house

Approved revision: replace the automatic Lights on reveal with a once-per-tab-session interactive entrance. Draw the house line by line, spray “The T-House” underneath, then invite the visitor to open the door. This supersedes the earlier 3.1-second automatic reveal and its hard cap.

## 1. Constraints

- Preserve the existing HouseElevation everywhere else, native scrolling after entry, browser history, carousel geometry and the single arrival media node.
- The gate is a fixed modal dialog with an accessible label. Background content is inert, focus stays inside, and `html` overflow is hidden until entry. Never cancel wheel or touch events.
- No new dependencies, canvas libraries, raster logos or third-party artwork. Use HouseElevation, Hurricane, Barlow, canvas black, sign white and signature red `#C83838`.
- Keep server rendering and no-JS usable. The gate only mounts when the pre-paint eligibility check allows it.

## 2. Sequence

1. **House, approximately 3.5 seconds:** split the intro copy's straight SVG commands (including relative moves and closed subpaths) into individual normalized line paths at runtime. Order ground/base, walls, roof, window/detail lines, then door. Each segment starts after the previous one, with only a slight overlap. Do not change the shared HouseElevation component.
2. **Spray, 1.2 seconds:** reveal the signature-red Hurricane title left to right with an SVG mask and moving soft brush. Turbulence/displacement grain, sparse overspray dots and a restrained glow give the lettering a spray-painted edge without sacrificing legibility.
3. **Invitation, 300 ms fade:** show the uppercase Barlow “Enter the house” button with tracked lettering and a visible focus ring. Focus it with `preventScroll`. Wait indefinitely; there is no automatic entry deadline.
4. **Entry:** click, Enter or Space opens the left-hinged door panel in 3D over 600 ms. Start hero playback at that moment. Then zoom the house around the doorway over 1000 ms using `power2.inOut`, enlarging the measured hero aperture to the full stage. End on the existing arrival first frame, without settling the carousel.
5. **Immediate entry:** Escape from the button state reveals the arrival without door/zoom animation.

## 3. Behaviour rules

| Situation | Behaviour |
|---|---|
| First eligible homepage document in a tab | Gate; record `sessionStorage.tHouseIntroSeen` |
| Reload / later visits in the same session | Skip |
| Back/forward, restored settled entry, scroll offset or hash | Skip |
| Internal navigation to `/` | Skip |
| System or site reduced motion; forced colours | Skip |
| No JavaScript | No gate; ordinary homepage |
| Storage access denied | Fail open to the homepage |
| Click, key or wheel during drawing/spray | Fast-forward to the focused button, never enter on that same action |
| Tab / Shift+Tab at the button | Keep focus inside the gate |
| Click / Enter / Space at the button | Door opening, then zoom and arrival |
| Escape at the button | Enter immediately |
| Video blocked/failed | Reveal the matching poster |
| Hidden tab / pagehide; reduced motion enabled mid-gate | Finish and restore the page |

## 4. Implementation and failure safety

- `home-intro-bootstrap.ts` retains the pre-paint eligibility decision and session key. It forwards initial input to the client gate; click/wheel handlers are passive. Only keyboard focus/activation defaults may be cancelled.
- `home-intro.tsx` portals the dialog to the body, preserves/restores background inert state and focus, and dynamically imports GSAP. No per-frame React state and no media-ready wait.
- Root states: `pending`, `running`, `ready`, `opening`, `done`. The hero holds playback through `ready`; `t-house:intro-aperture` releases it when the door starts opening. Completion removes the clip and scroll lock.
- No old hard cap. After hydration, CSS failure safety reveals all lines, the title and the button statically after six seconds, without dismissing the gate. A stalled opening also resets the zoom, backdrop and panel after three seconds and shows the static invitation again. If hydration never happens, the pending black layer, media clip and scroll lock clear after six seconds independently of further JavaScript; a pending-only bootstrap timer also marks the entry done when script execution remains available.
- The poster remains preloaded. Blocked playback still uses the same poster, and entry does not alter arrival settlement/history flags.

## 5. Verification

- Sample every segment's computed dash offset: ordered starts, monotonic fractional draws and only slight overlap. Sample spray-mask width and brush movement.
- Verify automatic button focus, modal containment, each fast-forward input without accidental entry, click/Enter/Space/Escape entry, scroll lock/restoration and the complete §3 eligibility table.
- Capture draw mid, spray mid, button, door opening, zoom mid and handoff at 1280 and 390 widths under `/home/ubuntu/shots/gate-*`.
- Compare stationary-poster handoff pixels against the no-gate first frame at 390/768/1280/1440 and 844×390. Run `check-handoff.cjs`, assert no horizontal overflow or page exceptions, then lint, typecheck and production build.
- Record outcomes and limitations in IMPLEMENTATION-STATUS. Deploy only a draft preview for review.
