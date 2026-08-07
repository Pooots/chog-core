import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import axios from 'axios'
import { ArrowLeft, Layers3 } from 'lucide-react'
import { SchoolAdminShell } from '@/components/admin/SchoolAdminShell'
import { useCreateLevelMutation } from '@/hooks/useSchoolQueries'

export default function CreateLevelPage() {
  const navigate = useNavigate()
  const pathname = useRouterState({
    select: (state) => state.location.pathname,
  })
  const createLevel = useCreateLevelMutation()
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [sortOrder, setSortOrder] = useState('1')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const isSubjectsContext = pathname.startsWith('/admin/subjects')
  const backPath = isSubjectsContext ? '/admin/subjects' : '/admin/rooms'
  const backLabel = isSubjectsContext ? 'Back to Subjects' : 'Back to Rooms'
  const helperText = isSubjectsContext
    ? 'Add a grade level first. Subjects can only be created under a level.'
    : 'Add a grade level first. Rooms can only be created under a level.'

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    try {
      await createLevel.mutateAsync({
        name: name.trim(),
        code: code.trim(),
        sort_order: Number(sortOrder) || 0,
        description: description.trim() || undefined,
        status: 'active',
      })
      await navigate({ to: backPath })
    } catch (requestError) {
      if (axios.isAxiosError(requestError)) {
        const validationErrors = requestError.response?.data?.errors as
          | Record<string, string[]>
          | undefined
        const firstValidationError = validationErrors
          ? Object.values(validationErrors)[0]?.[0]
          : undefined
        setError(
          firstValidationError ??
            requestError.response?.data?.message ??
            'Unable to create the level.',
        )
      } else {
        setError('Unable to create the level.')
      }
    }
  }

  return (
    <SchoolAdminShell>
      <main className="p-4 sm:p-6">
        <div className="mx-auto max-w-3xl">
          <Link
            to={backPath}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>

          <div className="mt-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Create Level
            </h1>
            <p className="mt-1 text-sm text-slate-500">{helperText}</p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <div className="flex items-center gap-2">
              <Layers3 className="h-4 w-4 text-blue-600" />
              <h2 className="text-sm font-semibold text-slate-900">
                Level details
              </h2>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Level name
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Grade 7"
                className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block text-sm font-medium text-slate-700">
                Level code
                <input
                  required
                  value={code}
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                  placeholder="e.g. G7"
                  maxLength={50}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm uppercase outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Sort order
                <input
                  type="number"
                  min={0}
                  value={sortOrder}
                  onChange={(event) => setSortOrder(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </label>
            </div>

            <label className="block text-sm font-medium text-slate-700">
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Optional short description"
                rows={4}
                className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
              />
            </label>

            {error ? (
              <p
                role="alert"
                className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {error}
              </p>
            ) : null}

            <div className="flex items-center justify-between border-t border-slate-100 pt-5">
              <Link
                to={backPath}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createLevel.isPending}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
              >
                {createLevel.isPending ? 'Creating…' : 'Create Level'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </SchoolAdminShell>
  )
}
