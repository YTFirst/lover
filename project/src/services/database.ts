import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';

class DatabaseService {
  private db: Database.Database | null = null;

  constructor() {
    this.initDatabase();
  }

  private initDatabase() {
    try {
      // 数据库文件路径
      const dbPath = path.join(app.getPath('userData'), 'heartmate.db');
      this.db = new Database(dbPath);
      this.initTables();
      console.log('Database initialized successfully');
    } catch (error) {
      console.error('Error initializing database:', error);
      // 可以在这里添加更多错误处理逻辑，比如创建备用数据库或提示用户
    }
  }

  private initTables() {
    if (!this.db) return;

    try {
      // 用户设置表
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT NOT NULL
        );
      `);

      // 角色设定表
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS character (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          name TEXT NOT NULL,
          avatar_path TEXT,
          portrait_path TEXT,
          system_prompt TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 对话会话表
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS conversations (
          id TEXT PRIMARY KEY,
          date TEXT NOT NULL,
          started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          message_count INTEGER DEFAULT 0
        );
      `);

      // 消息记录表
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS messages (
          id TEXT PRIMARY KEY,
          conversation_id TEXT NOT NULL,
          role TEXT NOT NULL,
          content TEXT NOT NULL,
          timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
          metadata TEXT,
          FOREIGN KEY (conversation_id) REFERENCES conversations(id)
        );
      `);

      // 对话历史全文搜索表
      this.db.exec(`
        CREATE VIRTUAL TABLE IF NOT EXISTS messages_fts USING fts5(
          content,
          content=messages,
          content_rowid=rowid
        );
      `);

      // 记忆文件索引表
      this.db.exec(`
        CREATE TABLE IF NOT EXISTS memory_files (
          id TEXT PRIMARY KEY,
          type TEXT NOT NULL,
          date_key TEXT NOT NULL,
          file_path TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // 创建触发器，用于更新消息全文搜索索引
      this.db.exec(`
        CREATE TRIGGER IF NOT EXISTS messages_fts_insert AFTER INSERT ON messages
        BEGIN
          INSERT INTO messages_fts(rowid, content) VALUES (new.rowid, new.content);
        END;
      `);

      this.db.exec(`
        CREATE TRIGGER IF NOT EXISTS messages_fts_update AFTER UPDATE ON messages
        BEGIN
          UPDATE messages_fts SET content = new.content WHERE rowid = new.rowid;
        END;
      `);

      this.db.exec(`
        CREATE TRIGGER IF NOT EXISTS messages_fts_delete AFTER DELETE ON messages
        BEGIN
          DELETE FROM messages_fts WHERE rowid = old.rowid;
        END;
      `);

      console.log('Database tables initialized successfully');
    } catch (error) {
      console.error('Error initializing database tables:', error);
    }
  }

  // 获取数据库实例
  getDB(): Database.Database | null {
    if (!this.db) {
      console.warn('Database not initialized');
      this.initDatabase();
    }
    return this.db;
  }

  // 关闭数据库
  close() {
    try {
      if (this.db) {
        this.db.close();
        this.db = null;
        console.log('Database closed successfully');
      }
    } catch (error) {
      console.error('Error closing database:', error);
    }
  }

  // 执行查询并处理错误
  execute<T>(query: string, params: any[] = []): T[] {
    try {
      const db = this.getDB();
      if (!db) throw new Error('Database not initialized');
      
      const stmt = db.prepare(query);
      return stmt.all(params) as T[];
    } catch (error) {
      console.error('Error executing query:', error);
      return [];
    }
  }

  // 执行单个操作并处理错误
  run(query: string, params: any[] = []): boolean {
    try {
      const db = this.getDB();
      if (!db) throw new Error('Database not initialized');
      
      const stmt = db.prepare(query);
      stmt.run(params);
      return true;
    } catch (error) {
      console.error('Error running query:', error);
      return false;
    }
  }

  // 执行单个操作并返回插入的ID
  runWithId(query: string, params: any[] = []): string | number | null {
    try {
      const db = this.getDB();
      if (!db) throw new Error('Database not initialized');
      
      const stmt = db.prepare(query);
      const result = stmt.run(params);
      return Number(result.lastInsertRowid);
    } catch (error) {
      console.error('Error running query with id:', error);
      return null;
    }
  }
}

// 导出单例
const databaseService = new DatabaseService();
export default databaseService;
