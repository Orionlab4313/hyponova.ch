"use client";

import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

const mainNav = [
  { href: "/", label: "Privatkunden" },
  { href: "/ueber-uns", label: "Über HYPONOVA" },
];

const subNav = [
  { href: "/dienstleistungen", label: "Dienstleistungen" },
  { href: "/rechner", label: "Hypothekenrechner" },
  { href: "/termin", label: "Terminbuchung" },
  { href: "/kontakt", label: "Kontakt" },
  { href: "/faq", label: "FAQ" },
];

export default function Header() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [hoverStyle, setHoverStyle] = useState<{ left: number; width: number } | null>(null);
  const navRef = useRef<HTMLElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Set active underline position on mount and pathname change
  useEffect(() => {
    if (!navRef.current) return;
    const activeLink = navRef.current.querySelector(`[data-active="true"]`) as HTMLElement;
    if (activeLink) {
      setHoverStyle({ left: activeLink.offsetLeft, width: activeLink.offsetWidth });
    }
  }, [pathname]);

  const handleMouseEnter = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const el = e.currentTarget;
    setHoverStyle({ left: el.offsetLeft, width: el.offsetWidth });
  };

  const handleMouseLeave = () => {
    // Reset to active link
    if (!navRef.current) return;
    const activeLink = navRef.current.querySelector(`[data-active="true"]`) as HTMLElement;
    if (activeLink) {
      setHoverStyle({ left: activeLink.offsetLeft, width: activeLink.offsetWidth });
    } else {
      setHoverStyle(null);
    }
  };

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  return (
    <header
      className="sticky top-0 z-50 transition-all duration-300"
      style={{
        backgroundColor: scrolled ? "rgba(255,255,255,0.98)" : "#fff",
        backdropFilter: scrolled ? "blur(12px)" : "none",
        boxShadow: scrolled ? "0 1px 0 rgba(0,0,0,0.08)" : "none",
      }}
    >
      {/* Main Nav Bar */}
      <div style={{ borderBottom: "1px solid #e5e5e5" }}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">
            {/* Logo - BIGGER */}
            <Link href="/" className="flex items-center">
              <img
                src="https://dqryxcdwvuborlayjain.supabase.co/storage/v1/object/public/logos/hyponova-logo.png"
                alt="HYPONOVA"
                className="h-8 lg:h-10 w-auto"
              />
            </Link>

            {/* Main Navigation */}
            <nav className="hidden lg:flex items-center gap-8">
              {mainNav.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="text-[13px] font-medium uppercase tracking-[0.05em] transition-colors hover:text-black py-2"
                    style={{
                      color: active ? "#000" : "#6b6b6b",
                      borderBottom: active ? "2px solid #000" : "2px solid transparent",
                    }}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right side */}
            <div className="hidden lg:flex items-center gap-6">
              <button className="text-[13px] font-medium transition-colors hover:text-black" style={{ color: "#6b6b6b" }}>
                DE | EN
              </button>
              <Link
                href="/kontakt"
                className="flex items-center gap-2 text-[13px] font-medium transition-colors hover:text-black"
                style={{ color: "#6b6b6b" }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                Hilfe & Kontakt
              </Link>
            </div>

            {/* Mobile burger */}
            <button
              className="lg:hidden p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <span className="block h-[1.5px] transition-all duration-300" style={{ backgroundColor: "#000", transform: mobileOpen ? "rotate(45deg) translateY(9px)" : "none" }} />
                <span className="block h-[1.5px] transition-all duration-300" style={{ backgroundColor: "#000", opacity: mobileOpen ? 0 : 1 }} />
                <span className="block h-[1.5px] transition-all duration-300" style={{ backgroundColor: "#000", transform: mobileOpen ? "rotate(-45deg) translateY(-9px)" : "none" }} />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Sub Navigation with animated underline */}
      <div className="hidden lg:block" style={{ borderBottom: "1px solid #e5e5e5" }}>
        <div className="max-w-[1400px] mx-auto px-6 lg:px-10">
          <nav ref={navRef} className="relative flex items-center gap-8 h-12">
            {subNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                data-active={isActive(item.href)}
                className="relative text-[13px] font-medium transition-colors py-3"
                style={{ color: isActive(item.href) ? "#c8553d" : "#c8553d" }}
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
              >
                {item.label}
              </Link>
            ))}
            {/* Animated underline indicator */}
            {hoverStyle && (
              <motion.div
                className="absolute bottom-0 h-[2px]"
                style={{ backgroundColor: "#c8553d" }}
                initial={false}
                animate={{ left: hoverStyle.left, width: hoverStyle.width }}
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
          </nav>
        </div>
      </div>

      {/* Mobile Nav */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="lg:hidden overflow-hidden"
            style={{ backgroundColor: "#fff", borderBottom: "1px solid #e5e5e5" }}
          >
            <nav className="max-w-[1400px] mx-auto px-6 py-6 space-y-1">
              {[...mainNav, ...subNav].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block px-4 py-3 text-[15px] font-medium rounded-lg transition-colors hover:bg-gray-50"
                  style={{
                    color: isActive(item.href) ? "#c8553d" : "#1a1a1a",
                    borderLeft: isActive(item.href) ? "3px solid #c8553d" : "3px solid transparent",
                  }}
                  onClick={() => setMobileOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <div className="pt-4 mt-4" style={{ borderTop: "1px solid #e5e5e5" }}>
                <Link
                  href="/termin"
                  className="block w-full px-4 py-3 text-center text-[15px] font-medium text-white"
                  style={{ backgroundColor: "#000", borderRadius: "8px" }}
                  onClick={() => setMobileOpen(false)}
                >
                  Termin buchen
                </Link>
              </div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
