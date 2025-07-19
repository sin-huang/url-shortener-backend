import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import useShortenRoutes from "./routes/useShortenRoutes.js";
import metaRoutes from "./routes/metaRoutes.js";
import { getOriginalUrl, verifyPassword} from "./controllers/urlController.js";

const PORT = process.env.PORT;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/shorten", useShortenRoutes);
app.use("/fetch-meta", metaRoutes);
app.get('/:shortCode', getOriginalUrl);
app.post('/verify', verifyPassword);


app.listen(PORT,()=>{
    console.log(` Server running on http://localhost:${PORT}`);
})