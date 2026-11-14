import { Link } from 'react-router-dom';
import { ArrowRight, Building2, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageToggle } from '../components/ui/LanguageToggle';

export function LandingPage() {
  const { tx, isUrdu } = useLanguage();

  const features = [
    { num: '01', title: tx.landing.featureAiTitle, text: tx.landing.featureAiDesc },
    { num: '02', title: tx.landing.featureContractorTitle, text: tx.landing.featureContractorDesc },
    { num: '03', title: tx.landing.featureSupplierTitle, text: tx.landing.featureSupplierDesc },
    { num: '04', title: tx.landing.featureChatTitle, text: tx.landing.featureChatDesc }
  ];

  const sampleItems = isUrdu
    ? [
        { label: 'زمین کی تیاری و کھدائی', cost: '850,000' },
        { label: 'بنیاد اور گرے اسٹرکچر', cost: '3,800,000' },
        { label: 'بجلی کی وائرنگ و سامان', cost: '950,000' },
        { label: 'پلمبنگ و سینیٹری', cost: '800,000' },
        { label: 'فنشنگ، ٹائلیں و پینٹ', cost: '2,600,000' }
      ]
    : [
        { label: 'Land Preparation & Excavation', cost: '850,000' },
        { label: 'Grey Structure & Masonry', cost: '3,800,000' },
        { label: 'Electrical Conduit & Wiring', cost: '950,000' },
        { label: 'Plumbing & Sanitary Piping', cost: '800,000' },
        { label: 'Finishing, Tiles & Paint', cost: '2,600,000' }
      ];

  const steps = [
    { num: '01', title: tx.landing.step1Title, text: tx.landing.step1Desc },
    { num: '02', title: tx.landing.step2Title, text: tx.landing.step2Desc },
    { num: '03', title: tx.landing.step3Title, text: tx.landing.step3Desc }
  ];

  const faqs = [
    { q: tx.landing.faq1Q, a: tx.landing.faq1A },
    { q: tx.landing.faq2Q, a: tx.landing.faq2A },
    { q: tx.landing.faq3Q, a: tx.landing.faq3A }
  ];

  return (
    <div className="min-h-screen bg-background font-sans">

      {/* ━━━━ NAV ━━━━ */}
      <header className="sticky top-0 z-40 border-b-2 border-foreground/10 bg-background">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-9 w-9 place-items-center bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </span>
            <span className="text-lg font-black uppercase tracking-widest">{tx.brandName}</span>
          </Link>

          <nav className="hidden items-center gap-8 text-xs font-black uppercase tracking-widest text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground transition-colors">{tx.features}</a>
            <a href="#how" className="hover:text-foreground transition-colors">{tx.howItWorks}</a>
            <a href="#faq" className="hover:text-foreground transition-colors">{tx.faq}</a>
          </nav>

          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm" className="font-black uppercase tracking-wider text-xs">{tx.signIn}</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm" className="font-black uppercase tracking-wider text-xs px-5">{tx.getStarted}</Button>
            </Link>
          </div>

        </div>
      </header>

      <main>

        {/* ━━━━ HERO ━━━━ */}
        <section className="relative border-b-2 border-foreground/10 overflow-hidden"
          style={{
            backgroundImage: `
              repeating-linear-gradient(0deg, transparent, transparent 39px, hsl(var(--border)) 39px, hsl(var(--border)) 40px),
              repeating-linear-gradient(90deg, transparent, transparent 39px, hsl(var(--border)) 39px, hsl(var(--border)) 40px)
            `,
            backgroundSize: '40px 40px'
          }}
        >
          {/* left rust bar */}
          <div className="absolute left-0 top-0 h-full w-1.5 bg-primary" />

          <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-14 px-8 py-16 sm:px-10 lg:grid-cols-[1fr_420px] lg:px-12">

            {/* Left — text */}
            <div>
              <div className="mb-6 inline-flex items-center gap-2 border border-primary/50 bg-primary/8 px-3 py-1">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                <span className="text-xs font-black uppercase tracking-widest text-primary">{tx.landing.mvpBadge}</span>
              </div>

              <h1 className="text-[clamp(3rem,8vw,6.5rem)] font-black leading-[0.95] tracking-tight">
                {tx.landing.heroTitle}
              </h1>

              <div className="mt-5 h-1.5 w-24 bg-primary" />

              <p className="mt-6 max-w-xl text-base text-muted-foreground leading-relaxed sm:text-lg">
                {tx.landing.heroSubtitle}
              </p>

              <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto gap-2.5 font-black uppercase tracking-widest text-sm px-8">
                    {tx.startPlanning}
                    <ArrowRight className={isUrdu ? 'h-4 w-4 rotate-180' : 'h-4 w-4'} />
                  </Button>
                </Link>
                <a href="#features">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto font-bold border-2 border-foreground/20 uppercase tracking-wider text-sm">
                    {tx.exploreFeatures}
                  </Button>
                </a>
              </div>
            </div>

            {/* Right — Cost breakdown */}
            <div className="border-2 border-foreground/15 bg-card shadow-[6px_6px_0px_hsl(var(--primary)/0.25)]">
              {/* header bar */}
              <div className="flex items-center justify-between border-b-2 border-foreground/10 bg-primary px-4 py-3">
                <span className="text-xs font-black uppercase tracking-widest text-primary-foreground">
                  {tx.landing.sampleBreakdownTitle}
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-primary-foreground/60">
                  {isUrdu ? 'لاہور ۲۰۲۶' : 'LHR 2026'}
                </span>
              </div>

              {/* rows */}
              <div className="p-4 space-y-2">
                {sampleItems.map((item, i) => (
                  <div key={i} className="flex items-center justify-between border border-foreground/8 bg-background px-3 py-2.5 hover:bg-muted transition-colors">
                    <span className="text-sm font-semibold">{item.label}</span>
                    <span className="text-sm font-black text-primary">{tx.pkr} {item.cost}</span>
                  </div>
                ))}

                {/* total */}
                <div className="mt-3 border-2 border-primary bg-primary p-4 text-primary-foreground">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-70">{tx.landing.sampleEstimatedRange}</p>
                  <p className="mt-1 text-2xl font-black tracking-tight">{tx.pkr} 8,500,000 – 9,500,000</p>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ━━━━ FEATURES ━━━━ */}
        <section id="features" className="border-b-2 border-foreground/10">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">

            <div className="mb-14">
              <p className="text-xs font-black uppercase tracking-widest text-primary mb-3">— {tx.features}</p>
              <h2 className="text-[clamp(2.2rem,5vw,4rem)] font-black leading-tight tracking-tight">
                {tx.landing.featuresHeading}
              </h2>
              <p className="mt-4 max-w-xl text-muted-foreground leading-relaxed">{tx.landing.featuresSubheading}</p>
            </div>

            {/* 4-column grid with hard borders — no rounded, no shadow */}
            <div className="grid border-2 border-foreground/12 bg-foreground/8 md:grid-cols-2 lg:grid-cols-4" style={{ gap: '1px' }}>
              {features.map((f) => (
                <div key={f.num} className="bg-card p-7 hover:bg-muted/60 transition-colors">
                  <div className="mb-5 text-5xl font-black leading-none text-primary/18 select-none">{f.num}</div>
                  <h3 className="text-base font-black leading-snug mb-2">{f.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{f.text}</p>
                </div>
              ))}
            </div>

          </div>
        </section>

        {/* ━━━━ HOW IT WORKS ━━━━ */}
        <section id="how" className="border-b-2 border-foreground/10 bg-muted/40"
          style={{
            backgroundImage: `repeating-linear-gradient(90deg, transparent, transparent 79px, hsl(var(--border)/0.6) 79px, hsl(var(--border)/0.6) 80px)`,
            backgroundSize: '80px 100%'
          }}
        >
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mb-14 text-center">
              <p className="text-xs font-black uppercase tracking-widest text-primary mb-3">— {tx.howItWorks}</p>
              <h2 className="text-[clamp(2.2rem,5vw,4rem)] font-black leading-tight tracking-tight">
                {tx.landing.howHeading}
              </h2>
            </div>

            <div className="grid gap-10 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.num} className="border-2 border-foreground/12 bg-card p-7">
                  <div className="mb-5 text-6xl font-black leading-none text-primary">{step.num}</div>
                  <h3 className="text-xl font-black mb-3">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{step.text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ━━━━ FAQ ━━━━ */}
        <section id="faq" className="border-b-2 border-foreground/10">
          <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <p className="text-xs font-black uppercase tracking-widest text-primary mb-3">— {tx.faq}</p>
              <h2 className="text-[clamp(2.2rem,5vw,4rem)] font-black leading-tight tracking-tight">
                {tx.landing.faqHeading}
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div key={idx} className="border-2 border-foreground/12 bg-card">
                  <div className="border-b border-foreground/8 bg-muted/40 px-5 py-3">
                    <span className="text-xs font-black uppercase tracking-widest text-primary mr-2">Q{idx + 1}.</span>
                    <span className="font-black text-sm">{faq.q}</span>
                  </div>
                  <p className="px-5 py-4 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* ━━━━ FOOTER ━━━━ */}
      <footer className="bg-foreground py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <span className="grid h-8 w-8 place-items-center bg-primary text-primary-foreground">
              <Building2 className="h-4 w-4" />
            </span>
            <span className="text-sm font-black uppercase tracking-widest text-primary-foreground/70">
              {tx.brandName}
            </span>
          </div>
          <p className="text-xs font-bold uppercase tracking-widest text-primary-foreground/40">
            {tx.landing.footerText}
          </p>
          <LanguageToggle variant="compact" />
        </div>
      </footer>

    </div>
  );
}
