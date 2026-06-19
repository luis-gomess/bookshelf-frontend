import { apiConfig } from "../config/apiConfig.js";

export class HttpError extends Error {
  constructor(
    message,
    {
      status = 0,
      fields = [],
      requestedPath = null,
      backendPath = null,
      cause,
    } = {},
  ) {
    super(message, cause ? { cause } : undefined);
    this.name = "HttpError";
    this.status = status;
    this.fields = fields;
    this.requestedPath = requestedPath;
    this.backendPath = backendPath;
  }
}

async function request(path, options = {}) {
  let response;

  try {
    response = await fetch(`${apiConfig.apiBaseUrl}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  } catch (cause) {
    throw new HttpError(
      "Não foi possível conectar à API. Verifique se o backend está disponível e se o CORS está configurado.",
      { requestedPath: path, cause },
    );
  }

  const responseText = await response.text();
  const responseBody = parseResponseBody(responseText);

  if (!response.ok) {
    const fields = normalizeFields(responseBody);
    throw new HttpError(buildErrorMessage(response, responseBody, fields), {
      status: response.status,
      fields,
      requestedPath: path,
      backendPath:
        responseBody && typeof responseBody === "object"
          ? responseBody.path ?? null
          : null,
    });
  }

  return response.status === 204 || responseText.trim() === ""
    ? null
    : responseBody;
}

function parseResponseBody(responseText) {
  if (!responseText || responseText.trim() === "") {
    return null;
  }

  try {
    return JSON.parse(responseText);
  } catch {
    return responseText;
  }
}

function normalizeFields(responseBody) {
  if (!responseBody || typeof responseBody !== "object" || !Array.isArray(responseBody.fields)) {
    return [];
  }

  return responseBody.fields.map((item) => ({
    field: item.field || "campo",
    message: item.message || "valor inválido",
  }));
}

function buildErrorMessage(response, responseBody, fields) {
  if (fields.length) {
    return fields.map((item) => `${item.field}: ${item.message}`).join("; ");
  }

  if (responseBody && typeof responseBody === "object") {
    return (
      responseBody.message ||
      responseBody.mensagem ||
      `Não foi possível concluir a requisição. Erro HTTP ${response.status}.`
    );
  }

  if (typeof responseBody === "string" && responseBody.trim()) {
    return responseBody;
  }

  return `Não foi possível concluir a requisição. Erro HTTP ${response.status}.`;
}

export function get(path) {
  return request(path);
}

export function post(path, body) {
  return request(path, {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function put(path, body) {
  return request(path, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

export function remove(path) {
  return request(path, {
    method: "DELETE",
  });
}
