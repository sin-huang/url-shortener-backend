import { db } from '../db/index.js';
import { shortUrls } from '../db/schema.js';
import { eq } from 'drizzle-orm'
import { nanoid } from 'nanoid';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
dotenv.config(); 

const backendUrl = process.env.BACKEND_URL;
const frontendUrl = process.env.FRONTEND_URL;

function generateCode(len = 6) {
    return nanoid(len);
}

const createUrlMapping = async (req, res) => {
    const { originalUrl, customUrl, password, note } = req.body

    if (!originalUrl) {
        return res.status(400).json({ error: '缺少必要欄位 originalUrl' })
    }

    try {
        let passwordHash = null
        if (password) {
            const salt = await bcrypt.genSalt(10)
            passwordHash = await bcrypt.hash(password, salt)
        }

        // 有自訂短網址的情況
        if (customUrl) {
            // 檢查 customUrl 是否已經被使用
            const conflict = await db
                .select()
                .from(shortUrls)
                .where(eq(shortUrls.shortCode, customUrl))
                .limit(1)

            if (conflict.length > 0) {
                return res.status(409).json({ error: '短網址已被使用，請換一個' })
            }

            // 新增一筆（即使原始網址存在，也視為另一筆）
            await db.insert(shortUrls).values({
                originalUrl,
                shortCode: customUrl,
                password: passwordHash,
                note,
            })

            return res.status(201).json({
                message: '已成功建立自訂短網址',
                shortUrl: `${backendUrl}/${customUrl}`,
            })
        }

        // 沒有自訂，檢查是否已存在相同 originalUrl 的紀錄
        if (!customUrl) {
            const existing = await db
                .select()
                .from(shortUrls)
                .where(
                    eq(shortUrls.originalUrl, originalUrl)
                )
                .limit(1)
            // 只有在都無密碼設定才可共用    
            if (existing.length > 0 && existing[0].password === null && passwordHash === null) {
                return res.status(200).json({
                    message: '已存在相同網址的紀錄',
                    shortUrl: `${backendUrl}/${existing[0].shortCode}`,
                })
            }
        }

        // 尚未存在，產生新短碼
        let shortCode
        while (true) {
            shortCode = generateCode()
            const taken = await db
                .select()
                .from(shortUrls)
                .where(eq(shortUrls.shortCode, shortCode))
                .limit(1)
            if (taken.length === 0) break
        }

        await db.insert(shortUrls).values({
            originalUrl,
            shortCode,
            password: passwordHash,
            note,
        })

        return res.status(201).json({
            message: '成功建立短網址',
            shortUrl: `${backendUrl}/${shortCode}`,
        })
    } catch (err) {
        console.error('[createUrlMapping error]', err)
        res.status(500).json({ error: '伺服器錯誤，請稍後再試' })
    }
}

const getOriginalUrl = async (req, res) => {
    const { shortCode } = req.params;

    try {
        const result = await db
            .select()
            .from(shortUrls)
            .where(eq(shortUrls.shortCode, shortCode))
            .limit(1);

        if (!result.length) {
            return res.status(404).send('找不到該短網址');
        }

        const record = result[0]

        if (!record.enabled) {
            return res.redirect(`${frontendUrl}/disabled`)
        }


        if (record.password) {
            // 有密碼 ➜ 顯示密碼輸入頁
            return res.redirect(`${frontendUrl}/verify/${shortCode}`)
        }

        return res.redirect(record.originalUrl)
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

const verifyPassword = async (req, res) => {
    const { shortCode, password } = req.body

    const result = await db
        .select()
        .from(shortUrls)
        .where(eq(shortUrls.shortCode, shortCode))
        .limit(1)

    if (!result.length) return res.status(404).json({ error: '找不到該短網址' })

    const record = result[0]

    const match = await bcrypt.compare(password, record.password)

    if (!match) {
        return res.status(401).json({ error: '密碼錯誤' })
    }

    return res.json({ originalUrl: record.originalUrl })
}

const toggle = async (req, res) => {
    const { shortCode } = req.params;
    const { enabled } = req.body;

    try {
        await db.update(shortUrls)
            .set({ enabled })
            .where(eq(shortUrls.shortCode, shortCode));

        res.json({ message: '啟用狀態已更新' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: '更新失敗' });
    }
}

const getNote = async(req, res) => {
    const { shortCode } = req.params

    try {
        const result = await db
            .select({
                note: shortUrls.note,
            })
            .from(shortUrls)
            .where(eq(shortUrls.shortCode, shortCode))
            .limit(1)

        if (!result.length) {
            return res.status(404).json({ message: '找不到此短網址' })
        }

        res.json({ note: result[0].note || '' })
    } catch (err) {
        console.error(err)
        res.status(500).json({ error: '無法取得備註' })
    }
}

export { createUrlMapping, getOriginalUrl, verifyPassword, toggle, getNote };