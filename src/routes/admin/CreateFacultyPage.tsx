import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import axios from 'axios'
import {
  ArrowLeft,
  BookOpen,
  Building2,
  Check,
  Sparkles,
} from 'lucide-react'
import { SchoolAdminShell } from '@/components/admin/SchoolAdminShell'
import type { FacultyType, FacultyTypeOption } from '@/services/facultyService'
import {
  useCreateFacultyMutation,
  useFacultyTypesQuery,
  useSubjectsQuery,
} from '@/hooks/useSchoolQueries'

const fallbackTypes: FacultyTypeOption[] = [
  { value: 'academic', label: 'Academic Department' },
  { value: 'senior_high', label: 'Senior High Strand' },
  { value: 'special_program', label: 'Special Program' },
  { value: 'support', label: 'Support Unit' },
  { value: 'other', label: 'Other' },
]

export default function CreateFacultyPage() {
  const navigate = useNavigate()
  const typesQuery = useFacultyTypesQuery()
  const subjectsQuery = useSubjectsQuery()
  const createFaculty = useCreateFacultyMutation()
  const types =
    typesQuery.data && typesQuery.data.length > 0
      ? typesQuery.data
      : fallbackTypes
  const subjects = subjectsQuery.data ?? []
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [type, setType] = useState<FacultyType>('academic')
  const [description, setDescription] = useState('')
  const [selectedSubjectUuids, setSelectedSubjectUuids] = useState<string[]>([])
  const [error, setError] = useState('')

  const toggleSubject = (uuid: string) => {
    setSelectedSubjectUuids((current) =>
      current.includes(uuid)
        ? current.filter((value) => value !== uuid)
        : [...current, uuid],
    )
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    try {
      await createFaculty.mutateAsync({
        name: name.trim(),
        code: code.trim(),
        type,
        description: description.trim() || undefined,
        status: 'active',
        subject_uuids:
          selectedSubjectUuids.length > 0 ? selectedSubjectUuids : undefined,
      })
      await navigate({ to: '/admin/faculties' })
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
            'Unable to create the faculty.',
        )
      } else {
        setError('Unable to create the faculty.')
      }
    }
  }

  return (
    <SchoolAdminShell>
      <main className="p-4 sm:p-6">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/admin/faculties"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Faculties
          </Link>

          <div className="mt-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Create Faculty
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Choose the faculty type, then fill in the details for your school.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <section>
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-semibold text-slate-900">
                  What type of faculty do you want to create?
                </h2>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Select the category that best matches this school unit.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {types.map((option) => {
                  const selected = type === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setType(option.value)}
                      className={`rounded-xl border px-4 py-3 text-left transition ${
                        selected
                          ? 'border-blue-600 bg-blue-50 shadow-sm shadow-blue-600/10'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-sm font-semibold ${
                            selected ? 'text-blue-700' : 'text-slate-800'
                          }`}
                        >
                          {option.label}
                        </span>
                        {selected ? (
                          <span className="grid h-5 w-5 place-items-center rounded-full bg-blue-600 text-white">
                            <Check className="h-3 w-3" />
                          </span>
                        ) : null}
                      </div>
                    </button>
                  )
                })}
              </div>
            </section>

            <section className="space-y-4 border-t border-slate-100 pt-5">
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Faculty details
                </h2>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                Faculty name
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Science Department"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Faculty code
                <input
                  required
                  value={code}
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                  placeholder="e.g. SCI"
                  maxLength={50}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm uppercase outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </label>

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
            </section>

            <section className="space-y-3 border-t border-slate-100 pt-5">
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Subjects
                </h2>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                  Optional
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Select one or more existing subjects to assign to this faculty.
                You can skip this and assign subjects later.
              </p>

              {subjectsQuery.isPending && subjects.length === 0 ? (
                <p className="text-sm text-slate-500">Loading subjects…</p>
              ) : null}

              {!subjectsQuery.isPending && subjects.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-5 text-sm text-slate-500">
                  No subjects yet. Create subjects first, or continue without
                  assigning any.
                </div>
              ) : (
                <div className="grid max-h-64 gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/60 p-3 sm:grid-cols-2">
                  {subjects.map((subject) => {
                    const selected = selectedSubjectUuids.includes(subject.uuid)
                    return (
                      <button
                        key={subject.uuid}
                        type="button"
                        onClick={() => toggleSubject(subject.uuid)}
                        className={`rounded-xl border px-3 py-3 text-left transition ${
                          selected
                            ? 'border-blue-600 bg-blue-50 shadow-sm shadow-blue-600/10'
                            : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-white'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p
                              className={`truncate text-sm font-semibold ${
                                selected ? 'text-blue-700' : 'text-slate-800'
                              }`}
                            >
                              {subject.name}
                            </p>
                            <p className="mt-0.5 text-[11px] text-slate-400">
                              {subject.code}
                              {subject.level ? ` · ${subject.level.name}` : ''}
                            </p>
                            {subject.faculty ? (
                              <p className="mt-1 text-[10px] font-medium text-slate-400">
                                Currently: {subject.faculty.name}
                              </p>
                            ) : null}
                          </div>
                          {selected ? (
                            <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-blue-600 text-white">
                              <Check className="h-3 w-3" />
                            </span>
                          ) : (
                            <span className="h-5 w-5 shrink-0 rounded-full border border-slate-300" />
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {selectedSubjectUuids.length > 0 ? (
                <p className="text-xs font-medium text-blue-600">
                  {selectedSubjectUuids.length} subject
                  {selectedSubjectUuids.length === 1 ? '' : 's'} selected
                </p>
              ) : null}
            </section>

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
                to="/admin/faculties"
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createFaculty.isPending}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
              >
                {createFaculty.isPending ? 'Creating…' : 'Create Faculty'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </SchoolAdminShell>
  )
}
