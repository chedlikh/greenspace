import React from 'react';
import { useSelector } from 'react-redux';

const AuthDebugger = ({ visible = true }) => {
  const auth = useSelector((state) => state.auth);
  
  if (!visible) return null;
  
  return (
    <div 
      style={{
        position: 'fixed',
        bottom: '10px',
        right: '10px',
        background: '#f0f0f0',
        padding: '10px',
        borderRadius: '5px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        fontSize: '12px',
        zIndex: 9999,
        maxWidth: '300px',
        overflow: 'auto'
      }}
    >
      <h4>Auth Debug</h4>
      <pre style={{ margin: 0 }}>
        {JSON.stringify({
          token: auth.token ? '✅ Present' : '❌ Missing',
          isTokenValid: auth.isTokenValid,
          user: auth.user ? `✅ ${auth.user.username}` : '❌ Missing',
        }, null, 2)}
      </pre>
    </div>
  );
};

export default AuthDebugger;