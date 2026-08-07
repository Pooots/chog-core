import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Link, useNavigate, useParams } from '@tanstack/react-router'
import axios from 'axios'
import { ArrowLeft, IdCard, Users } from 'lucide-react'
import { SchoolAdminShell } from '@/components/admin/SchoolAdminShell'
import { StudentNumberQr } from '@/components/admin/StudentNumberQr'
import {
  useLevelsQuery,
  useRoomsQuery,
  useStudentQuery,
  useUpdateStudentMutation,
} from '@/hooks/useSchoolQueries'
import type {
  StudentEnrollmentStatus,
  StudentGender,
  StudentStatus,
} from '@/services/studentService'

export default function EditStudentPage() {
  const navigate = useNavigate()
  const { studentUuid } = useParams({
    from: '/admin/registrar/$studentUuid/edit',
  })
  const studentQuery = useStudentQuery(studentUuid)
  const levelsQuery = useLevelsQuery()
  const roomsQuery = useRoomsQuery()
  const updateStudent = useUpdateStudentMutation(studentUuid)

  const student = studentQuery.data
  const levels = levelsQuery.data ?? []
  const rooms = roomsQuery.data ?? []

  const [firstName, setFirstName] = useState('')
  const [middleName, setMiddleName] = useState('')
  const [lastName, setLastName] = useState('')
  const [lrnNumber, setLrnNumber] = useState('')
  const [studentNumber, setStudentNumber] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [gender, setGender] = useState<StudentGender | ''>('')
  const [birthDate, setBirthDate] = useState('')
  const [guardianName, setGuardianName] = useState('')
  const [guardianPhone, setGuardianPhone] = useState('')
  const [levelUuid, setLevelUuid] = useState('')
  const [roomUuid, setRoomUuid] = useState('')
  const [enrollmentDate, setEnrollmentDate] = useState('')
  const [enrollmentStatus, setEnrollmentStatus] =
    useState<StudentEnrollmentStatus>('enrolled')
  const [status, setStatus] = useState<StudentStatus>('active')
  const [notes, setNotes] = useState('')
  const [initialized, setInitialized] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!student || initialized) return

    setFirstName(student.first_name)
    setMiddleName(student.middle_name ?? '')
    setLastName(student.last_name)
    setLrnNumber(student.lrn_number)
    setStudentNumber(student.student_number)
    setEmail(student.email ?? '')
    setPhoneNumber(student.phone_number ?? '')
    setGender(student.gender ?? '')
    setBirthDate(student.birth_date ?? '')
    setGuardianName(student.guardian_name ?? '')
    setGuardianPhone(student.guardian_phone ?? '')
    setLevelUuid(student.level_uuid ?? '')
    setRoomUuid(student.room_uuid ?? '')
    setEnrollmentDate(student.enrollment_date ?? '')
    setEnrollmentStatus(student.enrollment_status)
    setStatus(student.status)
    setNotes(student.notes ?? '')
    setInitialized(true)
  }, [student, initialized])

  const filteredRooms = useMemo(() => {
    if (!levelUuid) return rooms
    return rooms.filter((room) => room.level_uuid === levelUuid)
  }, [rooms, levelUuid])

  const handleLevelChange = (nextLevelUuid: string) => {
    setLevelUuid(nextLevelUuid)
    if (
      roomUuid &&
      !rooms.some(
        (room) =>
          room.uuid === roomUuid && room.level_uuid === nextLevelUuid,
      )
    ) {
      setRoomUuid('')
    }
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError('')

    try {
      await updateStudent.mutateAsync({
        first_name: firstName.trim(),
        middle_name: middleName.trim() || undefined,
        last_name: lastName.trim(),
        lrn_number: lrnNumber.trim(),
        student_number: studentNumber.trim(),
        email: email.trim() || null,
        phone_number: phoneNumber.trim() || null,
        gender: gender || null,
        birth_date: birthDate || null,
        guardian_name: guardianName.trim() || null,
        guardian_phone: guardianPhone.trim() || null,
        level_uuid: levelUuid || null,
        room_uuid: roomUuid || null,
        enrollment_date: enrollmentDate || null,
        enrollment_status: enrollmentStatus,
        notes: notes.trim() || null,
        status,
      })
      await navigate({ to: '/admin/registrar' })
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
            'Unable to update the student.',
        )
      } else {
        setError('Unable to update the student.')
      }
    }
  }

  return (
    <SchoolAdminShell>
      <main className="p-4 sm:p-6">
        <div className="mx-auto max-w-3xl">
          <Link
            to="/admin/registrar"
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Registrar
          </Link>

          <div className="mt-4">
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              Edit Student
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Update LRN, student number, placement, and enrollment details.
            </p>
          </div>

          {studentQuery.isPending && !student ? (
            <p className="mt-6 text-sm text-slate-500">Loading student…</p>
          ) : null}

          {studentQuery.isError ? (
            <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
              Unable to load this student.
            </div>
          ) : null}

          {student ? (
            <form
              onSubmit={handleSubmit}
              className="mt-6 space-y-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
            >
              <section className="space-y-4">
                <div className="flex items-center gap-2">
                  <IdCard className="h-4 w-4 text-blue-600" />
                  <h2 className="text-sm font-semibold text-slate-900">
                    Student identity
                  </h2>
                </div>

                <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-start">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-slate-700">
                      LRN number
                      <input
                        required
                        value={lrnNumber}
                        onChange={(event) => setLrnNumber(event.target.value)}
                        maxLength={20}
                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                    </label>
                    <label className="block text-sm font-medium text-slate-700">
                      Student number
                      <input
                        required
                        value={studentNumber}
                        onChange={(event) =>
                          setStudentNumber(event.target.value.toUpperCase())
                        }
                        maxLength={50}
                        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm uppercase outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                      />
                      <span className="mt-1.5 block text-[11px] text-slate-400">
                        QR mark for this student number. Students register their
                        own portal account.
                      </span>
                    </label>
                  </div>
                  <StudentNumberQr studentNumber={studentNumber} size={96} />
                </div>
              </section>

              <section className="space-y-4 border-t border-slate-100 pt-5">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <h2 className="text-sm font-semibold text-slate-900">
                    Personal details
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
                    Gender
                    <select
                      value={gender}
                      onChange={(event) =>
                        setGender(event.target.value as StudentGender | '')
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option value="">Prefer not to say</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Birth date
                    <input
                      type="date"
                      value={birthDate}
                      onChange={(event) => setBirthDate(event.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </label>
                </div>
              </section>

              <section className="space-y-4 border-t border-slate-100 pt-5">
                <h2 className="text-sm font-semibold text-slate-900">
                  Placement & enrollment
                </h2>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Level
                    <select
                      value={levelUuid}
                      onChange={(event) =>
                        handleLevelChange(event.target.value)
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option value="">No level assigned</option>
                      {levels.map((level) => (
                        <option key={level.uuid} value={level.uuid}>
                          {level.name} ({level.code})
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Room / section
                    <select
                      value={roomUuid}
                      onChange={(event) => setRoomUuid(event.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option value="">No room assigned</option>
                      {filteredRooms.map((room) => (
                        <option key={room.uuid} value={room.uuid}>
                          {room.name} ({room.code})
                        </option>
                      ))}
                    </select>
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Enrollment date
                    <input
                      type="date"
                      value={enrollmentDate}
                      onChange={(event) =>
                        setEnrollmentDate(event.target.value)
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Enrollment status
                    <select
                      value={enrollmentStatus}
                      onChange={(event) =>
                        setEnrollmentStatus(
                          event.target.value as StudentEnrollmentStatus,
                        )
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option value="enrolled">Enrolled</option>
                      <option value="pending">Pending</option>
                      <option value="withdrawn">Withdrawn</option>
                    </select>
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Record status
                    <select
                      value={status}
                      onChange={(event) =>
                        setStatus(event.target.value as StudentStatus)
                      }
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Guardian name
                    <input
                      value={guardianName}
                      onChange={(event) => setGuardianName(event.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                    />
                  </label>
                </div>

                <label className="block text-sm font-medium text-slate-700">
                  Guardian phone
                  <input
                    value={guardianPhone}
                    onChange={(event) => setGuardianPhone(event.target.value)}
                    className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </label>

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
                  to="/admin/registrar"
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                >
                  Cancel
                </Link>
                <button
                  type="submit"
                  disabled={updateStudent.isPending}
                  className="rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
                >
                  {updateStudent.isPending ? 'Saving…' : 'Save Changes'}
                </button>
              </div>
            </form>
          ) : null}
        </div>
      </main>
    </SchoolAdminShell>
  )
}
