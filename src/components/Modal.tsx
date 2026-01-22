'use client';

import React, { useState, useEffect, useRef } from 'react';
import styles from './Modal.module.css';
import { X } from 'lucide-react';

interface ModalProps {
  title: string;
  initialValue?: string;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (value: string) => void;
  placeholder?: string;
}

export default function Modal({ title, initialValue = '', isOpen, onClose, onConfirm, placeholder }: ModalProps) {
  const [value, setValue] = useState(initialValue);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, initialValue]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    onConfirm(value);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h3>{title}</h3>
          <button onClick={onClose} className={styles.closeBtn}><X size={16} /></button>
        </div>
        <form onSubmit={handleSubmit} className={styles.form}>
          <input
            ref={inputRef}
            className={styles.input}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder={placeholder}
          />
          <div className={styles.actions}>
            <button type="button" onClick={onClose} className={styles.cancelBtn}>Cancel</button>
            <button type="submit" className={styles.confirmBtn}>Confirm</button>
          </div>
        </form>
      </div>
    </div>
  );
}
