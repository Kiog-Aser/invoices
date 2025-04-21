"use client";

import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus } from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import AIProviderConfigItem from './AIProviderConfigItem';

export interface AIProviderConfig { 
  id: string; 
  name: string;
  endpoint: string;
  models: string; 
  apiKey: string;
}

interface AISettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (configs: { configs: AIProviderConfig[], defaultModelId: string }) => Promise<void>; 
  initialConfigs?: AIProviderConfig[]; 
  initialDefaultModelId?: string;
  defaultModelId?: string;
}

type TestStatus = 'idle' | 'testing' | 'success' | 'error';

const AISettingsModal: React.FC<AISettingsModalProps> = ({ isOpen, onClose, onSave, initialConfigs = [], initialDefaultModelId = 'default' }) => {
  const [configs, setConfigs] = useState<AIProviderConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testStatuses, setTestStatuses] = useState<Record<string, TestStatus>>({});
  const [testMessages, setTestMessages] = useState<Record<string, string>>({});
  const [defaultModelId, setDefaultModelId] = useState<string>(initialDefaultModelId);

  useEffect(() => {
    const initialisedConfigs = (initialConfigs || []).map(config => ({
       ...config,
       id: config.id || `${Date.now()}-${Math.random()}`
     }));
    setConfigs(initialisedConfigs);
    setDefaultModelId(initialDefaultModelId || 'default');

    const initialStatuses: Record<string, TestStatus> = {};
    initialisedConfigs.forEach(c => initialStatuses[c.id] = 'idle');
    setTestStatuses(initialStatuses);
    setTestMessages({});
  }, [initialConfigs, initialDefaultModelId, isOpen]);

  const handleAddConfig = () => {
    const newId = `${Date.now()}-${Math.random()}`;
    setConfigs([...configs, { id: newId, name: '', endpoint: '', models: '', apiKey: '' }]);
    setTestStatuses(prev => ({ ...prev, [newId]: 'idle' }));
    setTestMessages(prev => ({ ...prev, [newId]: '' }));
  };

  const handleRemoveConfig = (id: string) => {
    setConfigs(configs.filter(config => config.id !== id));
    setTestStatuses(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
    setTestMessages(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
    if (defaultModelId.startsWith(`${id}::`)) {
        setDefaultModelId('default');
    }
  };

  const handleConfigChange = (id: string, field: keyof Omit<AIProviderConfig, 'id'>, value: string) => {
    setConfigs(configs.map(config => config.id === id ? { ...config, [field]: value } : config));
    setTestStatuses(prev => ({ ...prev, [id]: 'idle' }));
    setTestMessages(prev => ({ ...prev, [id]: '' }));
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      await onSave({ configs, defaultModelId });
    } catch (error) {
      console.error("Failed to save AI settings:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestConnection = async (id: string) => {
    const configToTest = configs.find(c => c.id === id);
    if (!configToTest) return;

    if (!configToTest.endpoint || !configToTest.apiKey || !configToTest.models) {
      setTestStatuses(prev => ({ ...prev, [id]: 'error' }));
      setTestMessages(prev => ({ ...prev, [id]: 'Endpoint, API Key, and at least one Model are required.' }));
      return;
    }

    const modelToTest = configToTest.models.split(',')[0]?.trim();
    if (!modelToTest) {
        setTestStatuses(prev => ({ ...prev, [id]: 'error' }));
        setTestMessages(prev => ({ ...prev, [id]: 'No model specified for testing.' }));
        return;
    }

    setTestStatuses(prev => ({ ...prev, [id]: 'testing' }));
    setTestMessages(prev => ({ ...prev, [id]: '' }));

    try {
      const response = await fetch('/api/ai/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: configToTest.endpoint,
          apiKey: configToTest.apiKey,
          model: modelToTest,
        }),
      });

      let result;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        setTestStatuses(prev => ({ ...prev, [id]: 'error' }));
        setTestMessages(prev => ({ ...prev, [id]: 'Server error: Non-JSON response. Check API route and server logs.' }));
        toast.error(`Connection test for "${configToTest.name}" failed: Server error (non-JSON response)`);
        return;
      }

      if (response.ok && result.success) {
        setTestStatuses(prev => ({ ...prev, [id]: 'success' }));
        setTestMessages(prev => ({ ...prev, [id]: `Success! Response: "${result.response}"` }));
        toast.success(`Connection test for "${configToTest.name}" successful!`);
      } else {
        throw new Error(result.error || 'Connection test failed');
      }
    } catch (error: any) {
      console.error("Connection test failed:", error);
      setTestStatuses(prev => ({ ...prev, [id]: 'error' }));
      setTestMessages(prev => ({ ...prev, [id]: error.message || 'Connection test failed.' }));
      toast.error(`Connection test for "${configToTest.name}" failed: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-auto rounded-xl bg-white shadow-xl border border-gray-100 p-0 flex flex-col"
        style={{ minHeight: 0, maxHeight: '90vh' }}>
        {/* Header section with modern styling */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-lg text-blue-600 flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            AI Provider Settings
          </h3>
          <button
            className="btn btn-sm btn-ghost rounded-full w-8 h-8"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close"
          >
            <FaTimes />
          </button>
        </div>
        
        {/* Content area with scrollable list of providers */}
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ minHeight: 0 }}>
          {configs.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <svg xmlns="http://www.w3.org/2000/svg" className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
              </svg>
              <p className="mt-2 text-sm font-medium">No providers configured</p>
              <p className="text-xs mt-1">Add your first AI provider to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {configs.map((config) => {
                const status = testStatuses[config.id] || 'idle';
                const message = testMessages[config.id] || '';
                return (
                  <AIProviderConfigItem
                    key={config.id}
                    config={config}
                    status={status}
                    message={message}
                    isLoading={isLoading}
                    onConfigChange={handleConfigChange}
                    onRemoveConfig={handleRemoveConfig}
                    onTestConnection={handleTestConnection}
                  />
                );
              })}
            </div>
          )}
          
          {/* Add provider button with improved styling */}
          <button 
            className="mt-4 flex items-center gap-2 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            onClick={handleAddConfig} 
            disabled={isLoading}
          >
            <FaPlus className="text-xs" /> Add Provider
          </button>
          
          {/* Default model selector with improved styling */}
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Model for New Content</label>
            <div className="relative">
              <select
                className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg transition-shadow sm:text-sm"
                value={defaultModelId}
                onChange={e => setDefaultModelId(e.target.value)}
              >
                <option value="default">Default (system)</option>
                {configs.flatMap(cfg =>
                  cfg.models.split(',').map(modelId => (
                    <option key={`${cfg.id}::${modelId.trim()}`} value={`${cfg.id}::${modelId.trim()}`}>
                      {cfg.name} – {modelId.trim()}
                    </option>
                  ))
                )}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer with action buttons */}
        <div className="flex gap-2 justify-end px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-xl">
          <button 
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 border border-gray-300 rounded-lg transition-colors" 
            onClick={onClose} 
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className={`px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 border border-transparent rounded-lg transition-colors ${isLoading ? 'opacity-75 cursor-wait' : ''}`}
            onClick={handleSaveChanges}
            disabled={isLoading || configs.length === 0}
          >
            {isLoading ? (
              <span className="flex items-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </span>
            ) : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISettingsModal;
