// API Base URL
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Helper function to get auth headers
const getAuthHeaders = (includeContentType: boolean = true): HeadersInit => {
  const userId = localStorage.getItem('user-id');
  const headers: HeadersInit = {};
  if (includeContentType) {
    headers['Content-Type'] = 'application/json';
  }
  if (userId) {
    headers['user-id'] = userId;
  }
  return headers;
};

// Generic API request function
const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = `${API_BASE_URL}${endpoint}`;
  const config: RequestInit = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// ========== Authentication API ==========
export const authAPI = {
  login: async (email: string, password: string, role: string) => {
    return apiRequest<{ message: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password, role }),
    });
  },

  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
    department?: string;
    designation?: string;
    phone?: string;
    recoveryEmail?: string;
  }) => {
    return apiRequest<{ message: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  getCurrentUser: async () => {
    return apiRequest<{ user: any }>('/auth/me');
  },
};

// ========== Faculty API ==========
export const facultyAPI = {
  // FDP Attended
  getFDPAttended: async () => {
    return apiRequest<any[]>('/faculty/fdp/attended');
  },

  createFDPAttended: async (data: {
    title: string;
    mode: 'online' | 'offline';
    duration: string;
    venue: string;
    reportUpload?: string;
    proofDoc?: string;
    certificate?: File;
  }) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('mode', data.mode);
    formData.append('duration', data.duration);
    formData.append('venue', data.venue);
    if (data.reportUpload) formData.append('reportUpload', data.reportUpload);
    if (data.proofDoc) formData.append('proofDoc', data.proofDoc);
    if (data.certificate) formData.append('certificate', data.certificate);

    const userId = localStorage.getItem('user-id');
    const url = `${API_BASE_URL}/faculty/fdp/attended`;
    const config: RequestInit = {
      method: 'POST',
      headers: {
        'user-id': userId || '',
      },
      body: formData,
    };

    const response = await fetch(url, config);
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || `HTTP error! status: ${response.status}`);
    }
    return result;
  },

  updateFDPAttended: async (id: string, data: any & { certificate?: File }) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'certificate' && data[key] instanceof File) {
        formData.append('certificate', data[key]);
      } else if (key !== 'certificate') {
        formData.append(key, data[key]);
      }
    });

    const userId = localStorage.getItem('user-id');
    const url = `${API_BASE_URL}/faculty/fdp/attended/${id}`;
    const config: RequestInit = {
      method: 'PUT',
      headers: {
        'user-id': userId || '',
      },
      body: formData,
    };

    const response = await fetch(url, config);
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || `HTTP error! status: ${response.status}`);
    }
    return result;
  },

  deleteFDPAttended: async (id: string) => {
    return apiRequest<{ message: string }>(`/faculty/fdp/attended/${id}`, {
      method: 'DELETE',
    });
  },

  // FDP Organized
  getFDPOrganized: async () => {
    return apiRequest<any[]>('/faculty/fdp/organized');
  },

  createFDPOrganized: async (data: {
    title: string;
    venue: string;
    type: 'conference' | 'workshop';
    proofDoc?: string;
    report?: string;
  }) => {
    return apiRequest<any>('/faculty/fdp/organized', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateFDPOrganized: async (id: string, data: any) => {
    return apiRequest<any>(`/faculty/fdp/organized/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteFDPOrganized: async (id: string) => {
    return apiRequest<{ message: string }>(`/faculty/fdp/organized/${id}`, {
      method: 'DELETE',
    });
  },

  // Seminars
  getSeminars: async () => {
    return apiRequest<any[]>('/faculty/seminars');
  },

  createSeminar: async (data: {
    title: string;
    topic: string;
    date: string;
    venue: string;
    description?: string;
    attendees?: number;
    certificate?: File;
  }) => {
    const formData = new FormData();
    formData.append('title', data.title);
    formData.append('topic', data.topic);
    formData.append('date', data.date);
    formData.append('venue', data.venue);
    if (data.description) formData.append('description', data.description);
    if (data.attendees !== undefined) formData.append('attendees', data.attendees.toString());
    if (data.certificate) formData.append('certificate', data.certificate);

    const userId = localStorage.getItem('user-id');
    const url = `${API_BASE_URL}/faculty/seminars`;
    const config: RequestInit = {
      method: 'POST',
      headers: {
        'user-id': userId || '',
      },
      body: formData,
    };

    const response = await fetch(url, config);
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || `HTTP error! status: ${response.status}`);
    }
    return result;
  },

  updateSeminar: async (id: string, data: any & { certificate?: File }) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'certificate' && data[key] instanceof File) {
        formData.append('certificate', data[key]);
      } else if (key !== 'certificate') {
        formData.append(key, data[key]);
      }
    });

    const userId = localStorage.getItem('user-id');
    const url = `${API_BASE_URL}/faculty/seminars/${id}`;
    const config: RequestInit = {
      method: 'PUT',
      headers: {
        'user-id': userId || '',
      },
      body: formData,
    };

    const response = await fetch(url, config);
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || `HTTP error! status: ${response.status}`);
    }
    return result;
  },

  deleteSeminar: async (id: string) => {
    return apiRequest<{ message: string }>(`/faculty/seminars/${id}`, {
      method: 'DELETE',
    });
  },

  // ABL
  getABL: async () => {
    return apiRequest<any[]>('/faculty/abl');
  },

  createABL: async (data: {
    subjectName: string;
    courseCode: string;
    industryConnect: string;
    proofDoc?: string;
  }) => {
    return apiRequest<any>('/faculty/abl', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateABL: async (id: string, data: any) => {
    return apiRequest<any>(`/faculty/abl/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteABL: async (id: string) => {
    return apiRequest<{ message: string }>(`/faculty/abl/${id}`, {
      method: 'DELETE',
    });
  },

  // Joint Teaching
  getJointTeaching: async () => {
    return apiRequest<any[]>('/faculty/joint-teaching');
  },

  createJointTeaching: async (data: {
    courseName: string;
    courseCode: string;
    facultyInvolved: string;
    syllabusDoc?: string;
    hours: number;
    certificate?: File;
  }) => {
    const formData = new FormData();
    formData.append('courseName', data.courseName);
    formData.append('courseCode', data.courseCode);
    formData.append('facultyInvolved', data.facultyInvolved);
    formData.append('hours', data.hours.toString());
    if (data.syllabusDoc) formData.append('syllabusDoc', data.syllabusDoc);
    if (data.certificate) formData.append('certificate', data.certificate);

    const userId = localStorage.getItem('user-id');
    const url = `${API_BASE_URL}/faculty/joint-teaching`;
    const config: RequestInit = {
      method: 'POST',
      headers: {
        'user-id': userId || '',
      },
      body: formData,
    };

    const response = await fetch(url, config);
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || `HTTP error! status: ${response.status}`);
    }
    return result;
  },

  updateJointTeaching: async (id: string, data: any & { certificate?: File }) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'certificate' && data[key] instanceof File) {
        formData.append('certificate', data[key]);
      } else if (key !== 'certificate') {
        formData.append(key, data[key]);
      }
    });

    const userId = localStorage.getItem('user-id');
    const url = `${API_BASE_URL}/faculty/joint-teaching/${id}`;
    const config: RequestInit = {
      method: 'PUT',
      headers: {
        'user-id': userId || '',
      },
      body: formData,
    };

    const response = await fetch(url, config);
    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || `HTTP error! status: ${response.status}`);
    }
    return result;
  },

  deleteJointTeaching: async (id: string) => {
    return apiRequest<{ message: string }>(`/faculty/joint-teaching/${id}`, {
      method: 'DELETE',
    });
  },

  // Adjunct Faculty
  getAdjunctFaculty: async () => {
    return apiRequest<any[]>('/faculty/adjunct');
  },

  createAdjunctFaculty: async (data: {
    facultyName: string;
    department: string;
    courseCode: string;
    supportingDocs?: string;
  }) => {
    return apiRequest<any>('/faculty/adjunct', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateAdjunctFaculty: async (id: string, data: any) => {
    return apiRequest<any>(`/faculty/adjunct/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteAdjunctFaculty: async (id: string) => {
    return apiRequest<{ message: string }>(`/faculty/adjunct/${id}`, {
      method: 'DELETE',
    });
  },

  // Notifications
  getNotifications: async () => {
    return apiRequest<any[]>('/faculty/notifications');
  },

  markNotificationRead: async (id: string) => {
    return apiRequest<any>(`/faculty/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  markAllNotificationsRead: async () => {
    return apiRequest<{ message: string }>('/faculty/notifications/read-all', {
      method: 'PUT',
    });
  },

  // Dashboard
  getDashboard: async () => {
    return apiRequest<{
      stats: any;
      recentFDPs: any[];
    }>('/faculty/dashboard');
  },

  // FDP Reimbursements
  getReimbursements: async () => {
    return apiRequest<any[]>('/faculty/reimbursements');
  },

  createReimbursement: async (data: any & { receiptDocument?: File }) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'receiptDocument' && data[key] instanceof File) {
        formData.append('receiptDocument', data[key]);
      } else if (key !== 'receiptDocument') {
        formData.append(key, data[key]);
      }
    });

    const userId = localStorage.getItem('user-id');
    const url = `${API_BASE_URL}/faculty/reimbursements`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'user-id': userId || '' },
      body: formData,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Request failed');
    return result;
  },

  updateReimbursement: async (id: string, data: any & { receiptDocument?: File }) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if (key === 'receiptDocument' && data[key] instanceof File) {
        formData.append('receiptDocument', data[key]);
      } else if (key !== 'receiptDocument') {
        formData.append(key, data[key]);
      }
    });

    const userId = localStorage.getItem('user-id');
    const url = `${API_BASE_URL}/faculty/reimbursements/${id}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'user-id': userId || '' },
      body: formData,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Request failed');
    return result;
  },

  deleteReimbursement: async (id: string) => {
    return apiRequest<{ message: string }>(`/faculty/reimbursements/${id}`, {
      method: 'DELETE',
    });
  },

  // Achievements
  getAchievements: async () => {
    return apiRequest<any[]>('/faculty/achievements');
  },

  createAchievement: async (data: any & { certificate?: File; supportingDocument?: File }) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if ((key === 'certificate' || key === 'supportingDocument') && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else if (key !== 'certificate' && key !== 'supportingDocument') {
        formData.append(key, data[key]);
      }
    });

    const userId = localStorage.getItem('user-id');
    const url = `${API_BASE_URL}/faculty/achievements`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'user-id': userId || '' },
      body: formData,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Request failed');
    return result;
  },

  updateAchievement: async (id: string, data: any & { certificate?: File; supportingDocument?: File }) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if ((key === 'certificate' || key === 'supportingDocument') && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else if (key !== 'certificate' && key !== 'supportingDocument') {
        formData.append(key, data[key]);
      }
    });

    const userId = localStorage.getItem('user-id');
    const url = `${API_BASE_URL}/faculty/achievements/${id}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'user-id': userId || '' },
      body: formData,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Request failed');
    return result;
  },

  deleteAchievement: async (id: string) => {
    return apiRequest<{ message: string }>(`/faculty/achievements/${id}`, {
      method: 'DELETE',
    });
  },

  // Internships
  getInternships: async () => {
    return apiRequest<any[]>('/faculty/internships');
  },

  createInternship: async (data: any & { certificate?: File; report?: File }) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if ((key === 'certificate' || key === 'report') && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else if (key !== 'certificate' && key !== 'report') {
        if (key === 'skillsGained' && Array.isArray(data[key])) {
          formData.append(key, data[key].join(','));
        } else {
          formData.append(key, data[key]);
        }
      }
    });

    const userId = localStorage.getItem('user-id');
    const url = `${API_BASE_URL}/faculty/internships`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'user-id': userId || '' },
      body: formData,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Request failed');
    return result;
  },

  updateInternship: async (id: string, data: any & { certificate?: File; report?: File }) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => {
      if ((key === 'certificate' || key === 'report') && data[key] instanceof File) {
        formData.append(key, data[key]);
      } else if (key !== 'certificate' && key !== 'report') {
        if (key === 'skillsGained' && Array.isArray(data[key])) {
          formData.append(key, data[key].join(','));
        } else {
          formData.append(key, data[key]);
        }
      }
    });

    const userId = localStorage.getItem('user-id');
    const url = `${API_BASE_URL}/faculty/internships/${id}`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: { 'user-id': userId || '' },
      body: formData,
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || 'Request failed');
    return result;
  },

  deleteInternship: async (id: string) => {
    return apiRequest<{ message: string }>(`/faculty/internships/${id}`, {
      method: 'DELETE',
    });
  },
};

// ========== Admin API ==========
export const adminAPI = {
  getFaculty: async () => {
    return apiRequest<any[]>('/admin/faculty');
  },

  getFacultyById: async (id: string) => {
    return apiRequest<any>(`/admin/faculty/${id}`);
  },

  // FDP Attended
  getFDPAttended: async () => {
    return apiRequest<any[]>('/admin/fdp/attended');
  },

  updateFDPAttendedStatus: async (id: string, status: 'pending' | 'approved' | 'rejected') => {
    return apiRequest<any>(`/admin/fdp/attended/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // FDP Organized
  getFDPOrganized: async () => {
    return apiRequest<any[]>('/admin/fdp/organized');
  },

  updateFDPOrganizedStatus: async (id: string, status: 'pending' | 'approved' | 'rejected') => {
    return apiRequest<any>(`/admin/fdp/organized/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Seminars
  getSeminars: async () => {
    return apiRequest<any[]>('/admin/seminars');
  },

  // ABL
  getABL: async () => {
    return apiRequest<any[]>('/admin/abl');
  },

  // Joint Teaching
  getJointTeaching: async () => {
    return apiRequest<any[]>('/admin/joint-teaching');
  },

  // Adjunct Faculty
  getAdjunctFaculty: async () => {
    return apiRequest<any[]>('/admin/adjunct');
  },

  // Events
  getEvents: async () => {
    return apiRequest<any[]>('/admin/events');
  },

  createEvent: async (data: {
    title: string;
    type: 'FDP' | 'Seminar' | 'Workshop' | 'Conference';
    date: string;
    venue: string;
    description?: string;
    registrationLink?: string;
  }) => {
    return apiRequest<any>('/admin/events', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateEvent: async (id: string, data: any) => {
    return apiRequest<any>(`/admin/events/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteEvent: async (id: string) => {
    return apiRequest<{ message: string }>(`/admin/events/${id}`, {
      method: 'DELETE',
    });
  },

  // Notifications
  getNotifications: async () => {
    return apiRequest<any[]>('/admin/notifications');
  },

  createNotification: async (data: {
    recipientId: string;
    message: string;
    type?: 'info' | 'success' | 'warning';
  }) => {
    return apiRequest<any>('/admin/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Dashboard
  getDashboard: async () => {
    return apiRequest<{ stats: any }>('/admin/dashboard');
  },

  // Reimbursements
  getReimbursements: async () => {
    return apiRequest<any[]>('/admin/reimbursements');
  },

  updateReimbursementStatus: async (id: string, status: string, reviewComments?: string) => {
    return apiRequest<any>(`/admin/reimbursements/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, reviewComments }),
    });
  },

  // Achievements
  getAchievements: async () => {
    return apiRequest<any[]>('/admin/achievements');
  },

  verifyAchievement: async (id: string, status: 'pending' | 'verified' | 'rejected') => {
    return apiRequest<any>(`/admin/achievements/${id}/verify`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    });
  },

  // Internships
  getInternships: async () => {
    return apiRequest<any[]>('/admin/internships');
  },
};

// ========== HOD API ==========
export const hodAPI = {
  getFaculty: async () => {
    return apiRequest<any[]>('/hod/faculty');
  },

  getFacultyById: async (id: string) => {
    return apiRequest<any>(`/hod/faculty/${id}`);
  },

  getRecords: async () => {
    return apiRequest<{
      fdpAttended: any[];
      fdpOrganized: any[];
      seminars: any[];
      abl: any[];
      jointTeaching: any[];
      adjunct: any[];
    }>('/hod/records');
  },

  getAnalytics: async () => {
    return apiRequest<{
      overview: any;
      monthlyFDPs: any[];
      topFaculty: any[];
    }>('/hod/analytics');
  },

  getNotifications: async () => {
    return apiRequest<any[]>('/hod/notifications');
  },

  markNotificationRead: async (id: string) => {
    return apiRequest<any>(`/hod/notifications/${id}/read`, {
      method: 'PUT',
    });
  },

  getDashboard: async () => {
    return apiRequest<{ stats: any }>('/hod/dashboard');
  },
};

// ========== Events API (Public) ==========
export const eventsAPI = {
  getUpcomingEvents: async () => {
    return apiRequest<any[]>('/events');
  },

  getAllEvents: async () => {
    return apiRequest<any[]>('/events/all');
  },

  getEventById: async (id: string) => {
    return apiRequest<any>(`/events/${id}`);
  },
};

// ========== Audit API ==========
export const auditAPI = {
  getAuditData: async (params?: {
    startDate?: string;
    endDate?: string;
    department?: string;
    facultyId?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.department) queryParams.append('department', params.department);
    if (params?.facultyId) queryParams.append('facultyId', params.facultyId);
    
    const url = `/audit/data${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return apiRequest<any>(url);
  },

  getAuditStats: async (params?: {
    startDate?: string;
    endDate?: string;
    department?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (params?.startDate) queryParams.append('startDate', params.startDate);
    if (params?.endDate) queryParams.append('endDate', params.endDate);
    if (params?.department) queryParams.append('department', params.department);
    
    const url = `/audit/stats${queryParams.toString() ? '?' + queryParams.toString() : ''}`;
    return apiRequest<any>(url);
  },
};
