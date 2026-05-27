import React, { useEffect, useState } from 'react';
import { Paperclip, MessageSquare, CheckSquare, Calendar, Play } from 'lucide-react';

export default function Card({ card, onClick, onDragStart, onDragOver }) {
  const {
    id,
    title,
    labels = [],
    assignees = [],
    due_date,
    total_tasks = 0,
    completed_tasks = 0,
    comments_count = 0,
    attachments_count = 0
  } = card;

  // Due Date alert styling
  const getDueDateStatus = () => {
    if (!due_date) return null;
    const now = new Date();
    const due = new Date(due_date);
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'En retard', style: styles.dueDateOverdue };
    if (diffDays === 0) return { label: 'Aujourd\'hui', style: styles.dueDateToday };
    if (diffDays <= 2) return { label: 'Bientôt', style: styles.dueDateSoon };
    return { label: due.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' }), style: styles.dueDateOk };
  };

  const dueStatus = getDueDateStatus();

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, card)}
      onDragOver={onDragOver}
      onClick={() => onClick(id)}
      style={styles.card}
      className="animate-fade"
    >
      {/* 1. Labels Row */}
      {labels.length > 0 && (
        <div style={styles.labelsRow}>
          {labels.map((label) => (
            <span
              key={label.id}
              style={{
                ...styles.labelBadge,
                backgroundColor: label.color || 'var(--brand-red-alpha-10)',
                color: '#ffffff', // Always white on color background for maximum accessibility
                border: `1px solid rgba(255, 255, 255, 0.1)`
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* 2. Card Title */}
      <h4 style={styles.cardTitle}>{title}</h4>

      {/* 3. Sub-checklists progress bar (if tasks exist) */}
      {total_tasks > 0 && (
        <div style={styles.checklistContainer}>
          <div style={styles.checklistHeader}>
            <div style={styles.checkLeft}>
              <CheckSquare size={13} style={{ color: 'var(--text-muted)' }} />
              <span style={styles.checkText}>Sous-tâches</span>
            </div>
            <span style={styles.checkRatio}>{completed_tasks}/{total_tasks}</span>
          </div>
          <div style={styles.progressBarBg}>
            <div
              style={{
                ...styles.progressBarFill,
                width: `${(completed_tasks / total_tasks) * 100}%`
              }}
            />
          </div>
        </div>
      )}



      {/* 5. Indicators and User Avatars Row */}
      <div style={styles.footerRow}>
        <div style={styles.indicators}>
          {/* Due date marker */}
          {dueStatus && (
            <div style={{ ...styles.indicator, ...dueStatus.style }} title="Date d'échéance">
              <Calendar size={12} />
              <span>{dueStatus.label}</span>
            </div>
          )}

          {/* Attachments clip count */}
          {attachments_count > 0 && (
            <div style={styles.indicator} title={`${attachments_count} fichier(s) joint(s)`}>
              <Paperclip size={12} />
              <span>{attachments_count}</span>
            </div>
          )}

          {/* Comments count bubble */}
          {comments_count > 0 && (
            <div style={styles.indicator} title={`${comments_count} commentaire(s)`}>
              <MessageSquare size={12} />
              <span>{comments_count}</span>
            </div>
          )}
        </div>

        {/* Assigned Avatars Overlapping list */}
        {assignees.length > 0 && (
          <div style={styles.avatarList}>
            {assignees.map((assignee, idx) => (
              <div
                key={assignee.id}
                style={{
                  ...styles.miniAvatar,
                  backgroundColor: assignee.avatar_color || 'var(--brand-red)',
                  zIndex: assignees.length - idx,
                  marginLeft: idx === 0 ? 0 : -8
                }}
                title={assignee.display_name}
              >
                {assignee.display_name.charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const styles = {
  card: {
    backgroundColor: 'var(--bg-card)',
    borderRadius: 'var(--border-radius-md)',
    border: '1px solid var(--border-color)',
    padding: '12px 14px',
    boxShadow: 'var(--shadow-sm)',
    cursor: 'grab',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    transition: 'transform var(--transition-fast), box-shadow var(--transition-fast), border-color var(--transition-fast)',
    userSelect: 'none',
    position: 'relative',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: 'var(--shadow-md)',
      borderColor: 'var(--brand-red-alpha-20)'
    }
  },
  labelsRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '6px'
  },
  labelBadge: {
    fontSize: '0.7rem',
    fontWeight: '600',
    padding: '2px 8px',
    borderRadius: '4px',
    letterSpacing: '0.3px',
    textTransform: 'uppercase'
  },
  cardTitle: {
    fontSize: '0.92rem',
    fontWeight: '500',
    color: 'var(--text-main)',
    lineHeight: '1.4',
    wordBreak: 'break-word'
  },
  checklistContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    marginTop: '2px'
  },
  checklistHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    fontSize: '0.78rem'
  },
  checkLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px'
  },
  checkText: {
    color: 'var(--text-muted)',
    fontWeight: '500'
  },
  checkRatio: {
    fontWeight: '600',
    color: 'var(--text-main)'
  },
  progressBarBg: {
    width: '100%',
    height: '6px',
    backgroundColor: 'var(--bg-column)',
    borderRadius: '3px',
    overflow: 'hidden'
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: 'var(--brand-red)',
    borderRadius: '3px',
    transition: 'width var(--transition-normal)'
  },
  timerBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    border: '1px solid rgba(239, 68, 68, 0.2)',
    color: '#ef4444',
    borderRadius: '4px',
    padding: '4px 8px',
    fontSize: '0.78rem',
    fontWeight: '600',
    alignSelf: 'flex-start',
    fontFamily: 'monospace'
  },
  timerPulse: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    backgroundColor: '#ef4444'
  },
  footerRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: '4px',
    gap: '10px'
  },
  indicators: {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: '10px',
    color: 'var(--text-muted)'
  },
  indicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    fontSize: '0.78rem',
    fontWeight: '500'
  },
  dueDateOverdue: {
    color: '#ef4444',
    fontWeight: '600'
  },
  dueDateToday: {
    color: '#f97316',
    fontWeight: '600'
  },
  dueDateSoon: {
    color: '#eab308',
    fontWeight: '600'
  },
  dueDateOk: {
    color: 'var(--text-muted)'
  },
  avatarList: {
    display: 'flex',
    alignItems: 'center'
  },
  miniAvatar: {
    width: '24px',
    height: '24px',
    borderRadius: '50%',
    color: '#ffffff',
    fontSize: '0.72rem',
    fontWeight: '700',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--bg-card)',
    transition: 'transform var(--transition-fast)',
    ':hover': {
      transform: 'scale(1.15) translateY(-1px)',
      zIndex: 99
    }
  }
};
