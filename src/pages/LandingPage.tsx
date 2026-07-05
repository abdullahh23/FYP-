import { Link } from 'react-router-dom';
import { ArrowRight, Bot, Building2, CheckCircle2, Hammer, MessageSquareText, Package, ShieldCheck } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';

const features = [
  { icon: Bot, title: 'AI cost estimation', text: 'Structured PKR cost ranges across land preparation, structure, utilities, and finishing.' },
  { icon: Hammer, title: 'Smart contractor marketplace', text: 'Recommendations prioritize budget fit, city, experience, completed projects, ratings, and specialization.' },
  { icon: Package, title: 'Relevant supplier promotions', text: 'Project tags connect homeowners with materials that actually match their construction choices.' },
  { icon: MessageSquareText, title: 'Realtime collaboration', text: 'Homeowners and contractors can coordinate with text and image messages.' }
];

export function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-40 border-b bg-background/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-2 font-bold">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </span>
            BuildWise AI
          </Link>
          <nav className="hidden items-center gap-6 text-sm font-semibold text-muted-foreground md:flex">
            <a href="#features">Features</a>
            <a href="#how">How it works</a>
            <a href="#faq">FAQ</a>
          </nav>
          <div className="flex gap-2">
            <Link to="/login">
              <Button variant="ghost">Sign in</Button>
            </Link>
            <Link to="/signup">
              <Button>Get started</Button>
            </Link>
          </div>
        </div>
      </header>
      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(45,212,191,0.25),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(14,165,233,0.18),transparent_26%)]" />
          <div className="relative mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8">
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border bg-white/70 px-3 py-1 text-sm font-semibold text-primary dark:bg-card/70">
                <ShieldCheck className="h-4 w-4" />
                Pakistan-first construction planning MVP
              </div>
              <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-normal sm:text-5xl lg:text-6xl">BuildWise AI</h1>
              <p className="mt-5 max-w-2xl text-lg text-muted-foreground">
                AI-powered construction cost planning, contractor quotations, realtime chat, and material supplier promotions in one professional workflow.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link to="/signup">
                  <Button size="lg">
                    Start planning <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <a href="#features">
                  <Button variant="secondary" size="lg">
                    Explore features
                  </Button>
                </a>
              </div>
            </div>
            <div className="glass-panel rounded-xl p-5">
              <div className="rounded-xl bg-gradient-to-br from-teal-500 via-cyan-500 to-sky-600 p-1">
                <div className="rounded-lg bg-white p-5 dark:bg-card">
                  <div className="grid gap-4">
                    {['Land Preparation', 'Structure', 'Electrical', 'Plumbing', 'Finishing'].map((item, index) => (
                      <div key={item} className="flex items-center justify-between rounded-lg border p-3">
                        <span className="font-semibold">{item}</span>
                        <span className="text-sm font-bold text-primary">PKR {(index + 1) * 850000}</span>
                      </div>
                    ))}
                    <div className="rounded-lg bg-primary p-4 text-primary-foreground">
                      <p className="text-sm opacity-90">Estimated total range</p>
                      <p className="text-2xl font-bold">PKR 8.2M - 10.4M</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="features" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mb-8 max-w-2xl">
            <h2 className="text-3xl font-bold">Everything needed for a serious MVP</h2>
            <p className="mt-2 text-muted-foreground">The platform connects homeowners, contractors, and suppliers through real Supabase-backed workflows.</p>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <Card key={feature.title} className="p-5">
                <feature.icon className="h-8 w-8 text-primary" />
                <h3 className="mt-4 font-bold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{feature.text}</p>
              </Card>
            ))}
          </div>
        </section>
        <section id="how" className="bg-muted/60 py-16">
          <div className="mx-auto grid max-w-7xl gap-6 px-4 sm:px-6 md:grid-cols-3 lg:px-8">
            {['Create a project', 'Estimate and compare', 'Contract and collaborate'].map((step, index) => (
              <div key={step} className="flex gap-4">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-primary font-bold text-primary-foreground">{index + 1}</span>
                <div>
                  <h3 className="font-bold">{step}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">BuildWise keeps the planning, quotation, and communication trail organized.</p>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-4 md:grid-cols-3">
            {['Placeholder homeowner testimonial', 'Placeholder contractor testimonial', 'Placeholder supplier testimonial'].map((item) => (
              <Card key={item} className="p-5">
                <p className="text-sm font-semibold text-primary">Placeholder testimonial</p>
                <p className="mt-3 text-muted-foreground">{item} for university presentation content. Replace with real testimonials after launch.</p>
              </Card>
            ))}
          </div>
        </section>
        <section id="faq" className="mx-auto max-w-4xl px-4 pb-16 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold">FAQ</h2>
          {['Does the AI key stay private?', 'Can suppliers show random ads?', 'When do contractor profiles become visible?'].map((question) => (
            <div key={question} className="mt-4 rounded-xl border bg-card p-5">
              <h3 className="font-bold">{question}</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                {question.includes('AI') && 'Yes. Estimation is routed through a Supabase Edge Function using NVIDIA_API_KEY server-side.'}
                {question.includes('suppliers') && 'No. Promotions are matched using project tags and product or campaign tags.'}
                {question.includes('profiles') && 'Immediately after the contractor completes and saves their professional profile.'}
              </p>
            </div>
          ))}
        </section>
      </main>
      <footer className="border-t py-8 text-center text-sm text-muted-foreground">BuildWise AI - Final Year Project MVP</footer>
    </div>
  );
}
