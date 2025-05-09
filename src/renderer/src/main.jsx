import './assets/main.css';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider, theme } from 'antd';

import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';

import App from './App';

loader.config({ monaco });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ConfigProvider
      theme={{
        algorithm: theme.darkAlgorithm,
      }}
    >
      <App />
    </ConfigProvider>
  </StrictMode>,
);
