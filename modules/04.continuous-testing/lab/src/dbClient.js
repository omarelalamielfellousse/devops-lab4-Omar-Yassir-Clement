// src/dbClient.js
const redis = require('redis');

// --- Paramètres depuis l'environnement (Render/CI) avec fallback local ---
const HOST = process.env.REDIS_HOST || '127.0.0.1';
const PORT = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : 6379;
const PASSWORD = process.env.REDIS_PASSWORD || undefined;
// Active TLS si ton fournisseur Redis l'exige (facultatif)
const USE_TLS = String(process.env.REDIS_TLS || '').toLowerCase() === 'true';

// --- Client Redis (API v3.x, conforme à "redis": "^3.1.2") ---
const client = redis.createClient({
  host: HOST,
  port: PORT,
  password: PASSWORD,           // pour v3 c'est supporté (alias d'auth_pass)
  tls: USE_TLS ? { servername: HOST } : undefined,
  retry_strategy: (options) => {
    // En tests, on échoue rapidement pour voir l’erreur dans la CI
    if (process.env.NODE_ENV === 'test') {
      return new Error('Redis unavailable during tests');
    }
    // Trop de tentatives → on arrête proprement
    if (options.attempt > 10) {
      return new Error('Retry time exhausted');
    }
    // Reconnexion progressive (capée à 3s)
    return Math.min(options.attempt * 100, 3000);
  }
});

client.on('ready', () => {
  console.log(`[Redis] ready on ${HOST}:${PORT}${USE_TLS ? ' (TLS)' : ''}`);
});

client.on('error', (err) => {
  console.error('[Redis] error:', err.message);
});

process.on('SIGINT', () => {
  client.quit();
});

module.exports = client;
