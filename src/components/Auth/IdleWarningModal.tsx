import React, { useState, useEffect } from 'react';

interface IdleWarningModalProps {
  isOpen: boolean;
  onStay: () => void;
  onLogout: () => void;
}

const WARNING_SECONDS = 30;

export const IdleWarningModal: React.FC<IdleWarningModalProps> = ({ isOpen, onStay, onLogout }) => {
  const [countdown, setCountdown] = useState(WARNING_SECONDS);

  useEffect(() => {
    if (isOpen) {
      setCountdown(WARNING_SECONDS);
      const interval = setInterval(() => {
        setCountdown(prev => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  if (!isOpen) {
    return null;
  }

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <h2>Vous êtes inactif</h2>
        <p>Vous allez être déconnecté dans {countdown} secondes.</p>
        <div style={styles.buttonContainer}>
          <button onClick={onLogout} style={styles.logoutButton}>Se déconnecter</button>
          <button onClick={onStay} style={styles.stayButton}>Rester connecté</button>
        </div>
      </div>
    </div>
  );
};

const styles: { [key: string]: React.CSSProperties } = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    padding: '2rem',
    borderRadius: '8px',
    textAlign: 'center',
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.2)',
  },
  buttonContainer: {
    marginTop: '1.5rem',
    display: 'flex',
    justifyContent: 'center',
    gap: '1rem',
  },
  logoutButton: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#f44336',
    color: 'white',
    cursor: 'pointer',
  },
  stayButton: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    borderRadius: '5px',
    backgroundColor: '#4caf50',
    color: 'white',
    cursor: 'pointer',
  },
};
