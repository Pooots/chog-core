import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from '@tanstack/react-router'
import axios from 'axios'
import { ArrowLeft, BookOpen, Building2, Layers3 } from 'lucide-react'
import { SchoolAdminShell } from '@/components/admin/SchoolAdminShell'
import {
  useCreateSubjectMutation,
  useFacultiesQuery,
  useLevelsQuery,
} from '@/hooks/useSchoolQueries'

export default function CreateSubjectPage() {
  const navigate = useNavigate()
  const levelsQuery = useLevelsQuery()
  const facultiesQuery = useFacultiesQuery()
  const createSubject = useCreateSubjectMutation()
  const levels = levelsQuery.data ?? []
  const faculties = facultiesQuery.data ?? []
  const [levelUuid, setLevelUuid] = useState('')
  const [facultyUuid, setFacultyUuid] = useState('')
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState('')

  const selectedLevelUuid = levelUuid || levels[0]?.uuid || ''
  const selectedFacultyUuid = facultyUuid || faculties[0]?.uuid || ''
  const isLoadingLevels = levelsQuery.isPending && levels.length === 0
  const isLoadingFaculties = facultiesQuery.isPending && faculties.length === 0

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    if (!selectedLevelUuid) {
      setError('Create a level first before adding subjects.')
      return
    }

    if (!selectedFacultyUuid) {
      setError('Create a faculty first before adding subjects.')
      return
    }

    try {
      await createSubject.mutateAsync({
        level_uuid: selectedLevelUuid,
        faculty_uuid: selectedFacultyUuid,
        name: name.trim(),
        code: code.trim(),
        description: description.trim() || undefined,
        status: 'active',
      })
      await navigate({ to: '/admin/subjects' })
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
            'Unable to create the subject.',
        )
      } else {
        setError('Unable to create the subject.')
      }
    }
  }

  const missingPrerequisite =
    (!isLoadingLevels && levels.length === 0) ||
    (!isLoadingFaculties && faculties.length === 0)

  return (
    <SchoolAdminShell>
      <main className="p-4 sm:p-6">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/admin/subjects"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Subjects
          </Link>

          <div className="mt-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Create Subject
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Assign the subject to a grade level and faculty department.
            </p>
          </div>

          {missingPrerequisite ? (
            <div className="mt-6 space-y-3">
              {levels.length === 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                    <Layers3 className="h-4 w-4" />
                    Level required
                  </div>
                  <p className="mt-2 text-sm text-amber-700">
                    Create a level first (for example Grade 7) before adding
                    subjects.
                  </p>
                  <Link
                    to="/admin/subjects/levels/create"
                    className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Create Level
                  </Link>
                </div>
              ) : null}
              {faculties.length === 0 ? (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <div className="flex items-center gap-2 text-sm font-semibold text-amber-800">
                    <Building2 className="h-4 w-4" />
                    Faculty required
                  </div>
                  <p className="mt-2 text-sm text-amber-700">
                    Create a faculty department first before adding subjects.
                  </p>
                  <Link
                    to="/admin/faculties/create"
                    className="mt-4 inline-flex rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white"
                  >
                    Create Faculty
                  </Link>
                </div>
              ) : null}
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Subject details
                </h2>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                Level
                <select
                  required
                  value={selectedLevelUuid}
                  onChange={(event) => setLevelUuid(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  {levels.map((level) => (
                    <option key={level.uuid} value={level.uuid}>
                      {level.name} ({level.code})
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Faculty / Department
                <select
                  required
                  value={selectedFacultyUuid}
                  onChange={(event) => setFacultyUuid(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  {faculties.map((faculty) => (
                    <option key={faculty.uuid} value={faculty.uuid}>
                      {faculty.name} ({faculty.code})
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Subject name
                <input
                  required
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="e.g. Mathematics"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Subject code
                <input
                  required
                  value={code}
                  onChange={(event) => setCode(event.target.value.toUpperCase())}
                  placeholder="e.g. MATH"
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
                  to="/admin/subjects"
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={
                    createSubject.isPending ||
                    levels.length === 0 ||
                    faculties.length === 0
                  }
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {createSubject.isPending ? 'Creating…' : 'Create Subject'}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </SchoolAdminShell>
  )
}
