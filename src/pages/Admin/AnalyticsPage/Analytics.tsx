import React from 'react';

const Analytics = () => {
  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Project Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Example chart area */}
        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-lg font-semibold mb-2">SPI vs CPI</h2>
          <div className="h-60 flex items-center justify-center text-gray-500">
            {/* You can mount a chart here like ImpactChart */}
            Placeholder for chart (e.g., SPI/CPI BarChart)
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow p-4">
          <h2 className="text-lg font-semibold mb-2">Task Completion Trend</h2>
          <div className="h-60 flex items-center justify-center text-gray-500">
            Placeholder for line chart (task done vs overdue)
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">AI Insights</h2>
        <div className="bg-gray-50 border rounded-lg p-6 text-gray-500">
          Add recommendations, anomaly detection, risk predictions, etc.
        </div>
      </div>
    </div>
  );
};

export default Analytics;
