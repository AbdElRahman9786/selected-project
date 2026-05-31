/**
 * products.js – Product management
 */
document.addEventListener('DOMContentLoaded', () => {
  if (!AdminAuth.initProtectedPage()) return;
  AdminUI.bindModalClose();

  let products = [];
  let deleteTargetId = null;

  const loadingEl = document.getElementById('products-loading');
  const emptyEl = document.getElementById('products-empty');
  const tableWrap = document.getElementById('products-table-wrap');
  const tbody = document.getElementById('products-tbody');
  const searchInput = document.getElementById('product-search');
  const form = document.getElementById('product-form');

  function buildPayload() {
    const oldPriceVal = document.getElementById('product-old-price').value.trim();
    return {
      name: document.getElementById('product-name').value.trim(),
      description: document.getElementById('product-description').value.trim() || null,
      price: parseFloat(document.getElementById('product-price').value),
      category: document.getElementById('product-category').value.trim().toLowerCase(),
      old_price: oldPriceVal ? parseFloat(oldPriceVal) : null,
      image: document.getElementById('product-image').value.trim() || null,
      in_stock: document.getElementById('product-in-stock').checked,
    };
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
        (p) => `
      <tr>
        <td>${p.id}</td>
        <td><strong>${AdminUI.escapeHtml(p.name)}</strong></td>
        <td>${AdminUI.formatMoney(p.price)}</td>
        <td>${p.in_stock ? 'Yes' : 'No'}</td>
        <td>${AdminUI.escapeHtml(p.category || '—')}</td>
        <td class="actions">
          <button type="button" class="btn btn-secondary btn-sm" data-edit="${p.id}">Edit</button>
          <button type="button" class="btn btn-danger btn-sm" data-delete="${p.id}">Delete</button>
        </td>
      </tr>`
      )
      .join('');

    tbody.querySelectorAll('[data-edit]').forEach((btn) => {
      btn.addEventListener('click', () => openEditModal(Number(btn.dataset.edit)));
    });
    tbody.querySelectorAll('[data-delete]').forEach((btn) => {
      btn.addEventListener('click', () => openDeleteModal(Number(btn.dataset.delete)));
    });
  }

  function filterProducts() {
    const q = searchInput.value.trim().toLowerCase();
    if (!q) {
      renderTable(products);
      return;
    }
    const filtered = products.filter(
      (p) =>
        String(p.name).toLowerCase().includes(q) ||
        String(p.id).includes(q) ||
        String(p.description || '').toLowerCase().includes(q)
    );
    renderTable(filtered);
  }

  async function loadProducts() {
    loadingEl.hidden = false;
    tableWrap.hidden = true;
    emptyEl.hidden = true;

    try {
      const data = await AdminAPI.getProducts();
      products = data.products || [];
      loadingEl.hidden = true;
      filterProducts();
    } catch (err) {
      if (AdminAuth.handleApiAuthError(err)) return;
      loadingEl.hidden = true;
      emptyEl.hidden = false;
      emptyEl.textContent = err.message || 'Failed to load products.';
      AdminUI.showToast(emptyEl.textContent, 'error');
    }
  }

  function openAddModal() {
    document.getElementById('product-modal-title').textContent = 'Add Product';
    document.getElementById('product-id').value = '';
    form.reset();
    document.getElementById('product-in-stock').checked = true;
    AdminUI.openModal('product-modal');
  }

  function openEditModal(id) {
    const p = products.find((x) => x.id === id);
    if (!p) return;

    document.getElementById('product-modal-title').textContent = 'Edit Product';
    document.getElementById('product-id').value = p.id;
    document.getElementById('product-name').value = p.name || '';
    document.getElementById('product-description').value = p.description || '';
    document.getElementById('product-price').value = p.price ?? '';
    document.getElementById('product-old-price').value = p.old_price ?? '';
    document.getElementById('product-category').value = p.category || '';
    document.getElementById('product-image').value = p.image || '';
    document.getElementById('product-in-stock').checked = Boolean(p.in_stock);
    AdminUI.openModal('product-modal');
  }

  function openDeleteModal(id) {
    const p = products.find((x) => x.id === id);
    deleteTargetId = id;
    document.getElementById('delete-product-text').textContent =
      `Delete "${p?.name || 'this product'}"? This cannot be undone.`;
    AdminUI.openModal('delete-product-modal');
  }

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('product-id').value;
    const payload = buildPayload();
    const saveBtn = document.getElementById('product-save-btn');
    saveBtn.disabled = true;

    try {
      if (id) {
        await AdminAPI.updateProduct(id, payload);
        AdminUI.showToast('Product updated successfully.');
      } else {
        await AdminAPI.createProduct(payload);
        AdminUI.showToast('Product created successfully.');
      }
      AdminUI.closeModal('product-modal');
      await loadProducts();
    } catch (err) {
      if (AdminAuth.handleApiAuthError(err)) return;
      AdminUI.showToast(err.message || 'Save failed.', 'error');
    } finally {
      saveBtn.disabled = false;
    }
  });

  document.getElementById('btn-add-product').addEventListener('click', openAddModal);

  document.getElementById('confirm-delete-product').addEventListener('click', async () => {
    if (!deleteTargetId) return;
    try {
      await AdminAPI.deleteProduct(deleteTargetId);
      AdminUI.closeModal('delete-product-modal');
      AdminUI.showToast('Product deleted.');
      deleteTargetId = null;
      await loadProducts();
    } catch (err) {
      if (AdminAuth.handleApiAuthError(err)) return;
      AdminUI.showToast(err.message || 'Delete failed.', 'error');
    }
  });

  searchInput.addEventListener('input', filterProducts);

  loadProducts();
});
