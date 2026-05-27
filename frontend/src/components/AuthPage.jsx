import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { LogIn, UserPlus, AlertCircle } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { login, register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password || (!isLogin && !displayName)) {
      setError('Veuillez remplir tous les champs.');
      return;
    }

    setSubmitting(true);
    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, password, displayName);
      }
    } catch (err) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={styles.container}>
      {/* Animated gradient mesh background */}
      <div style={styles.meshBackground}></div>

      <div className="glass-panel animate-modal" style={styles.authCard}>
        {/* Brand Header */}
        <div style={styles.brandHeader}>
          <span style={styles.brandStan}>STAN</span>
          <span style={styles.brandRobotix}>ROBOTIX</span>
        </div>
        <p style={styles.brandSubtitle}>Plateforme Collaborative Kanban</p>

        {/* Tab Switcher */}
        <div style={styles.tabContainer}>
          <button
            onClick={() => { setIsLogin(true); setError(''); }}
            style={{
              ...styles.tabButton,
              borderBottom: isLogin ? '3px solid var(--brand-red)' : 'none',
              color: isLogin ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: isLogin ? '600' : '400'
            }}
          >
            Se Connecter
          </button>
          <button
            onClick={() => { setIsLogin(false); setError(''); }}
            style={{
              ...styles.tabButton,
              borderBottom: !isLogin ? '3px solid var(--brand-red)' : 'none',
              color: !isLogin ? 'var(--text-main)' : 'var(--text-muted)',
              fontWeight: !isLogin ? '600' : '400'
            }}
          >
            S'enregistrer
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="animate-fade" style={styles.errorBox}>
            <AlertCircle size={18} style={{ minWidth: 18 }} />
            <span>{error}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} style={styles.form}>
          {!isLogin && (
            <div className="animate-fade" style={styles.formGroup}>
              <label style={styles.label}>Nom complet / Affiché</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="ex. Jean Dupont"
                style={styles.input}
                disabled={submitting}
              />
            </div>
          )}

          <div style={styles.formGroup}>
            <label style={styles.label}>Nom d'utilisateur</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value.toLowerCase())}
              placeholder="ex. jdupont"
              style={styles.input}
              disabled={submitting}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={styles.input}
              disabled={submitting}
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={styles.submitBtn}
            disabled={submitting}
          >
            {submitting ? 'Veuillez patienter...' : isLogin ? (
              <>
                <LogIn size={18} /> Accéder au tableau
              </>
            ) : (
              <>
                <UserPlus size={18} /> Créer mon compte
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

const styles = {
  container: {
    height: '100vh',
    width: '100vw',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#090d16'
  },
  meshBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1,
    background: 'radial-gradient(circle at 10% 20%, rgba(207, 39, 55, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(30, 41, 59, 0.4) 0%, transparent 55%)',
    filter: 'blur(30px)'
  },
  authCard: {
    width: '100%',
    maxWidth: '440px',
    padding: '2.5rem',
    borderRadius: 'var(--border-radius-lg)',
    boxShadow: 'var(--shadow-premium)',
    zIndex: 10,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  brandHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.2rem',
    fontSize: '2.2rem',
    letterSpacing: '-0.5px',
    fontFamily: 'var(--font-family-display)'
  },
  brandStan: {
    color: '#94a3b8',
    fontWeight: '800'
  },
  brandRobotix: {
    color: 'var(--brand-red)',
    backgroundColor: 'var(--brand-red-alpha-10)',
    padding: '4px 14px',
    borderRadius: '9999px',
    fontWeight: '800',
    border: '1px solid var(--brand-red)'
  },
  brandSubtitle: {
    fontSize: '0.875rem',
    color: 'var(--text-muted)',
    marginTop: '0.5rem',
    marginBottom: '2rem'
  },
  tabContainer: {
    display: 'flex',
    width: '100%',
    marginBottom: '1.5rem',
    borderBottom: '1px solid var(--border-color)'
  },
  tabButton: {
    flex: 1,
    paddingBottom: '12px',
    fontSize: '1rem',
    textAlign: 'center',
    background: 'none',
    border: 'none',
    transition: 'all var(--transition-fast)'
  },
  errorBox: {
    width: '100%',
    backgroundColor: 'rgba(207, 39, 55, 0.1)',
    color: 'var(--brand-red)',
    border: '1px solid rgba(207, 39, 55, 0.2)',
    padding: '10px 14px',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.875rem',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '1.5rem'
  },
  form: {
    width: '100%',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.25rem'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  label: {
    fontSize: '0.85rem',
    fontWeight: '500',
    color: 'var(--text-muted)'
  },
  input: {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    padding: '10px 14px',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.95rem',
    transition: 'all var(--transition-fast)'
  },
  submitBtn: {
    marginTop: '0.5rem',
    width: '100%',
    justifyContent: 'center',
    padding: '12px',
    fontSize: '1rem'
  }
};
