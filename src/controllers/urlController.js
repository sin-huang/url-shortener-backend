import { db } from '../db/index.js';
import { shortUrls } from '../db/schema.js';
import { eq } from 'drizzle-orm';
import { nanoid } from 'nanoid';

function generateCode(len = 6) {
    return nanoid(len);
}

const createUrlMapping = async (req, res) => {
    const { originalUrl } = req.body;

    try {
        const existing = await db
            .select()
            .from(shortUrls)
            .where(eq(shortUrls.originalUrl, originalUrl))
            .limit(1);

        if (existing.length > 0) {
            const { shortCode } = existing[0];
            return res.status(200).json({
                message: 'Short URL already exists',
                shortUrl: `http://localhost:3000/${shortCode}`,
            });
        }
        const shortCode = generateCode();
        await db.insert(shortUrls).values({
            originalUrl,
            shortCode,
        });

        res.json({
            message: "Short URL already exists",
            shortUrl: `http://localhost:3000/${shortCode}`,
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const getOriginalUrl = async (req, res) => {
    const { shortCode } = req.params;

    try {
        const result = await db
            .select()
            .from(shortUrls)
            .where(eq(shortUrls.shortCode, shortCode))
            .limit(1);

        if (!result.length) {
            return res.status(404).send('Not found');
        }

        res.redirect(result[0].originalUrl);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export { createUrlMapping, getOriginalUrl };