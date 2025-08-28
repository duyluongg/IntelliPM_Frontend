import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, parseISO } from 'date-fns';
import { useUpdateMutation } from '../../../services/systemConfigurationApi';
import { type SystemConfiguration, type SystemConfigurationRequest } from '../../../services/systemConfigurationApi';

interface DetailUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: SystemConfiguration | null;
}

const DetailUpdateModal: React.FC<DetailUpdateModalProps> = ({ isOpen, onClose, config }) => {
  const [updateConfig] = useUpdateMutation();
  const [formData, setFormData] = useState<SystemConfigurationRequest | null>(null);

  useEffect(() => {
    if (config) {
      // Format dates to match datetime-local input (YYYY-MM-DDTHH:mm)
      const formatDateForInput = (dateString: string | null | undefined): string => {
        if (!dateString) return '';
        try {
          const date = parseISO(dateString);
          return format(date, "yyyy-MM-dd'T'HH:mm");
        } catch {
          return '';
        }
      };

      setFormData({
        configKey: config.configKey,
        valueConfig: config.valueConfig,
        minValue: config.minValue,
        maxValue: config.maxValue,
        estimateValue: config.estimateValue,
        description: config.description,
        note: config.note,
        effectedFrom: formatDateForInput(config.effectedFrom),
        effectedTo: formatDateForInput(config.effectedTo),
      });
    }
  }, [config]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!config || !formData) return;
    try {
      // Ensure dates are sent in the correct format to the backend
      const formattedFormData = {
        ...formData,
        effectedFrom: formData.effectedFrom ? new Date(formData.effectedFrom).toISOString() : '',
        effectedTo: formData.effectedTo ? new Date(formData.effectedTo).toISOString() : null,
      };
      await updateConfig({ id: config.id, request: formattedFormData }).unwrap();
      alert('Configuration updated successfully');
      onClose();
    } catch (err) {
      alert('Failed to update configuration');
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value === '' ? null : value } : prev));
  };

  if (!isOpen || !config || !formData) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="bg-white p-6 rounded-lg shadow-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto relative"
      >
        {/* Close X button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
          type="button"
        >
          ×
        </button>
        <h2 className="text-xl font-semibold mb-4 text-gray-800 pr-8">Update Configuration</h2>
        <form onSubmit={handleSubmit}>
          {/* Row 1: Config Key & Value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Config Key</label>
              <input
                type="text"
                name="configKey"
                value={formData.configKey || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Value</label>
              <input
                type="text"
                name="valueConfig"
                value={formData.valueConfig || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
            </div>
          </div>

          {/* Row 2: Min, Max, Estimate Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Value</label>
              <input
                type="text"
                name="minValue"
                value={formData.minValue || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Value</label>
              <input
                type="text"
                name="maxValue"
                value={formData.maxValue || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimate Value</label>
              <input
                type="text"
                name="estimateValue"
                value={formData.estimateValue || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Row 3: Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Effected From</label>
              <input
                type="datetime-local"
                name="effectedFrom"
                value={formData.effectedFrom || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Effected To</label>
              <input
                type="datetime-local"
                name="effectedTo"
                value={formData.effectedTo || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Row 4: Description & Note */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                rows={4}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Note</label>
              <textarea
                name="note"
                value={formData.note || ''}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                rows={4}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition-colors text-sm"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm"
            >
              Update
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default DetailUpdateModal;