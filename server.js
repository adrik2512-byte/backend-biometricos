require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// ── Middlewares ──────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Conexión MongoDB Atlas ───────────────────────────────────────────────────
// RNF01: la cadena de conexión está SOLO aquí en el backend, nunca en la app móvil
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB Atlas conectado"))
    .catch((err) => console.error("Error MongoDB:", err));

// ── Modelo (campos compatibles con la app Android) ───────────────────────────
const Entrenamiento = mongoose.model("Entrenamiento", {
    titulo    : { type: String, default: "" },
    resumen   : { type: String, default: "" },
    kilometros: { type: Number, default: 0 },
    minutos   : { type: Number, default: 0 },
    fecha     : { type: String, default: "" },
    hora      : { type: String, default: "" },
});

// ── GET /api/test  →  health-check ───────────────────────────────────────────
app.get("/api/test", (req, res) => {
    res.json({ success: true, message: "Backend funcionando correctamente" });
});

// ── POST /api/entradas  →  guardar entrenamiento ─────────────────────────────
app.post("/api/entradas", async (req, res) => {
    try {
        const { titulo, resumen, kilometros, minutos, fecha, hora } = req.body;
        const nuevo = new Entrenamiento({ titulo, resumen, kilometros, minutos, fecha, hora });
        const guardado = await nuevo.save();
        res.status(201).json({ success: true, data: guardado });
    } catch (e) {
        console.error("Error POST /api/entradas:", e);
        res.status(500).json({ success: false, message: "Error al guardar: " + e.message });
    }
});

// ── GET /api/entradas  →  obtener historial ──────────────────────────────────
app.get("/api/entradas", async (req, res) => {
    try {
        const datos = await Entrenamiento.find().sort({ fecha: 1, hora: 1 });
        res.json({ success: true, data: datos });
    } catch (e) {
        console.error("Error GET /api/entradas:", e);
        res.status(500).json({ success: false, message: "Error al obtener: " + e.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});