"use client";

import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash, FaSyncAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast'; // Import toast for feedback
import AIProviderConfigItem from './AIProviderConfigItem'; // Import the new component

// Export the interface so it can be imported elsewhere
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

// State for individual test status
type TestStatus = 'idle' | 'testing' | 'success' | 'error';

const AISettingsModal: React.FC<AISettingsModalProps> = ({ isOpen, onClose, onSave, initialConfigs = [], initialDefaultModelId = 'default' }) => {
  const [configs, setConfigs] = useState<AIProviderConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testStatuses, setTestStatuses] = useState<Record<string, TestStatus>>({});
  const [testMessages, setTestMessages] = useState<Record<string, string>>({});
  const [defaultModelId, setDefaultModelId] = useState<string>(initialDefaultModelId);

  // Load initial configs and default model ID
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
    // If the removed config was the default, reset default to system default
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
      // Optionally show an error message to the user
    } finally {
      setIsLoading(false);
    }
  };

  // Function to test a specific connection
  const handleTestConnection = async (id: string) => {
    const configToTest = configs.find(c => c.id === id);
    if (!configToTest) return;

    // Basic validation before testing
    if (!configToTest.endpoint || !configToTest.apiKey || !configToTest.models) {
      setTestStatuses(prev => ({ ...prev, [id]: 'error' }));
      setTestMessages(prev => ({ ...prev, [id]: 'Endpoint, API Key, and at least one Model are required.' }));
      return;
    }

    // Use the first model listed for the test
    const modelToTest = configToTest.models.split(',')[0]?.trim();
    if (!modelToTest) {
        setTestStatuses(prev => ({ ...prev, [id]: 'error' }));
        setTestMessages(prev => ({ ...prev, [id]: 'No model specified for testing.' }));
        return;
    }

    setTestStatuses(prev => ({ ...prev, [id]: 'testing' }));
    setTestMessages(prev => ({ ...prev, [id]: '' })); // Clear previous message

    try {
      const response = await fetch('/api/ai/test-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: configToTest.endpoint,
          apiKey: configToTest.apiKey,
          model: modelToTest, // Send the specific model to test
        }),
      });

      let result;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        result = await response.json();
      } else {
        // Not JSON, likely an error page
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
      // Keep status as success/error, don't reset to idle immediately
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-3xl">
        <button
          className="btn btn-sm btn-circle absolute right-2 top-2"
          onClick={onClose}
          disabled={isLoading}
        >
          <FaTimes />
        </button>
        <h3 className="font-bold text-lg mb-4">AI Provider Settings</h3>

        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
          {configs.map((config) => {
            const status = testStatuses[config.id] || 'idle';
            const message = testMessages[config.id] || '';
            // Use the new component here
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

        <div className="modal-action mt-6">
          <button className="btn btn-ghost" onClick={onClose} disabled={isLoading}>Cancel</button>
          <button
            className={`btn btn-primary ${isLoading ? 'loading' : ''}`}
            onClick={handleSaveChanges}
            disabled={isLoading || configs.length === 0}
          >
            {isLoading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
       {/* Click outside to close */}
       <div className="modal-backdrop" onClick={isLoading ? undefined : onClose}></div>
    </div>
  );
};

export default AISettingsModal;
