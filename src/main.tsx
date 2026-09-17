import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import { applyAppearanceSettings } from './appearance';
import { PROGRESS_V2_STORAGE_KEY } from './progress/progress';
import './styles.css';

const root = document.getElementById('root');
if (!root) throw new Error('Application root is unavailable.');
try {
  const rawProgress = localStorage.getItem(PROGRESS_V2_STORAGE_KEY);
  const savedSettings = rawProgress === null ? undefined : JSON.parse(rawProgress).settings;
  applyAppearanceSettings(savedSettings ?? { theme: 'dark' }, Boolean(savedSettings?.reducedMotion));
} catch {
  applyAppearanceSettings({ theme: 'dark' });
}
ReactDOM.createRoot(root).render(<React.StrictMode><App /></React.StrictMode>);
