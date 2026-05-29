import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import os from 'os';
import { fileURLToPath } from 'url';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import multer from 'multer';
import { WebSocketServer } from 'ws';
import { getDatabase } from './database.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const JWT_SECRET = 'stan-robotix-kanban-secret-key-12345'; // Secure fallback key

// Ensure uploads folder exists
const uploadsDir = path.resolve(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Set up Multer for local file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Avoid filename collisions
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS and parsing middlewares
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(uploadsDir));

// Determine if we're in dev mode
const isDev = process.argv.includes('--dev');

// Authentication middleware
function authenticateJWT(req, res, next) {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(' ')[1];
    jwt.verify(token, JWT_SECRET, async (err, decodedUser) => {
      if (err) return res.status(403).json({ error: 'Session invalide ou expirée.' });
      
      try {
        const db = await getDatabase();
        const freshUser = await db.get('SELECT id, username, display_name, role FROM users WHERE id = ?', [decodedUser.id]);
        if (!freshUser) {
          return res.status(403).json({ error: 'Session invalide ou utilisateur introuvable.' });
        }
        req.user = freshUser;
        next();
      } catch (dbErr) {
        res.status(500).json({ error: 'Erreur serveur.' });
      }
    });
  } else {
    res.status(401).json({ error: 'Accès non autorisé.' });
  }
}

// Curated avatar colors
const AVATAR_COLORS = [
  '#cf2737', // STAN RED
  '#1e293b', // STAN NAVY
  '#0284c7', // Sky Blue
  '#16a34a', // Emerald Green
  '#ea580c', // Orange
  '#7c3aed', // Purple
  '#db2777', // Pink
  '#0d9488', // Teal
];

// Helper to get local IP address
function getLocalIpAddresses() {
  const interfaces = os.networkInterfaces();
  const addresses = [];
  for (const name of Object.keys(interfaces)) {
    for (const iface of interfaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        addresses.push(iface.address);
      }
    }
  }
  return addresses;
}

// Security checks for project visibility
async function hasProjectAccess(db, projectId, user) {
  if (user.role === 'admin') return true;
  const project = await db.get('SELECT is_private FROM projects WHERE id = ?', [projectId]);
  if (!project) return false;
  if (project.is_private === 0) return true;
  const member = await db.get('SELECT 1 FROM project_members WHERE project_id = ? AND user_id = ?', [projectId, user.id]);
  return !!member;
}

async function hasBoardAccess(db, boardId, user) {
  if (user.role === 'admin') return true;
  const board = await db.get('SELECT project_id FROM boards WHERE id = ?', [boardId]);
  if (!board) return false;
  return hasProjectAccess(db, board.project_id, user);
}

// Middleware checking for administrator privileges
function requireAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Accès réservé aux administrateurs.' });
  }
}


// ==========================================
// AUTHENTICATION API
// ==========================================

app.post('/api/auth/register', async (req, res) => {
  const { username, password, display_name } = req.body;
  if (!username || !password || !display_name) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }

  try {
    const db = await getDatabase();
    const passwordHash = await bcrypt.hash(password, 10);
    const avatarColor = AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

    // Check if this is the first user registered
    const usersCount = await db.get('SELECT COUNT(*) as count FROM users');
    const isFirstUser = usersCount.count === 0;
    const role = isFirstUser ? 'admin' : 'member';

    const result = await db.run(
      'INSERT INTO users (username, password_hash, display_name, avatar_color, role) VALUES (?, ?, ?, ?, ?)',
      [username.trim().toLowerCase(), passwordHash, display_name.trim(), avatarColor, role]
    );

    const token = jwt.sign(
      { id: result.lastID, username: username.trim().toLowerCase(), display_name: display_name.trim(), role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.status(201).json({
      token,
      user: { id: result.lastID, username, display_name, avatar_color: avatarColor, role }
    });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Ce nom d\'utilisateur est déjà utilisé.' });
    } else {
      res.status(500).json({ error: 'Erreur lors de l\'enregistrement.' });
    }
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: 'Tous les champs sont requis.' });
  }

  try {
    const db = await getDatabase();
    const user = await db.get('SELECT * FROM users WHERE username = ?', [username.trim().toLowerCase()]);

    if (!user || !(await bcrypt.compare(password, user.password_hash))) {
      return res.status(400).json({ error: 'Identifiants incorrects.' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, display_name: user.display_name, role: user.role },
      JWT_SECRET,
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: { id: user.id, username: user.username, display_name: user.display_name, avatar_color: user.avatar_color, role: user.role }
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la connexion.' });
  }
});

app.get('/api/auth/me', authenticateJWT, async (req, res) => {
  try {
    const db = await getDatabase();
    const user = await db.get('SELECT id, username, display_name, avatar_color, role, created_at FROM users WHERE id = ?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.get('/api/users', authenticateJWT, async (req, res) => {
  try {
    const db = await getDatabase();
    const users = await db.all('SELECT id, username, display_name, avatar_color FROM users ORDER BY display_name ASC');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ==========================================
// PROJECTS & HIERARCHY NAVIGATION API
// ==========================================

// Get complete sidebar navigation tree
app.get('/api/navigation', authenticateJWT, async (req, res) => {
  try {
    const db = await getDatabase();
    
    // Get all projects with visibility filtering
    let projects;
    if (req.user.role === 'admin') {
      projects = await db.all('SELECT * FROM projects ORDER BY position ASC, id ASC');
    } else {
      projects = await db.all(
        `SELECT * FROM projects 
         WHERE is_private = 0 
            OR id IN (SELECT project_id FROM project_members WHERE user_id = ?)
         ORDER BY position ASC, id ASC`,
        [req.user.id]
      );
    }
    
    // Get all folders
    const folders = await db.all('SELECT * FROM folders ORDER BY position ASC, id ASC');
    
    // Get all boards
    const boards = await db.all('SELECT * FROM boards ORDER BY position ASC, id ASC');

    // Build the tree
    const tree = projects.map(project => {
      const projectFolders = folders
        .filter(f => f.project_id === project.id)
        .map(folder => {
          const folderBoards = boards.filter(b => b.folder_id === folder.id);
          return { ...folder, boards: folderBoards };
        });

      // Boards that belong directly to the project (no folder)
      const directBoards = boards.filter(b => b.project_id === project.id && !b.folder_id);

      return {
        ...project,
        folders: projectFolders,
        boards: directBoards
      };
    });

    res.json(tree);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur lors de la récupération de la navigation.' });
  }
});

// Projects
app.post('/api/projects', authenticateJWT, async (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nom requis.' });

  try {
    const db = await getDatabase();
    const result = await db.run('INSERT INTO projects (name) VALUES (?)', [name.trim()]);
    res.status(201).json({ id: result.lastID, name: name.trim(), folders: [], boards: [] });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.put('/api/projects/:id', authenticateJWT, async (req, res) => {
  const { name, position, is_private } = req.body;
  try {
    const db = await getDatabase();
    
    // Admin check for project privacy modifications
    if (is_private !== undefined && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Seul un administrateur peut modifier la confidentialité d\'un projet.' });
    }

    if (name) {
      await db.run('UPDATE projects SET name = ? WHERE id = ?', [name.trim(), req.params.id]);
    }
    if (position !== undefined) {
      await db.run('UPDATE projects SET position = ? WHERE id = ?', [position, req.params.id]);
    }
    if (is_private !== undefined) {
      await db.run('UPDATE projects SET is_private = ? WHERE id = ?', [is_private ? 1 : 0, req.params.id]);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.delete('/api/projects/:id', authenticateJWT, async (req, res) => {
  try {
    const db = await getDatabase();
    await db.run('DELETE FROM projects WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Folders
app.post('/api/folders', authenticateJWT, async (req, res) => {
  const { name, project_id } = req.body;
  if (!name || !project_id) return res.status(400).json({ error: 'Nom et ID de projet requis.' });

  try {
    const db = await getDatabase();
    const result = await db.run(
      'INSERT INTO folders (name, project_id) VALUES (?, ?)',
      [name.trim(), project_id]
    );
    res.status(201).json({ id: result.lastID, name: name.trim(), project_id, boards: [] });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.put('/api/folders/:id', authenticateJWT, async (req, res) => {
  const { name, position } = req.body;
  try {
    const db = await getDatabase();
    if (name) {
      await db.run('UPDATE folders SET name = ? WHERE id = ?', [name.trim(), req.params.id]);
    }
    if (position !== undefined) {
      await db.run('UPDATE folders SET position = ? WHERE id = ?', [position, req.params.id]);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.delete('/api/folders/:id', authenticateJWT, async (req, res) => {
  try {
    const db = await getDatabase();
    await db.run('DELETE FROM folders WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Boards
app.post('/api/boards', authenticateJWT, async (req, res) => {
  const { name, project_id, folder_id } = req.body;
  if (!name || !project_id) return res.status(400).json({ error: 'Nom et ID de projet requis.' });

  try {
    const db = await getDatabase();
    const result = await db.run(
      'INSERT INTO boards (name, project_id, folder_id) VALUES (?, ?, ?)',
      [name.trim(), project_id, folder_id || null]
    );
    
    // Automatically add the creator as member
    await db.run('INSERT INTO board_members (board_id, user_id) VALUES (?, ?)', [result.lastID, req.user.id]);
    
    // Initialize default lists: À faire, En cours, Revue, Terminé
    const defaultLists = ['À faire', 'En cours', 'Revue', 'Terminé'];
    for (let i = 0; i < defaultLists.length; i++) {
      await db.run('INSERT INTO lists (board_id, name, position) VALUES (?, ?, ?)', [result.lastID, defaultLists[i], i]);
    }

    res.status(201).json({ id: result.lastID, name: name.trim(), project_id, folder_id: folder_id || null });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.put('/api/boards/:id', authenticateJWT, async (req, res) => {
  const { name, position, folder_id } = req.body;
  try {
    const db = await getDatabase();
    if (name) {
      await db.run('UPDATE boards SET name = ? WHERE id = ?', [name.trim(), req.params.id]);
    }
    if (position !== undefined) {
      await db.run('UPDATE boards SET position = ? WHERE id = ?', [position, req.params.id]);
    }
    if (folder_id !== undefined) {
      await db.run('UPDATE boards SET folder_id = ? WHERE id = ?', [folder_id || null, req.params.id]);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.delete('/api/boards/:id', authenticateJWT, async (req, res) => {
  try {
    const db = await getDatabase();
    await db.run('DELETE FROM boards WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Board Members
app.get('/api/boards/:id/members', authenticateJWT, async (req, res) => {
  try {
    const db = await getDatabase();
    const members = await db.all(
      `SELECT u.id, u.username, u.display_name, u.avatar_color 
       FROM board_members bm 
       JOIN users u ON bm.user_id = u.id 
       WHERE bm.board_id = ?`,
      [req.params.id]
    );
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.post('/api/boards/:id/members', authenticateJWT, async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'ID utilisateur requis.' });

  try {
    const db = await getDatabase();
    await db.run('INSERT INTO board_members (board_id, user_id) VALUES (?, ?)', [req.params.id, user_id]);
    res.json({ success: true });
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Cet utilisateur est déjà membre.' });
    } else {
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  }
});

app.delete('/api/boards/:id/members/:userId', authenticateJWT, async (req, res) => {
  try {
    const db = await getDatabase();
    await db.run('DELETE FROM board_members WHERE board_id = ? AND user_id = ?', [req.params.id, req.params.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ==========================================
// LISTS (COLUMNS) API
// ==========================================

app.get('/api/boards/:id/lists', authenticateJWT, async (req, res) => {
  try {
    const db = await getDatabase();
    
    // Security check
    const hasAccess = await hasBoardAccess(db, req.params.id, req.user);
    if (!hasAccess) {
      return res.status(403).json({ error: 'Accès non autorisé à ce tableau privé.' });
    }
    
    // Get all lists on the board
    const lists = await db.all('SELECT * FROM lists WHERE board_id = ? ORDER BY position ASC, id ASC', [req.params.id]);
    
    // Get all cards with active timer info and comments/attachments counts
    const cards = await db.all(
      `SELECT c.*, 
       (SELECT COUNT(*) FROM card_tasks ct WHERE ct.card_id = c.id) as total_tasks,
       (SELECT COUNT(*) FROM card_tasks ct WHERE ct.card_id = c.id AND ct.is_completed = 1) as completed_tasks,
       (SELECT COUNT(*) FROM card_comments cc WHERE cc.card_id = c.id) as comments_count,
       (SELECT COUNT(*) FROM card_attachments ca WHERE ca.card_id = c.id) as attachments_count
       FROM cards c
       JOIN lists l ON c.list_id = l.id
       WHERE l.board_id = ?
       ORDER BY c.position ASC, c.id ASC`,
      [req.params.id]
    );

    // Get assignees and labels for all these cards
    const cardIds = cards.map(c => c.id);
    let assignees = [];
    let labels = [];

    if (cardIds.length > 0) {
      const placeholders = cardIds.map(() => '?').join(',');
      assignees = await db.all(
        `SELECT ca.card_id, u.id, u.username, u.display_name, u.avatar_color
         FROM card_assignees ca
         JOIN users u ON ca.user_id = u.id
         WHERE ca.card_id IN (${placeholders})`,
        cardIds
      );

      labels = await db.all(
        `SELECT * FROM card_labels WHERE card_id IN (${placeholders})`,
        cardIds
      );
    }

    // Attach dependencies to cards
    const listsWithCards = lists.map(list => {
      const listCards = cards
        .filter(c => c.list_id === list.id)
        .map(card => {
          return {
            ...card,
            assignees: assignees.filter(a => a.card_id === card.id),
            labels: labels.filter(l => l.card_id === card.id)
          };
        });

      return {
        ...list,
        cards: listCards
      };
    });

    res.json(listsWithCards);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur lors du chargement des colonnes.' });
  }
});

app.post('/api/lists', authenticateJWT, async (req, res) => {
  const { name, board_id } = req.body;
  if (!name || !board_id) return res.status(400).json({ error: 'Nom et ID de tableau requis.' });

  try {
    const db = await getDatabase();
    
    // Find highest position
    const maxPos = await db.get('SELECT MAX(position) as maxPos FROM lists WHERE board_id = ?', [board_id]);
    const nextPos = (maxPos.maxPos !== null && maxPos.maxPos !== undefined) ? maxPos.maxPos + 1 : 0;

    const result = await db.run(
      'INSERT INTO lists (board_id, name, position) VALUES (?, ?, ?)',
      [name.trim(), board_id, nextPos]
    );

    res.status(201).json({ id: result.lastID, name: name.trim(), board_id, position: nextPos, is_collapsed: 0, cards: [] });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.put('/api/lists/:id', authenticateJWT, async (req, res) => {
  const { name, position, is_collapsed } = req.body;
  try {
    const db = await getDatabase();
    if (name) {
      await db.run('UPDATE lists SET name = ? WHERE id = ?', [name.trim(), req.params.id]);
    }
    if (position !== undefined) {
      await db.run('UPDATE lists SET position = ? WHERE id = ?', [position, req.params.id]);
    }
    if (is_collapsed !== undefined) {
      await db.run('UPDATE lists SET is_collapsed = ? WHERE id = ?', [is_collapsed, req.params.id]);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.delete('/api/lists/:id', authenticateJWT, async (req, res) => {
  try {
    const db = await getDatabase();
    await db.run('DELETE FROM lists WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ==========================================
// CARDS API
// ==========================================

app.post('/api/cards', authenticateJWT, async (req, res) => {
  const { title, list_id } = req.body;
  if (!title || !list_id) return res.status(400).json({ error: 'Titre et ID de colonne requis.' });

  try {
    const db = await getDatabase();
    
    // Find highest position in column
    const maxPos = await db.get('SELECT MAX(position) as maxPos FROM cards WHERE list_id = ?', [list_id]);
    const nextPos = (maxPos.maxPos !== null && maxPos.maxPos !== undefined) ? maxPos.maxPos + 1 : 0;

    const result = await db.run(
      'INSERT INTO cards (list_id, title, created_by) VALUES (?, ?, ?)',
      [list_id, title.trim(), req.user.id]
    );

    const newCard = {
      id: result.lastID,
      list_id,
      title: title.trim(),
      description: '',
      position: nextPos,
      due_date: null,
      tracked_time: 0,
      timer_started_by: null,
      timer_start_time: null,
      created_by: req.user.id,
      assignees: [],
      labels: [],
      total_tasks: 0,
      completed_tasks: 0,
      comments_count: 0,
      attachments_count: 0
    };

    res.status(201).json(newCard);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Get full details of a card
app.get('/api/cards/:id', authenticateJWT, async (req, res) => {
  try {
    const db = await getDatabase();
    const card = await db.get('SELECT * FROM cards WHERE id = ?', [req.params.id]);
    if (!card) return res.status(404).json({ error: 'Carte introuvable.' });

    // Security check
    const list = await db.get('SELECT board_id FROM lists WHERE id = ?', [card.list_id]);
    if (list) {
      const hasAccess = await hasBoardAccess(db, list.board_id, req.user);
      if (!hasAccess) {
        return res.status(403).json({ error: 'Accès non autorisé à cette carte.' });
      }
    }

    // Fetch lists info to know where we can move it
    const assignees = await db.all(
      `SELECT u.id, u.username, u.display_name, u.avatar_color
       FROM card_assignees ca
       JOIN users u ON ca.user_id = u.id
       WHERE ca.card_id = ?`,
      [req.params.id]
    );

    const labels = await db.all('SELECT * FROM card_labels WHERE card_id = ?', [req.params.id]);
    const tasks = await db.all('SELECT * FROM card_tasks WHERE card_id = ? ORDER BY position ASC, id ASC', [req.params.id]);
    
    const attachments = await db.all(
      `SELECT ca.*, u.display_name as uploaded_by_name 
       FROM card_attachments ca
       LEFT JOIN users u ON ca.uploaded_by = u.id
       WHERE ca.card_id = ? ORDER BY ca.created_at DESC`,
      [req.params.id]
    );

    const comments = await db.all(
      `SELECT cc.*, u.display_name, u.avatar_color 
       FROM card_comments cc
       JOIN users u ON cc.user_id = u.id
       WHERE cc.card_id = ? ORDER BY cc.created_at DESC`,
      [req.params.id]
    );

    res.json({
      ...card,
      board_id: list ? list.board_id : null,
      assignees,
      labels,
      tasks,
      attachments,
      comments
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.put('/api/cards/:id', authenticateJWT, async (req, res) => {
  const { title, description, due_date, list_id, position } = req.body;
  try {
    const db = await getDatabase();
    
    const queryParts = [];
    const params = [];

    if (title !== undefined) {
      queryParts.push('title = ?');
      params.push(title.trim());
    }
    if (description !== undefined) {
      queryParts.push('description = ?');
      params.push(description);
    }
    if (due_date !== undefined) {
      queryParts.push('due_date = ?');
      params.push(due_date);
    }
    if (list_id !== undefined) {
      queryParts.push('list_id = ?');
      params.push(list_id);
    }
    if (position !== undefined) {
      queryParts.push('position = ?');
      params.push(position);
    }

    if (queryParts.length > 0) {
      queryParts.push('updated_at = CURRENT_TIMESTAMP');
      params.push(req.params.id);

      await db.run(
        `UPDATE cards SET ${queryParts.join(', ')} WHERE id = ?`,
        params
      );
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.delete('/api/cards/:id', authenticateJWT, async (req, res) => {
  try {
    const db = await getDatabase();
    await db.run('DELETE FROM cards WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Card Assignees
app.post('/api/cards/:id/assignees', authenticateJWT, async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'ID utilisateur requis.' });

  try {
    const db = await getDatabase();
    await db.run('INSERT INTO card_assignees (card_id, user_id) VALUES (?, ?)', [req.params.id, user_id]);
    
    const user = await db.get('SELECT id, username, display_name, avatar_color FROM users WHERE id = ?', [user_id]);
    res.json(user);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Utilisateur déjà assigné.' });
    } else {
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  }
});

app.delete('/api/cards/:id/assignees/:userId', authenticateJWT, async (req, res) => {
  try {
    const db = await getDatabase();
    await db.run('DELETE FROM card_assignees WHERE card_id = ? AND user_id = ?', [req.params.id, req.params.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Card Labels
app.post('/api/cards/:id/labels', authenticateJWT, async (req, res) => {
  const { name, color } = req.body;
  if (!name || !color) return res.status(400).json({ error: 'Nom et couleur requis.' });

  try {
    const db = await getDatabase();
    const result = await db.run('INSERT INTO card_labels (card_id, name, color) VALUES (?, ?, ?)', [req.params.id, name.trim(), color]);
    res.status(201).json({ id: result.lastID, card_id: parseInt(req.params.id), name: name.trim(), color });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.delete('/api/cards/labels/:labelId', authenticateJWT, async (req, res) => {
  try {
    const db = await getDatabase();
    await db.run('DELETE FROM card_labels WHERE id = ?', [req.params.labelId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Card Tasks (Checklists)
app.post('/api/cards/:id/tasks', authenticateJWT, async (req, res) => {
  const { title } = req.body;
  if (!title) return res.status(400).json({ error: 'Titre requis.' });

  try {
    const db = await getDatabase();
    const maxPos = await db.get('SELECT MAX(position) as maxPos FROM card_tasks WHERE card_id = ?', [req.params.id]);
    const nextPos = (maxPos.maxPos !== null && maxPos.maxPos !== undefined) ? maxPos.maxPos + 1 : 0;

    const result = await db.run(
      'INSERT INTO card_tasks (card_id, title, position) VALUES (?, ?, ?)',
      [req.params.id, title.trim(), nextPos]
    );

    res.status(201).json({ id: result.lastID, card_id: parseInt(req.params.id), title: title.trim(), is_completed: 0, position: nextPos });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.put('/api/cards/tasks/:taskId', authenticateJWT, async (req, res) => {
  const { title, is_completed } = req.body;
  try {
    const db = await getDatabase();
    if (title !== undefined) {
      await db.run('UPDATE card_tasks SET title = ? WHERE id = ?', [title.trim(), req.params.taskId]);
    }
    if (is_completed !== undefined) {
      await db.run('UPDATE card_tasks SET is_completed = ? WHERE id = ?', [is_completed ? 1 : 0, req.params.taskId]);
    }
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.delete('/api/cards/tasks/:taskId', authenticateJWT, async (req, res) => {
  try {
    const db = await getDatabase();
    await db.run('DELETE FROM card_tasks WHERE id = ?', [req.params.taskId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Card Timer
app.post('/api/cards/:id/timer/toggle', authenticateJWT, async (req, res) => {
  try {
    const db = await getDatabase();
    const card = await db.get('SELECT * FROM cards WHERE id = ?', [req.params.id]);
    if (!card) return res.status(404).json({ error: 'Carte introuvable.' });

    const now = Math.floor(Date.now() / 1000); // Unix timestamp in seconds

    if (card.timer_started_by) {
      // STOP TIMER
      const elapsed = now - card.timer_start_time;
      const totalTracked = card.tracked_time + Math.max(0, elapsed);

      await db.run(
        'UPDATE cards SET tracked_time = ?, timer_started_by = NULL, timer_start_time = NULL WHERE id = ?',
        [totalTracked, req.params.id]
      );

      res.json({
        timer_active: false,
        tracked_time: totalTracked,
        timer_started_by: null,
        timer_start_time: null
      });
    } else {
      // START TIMER
      await db.run(
        'UPDATE cards SET timer_started_by = ?, timer_start_time = ? WHERE id = ?',
        [req.user.id, now, req.params.id]
      );

      res.json({
        timer_active: true,
        tracked_time: card.tracked_time,
        timer_started_by: req.user.id,
        timer_start_time: now
      });
    }
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Card Attachments
app.post('/api/cards/:id/attachments', authenticateJWT, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'Fichier requis.' });

  try {
    const db = await getDatabase();
    const filePath = `/uploads/${req.file.filename}`;
    const result = await db.run(
      'INSERT INTO card_attachments (card_id, name, file_path, uploaded_by) VALUES (?, ?, ?, ?)',
      [req.params.id, req.file.originalname, filePath, req.user.id]
    );

    res.status(201).json({
      id: result.lastID,
      card_id: parseInt(req.params.id),
      name: req.file.originalname,
      file_path: filePath,
      uploaded_by: req.user.id,
      uploaded_by_name: req.user.display_name,
      created_at: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.delete('/api/cards/attachments/:attachmentId', authenticateJWT, async (req, res) => {
  try {
    const db = await getDatabase();
    const attachment = await db.get('SELECT * FROM card_attachments WHERE id = ?', [req.params.attachmentId]);
    if (!attachment) return res.status(404).json({ error: 'Pièce jointe introuvable.' });

    // Try deleting file from disk
    const diskPath = path.join(__dirname, attachment.file_path);
    if (fs.existsSync(diskPath)) {
      fs.unlinkSync(diskPath);
    }

    await db.run('DELETE FROM card_attachments WHERE id = ?', [req.params.attachmentId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Card Comments
app.post('/api/cards/:id/comments', authenticateJWT, async (req, res) => {
  const { content } = req.body;
  if (!content) return res.status(400).json({ error: 'Contenu requis.' });

  try {
    const db = await getDatabase();
    const result = await db.run(
      'INSERT INTO card_comments (card_id, user_id, content) VALUES (?, ?, ?)',
      [req.params.id, req.user.id, content.trim()]
    );

    const user = await db.get('SELECT display_name, avatar_color FROM users WHERE id = ?', [req.user.id]);

    res.status(201).json({
      id: result.lastID,
      card_id: parseInt(req.params.id),
      user_id: req.user.id,
      display_name: user.display_name,
      avatar_color: user.avatar_color,
      content: content.trim(),
      created_at: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.delete('/api/cards/comments/:commentId', authenticateJWT, async (req, res) => {
  try {
    const db = await getDatabase();
    const comment = await db.get('SELECT * FROM card_comments WHERE id = ?', [req.params.commentId]);
    if (!comment) return res.status(404).json({ error: 'Commentaire introuvable.' });

    // Only creator can delete
    if (comment.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Opération interdite.' });
    }

    await db.run('DELETE FROM card_comments WHERE id = ?', [req.params.commentId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ==========================================
// ADMIN & PROJECT MEMBERS API
// ==========================================

// Get all users for admin panel
app.get('/api/admin/users', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const db = await getDatabase();
    const users = await db.all('SELECT id, username, display_name, avatar_color, role, created_at FROM users ORDER BY display_name ASC');
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Update a user's role
app.put('/api/admin/users/:id/role', authenticateJWT, requireAdmin, async (req, res) => {
  const { role } = req.body;
  if (role !== 'admin' && role !== 'member') {
    return res.status(400).json({ error: 'Rôle invalide.' });
  }
  try {
    const db = await getDatabase();
    
    // Prevent self-demotion
    if (parseInt(req.params.id) === req.user.id && role !== 'admin') {
      return res.status(400).json({ error: 'Impossible de révoquer vos propres privilèges administrateur.' });
    }

    await db.run('UPDATE users SET role = ? WHERE id = ?', [role, req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Delete a user account (admin only)
app.delete('/api/admin/users/:id', authenticateJWT, requireAdmin, async (req, res) => {
  try {
    const db = await getDatabase();
    
    // Protect against self-deletion
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ error: 'Impossible de supprimer votre propre compte.' });
    }

    await db.run('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// Project private members management
app.get('/api/projects/:id/members', authenticateJWT, async (req, res) => {
  try {
    const db = await getDatabase();
    
    const hasAccess = await hasProjectAccess(db, req.params.id, req.user);
    if (!hasAccess) return res.status(403).json({ error: 'Accès non autorisé.' });

    const members = await db.all(
      `SELECT u.id, u.username, u.display_name, u.avatar_color, u.role
       FROM project_members pm 
       JOIN users u ON pm.user_id = u.id 
       WHERE pm.project_id = ?`,
      [req.params.id]
    );
    res.json(members);
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

app.post('/api/projects/:id/members', authenticateJWT, async (req, res) => {
  const { user_id } = req.body;
  if (!user_id) return res.status(400).json({ error: 'ID utilisateur requis.' });

  try {
    const db = await getDatabase();
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Seul un administrateur peut gérer les accès.' });
    }

    await db.run('INSERT INTO project_members (project_id, user_id) VALUES (?, ?)', [req.params.id, user_id]);
    
    const user = await db.get('SELECT id, username, display_name, avatar_color, role FROM users WHERE id = ?', [user_id]);
    res.json(user);
  } catch (error) {
    if (error.message.includes('UNIQUE constraint failed')) {
      res.status(400).json({ error: 'Cet utilisateur a déjà accès.' });
    } else {
      res.status(500).json({ error: 'Erreur serveur.' });
    }
  }
});

app.delete('/api/projects/:id/members/:userId', authenticateJWT, async (req, res) => {
  try {
    const db = await getDatabase();
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Seul un administrateur peut gérer les accès.' });
    }

    await db.run('DELETE FROM project_members WHERE project_id = ? AND user_id = ?', [req.params.id, req.params.userId]);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur.' });
  }
});

// ==========================================
// PRODUCTION FRONTEND SERVING
// ==========================================

// Serve static React files in production
const frontendBuildPath = path.resolve(__dirname, '../frontend/dist');
app.use(express.static(frontendBuildPath));

// For all other routes, serve standard index.html
app.get('*', (req, res, next) => {
  // If request is looking for API or upload assets, skip React routing fallback
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  
  const indexFile = path.join(frontendBuildPath, 'index.html');
  if (fs.existsSync(indexFile)) {
    res.sendFile(indexFile);
  } else {
    res.status(404).send('Web app is building or starting... Please reload in a moment.');
  }
});

// ==========================================
// SERVER INITIALIZATION & WEBSOCKET SETUP
// ==========================================

const server = app.listen(PORT, '0.0.0.0', () => {
  const localIps = getLocalIpAddresses();
  console.log(`\n==================================================`);
  console.log(`🚀 STAN ROBOTIX Kanban Server is running!`);
  console.log(`🏠 Mode: ${isDev ? 'Development' : 'Production'}`);
  console.log(`👉 Access on local computer: http://localhost:${PORT}`);
  
  if (localIps.length > 0) {
    console.log(`🌐 Access on same Wi-Fi / Local Network:`);
    localIps.forEach(ip => {
      console.log(`   🔗 http://${ip}:${PORT}`);
    });
  } else {
    console.log(`⚠️  No external network interface detected.`);
  }
  console.log(`==================================================\n`);
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  let authenticatedUser = null;

  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      if (data.type === 'auth') {
        const decoded = jwt.verify(data.token, JWT_SECRET);
        authenticatedUser = {
          id: decoded.id,
          username: decoded.username,
          display_name: decoded.display_name,
          avatar_color: '#cf2737'
        };

        // Fetch actual avatar color from db
        const db = await getDatabase();
        const user = await db.get('SELECT avatar_color FROM users WHERE id = ?', [decoded.id]);
        if (user) {
          authenticatedUser.avatar_color = user.avatar_color;
        }

        ws.user = authenticatedUser;
        broadcastConnectedUsers();
      }
    } catch (err) {
      console.error('WebSocket connection authentication error:', err);
      ws.close();
    }
  });

  ws.on('close', () => {
    if (authenticatedUser) {
      broadcastConnectedUsers();
    }
  });

  ws.on('error', (err) => {
    console.error('WebSocket client connection error:', err);
  });
});

function broadcastConnectedUsers() {
  const activeUsers = [];
  const seenIds = new Set();

  for (const client of wss.clients) {
    if (client.readyState === 1 && client.user) { // ws.OPEN is 1
      if (!seenIds.has(client.user.id)) {
        seenIds.add(client.user.id);
        activeUsers.push(client.user);
      }
    }
  }

  const broadcastMsg = JSON.stringify({
    type: 'connected_users',
    users: activeUsers
  });

  for (const client of wss.clients) {
    if (client.readyState === 1) { // ws.OPEN is 1
      client.send(broadcastMsg);
    }
  }
}
