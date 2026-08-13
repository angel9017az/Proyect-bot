const express = require('express');
const axios = require('axios');
const app = express();

app.use(express.json());

const API_KEY = "CLAVE_SECRETA_ROBLOX_123";
const WEBHOOK_URL = "https://discord.com/api/webhooks/1536975437664882708/_oDKJuzaOwACkcdVxn6YxVIvYPJ_JgnaZCp5pydkDx-VDUGzPA5-4Dg_u4m1amsy486S";

const catalogo = [
    { nombre: "The Puppet", Rarity: "LEGENDARIO", puntosMin: 4000, puntosMax: 7000, robux: 160, color: 0x8A2BE2, peso: 60 },
    { nombre: "Ennard", Rarity: "LEGENDARIO", puntosMin: 4500, puntosMax: 8000, robux: 180, color: 0xFF0055, peso: 30 },
    { nombre: "Golden Freddy", Rarity: "LEGENDARIO", puntosMin: 5000, puntosMax: 8500, robux: 200, color: 0xFFD700, peso: 10 }
];

let ofertaGlobalActiva = {
    nombre: "The Puppet",
    precio: 5000
};

// Algoritmo de rotación
function rotarOfertaGlobal() {
    const pesoTotal = catalogo.reduce((acc, item) => acc + item.peso, 0);
    let rnd = Math.floor(Math.random() * pesoTotal) + 1;
    let acumulado = 0;
    let seleccionado = catalogo[0];

    for (const item of catalogo) {
        acumulado += item.peso;
        if (rnd <= acumulado) {
            seleccionado = item;
            break;
        }
    }

    const precioGenerado = Math.floor((Math.random() * (seleccionado.puntosMax - seleccionado.puntosMin) + seleccionado.puntosMin) / 50) * 50;

    ofertaGlobalActiva = {
        nombre: seleccionado.nombre,
        precio: precioGenerado
    };

    // Enviar un solo mensaje a Discord a nivel servidor central
    axios.post(WEBHOOK_URL, {
        embeds: [{
            title: "👁️‍🗨️ ¡MERCADO NEGRO HA ROTADO!",
            description: "Se ha liberado un personaje en el Mercado Negro.",
            color: seleccionado.color,
            fields: [
                { name: "👤 Personaje en Oferta", value: `**${seleccionado.nombre}** (${seleccionado.Rarity})`, inline: false },
                { name: "🪙 Costo Puntos", value: `🪙 **${precioGenerado}** ShadowCoins`, inline: true },
                { name: "💵 Costo Robux", value: `💵 **${seleccionado.robux}** Robux`, inline: true }
            ],
            footer: { text = "Sistema de Rotación Global • Mercado Negro" }
        }]
    }).catch(err => console.error("Error al enviar Webhook:", err.message));
}

// Bucle de rotación global en Node.js (ejemplo: cada 1 hora)
setInterval(rotarOfertaGlobal, 3600000); 

// Endpoint para que Roblox consulte la oferta activa
app.get('/api/get-active-offer', (req, res) => {
    if (req.query.key !== API_KEY) return res.status(401).json({ error: "Unauthorized" });
    res.json(ofertaGlobalActiva);
});
