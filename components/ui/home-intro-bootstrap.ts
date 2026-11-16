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
    const inputs = ['keydown', 'pointerdown', 'touchstart', 'click', 'wheel', 'scroll', 'pagehide'];
    const options = { capture: true, passive: true };
    let timer;
    const finish = () => {
      root.dataset.intro = 'done';
      dispatchEvent(new Event('t-house:intro-done'));
    };
    const hidden = () => { if (document.hidden) finish(); };
    const cleanup = () => {
      clearTimeout(timer);
      inputs.forEach(type => window.removeEventListener(type, finish, options));
      document.removeEventListener('visibilitychange', hidden);
      window.removeEventListener('t-house:intro-done', cleanup);
    };
    inputs.forEach(type => window.addEventListener(type, finish, options));
    document.addEventListener('visibilitychange', hidden);
    window.addEventListener('t-house:intro-done', cleanup);
    timer = setTimeout(finish, 3200);
    hidden();
  } catch {}
})();`;

export const homeIntroFailsafe = `
@keyframes t-house-intro-clear { to { opacity: 0; visibility: hidden; } }
@keyframes t-house-intro-unclip { to { clip-path: inset(0); } }
@keyframes t-house-intro-visible { to { opacity: 1; } }
html:is([data-intro="pending"], [data-intro="running"])::before {
  content: ''; position: fixed; inset: 0; z-index: 2; background: #0b0b0b;
  pointer-events: none; animation: t-house-intro-clear 0s var(--intro-failsafe-delay, 4.5s) forwards;
}
html[data-intro="running"]::before { content: none; }
html:is([data-intro="pending"], [data-intro="running"]) .site-header { opacity: .4; }
html:is([data-intro="pending"], [data-intro="running"]) [data-arrival-media] { clip-path: inset(50%); }
html:is([data-intro="pending"], [data-intro="running"], [data-intro="opening"]) [data-arrival-actions] { opacity: 0; }
html[data-intro="done"] [data-arrival-media] { clip-path: none !important; }
html:is([data-intro="pending"], [data-intro="running"], [data-intro="opening"]) [data-arrival-media] {
  animation: t-house-intro-unclip 0s var(--intro-failsafe-delay, 4.5s) forwards;
}
html:is([data-intro="pending"], [data-intro="running"], [data-intro="opening"]) :is(.site-header, [data-arrival-actions]) {
  animation: t-house-intro-visible 0s var(--intro-failsafe-delay, 4.5s) forwards;
}
@media (prefers-reduced-motion: reduce), (forced-colors: active) {
  html[data-intro]::before { display: none; }
  html[data-intro] :is(.site-header, [data-arrival-actions]) { opacity: 1; }
  html[data-intro] [data-arrival-media] { clip-path: none; }
}
`;
