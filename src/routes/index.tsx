import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import "./index.css";

const COPY = {
  strapp: {
    label: "mode: sync up.original",
    preset: "preset: default",
    e1h: "Be the local business customers find first on Google.",
    e1s: "Every day nearby customers search for services like yours. We make sure your business appears on Google Search and Maps with the right contact details, hours, and trust signals.",
    e2h: "Websites that turn local visits into enquiries.",
    e2s: "High-performance landing pages designed to make it easy for customers to discover, trust, and contact your business instantly.",
    presets: [
      ["Mobile-Friendly Pages", "Your site loads quickly on any phone and works smoothly on slower networks."],
      ["Easy Customer Contact", "Customers can message you on WhatsApp or call directly from your site."],
      ["Visible on Google", "Built so Google finds and shows your business to local customers searching for what you do."]
    ],
    fTitle: "Contact sync up",
    fSub: "Request a local visibility review and get a clear follow-up plan.",
    fBtn: "Request Growth Support",
  },
  industrial: {
    label: "mode: industrial.heavy",
    preset: "preset: industrial.and.logistics",
    e1h: "Get found by suppliers, carriers, and site visitors on Google Maps.",
    e1s: "Perfect for logistics, industrial suppliers, construction, and plant hire operations. We make sure your location, services, and contact lines are visible exactly when customers search.",
    e2h: "Operational websites built to convert serious enquiries.",
    e2s: "Clear, functional showcase pages designed for business operations, customer orders, and route planning.",
    presets: [
      ["Clean, Simple Design", "Easy for customers to find your yard, warehouse, or depot and get your contact info."],
      ["Direct Phone & WhatsApp", "Buyers and partners reach you instantly through your website."],
      ["Accurate on Google Maps", "Your exact location and hours show up when suppliers and customers search."]]
    ,
    fTitle: "Industrial & Logistics",
    fSub: "Lock in your yard, warehouse, or depot with the right map presence and contact path.",
    fBtn: "Request Industrial Support",
  },
  retail: {
    label: "mode: retail.&.food",
    preset: "preset: restaurants.and.food",
    e1h: "Help hungry locals find your business first.",
    e1s: "Modern visibility for restaurants, cafés, takeaways, and food brands. We build the right Google presence so customers can place orders, book tables, and call instantly.",
    e2h: "Websites designed for easy ordering and quick contact.",
    e2s: "Fast, mobile-first layouts that make menus, reviews, and WhatsApp orders simple for customers.",
    presets: [
      ["Quick-Loading Menus", "Your menu loads fast on any phone so customers can order quickly."],
      ["One-Tap Ordering", "Customers message you on WhatsApp or call directly to place orders."],
      ["Found When They're Hungry", "Show up on Google and Maps when locals search for food like yours."]]
    ,
    fTitle: "Restaurants & Food",
    fSub: "Map your business where locals and delivery riders are searching for food right now.",
    fBtn: "Request Retail Support",
  },
  professional: {
    label: "mode: professional.firm",
    preset: "preset: professional.services",
    e1h: "Show up as a trusted professional in local search results.",
    e1s: "Polished profile setup for law firms, clinics, consultants, and agencies. We make your services, location, and contact options easy to find on Google.",
    e2h: "Websites that build credibility and simplify service enquiries.",
    e2s: "Clean, informative layouts that present your specialties, qualifications, and contact paths clearly.",
    presets: [
      ["Professional Website", "Your credentials and services presented clearly to build client trust."],
      ["Easy Consultation Booking", "Clients can contact you and book appointments directly from your site."],
      ["Trusted on Google", "Show up professionally when potential clients search for your expertise."]]
    ,
    fTitle: "Professional Services",
    fSub: "Secure your firm’s local presence and make it easy for clients to reach you.",
    fBtn: "Request Service Support",
  }
};

const PROOF_CARDS = [
  {
    headline: "Durban businesses launched faster",
    metric: "28 local brands onboarded",
    description: "Local businesses live on Google and WhatsApp in under 48 hours."
  },
  {
    headline: "Verified local impact",
    metric: "32% more calls in 30 days",
    description: "Clients see measurable customer enquiries from Maps and Search once visibility is live."
  },
  {
    headline: "Trusted response pledge",
    metric: "1 business day follow-up",
    description: "Every inquiry receives a clear next step from our team within one business day."
  },
  {
    headline: "Clear delivery expectations",
    metric: "Fast setup, simple handoff",
    description: "We deliver the first visibility review, quote, and kickoff plan without delays."
  }
];

const FAQ_ITEMS = [
  { question: "How long before my business shows up on Google?", answer: "Your profile goes live within 24–48 hours. Google usually shows it fully on Search and Maps within a week. We send you verification updates at the 3-day and 14-day marks so you can see it's working." },
  { question: "What's included in the R500 service?", answer: "The R500 covers everything to get you on Google Search and Maps: setting up your business profile, adding your location and hours, setting up WhatsApp messaging, and getting calls routed to your phone. One flat fee, no surprise costs. Custom websites are quoted separately." },
  { question: "Do I own the website once it's built?", answer: "Yes, completely. You own the website, the code, your domain, and all your content from day one. We don't keep any ownership stakes. Once we deliver, the website is yours to keep, change, or move wherever you want." },
  { question: "Will my website work on slow mobile networks?", answer: "Yes. We build everything to load fast even on older phones and slow networks common in South Africa. Your site will work smoothly on 3G/4G networks. We also give you a dashboard to see how fast your site actually runs for your customers." },
  { question: "How do you protect my customer data?", answer: "Your data is protected. We follow South Africa's privacy law (POPIA). We don't share your customer information with anyone. Everything is encrypted when it travels online. We only keep the basic details needed to run your site—nothing else." },
  { question: "Can I change or upgrade the website later?", answer: "Yes. After we deliver it, you have full control. You can hire any developer to change it, add features, move it to a different host, or rebrand it completely. We give you full access to everything." }
];

function Index() {
  const [activeMode, setActiveMode] = React.useState<keyof typeof COPY>("strapp");
  const [modeReady, setModeReady] = React.useState(false);
  const [clock, setClock] = React.useState("--:--:-- SAST");
  const [cookieVisible, setCookieVisible] = React.useState(false);
  const [analyticsEnabled, setAnalyticsEnabled] = React.useState(false);
  const [inlineSuccess, setInlineSuccess] = React.useState(false);
  const [inlineValues, setInlineValues] = React.useState({ firstName: "", businessName: "", email: "" });
  const [inlineErrors, setInlineErrors] = React.useState<Record<string, string>>({});
  const [openFaqIndex, setOpenFaqIndex] = React.useState<number | null>(0);
  const [contactSubmitting, setContactSubmitting] = React.useState(false);

  const current = COPY[activeMode];

  const ABOUT_CARDS = [
    {
      key: "purpose",
      title: "Built for Local Businesses.",
      body: [
        "We help South African businesses get found by the right customers at the right time.",
        "Simple. Effective. Local.",
      ],
      variant: "surface-lg",
      visual: <img src="/logo.png" alt="Sync Up brand mark" />,
      visualClass: "surface-visual-brand",
    },
    {
      key: "vision",
      label: "Google Maps Visibility",
      body: ["Your business shows up when locals search. More visibility. More enquiries. More growth."],
      variant: "surface-md",
      visual: <img src="/gmaps-img.png" alt="Google Maps visibility metrics" />,
      visualClass: "surface-visual-image",
    },
    {
      key: "impact",
      label: "Search-Ready Websites",
      body: ["Fast-loading sites that convert local visitors into paying customers. Built for Durban networks."],
      variant: "surface-md",
      visual: <img src="/image-removebg-preview.png" alt="Google Maps business verification" />,
      visualClass: "surface-visual-image",
    },
    {
      key: "story",
      title: "Durban Roots. Global Standard.",
      body: [
        "We're based in Durban and we understand local business. Every project is built to the standards of the best firms in the world.",
      ],
      variant: "surface-lg",
      visual: <img src="/images (3).jpg" alt="DUT Innobiz partnership" />,
      visualClass: "surface-visual-image",
    },
    {
      key: "innobiz",
      label: "Incubated by Innobiz",
      body: ["We're backed by Durban's leading tech ecosystem. Vetted. Proven. Trusted by local founders and businesses."],
      variant: "surface-md",
      visual: <img src="/EDHE.jpg" alt="Innobiz incubation ecosystem" />,
      visualClass: "surface-visual-image",
    },
    {
      key: "testimonial",
      label: "Trusted by Local Leaders",
      body: ["\"They get what we're trying to do. No fluff. Just results that matter to our business.\""],
      variant: "surface-md",
      visual: <img src="/images (4).jpg" alt="Durban Built" />,
      visualClass: "surface-visual-image",
    },
    {
      key: "cta",
      label: "Ready to Grow?",
      body: ["Let's talk about getting your business found."],
      variant: "surface-sm",
      ctaText: "Get Started Today",
      footerImage: <img src="/images (5).jpg" alt="Durban Built" />,
    },
  ];

  React.useEffect(() => {
    const updateClock = () => {
      const d = new Date();
      setClock(d.toLocaleTimeString("en-ZA", { hour12: false }) + " SAST");
    };
    updateClock();
    const timer = window.setInterval(updateClock, 1000);
    return () => window.clearInterval(timer);
  }, []);

  React.useEffect(() => {
    const savedMode = sessionStorage.getItem("rt_mode");
    if (savedMode && COPY[savedMode as keyof typeof COPY]) {
      setActiveMode(savedMode as keyof typeof COPY);
    }
    const loader = window.setTimeout(() => setModeReady(true), 2400);
    return () => window.clearTimeout(loader);
  }, []);

  React.useEffect(() => {
    document.documentElement.setAttribute("data-theme", activeMode === "strapp" ? "strapp" : activeMode);
    sessionStorage.setItem("rt_mode", activeMode);
  }, [activeMode]);

  React.useEffect(() => {
    const stored = localStorage.getItem("rt_popia");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setAnalyticsEnabled(!!parsed.analytical);
      } catch {
        setAnalyticsEnabled(false);
      }
    } else {
      const timer = window.setTimeout(() => setCookieVisible(true), 1200);
      return () => window.clearTimeout(timer);
    }
  }, []);

  React.useEffect(() => {
    const dots = Array.from(document.querySelectorAll<HTMLButtonElement>(".dot"));
    const handleClick = (event: MouseEvent) => {
      const target = event.currentTarget as HTMLButtonElement;
      const sectionId = target.dataset.target;
      if (sectionId) {
        document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });
      }
    };
    dots.forEach((dot) => dot.addEventListener("click", handleClick));

    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const dot = dots.find((d) => d.dataset.target === entry.target.id);
        if (dot) {
          dot.classList.toggle("active", entry.isIntersecting && entry.intersectionRatio > 0.55);
        }
      });
    }, { threshold: [0.6] });

    document.querySelectorAll("section").forEach((section) => io.observe(section));
    return () => {
      dots.forEach((dot) => dot.removeEventListener("click", handleClick));
      io.disconnect();
    };
  }, []);

  React.useEffect(() => {
    const blobs = Array.from(document.querySelectorAll<HTMLDivElement>(".blob"));
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const y = window.scrollY;
          blobs.forEach((b, i) => {
            const speed = i % 3 === 0 ? 0.15 : i % 3 === 1 ? 0.25 : 0.1;
            b.style.transform = `translate3d(0, ${y * speed}px, 0)`;
          });
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const goTo = (sectionId: string) => document.getElementById(sectionId)?.scrollIntoView({ behavior: "smooth" });

  const validateEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const validateForm = (values: Record<string, string>) => {
    const nextErrors: Record<string, string> = {};
    if (!values.firstName?.trim()) nextErrors.firstName = "First name is required";
    if (!values.businessName?.trim()) nextErrors.businessName = "Business name is required";
    if (!values.email?.trim()) {
      nextErrors.email = "Email is required";
    } else if (!validateEmail(values.email)) {
      nextErrors.email = "Invalid email address";
    }
    return nextErrors;
  };

  const sendLead = async (payload: Record<string, string>) => {
    const response = await fetch("https://ktlrlmreaqkcbwwcqobw.supabase.co/functions/v1/contact-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error("Transmission failure");
    }
  };

  const handleInlineSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validateForm(inlineValues);
    if (Object.keys(nextErrors).length) {
      setInlineErrors(nextErrors);
      return;
    }
    setContactSubmitting(true);
    setInlineErrors({});
    try {
      await sendLead({
        to: "syncup.co.za@gmail.com",
        firstName: inlineValues.firstName.trim(),
        businessName: inlineValues.businessName.trim(),
        email: inlineValues.email.trim(),
        message: `${inlineValues.firstName.trim()} from ${inlineValues.businessName.trim()} is a potential client and requests a follow-up.`,
      });
      setInlineSuccess(true);
    } catch {
      setInlineErrors({ form: "Network timeout. Please try again or contact us via WhatsApp." });
    } finally {
      setContactSubmitting(false);
    }
  };

  const acceptCookies = () => {
    localStorage.setItem("rt_popia", JSON.stringify({ essential: true, analytical: analyticsEnabled, ts: Date.now() }));
    setCookieVisible(false);
  };

  // Lock scroll and focus when cookie modal is visible
  const acceptBtnRef = React.useRef<HTMLButtonElement | null>(null);
  React.useEffect(() => {
    if (cookieVisible) {
      // prevent background scroll
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      // focus accept button when modal opens
      setTimeout(() => acceptBtnRef.current?.focus(), 50);
      return () => {
        document.body.style.overflow = prev;
      };
    }
    return undefined;
  }, [cookieVisible]);

  return (
    <>
      <nav className="dotnav" aria-label="section navigation">
        <button className="dot" type="button" data-target="sec1" onClick={() => goTo("sec1")}>◐ welcome</button>
        <button className="dot" type="button" data-target="sec2" onClick={() => goTo("sec2")}>◧ visibility</button>
        <button className="dot" type="button" data-target="sec3" onClick={() => goTo("sec3")}>◩ websites</button>
        <button className="dot" type="button" data-target="sec4" onClick={() => goTo("sec4")}>◉ pricing</button>
        <button className="dot" type="button" data-target="sec5" onClick={() => goTo("sec5")}>◈ contact</button>
        <button className="dot" type="button" data-target="sec6" onClick={() => goTo("sec6")}>◈ faqs</button>
        <button className="dot" type="button" data-target="sec7" onClick={() => goTo("sec7")}>◉ about us</button>
      </nav>

      <section id="sec1">
        <div className="blob a" />
        <div className="blob b" />
        <span className="meta tl">SYNC UP</span>
        <span className="meta tr">welcome</span>
        <span className="meta bl" aria-live="polite">{current.label}</span>
        <span className="meta br">{clock}</span>

        <h1 className="strapp-text"><span>sync up</span><span className="dots">.</span></h1>
        <p className="strapp-subtext">Local businesses found faster on Google.</p>
        <p className="strapp-subtext" style={{ marginTop: 8, fontWeight: 500 }}>Websites and Google presence built for Durban and South African businesses that need more customer enquiries.</p>
        <div className="trust-strip" style={{ marginTop: 14, fontFamily: "var(--font-mono)", fontSize: 12, color: "var(--muted)", letterSpacing: ".12em" }}>google profiles • websites • local SEO • WhatsApp</div>
        <div className={`mode-array ${modeReady ? "show" : ""}`}>
          {(Object.keys(COPY) as Array<keyof typeof COPY>).filter((mode) => mode !== "strapp").map((mode) => (
            <button
              key={mode}
              className={`mode-btn ${activeMode === mode ? "active" : ""}`}
              type="button"
              onClick={() => setActiveMode(mode)}
            >
              {mode === "industrial" ? "📦 industrial & logistics" : mode === "retail" ? "🍔 restaurants & food" : "⚖️ professional services"}
            </button>
          ))}
        </div>

        <div className="cta-row" style={{ marginTop: 24 }}>
          <button className="cta" type="button" onClick={() => goTo("sec5")}>Start Local Growth</button>
          <button className="cta ghost" type="button" onClick={() => goTo("sec4")}>See how we help</button>
        </div>
      </section>

      <section id="sec2">
        <div className="blob c" style={{ opacity: 1 }} />
        <span className="meta bl">south african local visibility</span>

        <div className="engine-wrap">
          <div>
            <div className="eyebrow">google visibility setup</div>
            <h2 className="h-display">{current.e1h}</h2>
            <p className="sub">{current.e1s}</p>
            <ul className="trust-checklist">
              <li>✓ Set up your Google Business Profile</li>
              <li>✓ Show your business on Google Maps</li>
              <li>✓ Let customers message you on WhatsApp or call</li>
              <li>✓ Get a simple website landing page for Google</li>
            </ul>
            <span className="price-tag">once-off setup · R500 — includes profile setup, map visibility, and contact readiness</span>
            <div className="cta-row">
              <button className="cta" type="button" onClick={() => goTo("sec5")}>Setup My Business</button>
              <button className="cta ghost" type="button" onClick={() => goTo("sec5")}>Talk To Us</button>
            </div>
          </div>
        </div>
      </section>

      <section id="sec3">
        <div className="blob a" style={{ opacity: 0.3 }} />
        <span className="meta tl">services / features</span>
        <span className="meta tr">Sync Up Web Agency</span>
        <span className="meta bl">fast performance · simple landing pages</span>
        <span className="meta br">{current.preset}</span>

        <div className="engine-wrap">
          <div>
            <h2 className="h-display">{current.e2h}</h2>
            <p className="sub">{current.e2s}</p>
          </div>
          <div className="preset-grid">
            {current.presets.map(([title, text]) => (
              <div className="preset" key={title}>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            ))}
          </div>
          <div className="cta-row" style={{ marginTop: 22, justifyContent: "center" }}>
            <button className="cta" type="button" onClick={() => goTo("sec5")}>Request Website Quote</button>
          </div>
        </div>
      </section>

      <section id="sec4">
        <span className="meta tl">operational footprint</span>
        <span className="meta tr">our process & payment</span>
        <span className="meta br">ready to scale</span>

        <div className="section-copy-center">
          <div className="eyebrow">businesses in south africa</div>
          <h2 className="h-display">Cape Town · Johannesburg · Durban · Pretoria · Bloemfontein · Polokwane · RSA</h2>
        </div>

        <div className="dash">
          <div className="cell">
            <div className="label">our process</div>
            <div className="zone">pipeline</div>
            <div className="stat">
              1. We understand your business<br />
              2. We recommend the best setup<br />
              3. We build your digital presence<br />
              4. We launch and optimize properly
            </div>
          </div>
          <div className="cell">
            <div className="label">payment structure</div>
            <div className="zone">financials</div>
            <div className="stat">
              <b>Visibility Setup:</b> R500 one-off for Google Profile setup, Maps verification, and customer contact readiness.<br /><br />
              <b>Website Projects:</b> transparent deposit, milestone payments, and final launch payment when you approve the site.
            </div>
          </div>
          <div className="cell" style={{ display: "flex", flexDirection: "column", justifyContent: "space-between" }}>
            <div>
              <div className="label">initiate infrastructure</div>
              <div className="zone">ready?</div>
              <div className="stat">Whether you need better Google visibility or a professional website, sync up helps Durban businesses get more local customers.</div>
            </div>
            <button className="cta" type="button" onClick={() => goTo("sec5")} style={{ marginTop: 14, width: "100%", textAlign: "center" }}>Contact sync up</button>
          </div>
        </div>
      </section>

      <section id="sec5" className="contact-section">
        <div className="contact-container">
          <div className="contact-media">
            <div className="media-frame">
              <img src="/gmaps-img.png" alt="Sync Up brand mark" />
            </div>
          </div>
          <div className="contact-panel">
            <div>
              <h2 className="contact-title">Contact Us</h2>
              {inlineSuccess ? (
                <div className="success-state"><div className="tick">✓</div><div className="msg">Thank you. We'll be in touch quickly.</div></div>
              ) : (
                <form id="contactFormInline" className="contact-form" aria-label="contact form" onSubmit={handleInlineSubmit}>
                  <div className="form-field">
                    <label htmlFor="firstNameInline">Your Full Name</label>
                    <input id="firstNameInline" name="firstName" type="text" required className="f-input" placeholder="Enter full name" value={inlineValues.firstName} onChange={(e) => setInlineValues({ ...inlineValues, firstName: e.target.value })} />
                    {inlineErrors.firstName ? <div className="field-error" style={{ display: 'block' }}>{inlineErrors.firstName}</div> : <div className="field-error" />}
                  </div>
                  <div className="form-field">
                    <label htmlFor="businessNameInline">Business Name</label>
                    <input id="businessNameInline" name="businessName" type="text" required className="f-input" placeholder="Enter business name" value={inlineValues.businessName} onChange={(e) => setInlineValues({ ...inlineValues, businessName: e.target.value })} />
                    {inlineErrors.businessName ? <div className="field-error" style={{ display: 'block' }}>{inlineErrors.businessName}</div> : <div className="field-error" />}
                  </div>
                  <div className="form-field">
                    <label htmlFor="emailInline">Your Email</label>
                    <input id="emailInline" name="email" type="email" required className="f-input" placeholder="address@firm.global" value={inlineValues.email} onChange={(e) => setInlineValues({ ...inlineValues, email: e.target.value })} />
                    {inlineErrors.email ? <div className="field-error" style={{ display: 'block' }}>{inlineErrors.email}</div> : <div className="field-error" />}
                  </div>
                  {inlineErrors.form ? <div className="field-error" style={{ display: 'block' }}>{inlineErrors.form}</div> : null}
                  <button type="submit" id="fBtnInline" className="contact-cta" disabled={contactSubmitting}>{contactSubmitting ? "Sending..." : "Send"}</button>
                </form>
              )}
            </div>
            <div className="contact-panel-footer">
              <div className="social-row" aria-hidden="true">
                <a href="#" aria-label="facebook" title="Facebook">f</a>
                <a href="#" aria-label="instagram" title="Instagram">IG</a>
                <a href="#" aria-label="twitter" title="Twitter">T</a>
              </div>
              <div className="contact-meta">
                <div className="meta-item">
                  <span className="meta-label">Contact</span>
                  <span className="meta-copy">syncup.co.za@gmail.com</span>
                </div>
                <div className="meta-item">
                  <span className="meta-label">Based in</span>
                  <span className="meta-copy">Durban, South Africa</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="sec6">
        <span className="meta tl">frequently asked questions</span>
        <span className="meta tr">product clarity</span>
        <span className="meta bl">trust & clarity</span>
        <span className="meta br">clear answers</span>

        <div className="faq-header">
          <h2>Frequently Asked Questions</h2>
        </div>

        <div className="engine-wrap">
          <div className="faq-grid">
            {FAQ_ITEMS.map((item, index) => (
              <div className={`faq-item ${openFaqIndex === index ? "open" : ""}`} key={item.question}>
                <div
                  className="faq-question"
                  role="button"
                  tabIndex={0}
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setOpenFaqIndex(openFaqIndex === index ? null : index);
                    }
                  }}
                >
                  {item.question}
                </div>
                <div id={`faq-answer-${index}`} className="faq-answer">{item.answer}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="sec7" className="about-section">
        <div className="about-header">
          <h2 className="about-title">About Us</h2>
        </div>
        <div className="about-carousel">
          <div className="about-track">
            {[...ABOUT_CARDS, ...ABOUT_CARDS].map((card, index) => (
              <article className={`surface ${card.variant}`} key={`${card.key}-${index}`}>
                {card.visual ? (
                  <div className={`surface-visual-top ${card.visualClass || ""}`}>{card.visual}</div>
                ) : null}
                <div className="surface-header">
                  {card.title ? (
                    <h2 className="surface-title">{card.title}</h2>
                  ) : (
                    <h3 className="surface-label">{card.label}</h3>
                  )}
                </div>
                <div className="surface-body">
                  {card.body.map((line) => (
                    <p key={line}>{line}</p>
                  ))}
                  {card.ctaText ? (
                    <>
                      <button className="cta" type="button" onClick={() => goTo("sec5")} style={{ marginTop: 14, width: "100%" }}>
                        {card.ctaText}
                      </button>
                      {card.footerImage ? <div className="surface-footer-image">{card.footerImage}</div> : null}
                    </>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <button className={`return-sticky ${activeMode !== "strapp" ? "show" : ""}`} type="button" onClick={() => setActiveMode("strapp")}>↺ return to sync up original core</button>

      <button className="whatsapp-float" type="button" onClick={() => { const text = encodeURIComponent("Hello Sync Up — I'd like to grow my business with Google visibility and a website."); window.open(`https://wa.me/27687856507?text=${text}`, "_blank"); }}>WhatsApp Us</button>

      <div className={`cookie-overlay ${cookieVisible ? "show" : ""}`} aria-hidden={!cookieVisible}>
        <aside className="cookie-modal" role="dialog" aria-modal="true" aria-label="POPIA consent dialog">
          <div className="cookie-inner">
            <h4>POPIA Compliance & Session Cryptography</h4>
            <p>Sync Up operates under mandatory functional state tracking and statistical metric logging under the South African Protection of Personal Information Act (POPIA, 2013). Essential operational data (theme configuration, authentication state, session identifiers) persists exclusively on your local device, encrypted at rest. Statistical metrics collection requires explicit authorized consent. Zero third-party data syndication. All transmission pathways employ TLS encryption protocols.</p>
            <div className="opts">
              <label><input type="checkbox" checked disabled /> mandatory functional state tracking</label>
              <label><input type="checkbox" checked={analyticsEnabled} onChange={(event) => setAnalyticsEnabled(event.target.checked)} /> authorized statistical metric logging</label>
            </div>
            <div className="row">
              <span className="legal">· sync up · zero external data sharing · locally persisted</span>
              <button ref={acceptBtnRef} className="accept" type="button" onClick={acceptCookies}>AUTHORIZE &amp; INITIALIZE ▸</button>
            </div>
          </div>
        </aside>
      </div>
    </>
  );
}

export const Route = createFileRoute("/")({
  component: Index,
});
