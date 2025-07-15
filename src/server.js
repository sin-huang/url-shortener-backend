import express from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import useShortenRoutes from "./routes/useShortenRoutes.js";

const PORT = process.env.PORT;

const app = express();

app.use(cors());
app.use(express.json());

app.use("/shorten", useShortenRoutes);

app.listen(PORT,()=>{
    console.log(` Server running on ${PORT}`);
})