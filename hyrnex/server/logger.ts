import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'server.log');
const MAX_IN_MEMORY_LOGS = 100;

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  context: string;
  message: string;
}

class Logger {
  private inMemoryLogs: LogEntry[] = [];

  constructor() {
    // Ensure log file is clean or exists
    try {
      if (!fs.existsSync(LOG_FILE)) {
        fs.writeFileSync(LOG_FILE, '', 'utf-8');
      }
    } catch (e) {
      console.error('Failed to initialize log file:', e);
    }
  }

  private log(level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG', context: string, message: string) {
    const timestamp = new Date().toISOString();
    const entry: LogEntry = { timestamp, level, context, message };

    // Console output
    const consoleMsg = `[${timestamp}] [${level}] [${context}]: ${message}`;
    if (level === 'ERROR') {
      console.error(consoleMsg);
    } else if (level === 'WARN') {
      console.warn(consoleMsg);
    } else {
      console.log(consoleMsg);
    }

    // Push to memory ring buffer
    this.inMemoryLogs.push(entry);
    if (this.inMemoryLogs.length > MAX_IN_MEMORY_LOGS) {
      this.inMemoryLogs.shift();
    }

    // Write to file asynchronously
    try {
      const logLine = `${timestamp} [${level}] [${context}] - ${message}\n`;
      fs.appendFile(LOG_FILE, logLine, (err) => {
        if (err) console.error('Failed to append to log file:', err);
      });
    } catch (e) {
      // Ignore write errors to prevent server crash
    }
  }

  info(context: string, message: string) {
    this.log('INFO', context, message);
  }

  warn(context: string, message: string) {
    this.log('WARN', context, message);
  }

  error(context: string, message: string) {
    this.log('ERROR', context, message);
  }

  debug(context: string, message: string) {
    this.log('DEBUG', context, message);
  }

  getLogs(): LogEntry[] {
    return this.inMemoryLogs;
  }

  clearLogs() {
    this.inMemoryLogs = [];
    try {
      fs.writeFileSync(LOG_FILE, '', 'utf-8');
    } catch (e) {
      // Ignore
    }
  }
}

export const logger = new Logger();
