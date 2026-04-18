import React, { useEffect, useState } from "react";

const e = React.createElement;

const siteConfig = {
  name: "Spider Agency",
  email: "hello@spideragency.dev",
  location: "Dhaka, Bangladesh",
  responseTime: "Typical reply time: within 24 hours",
  calendarUrl: "",
};

const navItems = [
  { label: "Services", href: "#services" },
  { label: "Work", href: "#work" },
  { label: "Process", href: "#process" },
  { label: "Testimonials", href: "#testimonials" },
  { label: "Contact", href: "#contact" },
];

const services = [
  {
    title: "AI Automation",
    description:
      "We design workflow automations, internal copilots, and AI-powered operations that remove repetitive work.",
    outcomes: ["Lead routing", "Sales ops automation", "Support workflows"],
  },
  {
    title: "Web Design and Development",
    description:
      "Launch-ready marketing sites, SaaS dashboards, and custom web apps built for clarity, speed, and conversion.",
    outcomes: ["Landing pages", "Product sites", "Custom frontends"],
  },
  {
    title: "Growth Systems",
    description:
      "We connect analytics, CRM flows, and conversion experiments so you can measure what is working and scale it.",
    outcomes: ["Analytics setup", "CRO experiments", "Reporting systems"],
  },
  {
    title: "Cloud and DevOps",
    description:
      "Infrastructure planning, deployment pipelines, monitoring, and performance hardening for fast-moving teams.",
    outcomes: ["Deploy pipelines", "Performance reviews", "Observability"],
  },
  {
    title: "Product Strategy",
    description:
      "From offer positioning to roadmap shaping, we turn scattered ideas into a scoped delivery plan your team can execute.",
    outcomes: ["Feature scoping", "Technical discovery", "Roadmap support"],
  },
  {
    title: "Retained Delivery",
    description:
      "Need a hands-on technical partner every month? We support ongoing builds, experiments, and optimization work.",
    outcomes: ["Monthly sprints", "Priority support", "Continuous iteration"],
  },
];

const projects = [
  {
    title: "Revenue-Focused SaaS Site",
    industry: "B2B SaaS",
    summary:
      "Rebuilt a confusing product site into a clear conversion path with stronger messaging, demo CTAs, and cleaner analytics.",
    results: ["Faster page load", "Clearer user journeys", "Better-qualified leads"],
  },
  {
    title: "Operations Automation Stack",
    industry: "Service Business",
    summary:
      "Connected forms, CRM, email routing, and delivery alerts into one automated client onboarding workflow.",
    results: ["Less manual admin", "Faster response time", "Cleaner project handoffs"],
  },
  {
    title: "Lead Capture Microsystem",
    industry: "Growth Team",
    summary:
      "Designed a lightweight funnel with targeted messaging, booking logic, and segmentation to improve inbound quality.",
    results: ["Sharper messaging", "Smarter lead intake", "More usable pipeline data"],
  },
];

const processSteps = [
  {
    title: "Discover",
    copy: "We align on your offer, bottlenecks, audience, and business goals before making technical decisions.",
  },
  {
    title: "Scope",
    copy: "You get a delivery plan with priorities, responsibilities, and the fastest route to a useful first release.",
  },
  {
    title: "Build",
    copy: "We design, implement, and test the system with attention to performance, clarity, and maintainability.",
  },
  {
    title: "Launch",
    copy: "We handle polish, QA, and rollout support so the handoff feels calm instead of chaotic.",
  },
  {
    title: "Optimize",
    copy: "After launch, we improve conversion, automation quality, and reporting based on real usage data.",
  },
];

const testimonials = [
  {
    quote:
      "Spider Agency turned a vague idea into a polished site and a much cleaner lead flow. The project felt organized from day one.",
    name: "Amin Rahman",
    role: "Founder, B2B Studio",
  },
  {
    quote:
      "The automation work removed hours of repetitive admin every week. We finally have a process that scales with the team.",
    name: "Sarah Malik",
    role: "Operations Lead",
  },
  {
    quote:
      "Strong communication, smart technical judgment, and real follow-through. We shipped faster than expected without sacrificing quality.",
    name: "Jonathan Reed",
    role: "Product Consultant",
  },
];

const faqs = [
  {
    question: "What kinds of clients are the best fit?",
    answer:
      "Teams that already have demand or a clear offer usually get the most value. We work best when there is a real business goal behind the build.",
  },
  {
    question: "Can you handle both strategy and execution?",
    answer:
      "Yes. We can help define the scope, shape the user experience, build the site or system, and support launch and iteration.",
  },
  {
    question: "Do you offer ongoing support?",
    answer:
      "Yes. We can stay involved through a monthly retainer for optimization, new features, performance improvements, and technical support.",
  },
  {
    question: "How quickly can we start?",
    answer:
      "Small projects can often start quickly. Larger builds usually begin with a short discovery step so the execution phase stays focused.",
  },
];

const initialForm = {
  name: "",
  company: "",
  email: "",
  service: services[0].title,
  budget: "",
  timeline: "",
  message: "",
};

function classNames(...values) {
  return values.filter(Boolean).join(" ");
}

function Section({ id, eyebrow, title, lead, alternate, children }) {
  return e(
    "section",
    {
      id,
      className: classNames("section", alternate && "section--alt"),
      "data-reveal": "true",
    },
    e(
      "div",
      { className: "container" },
      e(
        "div",
        { className: "section-head" },
        eyebrow ? e("p", { className: "eyebrow" }, eyebrow) : null,
        title ? e("h2", { className: "section-title" }, title) : null,
        lead ? e("p", { className: "section-lead" }, lead) : null
      ),
      children
    )
  );
}

function ActionLink({ href, label, variant = "primary", onClick }) {
  return e(
    "a",
    {
      href,
      className: classNames(
        "btn",
        variant === "secondary" ? "btn--secondary" : "btn--primary"
      ),
      onClick,
    },
    label
  );
}

function ServiceCard({ title, description, outcomes }) {
  return e(
    "article",
    { className: "panel card" },
    e("p", { className: "card-kicker" }, "Service"),
    e("h3", { className: "card-title" }, title),
    e("p", { className: "card-copy" }, description),
    e(
      "ul",
      { className: "tag-list", "aria-label": `${title} outcomes` },
      outcomes.map((item) =>
        e("li", { key: item, className: "tag" }, item)
      )
    )
  );
}

function ProjectCard({ title, industry, summary, results }) {
  return e(
    "article",
    { className: "panel project-card" },
    e("p", { className: "card-kicker" }, industry),
    e("h3", { className: "card-title" }, title),
    e("p", { className: "card-copy" }, summary),
    e(
      "ul",
      { className: "result-list" },
      results.map((item) => e("li", { key: item }, item))
    ),
    e(
      "a",
      { href: "#contact", className: "text-link" },
      "Discuss a similar project"
    )
  );
}

function ProcessCard({ index, title, copy }) {
  return e(
    "article",
    { className: "panel process-card" },
    e("span", { className: "step-number" }, `0${index + 1}`),
    e("h3", { className: "card-title" }, title),
    e("p", { className: "card-copy" }, copy)
  );
}

function TestimonialCard({ quote, name, role }) {
  return e(
    "figure",
    { className: "panel testimonial-card" },
    e("blockquote", { className: "testimonial-quote" }, quote),
    e(
      "figcaption",
      { className: "testimonial-meta" },
      e("span", { className: "testimonial-name" }, name),
      e("span", { className: "testimonial-role" }, role)
    )
  );
}

function FaqItem({ item, open, onToggle }) {
  return e(
    "article",
    { className: classNames("faq-item", open && "faq-item--open") },
    e(
      "button",
      {
        type: "button",
        className: "faq-question",
        onClick: onToggle,
        "aria-expanded": open,
      },
      e("span", null, item.question),
      e("span", { className: "faq-symbol", "aria-hidden": "true" }, open ? "-" : "+")
    ),
    e("div", { className: "faq-answer" }, e("p", null, item.answer))
  );
}

export function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeFaq, setActiveFaq] = useState(0);
  const [formData, setFormData] = useState(initialForm);
  const [formState, setFormState] = useState({ type: "idle", message: "" });

  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const elements = Array.from(document.querySelectorAll("[data-reveal]"));

    if (reducedMotion.matches) {
      elements.forEach((element) => element.classList.add("active"));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("active");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.18 }
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setMobileOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleFieldChange(event) {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setFormState({
        type: "error",
        message: "Please add your name, email, and a short project brief.",
      });
      return;
    }

    const messageLines = [
      `Name: ${formData.name.trim()}`,
      `Company: ${formData.company.trim() || "Not provided"}`,
      `Email: ${formData.email.trim()}`,
      `Service: ${formData.service}`,
      `Budget: ${formData.budget.trim() || "Not provided"}`,
      `Timeline: ${formData.timeline.trim() || "Not provided"}`,
      "",
      "Project brief:",
      formData.message.trim(),
      "",
      "Sent from the Spider Agency website.",
    ];

    const plainMessage = messageLines.join("\n");
    const subject = encodeURIComponent(
      `Project inquiry from ${formData.name.trim()}`
    );
    const body = encodeURIComponent(plainMessage);

    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(plainMessage);
      }
    } catch (error) {
      // Clipboard access is optional. The mailto flow still works without it.
    }

    window.location.href = `mailto:${siteConfig.email}?subject=${subject}&body=${body}`;

    setFormState({
      type: "success",
      message:
        "Your email app should open now. We also copied the inquiry to your clipboard as a backup when allowed by your browser.",
    });
    setFormData(initialForm);
  }

  function closeMobileMenu() {
    setMobileOpen(false);
  }

  const bookingHref = siteConfig.calendarUrl || "#contact";
  const currentYear = new Date().getFullYear();

  return e(
    "div",
    { className: "site-shell", id: "page-top" },
    e(
      "header",
      { className: "site-header" },
      e(
        "div",
        { className: "container nav-shell" },
        e(
          "a",
          { href: "#page-top", className: "brand", onClick: closeMobileMenu },
          e("span", { className: "brand-mark", "aria-hidden": "true" }, "SA"),
          e(
            "span",
            { className: "brand-text" },
            e("strong", null, siteConfig.name),
            e("span", null, "AI systems, websites, and growth ops")
          )
        ),
        e(
          "nav",
          { className: "nav-links", "aria-label": "Primary" },
          navItems.map((item) =>
            e(
              "a",
              {
                key: item.href,
                href: item.href,
                className: "nav-link",
                onClick: closeMobileMenu,
              },
              item.label
            )
          )
        ),
        e(
          "div",
          { className: "nav-actions" },
          e(
            "button",
            {
              type: "button",
              className: classNames("mobile-toggle", mobileOpen && "mobile-toggle--open"),
              "aria-expanded": mobileOpen,
              "aria-controls": "mobile-menu",
              onClick: () => setMobileOpen((current) => !current),
            },
            e("span", null, "Menu")
          ),
          e(ActionLink, {
            href: bookingHref,
            label: "Start a Project",
            onClick: closeMobileMenu,
          })
        )
      ),
      e(
        "div",
        {
          id: "mobile-menu",
          className: classNames("mobile-menu", mobileOpen && "mobile-menu--open"),
        },
        e(
          "nav",
          { className: "mobile-menu__links", "aria-label": "Mobile" },
          navItems.map((item) =>
            e(
              "a",
              {
                key: item.href,
                href: item.href,
                className: "mobile-link",
                onClick: closeMobileMenu,
              },
              item.label
            )
          ),
          e(ActionLink, {
            href: bookingHref,
            label: "Book Discovery Call",
            variant: "secondary",
            onClick: closeMobileMenu,
          })
        )
      )
    ),
    e(
      "main",
      { id: "main-content", className: "main-content" },
      e(
        "section",
        { className: "hero", "data-reveal": "true" },
        e(
          "div",
          { className: "container hero-grid" },
          e(
            "div",
            { className: "hero-copy" },
            e("p", { className: "eyebrow" }, "Built for serious client work"),
            e(
              "h1",
              { className: "hero-title" },
              "We build AI systems, websites, and automation that help agencies move faster and close better clients."
            ),
            e(
              "p",
              { className: "hero-lead" },
              "Spider Agency helps service businesses and product teams turn messy ideas into clean delivery. Strategy, design, build, launch, and optimization all live in one execution flow."
            ),
            e(
              "div",
              { className: "cta-row" },
              e(ActionLink, { href: "#contact", label: "Start a Project" }),
              e(ActionLink, {
                href: bookingHref,
                label: "Book a Call",
                variant: "secondary",
              })
            ),
            e(
              "div",
              { className: "trust-row" },
              e("span", { className: "trust-pill" }, "Launch-ready delivery"),
              e("span", { className: "trust-pill" }, "Accessible and responsive"),
              e("span", { className: "trust-pill" }, "Built for conversion")
            )
          ),
          e(
            "aside",
            { className: "panel hero-panel" },
            e("p", { className: "card-kicker" }, "What clients usually need first"),
            e("h2", { className: "card-title" }, "A sharper system, not just a prettier site."),
            e(
              "ul",
              { className: "feature-list" },
              e("li", null, "Clear offer positioning and stronger call-to-action paths"),
              e("li", null, "Lead capture that routes inquiries to the right next step"),
              e("li", null, "Automation that removes repetitive team handoffs"),
              e("li", null, "A technical partner who can actually ship")
            ),
            e(
              "div",
              { className: "hero-stats" },
              e(
                "div",
                { className: "stat-card" },
                e("strong", null, "1"),
                e("span", null, "Execution partner")
              ),
              e(
                "div",
                { className: "stat-card" },
                e("strong", null, "3"),
                e("span", null, "Core delivery tracks")
              ),
              e(
                "div",
                { className: "stat-card" },
                e("strong", null, "24h"),
                e("span", null, "Typical reply time")
              )
            )
          )
        )
      ),
      e(
        Section,
        {
          id: "services",
          eyebrow: "Services",
          title: "What we can build with you",
          lead:
            "Choose a focused engagement or combine multiple tracks into one delivery plan.",
        },
        e(
          "div",
          { className: "service-grid" },
          services.map((service) =>
            e(ServiceCard, {
              key: service.title,
              title: service.title,
              description: service.description,
              outcomes: service.outcomes,
            })
          )
        )
      ),
      e(
        Section,
        {
          id: "work",
          eyebrow: "Selected Work",
          title: "Built for business outcomes, not portfolio filler",
          lead:
            "These examples show the kinds of problems we solve: clarity, speed, conversion, and operational cleanup.",
          alternate: true,
        },
        e(
          "div",
          { className: "project-grid" },
          projects.map((project) =>
            e(ProjectCard, {
              key: project.title,
              title: project.title,
              industry: project.industry,
              summary: project.summary,
              results: project.results,
            })
          )
        )
      ),
      e(
        Section,
        {
          id: "process",
          eyebrow: "Process",
          title: "A calm delivery system from first call to launch",
          lead:
            "You should always know what is being built, why it matters, and what comes next.",
        },
        e(
          "div",
          { className: "process-grid" },
          processSteps.map((step, index) =>
            e(ProcessCard, {
              key: step.title,
              index,
              title: step.title,
              copy: step.copy,
            })
          )
        )
      ),
      e(
        Section,
        {
          id: "testimonials",
          eyebrow: "Proof",
          title: "Clients trust us to make progress visible",
          lead:
            "Good work matters, but so does communication. The experience should feel steady from start to finish.",
          alternate: true,
        },
        e(
          "div",
          { className: "testimonial-grid" },
          testimonials.map((item) =>
            e(TestimonialCard, {
              key: item.name,
              quote: item.quote,
              name: item.name,
              role: item.role,
            })
          )
        )
      ),
      e(
        Section,
        {
          id: "faq",
          eyebrow: "FAQ",
          title: "A few practical questions, answered",
          lead:
            "If your project is a little unusual, that is fine. We can scope the right approach together.",
        },
        e(
          "div",
          { className: "faq-list" },
          faqs.map((item, index) =>
            e(FaqItem, {
              key: item.question,
              item,
              open: activeFaq === index,
              onToggle: () => setActiveFaq(activeFaq === index ? -1 : index),
            })
          )
        )
      ),
      e(
        Section,
        {
          id: "contact",
          eyebrow: "Contact",
          title: "Tell us what you are building",
          lead:
            "Use the form below and your email app will open with a ready-to-send inquiry. This keeps the site fully static while still giving you a working intake flow today.",
          alternate: true,
        },
        e(
          "div",
          { className: "contact-grid" },
          e(
            "form",
            { className: "panel contact-form", onSubmit: handleSubmit },
            e(
              "div",
              { className: "form-grid" },
              e(
                "label",
                { className: "field" },
                e("span", null, "Name"),
                e("input", {
                  type: "text",
                  name: "name",
                  value: formData.name,
                  onChange: handleFieldChange,
                  placeholder: "Your name",
                  autoComplete: "name",
                  required: true,
                })
              ),
              e(
                "label",
                { className: "field" },
                e("span", null, "Company"),
                e("input", {
                  type: "text",
                  name: "company",
                  value: formData.company,
                  onChange: handleFieldChange,
                  placeholder: "Company or brand",
                  autoComplete: "organization",
                })
              ),
              e(
                "label",
                { className: "field" },
                e("span", null, "Email"),
                e("input", {
                  type: "email",
                  name: "email",
                  value: formData.email,
                  onChange: handleFieldChange,
                  placeholder: "you@example.com",
                  autoComplete: "email",
                  required: true,
                })
              ),
              e(
                "label",
                { className: "field" },
                e("span", null, "Service"),
                e(
                  "select",
                  {
                    name: "service",
                    value: formData.service,
                    onChange: handleFieldChange,
                  },
                  services.map((service) =>
                    e(
                      "option",
                      { key: service.title, value: service.title },
                      service.title
                    )
                  )
                )
              ),
              e(
                "label",
                { className: "field" },
                e("span", null, "Budget"),
                e("input", {
                  type: "text",
                  name: "budget",
                  value: formData.budget,
                  onChange: handleFieldChange,
                  placeholder: "Example: $3k-$8k",
                })
              ),
              e(
                "label",
                { className: "field" },
                e("span", null, "Timeline"),
                e("input", {
                  type: "text",
                  name: "timeline",
                  value: formData.timeline,
                  onChange: handleFieldChange,
                  placeholder: "Example: 2-4 weeks",
                })
              )
            ),
            e(
              "label",
              { className: "field field--full" },
              e("span", null, "Project brief"),
              e("textarea", {
                name: "message",
                value: formData.message,
                onChange: handleFieldChange,
                placeholder:
                  "Share your goals, current bottlenecks, and what success would look like.",
                rows: 7,
                required: true,
              })
            ),
            formState.message
              ? e(
                  "p",
                  {
                    className: classNames(
                      "form-status",
                      formState.type === "success"
                        ? "form-status--success"
                        : "form-status--error"
                    ),
                    role: "status",
                    "aria-live": "polite",
                  },
                  formState.message
                )
              : null,
            e(
              "div",
              { className: "form-actions" },
              e("button", { type: "submit", className: "btn btn--primary" }, "Send Inquiry"),
              e(
                "a",
                {
                  href: `mailto:${siteConfig.email}`,
                  className: "text-link",
                },
                siteConfig.email
              )
            )
          ),
          e(
            "aside",
            { className: "contact-sidebar" },
            e(
              "div",
              { className: "panel contact-card" },
              e("p", { className: "card-kicker" }, "Direct contact"),
              e("h3", { className: "card-title" }, "Prefer email first?"),
              e(
                "p",
                { className: "card-copy" },
                "That works too. Reach out directly and include your rough scope, timeline, and budget range if you have them."
              ),
              e(
                "div",
                { className: "contact-points" },
                e("a", { href: `mailto:${siteConfig.email}`, className: "contact-point" }, siteConfig.email),
                e("p", { className: "contact-meta" }, siteConfig.location),
                e("p", { className: "contact-meta" }, siteConfig.responseTime)
              )
            ),
            e(
              "div",
              { className: "panel contact-card" },
              e("p", { className: "card-kicker" }, "Next step"),
              e("h3", { className: "card-title" }, "What happens after you reach out"),
              e(
                "ol",
                { className: "next-step-list" },
                e("li", null, "We review your inquiry and confirm fit."),
                e("li", null, "We reply with next steps, questions, or a call invite."),
                e("li", null, "If it makes sense, we scope the fastest useful version together.")
              )
            )
          )
        )
      )
    ),
    e(
      "footer",
      { className: "site-footer" },
      e(
        "div",
        { className: "container footer-grid" },
        e(
          "div",
          { className: "footer-copy" },
          e("strong", null, siteConfig.name),
          e(
            "p",
            null,
            "Strategy, build, automation, and launch support for modern agencies and digital teams."
          )
        ),
        e(
          "nav",
          { className: "footer-links", "aria-label": "Footer" },
          navItems.map((item) =>
            e(
              "a",
              { key: item.href, href: item.href },
              item.label
            )
          ),
          e("a", { href: `mailto:${siteConfig.email}` }, "Email")
        ),
        e(
          "p",
          { className: "footer-note" },
          `Copyright ${currentYear} ${siteConfig.name}.`
        )
      )
    )
  );
}
