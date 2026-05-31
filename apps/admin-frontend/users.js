/**
 * users.js – User management (no passwords exposed)
 */
document.addEventListener('DOMContentLoaded', () => {
  if (!AdminAuth.initProtectedPage()) return;
  AdminUI.bindModalClose();

  let users = [];
  let deleteTargetId = null;
  const currentAdmin = AdminAuth.getAdminUser();

  const loadingEl = document.getElementById('users-loading');
  const emptyEl = document.getElementById('users-empty');
  const tableWrap = document.getElementById('users-table-wrap');
  const tbody = document.getElementById('users-tbody');
  const searchInput = document.getElementById('user-search');

  function renderTable(list) {
    if (!list.length) {
      tableWrap.hidden = true;
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;
    tableWrap.hidden = false;

    tbody.innerHTML = list
      .map((u) => {
        const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim();
        const isSelf = currentAdmin && u.id === currentAdmin.id;
        return `
      <tr>
        <td>${u.id}</td>
        <td>${AdminUI.escapeHtml(fullName || '—')}</td>
        <td>${AdminUI.escapeHtml(u.email)}</td>
        <td>
          <select class="status-select role-select" data-user-id="${u.id}" ${isSelf ? 'disabled title="Cannot change your own role"' : ''}>
            <option value="customer" ${u.role === 'customer' ? 'selected' : ''}>customer</option>
            <option value="admin" ${u.role === 'admin' ? 'selected' : ''}>admin</option>
          </select>
        </td>
        <td>${AdminUI.formatDate(u.created_at)}</td>
        <td class="actions">
          <button type="button" class="btn btn-danger btn-sm" data-delete="${u.id}" ${isSelf ? 'disabled' : ''}>Delete</button>
        </td>
      </tr>`;
      })
      .join('');

    tbody.querySelectorAll('.role-select').forEach((sel) => {
      sel.addEventListener('change', () => updateRole(Number(sel.dataset.userId), sel));
    });

    tbody.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', () => openDeleteModal(Number(btn.dataset.delete)));
    });
  }

  function filterUsers() {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) {
      renderTable(users);
      return;
    }
    const filtered = users.filter(
      (u) =>
        String(u.email).toLowerCase().includes(q) ||
        String(u.first_name || '').toLowerCase().includes(q) ||
        String(u.last_name || '').toLowerCase().includes(q) ||
        String(u.id).includes(q)
    );
    renderTable(filtered);
  }

  async function loadUsers() {
    loadingEl.hidden = false;
    tableWrap.hidden = true;
    emptyEl.hidden = true;

    try {
      const data = await AdminAPI.getUsers();
      users = data.users || [];
      loadingEl.hidden = true;
      filterUsers();
    } catch (err) {
      if (AdminAuth.handleApiAuthError(err)) return;
      loadingEl.hidden = true;
      emptyEl.hidden = false;
      emptyEl.textContent = err.message || 'Failed to load users.';
      AdminUI.showToast(emptyEl.textContent, 'error');
    }
  }

  async function updateRole(userId, selectEl) {
    const user = users.find((u) => u.id === userId);
    const previous = user?.role;
    const newRole = selectEl.value;

    if (previous === newRole) return;

    try {
      await AdminAPI.updateUser(userId, { role: newRole });
      if (user) user.role = newRole;
      AdminUI.showToast('User role updated.');
      filterUsers();
    } catch (err) {
      if (AdminAuth.handleApiAuthError(err)) return;
      selectEl.value = previous;
      AdminUI.showToast(err.message || 'Failed to update role.', 'error');
    }
  }

  function openDeleteModal(id) {
    const u = users.find((x) => x.id === id);
    deleteTargetId = id;
    document.getElementById('delete-user-text').textContent =
      `Delete user ${u?.email || '#' + id}? Their orders will also be removed.`;
    AdminUI.openModal('delete-user-modal');
  }

  document.getElementById('confirm-delete-user').addEventListener('click', async () => {
    if (!deleteTargetId) return;
    try {
      await AdminAPI.deleteUser(deleteTargetId);
      AdminUI.closeModal('delete-user-modal');
      AdminUI.showToast('User deleted.');
      deleteTargetId = null;
      await loadUsers();
    } catch (err) {
      if (AdminAuth.handleApiAuthError(err)) return;
      AdminUI.showToast(err.message || 'Delete failed.', 'error');
    }
  });

  searchInput.addEventListener('input', filterUsers);
  loadUsers();
});
