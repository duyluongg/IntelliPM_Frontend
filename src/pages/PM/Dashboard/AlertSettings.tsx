// import React, { useState } from 'react';
// import { MoreVertical, X } from 'lucide-react';
// import { Tooltip as ReactTooltip } from 'react-tooltip';
// import { useUpdateMutation } from '../../../services/systemConfigurationApi';
// import type { SystemConfiguration } from '../../../services/systemConfigurationApi';

// // interface AlertSettingsProps {
// //   minDaysConfig: { data?: SystemConfiguration } | undefined;
// //   minProgressConfig: { data?: SystemConfiguration } | undefined;
// //   minDays: string;
// //   setMinDays: (value: string) => void;
// //   minProgress: string;
// //   setMinProgress: (value: string) => void;
// //   updateConfig: ReturnType<typeof useUpdateMutation>[0];
// // }

// interface AlertSettingsProps {
//   minDaysConfig: { data?: SystemConfiguration | null | undefined } | undefined;
//   minProgressConfig: { data?: SystemConfiguration | null | undefined } | undefined;
//   minDays: string;
//   setMinDays: (value: string) => void;
//   minProgress: string;
//   setMinProgress: (value: string) => void;
//   updateConfig: ReturnType<typeof useUpdateMutation>[0];
// }

// const AlertSettings: React.FC<AlertSettingsProps> = ({
//   minDaysConfig,
//   minProgressConfig,
//   minDays,
//   setMinDays,
//   minProgress,
//   setMinProgress,
//   updateConfig,
// }) => {
//   const [showConfigSidebar, setShowConfigSidebar] = useState(false);
//   const [showMenu, setShowMenu] = useState(false);

//   const handleConfigSubmit = async () => {
//     try {
//       if (minDaysConfig?.data?.id) {
//         await updateConfig({
//           id: minDaysConfig.data.id,
//           request: {
//             configKey: 'minimum_days_for_alert',
//             valueConfig: minDays,
//             description: 'Minimum days overdue to trigger alert',
//             effectedFrom: new Date().toISOString(),
//           },
//         }).unwrap();
//       }
//       if (minProgressConfig?.data?.id) {
//         await updateConfig({
//           id: minProgressConfig.data.id,
//           request: {
//             configKey: 'minimum_progress_for_alert',
//             valueConfig: minProgress,
//             description: 'Minimum progress percentage to trigger alert',
//             effectedFrom: new Date().toISOString(),
//           },
//         }).unwrap();
//       }
//       setShowConfigSidebar(false);
//     } catch (error) {
//       console.error('❌ Error updating configuration:', error);
//     }
//   };

//   return (
//     <>
//       <div className='absolute top-0 right-0'>
//         <button
//           onClick={() => setShowMenu(!showMenu)}
//           className='p-2 rounded-full hover:bg-gray-100 transition-colors'
//           data-tooltip-id='settings-tooltip'
//           data-tooltip-content='Settings'
//         >
//           <MoreVertical size={20} className='text-gray-600' />
//           <ReactTooltip id='settings-tooltip' />
//         </button>
//         {showMenu && (
//           <div className='absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10'>
//             <button
//               onClick={() => {
//                 setShowConfigSidebar(true);
//                 setShowMenu(false);
//               }}
//               className='w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors'
//             >
//               Configure Alerts
//             </button>
//           </div>
//         )}
//       </div>

//       {showConfigSidebar && (
//         <div className='fixed inset-y-0 right-0 w-80 bg-white shadow-2xl p-6 z-50 transform transition-transform duration-300'>
//           <div className='flex justify-between items-center mb-4'>
//             <h2 className='text-lg font-semibold text-gray-800'>Alert Configuration</h2>
//             <button
//               onClick={() => setShowConfigSidebar(false)}
//               className='text-gray-500 hover:text-gray-700'
//             >
//               <X size={20} />
//             </button>
//           </div>
//           <div className='flex flex-col gap-4'>
//             <div>
//               <label className='block text-sm font-medium text-gray-700'>
//                 Minimum Days Overdue
//               </label>
//               <input
//                 type='number'
//                 min='0'
//                 value={minDays}
//                 onChange={(e) => setMinDays(e.target.value)}
//                 onKeyDown={(e) => {
//                   const allowedKeys = [
//                     'Backspace',
//                     'Delete',
//                     'ArrowLeft',
//                     'ArrowRight',
//                     'Tab',
//                     'Enter',
//                   ];
//                   if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
//                     e.preventDefault();
//                   }
//                 }}
//                 className='mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50'
//                 placeholder='Enter minimum days'
//               />
//             </div>
//             <div>
//               <label className='block text-sm font-medium text-gray-700'>
//                 Minimum Progress (%)
//               </label>
//               <input
//                 type='number'
//                 min='0'
//                 max='100'
//                 value={minProgress}
//                 onChange={(e) => setMinProgress(e.target.value)}
//                 onKeyDown={(e) => {
//                   const allowedKeys = [
//                     'Backspace',
//                     'Delete',
//                     'ArrowLeft',
//                     'ArrowRight',
//                     'Tab',
//                     'Enter',
//                   ];
//                   if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
//                     e.preventDefault();
//                   }
//                 }}
//                 className='mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50'
//                 placeholder='Enter minimum progress percentage'
//               />
//             </div>
//             <button
//               onClick={handleConfigSubmit}
//               className='mt-4 w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white px-3 py-2 rounded-lg hover:from-blue-700 hover:to-blue-900 transition-all transform hover:scale-105 shadow-md'
//             >
//               Save
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default AlertSettings;


// import React, { useState } from 'react';
// import { MoreVertical, X } from 'lucide-react';
// import { Tooltip as ReactTooltip } from 'react-tooltip';
// import { useUpdateMutation } from '../../../services/systemConfigurationApi';
// import type { SystemConfiguration } from '../../../services/systemConfigurationApi';

// interface AlertSettingsProps {
//   minDaysConfig: { data?: SystemConfiguration | null | undefined } | undefined;
//   minProgressConfig: { data?: SystemConfiguration | null | undefined } | undefined;
//   minDays: string;
//   setMinDays: (value: string) => void;
//   minProgress: string;
//   setMinProgress: (value: string) => void;
//   updateConfig: ReturnType<typeof useUpdateMutation>[0];
// }

// const AlertSettings: React.FC<AlertSettingsProps> = ({
//   minDaysConfig,
//   minProgressConfig,
//   minDays,
//   setMinDays,
//   minProgress,
//   setMinProgress,
//   updateConfig,
// }) => {
//   const [showConfigSidebar, setShowConfigSidebar] = useState(false);
//   const [showMenu, setShowMenu] = useState(false);
//   const [minDaysError, setMinDaysError] = useState<string | null>(null);
//   const [minProgressError, setMinProgressError] = useState<string | null>(null);

//   const handleConfigSubmit = async () => {
//     try {
//       if (minDaysConfig?.data?.id) {
//         await updateConfig({
//           id: minDaysConfig.data.id,
//           request: {
//             configKey: 'minimum_days_for_alert',
//             valueConfig: minDays,
//             description: 'Minimum days overdue to trigger alert',
//             effectedFrom: new Date().toISOString(),
//           },
//         }).unwrap();
//       }
//       if (minProgressConfig?.data?.id) {
//         await updateConfig({
//           id: minProgressConfig.data.id,
//           request: {
//             configKey: 'minimum_progress_for_alert',
//             valueConfig: minProgress,
//             description: 'Minimum progress percentage to trigger alert',
//             effectedFrom: new Date().toISOString(),
//           },
//         }).unwrap();
//       }
//       setShowConfigSidebar(false);
//     } catch (error) {
//       console.error('❌ Error updating configuration:', error);
//     }
//   };

//   const validateMinDays = (value: string) => {
//     if (!/^\d*$/.test(value)) {
//       setMinDaysError('Only numeric values are allowed.');
//       return false;
//     }
//     if (value && parseInt(value) < 0) {
//       setMinDaysError('Value cannot be negative.');
//       return false;
//     }
//     setMinDaysError(null);
//     return true;
//   };

//   const validateMinProgress = (value: string) => {
//     const numValue = parseInt(value);
//     if (value && numValue < 0) {
//       setMinProgressError('Value cannot be negative.');
//       return false;
//     }
//     if (value && numValue > 100) {
//       setMinProgressError('Value cannot exceed 100.');
//       return false;
//     }
//     setMinProgressError(null);
//     return true;
//   };

//   const handleMinDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     validateMinDays(value);
//     setMinDays(value);
//   };

//   const handleMinProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const value = e.target.value;
//     validateMinProgress(value);
//     setMinProgress(value);
//   };

//   const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
//     const allowedKeys = [
//       'Backspace',
//       'Delete',
//       'ArrowLeft',
//       'ArrowRight',
//       'Tab',
//       'Enter',
//       '.',
//     ];
//     if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
//       e.preventDefault();
//       const inputName = e.currentTarget.name;
//       if (inputName === 'minDays') {
//         setMinDaysError('Only numeric values are allowed.');
//       } else if (inputName === 'minProgress') {
//         setMinProgressError('Only numeric values are allowed.');
//       }
//     }
//   };

//   return (
//     <>
//       <div className="absolute top-0 right-0">
//         <button
//           onClick={() => setShowMenu(!showMenu)}
//           className="p-2 rounded-full hover:bg-gray-100 transition-colors"
//           data-tooltip-id="settings-tooltip"
//           data-tooltip-content="Settings"
//         >
//           <MoreVertical size={20} className="text-gray-600" />
//           <ReactTooltip id="settings-tooltip" />
//         </button>
//         {showMenu && (
//           <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
//             <button
//               onClick={() => {
//                 setShowConfigSidebar(true);
//                 setShowMenu(false);
//               }}
//               className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
//             >
//               Configure Alerts
//             </button>
//           </div>
//         )}
//       </div>

//       {showConfigSidebar && (
//         <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl p-6 z-50 transform transition-transform duration-300">
//           <div className="flex justify-between items-center mb-4">
//             <h2 className="text-lg font-semibold text-gray-800">Alert Configuration</h2>
//             <button
//               onClick={() => {
//                 setShowConfigSidebar(false);
//                 setMinDaysError(null);
//                 setMinProgressError(null);
//               }}
//               className="text-gray-500 hover:text-gray-700"
//             >
//               <X size={20} />
//             </button>
//           </div>
//           <div className="flex flex-col gap-4">
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Minimum Days Overdue
//               </label>
//               <input
//                 type="number"
//                 name="minDays"
//                 min="0"
//                 value={minDays}
//                 onChange={handleMinDaysChange}
//                 onKeyDown={handleKeyDown}
//                 className={`mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${
//                   minDaysError ? 'border-red-500' : ''
//                 }`}
//                 placeholder="Enter minimum days"
//               />
//               {minDaysError && (
//                 <p className="mt-1 text-sm text-red-500">{minDaysError}</p>
//               )}
//             </div>
//             <div>
//               <label className="block text-sm font-medium text-gray-700">
//                 Minimum Progress (%)
//               </label>
//               <input
//                 type="number"
//                 name="minProgress"
//                 min="0"
//                 step="0.5"
//                 max="100"
//                 value={minProgress}
//                 onChange={handleMinProgressChange}
//                 onKeyDown={handleKeyDown}
//                 className={`mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${
//                   minProgressError ? 'border-red-500' : ''
//                 }`}
//                 placeholder="Enter minimum progress percentage"
//               />
//               {minProgressError && (
//                 <p className="mt-1 text-sm text-red-500">{minProgressError}</p>
//               )}
//             </div>
//             <button
//               onClick={handleConfigSubmit}
//               disabled={!!minDaysError || !!minProgressError}
//               className={`mt-4 w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white px-3 py-2 rounded-lg transition-all transform hover:scale-105 shadow-md ${
//                 minDaysError || minProgressError
//                   ? 'opacity-50 cursor-not-allowed'
//                   : 'hover:from-blue-700 hover:to-blue-900'
//               }`}
//             >
//               Save
//             </button>
//           </div>
//         </div>
//       )}
//     </>
//   );
// };

// export default AlertSettings;


import React, { useState } from 'react';
import { MoreVertical, X } from 'lucide-react';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import { useUpdateMutation } from '../../../services/systemConfigurationApi';
import type { SystemConfiguration } from '../../../services/systemConfigurationApi';

interface AlertSettingsProps {
  minDaysConfig: { data?: SystemConfiguration | null | undefined } | undefined;
  minProgressConfig: { data?: SystemConfiguration | null | undefined } | undefined;
  cpiWarningConfig: { data?: SystemConfiguration | null | undefined } | undefined;
  spiWarningConfig: { data?: SystemConfiguration | null | undefined } | undefined;
  minDays: string;
  setMinDays: (value: string) => void;
  minProgress: string;
  setMinProgress: (value: string) => void;
  cpiWarning: string;
  setCpiWarning: (value: string) => void;
  spiWarning: string;
  setSpiWarning: (value: string) => void;
  updateConfig: ReturnType<typeof useUpdateMutation>[0];
}

const AlertSettings: React.FC<AlertSettingsProps> = ({
  minDaysConfig,
  minProgressConfig,
  cpiWarningConfig,
  spiWarningConfig,
  minDays,
  setMinDays,
  minProgress,
  setMinProgress,
  cpiWarning,
  setCpiWarning,
  spiWarning,
  setSpiWarning,
  updateConfig,
}) => {
  const [showConfigSidebar, setShowConfigSidebar] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [minDaysError, setMinDaysError] = useState<string | null>(null);
  const [minProgressError, setMinProgressError] = useState<string | null>(null);
  const [cpiWarningError, setCpiWarningError] = useState<string | null>(null);
  const [spiWarningError, setSpiWarningError] = useState<string | null>(null);

  const handleConfigSubmit = async () => {
    try {
      if (minDaysConfig?.data?.id) {
        await updateConfig({
          id: minDaysConfig.data.id,
          request: {
            configKey: 'minimum_days_for_alert',
            valueConfig: minDays,
            description: 'Minimum days overdue to trigger alert',
            effectedFrom: new Date().toISOString(),
          },
        }).unwrap();
      }
      if (minProgressConfig?.data?.id) {
        await updateConfig({
          id: minProgressConfig.data.id,
          request: {
            configKey: 'minimum_progress_for_alert',
            valueConfig: minProgress,
            description: 'Minimum progress percentage to trigger alert',
            effectedFrom: new Date().toISOString(),
          },
        }).unwrap();
      }
      if (cpiWarningConfig?.data?.id) {
        await updateConfig({
          id: cpiWarningConfig.data.id,
          request: {
            configKey: 'cpi_warning_threshold',
            valueConfig: cpiWarning,
            description: 'Cost Performance Index threshold to trigger alert',
            effectedFrom: new Date().toISOString(),
          },
        }).unwrap();
      }
      if (spiWarningConfig?.data?.id) {
        await updateConfig({
          id: spiWarningConfig.data.id,
          request: {
            configKey: 'spi_warning_threshold',
            valueConfig: spiWarning,
            description: 'Schedule Performance Index threshold to trigger alert',
            effectedFrom: new Date().toISOString(),
          },
        }).unwrap();
      }
      setShowConfigSidebar(false);
    } catch (error) {
      console.error('❌ Error updating configuration:', error);
    }
  };

  const validateMinDays = (value: string) => {
    if (!/^\d*$/.test(value)) {
      setMinDaysError('Only numeric values are allowed.');
      return false;
    }
    if (value && parseInt(value) < 0) {
      setMinDaysError('Value cannot be negative.');
      return false;
    }
    setMinDaysError(null);
    return true;
  };

  const validateMinProgress = (value: string) => {
    const numValue = parseFloat(value);
    if (!/^\d*\.?\d*$/.test(value)) {
      setMinProgressError('Only numeric values are allowed.');
      return false;
    }
    if (value && numValue < 0) {
      setMinProgressError('Value cannot be negative.');
      return false;
    }
    if (value && numValue > 100) {
      setMinProgressError('Value cannot exceed 100.');
      return false;
    }
    setMinProgressError(null);
    return true;
  };

  const validateCpiWarning = (value: string) => {
    const numValue = parseFloat(value);
    if (!/^\d*\.?\d*$/.test(value)) {
      setCpiWarningError('Only numeric values are allowed.');
      return false;
    }
    if (value && numValue < 0) {
      setCpiWarningError('Value cannot be negative.');
      return false;
    }
    if (value && numValue > 2) {
      setCpiWarningError('Value cannot exceed 2.');
      return false;
    }
    setCpiWarningError(null);
    return true;
  };

  const validateSpiWarning = (value: string) => {
    const numValue = parseFloat(value);
    if (!/^\d*\.?\d*$/.test(value)) {
      setSpiWarningError('Only numeric values are allowed.');
      return false;
    }
    if (value && numValue < 0) {
      setSpiWarningError('Value cannot be negative.');
      return false;
    }
    if (value && numValue > 2) {
      setSpiWarningError('Value cannot exceed 2.');
      return false;
    }
    setSpiWarningError(null);
    return true;
  };

  const handleMinDaysChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    validateMinDays(value);
    setMinDays(value);
  };

  const handleMinProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    validateMinProgress(value);
    setMinProgress(value);
  };

  const handleCpiWarningChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    validateCpiWarning(value);
    setCpiWarning(value);
  };

  const handleSpiWarningChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    validateSpiWarning(value);
    setSpiWarning(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      'Backspace',
      'Delete',
      'ArrowLeft',
      'ArrowRight',
      'Tab',
      'Enter',
      '.',
    ];
    if (!allowedKeys.includes(e.key) && !/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      const inputName = e.currentTarget.name;
      if (inputName === 'minDays') {
        setMinDaysError('Only numeric values are allowed.');
      } else if (inputName === 'minProgress') {
        setMinProgressError('Only numeric values are allowed.');
      } else if (inputName === 'cpiWarning') {
        setCpiWarningError('Only numeric values are allowed.');
      } else if (inputName === 'spiWarning') {
        setSpiWarningError('Only numeric values are allowed.');
      }
    }
  };

  return (
    <>
      <div className="absolute top-0 right-0">
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          data-tooltip-id="settings-tooltip"
          data-tooltip-content="Settings"
        >
          <MoreVertical size={20} className="text-gray-600" />
          <ReactTooltip id="settings-tooltip" />
        </button>
        {showMenu && (
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg z-10">
            <button
              onClick={() => {
                setShowConfigSidebar(true);
                setShowMenu(false);
              }}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-colors"
            >
              Configure Alerts
            </button>
          </div>
        )}
      </div>

      {showConfigSidebar && (
        <div className="fixed inset-y-0 right-0 w-80 bg-white shadow-2xl p-6 z-50 transform transition-transform duration-300">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-gray-800">Alert Configuration</h2>
            <button
              onClick={() => {
                setShowConfigSidebar(false);
                setMinDaysError(null);
                setMinProgressError(null);
                setCpiWarningError(null);
                setSpiWarningError(null);
              }}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={20} />
            </button>
          </div>
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Minimum Days Overdue
              </label>
              <input
                type="number"
                name="minDays"
                min="0"
                value={minDays}
                onChange={handleMinDaysChange}
                onKeyDown={handleKeyDown}
                className={`mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${
                  minDaysError ? 'border-red-500' : ''
                }`}
                placeholder="Enter minimum days"
              />
              {minDaysError && (
                <p className="mt-1 text-sm text-red-500">{minDaysError}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Minimum Progress (%)
              </label>
              <input
                type="number"
                name="minProgress"
                min="0"
                max="100"
                step="0.5"
                value={minProgress}
                onChange={handleMinProgressChange}
                onKeyDown={handleKeyDown}
                className={`mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${
                  minProgressError ? 'border-red-500' : ''
                }`}
                placeholder="Enter minimum progress percentage"
              />
              {minProgressError && (
                <p className="mt-1 text-sm text-red-500">{minProgressError}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                CPI Warning Threshold
              </label>
              <input
                type="number"
                name="cpiWarning"
                min="0"
                max="1"
                step="0.1"
                value={cpiWarning}
                onChange={handleCpiWarningChange}
                onKeyDown={handleKeyDown}
                className={`mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${
                  cpiWarningError ? 'border-red-500' : ''
                }`}
                placeholder="Enter CPI threshold (e.g., 0.95)"
              />
              {cpiWarningError && (
                <p className="mt-1 text-sm text-red-500">{cpiWarningError}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                SPI Warning Threshold
              </label>
              <input
                type="number"
                name="spiWarning"
                min="0"
                max="1"
                step="0.1"
                value={spiWarning}
                onChange={handleSpiWarningChange}
                onKeyDown={handleKeyDown}
                className={`mt-1 p-2 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50 ${
                  spiWarningError ? 'border-red-500' : ''
                }`}
                placeholder="Enter SPI threshold (e.g., 0.95)"
              />
              {spiWarningError && (
                <p className="mt-1 text-sm text-red-500">{spiWarningError}</p>
              )}
            </div>
            <button
              onClick={handleConfigSubmit}
              disabled={!!minDaysError || !!minProgressError || !!cpiWarningError || !!spiWarningError}
              className={`mt-4 w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white px-3 py-2 rounded-lg transition-all transform hover:scale-105 shadow-md ${
                minDaysError || minProgressError || cpiWarningError || spiWarningError
                  ? 'opacity-50 cursor-not-allowed'
                  : 'hover:from-blue-700 hover:to-blue-900'
              }`}
            >
              Save
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default AlertSettings;