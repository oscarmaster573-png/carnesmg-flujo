const { getStore } = require('@netlify/blobs');

function generarCodigo(){
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 12);
}

exports.handler = async (event) => {
  const headers = { 'Content-Type': 'application/json' };
  const store = getStore('carnesmg-sync');
  const code = event.queryStringParameters && event.queryStringParameters.code;

  try {
    if (event.httpMethod === 'GET') {
      if (!code) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'falta el código' }) };
      }
      const data = await store.get(code, { type: 'json' });
      if (data === null) {
        return { statusCode: 404, headers, body: JSON.stringify({ error: 'no existe ese código' }) };
      }
      return { statusCode: 200, headers, body: JSON.stringify(data) };
    }

    if (event.httpMethod === 'POST' || event.httpMethod === 'PUT') {
      let body;
      try {
        body = JSON.parse(event.body || '{}');
      } catch (e) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'json inválido' }) };
      }
      const finalCode = code || generarCodigo();
      await store.setJSON(finalCode, body);
      return { statusCode: 200, headers, body: JSON.stringify({ code: finalCode }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'método no permitido' }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};
