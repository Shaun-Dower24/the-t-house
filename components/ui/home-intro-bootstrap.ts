export const homeIntroBootstrap = `(() => {
  try {
    const root = document.documentElement;
    const navigation = performance.getEntriesByType('navigation')[0];
    if (location.pathname !== '/' || location.hash || scrollY ||
        (navigation && navigation.type !== 'navigate') ||
        history.state?.tHouseArrivalSettled ||
        matchMedia('(prefers-reduced-motion: reduce), (forced-colors: active)').matches ||
        localStorage.getItem('t-house-reduce-motion') === 'true' ||
        sessionStorage.getItem('tHouseIntroSeen') ||
        (document.referrer && new URL(document.referrer).origin === location.origin)) return;
    sessionStorage.setItem('tHouseIntroSeen', 'true');
    root.dataset.introStarted = String(performance.now());
    root.dataset.intro = 'pending';
    const inputs = ['click', 'wheel'];
    const options = { capture: true, passive: true };
    const finish = () => {
      root.dataset.intro = 'done';
      dispatchEvent(new Event('t-house:intro-done'));
    };
    const hidden = () => { if (document.hidden) finish(); };
    const forward = event => {
      if (!['pending', 'running'].includes(root.dataset.intro)) return;
      root.dataset.introFastForward = 'true';
      if (event.type === 'keydown') event.preventDefault();
      dispatchEvent(new CustomEvent('t-house:intro-forward', { detail: event }));
    };
    const cleanup = () => {
      clearTimeout(hydrationDeadline);
      inputs.forEach(type => window.removeEventListener(type, forward, options));
      window.removeEventListener('keydown', forward, true);
      window.removeEventListener('pagehide', finish);
      document.removeEventListener('visibilitychange', hidden);
      window.removeEventListener('t-house:intro-done', cleanup);
    };
    inputs.forEach(type => window.addEventListener(type, forward, options));
    window.addEventListener('keydown', forward, true);
    window.addEventListener('pagehide', finish);
    document.addEventListener('visibilitychange', hidden);
    window.addEventListener('t-house:intro-done', cleanup);
    const hydrationDeadline = setTimeout(() => { if (root.dataset.intro === 'pending') finish(); }, 6000);
    hidden();
  } catch {}
})();`;

export const homeIntroFailsafe = `
@keyframes t-house-intro-clear { to { opacity: 0; visibility: hidden; } }
@keyframes t-house-intro-unclip { to { clip-path: inset(0); } }
@keyframes t-house-intro-unlock { to { overflow: visible; } }
html:is([data-intro="pending"], [data-intro="running"], [data-intro="ready"], [data-intro="opening"]) { overflow: hidden; }
html[data-intro="pending"] { animation: t-house-intro-unlock 0s 6s forwards; }
html[data-intro="pending"]::before {
  content: ''; position: fixed; inset: 0; z-index: 2; background: #0b0b0b;
  pointer-events: auto; animation: t-house-intro-clear 0s 6s forwards;
}
html:is([data-intro="pending"], [data-intro="running"], [data-intro="ready"]) [data-arrival-media] { clip-path: inset(50%); }
html[data-intro="done"] [data-arrival-media] { clip-path: none !important; }
html[data-intro="pending"] [data-arrival-media] {
  animation: t-house-intro-unclip 0s 6s forwards;
}
@media (prefers-reduced-motion: reduce), (forced-colors: active) {
  html[data-intro]::before { display: none; }
  html[data-intro] .site-header { opacity: 1; }
  html[data-intro] [data-arrival-media] { clip-path: none; }
}
`;
