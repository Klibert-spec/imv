// netlify/functions/imv-proxy.js
exports.handler = async (event) => {
  const cors = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS")
    return { statusCode: 204, headers: cors, body: "" };
  if (event.httpMethod !== "POST")
    return { statusCode: 405, headers: cors, body: "Method Not Allowed" };

  const url = process.env.MAKE_WEBHOOK_URL;
  if (!url) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: "No MAKE_WEBHOOK_URL" }) };
  }

  try {
    // В Node 18 на Netlify fetch глобальный — никаких зависимостей не нужно
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: event.body || "{}",
    });

    const text = await resp.text();
