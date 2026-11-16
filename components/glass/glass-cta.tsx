import Link from "next/link";
import type { ReactNode } from "react";
import styles from "./glass.module.css";

export function GlassCTA({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className={`${styles.panel} ${styles.cta}`}>{children}<span aria-hidden="true">↗</span></Link>;
}
