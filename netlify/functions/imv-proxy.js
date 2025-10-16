// netlify/functions/imv-proxy.js
// Прокси Netlify → Make webhook. Без внешних библиотек.

exports.handler = async (event) => {
  const CORS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  // Предзапросы браузера
  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: CORS, body: "" };
  }

  // Принимаем только POST
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Only POST is allowed" }),
    };
  }

  const WEBHOOK = process.env.MAKE_WEBHOOK_URL;
  if (!WEBHOOK) {
    return {
      statusCode: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: "MAKE_WEBHOOK_URL is missing" }),
    };
  }

  try {
    // Пробрасываем тело запроса как есть
    const upstream = await fetch(WEBHOOK, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: event.body || "{}",
    });

    const text = await upstream.text(); // не трогаем формат, отдаём как вернул Make

    // Если Make вернул ошибку — пробросим статус и тело для прозрачной диагностики
    return {
      statusCode: upstream.status,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: text || JSON.stringify({ error: "Empty response from Make" }),
    };
  } catch (err) {
    return {
      statusCode: 500,
      headers: { ...CORS, "Content-Type": "application/json" },
      body: JSON.stringify({ error: err.message || "Proxy failed" }),
    };
  }
};
