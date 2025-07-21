import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { createUrlMapping, getOriginalUrl, verifyPassword, toggle, getNote} from "./controllers/urlController.js";
import { createRequire } from "module";

const require = createRequire(import.meta.url);
const swaggerDocument = require("../swagger-output.json");
const swaggerUi = require("swagger-ui-express");

const PORT = process.env.PORT;
const backendUrl = process.env.BACKEND_URL;

const app = express();

app.use(cors());
app.use(express.json());
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

/**
 * @route POST /shorten
 * @tags Shorten
 * @description 建立短網址，可選擇自訂代碼、密碼與備註
 * @bodyContent {ShortenRequest} application/json
 * @response 201 - Created
 */
app.post("/shorten", createUrlMapping);

/**
 * @route GET /:shortCode
 * @tags Shorten
 * @description 使用短網址導向原始網址
 * @param {string} shortCode.path.required - 短網址代碼
 * @response 302 - Redirect to frontend or original URL
 */
app.get("/:shortCode", getOriginalUrl);

/**
 * @route POST /verify
 * @tags Security
 * @description 驗證短網址是否輸入正確密碼
 * @body { shortCode: string, password: string }
 * @response 200 - OK
 * @response 401 - Unauthorized
 */
app.post("/verify", verifyPassword);

/**
 * @route PATCH /:shortCode/enabled
 * @tags Security
 * @description 啟用或停用指定短網址
 * @param {string} shortCode.path.required - 短網址代碼
 * @body { enabled: boolean }
 * @response 200 - OK
 */
app.patch("/:shortCode/enabled",toggle);

/**
 * @route PATCH /:shortCode/enabled
 * @tags Security
 * @description 啟用或停用指定短網址
 * @param {string} shortCode.path.required - 短網址代碼
 * @body { enabled: boolean }
 * @response 200 - OK
 */
app.get("/:shortCode/note", getNote);

app.listen(PORT,()=>{
    console.log(` Server running on ${backendUrl}`);
})