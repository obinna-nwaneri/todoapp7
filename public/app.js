const registrationForm = document.getElementById('registration-form');
const adminForm = document.getElementById('admin-form');
const refreshButton = document.getElementById('refresh-users');
const registrationStatus = document.getElementById('registration-status');
const adminStatus = document.getElementById('admin-status');
const userTableBody = document.getElementById('user-table-body');
const adminTokenInput = document.getElementById('admin-token');

let cachedAdminToken = '';

function showStatus(element, message, type) {
  element.textContent = message;
  element.classList.remove('success', 'error');
  if (type) {
    element.classList.add(type);
  }
}

async function handleResponse(response) {
  const text = await response.text();
  try {
    return JSON.parse(text || '{}');
  } catch (error) {
    return { error: text || 'Unexpected server response.' };
  }
}

registrationForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  showStatus(registrationStatus, 'Submitting registration…');

  const formData = new FormData(registrationForm);
  const payload = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('/api/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await handleResponse(response);

    if (!response.ok) {
      throw new Error(data.error || 'Registration failed.');
    }

    registrationForm.reset();
    showStatus(registrationStatus, data.message || 'Registration successful!', 'success');
  } catch (error) {
    showStatus(registrationStatus, error.message, 'error');
  }
});

adminForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  showStatus(adminStatus, 'Creating user…');

  const formData = new FormData(adminForm);
  const payload = Object.fromEntries(formData.entries());
  const token = payload.token;

  if (!token) {
    showStatus(adminStatus, 'Admin token is required.', 'error');
    return;
  }

  cachedAdminToken = token;
  delete payload.token;

  try {
    const response = await fetch('/api/admin/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-admin-token': token,
      },
      body: JSON.stringify(payload),
    });

    const data = await handleResponse(response);

    if (!response.ok) {
      throw new Error(data.error || 'Unable to add user.');
    }

    adminForm.reset();
    adminTokenInput.value = token;
    showStatus(adminStatus, data.message || 'User created successfully.', 'success');
    await loadUsers(token);
  } catch (error) {
    showStatus(adminStatus, error.message, 'error');
  }
});

refreshButton.addEventListener('click', async () => {
  const token = adminTokenInput.value || cachedAdminToken;
  if (!token) {
    showStatus(adminStatus, 'Enter an admin token to refresh users.', 'error');
    return;
  }
  await loadUsers(token);
});

async function loadUsers(token) {
  showStatus(adminStatus, 'Loading users…');
  try {
    const response = await fetch('/api/users', {
      headers: {
        'x-admin-token': token,
      },
    });

    const data = await handleResponse(response);

    if (!response.ok) {
      throw new Error(data.error || 'Unable to load users.');
    }

    renderUsers(data);
    cachedAdminToken = token;
    showStatus(adminStatus, 'Users refreshed.', 'success');
  } catch (error) {
    renderUsers([]);
    showStatus(adminStatus, error.message, 'error');
  }
}

function renderUsers(users) {
  userTableBody.innerHTML = '';
  if (!users || users.length === 0) {
    const row = document.createElement('tr');
    const cell = document.createElement('td');
    cell.colSpan = 5;
    cell.textContent = 'No users found.';
    row.appendChild(cell);
    userTableBody.appendChild(row);
    return;
  }

  users.forEach((user) => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(user.name)}</td>
      <td>${escapeHtml(user.email)}</td>
      <td class="role-${escapeHtml(user.role)}">${escapeHtml(user.role)}</td>
      <td>${formatDate(user.created_at)}</td>
      <td>${escapeHtml(user.created_by || '')}</td>
    `;
    userTableBody.appendChild(row);
  });
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
}

function escapeHtml(value = '') {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// Auto-load users if an admin token is already present (e.g., from autofill).
if (adminTokenInput.value) {
  loadUsers(adminTokenInput.value);
}
