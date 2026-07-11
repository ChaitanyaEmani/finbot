const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

// Helper to get headers with auth token
const getHeaders = () => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('saveup_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

export const apiFetch = async (endpoint: string, options: RequestInit = {}) => {
  const config = {
    ...options,
    headers: {
      ...getHeaders(),
      ...options.headers,
    },
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    let errorMessage = 'An error occurred';
    try {
      const errData = await response.json();
      errorMessage = errData.message || errorMessage;
    } catch (e) {
      // JSON parsing failed, use status text
      errorMessage = response.statusText || errorMessage;
    }
    throw new Error(errorMessage);
  }

  return response.json();
};

export const authService = {
  register: async (userData: any) => {
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (data.token) {
      localStorage.setItem('saveup_token', data.token);
    }
    return data;
  },

  login: async (credentials: any) => {
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (data.token) {
      localStorage.setItem('saveup_token', data.token);
    }
    return data;
  },

  logout: () => {
    localStorage.removeItem('saveup_token');
  },

  getProfile: async () => {
    return apiFetch('/auth/me');
  },

  updateProfile: async (profileData: any) => {
    return apiFetch('/auth/me', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    });
  },

  deleteAccount: async () => {
    return apiFetch('/auth/me', {
      method: 'DELETE',
    });
  },

  isAuthenticated: () => {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('saveup_token');
  },
};

export const transactionService = {
  getAll: async () => {
    return apiFetch('/transactions');
  },

  create: async (txData: any) => {
    return apiFetch('/transactions', {
      method: 'POST',
      body: JSON.stringify(txData),
    });
  },

  update: async (id: string, txData: any) => {
    return apiFetch(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(txData),
    });
  },

  delete: async (id: string) => {
    return apiFetch(`/transactions/${id}`, {
      method: 'DELETE',
    });
  },
};

export const budgetService = {
  getAll: async () => {
    return apiFetch('/budgets');
  },

  upsert: async (budgetData: any) => {
    return apiFetch('/budgets', {
      method: 'POST',
      body: JSON.stringify(budgetData),
    });
  },

  delete: async (id: string) => {
    return apiFetch(`/budgets/${id}`, {
      method: 'DELETE',
    });
  },
};

export const chatService = {
  sendMessage: async (messages: Array<{ role: string; content: string }>) => {
    return apiFetch('/chat', {
      method: 'POST',
      body: JSON.stringify({ messages }),
    });
  },
};
