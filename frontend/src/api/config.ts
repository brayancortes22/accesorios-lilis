type RequestOptions = Omit<RequestInit, 'body'> & {
  body?: BodyInit | Record<string, unknown> | unknown[] | null;
};

const RAW_URL = (import.meta.env.VITE_API_URL as string) || '/api';
const API_BASE_URL = RAW_URL.endsWith('/') ? RAW_URL.slice(0, -1) : RAW_URL;

export const TOKEN_STORAGE_KEY = 'accesorios_lilis_token';
export const USER_STORAGE_KEY = 'accesorios_lilis_user';

async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const { body, headers = {}, ...rest } = options;

  const reqHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  // Enviar Bearer token si existe en storage para soportar compatibilidad cross-site (Vercel <-> Backend)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (token && !reqHeaders['Authorization']) {
      reqHeaders['Authorization'] = `Bearer ${token}`;
    }
  }

  const config: RequestInit = {
    ...rest,
    credentials: 'include',
    headers: reqHeaders,
  };

  if (body !== undefined) {
    config.body = typeof body === 'string' || body instanceof FormData ? body : JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
  const data = await response.json().catch(() => null);

  if (response.status === 401) {
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        localStorage.removeItem(USER_STORAGE_KEY);
      } catch (e) {
        console.warn('Error limpiando sesión en 401:', e);
      }

      window.dispatchEvent(
        new CustomEvent('lilis:unauthorized', {
          detail: {
            message:
              'Falta de autenticación o tu sesión ha expirado. Por favor inicia sesión nuevamente para continuar.',
          },
        })
      );
    }

    throw new Error(
      'Falta de autenticación o tu sesión ha expirado. Debes volver a iniciar sesión para continuar.'
    );
  }

  if (!response.ok) {
    throw new Error(
      data && typeof data === 'object' && 'message' in data
        ? String((data as { message?: string }).message)
        : `Error en la solicitud (${response.status})`,
    );
  }

  return data as T;
}

export { apiFetch, API_BASE_URL };
