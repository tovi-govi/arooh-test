import { useState } from "react";
import { Link, useLocation } from "wouter";

const links = [
  ["About", "/about"],
  ["Events", "/events"],
  ["Schedule", "/schedule"],
  ["Sponsors", "/sponsors"],
  ["Contact", "/contact"],
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [location] = useLocation();
  return (
    <>
      <div className="topline" />
      <header className="site-header">
        <div className="container nav-inner">
          <Link href="/" className="brand" onClick={() => setOpen(false)}>
            RED<span>/</span>LINE
          </Link>
          <nav className={open ? "nav-links open" : "nav-links"}>
            {links.map(([label, href]) => (
              <Link key={href} href={href} className={location === href ? "active" : ""} onClick={() => setOpen(false)}>{label}</Link>
            ))}
          </nav>
          <Link href="/register" className="button button-red nav-register">Register ↗</Link>
          <button className="menu-toggle" aria-label="Toggle navigation" onClick={() => setOpen(!open)}>{open ? "×" : "☰"}</button>
        </div>
      </header>
    </>
  );
}
