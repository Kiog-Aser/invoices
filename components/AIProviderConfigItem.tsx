"use client";

import React, { useState, useEffect } from 'react';
import { FaTrash, FaSyncAlt } from 'react-icons/fa';
import { type AIProviderConfig } from './AISettingsModal'; // Assuming the type is exported

type TestStatus = 'idle' | 'testing' | 'success' | 'error';

interface AIProviderConfigItemProps {
  config: AIProviderConfig;
  status: TestStatus;
  message: string;
  isLoading: boolean;
  onConfigChange: (id: string, field: keyof Omit<AIProviderConfig, 'id'>, value: string) => void;
  onRemoveConfig: (id: string) => void;
  onTestConnection: (id: string) => void;
}

const AIProviderConfigItem: React.FC<AIProviderConfigItemProps> = ({
  config,
  status,
  message,
  isLoading,
  onConfigChange,
  onRemoveConfig,
  onTestConnection,
}) => {
  // Local state for models for this specific config item
  const [modelInput, setModelInput] = useState('');
  const [models, setModels] = useState<string[]>(
    config.models ? config.models.split(',').map(m => m.trim()).filter(Boolean) : []
  );

  // Sync local models state back to the parent config object via onConfigChange
  useEffect(() => {
    // Avoid infinite loops by checking if the value actually changed
    const newModelsString = models.join(', ');
    if (newModelsString !== config.models) {
      onConfigChange(config.id, 'models', newModelsString);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [models, config.id, onConfigChange]); // config.models is intentionally omitted to prevent loops

  // Update local models state if the initial config.models prop changes
  useEffect(() => {
    const initialModels = config.models ? config.models.split(',').map(m => m.trim()).filter(Boolean) : [];
    // Only update if the string representation differs to avoid unnecessary re-renders/loops
    if (initialModels.join(', ') !== models.join(', ')) {
        setModels(initialModels);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config.models]); // Only run when the initial config.models string changes


  const handleModelInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value.endsWith(',') || value.endsWith('\n')) {
      const newModel = value.replace(/,|\n/g, '').trim();
      if (newModel && !models.includes(newModel)) {
        setModels([...models, newModel]);
      }
      setModelInput('');
    } else {
      setModelInput(value);
    }
  };

  const removeModel = (model: string) => {
    setModels(models.filter(m => m !== model));
  };

  return (
    <div className="p-4 border border-base-300 rounded-lg relative">
      <button
        className="btn btn-xs btn-error btn-circle absolute -top-2 -right-2"
        onClick={() => onRemoveConfig(config.id)}
        disabled={isLoading || status === 'testing'}
        aria-label="Remove Provider"
      >
        <FaTrash size={10} />
      </button>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Provider Name Input */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Provider Name</span>
          </label>
          <input
            type="text"
            placeholder="e.g., My OpenAI"
            className="input input-bordered w-full"
            value={config.name}
            onChange={(e) => onConfigChange(config.id, 'name', e.target.value)}
            disabled={isLoading || status === 'testing'}
          />
        </div>

        {/* Models Input (Tag Style) */}
        <div className="form-control">
          <label className="label">
            <span className="label-text">Models (comma-separated, press Enter or comma to add)</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {models.map(model => (
              <span key={model} className="bg-base-200 px-2 py-1 rounded-full flex items-center text-sm">
                {model}
                <button onClick={() => removeModel(model)} className="ml-1 text-error text-lg leading-none" aria-label={`Remove ${model}`}>×</button>
              </span>
            ))}
          </div>
          <input
            value={modelInput}
            onChange={handleModelInput}
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ',') {
                e.preventDefault();
                const newModel = modelInput.replace(/,|\n/g, '').trim();
                if (newModel && !models.includes(newModel)) {
                  setModels([...models, newModel]);
                }
                setModelInput('');
              }
            }}
            placeholder="Type model and press Enter or comma"
            className="input input-bordered w-full"
            disabled={isLoading || status === 'testing'}
          />
        </div>

        {/* API Endpoint Input */}
        <div className="form-control md:col-span-2">
          <label className="label">
            <span className="label-text">API Endpoint URL</span>
          </label>
          <input
            type="url"
            placeholder="https://api.openai.com/v1"
            className="input input-bordered w-full"
            value={config.endpoint}
            onChange={(e) => onConfigChange(config.id, 'endpoint', e.target.value)}
            disabled={isLoading || status === 'testing'}
          />
        </div>

        {/* API Key Input */}
        <div className="form-control md:col-span-2">
          <label className="label">
            <span className="label-text">API Key</span>
          </label>
          <input
            type="password"
            placeholder="Enter your API key"
            className="input input-bordered w-full"
            value={config.apiKey}
            onChange={(e) => onConfigChange(config.id, 'apiKey', e.target.value)}
            disabled={isLoading || status === 'testing'}
          />
        </div>
      </div>

      {/* Test Connection Button and Status */}
      <div className="mt-3 flex items-center gap-3">
        <button
          className={`btn btn-xs btn-outline ${status === 'testing' ? 'loading' : ''}`}
          onClick={() => onTestConnection(config.id)}
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
};

export default AIProviderConfigItem;

