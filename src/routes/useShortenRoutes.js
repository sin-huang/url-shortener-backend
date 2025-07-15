import express from "express";

const router = express.Router();

router.post('/', createUrlMapping);
router.get('/:shortCode', getOriginalUrl);