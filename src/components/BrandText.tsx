/**
 * Rendert einen Text und macht jedes Vorkommen des Wortes "HYPONOVA"
 * automatisch fett. So bleibt der Markenname konsistent stark im Text.
 *
 * Verwendung: <BrandText>Willkommen bei HYPONOVA</BrandText>
 *   -> "Willkommen bei <strong>HYPONOVA</strong>"
 *
 * Wenn ein Vorkommen schon "HYPONOVA GmbH" ist, wird nur das Markenwort
 * gefettet, nicht der gesamte Firmenname.
 */
import { Fragment } from "react";

const BRAND = "HYPONOVA";
// Word-Boundary nicht via \b weil "HYPONOVA-" sonst ungefangen werden kann.
// Capture-Group damit split() den Treffer im Array behaelt.
const PATTERN = /(HYPONOVA)/g;

export default function BrandText({ children }: { children: string }) {
  if (typeof children !== "string" || !children.includes(BRAND)) {
    return <>{children}</>;
  }
  const parts = children.split(PATTERN);
  return (
    <>
      {parts.map((p, i) =>
        p === BRAND ? (
          <strong key={i} style={{ fontWeight: 700 }}>{BRAND}</strong>
        ) : (
          <Fragment key={i}>{p}</Fragment>
        ),
      )}
    </>
  );
}
