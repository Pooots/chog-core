import { useState, type FormEvent } from 'react'
import { useNavigate } from '@tanstack/react-router'
import axios from 'axios'
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  CircleCheck,
  Mail,
  MapPin,
  Phone,
  UserRound,
  UsersRound,
} from 'lucide-react'
import { SuperAdminShell } from '@/components/admin/SuperAdminShell'
import { useCreateSchoolMutation } from '@/hooks/useSchoolQueries'

const steps = [
  { label: 'School Identity', icon: Building2 },
  { label: 'Location & Contact', icon: MapPin },
  { label: 'Principal Account', icon: UsersRound },
  { label: 'Review & Create', icon: CircleCheck },
]

const initialForm = {
  name: '',
  code: '',
  address: '',
  city: '',
  province: '',
  phone: '',
  principalName: '',
  principalEmail: '',
  password: '',
  passwordConfirmation: '',
}

type FormField = keyof typeof initialForm

function Field({
  label,
  field,
  value,
  placeholder,
  type = 'text',
  minLength,
  onChange,
}: {
  label: string
  field: FormField
  value: string
  placeholder: string
  type?: string
  minLength?: number
  onChange: (field: FormField, value: string) => void
}) {
  return (
    <label className="block text-sm font-medium text-slate-700">
      {label}
      <input
        required
        type={type}
        value={value}
        minLength={minLength}
        autoComplete={type === 'password' ? 'new-password' : undefined}
        onChange={(event) => onChange(field, event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
      />
    </label>
  )
}

export default function CreateSchoolPage() {
  const navigate = useNavigate()
  const createSchool = useCreateSchoolMutation()
  const [currentStep, setCurrentStep] = useState(0)
  const [form, setForm] = useState(initialForm)
  const [passwordError, setPasswordError] = useState('')
  const [createError, setCreateError] = useState('')

  const updateField = (field: FormField, value: string) => {
    setForm((current) => ({ ...current, [field]: value }))
    if (field === 'password' || field === 'passwordConfirmation') {
      setPasswordError('')
    }
  }

  const handleNext = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (currentStep === 2) {
      if (form.password.length < 8) {
        setPasswordError('Password must be at least 8 characters.')
        return
      }
      if (form.password !== form.passwordConfirmation) {
        setPasswordError('Password and confirmation password do not match.')
        return
      }
    }

    setPasswordError('')
    setCurrentStep((step) => Math.min(step + 1, steps.length - 1))
  }

  const handleBack = async () => {
    if (currentStep === 0) {
      await navigate({ to: '/admin/super/school' })
      return
    }
    setCurrentStep((step) => Math.max(step - 1, 0))
  }

  const handleCreate = async () => {
    setCreateError('')

    try {
      await createSchool.mutateAsync({
        name: form.name.trim(),
        code: form.code.trim(),
        address: form.address.trim(),
        city: form.city.trim(),
        province: form.province.trim(),
        phone: form.phone.trim(),
        principal_name: form.principalName.trim(),
        principal_email: form.principalEmail.trim(),
        password: form.password,
        password_confirmation: form.passwordConfirmation,
      })
      await navigate({ to: '/admin/super/school' })
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const validationErrors = error.response?.data?.errors as
          | Record<string, string[]>
          | undefined
        const firstValidationError = validationErrors
          ? Object.values(validationErrors)[0]?.[0]
          : undefined
        setCreateError(
          firstValidationError ??
            error.response?.data?.message ??
            'Unable to create the school.',
        )
      } else {
        setCreateError('Unable to create the school.')
      }
    }
  }

  const CurrentIcon = steps[currentStep]?.icon ?? Building2

  return (
    <SuperAdminShell>
      <main className="p-4 sm:p-6">
        <div className="mx-auto max-w-[1500px]">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
              School Setup
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Guided wizard to register a new school and onboard its principal.
            </p>
          </div>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white px-5 py-5 shadow-sm sm:px-8">
            <div className="grid grid-cols-4 items-start gap-2">
              {steps.map((step, index) => {
                const StepIcon = step.icon
                const complete = index < currentStep
                const active = index === currentStep
                return (
                  <div
                    key={step.label}
                    className="relative flex flex-col items-center text-center"
                  >
                    {index < steps.length - 1 ? (
                      <span
                        className={`absolute left-[calc(50%+1.75rem)] right-[calc(-50%+1.75rem)] top-5 h-0.5 ${
                          index < currentStep ? 'bg-blue-600' : 'bg-slate-200'
                        }`}
                      />
                    ) : null}
                    <span
                      className={`relative z-10 grid h-10 w-10 place-items-center rounded-xl transition ${
                        active
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-600/20'
                          : complete
                            ? 'bg-blue-50 text-blue-600'
                            : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {complete ? (
                        <Check className="h-5 w-5" />
                      ) : (
                        <StepIcon className="h-5 w-5" />
                      )}
                    </span>
                    <span
                      className={`mt-2 hidden text-[10px] font-semibold sm:block ${
                        active ? 'text-slate-900' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                )
              })}
            </div>
          </section>

          <section className="mt-5 max-w-3xl rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-blue-50 text-blue-600">
                <CurrentIcon className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  {steps[currentStep]?.label}
                </h2>
                <p className="text-xs text-slate-400">
                  {currentStep === 0 &&
                    'Basic information to register the school.'}
                  {currentStep === 1 &&
                    'Where the school is located and how to contact it.'}
                  {currentStep === 2 &&
                    'Create the primary administrator for this school.'}
                  {currentStep === 3 &&
                    'Confirm the details before creating the school.'}
                </p>
              </div>
            </div>

            {currentStep === 0 ? (
              <form className="mt-6 space-y-5" onSubmit={handleNext}>
                <Field
                  label="School Name"
                  field="name"
                  value={form.name}
                  placeholder="e.g. Lincoln High School"
                  onChange={updateField}
                />
                <Field
                  label="School Code"
                  field="code"
                  value={form.code}
                  placeholder="e.g. LHS-2026"
                  onChange={updateField}
                />
                <WizardActions onBack={handleBack} />
              </form>
            ) : null}

            {currentStep === 1 ? (
              <form className="mt-6 space-y-5" onSubmit={handleNext}>
                <Field
                  label="School Address"
                  field="address"
                  value={form.address}
                  placeholder="Street and barangay"
                  onChange={updateField}
                />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="City / Municipality"
                    field="city"
                    value={form.city}
                    placeholder="City"
                    onChange={updateField}
                  />
                  <Field
                    label="Province"
                    field="province"
                    value={form.province}
                    placeholder="Province"
                    onChange={updateField}
                  />
                </div>
                <Field
                  label="Contact Number"
                  field="phone"
                  value={form.phone}
                  placeholder="+63 900 000 0000"
                  type="tel"
                  onChange={updateField}
                />
                <WizardActions onBack={handleBack} />
              </form>
            ) : null}

            {currentStep === 2 ? (
              <form className="mt-6 space-y-5" onSubmit={handleNext}>
                <Field
                  label="Principal Name"
                  field="principalName"
                  value={form.principalName}
                  placeholder="Full name"
                  onChange={updateField}
                />
                <Field
                  label="Principal Email"
                  field="principalEmail"
                  value={form.principalEmail}
                  placeholder="principal@school.edu"
                  type="email"
                  onChange={updateField}
                />
                <Field
                  label="Password"
                  field="password"
                  value={form.password}
                  placeholder="Create a password"
                  type="password"
                  minLength={8}
                  onChange={updateField}
                />
                <Field
                  label="Confirmation Password"
                  field="passwordConfirmation"
                  value={form.passwordConfirmation}
                  placeholder="Re-enter password"
                  type="password"
                  minLength={8}
                  onChange={updateField}
                />
                {passwordError ? (
                  <p
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {passwordError}
                  </p>
                ) : null}
                <WizardActions onBack={handleBack} />
              </form>
            ) : null}

            {currentStep === 3 ? (
              <div className="mt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <ReviewCard
                    icon={Building2}
                    label="School Identity"
                    lines={[form.name, form.code]}
                  />
                  <ReviewCard
                    icon={MapPin}
                    label="Location & Contact"
                    lines={[
                      form.address,
                      [form.city, form.province].filter(Boolean).join(', '),
                      form.phone,
                    ]}
                  />
                  <ReviewCard
                    icon={UserRound}
                    label="Principal Account"
                    lines={[
                      form.principalName,
                      form.principalEmail,
                      'Password set',
                    ]}
                  />
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                      <CircleCheck className="h-4 w-4" />
                      Ready to create
                    </div>
                    <p className="mt-2 text-xs leading-5 text-emerald-600">
                      The school will be activated and its principal account
                      will be prepared.
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex items-center justify-between border-t border-slate-100 pt-5">
                  <button
                    type="button"
                    onClick={handleBack}
                    className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={createSchool.isPending}
                    onClick={handleCreate}
                    className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    <Check className="h-4 w-4" />
                    {createSchool.isPending ? 'Creating…' : 'Create School'}
                  </button>
                </div>
                {createError ? (
                  <p
                    role="alert"
                    className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  >
                    {createError}
                  </p>
                ) : null}
              </div>
            ) : null}
          </section>
        </div>
      </main>
    </SuperAdminShell>
  )
}

function WizardActions({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex items-center justify-between border-t border-slate-100 pt-5">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>
      <button
        type="submit"
        className="flex items-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700"
      >
        Continue
        <ArrowRight className="h-4 w-4" />
      </button>
    </div>
  )
}

function ReviewCard({
  icon: Icon,
  label,
  lines,
}: {
  icon: typeof Building2
  label: string
  lines: string[]
}) {
  return (
    <article className="rounded-xl border border-slate-200 p-4">
      <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
        <Icon className="h-4 w-4 text-blue-600" />
        {label}
      </div>
      <div className="mt-3 space-y-1">
        {lines.filter(Boolean).map((line) => (
          <p key={line} className="flex items-center gap-2 text-xs text-slate-500">
            {label === 'Principal Account' && line.includes('@') ? (
              <Mail className="h-3.5 w-3.5" />
            ) : label === 'Location & Contact' && line.startsWith('+') ? (
              <Phone className="h-3.5 w-3.5" />
            ) : null}
            {line}
          </p>
        ))}
      </div>
    </article>
  )
}
