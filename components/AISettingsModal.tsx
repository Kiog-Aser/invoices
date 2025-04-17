"use client";

import React, { useState, useEffect } from 'react';
import { FaTimes, FaPlus, FaTrash, FaSyncAlt } from 'react-icons/fa';
import { toast } from 'react-hot-toast'; // Import toast for feedback

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
  onSave: (configs: AIProviderConfig[]) => Promise<void>; 
  initialConfigs?: AIProviderConfig[]; 
}

// State for individual test status
type TestStatus = 'idle' | 'testing' | 'success' | 'error';

const AISettingsModal: React.FC<AISettingsModalProps> = ({ isOpen, onClose, onSave, initialConfigs = [] }) => {
  const [configs, setConfigs] = useState<AIProviderConfig[]>(initialConfigs);
  const [isLoading, setIsLoading] = useState(false);
  const [testStatuses, setTestStatuses] = useState<Record<string, TestStatus>>({}); // Store test status per config ID
  const [testMessages, setTestMessages] = useState<Record<string, string>>({}); // Store test messages per config ID

  useEffect(() => {
    // Ensure unique IDs when loading initial configs
    const initialisedConfigs = initialConfigs.map(config => ({
       ...config,
       id: config.id || `${Date.now()}-${Math.random()}`
     }));
    setConfigs(initialisedConfigs);
    // Initialize test statuses for loaded configs
    const initialStatuses: Record<string, TestStatus> = {};
    initialisedConfigs.forEach(c => initialStatuses[c.id] = 'idle');
    setTestStatuses(initialStatuses);
    setTestMessages({}); // Clear old messages
  }, [initialConfigs, isOpen]); // Also reset when modal opens


  const handleAddConfig = () => {
    const newId = `${Date.now()}-${Math.random()}`;
    setConfigs([...configs, { id: newId, name: '', endpoint: '', models: '', apiKey: '' }]);
    // Add test status for the new config
    setTestStatuses(prev => ({ ...prev, [newId]: 'idle' }));
    setTestMessages(prev => ({ ...prev, [newId]: '' }));
  };

  const handleRemoveConfig = (id: string) => {
    setConfigs(configs.filter(config => config.id !== id));
    // Remove test status for the removed config
    setTestStatuses(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
    setTestMessages(prev => {
      const { [id]: _, ...rest } = prev;
      return rest;
    });
  };

  const handleConfigChange = (id: string, field: keyof Omit<AIProviderConfig, 'id'>, value: string) => {
    setConfigs(configs.map(config => config.id === id ? { ...config, [field]: value } : config));
    // Reset test status if config changes
    setTestStatuses(prev => ({ ...prev, [id]: 'idle' }));
    setTestMessages(prev => ({ ...prev, [id]: '' }));
  };

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      await onSave(configs);
      // onClose(); // Keep modal open on success or let parent decide
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
            return (
              <div key={config.id} className="p-4 border border-base-300 rounded-lg relative">
                <button
                  className="btn btn-xs btn-error btn-circle absolute -top-2 -right-2"
                  onClick={() => handleRemoveConfig(config.id)}
                  disabled={isLoading || status === 'testing'}
                  aria-label="Remove Provider"
                >
                  <FaTrash size={10} />
                </button>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Provider Name</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., My OpenAI"
                      className="input input-bordered w-full"
                      value={config.name}
                      onChange={(e) => handleConfigChange(config.id, 'name', e.target.value)}
                      disabled={isLoading || status === 'testing'}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Models (comma-separated)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g., gpt-4, gpt-3.5-turbo"
                      className="input input-bordered w-full"
                      value={config.models}
                      onChange={(e) => handleConfigChange(config.id, 'models', e.target.value)}
                      disabled={isLoading || status === 'testing'}
                    />
                  </div>
                  <div className="form-control md:col-span-2">
                    <label className="label">
                      <span className="label-text">API Endpoint URL</span>
                    </label>
                    <input
                      type="url"
                      placeholder="https://api.openai.com/v1"
                      className="input input-bordered w-full"
                      value={config.endpoint}
                      onChange={(e) => handleConfigChange(config.id, 'endpoint', e.target.value)}
                      disabled={isLoading || status === 'testing'}
                    />
                  </div>
                  <div className="form-control md:col-span-2">
                    <label className="label">
                      <span className="label-text">API Key</span>
                    </label>
                    <input
                      type="password"
                      placeholder="Enter your API key"
                      className="input input-bordered w-full"
                      value={config.apiKey}
                      onChange={(e) => handleConfigChange(config.id, 'apiKey', e.target.value)}
                      disabled={isLoading || status === 'testing'}
                    />
                  </div>
                </div>
                {/* Test Connection Button and Status */}
                <div className="mt-3 flex items-center gap-3">
                  <button
                    className={`btn btn-xs btn-outline ${status === 'testing' ? 'loading' : ''}`}
                    onClick={() => handleTestConnection(config.id)}
                    disabled={isLoading || status === 'testing'}
                  >
                    {status === 'testing' ? 'Testing...' : <><FaSyncAlt className="mr-1" /> Test</>}
                  </button>
                  {status !== 'idle' && (
                    <span
                      className={`text-xs ${status === 'success' ? 'text-success' : status === 'error' ? 'text-error' : 'text-base-content/60'}`}
                    >
                      {status === 'success' ? `✅ ${message}` : status === 'error' ? `❌ ${message}` : ''} 
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <button className="btn btn-ghost btn-sm mt-4" onClick={handleAddConfig} disabled={isLoading}>
          <FaPlus className="mr-2" /> Add Provider
        </button>

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
