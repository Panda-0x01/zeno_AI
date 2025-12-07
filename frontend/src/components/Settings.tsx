import { useState } from 'react';
import { useAppStore } from '../store/appStore';
import { X, Moon, Sun } from 'lucide-react';
import './Settings.css';

export default function Settings() {
  const { settings, availableModels, theme, updateSettings, setTheme, setSettingsOpen } = useAppStore();
  const [localSettings, setLocalSettings] = useState(settings);

  const handleSave = () => {
    updateSettings(localSettings);
    setSettingsOpen(false);
  };

  const handleClose = () => {
    setSettingsOpen(false);
  };

  return (
    <div className="settings-overlay" onClick={handleClose}>
      <div className="settings-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-labelledby="settings-title">
        <div className="settings-header">
          <h2 id="settings-title">Settings</h2>
          <button className="close-button" onClick={handleClose} aria-label="Close settings">
            <X size={24} />
          </button>
        </div>

        <div className="settings-content">
          {/* Appearance */}
          <section className="settings-section">
            <h3>Appearance</h3>
            <div className="setting-item">
              <label htmlFor="theme">Theme</label>
              <div className="theme-toggle">
                <button
                  className={`theme-button ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                  aria-label="Light theme"
                >
                  <Sun size={18} />
                  <span>Light</span>
                </button>
                <button
                  className={`theme-button ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                  aria-label="Dark theme"
                >
                  <Moon size={18} />
                  <span>Dark</span>
                </button>
              </div>
            </div>
          </section>

          {/* Model Settings */}
          <section className="settings-section">
            <h3>Model</h3>
            <div className="setting-item">
              <label htmlFor="model">Active Model</label>
              <select
                id="model"
                value={localSettings.model}
                onChange={(e) => setLocalSettings({ ...localSettings, model: e.target.value })}
              >
                {availableModels.length === 0 ? (
                  <option value="">No models available</option>
                ) : (
                  availableModels.map((model) => (
                    <option key={model.name} value={model.name}>
                      {model.name}
                    </option>
                  ))
                )}
              </select>
              <small>Select the Ollama model to use for conversations</small>
            </div>

            <div className="setting-item">
              <label htmlFor="maxTokens">Max Context Tokens</label>
              <input
                id="maxTokens"
                type="number"
                min="512"
                max="32768"
                step="512"
                value={localSettings.maxTokens}
                onChange={(e) => setLocalSettings({ ...localSettings, maxTokens: parseInt(e.target.value) })}
              />
              <small>Maximum number of tokens to keep in context</small>
            </div>

            <div className="setting-item">
              <label htmlFor="temperature">Temperature: {localSettings.temperature}</label>
              <input
                id="temperature"
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={localSettings.temperature}
                onChange={(e) => setLocalSettings({ ...localSettings, temperature: parseFloat(e.target.value) })}
              />
              <small>Higher values make output more random (0-2)</small>
            </div>
          </section>

          {/* Voice Settings */}
          <section className="settings-section">
            <h3>Voice</h3>
            <div className="setting-item">
              <label htmlFor="sttEngine">Speech-to-Text Engine</label>
              <select
                id="sttEngine"
                value={localSettings.sttEngine}
                onChange={(e) => setLocalSettings({ ...localSettings, sttEngine: e.target.value as any })}
              >
                <option value="web">Web Speech API (Default)</option>
                <option value="whisper">Whisper (Offline)</option>
                <option value="vosk">VOSK (Lightweight)</option>
              </select>
            </div>

            <div className="setting-item">
              <label htmlFor="ttsEngine">Text-to-Speech Engine</label>
              <select
                id="ttsEngine"
                value={localSettings.ttsEngine}
                onChange={(e) => setLocalSettings({ ...localSettings, ttsEngine: e.target.value as any })}
              >
                <option value="web">Web Speech Synthesis (Default)</option>
                <option value="coqui">Coqui TTS (High Quality)</option>
                <option value="pyttsx3">pyttsx3 (Offline)</option>
              </select>
            </div>

            <div className="setting-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={localSettings.pushToTalk}
                  onChange={(e) => setLocalSettings({ ...localSettings, pushToTalk: e.target.checked })}
                />
                <span>Push-to-talk mode</span>
              </label>
              <small>Hold Space to record, release to send</small>
            </div>

            <div className="setting-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={localSettings.wakeWordEnabled}
                  onChange={(e) => setLocalSettings({ ...localSettings, wakeWordEnabled: e.target.checked })}
                />
                <span>Enable wake word</span>
              </label>
              {localSettings.wakeWordEnabled && (
                <input
                  type="text"
                  placeholder="Wake word (e.g., jarvis)"
                  value={localSettings.wakeWord}
                  onChange={(e) => setLocalSettings({ ...localSettings, wakeWord: e.target.value })}
                />
              )}
            </div>
          </section>

          {/* Security & Privacy */}
          <section className="settings-section">
            <h3>Security & Privacy</h3>
            <div className="setting-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={localSettings.encryptionEnabled}
                  onChange={(e) => setLocalSettings({ ...localSettings, encryptionEnabled: e.target.checked })}
                />
                <span>Encrypt chat history</span>
              </label>
              <small>Requires password on startup</small>
            </div>

            <div className="setting-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={localSettings.auditLogEnabled}
                  onChange={(e) => setLocalSettings({ ...localSettings, auditLogEnabled: e.target.checked })}
                />
                <span>Enable audit logging</span>
              </label>
              <small>Log all actions and commands</small>
            </div>

            <div className="setting-item">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={localSettings.requireConfirmation}
                  onChange={(e) => setLocalSettings({ ...localSettings, requireConfirmation: e.target.checked })}
                />
                <span>Require confirmation for actions</span>
              </label>
              <small>Prompt before executing system commands</small>
            </div>
          </section>
        </div>

        <div className="settings-footer">
          <button className="button secondary" onClick={handleClose}>
            Cancel
          </button>
          <button className="button primary" onClick={handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
