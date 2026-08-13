import { formatCopyright } from "../lib/logic";

const PALETTE = {
  bg: "#050308",
  border: "#3a2c4a",
  text: "#f5f3f7",
  textMuted: "#b7aec2",
  accent: "#7c5cbf",
};

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
    <footer className="sp-footer">
      <style>{STYLES}</style>
      <div className="sp-footer-inner">
        <nav className="sp-footer-links">
          {links.map((link) => (
            <a key={link.label} href={link.url} className="sp-footer-link">
              {link.label}
            </a>
          ))}
        </nav>
        <p className="sp-footer-copy">{formatCopyright(brand, year)}</p>
      </div>
    </footer>
  );
}

const STYLES = `
.sp-footer {
  background: ${PALETTE.bg};
  color: ${PALETTE.text};
  border-top: 1px solid ${PALETTE.border};
  padding: 32px 24px;
}
.sp-footer-inner {
  max-width: 960px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}
.sp-footer-links {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}
.sp-footer-link {
  color: ${PALETTE.textMuted};
  text-decoration: none;
  font-size: 14px;
  transition: color 0.15s ease;
}
.sp-footer-link:hover {
  color: ${PALETTE.accent};
}
.sp-footer-copy {
  margin: 0;
  font-size: 13px;
  color: ${PALETTE.textMuted};
}
`;
