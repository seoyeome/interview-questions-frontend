const DEFAULT_BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8080';

const normalizePath = (path: string) => (path.startsWith('/') ? path : `/${path}`);

export const getBackendUrl = () => DEFAULT_BACKEND_URL;

export const buildApiUrl = (path: string) => {
  return `${DEFAULT_BACKEND_URL}${normalizePath(path)}`;
};
