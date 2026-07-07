const API_BASE = '/api';

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const handleResponse = async (response) => {
  if (response.status === 401 || response.status === 403) {
    // Optional: auto-logout on token expiration
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
  if (!response.ok) {
    const errorText = await response.text();
    let errorMessage = 'Something went wrong';
    try {
      const errorJson = JSON.parse(errorText);
      errorMessage = errorJson.message || errorMessage;
    } catch (e) {
      errorMessage = errorText || errorMessage;
    }
    throw new Error(errorMessage);
  }
  // If response body is empty (like DELETE), return null
  const text = await response.text();
  return text ? JSON.parse(text) : null;
};

export const api = {
  auth: {
    login: async (email, password) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });
      const data = await handleResponse(res);
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          name: data.name,
          email: data.email,
          role: data.role
        }));
      }
      return data;
    },
    register: async (name, email, password, role) => {
      const res = await fetch(`${API_BASE}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, email, password, role }),
      });
      const data = await handleResponse(res);
      if (data.token) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          name: data.name,
          email: data.email,
          role: data.role
        }));
      }
      return data;
    },
    logout: () => {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    },
    getCurrentUser: () => {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
  },

  reports: {
    getMyHistory: async () => {
      const res = await fetch(`${API_BASE}/reports/my-history`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    submit: async (reportData) => {
      const res = await fetch(`${API_BASE}/reports`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(reportData),
      });
      return handleResponse(res);
    },
    getTeamReports: async (filters = {}) => {
      const params = new URLSearchParams();
      if (filters.userId) params.append('userId', filters.userId);
      if (filters.projectId) params.append('projectId', filters.projectId);
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.status) params.append('status', filters.status);

      const res = await fetch(`${API_BASE}/reports/team?${params.toString()}`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },

  projects: {
    getAll: async () => {
      const res = await fetch(`${API_BASE}/projects`, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    },
    create: async (name, description) => {
      const res = await fetch(`${API_BASE}/projects`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ name, description }),
      });
      return handleResponse(res);
    },
    update: async (id, name, description) => {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify({ name, description }),
      });
      return handleResponse(res);
    },
    delete: async (id) => {
      const res = await fetch(`${API_BASE}/projects/${id}`, {
        method: 'DELETE',
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },

  dashboard: {
    getStats: async (weekStart) => {
      const url = weekStart 
        ? `${API_BASE}/dashboard/stats?weekStart=${weekStart}`
        : `${API_BASE}/dashboard/stats`;
      const res = await fetch(url, {
        headers: getHeaders(),
      });
      return handleResponse(res);
    }
  },

  ai: {
    chat: async (message, weekStart) => {
      const res = await fetch(`${API_BASE}/ai/chat`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ message, weekStart }),
      });
      // The backend returns a raw text string for this endpoint, not JSON
      if (!res.ok) {
        throw new Error('AI request failed');
      }
      return res.text();
    }
  }
};
