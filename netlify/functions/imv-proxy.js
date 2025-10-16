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
    const resp = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: event.body || "{}",
    });

    const text = await resp.text();

    // Если Make вернул не 2xx — пробросим и тело, и статус для диагностики
    if (!resp.ok) {
      return {
        statusCode: resp.status,
        headers: { ...cors, "Content-Type": resp.headers.get("content-type") || "application/json" },
        body: text || JSON.stringify({ error: "Upstream error from Make", status: resp.status }),
      };
    }

    return {
      statusCode: 200,
      headers: { ...cors, "Content-Type": "application/json" },
      body: text,
    };
  } catch (e) {
    return { statusCode: 500, headers: cors, body: JSON.stringify({ error: e.message }) };
  }
};
