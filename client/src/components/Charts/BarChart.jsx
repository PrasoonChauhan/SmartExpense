import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{
      background: '#1a1a2e',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10,
      padding: '10px 14px',
      fontSize: 13,
      fontFamily: 'Inter, sans-serif',
    }}>
      <p style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{label}</p>
      <p style={{ color: '#06b6d4' }}>
        ₹{payload[0].value.toLocaleString('en-IN')}
      </p>
    </div>
  );
};

export default function ExpenseBarChart({ data }) {
  const chartData = data.map((d) => {
    const [year, month] = d.month.split('-');
    return {
      name: `${MONTH_NAMES[parseInt(month) - 1]} ${year.slice(2)}`,
      total: d.total,
      count: d.count,
    };
  });

  const maxValue = Math.max(...chartData.map((d) => d.total));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }} barSize={32}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 12, fill: '#64748b', fontFamily: 'Inter, sans-serif' }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: '#64748b', fontFamily: 'Inter, sans-serif' }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`}
          width={48}
        />
        <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
        <Bar dataKey="total" radius={[6, 6, 0, 0]} animationBegin={0} animationDuration={800}>
          {chartData.map((entry) => (
            <Cell
              key={entry.name}
              fill={entry.total === maxValue
                ? 'url(#barGradient)'
                : 'rgba(124,58,237,0.4)'}
            />
          ))}
        </Bar>
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </BarChart>
    </ResponsiveContainer>
  );
}
