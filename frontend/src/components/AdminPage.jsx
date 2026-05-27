import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../utils/api.js';
import { Users, Lock, Unlock, Shield, Trash2, UserPlus, X, AlertCircle } from 'lucide-react';

export default function AdminPage({ onSelectBoard }) {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('users'); // 'users' or 'projects'
  
  // States
  const [usersList, setUsersList] = useState([]);
  const [projectsList, setProjectsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Specific project permissions state
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectMembers, setProjectMembers] = useState([]);
  const [availableUsers, setAvailableUsers] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  // Load Admin Data
  const loadAdminData = async () => {
    setLoading(true);
    setError('');
    try {
      const usersData = await api.getAdminUsers();
      setUsersList(usersData);
      
      const navData = await api.getNavigation();
      setProjectsList(navData);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des données.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.role === 'admin') {
      loadAdminData();
    }
  }, [user]);

  // Load project members for private project detail view
  const loadProjectAccessList = async (project) => {
    setSelectedProject(project);
    setProjectMembers([]);
    try {
      const members = await api.getProjectMembers(project.id);
      setProjectMembers(members);
      
      // Calculate who can be added
      const memberIds = new Set(members.map(m => m.id));
      const filtered = usersList.filter(u => !memberIds.has(u.id) && u.role !== 'admin');
      setAvailableUsers(filtered);
    } catch (err) {
      alert("Erreur de chargement des permissions : " + err.message);
    }
  };

  // Toggle user role
  const handleToggleRole = async (targetUser) => {
    const nextRole = targetUser.role === 'admin' ? 'member' : 'admin';
    if (confirm(`Modifier le rôle de ${targetUser.display_name} en ${nextRole === 'admin' ? 'Administrateur' : 'Membre'} ?`)) {
      try {
        await api.updateUserRole(targetUser.id, nextRole);
        // Refresh local list
        setUsersList(prev => prev.map(u => u.id === targetUser.id ? { ...u, role: nextRole } : u));
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Delete user
  const handleDeleteUser = async (targetUserId, name) => {
    if (confirm(`Voulez-vous vraiment supprimer définitivement le compte de ${name} ? Cette action est irréversible.`)) {
      try {
        await api.deleteUser(targetUserId);
        setUsersList(prev => prev.filter(u => u.id !== targetUserId));
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Toggle project privacy
  const handleTogglePrivacy = async (project) => {
    const isPrivate = project.is_private === 1 ? 0 : 1;
    const desc = isPrivate ? 'Privé (seuls les admins et membres autorisés y accèdent)' : 'Public (tous les membres du club y accèdent)';
    if (confirm(`Rendre le projet "${project.name}" ${desc} ?`)) {
      try {
        await api.updateProject(project.id, { is_private: isPrivate });
        setProjectsList(prev => prev.map(p => p.id === project.id ? { ...p, is_private: isPrivate } : p));
        if (selectedProject?.id === project.id) {
          setSelectedProject(prev => ({ ...prev, is_private: isPrivate }));
          if (isPrivate) {
            loadProjectAccessList({ ...project, is_private: isPrivate });
          } else {
            setSelectedProject(null);
          }
        }
      } catch (err) {
        alert(err.message);
      }
    }
  };

  // Add member to private project
  const handleAddProjectMember = async (userId) => {
    if (!selectedProject) return;
    setActionLoading(true);
    try {
      const addedUser = await api.addProjectMember(selectedProject.id, userId);
      setProjectMembers(prev => [...prev, addedUser]);
      setAvailableUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Remove member from private project
  const handleRemoveProjectMember = async (userId) => {
    if (!selectedProject) return;
    setActionLoading(true);
    try {
      await api.removeProjectMember(selectedProject.id, userId);
      setProjectMembers(prev => prev.filter(u => u.id !== userId));
      const user = usersList.find(u => u.id === userId);
      if (user) {
        setAvailableUsers(prev => [...prev, user].sort((a,b) => a.display_name.localeCompare(b.display_name)));
      }
    } catch (err) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  // Close and select first board to go back
  const handleBackToWorkspace = () => {
    let firstBoard = null;
    for (const project of projectsList) {
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
    } else {
      onSelectBoard(null, '');
    }
  };

  if (user?.role !== 'admin') {
    return (
      <div style={styles.errorContainer}>
        <AlertCircle size={40} style={{ color: 'var(--brand-red)' }} />
        <h2>Accès Interdit</h2>
        <p>Seuls les administrateurs peuvent accéder au panneau d'administration.</p>
        <button className="btn-primary" onClick={handleBackToWorkspace}>Retour à l'espace de travail</button>
      </div>
    );
  }

  return (
    <div style={styles.adminPage}>
      {/* Header bar */}
      <div style={styles.header}>
        <div style={styles.headerTitleGroup}>
          <Shield size={24} style={{ color: 'var(--brand-red)' }} />
          <h1 style={styles.headerTitle}>Console d'Administration</h1>
        </div>
        <button style={styles.closeBtn} onClick={handleBackToWorkspace} title="Fermer">
          <X size={20} />
        </button>
      </div>

      {/* Tabs list */}
      <div style={styles.tabsContainer}>
        <button 
          style={{ ...styles.tab, borderBottom: activeTab === 'users' ? '3px solid var(--brand-red)' : '3px solid transparent', color: activeTab === 'users' ? 'var(--text-main)' : 'var(--text-muted)' }} 
          onClick={() => { setActiveTab('users'); setSelectedProject(null); }}
        >
          <Users size={16} />
          Membres & Rôles
        </button>
        <button 
          style={{ ...styles.tab, borderBottom: activeTab === 'projects' ? '3px solid var(--brand-red)' : '3px solid transparent', color: activeTab === 'projects' ? 'var(--text-main)' : 'var(--text-muted)' }} 
          onClick={() => setActiveTab('projects')}
        >
          <Lock size={16} />
          Projets & Confidentialité
        </button>
      </div>

      {/* Main body */}
      <div style={styles.body}>
        {loading ? (
          <div style={styles.centered}>
            <div style={styles.spinner}></div>
            <p style={{ marginTop: '10px', color: 'var(--text-muted)' }}>Chargement de l'administration...</p>
          </div>
        ) : error ? (
          <div style={styles.centered}>
            <AlertCircle size={32} style={{ color: 'var(--brand-red)' }} />
            <p style={{ color: 'var(--brand-red)', marginTop: '8px' }}>{error}</p>
          </div>
        ) : activeTab === 'users' ? (
          /* USERS TAB */
          <div style={styles.panel} className="animate-fade">
            <h2 style={styles.sectionTitle}>Gestion des Membres ({usersList.length})</h2>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.tr}>
                    <th style={styles.th}>Membre</th>
                    <th style={styles.th}>Nom d'utilisateur</th>
                    <th style={styles.th}>Rôle</th>
                    <th style={styles.th}>Date d'inscription</th>
                    <th style={{ ...styles.th, textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {usersList.map(u => {
                    const isSelf = u.id === user.id;
                    const date = new Date(u.created_at).toLocaleDateString('fr-FR', {
                      day: 'numeric', month: 'long', year: 'numeric'
                    });
                    
                    return (
                      <tr key={u.id} style={styles.trHover}>
                        <td style={styles.td}>
                          <div style={styles.userCell}>
                            <div style={{ ...styles.userAvatar, backgroundColor: u.avatar_color || 'var(--brand-navy)' }}>
                              {u.display_name.charAt(0).toUpperCase()}
                            </div>
                            <span style={{ fontWeight: '600' }}>{u.display_name} {isSelf && '(vous)'}</span>
                          </div>
                        </td>
                        <td style={styles.td}>@{u.username}</td>
                        <td style={styles.td}>
                          <span style={{
                            ...styles.roleBadge,
                            backgroundColor: u.role === 'admin' ? 'rgba(207, 39, 55, 0.15)' : 'rgba(100, 116, 139, 0.15)',
                            color: u.role === 'admin' ? 'var(--brand-red)' : 'var(--text-muted)',
                            border: u.role === 'admin' ? '1px solid var(--brand-red)' : '1px solid var(--border-color)'
                          }}>
                            {u.role === 'admin' ? 'Administrateur' : 'Membre'}
                          </span>
                        </td>
                        <td style={styles.td}>{date}</td>
                        <td style={{ ...styles.td, textAlign: 'right' }}>
                          <div style={styles.actionRow}>
                            <button 
                              style={{ 
                                ...styles.actionBtn, 
                                opacity: isSelf ? 0.3 : 1, 
                                cursor: isSelf ? 'not-allowed' : 'pointer'
                              }}
                              disabled={isSelf}
                              onClick={() => handleToggleRole(u)}
                              title="Changer de rôle"
                            >
                              <Shield size={14} /> Modifier Rôle
                            </button>
                            <button 
                              style={{ 
                                ...styles.actionBtnDelete, 
                                opacity: isSelf ? 0.3 : 1, 
                                cursor: isSelf ? 'not-allowed' : 'pointer' 
                              }}
                              disabled={isSelf}
                              onClick={() => handleDeleteUser(u.id, u.display_name)}
                              title="Supprimer le membre"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* PROJECTS TAB */
          <div style={styles.projectsLayout} className="animate-fade">
            <div style={{ ...styles.panel, flex: 1 }}>
              <h2 style={styles.sectionTitle}>Confidentialité des Projets</h2>
              <p style={styles.subtext}>
                Par défaut, tous les membres voient tous les projets. Activer l'option "Privé" restreint l'accès aux administrateurs et aux membres explicitement autorisés.
              </p>
              
              <div style={styles.projectsList}>
                {projectsList.map(project => {
                  const isPrivate = project.is_private === 1;
                  const isSelected = selectedProject?.id === project.id;
                  
                  return (
                    <div 
                      key={project.id} 
                      style={{ 
                        ...styles.projectRow, 
                        borderLeft: isSelected ? '4px solid var(--brand-red)' : '4px solid transparent',
                        backgroundColor: isSelected ? 'rgba(207, 39, 55, 0.05)' : 'var(--bg-card)'
                      }}
                    >
                      <div style={styles.projectInfo}>
                        <div style={styles.projectHeaderRow}>
                          <h3 style={styles.projectNameText}>{project.name}</h3>
                          <span style={{
                            ...styles.privacyBadge,
                            backgroundColor: isPrivate ? 'rgba(207, 39, 55, 0.15)' : 'rgba(22, 163, 74, 0.15)',
                            color: isPrivate ? 'var(--brand-red)' : '#16a34a',
                            border: isPrivate ? '1px solid var(--brand-red)' : '1px solid #16a34a'
                          }}>
                            {isPrivate ? <Lock size={10} /> : <Unlock size={10} />}
                            {isPrivate ? 'Privé' : 'Public'}
                          </span>
                        </div>
                        <span style={styles.projectDetailsText}>
                          {project.folders?.length || 0} dossiers • {project.boards?.length || 0} tableaux
                        </span>
                      </div>
                      
                      <div style={styles.projectActions}>
                        {isPrivate && (
                          <button 
                            className="btn-secondary" 
                            style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                            onClick={() => loadProjectAccessList(project)}
                          >
                            Permissions ({isSelected ? projectMembers.length : 'Gérer'})
                          </button>
                        )}
                        <button 
                          className={isPrivate ? "btn-secondary" : "btn-primary"} 
                          style={{ padding: '6px 12px', fontSize: '0.8rem', backgroundColor: isPrivate ? 'transparent' : 'var(--brand-red)' }}
                          onClick={() => handleTogglePrivacy(project)}
                        >
                          {isPrivate ? 'Rendre Public' : 'Rendre Privé'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* SIDE PANEL: PRIVATE PROJECT PERMISSIONS */}
            {selectedProject && selectedProject.is_private === 1 && (
              <div style={styles.sidePanel} className="animate-fade">
                <div style={styles.sidePanelHeader}>
                  <h3 style={{ fontSize: '1rem', fontWeight: '700' }}>Accès pour : {selectedProject.name}</h3>
                  <button style={styles.smallCloseBtn} onClick={() => setSelectedProject(null)}>
                    <X size={16} />
                  </button>
                </div>
                
                {/* Add member box */}
                <div style={styles.addAccessContainer}>
                  <span style={styles.fieldLabel}>Ajouter un membre autorisé :</span>
                  {availableUsers.length === 0 ? (
                    <span style={styles.noMembersText}>Aucun autre membre standard disponible.</span>
                  ) : (
                    <div style={styles.addSelectRow}>
                      <select 
                        id="user-add-select" 
                        defaultValue="" 
                        style={styles.select}
                        onChange={(e) => {
                          if (e.target.value) {
                            handleAddProjectMember(parseInt(e.target.value));
                            e.target.value = '';
                          }
                        }}
                        disabled={actionLoading}
                      >
                        <option value="" disabled>Choisir un membre...</option>
                        {availableUsers.map(u => (
                          <option key={u.id} value={u.id}>{u.display_name} (@{u.username})</option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* List of members with access */}
                <div style={{ flex: 1, overflowY: 'auto' }}>
                  <span style={styles.fieldLabel}>Membres autorisés ({projectMembers.length}) :</span>
                  <div style={styles.projectMembersList}>
                    {projectMembers.map(m => (
                      <div key={m.id} style={styles.memberAccessRow}>
                        <div style={styles.userCell}>
                          <div style={{ ...styles.userAvatarSmall, backgroundColor: m.avatar_color || 'var(--brand-navy)' }}>
                            {m.display_name.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ fontSize: '0.85rem', fontWeight: '500' }}>{m.display_name}</span>
                        </div>
                        <button 
                          style={styles.removeAccessBtn}
                          onClick={() => handleRemoveProjectMember(m.id)}
                          disabled={actionLoading}
                          title="Retirer l'accès"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                    
                    {projectMembers.length === 0 && (
                      <div style={styles.emptyCardList}>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'center' }}>
                          Seuls les administrateurs ont accès. Aucun membre standard n'a été autorisé.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  adminPage: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'var(--bg-board)',
    color: 'var(--text-main)',
    overflow: 'hidden'
  },
  header: {
    height: '60px',
    borderBottom: '1px solid var(--border-color)',
    padding: '0 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'var(--bg-card)'
  },
  headerTitleGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  headerTitle: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--text-main)'
  },
  closeBtn: {
    color: 'var(--text-muted)',
    padding: '8px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ':hover': {
      backgroundColor: 'var(--bg-column)',
      color: 'var(--text-main)'
    }
  },
  tabsContainer: {
    display: 'flex',
    backgroundColor: 'var(--bg-card)',
    padding: '0 20px',
    borderBottom: '1px solid var(--border-color)'
  },
  tab: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '14px 20px',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'all var(--transition-fast)'
  },
  body: {
    flex: 1,
    padding: '20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column'
  },
  panel: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-sm)',
    overflow: 'hidden'
  },
  sectionTitle: {
    fontSize: '1.15rem',
    fontWeight: '700',
    marginBottom: '15px',
    color: 'var(--text-main)'
  },
  subtext: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    marginBottom: '18px',
    lineHeight: '1.4'
  },
  tableContainer: {
    width: '100%',
    overflowX: 'auto'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    textAlign: 'left',
    fontSize: '0.9rem'
  },
  tr: {
    borderBottom: '1px solid var(--border-color)'
  },
  trHover: {
    borderBottom: '1px solid var(--border-color)',
    transition: 'background var(--transition-fast)',
    ':hover': {
      backgroundColor: 'var(--bg-app)'
    }
  },
  th: {
    padding: '12px 16px',
    fontWeight: '600',
    color: 'var(--text-muted)',
    fontSize: '0.8rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  td: {
    padding: '14px 16px',
    color: 'var(--text-main)',
    verticalAlign: 'middle'
  },
  userCell: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  userAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.95rem',
    fontWeight: '700'
  },
  userAvatarSmall: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    color: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.8rem',
    fontWeight: '700'
  },
  roleBadge: {
    padding: '3px 8px',
    borderRadius: '9999px',
    fontSize: '0.75rem',
    fontWeight: '600'
  },
  actionRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: '8px'
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 12px',
    backgroundColor: 'var(--bg-app)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-main)',
    ':hover': {
      backgroundColor: 'var(--bg-column)'
    }
  },
  actionBtnDelete: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '6px',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    borderRadius: 'var(--border-radius-sm)',
    color: '#ef4444',
    ':hover': {
      backgroundColor: 'rgba(239, 68, 68, 0.15)',
      borderColor: '#ef4444'
    }
  },
  projectsLayout: {
    display: 'flex',
    gap: '20px',
    alignItems: 'stretch',
    height: '100%',
    overflow: 'hidden'
  },
  projectsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    overflowY: 'auto',
    flex: 1
  },
  projectRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '14px 18px',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--border-color)',
    transition: 'all var(--transition-fast)'
  },
  projectInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  projectHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  projectNameText: {
    fontSize: '0.95rem',
    fontWeight: '700'
  },
  privacyBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '0.7rem',
    fontWeight: '600'
  },
  projectDetailsText: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)'
  },
  projectActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  sidePanel: {
    width: '320px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-md)',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-sm)',
    overflow: 'hidden'
  },
  sidePanelHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '10px',
    marginBottom: '15px'
  },
  smallCloseBtn: {
    color: 'var(--text-muted)',
    cursor: 'pointer'
  },
  addAccessContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginBottom: '18px'
  },
  fieldLabel: {
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
    display: 'block',
    marginBottom: '8px'
  },
  addSelectRow: {
    width: '100%'
  },
  select: {
    width: '100%',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    padding: '8px 10px',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem'
  },
  noMembersText: {
    fontSize: '0.8rem',
    color: 'var(--text-light)',
    fontStyle: 'italic'
  },
  projectMembersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '4px'
  },
  memberAccessRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '8px 10px',
    backgroundColor: 'var(--bg-app)',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--border-color)'
  },
  removeAccessBtn: {
    color: 'var(--text-muted)',
    padding: '2px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ':hover': {
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      color: '#ef4444'
    }
  },
  emptyCardList: {
    padding: '20px 10px',
    border: '1px dashed var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    marginTop: '6px'
  },
  centered: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 0',
    flex: 1
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    height: '100%',
    backgroundColor: 'var(--bg-board)',
    textAlign: 'center',
    padding: '20px'
  },
  spinner: {
    width: '32px',
    height: '32px',
    border: '3px solid var(--border-color)',
    borderTop: '3px solid var(--brand-red)',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  }
};
