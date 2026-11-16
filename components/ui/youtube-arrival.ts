import { getEmbedUrl } from "../../content/studio";

const videoId = "9ekaltChkjc";
const start = 13;

type Player = {
  mute: () => void;
  playVideo: () => void;
  pauseVideo: () => void;
  seekTo: (seconds: number, allowSeekAhead: boolean) => void;
  getCurrentTime: () => number;
  destroy: () => void;
};
type PlayerEvent = { target: Player; data: number };
type YouTube = { Player: new (iframe: HTMLIFrameElement, options: { events: {
  onReady: (event: PlayerEvent) => void;
  onStateChange: (event: PlayerEvent) => void;
  onError: () => void;
  onAutoplayBlocked: () => void;
} }) => Player };
type YouTubeWindow = Window & { YT?: YouTube; onYouTubeIframeAPIReady?: () => void };
let api: Promise<YouTube> | undefined;

function loadAPI() {
  const scope = window as YouTubeWindow;
  if (scope.YT?.Player) return Promise.resolve(scope.YT);
  if (api) return api;
  api = new Promise<YouTube>((resolve, reject) => {
    const previous = scope.onYouTubeIframeAPIReady;
    const script = document.createElement("script");
    const timer = window.setTimeout(() => reject(new Error("YouTube API unavailable")), 10000);
    scope.onYouTubeIframeAPIReady = () => {
      previous?.();
      clearTimeout(timer);
      if (scope.YT?.Player) resolve(scope.YT);
      else reject(new Error("YouTube API unavailable"));
    };
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => { clearTimeout(timer); reject(new Error("YouTube API unavailable")); };
    document.head.append(script);
  }).catch(error => { api = undefined; throw error; });
  return api;
}

export function createYouTubeArrival(frame: HTMLElement, failed: () => void) {
  let player: Player | undefined;
  let iframe: HTMLIFrameElement | undefined;
  let ready = false;
  let loading = false;
  let disposed = false;
  let enabled = false;
  let wanted = false;

  function remove() {
    ready = false;
    player?.destroy();
    player = undefined;
    iframe?.remove();
    iframe = undefined;
    delete frame.dataset.playing;
  }

  function fail() {
    remove();
    failed();
  }

  function update(playing: boolean, eligible: boolean) {
    wanted = playing;
    enabled = eligible;
    if (disposed) return;
    if (!enabled) { remove(); return; }
    if (ready && player) {
      player.mute();
      if (wanted) player.playVideo();
      else player.pauseVideo();
      return;
    }
    if (!wanted || loading || iframe) return;
    loading = true;
    void loadAPI().then(YT => {
      loading = false;
      if (disposed || !enabled || !wanted) return;
      iframe = document.createElement("iframe");
      iframe.dataset.heroPlayer = "";
      iframe.title = "SVOnTheBeat – 8 Bar Riddim (background video)";
      iframe.tabIndex = -1;
      iframe.setAttribute("aria-hidden", "true");
      iframe.allow = "autoplay; encrypted-media";
      iframe.referrerPolicy = "strict-origin-when-cross-origin";
      iframe.src = getEmbedUrl(videoId, {
        start, autoplay: 1, mute: 1, playsinline: 1, loop: 1, playlist: videoId,
        controls: 0, rel: 0, modestbranding: 1, iv_load_policy: 3, enablejsapi: 1,
        origin: location.origin,
      });
      frame.append(iframe);
      player = new YT.Player(iframe, { events: {
        onReady: ({ target }) => {
          if (disposed || !enabled) return;
          player = target;
          ready = true;
          target.mute();
          target.seekTo(start, true);
          update(wanted, enabled);
        },
        onStateChange: ({ target, data }) => {
          if (disposed || !enabled) return;
          if (data === 0) {
            delete frame.dataset.playing;
            target.seekTo(start, true);
            if (wanted) target.playVideo();
            else target.pauseVideo();
          } else if (data === 1) {
            if (!wanted) { target.pauseVideo(); return; }
            if (target.getCurrentTime() < start) { delete frame.dataset.playing; target.seekTo(start, true); }
            else frame.dataset.playing = "true";
          }
        },
        onAutoplayBlocked: fail,
        onError: fail,
      } });
    }).catch(() => { loading = false; if (!disposed && enabled) fail(); });
  }

  return {
    update,
    reconnect: () => { remove(); update(wanted, enabled); },
    destroy: () => { disposed = true; remove(); },
  };
}
