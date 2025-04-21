"use client";

import React, { useState, useEffect } from 'react';
import { FaTrash, FaSyncAlt } from 'react-icons/fa';
import { type AIProviderConfig } from './AISettingsModal';

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
    <div className="p-5 border border-gray-200 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow relative">
      <button
        className="absolute -top-2 -right-2 bg-white text-red-500 hover:bg-red-100 hover:text-red-700 p-1 rounded-full shadow-md transition-colors"
        onClick={() => onRemoveConfig(config.id)}
        disabled={isLoading || status === 'testing'}
        aria-label="Remove Provider"
      >
        <FaTrash size={12} />
      </button>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Provider Name Input */}
        <div className="form-control">
          <label className="block text-sm font-medium text-gray-700 mb-1">Provider Name</label>
          <input
            type="text"
            placeholder="e.g., My OpenAI"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
            value={config.name}
            onChange={(e) => onConfigChange(config.id, 'name', e.target.value)}
            disabled={isLoading || status === 'testing'}
          />
        </div>

        {/* Models Input (Tag Style) */}
        <div className="form-control">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Models <span className="text-xs text-gray-500">(comma-separated)</span>
          </label>
          
          {/* Tag display area */}
          <div className="flex flex-wrap gap-2 mb-2">
            {models.map(model => (
              <span key={model} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {model}
                <button 
                  onClick={() => removeModel(model)} 
                  className="ml-1.5 text-blue-500 hover:text-blue-700" 
                  aria-label={`Remove ${model}`}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </span>
            ))}
          </div>
          
          {/* Model input field */}
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
            placeholder="Type model name and press Enter"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
            disabled={isLoading || status === 'testing'}
          />
        </div>

        {/* API Endpoint Input */}
        <div className="form-control md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">API Endpoint URL</label>
          <input
            type="url"
            placeholder="https://api.openai.com/v1"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
            value={config.endpoint}
            onChange={(e) => onConfigChange(config.id, 'endpoint', e.target.value)}
            disabled={isLoading || status === 'testing'}
          />
        </div>

        {/* API Key Input */}
        <div className="form-control md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">API Key</label>
          <input
            type="password"
            placeholder="Enter your API key"
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm transition-shadow"
            value={config.apiKey}
            onChange={(e) => onConfigChange(config.id, 'apiKey', e.target.value)}
            disabled={isLoading || status === 'testing'}
          />
        </div>
      </div>

      {/* Test Connection Button and Status */}
      <div className="mt-4 flex items-center gap-3">
        <button
          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md ${
            status === 'testing' 
              ? 'bg-blue-100 text-blue-700' 
              : 'text-blue-700 bg-blue-100 hover:bg-blue-200'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors`}
          onClick={() => onTestConnection(config.id)}
          disabled={isLoading || status === 'testing'}
        >
          {status === 'testing' ? (
            <>
              <svg className="animate-spin -ml-0.5 mr-2 h-3 w-3 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Testing...
            </>
          ) : (
            <>
              <FaSyncAlt className="mr-1.5 h-3 w-3" /> Test Connection
            </>
          )}
        </button>
        
        {status !== 'idle' && (
          <span className={`text-xs flex items-center ${
            status === 'success' 
              ? 'text-green-600' 
              : status === 'error' 
                ? 'text-red-600' 
                : 'text-gray-500'
          }`}>
            {status === 'success' && (
              <svg className="h-4 w-4 mr-1 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            )}
            {status === 'error' && (
              <svg className="h-4 w-4 mr-1 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            )}
            {message}
          </span>
        )}
      </div>
    </div>
  );
};

export default AIProviderConfigItem;

