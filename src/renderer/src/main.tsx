import './assets/main.css';

import { createRoot } from 'react-dom/client';
import { ConfigProvider, theme } from 'antd';

import * as monaco from 'monaco-editor';
import { loader } from '@monaco-editor/react';

import App from './App';

loader.config({ monaco });

createRoot(document.getElementById('root')).render(
  <ConfigProvider
    theme={{
      algorithm: theme.darkAlgorithm,
      components: {
        Tabs: {
          cardBg: '#040404',
          itemColor: '#dddddd',
          itemActiveColor: '#d0cfcf',
          itemSelectedColor: '#dddddd',
        },
      },
    }}
  >
    <App />
  </ConfigProvider>,
);
