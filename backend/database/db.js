import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { readFile } from "fs/promises";
import { dirname, join } from "path";
import { fileURLToPath } from "url";


export async function openDb() {
    try {
        const __dirname = dirname(fileURLToPath(import.meta.url));
        const db = await open({
            filename: join(__dirname, "database.db"),
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