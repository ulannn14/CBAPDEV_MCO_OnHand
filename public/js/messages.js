(() => {
    window.APP_ROLE = window.APP_ROLE || 'customer';

  let conversations = [];
  let activeConvo = null;

  window.__APP = window.__APP || {};
  window.__APP.conversations = conversations;

  const ME_ID = window.APP_USER_ID || null;

  async function loadConversations() {
    try {
      const res = await fetch('/messages/list');
      const data = await res.json();
      if (!data.success) {
        console.error('Failed to load conversations:', data.error);
        return;
      }
      conversations = data.conversations || [];
      window.__APP.conversations = conversations;
      renderConvos();

      let defaultThread = window.DEFAULT_THREAD_ID;

      if (defaultThread) {
        const exists = conversations.find(c => c.id === defaultThread);
        if (exists) {
          document
            .querySelector(`.convo-item[data-id="${defaultThread}"]`)
            ?.classList.add('active');
          openConvo(defaultThread);
          return;
        }
      }

      if (conversations.length > 0) {
        const first = conversations[0];
        document
          .querySelector(`.convo-item[data-id="${first.id}"]`)
          ?.classList.add('active');
        openConvo(first.id);
      }

    } catch (err) {
      console.error('Error loading conversations:', err);
    }
  }

  function transformMessage(m, meId) {
    const isMe = meId && String(m.sender) === String(meId);
    return {
      from: isMe ? 'me' : 'them',
      text: m.content || '',
      type: m.type,
      price: m.price,
      accepted: m.accepted,
      declined: m.declined,
      cancelled: m.cancelled,
      images: m.images || [],
      time: m.timestamp
    };
  }


  function el(tag, attrs = {}, html = '') {
    const d = document.createElement(tag);
    for (const k in attrs) {
      if (k === 'class') d.className = attrs[k];
      else if (k === 'dataset') Object.assign(d.dataset, attrs[k]);
      else d.setAttribute(k, attrs[k]);
    }
    if (html) d.innerHTML = html;
    return d;
  }

  function escapeHtml(s) {
    return (s||'').replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    }[c]));
  }

  // ---------- Convos Sidebar ----------
    function renderConvos() {
    const list = document.getElementById('convoList');
    if (!list) return;
    list.innerHTML = '';

    conversations.forEach(c => {
      const div = document.createElement('div');
      div.className = 'convo-item';
      div.dataset.id = c.id;

      const avatarDiv = document.createElement('div');
      avatarDiv.className = 'convo-avatar';

      if (c.avatar && /\.(png|jpe?g|gif|svg)$/i.test(c.avatar)) {
        const link = document.createElement('a');
        link.href = c.username ? `/profile/${encodeURIComponent(c.username)}` : '#';
        link.className = 'convo-profile-link';
        const img = document.createElement('img');
        img.src = c.avatar;
        img.alt = `${c.name} avatar`;
        link.appendChild(img);
        avatarDiv.appendChild(link);
      } else {
        if (c.username) {
          const link = document.createElement('a');
          link.href = `/profile/${encodeURIComponent(c.username)}`;
          link.className = 'convo-profile-link';
          link.textContent = c.name ? c.name.charAt(0).toUpperCase() : '';
          avatarDiv.appendChild(link);
        } else {
          avatarDiv.textContent = c.name ? c.name.charAt(0).toUpperCase() : '';
        }
      }

      const metaDiv = document.createElement('div');
      metaDiv.className = 'convo-meta';

      const nameLine = document.createElement('div');
      nameLine.className = 'name-line';
      const nameSpan = document.createElement('span');
      nameSpan.className = 'name';
      if (c.username) {
        const nameLink = document.createElement('a');
        nameLink.href = `/profile/${encodeURIComponent(c.username)}`;
        nameLink.className = 'convo-profile-link name-link';
        nameLink.textContent = c.name || '';
        nameSpan.appendChild(nameLink);
      } else {
        nameSpan.textContent = c.name || '';
      }

      nameLine.appendChild(nameSpan);

      if (c.title) {
        const titleSpan = document.createElement('span');
        titleSpan.className = 'meta-title';
        titleSpan.textContent = ` · ${c.title}`;
        nameLine.appendChild(titleSpan);
      }

      const lastDiv = document.createElement('div');
      lastDiv.className = 'last';
      lastDiv.textContent = c.last || '';

      metaDiv.appendChild(nameLine);
      metaDiv.appendChild(lastDiv);

      div.appendChild(avatarDiv);
      div.appendChild(metaDiv);

      div.addEventListener('click', (ev) => {
        if (ev.target.closest('.convo-profile-link') || ev.target.classList && ev.target.classList.contains('convo-profile-link')) {
          return;
        }
        openConvo(c.id);
      });

      list.appendChild(div);
    });

  }


    async function openConvo(id) {
    const convoMeta = conversations.find(x => x.id === id);
    if (!convoMeta) return;

    try {
      const res = await fetch(`/messages/thread/${id}`);
      const data = await res.json();
      if (!data.success) {
        console.error('Failed to load thread:', data.error);
        return;
      }

      const thread = data.thread;
      const me = data.me || ME_ID;

      activeConvo = {
        id: thread._id,
        name: convoMeta.name,
        avatar: convoMeta.avatar,
        bookingId: thread.relatedBooking || null,   
        status: thread.status || 'Negotiating',     
        messages: (thread.messages || []).map(m => transformMessage(m, me))
      };

      window.__APP.activeConvo = activeConvo;

      const area = document.getElementById('messagesArea');
      if (!area) return;
      area.innerHTML = '';

      const tt = document.querySelector('.thread-top');
      if (tt) {
        tt.querySelectorAll('.thread-title').forEach(n => n.remove());

        const wrapper = document.createElement('div');
        wrapper.className = 'thread-title';

        const nameSpan = document.createElement('span');
        nameSpan.className = 'thread-title-name';
        nameSpan.textContent = convoMeta.name || '';

        const serviceSpan = document.createElement('span');
        serviceSpan.className = 'thread-title-service';
        serviceSpan.textContent = convoMeta.title ? ` · ${convoMeta.title}` : '';

        wrapper.appendChild(nameSpan);
        wrapper.appendChild(serviceSpan);

        tt.insertBefore(wrapper, tt.firstChild);
      }
      
      activeConvo.messages.forEach(m => appendMessage(m, activeConvo));
      updateMakeOfferButtonState();
      area.scrollTop = area.scrollHeight;

    } catch (err) {
      console.error('Error opening conversation:', err);
    }
  }

async function saveMessageToServer(threadId, payload) {
  try {
    const res = await fetch(`/messages/thread/${threadId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();

    if (!data.success) {
      console.error('Failed to save message:', data.error);
    }

    return data;
  } catch (err) {
    console.error("Failed to save message", err);
    return null;
  }
}



  // ---------- Message Box ----------
  function appendMessage(m, convoRef) {
    const area = document.getElementById('messagesArea');
    if (!area) return;
    const row = el('div', { class: 'msg-row ' + (m.from === 'me' ? 'msg-me' : 'msg-them') });

    const avatar = el('div', { class: 'msg-avatar' });
    if (convoRef && typeof convoRef.avatar === 'string' && /\.(png|jpe?g|gif|svg)$/i.test(convoRef.avatar)) {
      const img = el('img', { src: convoRef.avatar, alt: `${convoRef.name} avatar` });
      avatar.appendChild(img);
    } else avatar.textContent = convoRef ? (convoRef.avatar || '') : 'T';

    const bubble = el('div', { class: 'msg-bubble' }, escapeHtml(m.text || ''));
    if (m.from === 'them') row.append(avatar, bubble);
    else row.append(bubble, el('div', { class: 'msg-avatar' }, 'ME'));

    if (Array.isArray(m.images)) {
      const wrap = el('div', { class: 'msg-images-wrap' });
      m.images.forEach(src => wrap.append(el('img', { class: 'msg-img', src })));
      bubble.append(wrap);
    } else if (m.image) bubble.append(el('img', { class: 'msg-img', src: m.image }));

    area.append(row);
    area.scrollTop = area.scrollHeight;
  }

  // ---------- Offer Modal ----------
  function findLatestOffer(conv) {
    if (!conv || !Array.isArray(conv.messages)) return null;
    for (let i = conv.messages.length - 1; i >= 0; --i) {
      const m = conv.messages[i];
      if (m && m.type === 'offer') return { offer: m, index: i };
    }
    return null;
  }

  function updateMakeOfferButtonState() {
    const btn = document.getElementById('makeOfferBtn');
    if (!btn || !activeConvo) return;

    btn.disabled = false;
    btn.classList.remove('disabled');
    btn.textContent = (window.APP_ROLE === 'provider') ? 'Check Offer' : 'Make Offer';

    const found = findLatestOffer(activeConvo);

    if (window.APP_ROLE === 'customer' && found && found.offer.from === 'me' &&
        !found.offer.accepted && !found.offer.declined && !found.offer.cancelled) {
      btn.textContent = 'Update Offer';
    }
  }

  function initOfferModal() {
    const makeOfferBtn = document.getElementById('makeOfferBtn');
    const offerModal = document.getElementById('offerModal');
    const modalInner = offerModal ? offerModal.querySelector('.modal-inner') : null;
    const closeOffer = document.getElementById('closeOffer');
    const offerForm = document.getElementById('offerForm');
    const offerPriceEl = document.getElementById('offerPrice');
    const offerPriceDisplay = document.getElementById('offerPriceDisplay');
    const offerDecline = document.getElementById('offerDecline');
    const offerAccept = document.getElementById('offerAccept');
    const offerNewBtn = document.getElementById('offerNew');  
    const offerSendBtn = document.getElementById('offerSend'); 
    const offerComplete = document.getElementById('offerComplete');


    if (!offerModal) return;

    function isOfferHandled(found) {
    if (!activeConvo) return false;

    const hasBooking = !!activeConvo.bookingId; 
    const status = activeConvo.status;

    const offerHandled = !!(
      found &&
      (found.offer.accepted || found.offer.declined || found.offer.cancelled)
    );

    const threadHandled = !!(
      hasBooking ||
      status === 'Agreed' ||
      status === 'Closed'
    );

    return offerHandled || threadHandled;
  }

    function enterCustomerUpdateMode(foundOfferObj) {
      if (offerNewBtn) offerNewBtn.textContent = 'Cancel Offer';
      if (offerSendBtn) offerSendBtn.textContent = 'Update Offer';

      if (offerNewBtn) { offerNewBtn.disabled = false; offerNewBtn.classList.remove('disabled'); }
      if (offerSendBtn) { offerSendBtn.disabled = false; offerSendBtn.classList.remove('disabled'); }

      if (offerPriceEl && foundOfferObj) {
        offerPriceEl.value = foundOfferObj.price ?? '';
        offerPriceEl.disabled = false;
      }

      if (offerNewBtn) {
        offerNewBtn.onclick = (ev) => {
          ev.preventDefault();
          if (!activeConvo) return closeModal();
          const found = findLatestOffer(activeConvo);
          if (!found) return closeModal();
          found.offer.cancelled = true;
          const cancelMsg = { from: 'me', type: 'offer-cancel', text: 'Offer cancelled.', time: new Date().toISOString() };
          activeConvo.messages.push(cancelMsg);
          appendMessage(cancelMsg, activeConvo);
          updateMakeOfferButtonState();
          closeModal();
        };
      }

      if (offerSendBtn) {
        offerSendBtn.onclick = (ev) => {
          ev.preventDefault();
          if (!activeConvo) return closeModal();
          const found = findLatestOffer(activeConvo);
          if (!found) return closeModal();
          const newPrice = offerPriceEl ? offerPriceEl.value : found.offer.price;
          found.offer.price = newPrice;
          found.offer.time = new Date().toISOString();
          found.offer.text = `Offer: ₱${Number(newPrice).toLocaleString()}`;

          const updateMsg = {
            from: 'me',
            type: 'offer-update',
            text: `Offer updated: ₱${Number(newPrice).toLocaleString()}`,
            time: new Date().toISOString()
          };

          saveMessageToServer(activeConvo.id, {
            type: 'offer-update',
            price: Number(newPrice),
            content: updateMsg.text
          });

          activeConvo.messages.push(updateMsg);
          appendMessage(updateMsg, activeConvo);
          updateMakeOfferButtonState();
          closeModal();

        };
      }
    }

    function enterCustomerNewMode() {
      if (offerNewBtn) offerNewBtn.textContent = 'Make New Offer';
      if (offerSendBtn) offerSendBtn.textContent = 'Send Offer';
      if (offerPriceEl) offerPriceEl.disabled = false;
      if (offerNewBtn) {
        offerNewBtn.onclick = (ev) => {
          ev.preventDefault();
          offerForm?.reset();
          offerPriceEl?.focus();
        };
      }
      if (offerSendBtn) {
        offerSendBtn.onclick = null;
      }
    }

    function openModal() {
      if (!activeConvo) { 
        alert('Select a conversation first.'); 
        return; 
      }

      offerModal.classList.add('open');
      offerModal.removeAttribute('hidden');
      offerModal.setAttribute('aria-hidden', 'false');
      document.documentElement.style.overflow = 'hidden';
      const found = findLatestOffer(activeConvo);

        if (window.APP_ROLE === 'customer') {
          const handled = isOfferHandled(found);

          if (handled) {
        
            if (offerNewBtn) {
              offerNewBtn.disabled = true;
              offerNewBtn.classList.add('disabled-button');
              offerNewBtn.textContent = 'Offer finalized';
            }
            if (offerSendBtn) {
              offerSendBtn.disabled = true;
              offerSendBtn.classList.add('disabled-button');
            }
            if (offerPriceEl) {
              offerPriceEl.disabled = true;
            }
            return; 
          }

          if (found && found.offer.from === 'me' &&
              !found.offer.accepted && !found.offer.declined && !found.offer.cancelled) {
            enterCustomerUpdateMode(found.offer);
          } else {
            enterCustomerNewMode();
            offerForm?.reset();
            offerPriceEl?.focus();
          }
      } else {
        if (found && offerPriceDisplay) {
          offerPriceDisplay.textContent = `₱${Number(found.offer.price).toLocaleString()}`;
        }

        const handled = isOfferHandled(found);

        if (offerAccept) {
          offerAccept.disabled = handled;
          offerAccept.classList.toggle('disabled-button', handled);
        }
        if (offerDecline) {
          offerDecline.disabled = handled;
          offerDecline.classList.toggle('disabled-button', handled);
        }


        if (offerComplete) {
          const canComplete = !!(activeConvo && activeConvo.bookingId);
          offerComplete.style.display = canComplete ? 'inline-flex' : 'none';
        }
      }


    }

    function closeModal() {
      if (offerNewBtn) 
        offerNewBtn.onclick = null;
      if (offerSendBtn) 
        offerSendBtn.onclick = null;
      offerModal.classList.remove('open');
      offerModal.setAttribute('hidden', '');
      document.documentElement.style.overflow = '';
    }

    makeOfferBtn?.addEventListener('click', (e) => { e.preventDefault(); openModal(); });
    closeOffer?.addEventListener('click', (e) => { e.preventDefault(); closeModal(); });
    offerModal?.addEventListener('click', (e) => { if (modalInner && !modalInner.contains(e.target)) closeModal(); });
    modalInner?.addEventListener('click', (e) => e.stopPropagation());
    document.addEventListener('keydown', (e) => { if ((e.key === 'Escape' || e.key === 'Esc') && offerModal.classList.contains('open')) closeModal(); });

    offerForm?.addEventListener('submit', (ev) => {
      ev.preventDefault();
      if (!activeConvo) return closeModal();
      const found = findLatestOffer(activeConvo);

      if (isOfferHandled(found)) {
        closeModal();
        return;
      }

      if (window.APP_ROLE === 'customer' && found && found.offer.from === 'me' && !found.offer.accepted && !found.offer.declined && !found.offer.cancelled) {
        const newPrice = offerPriceEl ? offerPriceEl.value : found.offer.price;
        found.offer.price = newPrice;
        found.offer.time = new Date().toISOString();
        found.offer.text = `Offer: ₱${Number(newPrice).toLocaleString()}`;
        const updateMsg = { from: 'me', type: 'offer-update', text: `Offer updated: ₱${Number(newPrice).toLocaleString()}`, time: new Date().toISOString() };
        activeConvo.messages.push(updateMsg);
        appendMessage(updateMsg, activeConvo);
        updateMakeOfferButtonState();
        return closeModal();
      }

      const price = offerPriceEl ? offerPriceEl.value : '';

      const msg = {
        from: 'me',
        type: 'offer',
        price,
        text: `Offer: ₱${Number(price).toLocaleString()}`,
        accepted: false,
        declined: false,
        cancelled: false,
        time: new Date().toISOString()
      };

      saveMessageToServer(activeConvo.id, {
        type: 'offer',
        price: Number(price),
        content: msg.text
      });

      activeConvo.messages.push(msg);
      appendMessage(msg, activeConvo);
      updateMakeOfferButtonState();
      closeModal();

    });

    offerAccept?.addEventListener('click', async (ev) => {
    ev.preventDefault();
    const found = findLatestOffer(activeConvo);
    if (!found || found.offer.accepted || found.offer.declined || found.offer.cancelled) return;
    if (!found || isOfferHandled(found)) return;
    found.offer.accepted = true;

    const reply = {
      from: 'me',
      type: 'offer-reply',
      text: 'Offer accepted.',
      time: new Date().toISOString()
    };

    const data = await saveMessageToServer(activeConvo.id, {
      type: 'offer-reply',
      accepted: true,
      content: reply.text
    });

    if (!data || !data.success) {
      console.error('Failed to accept offer on server');
      return;
    }

    if (data.relatedBooking) {
      activeConvo.bookingId = data.relatedBooking;
    }

    activeConvo.messages.push(reply);
    appendMessage(reply, activeConvo);
    updateMakeOfferButtonState();
    closeModal();
  });



    offerDecline?.addEventListener('click', (ev) => {
      ev.preventDefault();
      const found = findLatestOffer(activeConvo);
      if (!found || found.offer.accepted || found.offer.declined || found.offer.cancelled) return;
      if (!found || isOfferHandled(found)) return;
      found.offer.declined = true;

      const reply = {
        from: 'me',
        type: 'offer-reply',
        text: 'Offer declined.',
        time: new Date().toISOString()
      };

      saveMessageToServer(activeConvo.id, {
        type: 'offer-reply',
        declined: true,
        content: reply.text
      });

      activeConvo.messages.push(reply);
      appendMessage(reply, activeConvo);
      updateMakeOfferButtonState();
      closeModal();
    });

      offerComplete?.addEventListener('click', async (ev) => {
      ev.preventDefault();
      if (!activeConvo) return;

      try {
        const res = await fetch(`/messages/thread/${activeConvo.id}/complete-booking`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        });

        const data = await res.json();
        if (!data.success) {
          console.error('Failed to complete booking:', data.error);
          return;
        }

        const msg = {
          from: 'me',
          type: 'offer-update',
          text: 'Booking marked as complete.',
          time: new Date().toISOString()
        };

        activeConvo.messages.push(msg);
        appendMessage(msg, activeConvo);

        if (offerComplete) {
          offerComplete.disabled = true;
          offerComplete.textContent = 'Completed';
        }

        closeModal();

      } catch (err) {
        console.error('Error marking booking complete:', err);
      }
    });


  }


  // ---------- Composer & Image Preview ----------
  function toDataURL(file) {
    return new Promise((res, rej) => {
      const r = new FileReader();
      r.onload = () => res(r.result);
      r.onerror = rej;
      r.readAsDataURL(file);
    });
  }

  function initComposer() {
    const sendBtn = document.getElementById('sendBtn');
    const input = document.getElementById('messageInput');
    const attach = document.getElementById('attachFile');
    let previewContainer = document.getElementById('imagePreview');
    if (!previewContainer) {
      const composer = document.querySelector('.composer');
      if (composer) {
        previewContainer = document.createElement('div');
        previewContainer.id = 'imagePreview';
        previewContainer.className = 'image-preview';
        const messageInput = document.getElementById('messageInput');
        composer.insertBefore(previewContainer, messageInput);
      }
    }

    const selectedFiles = [];
    if (attach) attach.setAttribute('multiple', '');

    function renderPreviews() {
      if (!previewContainer) return;
      previewContainer.innerHTML = '';
      selectedFiles.forEach((file, idx) => {
        const tile = document.createElement('div');
        tile.className = 'preview-item';
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        img.onload = () => URL.revokeObjectURL(img.src);
        const btn = document.createElement('button');
        btn.className = 'preview-remove';
        btn.innerHTML = '&times;';
        btn.onclick = () => { selectedFiles.splice(idx, 1); renderPreviews(); };
        tile.append(img, btn);
        previewContainer.append(tile);
      });
    }

    attach?.addEventListener('change', e => {
      const files = Array.from(e.target.files || []).filter(f => /^image\//.test(f.type));
      selectedFiles.push(...files);
      renderPreviews();
      attach.value = '';
    });

     sendBtn?.addEventListener('click', async () => {
      if (!activeConvo) return alert('Select a conversation first');
      const text = (input?.value || '').trim();
      if (!text && selectedFiles.length === 0) return;

      const imageDataURLs = await Promise.all(selectedFiles.map(f => toDataURL(f)));

      try {
        const res = await fetch(`/messages/thread/${activeConvo.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            content: text || '',
            type: 'text',
            images: imageDataURLs
          })
        });

        const data = await res.json();
        if (!data.success) {
          console.error('Failed to send message:', data.error);
          return;
        }

        const saved = data.message;
        const transformed = transformMessage(saved, ME_ID || window.APP_USER_ID);

        activeConvo.messages.push(transformed);
        appendMessage(transformed, activeConvo);

        input.value = '';
        selectedFiles.length = 0;
        renderPreviews();

      } catch (err) {
        console.error('Error sending message:', err);
      }
    });


    input?.addEventListener('keydown', e => {
      if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendBtn?.click(); }
    });
  }

    document.addEventListener('DOMContentLoaded', () => {
    loadConversations();
    initComposer();
    initOfferModal();
  });

})();