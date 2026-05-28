import React from 'react';
import { Book, Video, MonitorPlay, ExternalLink, Presentation, Code, Wrench, Settings } from 'lucide-react';

export default function LearningPage() {
  const learningSections = [
    {
      category: "Fondamentaux & Mécanique",
      icon: <Settings size={20} />,
      items: [
        { name: "Technical Resources | FIRST Robotics Competition", url: "https://www.firstinspires.org/resources/library/frc/technical-resources", type: "link", desc: "Ressources techniques officielles de FIRST." },
        { name: "The Unofficial FRC Mechanism Encyclopedia", url: "https://www.projectb.net.au/resources/robot-mechanisms/#GPE", type: "link", desc: "L'encyclopédie non-officielle des mécanismes de robots (Project Bucephalus)." },
        { name: "Hardware Basics — FIRST Robotics Competition", url: "https://docs.wpilib.org/en/stable/docs/hardware/hardware-basics/index.html", type: "link", desc: "Les bases du matériel en FRC." },
        { name: "Hardware Tutorials", url: "https://docs.wpilib.org/en/stable/docs/hardware/hardware-tutorials/index.html#", type: "link", desc: "Tutoriels sur le matériel FRC." },
        { name: "NASA RAP Robotics Design Guide", url: "https://robotics.nasa.gov/nasa-rap-robotics-design-guide/", type: "link", desc: "Guide de conception robotique par la NASA." },
        { name: "NASA FRC Resources", url: "https://robotics.nasa.gov/frc-resources/", type: "link", desc: "Ressources FRC de la NASA." },
        { name: "LYNK Library of Knowledge", url: "https://docs.lynkrobotics.org/#gsc.tab=0", type: "link", desc: "Bibliothèque de connaissances LYNK Robotics." },
        { name: "FRC Robot Basics Guide (REV)", url: "https://www.revrobotics.com/content/docs/FRC-Robot-Basics-Guide.pdf", type: "pdf", desc: "Guide des bases d'un robot FRC par REV Robotics." },
        { name: "Design 101", url: "https://www.firstinspires.org/hubfs/web/program/frc/resources/design-101.pdf?hsLang=en", type: "pdf", desc: "Principes de base du design en robotique." },
        { name: "FRC Guide - Arpan Rao", url: "https://hcwilson.weebly.com/uploads/3/8/4/6/38463501/frc_guide_-_arpan_rao.pdf", type: "pdf", desc: "Un guide FRC complet." },
        { name: "Design Spectrum 3847", url: "http://design.spectrum3847.org/", type: "link", desc: "Ressources de conception de l'équipe Spectrum 3847." },
        { name: "Inexpensive Build Tips", url: "https://www.spectrum3847.org/resources/inexpensive-build-tips", type: "link", desc: "Conseils de construction à faible coût par Spectrum 3847." }
      ]
    },
    {
      category: "Organisation d'Équipe",
      icon: <Book size={20} />,
      items: [
        { name: "Team Organization | Spectrum3847", url: "https://www.spectrum3847.org/resources/other-teams-resources/team-organization", type: "link", desc: "Comment organiser efficacement une équipe FRC." }
      ]
    },
    {
      category: "Conception Assistée par Ordinateur (CAD)",
      icon: <Wrench size={20} />,
      items: [
        { name: "Onshape Fundamentals: CAD", url: "https://learn.onshape.com/collections/onshape-fundamentals-cad", type: "link", desc: "Apprendre les bases d'Onshape pour la CAO." }
      ]
    },
    {
      category: "Cours Spécifiques & Slides",
      icon: <Presentation size={20} />,
      items: [
        { name: "D1.1 Overview of FRC Robots", url: "https://docs.google.com/presentation/d/1IMirGYkg5m0WvAMZfOa9wDqTR74IMB_VLnsSxgjjoD8/edit", type: "slide", desc: "Vue d'ensemble des robots FRC.", video: "https://www.youtube.com/watch?v=86NCQfrjNr0" },
        { name: "F1.1 What is FRC?", url: "https://docs.google.com/presentation/d/1HGakEB6jhE4WON5OCA4wB5tr2pTyJo5cIO3TNS4YmfQ/edit", type: "slide", desc: "Introduction générale à la FIRST Robotics Competition." },
        { name: "F1.2 What do team members do?", url: "https://docs.google.com/presentation/d/1HGakEB6jhE4WON5OCA4wB5tr2pTyJo5cIO3TNS4YmfQ/edit", type: "slide", desc: "Rôles et responsabilités dans l'équipe." },
        { name: "B2.5 FRC 3D Printed Parts", url: "https://docs.google.com/presentation/d/1w-zGo9hEuVamzVrmhK3MJni0aftu0k9ZUnMRb93MIrI/edit#slide=id.p", type: "slide", desc: "Utilisation de pièces imprimées en 3D en FRC." },
        { name: "B3.1 Maintenance and Triage", url: "https://docs.google.com/presentation/d/1m0f9urPvA5mDsYUIbJfKmZDw2Bal5va4vqTf4cG_kvM/edit#slide=id.p", type: "slide", desc: "Maintenance et diagnostic du robot.", video: "https://www.youtube.com/watch?v=TsYSL9athTk" },
        { name: "Build Self-Learning Resources", url: "https://docs.google.com/presentation/d/e/2PACX-1vRaIkRvKioVmcl1P6vpddYPYC43QjaxsRZu6qavmp3lNpBcQ0noBf91Pv4N8DwSDgcxdfG2IoPqTNs7/pub?start=false&loop=false&delayms=3000", type: "slide", desc: "Ressources d'auto-apprentissage pour la construction." },
        { name: "Slides Additionnels (Hardware/Wiring)", url: "https://docs.google.com/presentation/d/1whyvTc-HmHIQoMQok2rVF6ahzuzkDI1A4BrMUjpHwMc/edit?slide=id.g2c2c9bf8b8_0_96", type: "slide", desc: "Concepts électriques et de câblage." }
      ]
    },
    {
      category: "Vidéos Complémentaires",
      icon: <MonitorPlay size={20} />,
      items: [
        { name: "Présentation FRC (YouTube)", url: "https://www.youtube.com/watch?v=K0oyG6LqFpY", type: "video", desc: "Aperçu de la compétition et des robots." }
      ]
    }
  ];

  const getIconForType = (type) => {
    switch (type) {
      case 'slide': return <Presentation size={16} />;
      case 'video': return <Video size={16} />;
      case 'pdf': return <Book size={16} />;
      case 'link':
      default: return <ExternalLink size={16} />;
    }
  };

  return (
    <div style={styles.container}>
      {/* Header Banner */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.title}>
            <Book size={32} />
            Centre d'Apprentissage
          </h1>
          <p style={styles.subtitle}>
            Ressources, formations et cours pour l'apprentissage complet et profond de la robotique (FRC 6622).
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      <div style={styles.content}>
        {learningSections.map((section, idx) => (
          <div key={idx} style={styles.sectionCard}>
            <div style={styles.sectionHeader}>
              <div style={styles.sectionIconWrapper}>
                {section.icon}
              </div>
              <h2 style={styles.sectionTitle}>{section.category}</h2>
            </div>
            
            <div style={styles.grid}>
              {section.items.map((item, itemIdx) => (
                <div key={itemIdx} style={styles.resourceCard}>
                  <div style={styles.cardTop}>
                    <span style={styles.typeIcon}>{getIconForType(item.type)}</span>
                    <h3 style={styles.resourceTitle}>{item.name}</h3>
                  </div>
                  <p style={styles.resourceDesc}>{item.desc}</p>
                  
                  <div style={styles.cardActions}>
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      style={styles.actionBtn}
                    >
                      <ExternalLink size={14} /> Consulter
                    </a>
                    {item.video && (
                      <a 
                        href={item.video} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        style={{...styles.actionBtn, ...styles.actionBtnAlt}}
                      >
                        <Video size={14} /> Voir Vidéo
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: {
    flex: 1,
    height: '100vh',
    overflowY: 'auto',
    backgroundColor: 'var(--bg-main)',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    background: 'linear-gradient(135deg, var(--brand-red) 0%, #8b0000 100%)',
    padding: '3rem 2rem',
    color: 'white',
    flexShrink: 0,
    boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
  },
  headerContent: {
    maxWidth: '1200px',
    margin: '0 auto',
  },
  title: {
    fontSize: '2.5rem',
    fontWeight: '800',
    margin: '0 0 1rem 0',
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '1.1rem',
    opacity: 0.9,
    margin: 0,
    maxWidth: '600px',
    lineHeight: '1.6',
  },
  content: {
    flex: 1,
    padding: '2rem',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  sectionCard: {
    backgroundColor: 'var(--bg-panel)',
    borderRadius: '16px',
    padding: '2rem',
    marginBottom: '2rem',
    border: '1px solid var(--border-color)',
    boxShadow: 'var(--shadow-sm)',
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem',
    marginBottom: '1.5rem',
    paddingBottom: '1rem',
    borderBottom: '1px solid var(--border-color)',
  },
  sectionIconWrapper: {
    backgroundColor: 'rgba(207, 39, 55, 0.1)',
    color: 'var(--brand-red)',
    padding: '0.75rem',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: '1.4rem',
    fontWeight: '700',
    color: 'var(--text-main)',
    margin: 0,
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem',
  },
  resourceCard: {
    backgroundColor: 'var(--bg-main)',
    border: '1px solid var(--border-color)',
    borderRadius: '12px',
    padding: '1.5rem',
    display: 'flex',
    flexDirection: 'column',
    transition: 'all 0.2s ease',
  },
  cardTop: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    marginBottom: '0.75rem',
  },
  typeIcon: {
    color: 'var(--text-muted)',
    marginTop: '0.15rem',
  },
  resourceTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--text-main)',
    margin: 0,
    lineHeight: '1.4',
  },
  resourceDesc: {
    fontSize: '0.9rem',
    color: 'var(--text-muted)',
    margin: '0 0 1.5rem 0',
    lineHeight: '1.5',
    flex: 1,
  },
  cardActions: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: 'auto',
  },
  actionBtn: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '0.5rem',
    padding: '0.6rem 1rem',
    backgroundColor: 'var(--brand-red)',
    color: 'white',
    borderRadius: '8px',
    textDecoration: 'none',
    fontSize: '0.9rem',
    fontWeight: '600',
    transition: 'opacity 0.2s',
  },
  actionBtnAlt: {
    backgroundColor: 'var(--bg-panel)',
    color: 'var(--text-main)',
    border: '1px solid var(--border-color)',
  }
};
