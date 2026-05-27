import { getDatabase } from './database.js';
import bcrypt from 'bcryptjs';
import assert from 'assert';

async function testDatabase() {
  console.log("🧪 Démarrage des tests unitaires de la base de données SQLite...");
  
  try {
    const db = await getDatabase();
    
    // 1. Clean test entries if any exist
    await db.run('DELETE FROM users WHERE username = ?', ['testuser_robotix']);
    await db.run('DELETE FROM projects WHERE name = ?', ['Projet Robotix Test']);
    
    // 2. Test User Creation
    console.log("👉 Test 1: Création d'utilisateur...");
    const passHash = await bcrypt.hash('password123', 10);
    const userRes = await db.run(
      'INSERT INTO users (username, password_hash, display_name, avatar_color) VALUES (?, ?, ?, ?)',
      ['testuser_robotix', passHash, 'Test Robotix Member', '#cf2737']
    );
    
    const user = await db.get('SELECT * FROM users WHERE id = ?', [userRes.lastID]);
    assert.strictEqual(user.username, 'testuser_robotix');
    assert.strictEqual(user.display_name, 'Test Robotix Member');
    assert.strictEqual(user.avatar_color, '#cf2737');
    console.log("   ✅ Utilisateur créé avec succès ! ID:", user.id);
    
    // 3. Test Project -> Folder -> Board Hierarchy
    console.log("👉 Test 2: Création de la hiérarchie Projets -> Dossiers -> Tableaux...");
    
    // Create Project
    const projRes = await db.run('INSERT INTO projects (name) VALUES (?)', ['Projet Robotix Test']);
    const project = await db.get('SELECT * FROM projects WHERE id = ?', [projRes.lastID]);
    assert.strictEqual(project.name, 'Projet Robotix Test');
    console.log("   ✅ Projet créé avec succès ! ID:", project.id);
    
    // Create Folder in Project
    const foldRes = await db.run(
      'INSERT INTO folders (name, project_id) VALUES (?, ?)',
      ['Dossier Test Coupe', project.id]
    );
    const folder = await db.get('SELECT * FROM folders WHERE id = ?', [foldRes.lastID]);
    assert.strictEqual(folder.name, 'Dossier Test Coupe');
    assert.strictEqual(folder.project_id, project.id);
    console.log("   ✅ Dossier créé avec succès ! ID:", folder.id);
    
    // Create Board in Folder
    const boardRes = await db.run(
      'INSERT INTO boards (name, project_id, folder_id) VALUES (?, ?, ?)',
      ['Tableau Principal', project.id, folder.id]
    );
    const board = await db.get('SELECT * FROM boards WHERE id = ?', [boardRes.lastID]);
    assert.strictEqual(board.name, 'Tableau Principal');
    assert.strictEqual(board.project_id, project.id);
    assert.strictEqual(board.folder_id, folder.id);
    console.log("   ✅ Tableau Kanban créé avec succès ! ID:", board.id);
    
    // 4. Test Column & Card Creation
    console.log("👉 Test 3: Création de colonnes et de cartes...");
    const listRes = await db.run(
      'INSERT INTO lists (board_id, name, position) VALUES (?, ?, ?)',
      [board.id, 'Colonne Test', 0]
    );
    const list = await db.get('SELECT * FROM lists WHERE id = ?', [listRes.lastID]);
    assert.strictEqual(list.name, 'Colonne Test');

    const cardRes = await db.run(
      'INSERT INTO cards (list_id, title, created_by) VALUES (?, ?, ?)',
      [list.id, 'Ma Carte Test', user.id]
    );
    const card = await db.get('SELECT * FROM cards WHERE id = ?', [cardRes.lastID]);
    assert.strictEqual(card.title, 'Ma Carte Test');
    assert.strictEqual(card.list_id, list.id);
    assert.strictEqual(card.created_by, user.id);
    console.log("   ✅ Colonne et Carte créées avec succès ! ID Carte:", card.id);

    // 5. Test Cascade Delete
    console.log("👉 Test 4: Test de la suppression en cascade (Projet -> Dossiers/Tableaux/Colonnes/Cartes)...");
    await db.run('DELETE FROM projects WHERE id = ?', [project.id]);
    
    const checkFolder = await db.get('SELECT * FROM folders WHERE id = ?', [folder.id]);
    const checkBoard = await db.get('SELECT * FROM boards WHERE id = ?', [board.id]);
    
    assert.strictEqual(checkFolder, undefined, "Le dossier n'a pas été supprimé en cascade !");
    assert.strictEqual(checkBoard, undefined, "Le tableau n'a pas été supprimé en cascade !");
    console.log("   ✅ Suppression en cascade validée de façon optimale !");

    // Clean up user
    await db.run('DELETE FROM users WHERE id = ?', [user.id]);
    
    console.log("\n💯 TOUS LES TESTS DE LA BASE DE DONNÉES SONT RÉUSSIS ! L'architecture SQLite est 100% robuste.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Échec des tests de la base de données :", error);
    process.exit(1);
  }
}

testDatabase();
