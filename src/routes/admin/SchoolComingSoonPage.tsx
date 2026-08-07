import { ArrowLeft, Construction, Sparkles } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import { SchoolAdminShell } from '@/components/admin/SchoolAdminShell'

export default function SchoolComingSoonPage({ title }: { title: string }) {
  return (
    <SchoolAdminShell>
      <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
        <section className="w-full max-w-xl text-center">
          <div className="relative mx-auto grid h-24 w-24 place-items-center rounded-3xl bg-blue-600 text-white shadow-2xl shadow-blue-600/25">
            <Construction className="h-11 w-11" />
            <span className="absolute -right-2 -top-2 grid h-9 w-9 place-items-center rounded-full border-4 border-slate-50 bg-amber-400 text-slate-950">
              <Sparkles className="h-4 w-4" />
            </span>
          </div>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-blue-600">
            Coming Soon
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
            {title}
          </h1>
          <p className="mx-auto mt-4 max-w-md text-sm leading-6 text-slate-500">
            This section is ready for development. Its features and content
            will be added in the next phase.
          </p>

          <Link
            to="/admin/dashboard"
            className="mx-auto mt-8 flex w-fit items-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </section>
      </main>
    </SchoolAdminShell>
  )
}
