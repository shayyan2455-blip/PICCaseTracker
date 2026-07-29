const statusConfig = {
  draft:        { label: 'Draft',        color: '#6b7280' },
  rti_filed:    { label: 'RTI Filed',    color: '#3b82f6' },
  appeal_filed: { label: 'Appeal Filed', color: '#8b5cf6' },
  under_notice: { label: 'Under Notice', color: '#f59e0b' },
  disposed:     { label: 'Disposed',     color: '#10b981' },
  closed:       { label: 'Closed',       color: '#6b7280' },
}

export default function CaseStatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, color: '#6b7280' }
  return (
    <span
      className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
      style={{
        backgroundColor: `${config.color}15`,
        color: config.color,
      }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: config.color }} />
      {config.label}
    </span>
  )
}
