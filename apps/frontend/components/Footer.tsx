import { formatCopyright } from "../lib/logic";

interface FooterLink {
  label: string;
  url: string;
}

interface FooterProps {
  brand?: string;
  links?: FooterLink[];
}

const DEFAULT_LINKS: FooterLink[] = [
  { label: "About", url: "#" },
  { label: "Courses", url: "#courses" },
  { label: "Contact", url: "#" },
];

export default function Footer({ brand = "SkillPath", links = DEFAULT_LINKS }: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-sp-border bg-sp-surface px-6 py-8 text-sp-text">
      <div className="mx-auto flex max-w-[960px] flex-wrap items-center justify-between gap-4">
        <nav className="flex flex-wrap gap-6">
          {links.map((link) => (
            <a
              key={link.label}
              href={link.url}
              className="text-sm text-sp-text-muted no-underline transition-colors duration-150 ease-out hover:text-sp-accent"
            >
              {link.label}
            </a>
          ))}
        </nav>
        <p className="m-0 text-[13px] text-sp-text-muted">{formatCopyright(brand, year)}</p>
      </div>
    </footer>
  );
}
