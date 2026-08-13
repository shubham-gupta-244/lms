import * as React from "react";
import { addPropertyControls, ControlType } from "framer";

const PALETTE = {
  bg: "#0f0b16",
  text: "#f5f3f7",
  textMuted: "#b7aec2",
  black: "#050308",
};

interface HeroProps {
  headline: string;
  subheadline: string;
  ctaLabel: string;
  accentColor: string;
}

export default function Hero(props: HeroProps) {
  return (
    <section
      className="sp-hero"
      style={{ "--sp-accent": props.accentColor } as React.CSSProperties}
    >
      <style>{STYLES}</style>
      <div className="sp-hero-inner">
        <h1 className="sp-hero-headline">{props.headline}</h1>
        <p className="sp-hero-sub">{props.subheadline}</p>
        <button type="button" className="sp-hero-cta">
          {props.ctaLabel}
        </button>
      </div>
    </section>
  );
}

Hero.defaultProps = {
  headline: "Learn skills that actually pay off.",
  subheadline: "Practical, project-based courses built by people who ship for a living.",
  ctaLabel: "Explore courses",
  accentColor: "#7c5cbf",
};

addPropertyControls(Hero, {
  headline: {
    type: ControlType.String,
    title: "Headline",
    defaultValue: Hero.defaultProps.headline,
  },
  subheadline: {
    type: ControlType.String,
    title: "Subheadline",
    defaultValue: Hero.defaultProps.subheadline,
  },
  ctaLabel: {
    type: ControlType.String,
    title: "Button Label",
    defaultValue: Hero.defaultProps.ctaLabel,
  },
  accentColor: {
    type: ControlType.Color,
    title: "Accent Color",
    defaultValue: Hero.defaultProps.accentColor,
  },
});

const STYLES = `
.sp-hero {
  background: ${PALETTE.bg};
  color: ${PALETTE.text};
  padding: 96px 24px;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  display: flex;
  justify-content: center;
}
.sp-hero-inner {
  max-width: 640px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  animation: sp-hero-in 0.6s ease both;
}
.sp-hero-headline {
  font-size: clamp(32px, 5vw, 52px);
  font-weight: 700;
  margin: 0;
  line-height: 1.1;
}
.sp-hero-sub {
  font-size: 17px;
  color: ${PALETTE.textMuted};
  margin: 0;
  line-height: 1.5;
}
.sp-hero-cta {
  margin-top: 8px;
  background: var(--sp-accent);
  color: ${PALETTE.black};
  border: none;
  border-radius: 8px;
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}
.sp-hero-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--sp-accent) 45%, transparent);
}
.sp-hero-cta:active {
  transform: translateY(0);
}
@keyframes sp-hero-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
`;
