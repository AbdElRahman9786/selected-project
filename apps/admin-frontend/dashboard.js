/**
 * dashboard.js – Admin dashboard stats
 */
document.addEventListener('DOMContentLoaded', async () => {
  if (!AdminAuth.initProtectedPage()) return;

  const loadingEl = document.getElementById('dashboard-loading');
  const contentEl = document.getElementById('dashboard-content');
  const errorEl = document.getElementById('dashboard-error');
  const gridEl = document.getElementById('stats-grid');

  try {
    const data = await AdminAPI.getDashboard();

    gridEl.innerHTML = `
      <div class="stat-card">
        <p class="stat-card-label">Total Products</p>
        <p class="stat-card-value">${data.totalProducts ?? 0}</p>
      </div>
      <div class="stat-card">
        <p class="stat-card-label">Total Users</p>
        <p class="stat-card-value">${data.totalUsers ?? 0}</p>
      </div>
      <div class="stat-card">
        <p class="stat-card-label">Total Orders</p>
        <p class="stat-card-value">${data.totalOrders ?? 0}</p>
      </div>
      <div class="stat-card">
        <p class="stat-card-label">Total Revenue</p>
        <p class="stat-card-value revenue">${AdminUI.formatMoney(data.totalRevenue)}</p>
      </div>
    `;

    loadingEl.hidden = true;
    contentEl.hidden = false;
  } catch (err) {
    if (AdminAuth.handleApiAuthError(err)) return;
    loadingEl.hidden = true;
    errorEl.hidden = false;
    errorEl.textContent = err.message || 'Failed to load dashboard.';
    AdminUI.showToast(errorEl.textContent, 'error');
  }
});
