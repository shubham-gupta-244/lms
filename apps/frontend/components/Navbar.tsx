"use client";

interface NavLink {
  label: string;
  url: string;
}

const NAV_LINKS: NavLink[] = [
  { label: "Courses", url: "#courses" },
  { label: "About", url: "#about" },
  { label: "Contact", url: "#contact" },
];

export default function Navbar({ brand = "SkillPath" }: { brand?: string }) {
  return (
    <header className="sticky top-0 z-20 border-b border-sp-border bg-sp-bg">
      <div className="mx-auto flex max-w-[1100px] items-center justify-between gap-6 px-6 py-4">
        <a href="#" className="text-lg font-bold text-sp-text no-underline">
          {brand}
        </a>
        <nav className="flex flex-1 justify-center gap-7 max-[640px]:hidden">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.url}
              className="text-sm font-medium text-sp-text-muted no-underline transition-colors duration-150 ease-out hover:text-sp-accent"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <a
          href="#courses"
          className="rounded-lg bg-sp-accent px-[18px] py-2.5 text-sm font-semibold text-white no-underline transition-transform duration-150 ease-out hover:-translate-y-px hover:scale-105 hover:shadow-[0_6px_16px_color-mix(in_srgb,var(--color-sp-accent)_35%,transparent)] active:translate-y-0 active:scale-[0.98]"
        >
          Get started
        </a>
      </div>
    </header>
  );
}
