/**
 * orders.js – Order list and status updates
 */
document.addEventListener('DOMContentLoaded', () => {
  if (!AdminAuth.initProtectedPage()) return;

  const STATUSES = [
    'pending',
    'processing',
    'shipped',
    'delivered',
    'cancelled',
  ];

  let orders = [];

  const loadingEl = document.getElementById('orders-loading');
  const emptyEl = document.getElementById('orders-empty');
  const tableWrap = document.getElementById('orders-table-wrap');
  const tbody = document.getElementById('orders-tbody');
  const searchInput = document.getElementById('order-search');

  function statusBadge(status) {
    const s = (status || 'pending').toLowerCase();
    return `<span class="badge badge-${s}">${AdminUI.escapeHtml(s)}</span>`;
  }

  function customerLabel(order) {
    if (order.user_email) return order.user_email;
    const name = `${order.first_name || ''} ${order.last_name || ''}`.trim();
    return name || order.session_id || `Order #${order.id}`;
  }

  function statusOptions(current) {
    return STATUSES.map(
      (s) =>
        `<option value="${s}" ${s === current ? 'selected' : ''}>${s}</option>`
    ).join('');
  }

  function renderTable(list) {
    if (!list.length) {
      tableWrap.hidden = true;
      emptyEl.hidden = false;
      return;
    }
    emptyEl.hidden = true;
    tableWrap.hidden = false;

    tbody.innerHTML = list
      .map(
        (o) => `
      <tr>
        <td><strong>#${o.id}</strong></td>
        <td>${AdminUI.escapeHtml(customerLabel(o))}</td>
        <td>${AdminUI.formatMoney(o.total)}</td>
        <td>${statusBadge(o.status)}</td>
        <td>${AdminUI.formatDate(o.created_at)}</td>
        <td>
          <select class="status-select order-status-select" data-order-id="${o.id}" aria-label="Update order status">
            ${statusOptions(o.status)}
          </select>
        </td>
      </tr>`
      )
      .join('');

    tbody.querySelectorAll('.order-status-select').forEach((sel) => {
      sel.addEventListener('change', () =>
        updateStatus(Number(sel.dataset.orderId), sel)
      );
    });
  }

  function filterOrders() {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) {
      renderTable(orders);
      return;
    }
    const filtered = orders.filter(
      (o) =>
        String(o.id).includes(q) ||
        String(o.user_email || '').toLowerCase().includes(q) ||
        String(o.status || '').toLowerCase().includes(q) ||
        String(customerLabel(o)).toLowerCase().includes(q)
    );
    renderTable(filtered);
  }

  async function loadOrders() {
    loadingEl.hidden = false;
    tableWrap.hidden = true;
    emptyEl.hidden = true;

    try {
      const data = await AdminAPI.getOrders();
      orders = data.orders || [];
      loadingEl.hidden = true;
      filterOrders();
    } catch (err) {
      if (AdminAuth.handleApiAuthError(err)) return;
      loadingEl.hidden = true;
      emptyEl.hidden = false;
      emptyEl.textContent = err.message || 'Failed to load orders.';
      AdminUI.showToast(emptyEl.textContent, 'error');
    }
  }

  async function updateStatus(orderId, selectEl) {
    const order = orders.find((o) => o.id === orderId);
    const previous = order?.status;
    const newStatus = selectEl.value;

    if (previous === newStatus) return;

    selectEl.disabled = true;

    try {
      await AdminAPI.updateOrder(orderId, { status: newStatus });
      if (order) order.status = newStatus;
      AdminUI.showToast(`Order #${orderId} marked as ${newStatus}.`);
      filterOrders();
    } catch (err) {
      if (AdminAuth.handleApiAuthError(err)) return;
      selectEl.value = previous;
      AdminUI.showToast(err.message || 'Status update failed.', 'error');
    } finally {
      selectEl.disabled = false;
    }
  }

  searchInput.addEventListener('input', filterOrders);
  loadOrders();
});
