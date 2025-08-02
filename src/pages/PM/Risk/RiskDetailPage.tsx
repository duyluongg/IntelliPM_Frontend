// import React from 'react';
// import { useParams } from 'react-router-dom';
// import { useGetRisksByProjectKeyQuery } from '../../../services/riskApi';
// import RiskDetail from './RiskDetail';
// import type { Risk } from './RiskDetail';

// function convertToRisk(item: any): Risk {
//   return {
//     ...item,
//     impactLevel: ['Low', 'Medium', 'High'].includes(item.impactLevel)
//       ? item.impactLevel
//       : undefined,
//     probability: ['Low', 'Medium', 'High'].includes(item.probability)
//       ? item.probability
//       : undefined,
//     severityLevel: ['Low', 'Medium', 'High'].includes(item.severityLevel)
//       ? item.severityLevel
//       : undefined,
//   };
// }

// const RiskDetailPage = () => {
//   const { projectKey, riskKey } = useParams<{ projectKey: string; riskKey: string }>();

//   const { data: riskList, isLoading, error } = useGetRisksByProjectKeyQuery(projectKey ?? '');

//   if (isLoading) return <div>Loading risk details...</div>;
//   if (error) return <div>Error loading risk details.</div>;

//   const rawRisk = riskList?.data?.find((r: any) => r.riskKey === riskKey);

//   if (!rawRisk) return <div>Risk not found.</div>;

//   const risk = convertToRisk(rawRisk);

//   return <RiskDetail risk={risk} onClose={() => {}} />;
// };

// export default RiskDetailPage;

import React from 'react';
import { useParams } from 'react-router-dom';
import RiskDetail from './RiskDetail';
import type { Risk } from './RiskDetail';
import { useGetRiskByKeyQuery } from '../../../services/riskApi';

function convertToRisk(item: any): Risk {
  return {
    ...item,
    impactLevel: ['Low', 'Medium', 'High'].includes(item.impactLevel)
      ? item.impactLevel
      : undefined,
    probability: ['Low', 'Medium', 'High'].includes(item.probability)
      ? item.probability
      : undefined,
    severityLevel: ['Low', 'Medium', 'High'].includes(item.severityLevel)
      ? item.severityLevel
      : undefined,
  };
}

const RiskDetailPage = () => {
  const { riskKey } = useParams<{ riskKey: string }>();
  console.log('riskKey from params:', riskKey);

  const { data: rawRisk, isLoading, error } = useGetRiskByKeyQuery(riskKey ?? '');
  console.log('Risk API result:', rawRisk);

  if (isLoading) return <div>Loading risk details...</div>;
  if (error || !rawRisk) return <div>Error loading risk details.</div>;

  const risk = convertToRisk(rawRisk?.data);

  return <RiskDetail risk={risk} onClose={() => {}} isPage />;
};

export default RiskDetailPage;

