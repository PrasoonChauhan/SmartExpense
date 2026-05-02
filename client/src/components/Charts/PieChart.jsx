import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

const COLORS = {
  Food:          '#f97316',
  Travel:        '#06b6d4',
  Bills:         '#ef4444',
  Shopping:      '#8b5cf6',
  Entertainment: '#ec4899',
  Health:        '#10b981',
  Education:     '#f59e0b',
  Other:         '#64748b',
};

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.6;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const { category, total, count } = payload[0].payload;
  return (
    <div style={{
      background: '#1a1a2e',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 10,
      padding: '10px 14px',
      fontSize: 13,
      fontFamily: 'Inter, sans-serif',
    }}>
      <p style={{ fontWeight: 700, color: '#f1f5f9', marginBottom: 4 }}>{category}</p>
      <p style={{ color: '#94a3b8' }}>
        ₹{total.toLocaleString('en-IN')} · {count} transaction{count !== 1 ? 's' : ''}
      </p>
    </div>
  );
};

const CustomLegend = ({ payload }) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px 16px', justifyContent: 'center', marginTop: 12 }}>
    {payload.map((entry) => (
      <div key={entry.value} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ width: 10, height: 10, borderRadius: '50%', background: entry.color, flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: '#94a3b8', fontFamily: 'Inter, sans-serif' }}>{entry.value}</span>
      </div>
    ))}
  </div>
);

export default function ExpensePieChart({ data }) {
  const chartData = data.map((d) => ({
    category: d.category,
    total: d.total,
    count: d.count,
    name: d.category,
    value: d.total,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="45%"
          innerRadius={60}
          outerRadius={110}
          paddingAngle={3}
          dataKey="value"
          labelLine={false}
          label={renderCustomLabel}
          animationBegin={0}
          animationDuration={800}
        >
          {chartData.map((entry) => (
            <Cell
              key={entry.category}
              fill={COLORS[entry.category] || COLORS.Other}
              stroke="transparent"
            />
          ))}
        </Pie>
        <Tooltip content={<CustomTooltip />} />
        <Legend content={<CustomLegend />} />
      </PieChart>
    </ResponsiveContainer>
  );
}
