import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dbPath = path.resolve(__dirname, 'kanban.db');

let db;

export async function getDatabase() {
  if (db) return db;

  // Open the database connection
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database
  });

  // Enable foreign keys constraints in SQLite (essential for cascade deletes)
  await db.run('PRAGMA foreign_keys = ON;');

  // Run column migrations safely (for backwards compatibility if database already exists)
  try {
    await db.run("ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'member';");
  } catch (e) {
    // Column already exists, ignore
  }

  try {
    await db.run("ALTER TABLE projects ADD COLUMN is_private INTEGER DEFAULT 0;");
  } catch (e) {
    // Column already exists, ignore
  }

  try {
    await db.run("ALTER TABLE robots ADD COLUMN github_repo TEXT DEFAULT '';");
  } catch (e) {
    // Column already exists, ignore
  }

  try {
    await db.run("ALTER TABLE can_devices ADD COLUMN git_branch TEXT DEFAULT '';");
  } catch (e) {
    // Column already exists, ignore
  }

  // Create project_members table
  try {
    await db.exec(`
      CREATE TABLE IF NOT EXISTS project_members (
        project_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        PRIMARY KEY (project_id, user_id),
        FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `);
  } catch (e) {
    // Table already exists, ignore
  }

  // Create tables
  await db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      display_name TEXT NOT NULL,
      avatar_color TEXT NOT NULL,
      role TEXT DEFAULT 'member',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS projects (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      is_private INTEGER DEFAULT 0,
      position INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      position INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS boards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      project_id INTEGER NOT NULL,
      folder_id INTEGER,
      name TEXT NOT NULL,
      position INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
      FOREIGN KEY (folder_id) REFERENCES folders(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS board_members (
      board_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      PRIMARY KEY (board_id, user_id),
      FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS lists (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      board_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      position INTEGER DEFAULT 0,
      is_collapsed INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS cards (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      list_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      description TEXT DEFAULT '',
      position INTEGER DEFAULT 0,
      due_date TEXT,
      tracked_time INTEGER DEFAULT 0,
      timer_started_by INTEGER,
      timer_start_time INTEGER,
      created_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (list_id) REFERENCES lists(id) ON DELETE CASCADE,
      FOREIGN KEY (timer_started_by) REFERENCES users(id) ON DELETE SET NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS card_assignees (
      card_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      PRIMARY KEY (card_id, user_id),
      FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS card_labels (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      card_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS card_tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      card_id INTEGER NOT NULL,
      title TEXT NOT NULL,
      is_completed INTEGER DEFAULT 0,
      position INTEGER DEFAULT 0,
      FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS card_attachments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      card_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      uploaded_by INTEGER,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
      FOREIGN KEY (uploaded_by) REFERENCES users(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS card_comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      card_id INTEGER NOT NULL,
      user_id INTEGER NOT NULL,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS robots (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT DEFAULT '',
      github_repo TEXT DEFAULT '',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS can_devices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      robot_id INTEGER NOT NULL,
      can_id INTEGER NOT NULL,
      name TEXT NOT NULL,
      device_type TEXT NOT NULL,
      bus_type TEXT NOT NULL DEFAULT 'rio',
      subsystem TEXT DEFAULT '',
      notes TEXT DEFAULT '',
      git_branch TEXT DEFAULT '',
      FOREIGN KEY (robot_id) REFERENCES robots(id) ON DELETE CASCADE
    );
  `);

  // Seed admin user nayl / 123456 if not exists
  try {
    const adminUser = await db.get("SELECT id FROM users WHERE username = 'nayl'");
    if (!adminUser) {
      const hash = await bcrypt.hash('123456', 10);
      await db.run(
        "INSERT INTO users (username, password_hash, display_name, avatar_color, role) VALUES (?, ?, ?, ?, ?)",
        ['nayl', hash, 'Nayl', '#cf2737', 'admin']
      );
      console.log("Admin user 'nayl' created successfully!");
    }
  } catch (e) {
    console.error("Error seeding admin user 'nayl':", e);
  }

  // Seed default robots and CAN devices if none exist
  try {
    const robotCount = await db.get("SELECT COUNT(*) as count FROM robots");
    if (robotCount.count === 0) {
      // 1. Competition Robot
      const resultComp = await db.run(
        "INSERT INTO robots (name, description) VALUES (?, ?)",
        ["Robot 2026 - Competition", "Robot principal de compétition pour la saison 2026. Utilise un bus CANivore FD dédié à la propulsion Swerve (moteurs Kraken X60)."]
      );
      const compId = resultComp.lastID;
      
      const compDevices = [
        [compId, 1, "Swerve Drive Front Left", "Talon FX", "canivore", "Base Pilotable", "Moteur Kraken X60"],
        [compId, 2, "Swerve Turn Front Left", "Talon FX", "canivore", "Base Pilotable", "Moteur Talon FX classique"],
        [compId, 11, "CANcoder Front Left", "CANcoder", "canivore", "Base Pilotable", "Encodeur absolu de pivot"],
        [compId, 3, "Swerve Drive Front Right", "Talon FX", "canivore", "Base Pilotable", "Moteur Kraken X60"],
        [compId, 4, "Swerve Turn Front Right", "Talon FX", "canivore", "Base Pilotable", "Moteur Talon FX classique"],
        [compId, 12, "CANcoder Front Right", "CANcoder", "canivore", "Base Pilotable", "Encodeur absolu de pivot"],
        [compId, 30, "Pigeon 2 IMU", "Pigeon 2", "canivore", "Centrale Inertielle", "Montée sur le châssis principal"],
        [compId, 21, "Shooter Left Flywheel", "Talon FX", "canivore", "Lanceur", "Vitesse de sortie max 6000 RPM"],
        [compId, 22, "Shooter Right Flywheel", "Talon FX", "canivore", "Lanceur", "Vitesse de sortie max 6000 RPM"],
        [compId, 20, "Intake Motor", "Spark MAX", "rio", "Intake", "Moteur Neo550 d'alimentation"],
        [compId, 1, "Power Distribution Hub", "PDH", "rio", "Alimentation", "Distribution de puissance principale 12V"]
      ];

      for (const dev of compDevices) {
        await db.run(
          "INSERT INTO can_devices (robot_id, can_id, name, device_type, bus_type, subsystem, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
          dev
        );
      }

      // 2. OffSeason Gala Robot
      const resultGala = await db.run(
        "INSERT INTO robots (name, description) VALUES (?, ?)",
        ["Robot 2025 - OffSeason Gala", "Robot d'entraînement d'intersaison réutilisé pour les démonstrations de la kermesse de fin d'année."]
      );
      const galaId = resultGala.lastID;

      const galaDevices = [
        [galaId, 1, "Swerve Drive Front Left", "Spark MAX", "rio", "Base Pilotable", "Moteur Neo classique (Conflit d'ID volontaire)"],
        [galaId, 2, "Swerve Turn Front Left", "Spark MAX", "rio", "Base Pilotable", "Moteur Neo classique"],
        [galaId, 3, "Swerve Drive Front Right", "Spark MAX", "rio", "Base Pilotable", "Moteur Neo classique"],
        [galaId, 4, "Swerve Turn Front Right", "Spark MAX", "rio", "Base Pilotable", "Moteur Neo classique"],
        [galaId, 10, "Pigeon IMU", "Pigeon 2", "rio", "Centrale Inertielle", "Montée sur la carte mère"],
        [galaId, 1, "Power Distribution Panel", "PDH", "rio", "Alimentation", "Distribution de puissance (Conflit ID 1 avec Swerve FL)"]
      ];

      for (const dev of galaDevices) {
        await db.run(
          "INSERT INTO can_devices (robot_id, can_id, name, device_type, bus_type, subsystem, notes) VALUES (?, ?, ?, ?, ?, ?, ?)",
          dev
        );
      }

      console.log("Default robots and CAN devices successfully seeded!");
    }
  } catch (e) {
    console.error("Error seeding default robots and CAN devices:", e);
  }

  console.log(`SQLite database connected & initialized at: ${dbPath}`);
  return db;
}
