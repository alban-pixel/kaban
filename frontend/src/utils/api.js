const BASE_URL = '/api';

function getHeaders() {
  const token = localStorage.getItem('stan_kanban_token');
  const headers = {
    'Content-Type': 'application/json'
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

async function request(url, options = {}) {
  const headers = getHeaders();
  
  // Ripped Content-Type header if body is FormData (for uploads)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${BASE_URL}${url}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers
    }
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Erreur serveur (code: ${response.status})`);
  }

  if (response.status === 204) return null;
  return response.json();
}

export const api = {
  // Auth API
  register: (username, password, display_name) => 
    request('/auth/register', { method: 'POST', body: JSON.stringify({ username, password, display_name }) }),
  login: (username, password) => 
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  me: () => request('/auth/me'),
  getUsers: () => request('/users'),

  // Sidebar / Navigation API
  getNavigation: () => request('/navigation'),
  createProject: (name) => request('/projects', { method: 'POST', body: JSON.stringify({ name }) }),
  updateProject: (id, data) => request(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id) => request(`/projects/${id}`, { method: 'DELETE' }),

  createFolder: (name, project_id) => request('/folders', { method: 'POST', body: JSON.stringify({ name, project_id }) }),
  updateFolder: (id, data) => request(`/folders/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteFolder: (id) => request(`/folders/${id}`, { method: 'DELETE' }),

  createBoard: (name, project_id, folder_id = null) => 
    request('/boards', { method: 'POST', body: JSON.stringify({ name, project_id, folder_id }) }),
  updateBoard: (id, data) => request(`/boards/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteBoard: (id) => request(`/boards/${id}`, { method: 'DELETE' }),

  // Board Members API
  getBoardMembers: (boardId) => request(`/boards/${boardId}/members`),
  addBoardMember: (boardId, user_id) => request(`/boards/${boardId}/members`, { method: 'POST', body: JSON.stringify({ user_id }) }),
  removeBoardMember: (boardId, userId) => request(`/boards/${boardId}/members/${userId}`, { method: 'DELETE' }),

  // Lists (Columns) API
  getBoardLists: (boardId) => request(`/boards/${boardId}/lists`),
  createList: (name, board_id) => request('/lists', { method: 'POST', body: JSON.stringify({ name, board_id }) }),
  updateList: (id, data) => request(`/lists/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteList: (id) => request(`/lists/${id}`, { method: 'DELETE' }),

  // Cards API
  createCard: (title, list_id) => request('/cards', { method: 'POST', body: JSON.stringify({ title, list_id }) }),
  getCard: (id) => request(`/cards/${id}`),
  updateCard: (id, data) => request(`/cards/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteCard: (id) => request(`/cards/${id}`, { method: 'DELETE' }),

  // Card Assignees
  assignUser: (cardId, user_id) => request(`/cards/${cardId}/assignees`, { method: 'POST', body: JSON.stringify({ user_id }) }),
  unassignUser: (cardId, userId) => request(`/cards/${cardId}/assignees/${userId}`, { method: 'DELETE' }),

  // Card Labels
  addLabel: (cardId, name, color) => request(`/cards/${cardId}/labels`, { method: 'POST', body: JSON.stringify({ name, color }) }),
  deleteLabel: (labelId) => request(`/cards/labels/${labelId}`, { method: 'DELETE' }),

  // Card Checklist Tasks
  addTask: (cardId, title) => request(`/cards/${cardId}/tasks`, { method: 'POST', body: JSON.stringify({ title }) }),
  updateTask: (taskId, data) => request(`/cards/tasks/${taskId}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteTask: (taskId) => request(`/cards/tasks/${taskId}`, { method: 'DELETE' }),

  // Card Timer StopWatch
  toggleTimer: (cardId) => request(`/cards/${cardId}/timer/toggle`, { method: 'POST' }),

  // Card Attachments
  uploadAttachment: (cardId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return request(`/cards/${cardId}/attachments`, { method: 'POST', body: formData });
  },
  deleteAttachment: (attachmentId) => request(`/cards/attachments/${attachmentId}`, { method: 'DELETE' }),

  // Card Comments
  addComment: (cardId, content) => request(`/cards/${cardId}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),
  deleteComment: (commentId) => request(`/cards/comments/${commentId}`, { method: 'DELETE' }),

  // Admin & Permissions API
  getAdminUsers: () => request('/admin/users'),
  updateUserRole: (userId, role) => request(`/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  deleteUser: (userId) => request(`/admin/users/${userId}`, { method: 'DELETE' }),

  // Private Project Members API
  getProjectMembers: (projectId) => request(`/projects/${projectId}/members`),
  addProjectMember: (projectId, user_id) => request(`/projects/${projectId}/members`, { method: 'POST', body: JSON.stringify({ user_id }) }),
  removeProjectMember: (projectId, userId) => request(`/projects/${projectId}/members/${userId}`, { method: 'DELETE' })
};
