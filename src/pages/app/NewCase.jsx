import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCasesContext } from '../../lib/CasesContext'

const schema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  applicant_name: z.string().min(2, 'Applicant name is required'),
  applicant_address: z.string().optional(),
  public_body: z.string().min(2, 'Public body is required'),
  case_number: z.string().optional(),
  status: z.enum(['draft', 'rti_filed', 'appeal_filed', 'under_notice', 'disposed', 'closed']),
})

export default function NewCase() {
  const navigate = useNavigate()
  const { addCase } = useCasesContext()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { status: 'rti_filed' },
  })

  function onSubmit(data) {
    addCase(data)
    navigate('/app/cases')
  }

  function inputClass(field) {
    const hasError = errors[field]
    return `w-full rounded-lg border px-4 py-2.5 text-sm outline-none transition-colors ${
      hasError ? 'border-red-500' : ''
    }`
  }

  function inputStyle() {
    return {
      backgroundColor: 'var(--second-bg-color)',
      borderColor: 'color-mix(in srgb, var(--text-color) 15%, transparent)',
      color: 'var(--text-color)',
    }
  }

  return (
    <div className="mx-auto max-w-2xl pt-4">
      <h1 className="text-2xl font-bold sm:text-3xl">New Case</h1>
      <p className="mt-2" style={{ color: 'color-mix(in srgb, var(--text-color) 60%, transparent)' }}>
        Enter the case details below
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5">
        <div>
          <label className="mb-1.5 block text-sm font-medium">Case Title *</label>
          <input
            {...register('title')}
            placeholder="e.g. Rana Abdul Qayyum vs NIRC"
            className={inputClass('title')}
            style={inputStyle()}
          />
          {errors.title && <p className="mt-1 text-xs text-red-500">{errors.title.message}</p>}
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-sm font-medium">Applicant Name *</label>
            <input
              {...register('applicant_name')}
              placeholder="Full name"
              className={inputClass('applicant_name')}
              style={inputStyle()}
            />
            {errors.applicant_name && <p className="mt-1 text-xs text-red-500">{errors.applicant_name.message}</p>}
          </div>

          <div>
            <label className="mb-1.5 block text-sm font-medium">Public Body *</label>
            <input
              {...register('public_body')}
              placeholder="e.g. NIRC, Senate, PEMRA"
              className={inputClass('public_body')}
              style={inputStyle()}
            />
            {errors.public_body && <p className="mt-1 text-xs text-red-500">{errors.public_body.message}</p>}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Applicant Address</label>
          <input
            {...register('applicant_address')}
            placeholder="City, Province (optional)"
            className={inputClass('applicant_address')}
            style={inputStyle()}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">PIC Case Number</label>
          <input
            {...register('case_number')}
            placeholder="e.g. 5837-07/26 (optional)"
            className={inputClass('case_number')}
            style={inputStyle()}
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium">Status</label>
          <select
            {...register('status')}
            className={inputClass('status')}
            style={inputStyle()}
          >
            <option value="draft">Draft</option>
            <option value="rti_filed">RTI Filed</option>
            <option value="appeal_filed">Appeal Filed</option>
            <option value="under_notice">Under Notice</option>
            <option value="disposed">Disposed</option>
            <option value="closed">Closed</option>
          </select>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button type="button" onClick={() => navigate('/app/cases')} className="btn-ghost text-sm px-6 py-2.5">
            Cancel
          </button>
          <button type="submit" disabled={isSubmitting} className="btn-primary text-sm px-6 py-2.5">
            {isSubmitting ? 'Creating...' : 'Create Case'}
          </button>
        </div>
      </form>
    </div>
  )
}
