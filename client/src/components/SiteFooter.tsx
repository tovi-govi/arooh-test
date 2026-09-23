import { Link } from "wouter";

export default function SiteFooter() {
  return <footer className="site-footer" id="contact"><div className="container footer-grid"><div><div className="footer-brand">RED<span>/</span>LINE</div><p>College Tech Fest // Edition 08<br />Nexus Campus, Pune 411007<br />India</p></div><div><h4>Write to us</h4><a href="mailto:hello@redlinefest.example">hello@redlinefest.example</a><a href="tel:+910000000000">+91 00000 00000</a></div><div><h4>Find us online</h4><a href="#">Instagram ↗</a><a href="#">LinkedIn ↗</a><a href="#">Discord ↗</a></div></div><div className="container copyright"><span>© 2026 REDLINE / placeholder content</span><span>Built loud. Built together.</span><Link href="/register">Join the line ↗</Link></div></footer>;
}
