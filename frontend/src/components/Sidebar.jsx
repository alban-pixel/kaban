import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../utils/api.js';
import { 
  Plus, Search, LogOut, Sun, Moon, 
  ChevronRight, ChevronDown, Folder, 
  FolderOpen, Layout, MoreVertical, Trash, Edit2, X, Shield, Lock, BookOpen, GraduationCap
} from 'lucide-react';

export default function Sidebar({ activeBoardId, onSelectBoard }) {
  const { user, logout, theme, toggleTheme, connectedUsers } = useAuth();
  
  // Navigation structure state
  const [navigation, setNavigation] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  
  // Tree expansion states
  const [expandedProjects, setExpandedProjects] = useState({});
  const [expandedFolders, setExpandedFolders] = useState({});
  
  // Adding items modals/inline prompts
  const [showAddProject, setShowAddProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  
  const [showAddFolder, setShowAddFolder] = useState(null); // projectID if open
  const [newFolderName, setNewFolderName] = useState('');
  
  const [showAddBoard, setShowAddBoard] = useState(null); // { projectID, folderID } if open
  const [newBoardName, setNewBoardName] = useState('');

  // Hover state tracking
  const [hoveredItemId, setHoveredItemId] = useState(null);

  // Editing rename states
  const [editingProjectId, setEditingProjectId] = useState(null);
  const [editProjectName, setEditProjectName] = useState('');
  
  const [editingFolderId, setEditingFolderId] = useState(null);
  const [editFolderName, setEditFolderName] = useState('');
  
  const [editingBoardId, setEditingBoardId] = useState(null);
  const [editBoardName, setEditBoardName] = useState('');

  const handleRenameProject = async (e, projectId) => {
    e.preventDefault();
    if (!editProjectName.trim()) return;
    try {
      await api.updateProject(projectId, { name: editProjectName.trim() });
      setEditingProjectId(null);
      await loadNavigation();
    } catch (err) {
      alert("Erreur lors de la modification du projet.");
    }
  };

  const handleRenameFolder = async (e, folderId) => {
    e.preventDefault();
    if (!editFolderName.trim()) return;
    try {
      await api.updateFolder(folderId, { name: editFolderName.trim() });
      setEditingFolderId(null);
      await loadNavigation();
    } catch (err) {
      alert("Erreur lors de la modification du dossier.");
    }
  };

  const handleRenameBoard = async (e, board) => {
    e.preventDefault();
    if (!editBoardName.trim()) return;
    try {
      await api.updateBoard(board.id, { name: editBoardName.trim() });
      setEditingBoardId(null);
      await loadNavigation();
      if (activeBoardId === board.id) {
        onSelectBoard(board.id, editBoardName.trim());
      }
    } catch (err) {
      alert("Erreur lors de la modification du tableau.");
    }
  };

  // Load complete navigation tree
  const loadNavigation = async (selectDefault = false) => {
    try {
      const data = await api.getNavigation();
      setNavigation(data);
      
      // Auto expand active items
      if (activeBoardId) {
        data.forEach(project => {
          let hasActive = false;
          
          // Check flat boards in project
          if (project.boards?.some(b => b.id === activeBoardId)) {
            hasActive = true;
          }
          
          // Check boards in project folders
          project.folders?.forEach(folder => {
            if (folder.boards?.some(b => b.id === activeBoardId)) {
              setExpandedFolders(prev => ({ ...prev, [folder.id]: true }));
              hasActive = true;
            }
          });

          if (hasActive) {
            setExpandedProjects(prev => ({ ...prev, [project.id]: true }));
          }
        });
      }

      // If no board is active and we want to select default, pick the first board we find
      if (selectDefault && !activeBoardId) {
        let firstBoard = null;
        for (const project of data) {
          if (project.boards && project.boards.length > 0) {
            firstBoard = project.boards[0];
            break;
          }
          for (const folder of project.folders || []) {
            if (folder.boards && folder.boards.length > 0) {
              firstBoard = folder.boards[0];
              break;
            }
          }
          if (firstBoard) break;
        }
        if (firstBoard) {
          onSelectBoard(firstBoard.id, firstBoard.name);
        }
      }
    } catch (err) {
      console.error("Error loading sidebar navigation:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNavigation(true);
  }, []);

  // Poll for sidebar navigation changes occasionally or handle reload
  const toggleProject = (projectId) => {
    setExpandedProjects(prev => ({ 
      ...prev, 
      [projectId]: prev[projectId] === undefined ? false : !prev[projectId] 
    }));
  };

  const toggleFolder = (folderId) => {
    setExpandedFolders(prev => ({ 
      ...prev, 
      [folderId]: prev[folderId] === undefined ? false : !prev[folderId] 
    }));
  };

  // Create Actions
  const handleAddProject = async (e) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;
    try {
      const newProj = await api.createProject(newProjectName);
      setNewProjectName('');
      setShowAddProject(false);
      await loadNavigation();
      setExpandedProjects(prev => ({ ...prev, [newProj.id]: true }));
    } catch (err) {
      alert("Erreur lors de la création du projet.");
    }
  };

  const handleAddFolder = async (e, projectId) => {
    e.preventDefault();
    if (!newFolderName.trim()) return;
    try {
      const newFold = await api.createFolder(newFolderName, projectId);
      setNewFolderName('');
      setShowAddFolder(null);
      await loadNavigation();
      setExpandedFolders(prev => ({ ...prev, [newFold.id]: true }));
      setExpandedProjects(prev => ({ ...prev, [projectId]: true }));
    } catch (err) {
      alert("Erreur lors de la création du dossier.");
    }
  };

  const handleAddBoard = async (e, projectId, folderId = null) => {
    e.preventDefault();
    if (!newBoardName.trim()) return;
    try {
      const newB = await api.createBoard(newBoardName, projectId, folderId);
      setNewBoardName('');
      setShowAddBoard(null);
      await loadNavigation();
      onSelectBoard(newB.id, newB.name);
    } catch (err) {
      alert("Erreur lors de la création du tableau.");
    }
  };

  // Delete Actions
  const handleDeleteProject = async (projectId, e) => {
    e.stopPropagation();
    if (confirm("Voulez-vous vraiment supprimer ce projet et tout son contenu (dossiers, tableaux, cartes) ?")) {
      try {
        await api.deleteProject(projectId);
        await loadNavigation();
      } catch (err) {
        alert("Erreur de suppression.");
      }
    }
  };

  const handleDeleteFolder = async (folderId, e) => {
    e.stopPropagation();
    if (confirm("Voulez-vous vraiment supprimer ce dossier et tous ses tableaux ?")) {
      try {
        await api.deleteFolder(folderId);
        await loadNavigation();
      } catch (err) {
        alert("Erreur de suppression.");
      }
    }
  };

  const handleDeleteBoard = async (boardId, e) => {
    e.stopPropagation();
    if (confirm("Voulez-vous vraiment supprimer ce tableau Kanban ?")) {
      try {
        await api.deleteBoard(boardId);
        await loadNavigation();
        if (activeBoardId === boardId) {
          onSelectBoard(null, '');
        }
      } catch (err) {
        alert("Erreur de suppression.");
      }
    }
  };

  // Filtering filter logic
  const matchesSearch = (boardName) => {
    return boardName.toLowerCase().includes(search.toLowerCase());
  };

  return (
    <div style={styles.sidebar}>
      {/* Sidebar Top Profile */}
      <div style={styles.profileSection}>
        <div style={styles.avatar} title={user?.display_name}>
          {user?.display_name ? user.display_name.charAt(0).toUpperCase() : 'U'}
        </div>
        <div style={styles.profileInfo}>
          <span style={styles.profileName}>{user.display_name}</span>
          <span style={styles.profileRole}>{user.role === 'admin' ? 'Administrateur' : 'Membre'}</span>
        </div>
      </div>

      {/* Navigation Filter Search Bar */}
      <div style={styles.searchContainer}>
        <Search size={16} style={styles.searchIcon} />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Rechercher un tableau..."
          style={styles.searchInput}
        />
      </div>

      {/* Projects List Container */}
      <div style={styles.navContainer}>
        {loading ? (
          <div style={styles.loadingText}>Chargement...</div>
        ) : (
          navigation.map(project => {
            const isProjectExpanded = expandedProjects[project.id] !== false;
            
            // Check if project has any visible boards or folders matching search
            const filteredBoards = project.boards?.filter(b => matchesSearch(b.name)) || [];
            const filteredFolders = project.folders?.map(folder => {
              const boards = folder.boards?.filter(b => matchesSearch(b.name)) || [];
              return { ...folder, boards };
            }).filter(f => f.boards.length > 0 || search === '') || [];

            // Skip rendering if search is active and nothing matches this project
            if (search && filteredBoards.length === 0 && filteredFolders.length === 0) return null;

            return (
              <div 
                key={project.id} 
                style={styles.projectWrapper}
                onMouseEnter={() => setHoveredItemId(`project-${project.id}`)}
                onMouseLeave={() => setHoveredItemId(null)}
              >
                {/* Project Header Row */}
                <div 
                  onClick={() => toggleProject(project.id)}
                  style={styles.projectHeader}
                >
                  <div style={styles.rowLeft}>
                    {isProjectExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    {editingProjectId === project.id ? (
                      <form 
                        onSubmit={(e) => handleRenameProject(e, project.id)}
                        onClick={(e) => e.stopPropagation()}
                        style={{ display: 'inline-flex' }}
                      >
                        <input
                          type="text"
                          value={editProjectName}
                          onChange={(e) => setEditProjectName(e.target.value)}
                          style={styles.renameInput}
                          autoFocus
                          onBlur={() => setEditingProjectId(null)}
                        />
                      </form>
                    ) : (
                      <span style={styles.projectName}>{project.name}</span>
                    )}
                    {project.is_private === 1 && (
                      <Lock size={12} style={{ color: 'var(--brand-red)', marginLeft: '6px' }} title="Projet Privé" />
                    )}
                  </div>
                  <div style={{
                    ...styles.actionsGroup,
                    opacity: hoveredItemId === `project-${project.id}` ? 1 : 0
                  }}>
                    <Edit2 
                      size={13} 
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingProjectId(project.id);
                        setEditProjectName(project.name);
                      }} 
                      style={styles.actionIcon}
                      title="Renommer le projet"
                    />
                    <Plus 
                      size={14} 
                      title="Nouveau Dossier / Tableau" 
                      onClick={(e) => {
                        e.stopPropagation();
                        // Open add board directly in project root
                        setShowAddBoard({ projectId: project.id, folderId: null });
                      }}
                      style={styles.actionIcon}
                    />
                    <MoreVertical 
                      size={14} 
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowAddFolder(showAddFolder === project.id ? null : project.id);
                      }}
                      title="Nouveau Dossier"
                      style={styles.actionIcon}
                    />
                    <Trash 
                      size={12} 
                      onClick={(e) => handleDeleteProject(project.id, e)} 
                      style={styles.deleteIcon}
                    />
                  </div>
                </div>

                {/* Inline Folder Creation Prompt */}
                {showAddFolder === project.id && (
                  <form 
                    onSubmit={(e) => handleAddFolder(e, project.id)}
                    style={styles.inlineForm}
                  >
                    <input
                      type="text"
                      value={newFolderName}
                      onChange={(e) => setNewFolderName(e.target.value)}
                      placeholder="Nom du dossier..."
                      style={styles.inlineInput}
                      autoFocus
                    />
                    <button type="submit" style={styles.inlineBtn}>OK</button>
                    <button type="button" onClick={() => setShowAddFolder(null)} style={styles.inlineCancel}>X</button>
                  </form>
                )}

                {/* Inline Root Board Creation Prompt */}
                {showAddBoard?.projectId === project.id && showAddBoard?.folderId === null && (
                  <form 
                    onSubmit={(e) => handleAddBoard(e, project.id, null)}
                    style={styles.inlineForm}
                  >
                    <input
                      type="text"
                      value={newBoardName}
                      onChange={(e) => setNewBoardName(e.target.value)}
                      placeholder="Nom du tableau..."
                      style={styles.inlineInput}
                      autoFocus
                    />
                    <button type="submit" style={styles.inlineBtn}>OK</button>
                    <button type="button" onClick={() => setShowAddBoard(null)} style={styles.inlineCancel}>X</button>
                  </form>
                )}

                {/* Project Contents (Folders & Boards) */}
                {isProjectExpanded && (
                  <div style={styles.projectBody}>
                    {/* 1. Project Folders */}
                    {filteredFolders.map(folder => {
                      const isFolderExpanded = expandedFolders[folder.id] !== false;
                      return (
                        <div 
                          key={folder.id} 
                          style={styles.folderWrapper}
                          onMouseEnter={() => setHoveredItemId(`folder-${folder.id}`)}
                          onMouseLeave={() => setHoveredItemId(null)}
                        >
                          {/* Folder Header */}
                          <div 
                            onClick={() => toggleFolder(folder.id)}
                            style={styles.folderHeader}
                          >
                            <div style={styles.rowLeft}>
                              {isFolderExpanded ? <FolderOpen size={13} style={styles.folderIcon} /> : <Folder size={13} style={styles.folderIcon} />}
                              {editingFolderId === folder.id ? (
                                <form 
                                  onSubmit={(e) => handleRenameFolder(e, folder.id)}
                                  onClick={(e) => e.stopPropagation()}
                                  style={{ display: 'inline-flex' }}
                                >
                                  <input
                                    type="text"
                                    value={editFolderName}
                                    onChange={(e) => setEditFolderName(e.target.value)}
                                    style={styles.renameInput}
                                    autoFocus
                                    onBlur={() => setEditingFolderId(null)}
                                  />
                                </form>
                              ) : (
                                <span style={styles.folderName}>{folder.name}</span>
                              )}
                            </div>
                            <div style={{
                              ...styles.actionsGroup,
                              opacity: hoveredItemId === `folder-${folder.id}` ? 1 : 0
                            }}>
                              <Edit2 
                                size={12} 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingFolderId(folder.id);
                                  setEditFolderName(folder.name);
                                }} 
                                style={styles.actionIcon}
                                title="Renommer le dossier"
                              />
                              <Plus 
                                size={12} 
                                title="Nouveau tableau dans ce dossier"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setShowAddBoard({ projectId: project.id, folderId: folder.id });
                                }}
                                style={styles.actionIcon}
                              />
                              <Trash 
                                size={11} 
                                onClick={(e) => handleDeleteFolder(folder.id, e)} 
                                style={styles.deleteIcon}
                              />
                            </div>
                          </div>

                          {/* Inline Board Creation in Folder Prompt */}
                          {showAddBoard?.projectId === project.id && showAddBoard?.folderId === folder.id && (
                            <form 
                              onSubmit={(e) => handleAddBoard(e, project.id, folder.id)}
                              style={styles.inlineFormNested}
                            >
                              <input
                                type="text"
                                value={newBoardName}
                                onChange={(e) => setNewBoardName(e.target.value)}
                                placeholder="Nom du tableau..."
                                style={styles.inlineInput}
                                autoFocus
                              />
                              <button type="submit" style={styles.inlineBtn}>OK</button>
                              <button type="button" onClick={() => setShowAddBoard(null)} style={styles.inlineCancel}>X</button>
                            </form>
                          )}

                          {/* Folder Boards */}
                          {isFolderExpanded && (
                            <div style={styles.folderBody}>
                              {folder.boards?.map(board => (
                                <div
                                  key={board.id}
                                  onClick={() => onSelectBoard(board.id, board.name)}
                                  onMouseEnter={() => setHoveredItemId(`board-${board.id}`)}
                                  onMouseLeave={() => setHoveredItemId(null)}
                                  style={{
                                    ...styles.boardItem,
                                    backgroundColor: activeBoardId === board.id ? 'var(--bg-sidebar-active)' : 'transparent',
                                    borderLeft: activeBoardId === board.id ? '3px solid var(--brand-red)' : '3px solid transparent'
                                  }}
                                >
                                  <div style={styles.rowLeft}>
                                    <Layout size={12} style={styles.boardIcon} />
                                    {editingBoardId === board.id ? (
                                      <form 
                                        onSubmit={(e) => handleRenameBoard(e, board)}
                                        onClick={(e) => e.stopPropagation()}
                                        style={{ display: 'inline-flex' }}
                                      >
                                        <input
                                          type="text"
                                          value={editBoardName}
                                          onChange={(e) => setEditBoardName(e.target.value)}
                                          style={styles.renameInput}
                                          autoFocus
                                          onBlur={() => setEditingBoardId(null)}
                                        />
                                      </form>
                                    ) : (
                                      <span style={{
                                        ...styles.boardName,
                                        color: activeBoardId === board.id ? '#ffffff' : 'var(--text-sidebar-muted)',
                                        fontWeight: activeBoardId === board.id ? '600' : '400'
                                      }}>{board.name}</span>
                                    )}
                                  </div>
                                  <div style={{
                                    display: (hoveredItemId === `board-${board.id}` || activeBoardId === board.id) ? 'flex' : 'none',
                                    alignItems: 'center',
                                    gap: '6px'
                                  }}>
                                    <Edit2 
                                      size={11} 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingBoardId(board.id);
                                        setEditBoardName(board.name);
                                      }} 
                                      style={{ ...styles.actionIcon, color: activeBoardId === board.id ? '#ffffff' : 'var(--text-sidebar-muted)' }}
                                      title="Renommer le tableau"
                                    />
                                    <Trash 
                                      size={10} 
                                      onClick={(e) => handleDeleteBoard(board.id, e)} 
                                      style={{ ...styles.deleteIcon, color: activeBoardId === board.id ? '#ffffff' : 'rgba(239, 68, 68, 0.8)' }}
                                    />
                                  </div>
                                </div>
                              ))}
                              {(!folder.boards || folder.boards.length === 0) && (
                                <div style={styles.emptyTextNested}>Vide</div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}

                    {/* 2. Direct Project Boards */}
                    {filteredBoards.map(board => (
                      <div
                        key={board.id}
                        onClick={() => onSelectBoard(board.id, board.name)}
                        onMouseEnter={() => setHoveredItemId(`board-${board.id}`)}
                        onMouseLeave={() => setHoveredItemId(null)}
                        style={{
                          ...styles.boardItemDirect,
                          backgroundColor: activeBoardId === board.id ? 'var(--bg-sidebar-active)' : 'transparent',
                          borderLeft: activeBoardId === board.id ? '3px solid var(--brand-red)' : '3px solid transparent'
                        }}
                      >
                        <div style={styles.rowLeft}>
                          <Layout size={12} style={styles.boardIcon} />
                          {editingBoardId === board.id ? (
                            <form 
                              onSubmit={(e) => handleRenameBoard(e, board)}
                              onClick={(e) => e.stopPropagation()}
                              style={{ display: 'inline-flex' }}
                            >
                              <input
                                type="text"
                                value={editBoardName}
                                onChange={(e) => setEditBoardName(e.target.value)}
                                style={styles.renameInput}
                                autoFocus
                                onBlur={() => setEditingBoardId(null)}
                              />
                            </form>
                          ) : (
                            <span style={{
                              ...styles.boardNameDirect,
                              color: activeBoardId === board.id ? '#ffffff' : 'var(--text-sidebar-muted)',
                              fontWeight: activeBoardId === board.id ? '600' : '400'
                            }}>{board.name}</span>
                          )}
                        </div>
                        <div style={{
                          display: (hoveredItemId === `board-${board.id}` || activeBoardId === board.id) ? 'flex' : 'none',
                          alignItems: 'center',
                          gap: '6px'
                        }}>
                          <Edit2 
                            size={11} 
                            onClick={(e) => {
                              e.stopPropagation();
                              setEditingBoardId(board.id);
                              setEditBoardName(board.name);
                            }} 
                            style={{ ...styles.actionIcon, color: activeBoardId === board.id ? '#ffffff' : 'var(--text-sidebar-muted)' }}
                            title="Renommer le tableau"
                          />
                          <Trash 
                            size={10} 
                            onClick={(e) => handleDeleteBoard(board.id, e)} 
                            style={{ ...styles.deleteIcon, color: activeBoardId === board.id ? '#ffffff' : 'rgba(239, 68, 68, 0.8)' }}
                          />
                        </div>
                      </div>
                    ))}

                    {(!project.folders || project.folders.length === 0) && (!project.boards || project.boards.length === 0) && (
                      <div style={styles.emptyText}>Aucun dossier ou tableau.</div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Project Button */}
      <button 
        onClick={() => setShowAddProject(true)} 
        style={styles.addProjectBtn}
      >
        <Plus size={16} /> Nouveau Projet
      </button>

      {/* Add Project Modal Overlay */}
      {showAddProject && (
        <div style={styles.modalOverlay} onClick={() => setShowAddProject(false)}>
          <div 
            className="glass-panel animate-modal" 
            style={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>Créer un nouveau projet</h3>
              <button onClick={() => setShowAddProject(false)} style={styles.modalCloseBtn}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleAddProject} style={styles.modalForm}>
              <div style={styles.formGroup}>
                <label style={styles.modalLabel}>Nom du projet</label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  placeholder="ex. Coupe de Robotique 2026"
                  style={styles.modalInput}
                  autoFocus
                  required
                />
              </div>
              <div style={styles.modalActions}>
                <button 
                  type="button" 
                  onClick={() => setShowAddProject(false)} 
                  className="btn-secondary"
                  style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                >
                  Annuler
                </button>
                <button 
                  type="submit" 
                  className="btn-primary"
                  style={{ padding: '8px 16px', fontSize: '0.9rem' }}
                >
                  Créer le projet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Connected Users Section */}
      <div style={styles.onlineSection}>
        <div style={styles.onlineHeader}>
          <span style={styles.onlineDot}></span>
          <span style={styles.onlineTitle}>En ligne ({connectedUsers.length})</span>
        </div>
        <div style={styles.onlineList}>
          {connectedUsers.map((u) => (
            <div key={u.id} style={styles.onlineUserItem} title={u.display_name}>
              <div style={{ ...styles.onlineAvatar, backgroundColor: u.avatar_color }}>
                {u.display_name.charAt(0).toUpperCase()}
              </div>
              <span style={styles.onlineUserName}>{u.display_name}</span>
            </div>
          ))}
          {connectedUsers.length === 0 && (
            <div style={{ fontSize: '0.75rem', color: 'var(--text-sidebar-muted)', fontStyle: 'italic', paddingLeft: '4px' }}>
              Aucun utilisateur connecté
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Footer Controls */}
      <div style={styles.sidebarFooter}>
        {/* Ressources Utiles & Calculateurs */}
        <button 
          onClick={() => onSelectBoard('resources', 'Ressources')} 
          style={{ 
            ...styles.footerBtn, 
            color: activeBoardId === 'resources' ? 'var(--brand-red)' : 'var(--text-sidebar-muted)',
            backgroundColor: activeBoardId === 'resources' ? 'rgba(207, 39, 55, 0.1)' : 'transparent',
            fontWeight: activeBoardId === 'resources' ? '600' : '500'
          }}
          title="Ressources & Calculateurs"
        >
          <BookOpen size={18} />
          <span>Ressources</span>
        </button>

        {/* Apprentissage & Formation */}
        <button 
          onClick={() => onSelectBoard('learning', 'Apprentissage')} 
          style={{ 
            ...styles.footerBtn, 
            color: activeBoardId === 'learning' ? 'var(--brand-red)' : 'var(--text-sidebar-muted)',
            backgroundColor: activeBoardId === 'learning' ? 'rgba(207, 39, 55, 0.1)' : 'transparent',
            fontWeight: activeBoardId === 'learning' ? '600' : '500'
          }}
          title="Apprentissage & Formation"
        >
          <GraduationCap size={18} />
          <span>Apprentissage</span>
        </button>

        {/* Administration (Admin only) */}
        {user.role === 'admin' && (
          <button 
            onClick={() => onSelectBoard('admin', 'Administration')} 
            style={{ 
              ...styles.footerBtn, 
              color: activeBoardId === 'admin' ? 'var(--brand-red)' : 'var(--text-sidebar-muted)',
              backgroundColor: activeBoardId === 'admin' ? 'rgba(207, 39, 55, 0.1)' : 'transparent',
              fontWeight: activeBoardId === 'admin' ? '600' : '500'
            }}
            title="Administration"
          >
            <Shield size={18} />
            <span>Administration</span>
          </button>
        )}

        {/* Theme Toggler */}
        <button 
          onClick={toggleTheme} 
          style={styles.footerBtn}
          title={theme === 'dark' ? "Passer en mode clair" : "Passer en mode sombre"}
        >
          {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          <span>{theme === 'dark' ? 'Mode Clair' : 'Mode Sombre'}</span>
        </button>

        {/* Logout */}
        <button 
          onClick={logout} 
          style={{ ...styles.footerBtn, color: '#f87171' }}
          title="Se déconnecter"
        >
          <LogOut size={18} />
          <span>Déconnexion</span>
        </button>
      </div>
    </div>
  );
}

// Styling (Hard-coded Javascript values to match CSS guidelines flawlessly)
const styles = {
  sidebar: {
    width: '280px',
    minWidth: '280px',
    backgroundColor: 'var(--bg-sidebar)',
    borderRight: '1px solid var(--border-sidebar)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    color: 'var(--text-sidebar)',
    zIndex: 100
  },
  profileSection: {
    padding: '1.25rem',
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    borderBottom: '1px solid var(--border-sidebar)'
  },
  avatar: {
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    backgroundColor: 'var(--brand-red)',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '1.2rem',
    fontWeight: '700',
    border: '2px solid rgba(255, 255, 255, 0.2)'
  },
  profileInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  profileName: {
    fontSize: '0.95rem',
    fontWeight: '600'
  },
  profileRole: {
    fontSize: '0.75rem',
    color: 'var(--text-sidebar-muted)'
  },
  searchContainer: {
    padding: '10px 14px',
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  },
  searchIcon: {
    position: 'absolute',
    left: '24px',
    color: 'var(--text-sidebar-muted)'
  },
  searchInput: {
    width: '100%',
    backgroundColor: 'var(--bg-sidebar-hover)',
    border: '1px solid transparent',
    color: 'var(--text-sidebar)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '8px 12px 8px 32px',
    fontSize: '0.85rem',
    transition: 'all var(--transition-fast)'
  },
  navContainer: {
    flex: 1,
    overflowY: 'auto',
    padding: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  loadingText: {
    fontSize: '0.9rem',
    color: 'var(--text-sidebar-muted)',
    textAlign: 'center',
    marginTop: '20px'
  },
  projectWrapper: {
    display: 'flex',
    flexDirection: 'column',
    borderRadius: 'var(--border-radius-sm)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    overflow: 'hidden'
  },
  projectHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 8px',
    cursor: 'pointer',
    borderRadius: 'var(--border-radius-sm)',
    transition: 'background var(--transition-fast)',
    ':hover': {
      backgroundColor: 'var(--bg-sidebar-hover)'
    }
  },
  projectName: {
    fontSize: '0.9rem',
    fontWeight: '600',
    letterSpacing: '0.2px'
  },
  rowLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  actionsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    opacity: 0.6,
    transition: 'opacity var(--transition-fast)'
  },
  actionIcon: {
    cursor: 'pointer',
    color: 'var(--text-sidebar-muted)',
    ':hover': {
      color: 'var(--text-sidebar)'
    }
  },
  deleteIcon: {
    cursor: 'pointer',
    color: 'rgba(239, 68, 68, 0.8)',
    ':hover': {
      color: '#ef4444'
    }
  },
  deleteIconItem: {
    cursor: 'pointer',
    color: 'rgba(239, 68, 68, 0.6)',
    display: 'none',
    ':hover': {
      color: '#ef4444'
    }
  },
  projectBody: {
    paddingLeft: '14px',
    paddingBottom: '8px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  folderWrapper: {
    display: 'flex',
    flexDirection: 'column',
    marginTop: '4px'
  },
  folderHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 8px',
    cursor: 'pointer',
    borderRadius: 'var(--border-radius-sm)',
    transition: 'background var(--transition-fast)'
  },
  folderIcon: {
    color: '#38bdf8'
  },
  folderName: {
    fontSize: '0.85rem',
    fontWeight: '500',
    color: 'var(--text-sidebar)'
  },
  folderBody: {
    paddingLeft: '14px',
    borderLeft: '1px dashed rgba(255, 255, 255, 0.1)',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
    marginTop: '2px'
  },
  boardItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 8px',
    cursor: 'pointer',
    borderRadius: 'var(--border-radius-sm)',
    transition: 'all var(--transition-fast)',
    position: 'relative'
  },
  boardIcon: {
    color: 'var(--text-sidebar-muted)'
  },
  boardName: {
    fontSize: '0.8rem'
  },
  boardItemDirect: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '6px 8px',
    cursor: 'pointer',
    borderRadius: 'var(--border-radius-sm)',
    transition: 'all var(--transition-fast)',
    marginTop: '2px'
  },
  boardNameDirect: {
    fontSize: '0.8rem'
  },
  emptyText: {
    fontSize: '0.75rem',
    color: 'var(--text-sidebar-muted)',
    padding: '6px 8px'
  },
  emptyTextNested: {
    fontSize: '0.75rem',
    color: 'var(--text-sidebar-muted)',
    padding: '4px 8px',
    fontStyle: 'italic'
  },
  addProjectBtn: {
    margin: '10px 14px',
    padding: '10px',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px dashed var(--border-sidebar)',
    color: 'var(--text-sidebar)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '0.85rem',
    fontWeight: '500',
    transition: 'all var(--transition-fast)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)'
  },
  addProjectForm: {
    margin: '10px 14px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  addProjectInput: {
    backgroundColor: 'var(--bg-sidebar-hover)',
    border: '1px solid var(--border-sidebar)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '8px 12px',
    color: 'var(--text-sidebar)',
    fontSize: '0.85rem'
  },
  addProjectBtns: {
    display: 'flex',
    gap: '6px'
  },
  btnSmallOk: {
    flex: 1,
    backgroundColor: 'var(--brand-red)',
    color: '#ffffff',
    padding: '6px',
    fontSize: '0.75rem',
    borderRadius: 'var(--border-radius-sm)',
    fontWeight: '600'
  },
  btnSmallCancel: {
    padding: '6px 10px',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    color: '#ffffff',
    fontSize: '0.75rem',
    borderRadius: 'var(--border-radius-sm)'
  },
  inlineForm: {
    display: 'flex',
    gap: '4px',
    padding: '4px 8px',
    backgroundColor: 'var(--bg-sidebar-hover)',
    borderRadius: 'var(--border-radius-sm)',
    margin: '2px 8px'
  },
  inlineFormNested: {
    display: 'flex',
    gap: '4px',
    padding: '4px 6px',
    backgroundColor: 'var(--bg-sidebar-hover)',
    borderRadius: 'var(--border-radius-sm)',
    marginLeft: '14px',
    marginRight: '4px'
  },
  inlineInput: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
    padding: '4px 6px',
    fontSize: '0.75rem',
    color: 'var(--text-sidebar)',
    borderRadius: '4px',
    border: '1px solid var(--border-sidebar)'
  },
  inlineBtn: {
    backgroundColor: 'var(--brand-red)',
    color: '#ffffff',
    padding: '2px 6px',
    fontSize: '0.7rem',
    borderRadius: '4px',
    fontWeight: '600'
  },
  inlineCancel: {
    color: 'var(--text-sidebar-muted)',
    padding: '2px 4px',
    fontSize: '0.7rem'
  },
  sidebarFooter: {
    padding: '1.25rem',
    borderTop: '1px solid var(--border-sidebar)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  footerBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '8px 10px',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.875rem',
    fontWeight: '500',
    color: 'var(--text-sidebar-muted)',
    transition: 'all var(--transition-fast)',
    width: '100%',
    textAlign: 'left'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    padding: '1rem'
  },
  modalCard: {
    width: '100%',
    maxWidth: '400px',
    backgroundColor: 'var(--bg-modal)',
    borderRadius: 'var(--border-radius-lg)',
    padding: '1.5rem',
    boxShadow: 'var(--shadow-premium)',
    display: 'flex',
    flexDirection: 'column',
    gap: '14px',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)'
  },
  modalHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '8px'
  },
  modalTitle: {
    fontSize: '1.15rem',
    fontWeight: '600'
  },
  modalCloseBtn: {
    color: 'var(--text-muted)',
    cursor: 'pointer'
  },
  modalForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  modalLabel: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--text-muted)'
  },
  modalInput: {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    padding: '10px 12px',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.9rem'
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '10px',
    marginTop: '6px'
  },
  renameInput: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    border: '1px solid var(--brand-red)',
    color: '#ffffff',
    fontSize: '0.8rem',
    padding: '2px 6px',
    borderRadius: '4px',
    width: '120px',
    outline: 'none'
  },
  onlineSection: {
    padding: '10px 14px',
    borderTop: '1px solid var(--border-sidebar)',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    backgroundColor: 'rgba(255, 255, 255, 0.01)'
  },
  onlineHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  onlineDot: {
    width: '8px',
    height: '8px',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    display: 'inline-block',
    boxShadow: '0 0 0 2px rgba(16, 185, 129, 0.4)',
    animation: 'pulseGreen 2s infinite'
  },
  onlineTitle: {
    fontSize: '0.75rem',
    fontWeight: '700',
    color: 'var(--text-sidebar-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  onlineList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    maxHeight: '120px',
    overflowY: 'auto'
  },
  onlineUserItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '2px 4px'
  },
  onlineAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    color: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid rgba(255, 255, 255, 0.1)'
  },
  onlineUserName: {
    fontSize: '0.8rem',
    color: 'var(--text-sidebar)',
    fontWeight: '500'
  }
};
