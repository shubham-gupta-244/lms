const PALETTE = {
  bg: "#0f0b16",
  text: "#f5f3f7",
  textMuted: "#b7aec2",
  black: "#050308",
  accent: "#7c5cbf",
};

interface HeroProps {
  headline?: string;
  subheadline?: string;
  ctaLabel?: string;
}

export default function Hero({
  headline = "Learn skills that actually pay off.",
  subheadline = "Practical, project-based courses built by people who ship for a living.",
  ctaLabel = "Explore courses",
}: HeroProps) {
  return (
    <section className="sp-hero">
      <style>{STYLES}</style>
      <div className="sp-hero-inner">
        <h1 className="sp-hero-headline">{headline}</h1>
        <p className="sp-hero-sub">{subheadline}</p>
        <a href="#courses" className="sp-hero-cta">
          {ctaLabel}
        </a>
      </div>
    </section>
  );
}

const STYLES = `
.sp-hero {
  background: ${PALETTE.bg};
  color: ${PALETTE.text};
  padding: 96px 24px;
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
  background: ${PALETTE.accent};
  color: ${PALETTE.black};
  border: none;
  border-radius: 8px;
  padding: 14px 28px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  display: inline-block;
  transition: transform 0.15s ease, box-shadow 0.2s ease;
}
.sp-hero-cta:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px color-mix(in srgb, ${PALETTE.accent} 45%, transparent);
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
