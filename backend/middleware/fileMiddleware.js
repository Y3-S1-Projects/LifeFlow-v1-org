import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get the current module's directory path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Serve uploaded documents
const documentsDir = path.join(__dirname, '../uploads/documents');

// Ensure directory exists
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

router.use('/documents', express.static(documentsDir));

export default router;