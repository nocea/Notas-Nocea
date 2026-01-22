'use client';

import React, { useState, useEffect } from 'react';
import { gitPush, gitPull, getGitConfig, setGitRemote } from '@/app/actions';
import { RefreshCw, Check, AlertCircle, Upload, Download, Settings, Save } from 'lucide-react';
import styles from './GitControls.module.css';

export default function GitControls() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [remoteUrl, setRemoteUrl] = useState('');
  const [showConfig, setShowConfig] = useState(false);

  useEffect(() => {
     checkConfig();
  }, []);

  const checkConfig = async () => {
    const config = await getGitConfig();
    setIsConfigured(config.configured);
    if (config.configured) {
        setRemoteUrl(config.remoteUrl);
        // Hide config if configured, unless manually opened? 
        // Logic: if not configured, show config.
    } else {
        setShowConfig(true);
    }
  };

  const handleSaveConfig = async () => {
      setStatus('loading');
      if (!remoteUrl) {
          setMessage('URL required');
          setStatus('error');
          return;
      }
      const result = await setGitRemote(remoteUrl);
      if (result.success) {
          setIsConfigured(true);
          setShowConfig(false);
          setStatus('success');
          setMessage('Remote set');
          setTimeout(() => setStatus('idle'), 2000);
      } else {
          setStatus('error');
          setMessage(result.error || 'Failed');
      }
  };

  const handleAction = async (action: 'push' | 'pull') => {
    setStatus('loading');
    setMessage('');
    
    const result = await (action === 'push' ? gitPush() : gitPull());
    
    if (result.success) {
      setStatus('success');
      setMessage(result.message || 'Done');
      setTimeout(() => setStatus('idle'), 3000);
    } else {
      setStatus('error');
      setMessage(result.error || 'Failed');
    }
  };

  if (showConfig) {
      return (
        <div className={styles.containerColumn}>
            <div className={styles.header}>
                <span>Git Configuration</span>
                {isConfigured && <button onClick={() => setShowConfig(false)} className={styles.iconBtn}><RefreshCw size={14}/></button>}
            </div>
            <input 
                className={styles.input}
                placeholder="https://github.com/user/repo.git"
                value={remoteUrl}
                onChange={(e) => setRemoteUrl(e.target.value)}
            />
            <button className={styles.button} onClick={handleSaveConfig} disabled={status === 'loading'}>
                <Save size={14} /> Save Remote
            </button>
            {status === 'error' && <div className={styles.errorMsg}>{message}</div>}
        </div>
      );
  }

  return (
    <div className={styles.container}>
      <div className={styles.row}>
        <button 
            className={styles.button} 
            onClick={() => handleAction('push')} 
            disabled={status === 'loading'}
            title="Commit & Push to Master"
        >
            <Upload size={14} />
            <span className={styles.text}>Push</span>
        </button>
        <button 
            className={styles.button} 
            onClick={() => handleAction('pull')} 
            disabled={status === 'loading'}
            title="Pull from Master"
        >
            <Download size={14} />
            <span className={styles.text}>Pull</span>
        </button>
        <button className={styles.iconBtn} onClick={() => setShowConfig(true)} title="Configure Git">
            <Settings size={14} />
        </button>
      </div>
      
      {status === 'loading' && <RefreshCw size={14} className={styles.spin} />}
      {status === 'success' && <Check size={14} className={styles.success} />}
      {status === 'error' && <div title={message}><AlertCircle size={14} className={styles.error} /></div>}
    </div>
  );
}
