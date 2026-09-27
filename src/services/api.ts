import {
  ApiResponse,
  User,
  DocumentType,
  DocumentRequest,
  DashboardStats,
  NotificationItem,
  AuditLog,
} from '../types';

const BASE_URL = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('govtrack_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const headers = {
    ...getAuthHeader(),
    ...options.headers,
  } as Record<string, string>;

  // Don't set Content-Type if FormData is used
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json().catch(() => ({
    success: false,
    message: `Network response error (${response.status})`,
  }));

  if (!response.ok) {
    if (response.status === 401 && !endpoint.includes('/auth/login')) {
      // Token might be expired
      // localStorage.removeItem('govtrack_token');
    }
    throw new Error(data.message || 'An error occurred while communicating with the server.');
  }

  return data;
}

export const authService = {
  login: (credentials: { email: string; password: string }) =>
    request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    }),

  register: (userData: any) =>
    request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    }),

  getMe: () => request<User>('/auth/me'),

  updateProfile: (profileData: Partial<User>) =>
    request<User>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData),
    }),

  logout: () =>
    request('/auth/logout', {
      method: 'POST',
    }),
};

export const documentTypeService = {
  getAll: () => request<DocumentType[]>('/document-types'),
  getById: (id: string) => request<DocumentType>(`/document-types/${id}`),
  create: (data: Partial<DocumentType>) =>
    request<DocumentType>('/document-types', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  update: (id: string, data: Partial<DocumentType>) =>
    request<DocumentType>(`/document-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  toggleStatus: (id: string) =>
    request<DocumentType>(`/document-types/${id}/status`, {
      method: 'PATCH',
    }),
};

export const requestService = {
  create: (formData: FormData) =>
    request<{ request: DocumentRequest; requestNumber: string }>('/requests', {
      method: 'POST',
      body: formData,
    }),

  getMyRequests: (params?: { status?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.status) query.append('status', params.status);
    if (params?.search) query.append('search', params.search);
    return request<DocumentRequest[]>(`/requests/my?${query.toString()}`);
  },

  getById: (id: string) => request<DocumentRequest>(`/requests/${id}`),

  trackByNumber: (requestNumber: string) =>
    request<any>(`/requests/track/${encodeURIComponent(requestNumber)}`),

  uploadAdditional: (id: string, formData: FormData) =>
    request<DocumentRequest>(`/requests/${id}/additional-document`, {
      method: 'POST',
      body: formData,
    }),

  cancel: (id: string, reason?: string) =>
    request<DocumentRequest>(`/requests/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    }),

  getDownloadDocUrl: (requestId: string, documentId: string) =>
    `/api/requests/${requestId}/documents/${documentId}`,

  getDownloadFinalCertUrl: (requestId: string) =>
    `/api/requests/${requestId}/certificate/download`,
};

export const adminService = {
  getDashboard: () => request<DashboardStats>('/admin/dashboard'),

  getRequests: (params?: {
    page?: number;
    limit?: number;
    status?: string;
    documentType?: string;
    search?: string;
    sortBy?: string;
  }) => {
    const query = new URLSearchParams();
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (params?.status) query.append('status', params.status);
    if (params?.documentType) query.append('documentType', params.documentType);
    if (params?.search) query.append('search', params.search);
    if (params?.sortBy) query.append('sortBy', params.sortBy);
    return request<DocumentRequest[]>(`/admin/requests?${query.toString()}`);
  },

  getRequestDetails: (id: string) => request<DocumentRequest>(`/admin/requests/${id}`),

  updateStatus: (id: string, payload: { status: string; remarks?: string; assignedOfficer?: string }) =>
    request<DocumentRequest>(`/admin/requests/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  verifyDocument: (
    requestId: string,
    documentId: string,
    payload: { verificationStatus: 'VERIFIED' | 'REJECTED'; remarks?: string }
  ) =>
    request<any>(`/admin/requests/${requestId}/documents/${documentId}/verify`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),

  requestAdditionalDoc: (requestId: string, payload: { documentName: string; remarks: string }) =>
    request<DocumentRequest>(`/admin/requests/${requestId}/additional-document`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  uploadFinalDocument: (requestId: string, formData: FormData) =>
    request<DocumentRequest>(`/admin/requests/${requestId}/final-document`, {
      method: 'POST',
      body: formData,
    }),

  getUsers: (params?: { role?: string; search?: string }) => {
    const query = new URLSearchParams();
    if (params?.role) query.append('role', params.role);
    if (params?.search) query.append('search', params.search);
    return request<User[]>(`/admin/users?${query.toString()}`);
  },

  updateUserStatus: (id: string, isActive: boolean) =>
    request<User>(`/admin/users/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ isActive }),
    }),

  getAuditLogs: (search?: string) => {
    const query = search ? `?search=${encodeURIComponent(search)}` : '';
    return request<AuditLog[]>(`/admin/audit-logs${query}`);
  },
};

export const notificationService = {
  getAll: () => request<NotificationItem[]>('/notifications'),
  markAsRead: (id: string) =>
    request(`/notifications/${id}/read`, {
      method: 'PATCH',
    }),
  markAllAsRead: () =>
    request('/notifications/read-all', {
      method: 'PATCH',
    }),
};
