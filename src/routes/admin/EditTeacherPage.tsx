import { useEffect, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
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
  TeacherStatus,
} from '@/services/teacherService'
import {
  useFacultiesQuery,
  useTeacherPositionsQuery,
  useTeacherQuery,
  useUpdateTeacherMutation,
} from '@/hooks/useSchoolQueries'

const fallbackPositions: TeacherPositionOption[] = [
  { value: 'student_teacher', label: 'Student Teacher' },
  { value: 'regular_teacher', label: 'Regular Teacher' },
  { value: 'mid_level_teacher', label: 'Mid Level Teacher' },
  { value: 'senior_teacher', label: 'Senior Teacher' },
  { value: 'supervisor', label: 'Supervisor' },
  { value: 'head', label: 'Head' },
]

export default function EditTeacherPage() {
  const navigate = useNavigate()
  const { teacherUuid } = useParams({
    from: '/admin/teachers/$teacherUuid/edit',
  })
  const teacherQuery = useTeacherQuery(teacherUuid)
  const positionsQuery = useTeacherPositionsQuery()
  const facultiesQuery = useFacultiesQuery()
  const updateTeacher = useUpdateTeacherMutation(teacherUuid)

  const teacher = teacherQuery.data
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
  const [facultyUuid, setFacultyUuid] = useState('')
  const [hireDate, setHireDate] = useState('')
  const [notes, setNotes] = useState('')
  const [status, setStatus] = useState<TeacherStatus>('active')
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!teacher || initialized) return

    setFirstName(teacher.first_name)
    setMiddleName(teacher.middle_name ?? '')
    setLastName(teacher.last_name)
    setEmail(teacher.email)
    setPhoneNumber(teacher.phone_number ?? '')
    setEmployeeId(teacher.employee_id)
    setPrcLicense(teacher.prc_license ?? '')
    setPosition(teacher.position)
    setFacultyUuid(teacher.faculty_uuid ?? '')
    setHireDate(teacher.hire_date ?? '')
    setNotes(teacher.notes ?? '')
    setStatus(teacher.status)
    setInitialized(true)
  }, [teacher, initialized])

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    try {
      await updateTeacher.mutateAsync({
        first_name: firstName.trim(),
        middle_name: middleName.trim() || undefined,
        last_name: lastName.trim(),
        email: email.trim(),
        phone_number: phoneNumber.trim() || undefined,
        employee_id: employeeId.trim(),
        prc_license: prcLicense.trim() || null,
        position,
        faculty_uuid: facultyUuid || null,
        hire_date: hireDate || null,
        notes: notes.trim() || null,
        status,
      })
      await navigate({ to: '/admin/teachers' })
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
            'Unable to update the teacher.',
        )
      } else {
        setError('Unable to update the teacher.')
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
              Edit Teacher
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Update position, contact details, and department assignment.
            </p>
          </div>

          {teacherQuery.isPending && !teacher ? (
            <p className="mt-6 text-sm text-slate-500">Loading teacher…</p>
          ) : null}

          {teacherQuery.isError ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              Unable to load this teacher.
            </div>
          ) : null}

          {teacher ? (
            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <section>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-blue-600" />
                  <h2 className="text-sm font-semibold text-slate-900">
                    Position
                  </h2>
                </div>
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
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Last name
                    <input
                      required
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </label>
                </div>

                <label className="block text-sm font-medium text-slate-700">
                  Middle name
                  <input
                    value={middleName}
                    onChange={(event) => setMiddleName(event.target.value)}
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
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Phone number
                    <input
                      value={phoneNumber}
                      onChange={(event) => setPhoneNumber(event.target.value)}
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

                <div className="grid gap-4 sm:grid-cols-2">
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
                    Status
                    <select
                      value={status}
                      onChange={(event) =>
                        setStatus(event.target.value as TeacherStatus)
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>
                </div>

                <label className="block text-sm font-medium text-slate-700">
                  Notes
                  <textarea
                    value={notes}
                    onChange={(event) => setNotes(event.target.value)}
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
                  disabled={updateTeacher.isPending}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {updateTeacher.isPending ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </main>
    </SchoolAdminShell>
  )
}
