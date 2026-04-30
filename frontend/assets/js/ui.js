// Vanilla replacements for shadcn/Radix primitives.
// Each helper attaches event listeners to plain HTML markup.

/* ---------- Dialog ---------- */
// markup contract:
//   <button data-dialog-trigger="myDialog">…</button>
//   <div class="dialog" data-dialog="myDialog" hidden>…content…</div>
// open/close programmatically: openDialog(id), closeDialog(id)
export function initDialogs(root = document) {
  root.querySelectorAll('[data-dialog-trigger]').forEach((btn) => {
    btn.addEventListener('click', () => openDialog(btn.dataset.dialogTrigger));
  });
  root.querySelectorAll('[data-dialog-close]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const dlg = btn.closest('[data-dialog]');
      if (dlg) closeDialog(dlg.dataset.dialog);
    });
  });
}

export function openDialog(id) {
  const tpl = document.querySelector(`[data-dialog="${id}"]`);
  if (!tpl) return;
  const overlay = document.createElement('div');
  overlay.className = 'dialog-overlay';
  overlay.dataset.dialogOverlay = id;
  overlay.addEventListener('click', () => closeDialog(id));

  const content = document.createElement('div');
  content.className = 'dialog-content';
  content.dataset.dialogActive = id;
  content.innerHTML = tpl.innerHTML;
  content.addEventListener('click', (e) => e.stopPropagation());

  // wire close buttons inside the cloned content
  content.querySelectorAll('[data-dialog-close]').forEach((b) => {
    b.addEventListener('click', () => closeDialog(id));
  });

  document.body.appendChild(overlay);
  document.body.appendChild(content);
  document.body.style.overflow = 'hidden';

  document.dispatchEvent(new CustomEvent('dialog:open', { detail: { id, content } }));
}

export function closeDialog(id) {
  document.querySelectorAll(`[data-dialog-overlay="${id}"], [data-dialog-active="${id}"]`)
    .forEach((el) => el.remove());
  document.body.style.overflow = '';
  document.dispatchEvent(new CustomEvent('dialog:close', { detail: { id } }));
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('[data-dialog-active]').forEach((el) => closeDialog(el.dataset.dialogActive));
  }
});

/* ---------- Tabs ---------- */
// markup contract:
//   <div class="tabs" data-tabs data-active="all">
//     <div class="tabs-list">
//       <button class="tab-trigger" data-tab="all">…</button>
//     </div>
//   </div>
// fires custom event "tab:change" with { value } detail.
export function initTabs(root = document) {
  root.querySelectorAll('[data-tabs]').forEach((tabs) => {
    const setActive = (val) => {
      tabs.dataset.active = val;
      tabs.querySelectorAll('[data-tab]').forEach((b) => {
        b.dataset.state = b.dataset.tab === val ? 'active' : 'inactive';
      });
      tabs.dispatchEvent(new CustomEvent('tab:change', { detail: { value: val } }));
    };
    tabs.querySelectorAll('[data-tab]').forEach((b) => {
      b.addEventListener('click', () => setActive(b.dataset.tab));
    });
    setActive(tabs.dataset.active || tabs.querySelector('[data-tab]')?.dataset.tab);
  });
}

/* ---------- Switch ---------- */
// markup: <button class="switch" data-switch data-state="unchecked"><span class="switch-thumb"></span></button>
export function initSwitches(root = document) {
  root.querySelectorAll('[data-switch]').forEach((sw) => {
    if (!sw.querySelector('.switch-thumb')) {
      const t = document.createElement('span'); t.className = 'switch-thumb'; sw.appendChild(t);
    }
    sw.addEventListener('click', () => {
      const next = sw.dataset.state === 'checked' ? 'unchecked' : 'checked';
      sw.dataset.state = next;
      sw.dispatchEvent(new CustomEvent('switch:change', { detail: { checked: next === 'checked' } }));
    });
  });
}

/* ---------- Checkbox ---------- */
// markup: <button class="checkbox" data-checkbox data-state="unchecked"></button>
export function initCheckboxes(root = document) {
  root.querySelectorAll('[data-checkbox]').forEach((cb) => {
    if (!cb.querySelector('svg')) {
      cb.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    }
    cb.addEventListener('click', () => {
      const next = cb.dataset.state === 'checked' ? 'unchecked' : 'checked';
      cb.dataset.state = next;
      cb.dispatchEvent(new CustomEvent('checkbox:change', { detail: { checked: next === 'checked' } }));
    });
  });
}

/* ---------- Select ---------- */
// markup:
//   <div class="select" data-select data-value="c1">
//     <button type="button" class="select-trigger">
//       <span class="select-value">…label…</span>
//       <svg ...chevron.../>
//     </button>
//     <div class="select-options" hidden>
//       <div class="select-item" data-value="c1">CS361</div>
//     </div>
//   </div>
export function initSelects(root = document) {
  root.querySelectorAll('[data-select]').forEach((sel) => {
    const trigger = sel.querySelector('.select-trigger');
    const valueEl = sel.querySelector('.select-value');
    const opts = sel.querySelector('.select-options');
    const placeholder = sel.dataset.placeholder || '';

    function applyValue(val) {
      sel.dataset.value = val;
      const item = sel.querySelector(`.select-item[data-value="${val}"]`);
      if (item) {
        valueEl.textContent = item.textContent.trim();
        trigger.removeAttribute('data-placeholder');
      } else {
        valueEl.textContent = placeholder;
        trigger.setAttribute('data-placeholder', '');
      }
      sel.dispatchEvent(new CustomEvent('select:change', { detail: { value: val } }));
    }

    function close() { opts.hidden = true; opts.classList.remove('select-content'); opts.style.position = ''; }
    function open() {
      opts.hidden = false;
      opts.classList.add('select-content');
      opts.style.position = 'absolute';
      opts.style.top = trigger.offsetHeight + 4 + 'px';
      opts.style.left = '0';
      opts.style.right = '0';
    }

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      opts.hidden ? open() : close();
    });
    opts.querySelectorAll('.select-item').forEach((it) => {
      it.addEventListener('click', () => { applyValue(it.dataset.value); close(); });
    });
    document.addEventListener('click', (e) => {
      if (!sel.contains(e.target)) close();
    });

    sel.style.position = 'relative';
    if (sel.dataset.value) applyValue(sel.dataset.value);
    else { valueEl.textContent = placeholder; trigger.setAttribute('data-placeholder', ''); }
  });
}

/* ---------- Init all ---------- */
export function initUI(root = document) {
  initDialogs(root);
  initTabs(root);
  initSwitches(root);
  initCheckboxes(root);
  initSelects(root);
}
