export function HouseOutline() {
  return (
    <svg className="house-outline" viewBox="0 0 540 420" fill="none" aria-hidden="true">
      <g className="house-guides">
        <path d="M42 370H498M270 23V399M42 184H498M80 42V390M460 42V390" />
        <path d="M70 53h20m-10-10v20m370-10h20m-10-10v20M70 380h20m-10-10v20m370-10h20m-10-10v20" />
      </g>
      <g className="house-frames">
        <polygon points="80,370 80,172 270,48 460,172 460,370 270,370" />
        <polygon points="107,350 107,183 270,77 433,183 433,350 270,350" />
        <polygon points="134,330 134,196 270,107 406,196 406,330 270,330" />
        <polygon points="161,310 161,209 270,138 379,209 379,310 270,310" />
      </g>
      <path className="house-door" d="M241 310V241h58v69" />
      <path className="house-datum" d="M254 370h32" />
    </svg>
  );
}
