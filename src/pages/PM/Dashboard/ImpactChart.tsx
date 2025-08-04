import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const mockData = [
  { metric: 'Progress (%)', before: 45, after: 65 },
  { metric: 'SPI', before: 0.85, after: 1.05 },
  { metric: 'CPI', before: 0.9, after: 1.1 },
  { metric: 'Overdue Tasks', before: 12, after: 4 },
  { metric: 'Budget Overrun', before: 5000, after: 1000 },
];

const ImpactChart = () => (
  <ResponsiveContainer width="100%" height={300}>
    <BarChart data={mockData}>
      <XAxis dataKey="metric" />
      <YAxis />
      <Tooltip />
      <Legend />
      <Bar dataKey="before" fill="#8884d8" name="Before AI" />
      <Bar dataKey="after" fill="#82ca9d" name="After AI" />
    </BarChart>
  </ResponsiveContainer>
);

export default ImpactChart;