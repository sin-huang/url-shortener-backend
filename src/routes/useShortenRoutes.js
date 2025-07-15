import express from "express";
import { createUrlMapping } from "../controllers/urlController.js"

const router = express.Router();

router.post('/', createUrlMapping);

export default router;