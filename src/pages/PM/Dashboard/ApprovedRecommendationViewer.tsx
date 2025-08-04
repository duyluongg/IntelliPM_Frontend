import React from 'react';

interface Recommendation {
  id: string;
  type: string;
  recommendation: string;
  approvedAt: string;
}

const ApprovedRecommendationViewer = ({ approvedRecs }: { approvedRecs: Recommendation[] }) => {
  if (!approvedRecs.length) return <p>No approved recommendations yet.</p>;

  return (
    <div className="grid gap-4 mt-4">
      {approvedRecs.map((rec) => (
        <div
          key={rec.id}
          className="rounded-xl shadow-md border border-gray-200 p-4 bg-white"
        >
          <div className="text-sm text-gray-600">
            <span className="font-semibold">Type:</span> {rec.type}
          </div>
          <div className="mt-1 text-base text-gray-800">{rec.recommendation}</div>
          <div className="mt-2 text-xs text-gray-400">
            Approved: {new Date(rec.approvedAt).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ApprovedRecommendationViewer;
