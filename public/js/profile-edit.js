(function () {
  const API_ENDPOINT = '/profile/update';

  function buildControls() {
    const wrap = document.createElement('span');
    wrap.className = 'edit-controls';

    const save = document.createElement('button');
    save.type = 'button';
    save.className = 'edit-save';
    save.textContent = 'Save';

    const cancel = document.createElement('button');
    cancel.type = 'button';
    cancel.className = 'edit-cancel';
    cancel.textContent = 'Cancel';

    wrap.appendChild(save);
    wrap.appendChild(cancel);
    return wrap;
  }

  function enterInlineEdit(el) {
    if (!el || el.dataset.editing === 'true') return;
    el.dataset.editing = 'true';

    const originalText = el.textContent.trim();
    const field = el.dataset.field || '';
    const id = el.dataset.id || '';
    const isMulti = el.tagName.toLowerCase() === 'p' || el.classList.contains('multiline');

    let input;

    // ---------- City-only Dropdown ----------
    if (field === 'location' || field === 'WorkingArea') {
      input = document.createElement('select');
      input.className = 'inline-editor';

      const cities = [
        "Manila", "Quezon City", "Makati", "Taguig", "Mandaluyong",
        "Pasig", "Pasay", "Valenzuela", "Caloocan", "Las Piñas",
        "Muntinlupa", "Parañaque", "Marikina", "San Juan", "Malabon",
        "Navotas", "Cavite", "Laguna", "Rizal", "Bulacan"
      ];

      const placeholder = document.createElement("option");
      placeholder.value = "";
      placeholder.textContent = "Select City";
      placeholder.disabled = true;
      placeholder.selected = !cities.includes(originalText);
      input.appendChild(placeholder);

      cities.forEach(city => {
        const opt = document.createElement('option');
        opt.value = city;
        opt.textContent = city;
        if (originalText === city) opt.selected = true;
        input.appendChild(opt);
      });

    } else {
      input = isMulti ? document.createElement('textarea') : document.createElement('input');
      if (!isMulti) input.type = 'text';
      input.className = 'inline-editor';
      input.value = originalText;

      if (!isMulti) {
        input.size = Math.max(Math.min(originalText.length + 5, 60), 10);
      }
    }

    const controls = buildControls();

    const container = document.createElement('span');
    container.className = 'inline-editor-wrap';
    container.appendChild(input);
    container.appendChild(controls);

    el.parentNode.replaceChild(container, el);

    input.focus();
    if (!isMulti && input.tagName !== "SELECT") input.select();

    controls.querySelector('.edit-save').addEventListener('click', () => {
      const value = input.tagName === 'SELECT' ? input.value : input.value;
      saveEdit(container, field, id, value, el.tagName.toLowerCase());
    });

    controls.querySelector('.edit-cancel').addEventListener('click', () => {
      cancelEdit(container, el);
    });

    input.addEventListener('keydown', (ev) => {
      if (ev.key === 'Escape') {
        ev.preventDefault();
        cancelEdit(container, el);
      } else if (ev.key === 'Enter' && !isMulti && input.tagName !== "SELECT") {
        ev.preventDefault();
        saveEdit(container, field, id, input.value, el.tagName.toLowerCase());
      }
    });
  }

  function cancelEdit(container, originalEl) {
    originalEl.dataset.editing = 'false';
    container.parentNode.replaceChild(originalEl, container);
  }

  async function saveEdit(container, field, id, newValue, originalTag) {
    newValue = String(newValue).trim();
    if (!newValue) {
      alert('Value cannot be empty.');
      const input = container.querySelector('.inline-editor');
      if (input) input.focus();
      return;
    }

    const saveBtn = container.querySelector('.edit-save');
    const cancelBtn = container.querySelector('.edit-cancel');
    saveBtn.disabled = true;
    cancelBtn.disabled = true;
    saveBtn.textContent = 'Saving...';

    // ---------- City-only Payload ----------
    let payload = { id, field, value: newValue };

    if (field === 'location') {
      payload = {
        id,
        field: 'location',
        value: { city: newValue }
      };
    } else if (field === 'WorkingArea') {
      payload = {
        id, 
        field: 'WorkingArea',
        value: newValue
      };
    }

    try {
      const resp = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include'
      });

      if (!resp.ok) throw new Error('Network response not ok: ' + resp.status);

      const data = await resp.json();
      if (!data.success) throw new Error(data.error || 'Server error');

      const newTextNode = document.createElement(originalTag === 'p' ? 'p' : 'span');
      newTextNode.className = 'editable';
      newTextNode.dataset.field = field;
      newTextNode.dataset.id = id;
      newTextNode.textContent = newValue;
      newTextNode.dataset.editing = 'false';

      container.parentNode.replaceChild(newTextNode, container);

    } catch (err) {
      console.error('Save failed', err);
      alert('Failed to save. Please try again.');
      saveBtn.disabled = false;
      cancelBtn.disabled = false;
      saveBtn.textContent = 'Save';
    }
  }

  // ---------- Edit button click handler ----------
  document.addEventListener('click', (ev) => {
    const btn = ev.target.closest('.edit-btn');
    if (!btn) return;

    const container = btn.closest('div, section, li, article, .meta-row, .description, .card-header') || btn.parentNode;
    if (!container) return;

    const editable = container.querySelector('.editable');
    if (!editable) {
      const nextEditable =
        btn.previousElementSibling && btn.previousElementSibling.classList.contains('editable')
          ? btn.previousElementSibling
          : null;
      if (nextEditable) return enterInlineEdit(nextEditable);
      return;
    }

    enterInlineEdit(editable);
  });

})();
