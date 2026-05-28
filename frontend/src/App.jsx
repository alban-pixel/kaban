import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext.jsx';
import AuthPage from './components/AuthPage.jsx';
import Sidebar from './components/Sidebar.jsx';
import KanbanBoard from './components/KanbanBoard.jsx';
import CardDetailModal from './components/CardDetailModal.jsx';
import AdminPage from './components/AdminPage.jsx';
import ResourcesPage from './components/ResourcesPage.jsx';
import LearningPage from './components/LearningPage.jsx';

function MainAppContent() {
  const { user, loading } = useAuth();
  const [activeBoardId, setActiveBoardId] = useState(null);
  const [activeBoardName, setActiveBoardName] = useState('');
  const [activeCardId, setActiveCardId] = useState(null);
  const [boardReloadKey, setBoardReloadKey] = useState(0);

  // App loading screen
  if (loading) {
    return (
      <div style={styles.loadingScreen}>
        <div style={styles.loaderBrand}>
          <span style={styles.brandStan}>STAN</span>
          <span style={styles.brandRobotix}>ROBOTIX</span>
        </div>
        <div style={styles.spinner}></div>
        <span style={styles.loadingText}>Initialisation de la session collaborative...</span>
      </div>
    );
  }

  // Not logged in -> Show portal
  if (!user) {
    return <AuthPage />;
  }

  // Board selection handler
  const handleSelectBoard = (boardId, boardName) => {
    setActiveBoardId(boardId);
    setActiveBoardName(boardName);
  };

  // Card modal toggle handlers
  const handleOpenCard = (cardId) => {
    setActiveCardId(cardId);
  };

  const handleCloseCard = () => {
    setActiveCardId(null);
  };

  // Refresh boards view instantly when a card detail change happens
  const handleCardUpdated = () => {
    setBoardReloadKey(prev => prev + 1);
  };

  return (
    <div className="app-container">
      {/* Navigation Sidebar Tree */}
      {activeBoardId !== 'learning' && (
        <Sidebar 
          activeBoardId={activeBoardId} 
          onSelectBoard={handleSelectBoard} 
        />
      )}

      {/* Main Kanban workspace */}
      {activeBoardId === 'admin' ? (
        <AdminPage onSelectBoard={handleSelectBoard} />
      ) : activeBoardId === 'resources' ? (
        <ResourcesPage />
      ) : activeBoardId === 'learning' ? (
        <LearningPage onSelectBoard={handleSelectBoard} />
      ) : (
        <KanbanBoard 
          key={`${activeBoardId}-${boardReloadKey}`} 
          boardId={activeBoardId} 
          boardName={activeBoardName} 
          onOpenCard={handleOpenCard}
        />
      )}

      {/* Card detail view Modal Overlay */}
      {activeCardId && (
        <CardDetailModal 
          cardId={activeCardId} 
          onClose={handleCloseCard} 
          onCardUpdated={handleCardUpdated}
        />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

// Styling components
const styles = {
  loadingScreen: {
    height: '100vh',
    width: '100vw',
    backgroundColor: '#090d16',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    color: '#ffffff'
  },
  loaderBrand: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '2.5rem',
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
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(255, 255, 255, 0.1)',
    borderTop: '4px solid var(--brand-red)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  loadingText: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    fontWeight: '500'
  }
};

// Embed keyframe for loader spinner in style tag
if (typeof document !== 'undefined') {
  const styleTag = document.createElement('style');
  styleTag.innerHTML = `
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  `;
  document.head.appendChild(styleTag);
}
