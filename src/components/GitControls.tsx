'use client';

import React, { useState } from 'react';
import { gitSync } from '@/app/actions';
import { RefreshCw, Check, AlertCircle } from 'lucide-react';
import styles from './GitControls.module.css';

export default function GitControls() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const handleSync = async () => {
    setStatus('loading');
    setMessage('');
    
    const result = await gitSync();
    
    if (result.success) {
      setStatus('success');
      setMessage(result.message || 'Synced');
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      setStatus('error');
      setMessage(result.error || 'Failed');
    }
  };

  return (
    <div className={styles.container}>
      <button 
        className={styles.button} 
        onClick={handleSync} 
        disabled={status === 'loading'}
        title="Sync with Git"
      >
        <RefreshCw size={16} className={status === 'loading' ? styles.spin : ''} />
        <span className={styles.text}>
            {status === 'loading' ? 'Syncing...' : 'Sync Git'}
        </span>
      </button>
      
      {status === 'success' && <Check size={16} className={styles.success} />}
      {status === 'error' && <div title={message}><AlertCircle size={16} className={styles.error} /></div>}
    </div>
  );
}
