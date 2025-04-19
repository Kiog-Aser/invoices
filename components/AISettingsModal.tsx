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
    } finally {
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
      <div className="relative w-full max-w-2xl mx-auto rounded-2xl bg-white shadow-2xl border border-base-300 p-0 flex flex-col"
        style={{ minHeight: 0, maxHeight: '90vh' }}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-base-200">
          <h3 className="font-bold text-lg font-mono text-blue-700">AI Provider Settings</h3>
          <button
            className="btn btn-sm btn-circle bg-base-200 hover:bg-base-300"
            onClick={onClose}
            disabled={isLoading}
          >
            <FaTimes />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-6 py-4" style={{ minHeight: 0 }}>
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
          <button className="btn btn-ghost btn-sm mt-4" onClick={handleAddConfig} disabled={isLoading}>
            <FaPlus className="mr-2" /> Add Provider
          </button>
          <div className="mt-6">
            <label className="label-text font-medium mb-1 block">Default model for new content</label>
            <select
              className="select select-bordered w-full"
              value={defaultModelId}
              onChange={e => setDefaultModelId(e.target.value)}
            >
              <option value="default">Default (system)</option>
              {configs.flatMap(cfg =>
                cfg.models.split(',').map(modelId => (
                  <option key={`${cfg.id}::${modelId.trim()}`} value={`${cfg.id}::${modelId.trim()}`}>{cfg.name} – {modelId.trim()}</option>
                ))
              )}
            </select>
          </div>
        </div>
        <div className="flex gap-2 justify-end px-6 py-4 border-t border-base-200 bg-base-100 rounded-b-2xl">
          <button className="btn btn-ghost" onClick={onClose} disabled={isLoading}>Cancel</button>
          <button
            className={`btn btn-primary ${isLoading ? 'loading' : ''} font-mono`}
            onClick={handleSaveChanges}
            disabled={isLoading || configs.length === 0}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AISettingsModal;
