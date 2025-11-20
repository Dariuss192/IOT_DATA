// server.js
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Conexión a MongoDB Atlas
const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
  .then(() => console.log("Conectado a MongoDB Atlas"))
  .catch(err => console.error("Error al conectar a MongoDB:", err));

// Esquema actualizado para incluir gas y timestamp
const sensorSchema = new mongoose.Schema({
  device_id: String,
  temperature: Number,
  humidity: Number,
  light: Number,
  gas: Number,
  led_state: Boolean,
  timestamp: { type: Date, default: Date.now }
});

const SensorData = mongoose.model("SensorData", sensorSchema);

// Endpoint POST
app.post("/data", async (req, res) => {
  try {
    const { device_id, temperature, humidity, light, gas, led_state, timestamp } = req.body;

    if (!device_id || temperature === undefined || humidity === undefined || light === undefined || gas === undefined || led_state === undefined) {
      return res.status(400).json({ error: "Faltan campos en la solicitud" });
    }

    const newData = new SensorData({
      device_id,
      temperature,
      humidity,
      light,
      gas,
      led_state,
      timestamp: timestamp ? new Date(timestamp) : undefined
    });

    await newData.save();
    res.status(201).json({ message: "Datos guardados correctamente" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Error al guardar los datos" });
  }
});

// Endpoint GET para consultar últimos registros
app.get("/data", async (req, res) => {
  try {
    const data = await SensorData.find().sort({ timestamp: -1 }).limit(20);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Error al obtener los datos" });
  }
});

app.get("/", (req, res) => {
  res.send("API IoT ESP32 + MongoDB Atlas funcionando correctamente!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor corriendo en puerto ${PORT}`));
