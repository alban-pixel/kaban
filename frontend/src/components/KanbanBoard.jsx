import React, { useState, useEffect } from 'react';
import { api } from '../utils/api.js';
import Card from './Card.jsx';
import { 
  Plus, Search, Users, UserPlus, Filter, 
  X, Check, Trash, ChevronLeft, ChevronRight, MoreHorizontal 
} from 'lucide-react';

export default function KanbanBoard({ boardId, boardName, onOpenCard }) {
  const [lists, setLists] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Members & users lists
  const [boardMembers, setBoardMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [showAddMember, setShowAddMember] = useState(false);

  // Column Add states
  const [showAddList, setShowAddList] = useState(false);
  const [newListName, setNewListName] = useState('');

  // Card Add states (per list)
  const [addingCardToList, setAddingCardToList] = useState(null); // listId if active
  const [newCardTitle, setNewCardTitle] = useState('');

  // Filter & Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMemberFilter, setSelectedMemberFilter] = useState('All');
  const [selectedLabelFilter, setSelectedLabelFilter] = useState('All');

  // Dragging states
  const [draggedCard, setDraggedCard] = useState(null);
  const [dragOverListId, setDragOverListId] = useState(null);

  // Load Board content
  const loadBoardData = async () => {
    if (!boardId) return;
    setLoading(true);
    try {
      const listsData = await api.getBoardLists(boardId);
      setLists(listsData);
      
      const membersData = await api.getBoardMembers(boardId);
      setBoardMembers(membersData);

      const allUsersData = await api.getUsers();
      setAllUsers(allUsersData);
    } catch (err) {
      console.error("Error loading board content:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadBoardData();
  }, [boardId]);

  // Refetch data every 5 seconds to keep synced on local network (Multi-user sync!)
  useEffect(() => {
    if (!boardId) return;
    const interval = setInterval(() => {
      syncBoardData();
    }, 4000);

    return () => clearInterval(interval);
  }, [boardId]);

  const syncBoardData = async () => {
    try {
      const listsData = await api.getBoardLists(boardId);
      setLists(listsData);
      const membersData = await api.getBoardMembers(boardId);
      setBoardMembers(membersData);
    } catch (err) {
      // Fail silently to avoid interrupting UI
    }
  };

  // Add Member
  const handleAddMember = async (userId) => {
    try {
      await api.addBoardMember(boardId, userId);
      await loadBoardData();
      setShowAddMember(false);
    } catch (err) {
      alert(err.message || "Erreur de membre.");
    }
  };

  const handleRemoveMember = async (userId) => {
    if (confirm("Retirer ce membre de ce tableau ?")) {
      try {
        await api.removeBoardMember(boardId, userId);
        await loadBoardData();
      } catch (err) {
        alert("Erreur de retrait.");
      }
    }
  };

  // Add List Column
  const handleAddList = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    try {
      const newList = await api.createList(newListName, boardId);
      setLists(prev => [...prev, newList]);
      setNewListName('');
      setShowAddList(false);
    } catch (err) {
      alert("Erreur de création de colonne.");
    }
  };

  const handleDeleteList = async (listId) => {
    if (confirm("Supprimer cette colonne ainsi que toutes ses cartes ?")) {
      try {
        await api.deleteList(listId);
        setLists(prev => prev.filter(l => l.id !== listId));
      } catch (err) {
        alert("Erreur.");
      }
    }
  };

  const toggleListCollapsed = async (listId, currentCollapsed) => {
    const nextVal = currentCollapsed ? 0 : 1;
    // Optimistic UI
    setLists(prev => prev.map(l => l.id === listId ? { ...l, is_collapsed: nextVal } : l));
    try {
      await api.updateList(listId, { is_collapsed: nextVal });
    } catch (err) {
      console.error(err);
    }
  };

  // Add Card
  const handleAddCard = async (e, listId) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;
    try {
      const newCard = await api.createCard(newCardTitle, listId);
      setLists(prev => prev.map(l => {
        if (l.id === listId) {
          return { ...l, cards: [...l.cards, newCard] };
        }
        return l;
      }));
      setNewCardTitle('');
      setAddingCardToList(null);
      onOpenCard(newCard.id); // Instantly open card modal on creation
    } catch (err) {
      alert("Erreur de création de carte.");
    }
  };

  // NATIVE HTML5 DRAG & DROP FOR CARDS
  const handleDragStart = (e, card) => {
    setDraggedCard(card);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', card.id.toString());
  };

  const handleDragOver = (e, listId) => {
    e.preventDefault();
    if (dragOverListId !== listId) {
      setDragOverListId(listId);
    }
  };

  const handleDrop = async (e, targetListId) => {
    e.preventDefault();
    setDragOverListId(null);
    if (!draggedCard) return;

    const sourceListId = draggedCard.list_id;
    if (sourceListId === targetListId) return;

    // Optimistic UI updates (smooth, lag-free transitions)
    setLists(prev => prev.map(list => {
      // Remove from source list
      if (list.id === sourceListId) {
        return {
          ...list,
          cards: list.cards.filter(c => c.id !== draggedCard.id)
        };
      }
      // Add to target list
      if (list.id === targetListId) {
        const updatedCard = { ...draggedCard, list_id: targetListId };
        return {
          ...list,
          cards: [...list.cards, updatedCard]
        };
      }
      return list;
    }));

    try {
      await api.updateCard(draggedCard.id, { list_id: targetListId });
    } catch (err) {
      console.error("Failed to move card via API:", err);
      // Rollback on error
      loadBoardData();
    } finally {
      setDraggedCard(null);
    }
  };

  // Filtering Card Logic
  const getFilteredCards = (cardsList) => {
    return cardsList.filter(card => {
      // Search query match
      const query = searchQuery.toLowerCase();
      const matchesSearch = card.title.toLowerCase().includes(query) || 
                            (card.description && card.description.toLowerCase().includes(query));
      
      // Member filter match
      const matchesMember = selectedMemberFilter === 'All' || 
                            card.assignees?.some(a => a.id.toString() === selectedMemberFilter);
      
      // Label filter match
      const matchesLabel = selectedLabelFilter === 'All' || 
                           card.labels?.some(l => l.name === selectedLabelFilter);

      return matchesSearch && matchesMember && matchesLabel;
    });
  };

  // Get distinct labels on this board for filter selector
  const getAllUniqueLabels = () => {
    const labelsSet = new Set();
    lists.forEach(l => {
      l.cards?.forEach(c => {
        c.labels?.forEach(lbl => labelsSet.add(lbl.name));
      });
    });
    return Array.from(labelsSet);
  };

  const boardLabels = getAllUniqueLabels();

  if (!boardId) {
    return (
      <div style={styles.emptyBoard}>
        <h3 style={styles.emptyTitle}>Bienvenue dans STAN ROBOTIX Kanban !</h3>
        <p style={styles.emptyText}>Sélectionnez ou créez un tableau dans la barre latérale pour commencer à collaborer.</p>
      </div>
    );
  }

  return (
    <div style={styles.boardContainer}>
      {/* 1. Board Top Header Bar */}
      <div style={styles.boardHeader}>
        <div>
          <h2 style={styles.boardTitle}>{boardName}</h2>
          <span style={styles.boardSubtitle}>
            {lists.length} Colonne(s) • {lists.reduce((acc, l) => acc + (l.cards?.length || 0), 0)} Carte(s)
          </span>
        </div>

        {/* Board Members list + Actions */}
        <div style={styles.membersArea}>
          <div style={styles.avatarList}>
            {boardMembers.map((member) => (
              <div 
                key={member.id} 
                style={{ ...styles.memberAvatar, backgroundColor: member.avatar_color }}
                title={`${member.display_name} (cliquer pour retirer)`}
                onClick={() => handleRemoveMember(member.id)}
              >
                {member.display_name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>

          <button 
            onClick={() => setShowAddMember(!showAddMember)}
            className="btn-secondary" 
            style={styles.addMemberBtn}
          >
            <UserPlus size={16} /> Inviter
          </button>

          {/* Add member interactive dropdown */}
          {showAddMember && (
            <div className="glass-panel animate-fade" style={styles.addMemberDropdown}>
              <div style={styles.dropdownHeader}>
                <span style={styles.dropdownTitle}>Ajouter au tableau</span>
                <X size={14} onClick={() => setShowAddMember(false)} style={{ cursor: 'pointer' }} />
              </div>
              <div style={styles.dropdownList}>
                {allUsers
                  .filter(u => !boardMembers.some(m => m.id === u.id))
                  .map(user => (
                    <div 
                      key={user.id} 
                      onClick={() => handleAddMember(user.id)}
                      style={styles.dropdownItem}
                    >
                      <div style={{ ...styles.dropdownAvatar, backgroundColor: user.avatar_color }}>
                        {user.display_name.charAt(0).toUpperCase()}
                      </div>
                      <span>{user.display_name}</span>
                    </div>
                  ))}
                {allUsers.filter(u => !boardMembers.some(m => m.id === u.id)).length === 0 && (
                  <div style={styles.emptyDropdownText}>Aucun autre utilisateur enregistré.</div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. Advanced Filters and Search Bar */}
      <div style={styles.filtersBar}>
        <div style={styles.searchWrapper}>
          <Search size={16} style={styles.filterSearchIcon} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filtrer les cartes par titre, description..."
            style={styles.filterSearchInput}
          />
        </div>

        <div style={styles.selectorsGroup}>
          {/* Member selector */}
          <div style={styles.selectorItem}>
            <Users size={14} style={{ color: 'var(--text-muted)' }} />
            <select
              value={selectedMemberFilter}
              onChange={(e) => setSelectedMemberFilter(e.target.value)}
              style={styles.select}
            >
              <option value="All">Tous les membres</option>
              {boardMembers.map(member => (
                <option key={member.id} value={member.id.toString()}>{member.display_name}</option>
              ))}
            </select>
          </div>

          {/* Label selector */}
          <div style={styles.selectorItem}>
            <Filter size={14} style={{ color: 'var(--text-muted)' }} />
            <select
              value={selectedLabelFilter}
              onChange={(e) => setSelectedLabelFilter(e.target.value)}
              style={styles.select}
            >
              <option value="All">Toutes les étiquettes</option>
              {boardLabels.map(labelName => (
                <option key={labelName} value={labelName}>{labelName}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Columns (Lists) Area */}
      <div style={styles.columnsScrollArea}>
        {loading ? (
          <div style={styles.loadingBox}>Chargement du tableau...</div>
        ) : (
          <div style={styles.columnsContainer}>
            {lists.map((list) => {
              const filteredCards = getFilteredCards(list.cards || []);
              const isCollapsed = list.is_collapsed === 1;

              // COLLAPSED COLUMN RENDERING (Screenshot 1: vertical bar)
              if (isCollapsed) {
                return (
                  <div
                    key={list.id}
                    onClick={() => toggleListCollapsed(list.id, true)}
                    style={styles.collapsedColumn}
                    title="Cliquer pour déplier"
                  >
                    <div style={styles.collapsedHeader}>
                      <ChevronRight size={16} />
                      <span style={styles.collapsedCardCount}>{list.cards?.length || 0}</span>
                    </div>
                    <div style={styles.collapsedTitleWrapper}>
                      <span style={styles.collapsedTitle}>{list.name}</span>
                    </div>
                  </div>
                );
              }

              // STANDARD COLUMN RENDERING
              return (
                <div
                  key={list.id}
                  onDragOver={(e) => handleDragOver(e, list.id)}
                  onDrop={(e) => handleDrop(e, list.id)}
                  style={{
                    ...styles.column,
                    backgroundColor: dragOverListId === list.id ? 'var(--brand-red-alpha-10)' : 'var(--bg-column)',
                    border: dragOverListId === list.id ? '2px dashed var(--brand-red)' : '1px solid var(--border-color)'
                  }}
                >
                  {/* Column Header */}
                  <div style={styles.columnHeader}>
                    <div style={styles.columnTitleArea}>
                      <h3 style={styles.columnTitle}>{list.name}</h3>
                      <span style={styles.cardCounter}>{filteredCards.length}</span>
                    </div>
                    <div style={styles.columnActions}>
                      <ChevronLeft 
                        size={15} 
                        title="Replier la colonne" 
                        onClick={() => toggleListCollapsed(list.id, false)}
                        style={styles.columnActionIcon}
                      />
                      <Trash 
                        size={13} 
                        title="Supprimer la colonne" 
                        onClick={() => handleDeleteList(list.id)}
                        style={styles.columnDeleteIcon}
                      />
                    </div>
                  </div>

                  {/* Cards list container */}
                  <div style={styles.cardsList}>
                    {filteredCards.map((card) => (
                      <Card
                        key={card.id}
                        card={card}
                        onClick={onOpenCard}
                        onDragStart={handleDragStart}
                      />
                    ))}
                    {filteredCards.length === 0 && (
                      <div style={styles.emptyColumnText}>Aucune carte</div>
                    )}
                  </div>

                  {/* Add card button */}
                  {addingCardToList === list.id ? (
                    <form 
                      onSubmit={(e) => handleAddCard(e, list.id)}
                      style={styles.addCardForm}
                    >
                      <input
                        type="text"
                        value={newCardTitle}
                        onChange={(e) => setNewCardTitle(e.target.value)}
                        placeholder="Saisir un titre..."
                        style={styles.addCardInput}
                        autoFocus
                      />
                      <div style={styles.addCardActions}>
                        <button type="submit" style={styles.btnSmallOk}>OK</button>
                        <button 
                          type="button" 
                          onClick={() => { setAddingCardToList(null); setNewCardTitle(''); }} 
                          style={styles.btnSmallCancel}
                        >
                          X
                        </button>
                      </div>
                    </form>
                  ) : (
                    <button 
                      onClick={() => setAddingCardToList(list.id)}
                      style={styles.addCardBtn}
                    >
                      <Plus size={16} /> Ajouter une carte
                    </button>
                  )}
                </div>
              );
            })}

            {/* Add Column Button */}
            {showAddList ? (
              <form onSubmit={handleAddList} style={styles.addListForm}>
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="Nom de la colonne..."
                  style={styles.addListInput}
                  autoFocus
                />
                <div style={styles.addListActions}>
                  <button type="submit" className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.85rem' }}>Créer</button>
                  <button 
                    type="button" 
                    onClick={() => { setShowAddList(false); setNewListName(''); }} 
                    className="btn-secondary"
                    style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                  >
                    Fermer
                  </button>
                </div>
              </form>
            ) : (
              <button 
                onClick={() => setShowAddList(true)}
                style={styles.addColumnBtn}
              >
                <Plus size={18} /> Ajouter une colonne
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// Inline JS styles reflecting premium UX layouts
const styles = {
  boardContainer: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    backgroundColor: 'var(--bg-board)',
    overflow: 'hidden',
    position: 'relative'
  },
  emptyBoard: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'var(--bg-board)',
    color: 'var(--text-muted)',
    padding: '2rem',
    textAlign: 'center'
  },
  emptyTitle: {
    fontSize: '1.6rem',
    color: 'var(--text-main)',
    marginBottom: '10px'
  },
  emptyText: {
    fontSize: '0.95rem',
    maxWidth: '500px'
  },
  boardHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '1.5rem',
    borderBottom: '1px solid var(--border-color)'
  },
  boardTitle: {
    fontSize: '1.5rem',
    color: 'var(--text-main)'
  },
  boardSubtitle: {
    fontSize: '0.85rem',
    color: 'var(--text-muted)'
  },
  membersArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    position: 'relative'
  },
  avatarList: {
    display: 'flex',
    alignItems: 'center'
  },
  memberAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    color: '#ffffff',
    fontSize: '0.85rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid var(--bg-board)',
    marginLeft: '-8px',
    cursor: 'pointer',
    transition: 'transform var(--transition-fast)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  addMemberBtn: {
    padding: '6px 12px',
    fontSize: '0.85rem'
  },
  addMemberDropdown: {
    position: 'absolute',
    top: '42px',
    right: 0,
    width: '240px',
    borderRadius: 'var(--border-radius-md)',
    boxShadow: 'var(--shadow-premium)',
    padding: '12px',
    zIndex: 50
  },
  dropdownHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
    borderBottom: '1px solid var(--border-color)',
    paddingBottom: '8px'
  },
  dropdownTitle: {
    fontSize: '0.85rem',
    fontWeight: '600'
  },
  dropdownList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    maxHeight: '200px',
    overflowY: 'auto'
  },
  dropdownItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '6px',
    cursor: 'pointer',
    borderRadius: 'var(--border-radius-sm)',
    transition: 'background var(--transition-fast)'
  },
  dropdownAvatar: {
    width: '26px',
    height: '26px',
    borderRadius: '50%',
    color: '#ffffff',
    fontSize: '0.75rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  emptyDropdownText: {
    fontSize: '0.78rem',
    color: 'var(--text-muted)',
    textAlign: 'center',
    padding: '10px'
  },
  filtersBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 1.5rem',
    borderBottom: '1px solid var(--border-color)',
    backgroundColor: 'rgba(255,255,255,0.01)',
    flexWrap: 'wrap',
    gap: '12px'
  },
  searchWrapper: {
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    flex: 1,
    minWidth: '240px'
  },
  filterSearchIcon: {
    position: 'absolute',
    left: '12px',
    color: 'var(--text-muted)'
  },
  filterSearchInput: {
    width: '100%',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    color: 'var(--text-main)',
    padding: '8px 12px 8px 36px',
    borderRadius: 'var(--border-radius-sm)',
    fontSize: '0.85rem'
  },
  selectorsGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  selectorItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '4px 10px'
  },
  select: {
    fontSize: '0.82rem',
    color: 'var(--text-main)',
    backgroundColor: 'transparent',
    border: 'none',
    cursor: 'pointer'
  },
  columnsScrollArea: {
    flex: 1,
    overflowX: 'auto',
    overflowY: 'hidden',
    padding: '1.5rem',
    display: 'flex'
  },
  loadingBox: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
    fontSize: '1rem',
    color: 'var(--text-muted)'
  },
  columnsContainer: {
    display: 'flex',
    gap: '1.25rem',
    height: '100%',
    alignItems: 'flex-start'
  },
  column: {
    width: '320px',
    minWidth: '320px',
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '100%',
    borderRadius: 'var(--border-radius-lg)',
    padding: '12px 14px',
    transition: 'all var(--transition-normal)'
  },
  columnHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: '12px',
    borderBottom: '1px solid rgba(255,255,255,0.05)'
  },
  columnTitleArea: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  columnTitle: {
    fontSize: '1rem',
    fontWeight: '600',
    color: 'var(--text-main)'
  },
  cardCounter: {
    backgroundColor: 'var(--bg-app)',
    color: 'var(--text-muted)',
    fontSize: '0.78rem',
    fontWeight: '700',
    padding: '2px 8px',
    borderRadius: '10px'
  },
  columnActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  columnActionIcon: {
    cursor: 'pointer',
    color: 'var(--text-muted)',
    ':hover': {
      color: 'var(--text-main)'
    }
  },
  columnDeleteIcon: {
    cursor: 'pointer',
    color: 'rgba(239, 68, 68, 0.6)',
    ':hover': {
      color: '#ef4444'
    }
  },
  cardsList: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '10px 0',
    minHeight: '10px'
  },
  emptyColumnText: {
    fontSize: '0.8rem',
    color: 'var(--text-light)',
    textAlign: 'center',
    padding: '20px 0',
    fontStyle: 'italic'
  },
  addCardBtn: {
    padding: '10px',
    borderRadius: 'var(--border-radius-sm)',
    color: 'var(--text-muted)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '0.875rem',
    fontWeight: '500',
    transition: 'all var(--transition-fast)',
    backgroundColor: 'rgba(255,255,255,0.02)',
    border: '1px dashed var(--border-color)'
  },
  addCardForm: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  addCardInput: {
    width: '100%',
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '8px 12px',
    color: 'var(--text-main)',
    fontSize: '0.85rem'
  },
  addCardActions: {
    display: 'flex',
    gap: '6px'
  },
  btnSmallOk: {
    backgroundColor: 'var(--brand-red)',
    color: '#ffffff',
    padding: '6px 12px',
    fontSize: '0.8rem',
    borderRadius: 'var(--border-radius-sm)',
    fontWeight: '600'
  },
  btnSmallCancel: {
    padding: '6px 10px',
    backgroundColor: 'var(--bg-app)',
    color: 'var(--text-main)',
    border: '1px solid var(--border-color)',
    fontSize: '0.8rem',
    borderRadius: 'var(--border-radius-sm)'
  },
  collapsedColumn: {
    width: '48px',
    minWidth: '48px',
    backgroundColor: 'var(--bg-column-header)',
    borderRadius: 'var(--border-radius-lg)',
    border: '1px solid var(--border-color)',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '14px 6px',
    cursor: 'pointer',
    transition: 'background var(--transition-fast)'
  },
  collapsedHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
    color: 'var(--text-muted)'
  },
  collapsedCardCount: {
    backgroundColor: 'var(--bg-app)',
    color: 'var(--text-main)',
    fontSize: '0.75rem',
    fontWeight: '700',
    width: '22px',
    height: '22px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--border-color)'
  },
  collapsedTitleWrapper: {
    writingMode: 'vertical-rl',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginTop: '20px',
    transform: 'rotate(180deg)'
  },
  collapsedTitle: {
    fontSize: '0.85rem',
    fontWeight: '600',
    color: 'var(--text-main)'
  },
  addColumnBtn: {
    width: '280px',
    minWidth: '280px',
    backgroundColor: 'var(--bg-column-header)',
    borderRadius: 'var(--border-radius-lg)',
    border: '1px dashed var(--border-color)',
    color: 'var(--text-muted)',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontSize: '0.95rem',
    fontWeight: '600',
    transition: 'all var(--transition-fast)',
    padding: '20px'
  },
  addListForm: {
    width: '280px',
    minWidth: '280px',
    backgroundColor: 'var(--bg-column)',
    borderRadius: 'var(--border-radius-lg)',
    padding: '14px',
    border: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  addListInput: {
    backgroundColor: 'var(--bg-card)',
    border: '1px solid var(--border-color)',
    borderRadius: 'var(--border-radius-sm)',
    padding: '8px 12px',
    color: 'var(--text-main)',
    fontSize: '0.88rem'
  },
  addListActions: {
    display: 'flex',
    gap: '8px'
  }
};
