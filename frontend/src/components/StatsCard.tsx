interface StatsCardProps {
  label: string
  value: string | number
  helper?: string
}

const StatsCard = ({ label, value, helper }: StatsCardProps) => (
  <div className="stats-card">
    <span className="stats-label">{label}</span>
    <strong className="stats-value">{value}</strong>
    {helper && <span className="stats-helper">{helper}</span>}
  </div>
)

export default StatsCard
