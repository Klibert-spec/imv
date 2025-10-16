// netlify/functions/imv-proxy.js
const MAKE_WEBHOOK_URL = process.env.MAKE_WEBHOOK_URL;

export const handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers: cors, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers: cors, body: "Method Not Allowed" };
  }
  if (!MAKE_WEBHOOK_URL) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: "No MAKE_WEBHOOK_URL env var" }) };
  }

  try {
    // Проксируем тело запроса как есть
    const resp = await fetch(MAKE_WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: event.body || "{}",
    });

    const text = await resp.text();
    const headers = { ...cors, "Content-Type": "application/json" };

    return { statusCode: resp.status, headers, body: text };
  } catch (e) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: e.message }) };
  }
};
