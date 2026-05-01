// ---- Dialog ----

const activeDialogs = new Map();

export function openDialog(id) {
  const tpl = document.querySelector(`[data-dialog="${id}"]`);
  if (!tpl) return;

  const overlay = document.createElement('div');
  overlay.className = 'dialog-overlay';
  overlay.dataset.dialogOverlay = id;

  const content = document.createElement('div');
  content.className = 'dialog-content';
  content.innerHTML = tpl.innerHTML;

  overlay.appendChild(content);
  document.body.appendChild(overlay);
  activeDialogs.set(id, overlay);

  // close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeDialog(id);
  });

  // close buttons inside dialog
  content.querySelectorAll('[data-dialog-close]').forEach((btn) => {
    btn.addEventListener('click', () => closeDialog(id));
  });

  document.dispatchEvent(new CustomEvent('dialog:open', { detail: { id, content } }));
}

export function closeDialog(id) {
  const overlay = activeDialogs.get(id);
  if (overlay) {
    overlay.remove();
    activeDialogs.delete(id);
  }
}

// ---- Custom Select ----

function isHidden(el) {
  return el.style.display === 'none' || el.hasAttribute('hidden');
}
function hideEl(el) { el.setAttribute('hidden', ''); }
function showEl(el) { el.removeAttribute('hidden'); }

export function initSelects(root) {
  root.querySelectorAll('[data-select]').forEach((sel) => {
    const trigger = sel.querySelector('.select-trigger');
    const valueEl = sel.querySelector('.select-value');
    const options = sel.querySelector('[data-course-options], .select-options');
    if (!trigger || !options) return;

    // ensure initially hidden
    hideEl(options);

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const wasHidden = isHidden(options);
      // close all
      root.querySelectorAll('[data-select]').forEach((s) => {
        const o = s.querySelector('[data-course-options], .select-options');
        if (o) hideEl(o);
      });
      if (wasHidden) showEl(options);
    });

    options.addEventListener('click', (e) => {
      const item = e.target.closest('.select-item');
      if (!item) return;
      sel.dataset.value = item.dataset.value;
      if (valueEl) valueEl.textContent = item.textContent.trim();
      hideEl(options);
    });
  });

  document.addEventListener('click', () => {
    root.querySelectorAll('[data-select]').forEach((sel) => {
      const o = sel.querySelector('[data-course-options], .select-options');
      if (o) hideEl(o);
    });
  });
}

// ---- Checkbox ----

export function initCheckboxes(root) {
  root.querySelectorAll('[data-checkbox]').forEach((cb) => {
    cb.addEventListener('click', () => {
      const checked = cb.dataset.state === 'checked';
      cb.dataset.state = checked ? 'unchecked' : 'checked';
      cb.dispatchEvent(new CustomEvent('checkbox:change', { bubbles: true }));
    });
  });
}

// ---- Custom Switch ----

export function initSwitches(root) {
  root.querySelectorAll('[data-switch]').forEach((sw) => {
    sw.addEventListener('click', () => {
      const checked = sw.dataset.state === 'checked';
      sw.dataset.state = checked ? 'unchecked' : 'checked';
    });
  });
}
