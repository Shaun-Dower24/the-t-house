import type { CSSProperties } from "react";
import { studio } from "../content/studio";

const columns = 22;
const rows = 10;

function tileLight(column: number, row: number) {
  const distance = Math.abs(column - (columns - 1) / 2);
  const roof = Math.abs(row - (distance * 0.51 + 1.1)) < 0.55 && distance < 7;
  const walls = distance === 6.5 && row > 4 && row < 9;
  const floor = row === 8 && distance < 7;
  const door = distance === 1.5 && row >= 6 && row <= 8;
  const reflection = (Math.sin(column * 0.71 + row * 0.83) + 1) / 2;
  const grain = ((column * 17 + row * 13 + column * row * 3) % 21) / 20;

  return roof || walls || floor || door
    ? 0.37 + grain * 0.35
    : 0.035 + reflection * grain * 0.31;
}

export function TileWall() {
  return (
    <div className="tile-stage">
      <div className="tile-perspective" aria-hidden="true">
        <div className="tile-field" data-tile-field>
          {Array.from({ length: columns * rows }, (_, index) => {
            const column = index % columns;
            const row = Math.floor(index / columns);

            return (
              <span key={index} style={{ "--light": tileLight(column, row) } as CSSProperties} />
            );
          })}
        </div>
      </div>
      <nav className="tile-links" aria-label="Explore The T-House">
        <a className="tile-link studio-node" href="#inside"><i aria-hidden="true" />The studio</a>
        <a className="tile-link watch-node" href={studio.youtube} aria-label="Watch on YouTube"><i aria-hidden="true" />Watch<span aria-hidden="true">↗</span></a>
        <a className="tile-link follow-node" href="#follow"><i aria-hidden="true" />Stay connected</a>
      </nav>
    </div>
  );
}
