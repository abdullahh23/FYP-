import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Building2, CheckCircle2, Hammer, MessageSquareText, Package, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useLanguage } from '../contexts/LanguageContext';
import { LanguageToggle } from '../components/ui/LanguageToggle';

export function LandingPage() {
  const { tx, isUrdu } = useLanguage();

  const features = [
    { icon: Bot, title: tx.landing.featureAiTitle, text: tx.landing.featureAiDesc },
    { icon: Hammer, title: tx.landing.featureContractorTitle, text: tx.landing.featureContractorDesc },
    { icon: Package, title: tx.landing.featureSupplierTitle, text: tx.landing.featureSupplierDesc },
    { icon: MessageSquareText, title: tx.landing.featureChatTitle, text: tx.landing.featureChatDesc }
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
    { num: 1, title: tx.landing.step1Title, text: tx.landing.step1Desc },
    { num: 2, title: tx.landing.step2Title, text: tx.landing.step2Desc },
    { num: 3, title: tx.landing.step3Title, text: tx.landing.step3Desc }
  ];

  const faqs = [
    { q: tx.landing.faq1Q, a: tx.landing.faq1A },
    { q: tx.landing.faq2Q, a: tx.landing.faq2A },
    { q: tx.landing.faq3Q, a: tx.landing.faq3A }
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
              <Building2 className="h-5 w-5" />
            </span>
            <span className="text-xl font-extrabold tracking-tight">{tx.brandName}</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-semibold text-muted-foreground md:flex">
            <a href="#features" className="hover:text-foreground transition-colors">{tx.features}</a>
            <a href="#how" className="hover:text-foreground transition-colors">{tx.howItWorks}</a>
            <a href="#faq" className="hover:text-foreground transition-colors">{tx.faq}</a>
          </nav>

          <div className="flex items-center gap-2.5">
            <LanguageToggle />
            <Link to="/login">
              <Button variant="ghost" size="sm">{tx.signIn}</Button>
            </Link>
            <Link to="/signup">
              <Button size="sm">{tx.getStarted}</Button>
            </Link>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(16,185,129,0.18),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.18),transparent_26%)]" />
          <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-50/80 px-3.5 py-1 text-xs sm:text-sm font-semibold text-emerald-700 shadow-sm dark:bg-emerald-950/40 dark:text-emerald-300">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                {tx.landing.mvpBadge}
              </div>
              <h1 className="max-w-3xl text-3xl font-extrabold leading-tight tracking-normal sm:text-5xl lg:text-6xl">
                {tx.landing.heroTitle}
              </h1>
              <p className="mt-5 max-w-2xl text-base sm:text-lg text-muted-foreground leading-relaxed">
                {tx.landing.heroSubtitle}
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/signup">
                  <Button size="lg" className="w-full sm:w-auto gap-2 text-base font-semibold">
                    {tx.startPlanning} <ArrowRight className={isUrdu ? 'h-4 w-4 rotate-180' : 'h-4 w-4'} />
                  </Button>
                </Link>
                <a href="#features">
                  <Button variant="secondary" size="lg" className="w-full sm:w-auto text-base">
                    {tx.exploreFeatures}
                  </Button>
                </a>
              </div>
            </div>

            {/* Visual Preview Card */}
            <div className="glass-panel rounded-2xl p-5 shadow-xl border border-border/80">
              <div className="rounded-xl bg-gradient-to-br from-emerald-500 via-teal-600 to-sky-600 p-1">
                <div className="rounded-lg bg-card p-5">
                  <div className="mb-4 flex items-center justify-between border-b pb-3">
                    <span className="font-bold text-sm sm:text-base">{tx.landing.sampleBreakdownTitle}</span>
                    <span className="inline-flex items-center rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                      {isUrdu ? 'لاہور مارکیٹ ریٹس' : 'Lahore 2026 Rates'}
                    </span>
                  </div>
                  <div className="grid gap-3">
                    {sampleItems.map((item) => (
                      <div key={item.label} className="flex items-center justify-between rounded-lg border p-3 hover:bg-muted/40 transition-colors">
                        <span className="font-medium text-sm">{item.label}</span>
                        <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
                          {tx.pkr} {item.cost}
                        </span>
                      </div>
                    ))}
                    <div className="rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 p-4 text-white shadow-md">
                      <p className="text-xs uppercase tracking-wider opacity-90">{tx.landing.sampleEstimatedRange}</p>
                      <p className="mt-1 text-2xl font-black tracking-tight">{tx.pkr} 8,500,000 - 9,500,000</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 border-t">
          <div className="mb-10 max-w-2xl">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">{tx.landing.featuresHeading}</h2>
            <p className="mt-2 text-muted-foreground leading-relaxed">{tx.landing.featuresSubheading}</p>
          </div>
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="p-6 transition-all hover:shadow-md hover:border-primary/40">
                <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary mb-4">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.text}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* How it Works Section */}
        <section id="how" className="bg-muted/50 py-16 border-y">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-center mb-12">{tx.landing.howHeading}</h2>
            <div className="grid gap-8 md:grid-cols-3">
              {steps.map((step) => (
                <div key={step.num} className="flex gap-4 items-start">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-600 font-extrabold text-white shadow-md">
                    {step.num}
                  </span>
                  <div>
                    <h3 className="text-lg font-bold">{step.title}</h3>
                    <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{step.text}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-center mb-8">{tx.landing.faqHeading}</h2>
          <div className="space-y-4">
            {faqs.map((faq, idx) => (
              <div key={idx} className="rounded-xl border bg-card p-5 shadow-sm">
                <h3 className="font-bold text-base sm:text-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                  {faq.q}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t py-8 text-center text-sm text-muted-foreground">
        <div className="mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="font-semibold">{tx.landing.footerText}</p>
          <div className="flex items-center gap-2">
            <LanguageToggle variant="compact" />
          </div>
        </div>
      </footer>
    </div>
  );
}
