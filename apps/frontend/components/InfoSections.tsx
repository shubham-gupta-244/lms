export default function InfoSections() {
  return (
    <>
      <section id="about" className="bg-sp-bg px-6 py-14">
        <div className="mx-auto max-w-[720px] text-center">
          <h2 className="m-0 mb-3 text-2xl font-bold text-sp-text">About SkillPath</h2>
          <p className="m-0 text-[15px] leading-relaxed text-sp-text-muted">
            SkillPath is a project-based learning platform built by people who ship for a
            living. We focus on practical courses that translate directly into real work.
          </p>
        </div>
      </section>

      <section
        id="contact"
        className="border-y border-sp-border bg-sp-surface px-6 py-14"
      >
        <div className="mx-auto max-w-[720px] text-center">
          <h2 className="m-0 mb-3 text-2xl font-bold text-sp-text">Contact us</h2>
          <p className="m-0 text-[15px] leading-relaxed text-sp-text-muted">
            Have a question about a course or a partnership? Reach out at{" "}
            <a
              className="font-semibold text-sp-accent no-underline hover:underline"
              href="mailto:hello@skillpath.dev"
            >
              hello@skillpath.dev
            </a>
            .
          </p>
        </div>
      </section>
    </>
  );
}
