import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { 
  X, Trash2, Calendar, Clock, Plus, 
  Paperclip, MessageSquare, CheckSquare, 
  User, Play, Pause, Check, Edit2, Download, Eye, EyeOff
} from 'lucide-react';

// Custom Markdown Parser Component
function MarkdownRenderer({ text }) {
  if (!text) return null;

  // Escape HTML tags to prevent XSS
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Headers
  html = html.replace(/^### (.*$)/gim, '<h3 style="margin: 12px 0 6px 0; font-size: 1.05rem; font-weight: 700; color: var(--text-main); font-family: var(--font-family-display);">$1</h3>');
  html = html.replace(/^## (.*$)/gim, '<h2 style="margin: 16px 0 8px 0; font-size: 1.2rem; font-weight: 700; color: var(--text-main); font-family: var(--font-family-display); border-bottom: 1px solid var(--border-color); padding-bottom: 4px;">$1</h2>');
  html = html.replace(/^# (.*$)/gim, '<h1 style="margin: 20px 0 10px 0; font-size: 1.4rem; font-weight: 800; color: var(--text-main); font-family: var(--font-family-display); border-bottom: 1px solid var(--border-color); padding-bottom: 6px;">$1</h1>');

  // Bold & Italic
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/__(.*?)__/g, '<strong>$1</strong>');
  html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
  html = html.replace(/_(.*?)_/g, '<em>$1</em>');

  // Inline Code
  html = html.replace(/`(.*?)`/g, '<code style="background-color: var(--bg-app); padding: 2px 6px; border-radius: 4px; font-family: monospace; font-size: 0.88em; color: var(--brand-red); border: 1px solid var(--border-color);">$1</code>');

  // Links
  html = html.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color: var(--brand-red); text-decoration: underline; font-weight: 500;">$1</a>');

  // Bullet Lists
  html = html.replace(/^\s*-\s+(.*$)/gim, '<li style="margin-left: 20px; margin-bottom: 4px; list-style-type: disc;">$1</li>');
  html = html.replace(/^\s*\*\s+(.*$)/gim, '<li style="margin-left: 20px; margin-bottom: 4px; list-style-type: disc;">$1</li>');

  const lines = html.split('\n').map(line => {
    if (line.trim().startsWith('<h') || line.trim().startsWith('<li') || line.trim().startsWith('<ul') || line.trim().startsWith('<ol')) {
      return line;
    }
    return `<p style="margin-bottom: 8px; line-height: 1.6; min-height: 1em;">${line}</p>`;
  });

  return (
    <div 
      style={{ fontSize: '0.92rem', color: 'var(--text-main)' }} 
      dangerouslySetInnerHTML={{ __html: lines.join('') }} 
    />
  );
}

// Interactive 3D STL Viewer Component using Three.js dynamically loaded
function STLViewer({ fileUrl }) {
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    let renderer, scene, camera, mesh, animationFrameId;

    const loadScript = (src) => {
      return new Promise((resolve, reject) => {
        const exist = document.querySelector(`script[src="${src}"]`);
        if (exist) {
          resolve();
          return;
        }
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject();
        document.head.appendChild(script);
      });
    };

    async function initThree() {
      try {
        setLoading(true);
        // Load ThreeJS dynamically to keep local packages extremely fast
        await loadScript('https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js');
        await loadScript('https://cdn.jsdelivr.net/gh/mrdoob/three.js@r128/examples/js/loaders/STLLoader.js');

        if (!active) return;
        if (!window.THREE) {
          throw new Error("Three.js not loaded");
        }

        const THREE = window.THREE;
        const width = containerRef.current.clientWidth || 300;
        const height = 240;

        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0x090d16); // Nice dark background

        // Camera
        camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
        camera.position.set(0, 0, 100);

        // Renderer
        renderer = new THREE.WebGLRenderer({ antialias: true });
        renderer.setSize(width, height);
        
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(renderer.domElement);

        // Lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        scene.add(ambientLight);

        const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
        dirLight1.position.set(1, 1, 1).normalize();
        scene.add(dirLight1);

        const dirLight2 = new THREE.DirectionalLight(0xcf2737, 0.7); // Premium crimson light
        dirLight2.position.set(-1, -1, 1).normalize();
        scene.add(dirLight2);

        // Load STL
        const loader = new THREE.STLLoader();
        loader.load(fileUrl, (geometry) => {
          if (!active) return;
          geometry.computeVertexNormals();

          // Gorgeous steel-crimson metallic material
          const material = new THREE.MeshStandardMaterial({
            color: 0xcf2737,
            roughness: 0.35,
            metalness: 0.8
          });

          mesh = new THREE.Mesh(geometry, material);
          geometry.center();
          geometry.computeBoundingSphere();
          const sphere = geometry.boundingSphere;
          
          camera.position.set(0, 0, sphere.radius * 2.2);
          camera.lookAt(0, 0, 0);

          scene.add(mesh);
          setLoading(false);
        }, undefined, (err) => {
          console.error(err);
          setError("Erreur de chargement du modèle 3D.");
          setLoading(false);
        });

        // Basic Orbit Controls drag mapping
        let isDragging = false;
        let previousMousePosition = { x: 0, y: 0 };

        const handleMouseDown = () => { isDragging = true; };
        const handleMouseMove = (e) => {
          const deltaMove = {
            x: e.offsetX - previousMousePosition.x,
            y: e.offsetY - previousMousePosition.y
          };

          if (isDragging && mesh) {
            mesh.rotation.y += deltaMove.x * 0.01;
            mesh.rotation.x += deltaMove.y * 0.01;
          }

          previousMousePosition = { x: e.offsetX, y: e.offsetY };
        };
        const handleMouseUp = () => { isDragging = false; };

        const dom = renderer.domElement;
        dom.addEventListener('mousedown', handleMouseDown);
        dom.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);

        // Animation Frame
        const animate = () => {
          if (!active) return;
          animationFrameId = requestAnimationFrame(animate);
          
          if (!isDragging && mesh) {
            mesh.rotation.y += 0.005; // Passive spin
          }

          renderer.render(scene, camera);
        };
        animate();

        const handleResize = () => {
          if (!renderer || !camera || !containerRef.current) return;
          const w = containerRef.current.clientWidth;
          camera.aspect = w / height;
          camera.updateProjectionMatrix();
          renderer.setSize(w, height);
        };
        window.addEventListener('resize', handleResize);

        return () => {
          active = false;
          cancelAnimationFrame(animationFrameId);
          window.removeEventListener('resize', handleResize);
          if (dom) {
            dom.removeEventListener('mousedown', handleMouseDown);
            dom.removeEventListener('mousemove', handleMouseMove);
          }
          window.removeEventListener('mouseup', handleMouseUp);
        };

      } catch (err) {
        console.error(err);
        setError("Erreur initialisation lecteur 3D.");
        setLoading(false);
      }
    }

    initThree();

    return () => {
      active = false;
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [fileUrl]);

  return (
    <div style={styles.stlContainer}>
      {loading && (
        <div style={styles.stlLoaderBox}>
          <div className="pulse-border-active" style={styles.stlPulse}></div>
          <span>Chargement du modèle 3D STL...</span>
        </div>
      )}
      {error && <div style={styles.stlError}>{error}</div>}
      <div ref={containerRef} style={{ width: '100%', height: '240px', cursor: 'grab' }}></div>
      {!loading && !error && (
        <div style={styles.stlControlsHint}>
          💡 Glisser pour pivoter le modèle 3D STL
        </div>
      )}
    </div>
  );
}

export default function CardDetailModal({ cardId, onClose, onCardUpdated }) {
  const { user } = useAuth();
  const [card, setCard] = useState(null);
  const [loading, setLoading] = useState(true);

  // Edit fields
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  
  const [isEditingDesc, setIsEditingDesc] = useState(false);
  const [editDesc, setEditDesc] = useState('');

  // Checklist states
  const [newTaskTitle, setNewTaskTitle] = useState('');

  // Comment states
  const [newComment, setNewComment] = useState('');

  // Label addition states
  const [showAddLabel, setShowAddLabel] = useState(false);
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState('#cf2737'); // Default STAN Red

  // Assignee states
  const [showAddAssignee, setShowAddAssignee] = useState(false);
  const [boardMembers, setBoardMembers] = useState([]);
  const [boardLists, setBoardLists] = useState([]);

  // File upload reference
  const fileInputRef = useRef(null);
  const [uploading, setUploading] = useState(false);

  // Preview attachment drawer
  const [previewAttachmentId, setPreviewAttachmentId] = useState(null);

  // Drag & drop file uploading states
  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const dragCounter = useRef(0);

  // Load detailed card info
  const loadCardDetails = async () => {
    try {
      const data = await api.getCard(cardId);
      setCard(data);
      setEditTitle(data.title);
      setEditDesc(data.description || '');

      // Load all lists of this board so we can change its column!
      if (data.board_id) {
        const listsData = await api.getBoardLists(data.board_id);
        setBoardLists(listsData);
      }

      // Load members
      const membersData = await api.getUsers();
      setBoardMembers(membersData);
    } catch (err) {
      console.error("Error loading card details:", err);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  const handleMoveColumn = async (newListId) => {
    try {
      await api.updateCard(cardId, { list_id: newListId });
      setCard(prev => ({ ...prev, list_id: newListId }));
      onCardUpdated();
    } catch (err) {
      alert("Erreur de déplacement de la carte : " + err.message);
    }
  };

  useEffect(() => {
    loadCardDetails();
  }, [cardId]);

  // Drag and Drop event handlers
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current++;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDraggingFile(true);
    }
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current--;
    if (dragCounter.current === 0) {
      setIsDraggingFile(false);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);
    dragCounter.current = 0;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      setUploading(true);
      try {
        for (const file of files) {
          const attachment = await api.uploadAttachment(cardId, file);
          setCard(prev => ({
            ...prev,
            attachments: [attachment, ...(prev.attachments || [])]
          }));
        }
        onCardUpdated();
      } catch (err) {
        alert(err.message || "Erreur d'envoi de fichier.");
      } finally {
        setUploading(false);
      }
    }
  };

  // Actions
  const handleUpdateTitle = async () => {
    if (!editTitle.trim()) return;
    setIsEditingTitle(false);
    try {
      await api.updateCard(cardId, { title: editTitle.trim() });
      setCard(prev => ({ ...prev, title: editTitle.trim() }));
      onCardUpdated();
    } catch (err) {
      alert("Erreur de mise à jour.");
    }
  };

  const handleUpdateDesc = async () => {
    setIsEditingDesc(false);
    try {
      await api.updateCard(cardId, { description: editDesc });
      setCard(prev => ({ ...prev, description: editDesc }));
      onCardUpdated();
    } catch (err) {
      alert("Erreur.");
    }
  };

  const handleUpdateDueDate = async (dateVal) => {
    try {
      await api.updateCard(cardId, { due_date: dateVal || null });
      setCard(prev => ({ ...prev, due_date: dateVal || null }));
      onCardUpdated();
    } catch (err) {
      alert("Erreur.");
    }
  };

  // Assignee addition
  const handleToggleAssignee = async (memberId) => {
    const isAssigned = card.assignees?.some(a => a.id === memberId);
    try {
      if (isAssigned) {
        await api.unassignUser(cardId, memberId);
        setCard(prev => ({
          ...prev,
          assignees: prev.assignees.filter(a => a.id !== memberId)
        }));
      } else {
        const newUser = await api.assignUser(cardId, memberId);
        setCard(prev => ({
          ...prev,
          assignees: [...(prev.assignees || []), newUser]
        }));
      }
      onCardUpdated();
    } catch (err) {
      alert(err.message || "Erreur de d'assignation.");
    }
  };

  // Labels Creator
  const handleAddLabel = async (e) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;
    try {
      const label = await api.addLabel(cardId, newLabelName.trim(), newLabelColor);
      setCard(prev => ({
        ...prev,
        labels: [...(prev.labels || []), label]
      }));
      setNewLabelName('');
      setShowAddLabel(false);
      onCardUpdated();
    } catch (err) {
      alert("Erreur.");
    }
  };

  const handleDeleteLabel = async (labelId) => {
    try {
      await api.deleteLabel(labelId);
      setCard(prev => ({
        ...prev,
        labels: prev.labels.filter(l => l.id !== labelId)
      }));
      onCardUpdated();
    } catch (err) {
      alert("Erreur.");
    }
  };

  // Checklist Tasks
  const handleAddTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    try {
      const t = await api.addTask(cardId, newTaskTitle.trim());
      setCard(prev => ({
        ...prev,
        tasks: [...(prev.tasks || []), t]
      }));
      setNewTaskTitle('');
      onCardUpdated();
    } catch (err) {
      alert("Erreur.");
    }
  };

  const handleToggleTask = async (taskId, currentCompleted) => {
    const nextVal = currentCompleted ? 0 : 1;
    // Optimistic
    setCard(prev => ({
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, is_completed: nextVal } : t)
    }));
    try {
      await api.updateTask(taskId, { is_completed: nextVal });
      onCardUpdated();
    } catch (err) {
      loadCardDetails();
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await api.deleteTask(taskId);
      setCard(prev => ({
        ...prev,
        tasks: prev.tasks.filter(t => t.id !== taskId)
      }));
      onCardUpdated();
    } catch (err) {
      alert("Erreur.");
    }
  };

  // Comment Thread
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    try {
      const c = await api.addComment(cardId, newComment.trim());
      setCard(prev => ({
        ...prev,
        comments: [c, ...(prev.comments || [])]
      }));
      setNewComment('');
      onCardUpdated();
    } catch (err) {
      alert("Erreur.");
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.deleteComment(commentId);
      setCard(prev => ({
        ...prev,
        comments: prev.comments.filter(c => c.id !== commentId)
      }));
      onCardUpdated();
    } catch (err) {
      alert(err.message || "Erreur de suppression.");
    }
  };



  // File Upload Attachments
  const handleUploadFile = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const attachment = await api.uploadAttachment(cardId, file);
      setCard(prev => ({
        ...prev,
        attachments: [attachment, ...(prev.attachments || [])]
      }));
      onCardUpdated();
    } catch (err) {
      alert("Erreur de téléversement : " + err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteAttachment = async (attachmentId) => {
    if (confirm("Supprimer cette pièce jointe ?")) {
      try {
        await api.deleteAttachment(attachmentId);
        setCard(prev => ({
          ...prev,
          attachments: prev.attachments.filter(a => a.id !== attachmentId)
        }));
        onCardUpdated();
      } catch (err) {
        alert("Erreur.");
      }
    }
  };

  const handleDeleteCard = async () => {
    if (confirm("Voulez-vous supprimer définitivement cette carte ?")) {
      try {
        await api.deleteCard(cardId);
        onCardUpdated();
        onClose();
      } catch (err) {
        alert("Erreur.");
      }
    }
  };

  const totalTasks = card?.tasks?.length || 0;
  const completedTasks = card?.tasks?.filter(t => t.is_completed === 1).length || 0;
  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Predefined cool label colors
  const LABEL_PALETTE = ['#cf2737', '#1e293b', '#2563eb', '#16a34a', '#d97706', '#9333ea', '#db2777', '#0d9488'];

  if (loading || !card) {
    return (
      <div style={styles.modalOverlay}>
        <div className="glass-panel" style={styles.loadingBox}>
          Chargement des détails de la tâche...
        </div>
      </div>
    );
  }

  return (
    <div 
      style={styles.modalOverlay} 
      onClick={onClose}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {isDraggingFile && (
        <div style={styles.dragFileOverlay}>
          <div style={styles.dragFileCard}>
            <Paperclip size={48} style={{ color: 'var(--brand-red)', marginBottom: '8px' }} />
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#ffffff' }}>Déposez vos fichiers ici</h3>
            <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>Ajouter directement à cette carte en pièce jointe</p>
          </div>
        </div>
      )}
      <div 
        className="glass-panel animate-modal" 
        style={styles.modalContainer} 
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div style={styles.modalHeader}>
          <div style={styles.headerTitleRow}>
            <CheckSquare size={22} style={{ color: 'var(--brand-red)', marginTop: '2px' }} />
            <div style={{ flex: 1 }}>
              {isEditingTitle ? (
                <div style={styles.titleEditGroup}>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    style={styles.titleInput}
                    autoFocus
                  />
                  <button onClick={handleUpdateTitle} style={styles.btnIconOk}><Check size={16} /></button>
                  <button onClick={() => { setIsEditingTitle(false); setEditTitle(card.title); }} style={styles.btnIconCancel}><X size={16} /></button>
                </div>
              ) : (
                <h3 
                  onClick={() => setIsEditingTitle(true)}
                  style={styles.cardTitle}
                  title="Cliquer pour modifier"
                >
                  {card.title} <Edit2 size={12} style={styles.editIconInline} />
                </h3>
              )}
              <span style={styles.listSubtext}>
                Colonne :{' '}
                <select
                  value={card.list_id}
                  onChange={(e) => handleMoveColumn(parseInt(e.target.value))}
                  style={styles.columnSelect}
                >
                  {boardLists.map((list) => (
                    <option key={list.id} value={list.id}>
                      {list.name}
                    </option>
                  ))}
                </select>
              </span>
            </div>
          </div>

          <div style={styles.headerActions}>
            <button onClick={handleDeleteCard} style={styles.btnDelete} title="Supprimer la carte">
              <Trash2 size={16} /> Supprimer
            </button>
            <button onClick={onClose} style={styles.btnClose}>
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Modal Content Grid */}
        <div style={styles.modalBodyGrid}>
          {/* LEFT PANEL: Core features (desc, checklists, attachments, comments) */}
          <div style={styles.leftPanel}>
            


            {/* 2. Description Block */}
            <div style={styles.section}>
              <h4 style={styles.sectionTitle}><Edit2 size={16} /> Description</h4>
              {isEditingDesc ? (
                <div style={styles.descEditArea}>
                  <textarea
                    value={editDesc}
                    onChange={(e) => setEditDesc(e.target.value)}
                    placeholder="Ajouter une description détaillée pour cette tâche..."
                    style={styles.textarea}
                    rows={4}
                  />
                  <div style={styles.descEditActions}>
                    <button onClick={handleUpdateDesc} style={styles.btnSmallOk}>Enregistrer</button>
                    <button onClick={() => { setIsEditingDesc(false); setEditDesc(card.description || ''); }} style={styles.btnSmallCancel}>Annuler</button>
                  </div>
                </div>
              ) : (
                <div 
                  onClick={() => setIsEditingDesc(true)}
                  style={styles.descDisplayBox}
                  className="glass-panel"
                  title="Cliquer pour modifier"
                >
                  {card.description ? (
                    <MarkdownRenderer text={card.description} />
                  ) : (
                    <span style={styles.descPlaceholder}>Ajouter une description détaillée... (Markdown supporté : # Titre, **Gras**, - Liste)</span>
                  )}
                  <Edit2 size={14} style={styles.editIconFloat} />
                </div>
              )}
            </div>

            {/* 3. Checklist tasks section */}
            <div style={styles.section}>
              <div style={styles.checklistHeader}>
                <h4 style={styles.sectionTitle}><CheckSquare size={16} /> Liste de tâches</h4>
                {totalTasks > 0 && <span style={styles.percentText}>{completionPercentage}% complété</span>}
              </div>

              {/* Progress bar */}
              {totalTasks > 0 && (
                <div style={styles.progressBarBg}>
                  <div style={{ ...styles.progressBarFill, width: `${completionPercentage}%` }} />
                </div>
              )}

              {/* Checklist items */}
              <div style={styles.checklistItems}>
                {card.tasks?.map((task) => (
                  <div key={task.id} style={styles.checkItemRow}>
                    <input
                      type="checkbox"
                      checked={task.is_completed === 1}
                      onChange={() => handleToggleTask(task.id, task.is_completed === 1)}
                      className="custom-checkbox"
                    />
                    <span style={{
                      ...styles.checkItemTitle,
                      textDecoration: task.is_completed === 1 ? 'line-through' : 'none',
                      color: task.is_completed === 1 ? 'var(--text-light)' : 'var(--text-main)'
                    }}>
                      {task.title}
                    </span>
                    <Trash2 
                      size={14} 
                      onClick={() => handleDeleteTask(task.id)}
                      style={styles.checkItemDelete}
                    />
                  </div>
                ))}
              </div>

              {/* Add checklist item */}
              <form onSubmit={handleAddTask} style={styles.addChecklistForm}>
                <input
                  type="text"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  placeholder="Ajouter un élément..."
                  style={styles.checklistInput}
                />
                <button type="submit" style={styles.btnSmallOk}>Ajouter</button>
              </form>
            </div>

            {/* 4. Attachments Section */}
            <div style={styles.section}>
              <div style={styles.checklistHeader}>
                <h4 style={styles.sectionTitle}><Paperclip size={16} /> Pièces jointes</h4>
                <button 
                  onClick={() => fileInputRef.current.click()} 
                  style={styles.btnAddItem}
                  disabled={uploading}
                >
                  <Plus size={14} /> {uploading ? 'Envoi...' : 'Ajouter'}
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleUploadFile}
                  style={{ display: 'none' }}
                />
              </div>

              <div style={styles.attachmentsList}>
                {card.attachments?.map((attachment) => {
                  const ext = attachment.name.split('.').pop().toLowerCase();
                  const isPreviewable = ['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif', 'svg', 'stl', 'mp4', 'webm', 'ogg', 'mp3', 'wav', 'pdf'].includes(ext);
                  const isCurrentlyPreviewed = previewAttachmentId === attachment.id;

                  return (
                    <div key={attachment.id} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={styles.attachmentCard} className="glass-panel">
                        <div style={styles.attachLeft}>
                          <Paperclip size={18} style={{ color: 'var(--brand-red)' }} />
                          <div style={styles.attachDetails}>
                            <a 
                              href={attachment.file_path} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              style={styles.attachName}
                            >
                              {attachment.name}
                            </a>
                            <span style={styles.attachMeta}>Ajouté par {attachment.uploaded_by_name || 'Membre'}</span>
                          </div>
                        </div>
                        <div style={styles.attachActions}>
                          {isPreviewable && (
                            <button
                              onClick={() => setPreviewAttachmentId(isCurrentlyPreviewed ? null : attachment.id)}
                              style={styles.attachBtn}
                              title={isCurrentlyPreviewed ? "Fermer l'aperçu" : "Voir l'aperçu"}
                            >
                              {isCurrentlyPreviewed ? <EyeOff size={14} /> : <Eye size={14} />}
                            </button>
                          )}
                          <a 
                            href={attachment.file_path} 
                            download
                            style={styles.attachBtn} 
                            title="Télécharger"
                          >
                            <Download size={14} />
                          </a>
                          <button 
                            onClick={() => handleDeleteAttachment(attachment.id)}
                            style={styles.attachBtnDelete} 
                            title="Supprimer"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Attachment Preview Box */}
                      {isCurrentlyPreviewed && (
                        <div style={styles.previewDrawer} className="animate-fade glass-panel">
                          {/* Image Preview */}
                          {['png', 'jpg', 'jpeg', 'webp', 'gif', 'avif', 'svg'].includes(ext) && (
                            <img 
                              src={attachment.file_path} 
                              alt={attachment.name} 
                              style={styles.imagePreview} 
                            />
                          )}

                          {/* Interactive 3D STL Preview */}
                          {ext === 'stl' && (
                            <STLViewer fileUrl={attachment.file_path} />
                          )}

                          {/* Video Preview */}
                          {['mp4', 'webm', 'ogg'].includes(ext) && (
                            <video 
                              src={attachment.file_path} 
                              controls 
                              style={styles.videoPreview} 
                            />
                          )}

                          {/* Audio Preview */}
                          {['mp3', 'wav'].includes(ext) && (
                            <div style={styles.audioPreviewWrapper}>
                              <audio src={attachment.file_path} controls style={{ width: '100%' }} />
                            </div>
                          )}

                          {/* PDF Frame Preview */}
                          {ext === 'pdf' && (
                            <iframe 
                              src={attachment.file_path} 
                              style={styles.pdfPreview} 
                              title={attachment.name}
                            />
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
                {(!card.attachments || card.attachments.length === 0) && (
                  <div style={styles.emptyFilesText}>Aucun fichier joint.</div>
                )}
              </div>
            </div>

            {/* 5. Comments Section */}
            <div style={styles.section}>
              <h4 style={styles.sectionTitle}><MessageSquare size={16} /> Discussion</h4>
              
              {/* Comment Form */}
              <form onSubmit={handleAddComment} style={styles.commentForm}>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Écrire un commentaire..."
                  style={styles.commentTextarea}
                  rows={2}
                />
                <button type="submit" className="btn-primary" style={styles.commentBtn}>
                  Envoyer
                </button>
              </form>

              {/* Comments Timeline */}
              <div style={styles.commentsList}>
                {card.comments?.map((comment) => (
                  <div key={comment.id} style={styles.commentCard}>
                    <div style={{ ...styles.commentAvatar, backgroundColor: comment.avatar_color }}>
                      {comment.display_name?.charAt(0).toUpperCase()}
                    </div>
                    <div style={styles.commentBody}>
                      <div style={styles.commentHeader}>
                        <span style={styles.commentAuthor}>{comment.display_name}</span>
                        <span style={styles.commentTime}>
                          {new Date(comment.created_at).toLocaleDateString('fr-FR', {
                            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                          })}
                        </span>
                        {comment.user_id === user?.id && (
                          <Trash2 
                            size={12} 
                            onClick={() => handleDeleteComment(comment.id)}
                            style={styles.commentDelete}
                            title="Supprimer mon commentaire"
                          />
                        )}
                      </div>
                      <p style={styles.commentTextContent}>{comment.content}</p>
                    </div>
                  </div>
                ))}
                {(!card.comments || card.comments.length === 0) && (
                  <div style={styles.emptyFilesText}>Soyez le premier à commenter !</div>
                )}
              </div>
            </div>

          </div>

          {/* RIGHT PANEL: Metadata parameters (assignees, labels, due dates) */}
          <div style={styles.rightPanel}>
            
            {/* 1. Due Date Widget */}
            <div style={styles.sidebarSection}>
              <label style={styles.sidebarLabel}><Calendar size={14} /> Date d'échéance</label>
              <input
                type="date"
                value={card.due_date ? card.due_date.substring(0, 10) : ''}
                onChange={(e) => handleUpdateDueDate(e.target.value)}
                style={styles.datePicker}
              />
              {card.due_date && (
                <button 
                  onClick={() => handleUpdateDueDate(null)} 
                  style={styles.btnTextCancel}
                >
                  Effacer l'échéance
                </button>
              )}
            </div>

            {/* 2. Assignees Section */}
            <div style={styles.sidebarSection}>
              <div style={styles.sidebarHeaderRow}>
                <label style={styles.sidebarLabel}><User size={14} /> Membres assignés</label>
                <button 
                  onClick={() => setShowAddAssignee(!showAddAssignee)} 
                  style={styles.btnAddItemSmall}
                >
                  <Plus size={12} /> Gérer
                </button>
              </div>

              {/* Overlapping circular avatars */}
              <div style={styles.assigneesAvatars}>
                {card.assignees?.map(assignee => (
                  <div 
                    key={assignee.id} 
                    style={{ ...styles.largeAvatar, backgroundColor: assignee.avatar_color }}
                    title={assignee.display_name}
                  >
                    {assignee.display_name.charAt(0).toUpperCase()}
                  </div>
                ))}
                {(!card.assignees || card.assignees.length === 0) && (
                  <span style={styles.emptySidebarText}>Aucun membre assigné.</span>
                )}
              </div>

              {/* Assignees dropdown selection */}
              {showAddAssignee && (
                <div className="glass-panel" style={styles.sidebarDropdown}>
                  <div style={styles.dropdownHeaderSmall}>
                    <span>Assigner un membre</span>
                    <X size={12} onClick={() => setShowAddAssignee(false)} style={{ cursor: 'pointer' }} />
                  </div>
                  <div style={styles.dropdownListSmall}>
                    {boardMembers.map(member => {
                      const isAssigned = card.assignees?.some(a => a.id === member.id);
                      return (
                        <div 
                          key={member.id} 
                          onClick={() => handleToggleAssignee(member.id)}
                          style={styles.dropdownItemSmall}
                        >
                          <div style={{ ...styles.dropdownAvatarSmall, backgroundColor: member.avatar_color }}>
                            {member.display_name.charAt(0).toUpperCase()}
                          </div>
                          <span style={{ flex: 1 }}>{member.display_name}</span>
                          {isAssigned && <Check size={14} style={{ color: 'var(--brand-red)' }} />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Labels Tags Section */}
            <div style={styles.sidebarSection}>
              <div style={styles.sidebarHeaderRow}>
                <label style={styles.sidebarLabel}>Étiquettes (Tags)</label>
                <button 
                  onClick={() => setShowAddLabel(!showAddLabel)} 
                  style={styles.btnAddItemSmall}
                >
                  <Plus size={12} /> Nouveau
                </button>
              </div>

              <div style={styles.labelsTagsList}>
                {card.labels?.map(label => (
                  <span 
                    key={label.id} 
                    style={{ ...styles.tagItem, backgroundColor: label.color }}
                  >
                    {label.name}
                    <X 
                      size={12} 
                      onClick={() => handleDeleteLabel(label.id)}
                      style={styles.deleteTagIcon}
                    />
                  </span>
                ))}
                {(!card.labels || card.labels.length === 0) && (
                  <span style={styles.emptySidebarText}>Aucune étiquette.</span>
                )}
              </div>

              {/* Add labels inline popover */}
              {showAddLabel && (
                <form onSubmit={handleAddLabel} className="glass-panel" style={styles.sidebarForm}>
                  <div style={styles.dropdownHeaderSmall}>
                    <span>Créer une étiquette</span>
                    <X size={12} onClick={() => setShowAddLabel(false)} style={{ cursor: 'pointer' }} />
                  </div>
                  <input
                    type="text"
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    placeholder="Nom du tag..."
                    style={styles.sidebarInput}
                    autoFocus
                  />
                  
                  {/* Colors choices */}
                  <div style={styles.paletteRow}>
                    {LABEL_PALETTE.map(color => (
                      <div 
                        key={color} 
                        onClick={() => setNewLabelColor(color)}
                        style={{
                          ...styles.paletteColor,
                          backgroundColor: color,
                          border: newLabelColor === color ? '2px solid white' : '1px solid rgba(255,255,255,0.1)',
                          transform: newLabelColor === color ? 'scale(1.15)' : 'scale(1)'
                        }}
                      />
                    ))}
                  </div>
                  
                  <button type="submit" style={styles.btnSmallOk}>Ajouter le tag</button>
                </form>
              )}
            </div>

            {/* Visual branding info */}
            <div style={styles.brandPanel} className="glass-panel">
              <span style={styles.brandTitleText}>STAN ROBOTIX</span>
              <span style={styles.brandMetaText}>Version 1.0.0</span>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}

// Inline JS layouts and structures
const styles = {
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    backdropFilter: 'blur(6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
    padding: '1.5rem'
  },
  modalContainer: {
    width: '100%',
    maxWidth: '920px',
    height: '90vh',
    borderRadius: 'var(--border-radius-lg)',
    display: 'flex',
    flexDirection: 'column',
    boxShadow: 'var(--shadow-premium)',
    overflow: 'hidden'
  },
  loadingBox: {
    padding: '2rem',
    borderRadius: 'var(--border-radius-md)',
    fontSize: '1.1rem',
    color: 'var(--text-muted)'
  },
  modalHeader: {
    padding: '1.25rem 1.5rem',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: '20px'
  },
  headerTitleRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
    flex: 1
  },
  cardTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: 'var(--text-main)',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: '10px',
    ':hover': {
      color: 'var(--brand-red)'
    }
  },
  titleEditGroup: {
    display: 'flex',
    gap: '6px',
    alignItems: 'center',
    width: '100%'
  },
  titleInput: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: 'var(--text-main)',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '4px 10px',
    flex: 1
  },
  btnIconOk: {
    backgroundColor: '#16a34a',
    color: '#ffffff',
    padding: '8px',
    borderRadius: 'var(--border-radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  btnIconCancel: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: 'var(--text-main)',
    border: '1px solid var(--border-color)',
    padding: '8px',
    borderRadius: 'var(--border-radius-sm)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  editIconInline: {
    color: 'var(--text-light)',
    opacity: 0.5
  },
  listSubtext: {
    fontSize: '0.82rem',
    color: 'var(--text-muted)',
    marginTop: '4px',
    display: 'block'
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  btnDelete: {
    color: '#ef4444',
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.15)',
    padding: '8px 12px',
    borderRadius: 'var(--border-radius-sm)'
  },
  btnClose: {
    color: 'var(--text-muted)',
    ':hover': {
      color: 'var(--text-main)'
    }
  },
  modalBodyGrid: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden'
  },
  leftPanel: {
    flex: 1,
    padding: '1.5rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.75rem'
  },
  rightPanel: {
    width: '280px',
    minWidth: '280px',
    borderLeft: '1px solid var(--border-color)',
    padding: '1.5rem',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '1.75rem',
    backgroundColor: 'rgba(255, 255, 255, 0.01)'
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  sectionTitle: {
    fontSize: '0.95rem',
    fontWeight: '600',
    color: 'var(--text-main)',
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  timerWidget: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px solid var(--border-color)',
    padding: '10px 14px',
    borderRadius: 'var(--border-radius-sm)',
    flexWrap: 'wrap'
  },
  timeDisplay: {
    fontSize: '1.6rem',
    fontWeight: '700',
    fontFamily: 'monospace',
    letterSpacing: '0.5px'
  },
  timerBtn: {
    padding: '8px 14px',
    borderRadius: 'var(--border-radius-sm)',
    color: 'white',
    fontSize: '0.85rem',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  timerActiveLabel: {
    fontSize: '0.78rem',
    color: '#ef4444',
    fontWeight: '500',
    fontStyle: 'italic'
  },
  descEditArea: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  textarea: {
    width: '100%',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    padding: '10px 12px',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.92rem',
    lineHeight: '1.5',
    resize: 'vertical'
  },
  descDisplayBox: {
    borderRadius: 'var(--border-radius-sm)',
    padding: '12px 14px',
    cursor: 'pointer',
    position: 'relative',
    minHeight: '80px',
    transition: 'all var(--transition-fast)',
    border: '1px solid var(--border-color)',
    backgroundColor: 'var(--bg-card)'
  },
  descText: {
    fontSize: '0.92rem',
    color: 'var(--text-main)',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap'
  },
  descPlaceholder: {
    fontSize: '0.9rem',
    color: 'var(--text-light)',
    fontStyle: 'italic'
  },
  editIconFloat: {
    position: 'absolute',
    bottom: '10px',
    right: '10px',
    color: 'var(--text-light)',
    opacity: 0.4
  },
  checklistHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4px'
  },
  percentText: {
    fontSize: '0.8rem',
    fontWeight: '600',
    color: 'var(--brand-red)'
  },
  progressBarBg: {
    width: '100%',
    height: '8px',
    backgroundColor: 'var(--bg-app)',
    borderRadius: '4px',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'var(--brand-red)',
    borderRadius: '4px',
    transition: 'width var(--transition-normal)'
  },
  checklistItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '8px'
  },
  checkItemRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '6px 8px',
    borderRadius: 'var(--border-radius-sm)',
    transition: 'background var(--transition-fast)',
    ':hover': {
      backgroundColor: 'rgba(255, 255, 255, 0.02)'
    }
  },
  checkItemTitle: {
    flex: 1,
    fontSize: '0.9rem'
  },
  checkItemDelete: {
    color: 'var(--text-light)',
    cursor: 'pointer',
    opacity: 0.5,
    ':hover': {
      color: '#ef4444',
      opacity: 1
    }
  },
  addChecklistForm: {
    display: 'flex',
    gap: '8px',
    marginTop: '10px'
  },
  checklistInput: {
    flex: 1,
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '6px 12px',
    fontSize: '0.88rem',
    color: 'var(--text-main)'
  },
  btnAddItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.78rem',
    fontWeight: '600',
    color: 'var(--brand-red)',
    backgroundColor: 'var(--brand-red-alpha-10)',
    padding: '4px 10px',
    borderRadius: '4px'
  },
  attachmentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  attachmentCard: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 14px',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--border-color)'
  },
  attachLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  attachDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '2px'
  },
  attachName: {
    fontSize: '0.88rem',
    fontWeight: '600',
    color: 'var(--text-main)',
    textDecoration: 'none',
    ':hover': {
      color: 'var(--brand-red)'
    }
  },
  attachMeta: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)'
  },
  attachActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  attachBtn: {
    color: 'var(--text-muted)',
    padding: '6px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.05)',
      color: 'var(--text-main)'
    }
  },
  attachBtnDelete: {
    color: 'rgba(239, 68, 68, 0.7)',
    padding: '6px',
    borderRadius: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    ':hover': {
      backgroundColor: 'rgba(239,68,68,0.1)',
      color: '#ef4444'
    }
  },
  emptyFilesText: {
    fontSize: '0.85rem',
    color: 'var(--text-light)',
    fontStyle: 'italic',
    padding: '8px 0'
  },
  commentForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    marginTop: '6px'
  },
  commentTextarea: {
    width: '100%',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    padding: '10px 12px',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.9rem',
    resize: 'none'
  },
  commentBtn: {
    alignSelf: 'flex-end',
    fontSize: '0.8rem',
    padding: '6px 14px'
  },
  commentsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    marginTop: '12px'
  },
  commentCard: {
    display: 'flex',
    gap: '12px'
  },
  commentAvatar: {
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    color: 'white',
    fontSize: '0.78rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: '2px'
  },
  commentBody: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.01)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '8px 12px'
  },
  commentHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '4px'
  },
  commentAuthor: {
    fontSize: '0.82rem',
    fontWeight: '600',
    color: 'var(--text-main)'
  },
  commentTime: {
    fontSize: '0.72rem',
    color: 'var(--text-muted)',
    marginLeft: '8px',
    flex: 1
  },
  commentDelete: {
    color: 'var(--text-light)',
    cursor: 'pointer',
    opacity: 0.5,
    ':hover': {
      color: '#ef4444',
      opacity: 1
    }
  },
  commentTextContent: {
    fontSize: '0.88rem',
    color: 'var(--text-main)',
    lineHeight: '1.4'
  },
  sidebarSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  sidebarLabel: {
    fontSize: '0.78rem',
    fontWeight: '600',
    color: 'var(--text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  datePicker: {
    width: '100%',
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '8px 10px',
    fontSize: '0.85rem',
    color: 'var(--text-main)',
    cursor: 'pointer'
  },
  btnTextCancel: {
    fontSize: '0.75rem',
    color: '#ef4444',
    fontWeight: '500',
    alignSelf: 'flex-start',
    marginTop: '2px'
  },
  sidebarHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  btnAddItemSmall: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
    fontSize: '0.72rem',
    fontWeight: '600',
    color: 'var(--brand-red)'
  },
  assigneesAvatars: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '6px'
  },
  largeAvatar: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    color: 'white',
    fontSize: '0.8rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  emptySidebarText: {
    fontSize: '0.8rem',
    color: 'var(--text-light)',
    fontStyle: 'italic'
  },
  sidebarDropdown: {
    width: '100%',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--border-color)',
    padding: '10px',
    marginTop: '6px',
    display: 'flex',
    flexDirection: 'column',
    gap: '6px'
  },
  dropdownHeaderSmall: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '0.78rem',
    fontWeight: '600',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '6px',
    marginBottom: '4px'
  },
  dropdownListSmall: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    maxHeight: '140px',
    overflowY: 'auto'
  },
  dropdownItemSmall: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '4px 6px',
    cursor: 'pointer',
    borderRadius: '4px',
    fontSize: '0.8rem',
    transition: 'background var(--transition-fast)',
    ':hover': {
      backgroundColor: 'rgba(255,255,255,0.05)'
    }
  },
  dropdownAvatarSmall: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    color: 'white',
    fontSize: '0.65rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  labelsTagsList: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },
  tagItem: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '6px',
    padding: '3px 8px',
    borderRadius: '4px',
    fontSize: '0.75rem',
    fontWeight: '600',
    color: 'white'
  },
  deleteTagIcon: {
    cursor: 'pointer',
    opacity: 0.6,
    ':hover': {
      opacity: 1
    }
  },
  sidebarForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '10px',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--border-color)',
    marginTop: '6px'
  },
  sidebarInput: {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '6px 8px',
    fontSize: '0.8rem',
    color: 'var(--text-main)'
  },
  paletteRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px',
    padding: '2px 0'
  },
  paletteColor: {
    width: '18px',
    height: '18px',
    borderRadius: '4px',
    cursor: 'pointer',
    transition: 'transform var(--transition-fast)'
  },
  brandPanel: {
    marginTop: 'auto',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--border-color)',
    padding: '12px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '4px',
    backgroundColor: 'rgba(207, 39, 55, 0.02)',
    borderLeft: '3px solid var(--brand-red)'
  },
  brandTitleText: {
    fontSize: '0.85rem',
    fontWeight: '700',
    letterSpacing: '0.5px',
    color: 'var(--text-main)'
  },
  brandMetaText: {
    fontSize: '0.7rem',
    color: 'var(--text-muted)'
  },
  previewDrawer: {
    marginTop: '8px',
    padding: '8px',
    borderRadius: 'var(--border-radius-sm)',
    border: '1px solid var(--border-color)',
    backgroundColor: '#090d16',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    width: '100%'
  },
  imagePreview: {
    maxWidth: '100%',
    maxHeight: '300px',
    objectFit: 'contain',
    borderRadius: '4px'
  },
  videoPreview: {
    width: '100%',
    maxHeight: '300px',
    borderRadius: '4px',
    backgroundColor: '#000000'
  },
  audioPreviewWrapper: {
    width: '100%',
    padding: '8px 4px'
  },
  pdfPreview: {
    width: '100%',
    height: '350px',
    border: 'none',
    borderRadius: '4px'
  },
  stlContainer: {
    width: '100%',
    backgroundColor: '#090d16',
    borderRadius: '4px',
    position: 'relative',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center'
  },
  stlLoaderBox: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    backgroundColor: 'rgba(9, 13, 22, 0.85)',
    color: '#ffffff',
    zIndex: 10
  },
  stlPulse: {
    width: '20px',
    height: '20px',
    borderRadius: '50%',
    backgroundColor: 'var(--brand-red)'
  },
  stlError: {
    color: '#ef4444',
    padding: '20px',
    textAlign: 'center',
    fontSize: '0.85rem'
  },
  stlControlsHint: {
    fontSize: '0.72rem',
    color: 'rgba(255, 255, 255, 0.6)',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    padding: '4px 10px',
    borderRadius: '9999px',
    position: 'absolute',
    bottom: '10px',
    left: '10px',
    pointerEvents: 'none'
  },
  dragFileOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(9, 13, 22, 0.85)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10000,
    pointerEvents: 'none'
  },
  dragFileCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    color: '#ffffff',
    textAlign: 'center',
    padding: '40px',
    borderRadius: 'var(--border-radius-lg)',
    border: '3px dashed var(--brand-red)',
    backgroundColor: 'rgba(15, 23, 42, 0.95)',
    boxShadow: 'var(--shadow-premium)'
  },
  columnSelect: {
    backgroundColor: 'var(--bg-input)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--text-main)',
    padding: '4px 8px',
    fontSize: '0.8rem',
    fontWeight: '600',
    marginLeft: '6px',
    cursor: 'pointer',
    outline: 'none',
    boxShadow: 'var(--shadow-sm)'
  }
};
