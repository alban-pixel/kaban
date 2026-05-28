import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import { 
  BookOpen, ChevronRight, ChevronDown, Menu, X, ArrowLeft,
  List, PlayCircle, FileText, Compass, ExternalLink, Presentation
} from 'lucide-react';

const chapters = [
  {
    title: "1. Introduction à la FRC",
    id: "intro",
    items: [
      { id: "f1_1_what_is_frc", name: "F1.1 - Qu'est-ce que la FRC ?", file: "f1_1_what_is_frc.md" },
      { id: "f1_2_team_roles", name: "F1.2 - Les Rôles dans l'Équipe", file: "f1_2_team_roles.md" },
      { id: "d1_1_robot_anatomy", name: "D1.1 - Anatomie d'un Robot FRC", file: "d1_1_robot_anatomy.md" }
    ]
  },
  {
    title: "2. Conception Mécanique & CAO",
    id: "mech",
    items: [
      { id: "m1_1_cad_onshape", name: "M1.1 - CAO avec Onshape", file: "m1_1_cad_onshape.md" },
      { id: "m1_2_gears_motors", name: "M1.2 - Engrenages & Moteurs", file: "m1_2_gears_motors.md" },
      { id: "m1_3_mechanisms", name: "M1.3 - Conception de Mécanismes", file: "m1_3_mechanisms.md" }
    ]
  },
  {
    title: "3. Électronique & Câblage",
    id: "elec",
    items: [
      { id: "h1_1_control_system", name: "H1.1 - Le Système de Contrôle", file: "h1_1_control_system.md" },
      { id: "h1_2_wiring_practices", name: "H1.2 - Bonnes Pratiques de Câblage", file: "h1_2_wiring_practices.md" },
      { id: "h1_3_3d_printing", name: "H1.3 - Impression 3D pour la FRC", file: "h1_3_3d_printing.md" }
    ]
  },
  {
    title: "4. Fiabilité & Stands",
    id: "triage",
    items: [
      { id: "s1_1_maintenance_triage", name: "S1.1 - Maintenance & Triage", file: "s1_1_maintenance_triage.md" }
    ]
  },
  {
    title: "5. Sciences Appliquées FRC",
    id: "science",
    items: [
      { id: "p1_1_frc_physics", name: "P1.1 - Physique de Mouvement", file: "p1_1_frc_physics.md" },
      { id: "g1_1_frc_materials", name: "G1.1 - Choix des Matériaux", file: "g1_1_frc_materials.md" }
    ]
  }
];

export default function LearningPage({ onSelectBoard }) {
  const [activeChapterId, setActiveChapterId] = useState('intro');
  const [activeArticleId, setActiveArticleId] = useState('f1_1_what_is_frc');
  const [activeArticle, setActiveArticle] = useState(chapters[0].items[0]);
  const [markdownContent, setMarkdownContent] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [headings, setHeadings] = useState([]);
  
  // Collapse state for mobile sidebars
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [collapsedChapters, setCollapsedChapters] = useState({
    intro: false,
    mech: false,
    elec: false,
    triage: false,
    science: false
  });

  const contentRef = useRef(null);

  // Toggle chapter collapse
  const toggleChapter = (id) => {
    setCollapsedChapters(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  // Load article markdown
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const response = await fetch(`/courses/${activeArticle.file}`);
        if (!response.ok) {
          throw new Error("Impossible de charger le fichier de cours.");
        }
        const text = await response.text();
        setMarkdownContent(text);
        
        // Extract headings for ToC
        const extracted = extractHeadings(text);
        setHeadings(extracted);

        // Preprocess custom admonitions and flowcharts
        const preprocessed = preprocessMarkdown(text);
        
        // Parse markdown to HTML
        const parsedHtml = marked.parse(preprocessed);
        
        // Inject IDs into parsed HTML headings for anchor scrolls
        const finalHtml = injectHeadingIds(parsedHtml);
        setHtmlContent(finalHtml);

        // Scroll main content pane to top when article changes
        if (contentRef.current) {
          contentRef.current.scrollTop = 0;
        }
      } catch (err) {
        console.error(err);
        setHtmlContent(`<div class="error-box">⚠️ Une erreur est survenue lors du chargement de cette leçon. Veuillez réessayer ou vérifier que le fichier existe.</div>`);
      }
    };

    fetchArticle();
  }, [activeArticle]);

  // Preprocess Docusaurus admonitions and Mermaid flowcharts
  const preprocessMarkdown = (text) => {
    if (!text) return '';
    let parsed = text;
    
    // 1. Process Mermaid graph LR
    parsed = parsed.replace(/```mermaid\s*([\s\S]*?)\s*```/g, (match, code) => {
      if (code.includes('graph LR')) {
        const nodes = [];
        const lines = code.split('\n');
        for (let line of lines) {
          const nodeMatch = line.match(/([A-Z])\[(.*?)\]/);
          if (nodeMatch) {
            const id = nodeMatch[1];
            const content = nodeMatch[2];
            nodes.push({ id, content });
          }
        }

        let flowchartHtml = '<div class="flowchart-horizontal">';
        nodes.forEach((node, index) => {
          flowchartHtml += `
            <div class="flowchart-step animate-fade">
              <div class="step-badge">Phase ${index + 1}</div>
              <div class="step-text">${node.content}</div>
            </div>
          `;
          if (index < nodes.length - 1) {
            flowchartHtml += `
              <div class="flowchart-arrow">
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </div>
            `;
          }
        });
        flowchartHtml += '</div>';
        return flowchartHtml;
      }
      return match;
    });

    // 2. Preprocess Docusaurus style :::type to HTML tags
    parsed = parsed.replace(/:::(tip|info|warning|danger|caution|note)(?:\s+(.*))?/g, (match, type, title) => {
      const defaultTitles = {
        tip: "CONSEIL",
        info: "INFORMATION",
        warning: "AVERTISSEMENT",
        danger: "DANGER",
        caution: "ATTENTION",
        note: "NOTE"
      };
      const emojis = {
        tip: "💡",
        info: "ℹ️",
        warning: "⚠️",
        danger: "🚨",
        caution: "⚡",
        note: "📝"
      };
      const dispTitle = title || defaultTitles[type] || type.toUpperCase();
      const emoji = emojis[type] || "📝";
      return `<div class="admonition-box admonition-${type}"><div class="admonition-title">${emoji} ${dispTitle}</div><div class="admonition-content">`;
    });
    
    // Replace closing :::
    parsed = parsed.replace(/:::/g, '</div></div>');
    
    return parsed;
  };

  // Inject IDs to H2 and H3 for Anchor link scrolling
  const injectHeadingIds = (html) => {
    if (!html) return '';
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    const headings = doc.querySelectorAll('h2, h3');
    headings.forEach(heading => {
      const text = heading.textContent || '';
      const id = text.toLowerCase()
                     .replace(/[^a-z0-9\s-]+/g, '') // remove special characters
                     .replace(/\s+/g, '-')          // spaces to hyphens
                     .replace(/(^-|-$)/g, '');      // trim hyphens
      heading.setAttribute('id', id);
    });
    
    return doc.body.innerHTML;
  };

  // Parse headers directly from markdown text to build Right ToC
  const extractHeadings = (text) => {
    if (!text) return [];
    const lines = text.split('\n');
    const list = [];
    let inCodeBlock = false;
    
    for (let line of lines) {
      if (line.trim().startsWith('```')) {
        inCodeBlock = !inCodeBlock;
        continue;
      }
      if (inCodeBlock) continue;
      
      const match = line.match(/^(#{2,3})\s+(.+)$/);
      if (match) {
        const level = match[1].length;
        const textVal = match[2].replace(/[*_`]/g, '').trim();
        const id = textVal.toLowerCase()
                          .replace(/[^a-z0-9\s-]+/g, '')
                          .replace(/\s+/g, '-')
                          .replace(/(^-|-$)/g, '');
        list.push({ level, text: textVal, id });
      }
    }
    return list;
  };

  // Find parent chapter for Breadcrumbs
  const activeChapter = chapters.find(c => c.items.some(i => i.id === activeArticleId));

  // Exit Apprentissage and return to Kanban Board
  const handleBackToDashboard = () => {
    if (onSelectBoard) {
      onSelectBoard('drivetrain', 'Tableau de bord');
    }
  };

  return (
    <div style={styles.appContainer}>
      
      {/* 1. DOCUMENTATION SIDEBAR (LEFT) */}
      <div style={{
        ...styles.leftSidebar,
        transform: leftSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
        opacity: 1,
      }} className="docs-sidebar">
        
        {/* Sidebar Header Escape */}
        <div style={styles.sidebarHeader}>
          <button onClick={handleBackToDashboard} style={styles.backBtn}>
            <ArrowLeft size={16} />
            <span>Vers Kanban</span>
          </button>
        </div>

        {/* Navigation list */}
        <div style={styles.sidebarNav}>
          <div style={styles.navSectionTitle}>CURRICULUM ROBOTIQUE</div>
          
          {chapters.map((chapter) => {
            const isCollapsed = collapsedChapters[chapter.id];
            return (
              <div key={chapter.id} style={styles.chapterGroup}>
                <button 
                  onClick={() => toggleChapter(chapter.id)} 
                  style={styles.chapterToggle}
                >
                  <span style={styles.chapterTitle}>{chapter.title}</span>
                  {isCollapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                </button>

                {!isCollapsed && (
                  <div style={styles.chapterItems}>
                    {chapter.items.map((item) => {
                      const isActive = activeArticleId === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => {
                            setActiveArticleId(item.id);
                            setActiveArticle(item);
                            setLeftSidebarOpen(false); // Close mobile drawer on selection
                          }}
                          style={{
                            ...styles.articleLink,
                            color: isActive ? 'var(--brand-red)' : 'var(--text-sidebar-muted)',
                            backgroundColor: isActive ? 'rgba(207, 39, 55, 0.08)' : 'transparent',
                            fontWeight: isActive ? '600' : '400'
                          }}
                        >
                          <FileText size={14} style={{ marginRight: '8px', flexShrink: 0 }} />
                          <span style={{ textTransform: 'none' }}>{item.name}</span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. MAIN READING AREA (CENTER) */}
      <div style={styles.mainContainer}>
        
        {/* Mobile Header Bar */}
        <div style={styles.mobileHeader}>
          <button 
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)} 
            style={styles.hamburgerBtn}
          >
            {leftSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div style={styles.mobileBrand}>
            <span style={{ fontWeight: '800', color: 'var(--brand-red)' }}>STAN</span>
            <span>ROBOTIX</span>
          </div>
          <button onClick={handleBackToDashboard} style={styles.mobileBackIconBtn} title="Retour au tableau de bord">
            <ArrowLeft size={20} />
          </button>
        </div>

        {/* Breadcrumbs Navigation */}
        <div style={styles.breadcrumbs} className="breadcrumbs-bar">
          <span style={styles.breadcrumbLink} onClick={handleBackToDashboard} className="breadcrumb-link">Tableau de bord</span>
          <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span style={styles.breadcrumbText} className="breadcrumb-text">{activeChapter ? activeChapter.title : ''}</span>
          <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
          <span style={{ ...styles.breadcrumbText, color: 'var(--text-main)', fontWeight: '500' }} className="breadcrumb-text">{activeArticle.name}</span>
        </div>

        {/* Content Wrapper */}
        <div style={styles.contentLayout}>
          
          {/* Main Markdown Body */}
          <div 
            ref={contentRef} 
            style={styles.readingPane} 
            className="markdown-body"
          >
            <div 
              dangerouslySetInnerHTML={{ __html: htmlContent }} 
              style={styles.markdownRender}
            />
          </div>

          {/* 3. TABLE OF CONTENTS SIDEBAR (RIGHT) */}
          <div style={styles.rightSidebar} className="toc-sidebar">
            <div style={styles.tocTitle}>
              <List size={16} style={{ marginRight: '8px' }} />
              SUR CETTE PAGE
            </div>
            
            {headings.length === 0 ? (
              <div style={styles.tocEmpty}>Aucun sous-titre dans cette leçon.</div>
            ) : (
              <div style={styles.tocList}>
                {headings.map((h, i) => (
                  <a
                    key={i}
                    href={`#${h.id}`}
                    style={{
                      ...styles.tocLink,
                      paddingLeft: h.level === 3 ? '24px' : '12px',
                      fontSize: h.level === 3 ? '0.8rem' : '0.85rem',
                      color: 'var(--text-muted)'
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      const element = document.getElementById(h.id);
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      }
                    }}
                  >
                    {h.text}
                  </a>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: 'var(--bg-main)',
    fontFamily: "'Inter', sans-serif",
  },
  
  // Left Doc Navigation Sidebar
  leftSidebar: {
    width: '280px',
    height: '100%',
    backgroundColor: 'var(--bg-sidebar)',
    borderRight: '1px solid var(--border-color)',
    display: 'flex',
    flexDirection: 'column',
    flexShrink: 0,
    zIndex: 99,
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), opacity 0.3s ease',
  },
  sidebarHeader: {
    padding: '1rem',
    borderBottom: '1px solid var(--border-color)',
  },
  backBtn: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '0.5rem',
    padding: '0.6rem',
    backgroundColor: 'transparent',
    border: '1px solid var(--border-color)',
    borderRadius: '8px',
    color: 'var(--text-sidebar-muted)',
    fontSize: '0.9rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  sidebarNav: {
    flex: 1,
    overflowY: 'auto',
    padding: '1.5rem 1rem',
  },
  navSectionTitle: {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: 'var(--brand-red)',
    letterSpacing: '1px',
    marginBottom: '1rem',
    paddingLeft: '0.5rem',
  },
  chapterGroup: {
    marginBottom: '0.75rem',
  },
  chapterToggle: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-sidebar)',
    cursor: 'pointer',
    textAlign: 'left',
    borderRadius: '6px',
    transition: 'background-color 0.2s',
  },
  chapterTitle: {
    fontWeight: '600',
    fontSize: '0.9rem',
    textTransform: 'none',
  },
  chapterItems: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.25rem',
    paddingLeft: '0.75rem',
    marginTop: '0.25rem',
  },
  articleLink: {
    display: 'flex',
    alignItems: 'center',
    padding: '0.45rem 0.5rem',
    backgroundColor: 'transparent',
    border: 'none',
    fontSize: '0.85rem',
    borderRadius: '4px',
    textAlign: 'left',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textTransform: 'none',
  },

  // Main workspace
  mainContainer: {
    flex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  mobileHeader: {
    height: '60px',
    borderBottom: '1px solid var(--border-color)',
    display: 'none', // Shown only on mobile query
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 1rem',
    backgroundColor: 'var(--bg-panel)',
    flexShrink: 0,
  },
  hamburgerBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-main)',
    cursor: 'pointer',
  },
  mobileBrand: {
    fontSize: '1.1rem',
    fontWeight: '700',
    letterSpacing: '-0.5px',
    color: 'var(--text-main)',
  },
  mobileBackIconBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-main)',
    cursor: 'pointer',
  },
  breadcrumbs: {
    padding: '1rem 2.5rem',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    fontSize: '0.85rem',
    color: 'var(--text-muted)',
    borderBottom: '1px solid var(--border-color)',
    flexShrink: 0,
    backgroundColor: 'var(--bg-main)',
  },
  breadcrumbLink: {
    cursor: 'pointer',
    transition: 'color 0.2s',
  },
  breadcrumbText: {
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '220px',
  },

  contentLayout: {
    flex: 1,
    display: 'flex',
    overflow: 'hidden',
  },

  // Center reading pane
  readingPane: {
    flex: 1,
    height: '100%',
    overflowY: 'auto',
    padding: '2.5rem 3.5rem',
    scrollBehavior: 'smooth',
  },
  markdownRender: {
    maxWidth: '820px',
    margin: '0 auto',
    color: 'var(--text-main)',
    lineHeight: '1.7',
    fontSize: '1.05rem',
  },

  // Right Table of Contents Sidebar
  rightSidebar: {
    width: '240px',
    height: '100%',
    borderLeft: '1px solid var(--border-color)',
    padding: '2.5rem 1.5rem',
    overflowY: 'auto',
    flexShrink: 0,
    backgroundColor: 'var(--bg-main)',
  },
  tocTitle: {
    fontSize: '0.75rem',
    fontWeight: '800',
    color: 'var(--text-main)',
    letterSpacing: '1px',
    display: 'flex',
    alignItems: 'center',
    marginBottom: '1rem',
  },
  tocEmpty: {
    fontSize: '0.8rem',
    color: 'var(--text-muted)',
    fontStyle: 'italic',
  },
  tocList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '0.5rem',
    borderLeft: '2px solid var(--border-color)',
  },
  tocLink: {
    display: 'block',
    textDecoration: 'none',
    fontSize: '0.85rem',
    lineHeight: '1.4',
    transition: 'all 0.2s',
    borderLeft: '2px solid transparent',
    marginLeft: '-2px',
  }
};
