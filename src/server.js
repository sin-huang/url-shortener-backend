import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import { createUrlMapping, getOriginalUrl, verifyPassword, toggle, getNote} from "./controllers/urlController.js";

const PORT = process.env.PORT;
const backendUrl = process.env.BACKEND_URL;

const app = express();

app.use(cors());
app.use(express.json());

app.post("/shorten", createUrlMapping);
app.get("/:shortCode/note", getNote);
app.get("/:shortCode", getOriginalUrl);
app.patch("/:shortCode/enabled",toggle);
app.post("/verify", verifyPassword);

app.listen(PORT,()=>{
    console.log(` Server running on ${backendUrl}`);
})