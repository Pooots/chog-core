import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import axios from 'axios'
import {
  ArrowLeft,
  Briefcase,
  Check,
  GraduationCap,
} from 'lucide-react'
import { SchoolAdminShell } from '@/components/admin/SchoolAdminShell'
import type {
  TeacherPosition,
  TeacherPositionOption,
} from '@/services/teacherService'
import {
  useCreateTeacherMutation,
  useFacultiesQuery,
  useTeacherPositionsQuery,
} from '@/hooks/useSchoolQueries'

const fallbackPositions: TeacherPositionOption[] = [
  { value: 'student_teacher', label: 'Student Teacher' },
  { value: 'regular_teacher', label: 'Regular Teacher' },
  { value: 'mid_level_teacher', label: 'Mid Level Teacher' },
  { value: 'senior_teacher', label: 'Senior Teacher' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'head', label: 'Head' },
]

export default function CreateTeacherPage() {
  const navigate = useNavigate()
  const search = useSearch({ from: '/admin/teachers/create' })
  const positionsQuery = useTeacherPositionsQuery()
  const facultiesQuery = useFacultiesQuery()
  const createTeacher = useCreateTeacherMutation()
  const positions =
    positionsQuery.data && positionsQuery.data.length > 0
      ? positionsQuery.data
      : fallbackPositions
  const faculties = facultiesQuery.data ?? []

  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [employeeId, setEmployeeId] = useState('')
  const [prcLicense, setPrcLicense] = useState('')
  const [position, setPosition] = useState<TeacherPosition>('regular_teacher')
  const [facultyUuid, setFacultyUuid] = useState(search.faculty ?? '')
  const [hireDate, setHireDate] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    try {
      await createTeacher.mutateAsync({
        first_name: firstName.trim(),
        middle_name: middleName.trim() || undefined,
        last_name: lastName.trim(),
        email: email.trim(),
        phone_number: phoneNumber.trim() || undefined,
        employee_id: employeeId.trim(),
        prc_license: prcLicense.trim() || undefined,
        position,
        faculty_uuid: facultyUuid || undefined,
        hire_date: hireDate || undefined,
        notes: notes.trim() || undefined,
        status: 'active',
      })
      if (facultyUuid) {
        await navigate({
          to: '/admin/faculties/$facultyUuid',
          params: { facultyUuid },
        })
      } else {
        await navigate({ to: '/admin/teachers' })
      }
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
            'Unable to create the teacher.',
        )
      } else {
        setError('Unable to create the teacher.')
      }
    }
  }

  return (
    <SchoolAdminShell>
      <main className="p-4 sm:p-6">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/admin/teachers"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Teachers
          </Link>

          <div className="mt-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Create Teacher
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Choose a position, then fill in the teacher profile details.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-6 space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
          >
            <section>
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-semibold text-slate-900">
                  What is this teacher&apos;s position?
                </h2>
              </div>
              <p className="mt-1 text-xs text-slate-400">
                Select the rank that best matches their role in the school.
              </p>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {positions.map((option) => {
                  const selected = position === option.value
                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setPosition(option.value)}
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
                <GraduationCap className="h-4 w-4 text-blue-600" />
                <h2 className="text-sm font-semibold text-slate-900">
                  Teacher details
                </h2>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  First name
                  <input
                    required
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                    placeholder="e.g. Ana"
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Last name
                  <input
                    required
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                    placeholder="e.g. Reyes"
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                Middle name
                <input
                  value={middleName}
                  onChange={(event) => setMiddleName(event.target.value)}
                  placeholder="Optional"
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </label>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Email
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="e.g. ana.reyes@school.edu"
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  Phone number
                  <input
                    value={phoneNumber}
                    onChange={(event) => setPhoneNumber(event.target.value)}
                    placeholder="e.g. 09171234567"
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-700">
                  Employee ID
                  <input
                    required
                    value={employeeId}
                    onChange={(event) =>
                      setEmployeeId(event.target.value.toUpperCase())
                    }
                    placeholder="e.g. TCH-001"
                    maxLength={50}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm uppercase outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
                <label className="block text-sm font-medium text-slate-700">
                  PRC license
                  <input
                    value={prcLicense}
                    onChange={(event) => setPrcLicense(event.target.value)}
                    placeholder="e.g. 1234567"
                    maxLength={50}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-700">
                Hire date
                <input
                  type="date"
                  value={hireDate}
                  onChange={(event) => setHireDate(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Faculty
                <select
                  value={facultyUuid}
                  onChange={(event) => setFacultyUuid(event.target.value)}
                  className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                >
                  <option value="">No faculty assigned</option>
                  {faculties.map((faculty) => (
                    <option key={faculty.uuid} value={faculty.uuid}>
                      {faculty.name} ({faculty.code})
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-sm font-medium text-slate-700">
                Notes
                <textarea
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Optional notes about this teacher"
                  rows={4}
                  className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                />
              </label>
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
                to="/admin/teachers"
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createTeacher.isPending}
                className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
              >
                {createTeacher.isPending ? 'Creating…' : 'Create Teacher'}
              </button>
            </div>
          </form>
        </div>
      </main>
    </SchoolAdminShell>
  )
}
