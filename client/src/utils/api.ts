const serverUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3001';

export const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${serverUrl}${endpoint}`, {
    ...options,
    credentials: 'include', // Always include cookies for authentication
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Redirect to login on authentication failure
      window.location.href = '/';
      throw new Error('Authentication required');
    }
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
};
