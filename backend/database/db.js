import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { readFile } from "fs/promises";
import path from "path";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function openDb() {
    try {
        let dbPath;

        if (process.env.NODE_ENV === "test") {
            dbPath = path.join(__dirname,"database_test.db");
        } else {
            dbPath = path.join(__dirname, "database.db");
        }

        const db = await open({
            filename: dbPath,
            driver: sqlite3.Database,
        });
        await initDb(db);

        return db;
    } catch (error) {
        throw new Error("Failed to open database: " + error.message);
    }
}

async function initDb(db) {
    try {
        const __dirname = dirname(fileURLToPath(import.meta.url));

        const schemaSQL = await readFile(join(__dirname, "schema.sql"), 'utf8');

        await db.exec(schemaSQL);
        console.log("Database initialized successfully with schema.sql");
    } catch (error) {
        throw new Error("Failed to initialize database");
    }
}