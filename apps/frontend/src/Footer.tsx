import * as React from "react";
import { addPropertyControls, ControlType } from "framer";
import { formatCopyright } from "./logic";

const PALETTE = {
  bg: "#050308",
  border: "#3a2c4a",
  text: "#f5f3f7",
  textMuted: "#b7aec2",
};

interface FooterLink {
  label: string;
  url: string;
}

interface FooterProps {
  brand: string;
  links: FooterLink[];
  accentColor: string;
}

export default function Footer(props: FooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer
      className="sp-footer"
      style={{ "--sp-accent": props.accentColor } as React.CSSProperties}
    >
      <style>{STYLES}</style>
      <div className="sp-footer-inner">
        <nav className="sp-footer-links">
          {props.links.map((link) => (
            <a key={link.label} href={link.url} className="sp-footer-link">
              {link.label}
            </a>
          ))}
        </nav>
        <p className="sp-footer-copy">{formatCopyright(props.brand, year)}</p>
      </div>
    </footer>
  );
}

Footer.defaultProps = {
  brand: "SkillPath",
  links: [
    { label: "About", url: "#" },
    { label: "Courses", url: "#" },
    { label: "Contact", url: "#" },
  ],
  accentColor: "#7c5cbf",
};

addPropertyControls(Footer, {
  brand: {
    type: ControlType.String,
    title: "Brand Name",
    defaultValue: Footer.defaultProps.brand,
  },
  links: {
    type: ControlType.Array,
    title: "Links",
    control: {
      type: ControlType.Object,
      controls: {
        label: { type: ControlType.String, title: "Label" },
        url: { type: ControlType.String, title: "URL" },
      },
    },
    defaultValue: Footer.defaultProps.links,
  },
  accentColor: {
    type: ControlType.Color,
    title: "Accent Color",
    defaultValue: Footer.defaultProps.accentColor,
  },
});

const STYLES = `
.sp-footer {
  background: ${PALETTE.bg};
  color: ${PALETTE.text};
  border-top: 1px solid ${PALETTE.border};
  padding: 32px 24px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
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
  color: var(--sp-accent);
}
.sp-footer-copy {
  margin: 0;
  font-size: 13px;
  color: ${PALETTE.textMuted};
}
`;
