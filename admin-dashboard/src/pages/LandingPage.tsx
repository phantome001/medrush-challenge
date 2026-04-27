import { Link } from "react-router-dom";
import { BarChart3, BookOpen, Building2, CheckCircle2, GraduationCap, ShieldCheck, Sparkles, Stethoscope } from "lucide-react";

const features = [
  { icon: Building2, title: "Multi-tenant SaaS", text: "Manage institutions, teachers, students, plans, and subscriptions from one platform." },
  { icon: BookOpen, title: "Medical quiz engine", text: "Question banks, daily challenges, clinical cases, premium access, and gamified results." },
  { icon: BarChart3, title: "Analytics-ready", text: "Track class performance, weak categories, engagement, attempts, XP, coins, and streaks." },
  { icon: ShieldCheck, title: "Secure MVP backend", text: "JWT auth, role permissions, tenant isolation, validation, safe deletes, and clear errors." }
];

const steps = ["Login with demo Super Admin", "Create institution and users", "Publish quizzes and cases", "Students play in mobile app", "Review reports and payments"];

export const LandingPage = () => (
  <div className="min-h-screen bg-slate-950 text-white">
    <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
      <div>
        <div className="text-2xl font-black">MedRush Challenge</div>
        <div className="text-sm text-emerald-300">Educational medical SaaS game</div>
      </div>
      <div className="flex gap-3">
        <Link className="btn-secondary bg-white/10 text-white hover:bg-white/20" to="/login">Admin login</Link>
        <a className="btn bg-emerald-500 hover:bg-emerald-600" href="#demo">View demo flow</a>
      </div>
    </header>

    <main>
      <section className="mx-auto grid max-w-7xl gap-10 px-6 py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-2 text-sm font-semibold text-blue-200 ring-1 ring-blue-400/20">
            <Sparkles size={16} /> Production-structured MVP demo
          </div>
          <h1 className="text-5xl font-black leading-tight md:text-6xl">Turn medical learning into a fast, competitive challenge.</h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            MedRush Challenge combines institution management, clinical quizzes, gamification, subscriptions, and analytics for schools, training centers, and healthcare education demos.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link className="btn px-6 py-3" to="/login">Open admin dashboard</Link>
            <a className="btn-secondary bg-white text-slate-950 hover:bg-slate-100" href="https://github.com/phantome001/medrush-challenge/releases/tag/v1.0.0-mvp">GitHub release</a>
          </div>
          <div className="mt-8 grid gap-3 text-sm text-slate-300 sm:grid-cols-3">
            <div className="rounded-2xl bg-white/5 p-4"><strong className="text-white">4 roles</strong><br />Super Admin, Institution Admin, Teacher, Student</div>
            <div className="rounded-2xl bg-white/5 p-4"><strong className="text-white">20+ screens</strong><br />Flutter mobile learning flow</div>
            <div className="rounded-2xl bg-white/5 p-4"><strong className="text-white">15+ admin pages</strong><br />CRUD, reports, payments, settings</div>
          </div>
        </div>
        <div className="rounded-[2rem] border border-white/10 bg-white/10 p-5 shadow-2xl backdrop-blur">
          <div className="rounded-[1.5rem] bg-slate-900 p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-slate-400">Live MVP preview</span>
              <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-300">Demo-ready</span>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {[
                ["Institutions", "2 demo schools", Building2],
                ["Questions", "100+ seeded items", BookOpen],
                ["Clinical cases", "Realistic scenarios", Stethoscope],
                ["Students", "Gamified profiles", GraduationCap]
              ].map(([title, value, Icon]) => (
                <div key={title as string} className="rounded-2xl bg-white p-5 text-slate-950">
                  <Icon className="mb-4 text-blue-600" />
                  <div className="text-sm text-slate-500">{title as string}</div>
                  <div className="text-xl font-black">{value as string}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 text-slate-950">
        <div className="mx-auto max-w-7xl px-6">
          <h2 className="text-3xl font-black">What is included</h2>
          <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {features.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-3xl border border-slate-100 p-6 shadow-sm">
                <Icon className="mb-5 text-blue-600" />
                <h3 className="font-bold">{title}</h3>
                <p className="mt-3 text-sm leading-6 text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="demo" className="mx-auto max-w-7xl px-6 py-16">
        <h2 className="text-3xl font-black">Recommended demo scenario</h2>
        <div className="mt-8 grid gap-4 md:grid-cols-5">
          {steps.map((step, index) => (
            <div key={step} className="rounded-3xl bg-white/10 p-5">
              <CheckCircle2 className="mb-4 text-emerald-300" />
              <div className="text-sm text-slate-400">Step {index + 1}</div>
              <div className="mt-2 font-bold">{step}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  </div>
);
