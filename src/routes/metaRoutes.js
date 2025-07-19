import express from "express";
import { fetchMeta } from "../controllers/metaController.js";

const router = express.Router();

router.post("/", fetchMeta);

export default router;