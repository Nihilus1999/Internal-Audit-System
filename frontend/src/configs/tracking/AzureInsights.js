// src/configs/tracking/AzureInsights.jsx
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
import history from './History';

export const reactPlugin = new ReactPlugin();

export const appInsights = new ApplicationInsights({
  config: {
    instrumentationKey: import.meta.env.VITE_AZURE_APPINSIGHTS_KEY,
    extensions: [reactPlugin],
    extensionConfig: {
      [reactPlugin.identifier]: {
        history: history,
      },
    },
    enableAutoRouteTracking: false,
  },
});

appInsights.loadAppInsights();
