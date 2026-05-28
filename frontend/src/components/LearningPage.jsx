import React, { useState, useEffect, useRef } from 'react';
import { marked } from 'marked';
import { 
  BookOpen, ChevronRight, ChevronDown, Menu, X, ArrowLeft,
  List, FileText, ExternalLink
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
      { id: "m1_3_mechanisms", name: "M1.3 - Conception de Mécanismes", file: "m1_3_mechanisms.md" },
      { id: "m2_1_cad_onshape_advanced", name: "M2.1 - CAO Descendante Onshape", file: "m2_1_cad_onshape_advanced.md", advanced: true },
      { id: "m2_2_tolerances_machining", name: "M2.2 - Tolérances & Usinage", file: "m2_2_tolerances_machining.md", advanced: true },
      { id: "m2_3_heavy_gearboxes", name: "M2.3 - Réducteurs Lourds & Boîtes", file: "m2_3_heavy_gearboxes.md", advanced: true }
    ]
  },
  {
    title: "3. Électronique & Câblage",
    id: "elec",
    items: [
      { id: "h1_1_control_system", name: "H1.1 - Le Système de Contrôle", file: "h1_1_control_system.md" },
      { id: "h1_2_wiring_practices", name: "H1.2 - Bonnes Pratiques de Câblage", file: "h1_2_wiring_practices.md" },
      { id: "h1_3_3d_printing", name: "H1.3 - Impression 3D pour la FRC", file: "h1_3_3d_printing.md" },
      { id: "h2_1_can_fd_oscilloscope", name: "H2.1 - Communication CAN FD", file: "h2_1_can_fd_oscilloscope.md", advanced: true },
      { id: "h2_2_sensors_feedback", name: "H2.2 - Capteurs & Asservissements", file: "h2_2_sensors_feedback.md", advanced: true },
      { id: "h2_3_power_brownouts", name: "H2.3 - Diagnostic & Brownouts", file: "h2_3_power_brownouts.md", advanced: true }
    ]
  },
  {
    title: "4. Programmation & Vision",
    id: "software",
    items: [
      { id: "s2_1_command_based", name: "S2.1 - Asynchronisme & Commands", file: "s2_1_command_based.md", advanced: true },
      { id: "s2_2_pid_feedforward", name: "S2.2 - Boucles PID & Feedforward", file: "s2_2_pid_feedforward.md", advanced: true },
      { id: "s2_3_odometry_vision", name: "S2.3 - Vision AprilTags & Kalman", file: "s2_3_odometry_vision.md", advanced: true }
    ]
  },
  {
    title: "5. Fiabilité & Stands",
    id: "triage",
    items: [
      { id: "s1_1_maintenance_triage", name: "S1.1 - Maintenance & Triage", file: "s1_1_maintenance_triage.md" },
      { id: "t2_1_pit_triage", name: "T2.1 - Processus Triage en Stands", file: "t2_1_pit_triage.md", advanced: true },
      { id: "t2_2_log_analysis", name: "T2.2 - Analyse Logs post-match", file: "t2_2_log_analysis.md", advanced: true }
    ]
  },
  {
    title: "6. Sciences Appliquées FRC",
    id: "science",
    items: [
      { id: "p1_1_frc_physics", name: "P1.1 - Physique de Mouvement", file: "p1_1_frc_physics.md" },
      { id: "g1_1_frc_materials", name: "G1.1 - Choix des Matériaux", file: "g1_1_frc_materials.md" }
    ]
  },
  {
    title: "7. Gestion, Sponsoring & Médias",
    id: "management",
    items: [
      { id: "b2_1_agile_management", name: "B2.1 - Gestion Projet & Kanban", file: "b2_1_agile_management.md", advanced: true },
      { id: "b2_2_sponsoring_negotiation", name: "B2.2 - Sponsoring & Business", file: "b2_2_sponsoring_negotiation.md", advanced: true },
      { id: "b2_3_branding_impact", name: "B2.3 - Branding & Impact Award", file: "b2_3_branding_impact.md", advanced: true }
    ]
  }
];

export default function LearningPage({ onSelectBoard }) {
  const [activeChapterId, setActiveChapterId] = useState('intro');
  const [activeArticleId, setActiveArticleId] = useState('f1_1_what_is_frc');
  const [activeArticle, setActiveArticle] = useState(chapters[0].items[0]);
  const [htmlContent, setHtmlContent] = useState('');
  const [headings, setHeadings] = useState([]);
  
  // Collapse state for mobile sidebars
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(false);
  const [collapsedChapters, setCollapsedChapters] = useState({
    intro: false,
    mech: false,
    elec: false,
    software: false,
    triage: false,
    science: false,
    management: false
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
        
        // Extract headings for ToC directly from markdown
        const extracted = extractHeadings(text);
        setHeadings(extracted);

        // --- Structured Two-Pass HTML Compiler with Math Placeholders ---
        let mathBlocks = [];
        let textWithPlaceholders = text;

        const translateMath = (formula) => {
          let f = formula;
          // Replace \frac{A}{B} with styled fraction markup
          f = f.replace(/\\frac\{([\s\S]*?)\}\{([\s\S]*?)\}/g, '<div class="math-fraction"><span class="math-numerator">$1</span><span class="math-denominator">$2</span></div>');
          // Replace \text{A} with plain text
          f = f.replace(/\\text\{([\s\S]*?)\}/g, '$1');
          // Replace \mathbf{A} or \mathbf A with bold HTML
          f = f.replace(/\\mathbf\{([\s\S]*?)\}/g, '<b>$1</b>');
          f = f.replace(/\\mathbf\s*([a-zA-Z0-9])/g, '<b>$1</b>');
          // Replace _{A} or _A with standard subscript
          f = f.replace(/_\{([\s\S]*?)\}/g, '<sub>$1</sub>');
          f = f.replace(/_([a-zA-Z0-9\u00C0-\u017F\-]+)/g, '<sub>$1</sub>');
          // Replace ^{A} or ^A with standard superscript
          f = f.replace(/\^\{([\s\S]*?)\}/g, '<sup>$1</sup>');
          f = f.replace(/\^([a-zA-Z0-9\u00C0-\u017F\-]+)/g, '<sup>$1</sup>');
          // Replace LaTeX specific mathematical operational symbols
          f = f.replace(/\\times/g, ' × ');
          f = f.replace(/\\approx/g, ' ≈ ');
          f = f.replace(/\\cdot/g, ' · ');
          f = f.replace(/\\mu/g, 'μ');
          f = f.replace(/\\omega/g, 'ω');
          f = f.replace(/\\theta/g, 'θ');
          f = f.replace(/\\eta/g, 'η');
          f = f.replace(/\\mathbf/g, ''); // cleanup any leftover
          return f;
        };

        // 1. Extract and compile block math $$ ... $$
        textWithPlaceholders = textWithPlaceholders.replace(/\$\$([\s\S]*?)\$\$/g, (match, formula) => {
          const index = mathBlocks.length;
          const compiledMath = `<div class="math-equation">${translateMath(formula)}</div>`;
          mathBlocks.push(compiledMath);
          return `%%MATH_PLACEHOLDER_${index}%%`;
        });

        // 2. Extract and compile inline math $ ... $
        textWithPlaceholders = textWithPlaceholders.replace(/\$([\s\S]*?)\$/g, (match, formula) => {
          const index = mathBlocks.length;
          const compiledMath = `<span class="math-inline">${translateMath(formula)}</span>`;
          mathBlocks.push(compiledMath);
          return `%%MATH_PLACEHOLDER_${index}%%`;
        });

        // Pass 1: Parse standard markdown to HTML
        const parsedHtml = marked.parse(textWithPlaceholders);

        // Pass 2: Run custom HTML regex expansions (Flowchart and Admonitions)
        let compiledHtml = compileCustomElements(parsedHtml);

        // Restore math placeholders
        mathBlocks.forEach((compiledMath, index) => {
          const pWrappedPlaceholder = `<p>%%MATH_PLACEHOLDER_${index}%%</p>`;
          if (compiledHtml.includes(pWrappedPlaceholder)) {
            compiledHtml = compiledHtml.replace(pWrappedPlaceholder, compiledMath);
          } else {
            compiledHtml = compiledHtml.split(`%%MATH_PLACEHOLDER_${index}%%`).join(compiledMath);
          }
        });
        
        // Inject IDs into HTML headings for scrollspy links
        const finalHtml = injectHeadingIds(compiledHtml);
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

  // Two-pass post-renderer: safe replacements on generated HTML string to prevent unbalanced unclosed div tags
  const compileCustomElements = (html) => {
    if (!html) return '';
    let compiled = html;

    // 1. Process LaTeX Math ($ ... $ and $$ ... $$)
    compiled = compileMath(compiled);

    // 2. Swap <pre><code class="language-mermaid"> with custom progress flowchart
    compiled = compiled.replace(/<pre><code class="language-mermaid">([\s\S]*?)<\/code><\/pre>/g, (match, code) => {
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

        // Clean, single-line horizontal flowchart (prevents marked splits)
        let flowchartHtml = '<div class="flowchart-horizontal">';
        nodes.forEach((node, index) => {
          flowchartHtml += `<div class="flowchart-step"><div class="step-badge">Phase ${index + 1}</div><div class="step-text">${node.content}</div></div>`;
          if (index < nodes.length - 1) {
            flowchartHtml += `<div class="flowchart-arrow"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg></div>`;
          }
        });
        flowchartHtml += '</div>';
        return flowchartHtml;
      }
      return match;
    });

    // 3. Swap <p>:::type</p> ... <p>:::</p> with styled admonitions
    // Using ungreedy matches to safely bind pairs and allow markdown paragraph markup inside the block
    compiled = compiled.replace(/<p>:::(tip|info|warning|danger|caution|note)(?:\s+(.*?))?<\/p>([\s\S]*?)<p>:::<\/p>/g, (match, type, title, content) => {
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
      return `<div class="admonition-box admonition-${type}"><div class="admonition-title">${emoji} ${dispTitle}</div><div class="admonition-content">${content}</div></div>`;
    });

    return compiled;
  };

  // Compile standard LaTeX math notations into clean HTML structures
  const compileMath = (html) => {
    if (!html) return '';
    let compiled = html;

    const translateMath = (formula) => {
      let f = formula;
      // Replace \frac{A}{B} with styled fraction markup
      f = f.replace(/\\frac\{([\s\S]*?)\}\{([\s\S]*?)\}/g, '<div class="math-fraction"><span class="math-numerator">$1</span><span class="math-denominator">$2</span></div>');
      // Replace \text{A} with plain text
      f = f.replace(/\\text\{([\s\S]*?)\}/g, '$1');
      // Replace _{A} or _A with standard subscript
      f = f.replace(/_\{([\s\S]*?)\}/g, '<sub>$1</sub>');
      f = f.replace(/_([a-zA-Z0-9\u00C0-\u017F]+)/g, '<sub>$1</sub>'); // includes French accents
      // Replace ^{A} or ^A with standard superscript
      f = f.replace(/\^\{([\s\S]*?)\}/g, '<sup>$1</sup>');
      f = f.replace(/\^([a-zA-Z0-9\u00C0-\u017F]+)/g, '<sup>$1</sup>');
      // Replace LaTeX specific mathematical operational symbols
      f = f.replace(/\\times/g, ' × ');
      f = f.replace(/\\approx/g, ' ≈ ');
      f = f.replace(/\\cdot/g, ' · ');
      f = f.replace(/\\mu/g, 'μ');
      f = f.replace(/\\omega/g, 'ω');
      f = f.replace(/\\theta/g, 'θ');
      f = f.replace(/\\eta/g, 'η');
      return f;
    };

    // Replace block math $$ ... $$
    compiled = compiled.replace(/<p>\$\$([\s\S]*?)\$\$<\/p>/g, (match, formula) => {
      return `<div class="math-equation">${translateMath(formula)}</div>`;
    });

    // Replace inline math $ ... $
    compiled = compiled.replace(/\$([\s\S]*?)\$/g, (match, formula) => {
      return `<span class="math-inline">${translateMath(formula)}</span>`;
    });

    return compiled;
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
      
      {/* 1. PERSISTENT TOP HEADER BAR (Docusaurus Style) */}
      <div style={styles.topHeader}>
        <div style={styles.headerLeft}>
          <button 
            onClick={() => setLeftSidebarOpen(!leftSidebarOpen)} 
            style={styles.hamburgerBtn}
            className="mobile-hamburger"
          >
            {leftSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div style={styles.brand}>
            <span style={{ fontWeight: '800', color: 'var(--brand-red)' }}>STAN</span>
            <span>ROBOTIX</span>
            <span style={styles.brandBadge}>Formation</span>
          </div>
        </div>
        <div style={styles.headerRight}>
          <button onClick={handleBackToDashboard} style={styles.headerBackBtn} className="exit-btn-desktop">
            <ArrowLeft size={16} />
            <span>Retour au Tableau de Bord</span>
          </button>
        </div>
      </div>

      {/* 2. BODY LAYOUT (SIDEBAR + MAIN CONTENT AREA) */}
      <div style={styles.bodyLayout}>
        
        {/* left sidebar navigation */}
        <div 
          className={`docs-sidebar ${leftSidebarOpen ? 'docs-sidebar-open' : 'docs-sidebar-closed'}`}
          style={styles.leftSidebar}
        >
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
                            <span style={{ textTransform: 'none', display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                              {item.name}
                              {item.advanced && (
                                <span style={styles.advancedBadge}>AVANCÉ</span>
                              )}
                            </span>
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

        {/* 3. MAIN READING WRAPPER (CENTER) */}
        <div style={styles.mainContainer}>
          
          {/* Breadcrumbs Navigation */}
          <div style={styles.breadcrumbs} className="breadcrumbs-bar">
            <span style={styles.breadcrumbLink} onClick={handleBackToDashboard} className="breadcrumb-link">Tableau de bord</span>
            <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span style={styles.breadcrumbText} className="breadcrumb-text">{activeChapter ? activeChapter.title : ''}</span>
            <ChevronRight size={14} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
            <span style={{ ...styles.breadcrumbText, color: 'var(--text-main)', fontWeight: '500' }} className="breadcrumb-text">{activeArticle.name}</span>
          </div>

          {/* Content columns */}
          <div style={styles.contentLayout}>
            
            {/* Center reading panel */}
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

            {/* Right Table of Contents (ToC) */}
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

    </div>
  );
}

const styles = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100vw',
    height: '100vh',
    overflow: 'hidden',
    backgroundColor: 'var(--bg-main)',
    fontFamily: "'Inter', sans-serif",
  },
  
  // Persistent Top Header Bar (Desktop & Mobile)
  topHeader: {
    height: '60px',
    borderBottom: '1px solid var(--border-color)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 2rem',
    backgroundColor: 'var(--bg-sidebar)',
    flexShrink: 0,
    zIndex: 100,
    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
  },
  brand: {
    fontSize: '1.2rem',
    fontWeight: '700',
    letterSpacing: '-0.5px',
    color: 'var(--text-main)',
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
  },
  brandBadge: {
    fontSize: '0.7rem',
    padding: '2px 6px',
    borderRadius: '4px',
    backgroundColor: 'var(--brand-red-alpha-10)',
    color: 'var(--brand-red)',
    fontWeight: '600',
    marginLeft: '0.25rem',
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center',
  },
  headerBackBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.5rem 1rem',
    backgroundColor: 'var(--brand-red)',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  hamburgerBtn: {
    backgroundColor: 'transparent',
    border: 'none',
    color: 'var(--text-main)',
    cursor: 'pointer',
    display: 'none', // Managed by responsive CSS class
  },

  // Split Body Layout
  bodyLayout: {
    flex: 1,
    display: 'flex',
    width: '100%',
    height: 'calc(100% - 60px)',
    overflow: 'hidden',
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
    transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
  },
  sidebarHeader: {
    display: 'none', // Deprecated since we have the top header
  },
  backBtn: {
    display: 'none',
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
  advancedBadge: {
    fontSize: '0.55rem',
    padding: '1px 4px',
    borderRadius: '3px',
    backgroundColor: 'var(--brand-red)',
    color: 'white',
    fontWeight: '800',
    marginLeft: '6px',
    letterSpacing: '0.3px',
    display: 'inline-block',
    lineHeight: '1.2',
  },

  // Main reading wrapper
  mainContainer: {
    flex: 1,
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
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
