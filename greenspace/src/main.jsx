
import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { store } from './store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import App from './App';
import './assets/css/style.css';
import './assets/css/feather.css';
import './assets/css/themify-icons.css';
import { WebSocketProvider } from './features/WebSocketProvider';


const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      onSuccess: (data, query) => {
        console.log(`Query ${JSON.stringify(query.queryKey)} updated with data:`, data);
      },
      onError: (error, query) => {
        console.error(`Query ${JSON.stringify(query.queryKey)} failed:`, error);
      },
    },
  },
});
ReactDOM.createRoot(document.getElementById('root')).render(
  
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <WebSocketProvider>
        <App />
        </WebSocketProvider>
      </QueryClientProvider>
    </Provider>
  
);