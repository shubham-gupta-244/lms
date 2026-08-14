import * as React from "react";

interface HeroProps {
  headline?: string;
  subheadline?: string;
  ctaLabel?: string;
}

export default function Hero({
  headline = "Learn the skills that actually\npay your bills.",
  subheadline = "Practical, project-based courses built by people who ship for a living.",
  ctaLabel = "Explore courses",
}: HeroProps) {
  const headlineLines = headline.split("\n").map((line) => line.trim());

  return (
    <section className="flex justify-center bg-sp-bg px-6 py-24 text-sp-text">
<<<<<<< Updated upstream
      <div className="flex max-w-xl animate-[sp-fade-in_0.6s_ease_both] flex-col items-center gap-5 text-center">
=======
      <div className="flex w-full animate-[sp-fade-in_0.6s_ease_both] flex-col items-center gap-5 text-center">
>>>>>>> Stashed changes
        <h1 className="m-0 text-[clamp(32px,5vw,52px)] font-bold leading-[1.1]">
          {headlineLines.map((line, i) => {
            const words = line.split(" ");
            const lastWord = words.pop();
            const rest = words.join(" ");
            return (
              <React.Fragment key={i}>
                {i > 0 ? <br /> : null}
<<<<<<< Updated upstream
=======

>>>>>>> Stashed changes
                {rest ? `${rest} ` : ""}
                <span className="text-sp-accent">{lastWord}</span>
              </React.Fragment>
            );
          })}
        </h1>
        <p className="m-0 text-[17px] leading-relaxed text-sp-text-muted">
          {subheadline}
        </p>
        <a
          href="#courses"
          className="mt-2 inline-block rounded-lg bg-sp-accent px-7 py-3.5 text-[15px] font-semibold text-white no-underline transition-transform duration-150 ease-out hover:-translate-y-0.5 hover:scale-[1.06] hover:shadow-[0_8px_24px_color-mix(in_srgb,var(--color-sp-accent)_45%,transparent)] active:translate-y-0 active:scale-[0.98]"
        >
          {ctaLabel}
        </a>
      </div>
    </section>
  );
}
