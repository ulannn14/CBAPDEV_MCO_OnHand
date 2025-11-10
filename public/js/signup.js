document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('signupForm');

  if (!form) {
    console.warn('signup.js: #signupForm not found on this page — script detached.');
    return;
  }

  const providerFields = document.getElementById('serviceProviderFields');

  function setProviderVisibility(show) {
    if (!providerFields) return;
    providerFields.style.display = show ? 'block' : 'none';

    const providerRequiredSelectors = ['#workingLocation', '#nbiClearance'];
    providerRequiredSelectors.forEach(sel => {
      const el = document.querySelector(sel);
      if (!el) return;
      if (show) el.setAttribute('required', '');
      else el.removeAttribute('required');
    });
  }

  const initialProviderYes = document.querySelector('input[name="isServiceProvider"][value="yes"]');
  setProviderVisibility(!!initialProviderYes?.checked);

  function forEachNodeList(nodeList, cb) {
    Array.prototype.forEach.call(nodeList, cb);
  }

  const radios = document.querySelectorAll('input[name="isServiceProvider"]');
  forEachNodeList(radios, radio => {
    radio.addEventListener('change', () => {
      setProviderVisibility(radio.value === 'yes');
      if (radio.value === 'yes' && typeof initTimePickers === 'function') {
        try { initTimePickers(); } catch (err) { console.warn('initTimePickers failed', err); }
      }
    });
  });

  form.addEventListener('submit', function (ev) {
    try {
      if (!form.reportValidity()) {
        ev.preventDefault();
        return;
      }

      const pw = document.getElementById('password');
      const pw2 = document.getElementById('confirmPassword');
      if (pw && pw2 && pw.value !== pw2.value) {
        ev.preventDefault();
        alert('Passwords do not match. Please re-enter.');
        pw2.focus();
        return;
      }

      const providerYes = document.querySelector('input[name="isServiceProvider"][value="yes"]');
      const isProvider = !!(providerYes && providerYes.checked);

      if (isProvider) {
        const days = Array.from(document.querySelectorAll('input[name="workingDays"]'));
        const anyDay = days.length ? days.some(cb => cb.checked) : true;
        if (!anyDay) {
          ev.preventDefault();
          alert('Please select at least one working day.');
          if (days.length) days[0].focus();
          return;
        }

        const startHidden = document.querySelector('.startTimeHidden');
        const endHidden = document.querySelector('.endTimeHidden');
        if (startHidden && !startHidden.value) {
          ev.preventDefault();
          alert('Please set a start time for working hours.');
          const h = document.querySelector('.time-picker .tp-hour');
          if (h) h.focus();
          return;
        }
        if (endHidden && !endHidden.value) {
          ev.preventDefault();
          alert('Please set an end time for working hours.');
          const h2 = document.querySelectorAll('.time-picker .tp-hour')[1];
          if (h2) h2.focus();
          return;
        }

        const nbi = document.getElementById('nbiClearance');
        if (nbi) {
          if (nbi.type === 'file') {
            if (!nbi.files || nbi.files.length === 0) {
              ev.preventDefault();
              alert('Please upload your NBI Clearance (required for service providers).');
              nbi.focus();
              return;
            }
          } else if (!nbi.value) {
            ev.preventDefault();
            alert('Please provide your NBI Clearance information (required for service providers).');
            nbi.focus();
            return;
          }
        }
      }

      ev.preventDefault();
      window.location.href = 'homepage.html';
    } catch (err) {
      console.error('Error during signup form submit handler:', err);
      ev.preventDefault();
      alert('An unexpected error occurred. See console for details.');
    }
  });

  (function () {
    const pad = n => (n < 10 ? '0' + n : String(n));

    function buildOptions(list, placeholder) {
      const frag = document.createDocumentFragment();
      if (placeholder) {
        const opt = document.createElement('option');
        opt.value = '';
        opt.textContent = placeholder;
        opt.disabled = true;
        opt.selected = true;
        frag.appendChild(opt);
      }
      list.forEach(v => {
        const o = document.createElement('option');
        o.value = v;
        o.textContent = v;
        frag.appendChild(o);
      });
      return frag;
    }

    function initSingleTimePicker(tpRoot) {
      if (!tpRoot) return;
      const hourSelect = tpRoot.querySelector('.tp-hour');
      const minuteSelect = tpRoot.querySelector('.tp-minute');
      const ampmSelect = tpRoot.querySelector('.tp-ampm');
      const hidden = tpRoot.querySelector('input.startTimeHidden, input.endTimeHidden');

      if (hourSelect && hourSelect.children.length <= 1) { // <=1 handles a possible placeholder already present
        const hours = [];
        for (let h = 1; h <= 12; h++) hours.push(String(h));
        hourSelect.appendChild(buildOptions(hours, 'Hour'));
      }

      if (minuteSelect && minuteSelect.children.length <= 1) {
        const mins = [];
        for (let m = 0; m < 60; m += 1) mins.push(pad(m));
        minuteSelect.appendChild(buildOptions(mins, 'Min'));
      }

      if (ampmSelect && ampmSelect.children.length === 0) {
        const ap = ['AM', 'PM'];
        ampmSelect.appendChild(buildOptions(ap, 'AM/PM'));
      }

      function writeHidden() {
        if (!hidden) return;
        const h = hourSelect?.value || '';
        const m = minuteSelect?.value || '';
        const ap = ampmSelect?.value || '';
        if (!h || !m || !ap) {
          hidden.value = '';
        } else {
          hidden.value = `${h.padStart(2, '0')}:${m}:${ap}`; // e.g. "09:05:AM"
        }
      }

      [hourSelect, minuteSelect, ampmSelect].forEach(el => {
        if (!el) return;
        el.addEventListener('change', writeHidden);
        el.addEventListener('input', writeHidden);
      });

      if (hidden && hidden.value) {
        const parts = hidden.value.split(':');
        if (parts.length === 3) {
          const [hh, mm, ap] = parts;
          if (hourSelect) hourSelect.value = String(parseInt(hh, 10));
          if (minuteSelect) minuteSelect.value = mm;
          if (ampmSelect) ampmSelect.value = ap;
        }
      }

      writeHidden();
    }

    window.initTimePickers = function initTimePickers(root) {
      const scope = root instanceof Element ? root : document;
      const pickers = scope.querySelectorAll('.time-picker');
      pickers.forEach(initSingleTimePicker);
    };

    document.addEventListener('DOMContentLoaded', () => {
      if (document.getElementById('signupForm')) {
        try { window.initTimePickers(); } catch (e) { console.warn('initTimePickers failed on DOMContentLoaded', e); }
      }
    });
  })();
});