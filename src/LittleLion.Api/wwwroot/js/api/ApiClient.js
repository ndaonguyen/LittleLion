/**
 * Thin HTTP client. Only knows how to talk to the backend.
 * Higher-level services (LessonService, etc.) build on top of this.
 */
export class ApiClient {
  constructor(baseUrl = '') {
    this.baseUrl = baseUrl;
  }

  async get(path) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: { 'Accept': 'application/json' },
    });
    if (!response.ok) {
      const errorBody = await this._safeReadError(response);
      throw new ApiError(response.status, errorBody);
    }
    return response.json();
  }

  async post(path, body) {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body ?? {}),
    });
    if (!response.ok) {
      const errorBody = await this._safeReadError(response);
      throw new ApiError(response.status, errorBody);
    }
    return response.json();
  }

  async _safeReadError(response) {
    try { return await response.json(); }
    catch { return { error: response.statusText }; }
  }
}

export class ApiError extends Error {
  constructor(status, body) {
    super(body?.error ?? `HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}
