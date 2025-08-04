// ImpactChart.tsx
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';

type ImpactChartProps = {
  spiBefore: number;
  spiAfter: number;
  cpiBefore: number;
  cpiAfter: number;
};

const ImpactChart = ({ spiBefore, spiAfter, cpiBefore, cpiAfter }: ImpactChartProps) => {
  const data = [
    { metric: 'SPI', before: spiBefore, after: spiAfter },
    { metric: 'CPI', before: cpiBefore, after: cpiAfter },
  ];

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <XAxis dataKey="metric" />
        <YAxis domain={[0, 1.2]} />
        <Tooltip />
        <Legend />
        <Bar dataKey="before" fill="#8884d8" name="Before" />
        <Bar dataKey="after" fill="#82ca9d" name="After" />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default ImpactChart;



// import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// const mockData = [
//   { metric: 'SPI', before: 0.55, after: 0.60 },
//   { metric: 'CPI', before: 0.86, after: 0.84 },
// ];

// const ImpactChart = () => (
//   <ResponsiveContainer width="100%" height={300}>
//     <BarChart data={mockData}>
//       <XAxis dataKey="metric" />
//       <YAxis domain={[0, 1.2]} />
//       <Tooltip />
//       <Legend />
//       <Bar dataKey="before" fill="#8884d8" name="Before" />
//       <Bar dataKey="after" fill="#82ca9d" name="After" />
//     </BarChart>
//   </ResponsiveContainer>
// );

// export default ImpactChart;


// import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, ResponsiveContainer } from 'recharts';

// const mockRadarData = [
//   { metric: 'Progress (%)', before: 45, after: 65 },
//   { metric: 'SPI', before: 0.85, after: 1.05 },
//   { metric: 'CPI', before: 0.9, after: 1.1 },
//   { metric: 'Overdue Tasks', before: 12, after: 4 },
//   { metric: 'Budget Overrun', before: 5000, after: 1000 },
// ];

// const ImpactChart = () => (
//   <ResponsiveContainer width="100%" height={350}>
//     <RadarChart data={mockRadarData}>
//       <PolarGrid />
//       <PolarAngleAxis dataKey="metric" />
//       <PolarRadiusAxis />
//       <Radar name="Before AI" dataKey="before" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
//       <Radar name="After AI" dataKey="after" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
//       <Legend />
//     </RadarChart>
//   </ResponsiveContainer>
// );
// export default ImpactChart;

// import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// const mockData = [
//   { metric: 'Progress (%)', before: 45, after: 65 },
//   { metric: 'SPI', before: 0.85, after: 1.05 },
//   { metric: 'CPI', before: 0.9, after: 1.1 },
//   { metric: 'Overdue Tasks', before: 12, after: 4 },
//   { metric: 'Budget Overrun', before: 5000, after: 1000 },
// ];

// const ImpactChart = () => (
//   <ResponsiveContainer width="100%" height={300}>
//     <LineChart data={mockData}>
//       <XAxis dataKey="metric" />
//       <YAxis />
//       <Tooltip />
//       <Legend />
//       <Line type="monotone" dataKey="before" stroke="#8884d8" name="Before AI" />
//       <Line type="monotone" dataKey="after" stroke="#82ca9d" name="After AI" />
//     </LineChart>
//   </ResponsiveContainer>
// );

// export default ImpactChart;

// import {
//   Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, ResponsiveContainer
// } from 'recharts';

// const mockRadarData = [
//   { metric: 'SPI', before: 0.85, after: 1.05 },
//   { metric: 'CPI', before: 0.9, after: 1.1 },
// ];

// const ImpactChart = () => (
//   <ResponsiveContainer width="100%" height={350}>
//     <RadarChart data={mockRadarData}>
//       <PolarGrid />
//       <PolarAngleAxis dataKey="metric" />
//       <PolarRadiusAxis domain={[0, 1.5]} tickCount={6} />
//       <Radar name="Before AI" dataKey="before" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
//       <Radar name="After AI" dataKey="after" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
//       <Legend />
//     </RadarChart>
//   </ResponsiveContainer>
// );

// export default ImpactChart;

