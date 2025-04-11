import express from "express";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

const PORT = process.env.PORT || 3000;

const PUBLIC_DIR = join(__dirname, "public");

app.use(express.static(PUBLIC_DIR));

app.get("/", (req, res) => {
  res.sendFile(join(PUBLIC_DIR, "index.html"));
});

app.use((req, res) => {
  res.status(404).send("404 Not Found - La page demandée n'existe pas");
});

app.listen(PORT, () => {
  console.log(`Serveur démarré sur http://localhost:${PORT}`);
});
