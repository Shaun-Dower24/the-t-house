import { useId } from "react";

export function StudioMark({ className }: { className?: string }) {
  const filterId = useId();

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      className={className}
      viewBox="0 0 150 150"
      width={150}
      height={150}
    >
      <defs>
        <filter id={filterId} x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
          {/* Keep the bright house lines and drop the darker photographed background. */}
          <feColorMatrix in="SourceGraphic" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0.53 1.80 0.17 0 -0.82" result="houseMask" />
          <feFlood floodColor="var(--sign-white)" />
          <feComposite in2="houseMask" operator="in" result="house" />

          {/* The red lettering has a much stronger red channel than the wood or white lines. */}
          <feColorMatrix in="SourceGraphic" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  8 -8 0 0 -0.78" result="signatureMask" />
          <feFlood floodColor="var(--signature-red)" />
          <feComposite in2="signatureMask" operator="in" result="signature" />

          <feMerge>
            <feMergeNode in="house" />
            <feMergeNode in="signature" />
          </feMerge>
        </filter>
      </defs>
      <image href="/images/t-house-neon-mark.jpg" width={150} height={150} filter={`url(#${filterId})`} />
    </svg>
  );
}
