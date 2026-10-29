/**
 * Digital Wedding Invitation Application Logic
 * Couple: Sashini & Tharaka | Date: November 27, 2026
 * Venue: Hotel Green Court, Homagama
 */

// Global State
const WeddingState = {
  weddingDate: new Date('2026-11-27T10:06:00+05:30'),
  brideName: 'Sashini',
  groomName: 'Tharaka',
  venue: 'Hotel Green Court, Homagama',
  guestName: '',
  adminPin: localStorage.getItem('wedding_admin_pin') || '1234'
};

class WeddingApp {
  constructor() {
    this.rsvpFilterStatus = 'all';
    this.rsvpSearchQuery = '';
    this.initGuestPersonalization();
    this.initHostMode();
    this.initEnvelope();
    this.initCountdown();
    this.initCalendarLinks();
    this.initRsvpForm();
    this.initWishesWall();
    this.initShareModal();
    this.initOrganizerDashboard();
    this.initParticleCanvas();
    this.initScrollAnimations();
  }

  // 1. Personalized Guest Logic
  initGuestPersonalization() {
    const params = new URLSearchParams(window.location.search);
    const guestParam = params.get('g') || params.get('guest') || params.get('to') || params.get('name');
    
    if (guestParam && guestParam.trim()) {
      WeddingState.guestName = guestParam.trim();
    }

    const letterGuestSalutation = document.getElementById('letter-guest-salutation');
    const letterBodyEl = document.getElementById('letter-content-text');
    const rsvpNoteEl = document.getElementById('rsvp-display-guest-note');
    const rsvpNameInput = document.getElementById('rsvp-name');
    const wishNameInput = document.getElementById('wish-name');

    if (letterBodyEl) {
      letterBodyEl.innerHTML = `
        <p>With hearts full of love and happiness, we’re delighted to invite you to celebrate the wedding that marks the beginning of our journey together. 🤍</p>
        <p>It would truly mean the world to us to have you by our side on this very special day.</p>
        <p>We can’t wait to celebrate, share laughter, and create beautiful memories with you! ✨</p>
      `;
    }

    if (WeddingState.guestName) {
      if (letterGuestSalutation) letterGuestSalutation.textContent = `Dear ${WeddingState.guestName} 🌸`;
      if (rsvpNoteEl) rsvpNoteEl.innerHTML = `Hi <strong>${this.escapeHtml(WeddingState.guestName)}</strong> 🌸, will you be joining us?`;
      if (rsvpNameInput) rsvpNameInput.value = WeddingState.guestName;
      if (wishNameInput && !wishNameInput.value) wishNameInput.value = WeddingState.guestName;
    } else {
      if (letterGuestSalutation) letterGuestSalutation.textContent = `Dear Family & Friends 🌸`;
      if (rsvpNoteEl) rsvpNoteEl.textContent = `Will you be joining us to celebrate our special day? 🌸`;
      if (rsvpNameInput) rsvpNameInput.value = '';
    }
  }

  // 1.5. Host Mode vs Guest Mode Visibility
  initHostMode() {
    const params = new URLSearchParams(window.location.search);
    const hostControls = document.getElementById('host-controls') || document.querySelector('.top-controls');
    const hostAccessTrigger = document.getElementById('host-access-trigger');

    // Explicit host triggers in URL: ?host=1, ?admin=1, ?host, or hash #host
    const isExplicitHost = params.has('host') || params.has('admin') || window.location.hash.toLowerCase() === '#host';
    // Guest link parameters: ?g=..., ?guest=..., ?to=...
    const isGuestParam = params.has('g') || params.has('guest') || params.has('to') || params.has('name');

    if (isExplicitHost) {
      try {
        localStorage.setItem('wedding_host_mode', 'true');
      } catch (e) {}
    }

    // Determine host visibility:
    // If opened via guest link (e.g. ?g=Kasun), FORCE FALSE so guests NEVER see host tools!
    let isHost = false;
    if (isExplicitHost) {
      isHost = true;
    } else if (isGuestParam) {
      isHost = false;
    } else {
      try {
        isHost = localStorage.getItem('wedding_host_mode') === 'true';
      } catch (e) {
        isHost = false;
      }
    }

    const setHostVisibility = (visible) => {
      if (hostControls) {
        if (visible) {
          hostControls.style.display = 'flex';
          hostControls.classList.add('host-visible');
        } else {
          hostControls.style.display = 'none';
          hostControls.classList.remove('host-visible');
        }
      }
    };

    setHostVisibility(isHost);

    // Footer discreet access trigger
    if (hostAccessTrigger) {
      hostAccessTrigger.addEventListener('click', (e) => {
        e.preventDefault();
        const customizeModal = document.getElementById('customize-modal');
        if (customizeModal) {
          customizeModal.classList.add('open');
          const pinInput = document.getElementById('organizer-pin-input');
          if (pinInput) {
            setTimeout(() => pinInput.focus(), 300);
          }
        }
      });
    }

    this.unlockHostMode = () => {
      try {
        localStorage.setItem('wedding_host_mode', 'true');
      } catch (e) {}
      setHostVisibility(true);
    };

    this.lockHostMode = () => {
      try {
        localStorage.removeItem('wedding_host_mode');
      } catch (e) {}
      setHostVisibility(false);
    };
  }

  // 2. Envelope Landing Screen
  initEnvelope() {
    const openBtn = document.getElementById('open-invitation-btn');
    const envelopeOverlay = document.getElementById('envelope-overlay');
    const mainEnvelope = document.getElementById('main-envelope');

    let isOpening = false;
    const triggerEnvelopeOpen = () => {
      if (isOpening) return;
      isOpening = true;

      if (mainEnvelope) {
        mainEnvelope.classList.add('opening');
      }

      // Start background music smoothly
      if (window.weddingAudio) {
        try { window.weddingAudio.play(); } catch (e) {}
      }

      // After the flap folds open and the letter card slides up for the guest to see:
      setTimeout(() => {
        if (envelopeOverlay) {
          envelopeOverlay.classList.add('opened');
        }
      }, 1250);

      setTimeout(() => {
        if (envelopeOverlay) {
          envelopeOverlay.style.display = 'none';
        }
      }, 2250);
    };

    if (openBtn) {
      openBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        triggerEnvelopeOpen();
      });
    }

    if (mainEnvelope) {
      mainEnvelope.addEventListener('click', () => {
        triggerEnvelopeOpen();
      });
    }

    // Sparkles in envelope
    const sparklesContainer = document.getElementById('envelope-sparkles');
    if (sparklesContainer) {
      for (let i = 0; i < 18; i++) {
        const sparkle = document.createElement('div');
        sparkle.className = 'sparkle-particle';
        sparkle.style.left = `${Math.random() * 100}%`;
        sparkle.style.top = `${Math.random() * 100}%`;
        sparkle.style.width = `${Math.random() * 6 + 4}px`;
        sparkle.style.height = sparkle.style.width;
        sparkle.style.animationDelay = `${Math.random() * 4}s`;
        sparkle.style.animationDuration = `${Math.random() * 3 + 2}s`;
        sparklesContainer.appendChild(sparkle);
      }
    }
  }

  // 3. Live Countdown Timer
  initCountdown() {
    const daysEl = document.getElementById('countdown-days');
    const hoursEl = document.getElementById('countdown-hours');
    const minsEl = document.getElementById('countdown-mins');
    const secsEl = document.getElementById('countdown-secs');

    const updateTimer = () => {
      const now = new Date().getTime();
      const diff = WeddingState.weddingDate.getTime() - now;

      if (diff <= 0) {
        if (daysEl) daysEl.textContent = '00';
        if (hoursEl) hoursEl.textContent = '00';
        if (minsEl) minsEl.textContent = '00';
        if (secsEl) secsEl.textContent = '00';
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      if (daysEl) daysEl.textContent = String(days).padStart(2, '0');
      if (hoursEl) hoursEl.textContent = String(hours).padStart(2, '0');
      if (minsEl) minsEl.textContent = String(minutes).padStart(2, '0');
      if (secsEl) secsEl.textContent = String(seconds).padStart(2, '0');
    };

    updateTimer();
    setInterval(updateTimer, 1000);
  }

  // 4. Add to Google & Apple Calendar
  initCalendarLinks() {
    const googleBtn = document.getElementById('add-to-google-cal');
    const appleBtn = document.getElementById('add-to-apple-cal');

    // Google Calendar URL
    if (googleBtn) {
      const title = encodeURIComponent("Wedding of Sashini & Tharaka");
      const details = encodeURIComponent(
        "We cordially invite you to celebrate the wedding ceremony of Sashini & Tharaka on Friday, November 27, 2026 at Hotel Green Court, Homagama.\n\n" +
        "• 10:06 AM: Poruwa Ceremony\n\n" +
        "We can't wait to celebrate with you!"
      );
      const location = encodeURIComponent("Hotel Green Court, Homagama, Sri Lanka");
      // 2026-11-27T10:06:00+05:30 is 20261127T043600Z to 20261127T110000Z
      const dates = "20261127T043600Z/20261127T110000Z";
      googleBtn.href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}&location=${location}`;
    }

    // Apple / Outlook .ics download
    if (appleBtn) {
      appleBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const icsContent = 
`BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//Sashini & Tharaka Wedding//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
SUMMARY:Wedding of Sashini & Tharaka
DESCRIPTION:Join us for the wedding of Sashini & Tharaka at Hotel Green Court, Homagama. Poruwa Ceremony starts at 10:06 AM.
LOCATION:Hotel Green Court, Homagama, Sri Lanka
DTSTART:20261127T043600Z
DTEND:20261127T110000Z
STATUS:CONFIRMED
END:VEVENT
END:VCALENDAR`;

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.setAttribute('download', 'Sashini_Tharaka_Wedding.ics');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      });
    }
  }

  // 5. Interactive RSVP Form & WhatsApp
  initRsvpForm() {
    const form = document.getElementById('rsvp-form');
    const minusBtn = document.getElementById('stepper-minus');
    const plusBtn = document.getElementById('stepper-plus');
    const stepperVal = document.getElementById('stepper-val');
    const hiddenCount = document.getElementById('rsvp-guest-count');
    const successBadge = document.getElementById('rsvp-success-badge');
    const confirmedName = document.getElementById('rsvp-confirmed-name');
    const confirmedStatus = document.getElementById('rsvp-confirmed-status');
    const editBtn = document.getElementById('edit-rsvp-btn');
    const whatsappQuickBtn = document.getElementById('rsvp-whatsapp-quick-btn');
    const whatsappDirectBtn = document.getElementById('rsvp-whatsapp-direct-btn');

    let count = 1;

    if (minusBtn && plusBtn && stepperVal && hiddenCount) {
      minusBtn.addEventListener('click', () => {
        if (count > 1) {
          count--;
          stepperVal.textContent = count;
          hiddenCount.value = count;
        }
      });

      plusBtn.addEventListener('click', () => {
        if (count < 10) {
          count++;
          stepperVal.textContent = count;
          hiddenCount.value = count;
        }
      });
    }

    const num1 = '94782304701';
    const num2 = '94705118484';

    const waBtn1 = document.getElementById('rsvp-wa-btn-1');
    const waBtn2 = document.getElementById('rsvp-wa-btn-2');
    const waHint1 = document.getElementById('wa-hint-1');
    const waHint2 = document.getElementById('wa-hint-2');

    if (waBtn1) {
      waBtn1.addEventListener('click', () => {
        if (waHint1) waHint1.textContent = '✅ Sent to Sashini (078 230 4701)';
      });
    }
    if (waBtn2) {
      waBtn2.addEventListener('click', () => {
        if (waHint2) {
          waHint2.textContent = '✅ Sent to Tharaka (070 511 8484)';
          waBtn2.classList.remove('highlight-next');
        }
      });
    }

    // Toggle headcount group based on attendance selection
    const attendingRadios = form ? form.querySelectorAll('input[name="attending"]') : [];
    const headcountGroup = document.getElementById('headcount-group');
    attendingRadios.forEach(r => {
      r.addEventListener('change', () => {
        if (headcountGroup) {
          headcountGroup.style.display = r.value === 'yes' ? 'block' : 'none';
        }
      });
    });

    const saveAndShowSuccess = (name, contact, attending, guestCount) => {
      const rsvpId = 'rsvp_' + Date.now();
      const rsvpData = {
        id: rsvpId,
        name: (name || '').trim(),
        contact: (contact || '').trim(),
        attending: attending,
        guestCount: attending === 'yes' ? parseInt(guestCount || '1', 10) : 0,
        time: new Date().toLocaleString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        }),
        timestamp: Date.now()
      };

      // Save to localStorage
      const existing = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
      existing.unshift(rsvpData);
      localStorage.setItem('wedding_rsvps', JSON.stringify(existing));

      // Sync to Firebase Realtime Database (Real-time cloud sync for organizer)
      if (typeof WeddingFirebase !== 'undefined') {
        const db = WeddingFirebase.getDatabase();
        if (db) {
          try {
            db.ref('rsvps/' + rsvpId).set(rsvpData).catch(err => {
              console.warn('[RSVP] Firebase write error:', err);
            });
          } catch (e) {
            console.warn('[RSVP] Firebase save error:', e);
          }
        }
      }

      if (form) form.style.display = 'none';
      if (successBadge) {
        successBadge.style.display = 'block';
        if (confirmedName) confirmedName.textContent = name;
        if (confirmedStatus) {
          confirmedStatus.textContent = attending === 'yes' 
            ? `Joyfully attending with ${guestCount} guest(s)!` 
            : `Regretfully declined with warmest regards.`;
        }
      }

      // Prepare WhatsApp message
      const isYes = attending === 'yes';
      const waText = encodeURIComponent(
        `Dear Sashini & Tharaka 🤍\n\n` +
        `*Wedding RSVP Confirmation*\n` +
        `━━━━━━━━━━━━━━━━━━━━\n` +
        `• Guest Name: ${name}\n` +
        `• Contact Number: ${contact}\n` +
        `• Attendance: ${isYes ? 'Joyfully Accept 🤍' : 'Regretfully Decline 💐'}\n` +
        `• Number of Guests: ${guestCount}\n` +
        `• Wedding Date: Friday, November 27, 2026 (10:06 AM)\n` +
        `• Venue: Hotel Green Court, Homagama\n` +
        `━━━━━━━━━━━━━━━━━━━━\n\n` +
        `${isYes ? "We can't wait to celebrate your special day with you! 🥂" : "Wishing you both a lifetime of love and happiness! 💐"}`
      );

      const waUrl1 = `https://wa.me/${num1}?text=${waText}`;
      const waUrl2 = `https://wa.me/${num2}?text=${waText}`;

      if (waBtn1) waBtn1.href = waUrl1;
      if (waBtn2) waBtn2.href = waUrl2;

      // Automatically open the first number (078 230 4701 - Sashini) in WhatsApp
      try {
        window.open(waUrl1, '_blank');
        if (waHint1) waHint1.textContent = '✅ WhatsApp Opened (Sent)';
        if (waHint2) waHint2.textContent = '👉 Tap to Send to Tharaka (070 511 8484) too';
      } catch (e) {
        if (waHint1) waHint1.textContent = '👉 Tap to Send to Sashini (078 230 4701)';
      }
    };

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('rsvp-name').value;
        const contact = document.getElementById('rsvp-contact').value;
        const attending = form.querySelector('input[name="attending"]:checked').value;
        const guestCount = hiddenCount ? hiddenCount.value : '1';

        saveAndShowSuccess(name, contact, attending, guestCount);
      });
    }

    if (whatsappQuickBtn) {
      whatsappQuickBtn.addEventListener('click', () => {
        if (form && !form.checkValidity()) {
          form.reportValidity();
          return;
        }
        const name = document.getElementById('rsvp-name').value;
        const contact = document.getElementById('rsvp-contact').value;
        const attending = form.querySelector('input[name="attending"]:checked').value;
        const guestCount = hiddenCount ? hiddenCount.value : '1';

        saveAndShowSuccess(name, contact, attending, guestCount);
      });
    }

    if (editBtn) {
      editBtn.addEventListener('click', () => {
        if (successBadge) successBadge.style.display = 'none';
        if (form) form.style.display = 'block';
      });
    }

    // Firebase Realtime Listener for RSVPs (Syncs all guest submissions to organizer)
    if (typeof WeddingFirebase !== 'undefined') {
      const db = WeddingFirebase.getDatabase();
      if (db) {
        try {
          db.ref('rsvps').on('value', (snapshot) => {
            const data = snapshot.val();
            let cloudRsvps = [];
            if (data) {
              if (Array.isArray(data)) {
                cloudRsvps = data.filter(Boolean);
              } else if (typeof data === 'object') {
                cloudRsvps = Object.keys(data).map(k => ({
                  ...data[k],
                  id: data[k].id || k
                }));
              }
            }

            if (cloudRsvps.length > 0) {
              cloudRsvps.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
              localStorage.setItem('wedding_rsvps', JSON.stringify(cloudRsvps));
            } else if (!localStorage.getItem('wedding_rsvps')) {
              localStorage.setItem('wedding_rsvps', JSON.stringify([]));
            }

            const cloudBadge = document.getElementById('organizer-rsvp-cloud-status');
            if (cloudBadge) {
              cloudBadge.innerHTML = '<span class="live-dot pulse" style="background: #2e7d32;"></span> Live Cloud Sync Active';
              cloudBadge.style.color = '#2e7d32';
            }

            if (typeof this.renderRsvpDashboard === 'function') {
              this.renderRsvpDashboard();
            }
          }, (err) => {
            console.warn('[RSVP] Firebase listen notice:', err);
          });
        } catch (e) {
          console.warn('[RSVP] Firebase listen attach error:', e);
        }
      }
    }

    // Auto sync guest name from RSVP to Wishes Wall
    const rsvpNameInput = document.getElementById('rsvp-name');
    if (rsvpNameInput) {
      rsvpNameInput.addEventListener('input', () => {
        const wishName = document.getElementById('wish-name');
        if (wishName && (!wishName.value || wishName.value === WeddingState.guestName)) {
          wishName.value = rsvpNameInput.value;
        }
      });
    }
  }

  // 5.5. Wedding Wishes Wall Logic (with Realtime Firebase Cloud Sync)
  initWishesWall() {

    const defaultWishes = [];

    const getStoredWishes = () => {
      try {
        const stored = localStorage.getItem('wedding_wishes');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            return parsed;
          }
        }
      } catch (e) {}
      return [];
    };

    const saveWishes = (wishes) => {
      try {
        localStorage.setItem('wedding_wishes', JSON.stringify(wishes));
      } catch (e) {}
    };

    const getLikedMap = () => {
      try {
        return JSON.parse(localStorage.getItem('wedding_wish_likes') || '{}');
      } catch (e) {
        return {};
      }
    };

    const saveLikedMap = (map) => {
      try {
        localStorage.setItem('wedding_wish_likes', JSON.stringify(map));
      } catch (e) {}
    };

    let activeFilter = 'all';

    const getInitials = (name) => {
      if (!name) return '💌';
      const parts = name.trim().split(/\s+/);
      if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
      return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
    };

    const formatTime = (timestamp, fallbackTime) => {
      if (!timestamp) return fallbackTime || 'Recently';
      const diff = Date.now() - timestamp;
      if (diff < 60000) return 'Just now';
      if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
      if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
      if (diff < 604800000) return `${Math.floor(diff / 86400000)}d ago`;
      return new Date(timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    const renderWishes = () => {
      const wishes = getStoredWishes();
      const likedMap = getLikedMap();
      const stream = document.getElementById('wishes-stream');
      const countBadge = document.getElementById('wishes-count-badge');
      const organizerCountBadge = document.getElementById('organizer-wishes-tab-count');
      const organizerTotalWishes = document.getElementById('organizer-total-wishes-num');
      const organizerTotalLikes = document.getElementById('organizer-total-likes-num');

      // Update counters
      const totalCount = wishes.length;
      let totalLikes = 0;
      wishes.forEach(w => { totalLikes += (w.likes || 0); });

      if (countBadge) countBadge.textContent = `${totalCount} Warm Wish${totalCount === 1 ? '' : 'es'}`;
      if (organizerCountBadge) organizerCountBadge.textContent = totalCount;
      if (organizerTotalWishes) organizerTotalWishes.textContent = totalCount;
      if (organizerTotalLikes) organizerTotalLikes.textContent = totalLikes;

      if (!stream) return;

      const filtered = activeFilter === 'all'
        ? wishes
        : wishes.filter(w => (w.relation || 'Well-Wisher').toLowerCase() === activeFilter.toLowerCase());

      if (filtered.length === 0) {
        stream.innerHTML = `
          <div class="wishes-empty-state">
            <div style="font-size: 2.2rem; margin-bottom: 0.6rem;">💌</div>
            <p style="font-family: var(--font-serif); font-size: 1.12rem; color: var(--text-primary); margin-bottom: 0.35rem;">
              <strong>${activeFilter === 'all' ? 'The celebration wall is waiting for its first blessing!' : `No wishes under "${this.escapeHtml(activeFilter)}" yet.`}</strong>
            </p>
            <p style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.55;">
              Be the very first guest to send your love, advice, and blessings to Sashini &amp; Tharaka. 🤍✨
            </p>
          </div>
        `;
        return;
      }

      stream.innerHTML = filtered.map(wish => {
        const isLiked = !!likedMap[wish.id];
        const initials = getInitials(wish.name);
        const timeStr = formatTime(wish.timestamp, wish.time);
        const rel = wish.relation || 'Well-Wisher';

        return `
          <div class="wish-card" data-id="${this.escapeHtml(wish.id)}">
            <span class="wish-card-corner-quote">“</span>
            <div class="wish-header">
              <div class="wish-author-meta">
                <div class="wish-avatar" title="${this.escapeHtml(wish.name)}">${this.escapeHtml(initials)}</div>
                <div class="wish-author-info">
                  <span class="wish-author-name">${this.escapeHtml(wish.name)}</span>
                  <div class="wish-badges-row">
                    <span class="wish-relation-badge badge-${this.escapeHtml(rel)}">${this.escapeHtml(rel)}</span>
                  </div>
                </div>
              </div>
              <span class="wish-time">${this.escapeHtml(timeStr)}</span>
            </div>
            <div class="wish-body">
              ${this.escapeHtml(wish.message)}
            </div>
            <div class="wish-footer">
              <span class="wish-stamp-display" title="Blessing stamp">${wish.stamp || '🤍'}</span>
              <button type="button" class="wish-like-btn ${isLiked ? 'liked' : ''}" data-wish-id="${this.escapeHtml(wish.id)}" aria-label="Bless this wish">
                <span class="like-icon">${isLiked ? '❤️' : '🤍'}</span>
                <span class="like-label">Bless</span>
                <span class="like-count">(${wish.likes || 0})</span>
              </button>
            </div>
          </div>
        `;
      }).join('');

      // Bind like button clicks
      stream.querySelectorAll('.wish-like-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          const wishId = btn.getAttribute('data-wish-id');
          const currentWishes = getStoredWishes();
          const targetWish = currentWishes.find(w => w.id === wishId);
          if (!targetWish) return;

          const currentLiked = getLikedMap();
          let isNowLiked = false;
          if (currentLiked[wishId]) {
            targetWish.likes = Math.max(0, (targetWish.likes || 1) - 1);
            delete currentLiked[wishId];
            btn.classList.remove('liked');
            const icon = btn.querySelector('.like-icon');
            if (icon) icon.textContent = '🤍';
          } else {
            targetWish.likes = (targetWish.likes || 0) + 1;
            currentLiked[wishId] = true;
            isNowLiked = true;
            btn.classList.add('liked');
            btn.classList.add('animating');
            setTimeout(() => btn.classList.remove('animating'), 500);
            const icon = btn.querySelector('.like-icon');
            if (icon) icon.textContent = '❤️';
          }

          const countSpan = btn.querySelector('.like-count');
          if (countSpan) countSpan.textContent = `(${targetWish.likes || 0})`;

          saveWishes(currentWishes);
          saveLikedMap(currentLiked);

          // Sync likes to Firebase if available
          if (typeof WeddingFirebase !== 'undefined') {
            const db = WeddingFirebase.getDatabase();
            if (db) {
              try {
                db.ref('wishes/' + wishId + '/likes').transaction(curr => {
                  return Math.max(0, (curr || 0) + (isNowLiked ? 1 : -1));
                });
              } catch (err) {}
            }
          }

          let updatedLikes = 0;
          currentWishes.forEach(w => { updatedLikes += (w.likes || 0); });
          if (organizerTotalLikes) organizerTotalLikes.textContent = updatedLikes;
        });
      });
    };

    // Firebase Realtime Listener
    if (typeof WeddingFirebase !== 'undefined') {
      const db = WeddingFirebase.getDatabase();
      if (db) {
        try {
          const wishesRef = db.ref('wishes');
          wishesRef.on('value', (snapshot) => {
            const data = snapshot.val();
            let onlineWishes = [];
            if (data) {
              if (Array.isArray(data)) {
                onlineWishes = data.filter(Boolean);
              } else if (typeof data === 'object') {
                onlineWishes = Object.keys(data).map(k => ({
                  ...data[k],
                  id: data[k].id || k
                }));
              }
            }

            if (onlineWishes.length > 0) {
              // Automatically remove any legacy seed wishes
              onlineWishes.forEach(w => {
                if (w.id && w.id.startsWith('wish_seed_')) {
                  try { db.ref('wishes/' + w.id).remove(); } catch (e) {}
                }
              });
              const cleanedOnline = onlineWishes.filter(w => !w.id || !w.id.startsWith('wish_seed_'));
              cleanedOnline.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
              saveWishes(cleanedOnline);
            } else {
              saveWishes([]);
            }

            renderWishes();
            if (typeof this.renderOrganizerWishes === 'function') {
              this.renderOrganizerWishes();
            }
          }, (err) => {
            console.warn('[Wishes] Firebase listen notice:', err);
            renderWishes();
          });
        } catch (e) {
          console.warn('[Wishes] Firebase attach error:', e);
          renderWishes();
        }
      } else {
        renderWishes();
      }
    } else {
      renderWishes();
    }

    // Character Counter
    const messageInput = document.getElementById('wish-message');
    const charCounter = document.getElementById('wish-char-count');
    if (messageInput && charCounter) {
      messageInput.addEventListener('input', () => {
        const len = messageInput.value.length;
        charCounter.textContent = `${len} / 400`;
        if (len >= 380) {
          charCounter.style.color = '#c62828';
        } else {
          charCounter.style.color = 'var(--text-muted)';
        }
      });
    }

    // Quick Blessings Chips
    const chips = document.querySelectorAll('.blessing-chip');
    chips.forEach(chip => {
      chip.addEventListener('click', () => {
        const textToInsert = chip.getAttribute('data-text');
        if (!messageInput || !textToInsert) return;

        if (messageInput.value.trim()) {
          messageInput.value = messageInput.value.trim() + ' ' + textToInsert;
        } else {
          messageInput.value = textToInsert;
        }

        if (charCounter) {
          charCounter.textContent = `${messageInput.value.length} / 400`;
        }
        messageInput.focus();
      });
    });

    // Filter Buttons
    const filterBtns = document.querySelectorAll('.wish-filter-btn');
    const filterIndicator = document.getElementById('stream-filter-indicator');
    filterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        activeFilter = btn.getAttribute('data-filter') || 'all';
        if (filterIndicator) {
          filterIndicator.textContent = activeFilter === 'all' ? 'Showing: All' : `Showing: ${activeFilter}`;
        }
        renderWishes();
      });
    });

    // Wish Form Submit
    const wishForm = document.getElementById('wish-form');
    const successToast = document.getElementById('wish-success-toast');

    if (wishForm) {
      wishForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const nameInput = document.getElementById('wish-name');
        const relationRadio = document.querySelector('input[name="wish-relation"]:checked');
        const stampRadio = document.querySelector('input[name="wish-stamp"]:checked');

        const name = nameInput ? nameInput.value.trim() : '';
        const message = messageInput ? messageInput.value.trim() : '';
        const relation = relationRadio ? relationRadio.value : 'Well-Wisher';
        const stamp = stampRadio ? stampRadio.value : '🤍';

        if (!name || !message) return;

        const newWish = {
          id: 'wish_' + Date.now(),
          name,
          relation,
          stamp,
          message,
          time: 'Just now',
          timestamp: Date.now(),
          likes: 1
        };

        const currentWishes = getStoredWishes();
        currentWishes.unshift(newWish);
        saveWishes(currentWishes);

        // Sync to Firebase Realtime Database
        if (typeof WeddingFirebase !== 'undefined') {
          const db = WeddingFirebase.getDatabase();
          if (db) {
            try {
              db.ref('wishes/' + newWish.id).set(newWish).catch(err => {
                console.warn('[Wishes] Firebase write error:', err);
              });
            } catch (err) {}
          }
        }

        const likedMap = getLikedMap();
        likedMap[newWish.id] = true;
        saveLikedMap(likedMap);

        if (messageInput) {
          messageInput.value = '';
          if (charCounter) charCounter.textContent = '0 / 400';
        }

        if (successToast) {
          successToast.style.display = 'flex';
          setTimeout(() => {
            successToast.style.display = 'none';
          }, 4500);
        }

        renderWishes();

        const stream = document.getElementById('wishes-stream');
        if (stream) stream.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    // Direct WhatsApp Share from Wish Form
    const wishWaBtn = document.getElementById('wish-wa-share-btn');
    if (wishWaBtn) {
      wishWaBtn.addEventListener('click', () => {
        const nameInput = document.getElementById('wish-name');
        const relationRadio = document.querySelector('input[name="wish-relation"]:checked');
        const stampRadio = document.querySelector('input[name="wish-stamp"]:checked');

        let name = nameInput ? nameInput.value.trim() : '';
        let message = messageInput ? messageInput.value.trim() : '';
        const relation = relationRadio ? relationRadio.value : 'Family & Friends';
        const stamp = stampRadio ? stampRadio.value : '🤍';

        if (!name) name = WeddingState.guestName || 'Well-Wisher';
        if (!message) {
          message = "Wishing Sashini & Tharaka eternal happiness, infinite love, and boundless blessings on your wedding day! 🥂✨";
        }

        const waText = 
          `Dear Sashini & Tharaka 🤍\n\n` +
          `*Wedding Wishes & Blessings*\n` +
          `━━━━━━━━━━━━━━━━━━━━\n` +
          `• From: ${name} (${relation})\n` +
          `• Blessing: ${stamp} ${message}\n` +
          `• Date: Friday, November 27, 2026\n` +
          `• Venue: Hotel Green Court, Homagama\n` +
          `━━━━━━━━━━━━━━━━━━━━\n\n` +
          `Can't wait to celebrate your special day! 🌸🥂`;

        window.open(`https://wa.me/94782304701?text=${encodeURIComponent(waText)}`, '_blank');
      });
    }

    // Clear All Wishes in Organizer Dashboard
    const resetBtn = document.getElementById('reset-wishes-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all wishes from the wall?')) {
          if (typeof WeddingFirebase !== 'undefined') {
            const db = WeddingFirebase.getDatabase();
            if (db) {
              try { db.ref('wishes').remove(); } catch (e) {}
            }
          }
          localStorage.setItem('wedding_wishes', JSON.stringify([]));
          localStorage.setItem('wedding_wish_likes', '{}');
          renderWishes();
          this.renderOrganizerWishes();
        }
      });
    }

    // Initial render
    renderWishes();
  }

  // 6. Share & Personalized Guest Link Generator Modal
  initShareModal() {
    const shareBtn = document.getElementById('quick-share-btn');
    const modal = document.getElementById('share-modal');
    const closeBtn = document.getElementById('close-share-modal');
    const backdrop = document.getElementById('share-modal-backdrop');
    
    // Generator elements
    const guestInput = document.getElementById('share-guest-input');
    const clearGuestBtn = document.getElementById('clear-guest-input-btn');
    const targetBadge = document.getElementById('share-link-target-badge');
    const generatedUrlText = document.getElementById('share-generated-url');
    const shareWaBtn = document.getElementById('share-wa-direct-btn');
    const shareWaTitle = document.getElementById('share-wa-btn-title');
    const shareWaSub = document.getElementById('share-wa-btn-subtitle');
    const copyBtn = document.getElementById('copy-share-link-btn');
    const testBtn = document.getElementById('test-share-link-btn');
    const togglePreview = document.getElementById('toggle-msg-preview');
    const msgPreviewBody = document.getElementById('share-msg-preview-body');
    const copyToast = document.getElementById('copy-toast-msg');

    // Get clean base URL (without existing ?g= params)
    const getBaseUrl = () => {
      const url = new URL(window.location.href);
      url.search = '';
      url.hash = '';
      return url.toString();
    };

    const generatePayload = () => {
      const baseUrl = getBaseUrl();
      const guestName = guestInput ? guestInput.value.trim() : '';
      let targetUrl = baseUrl;
      let salutation = 'Dear Family & Friends 🌸';

      if (guestName) {
        targetUrl = `${baseUrl}?g=${encodeURIComponent(guestName)}`;
        salutation = `Dear ${guestName} 🌸`;
      }

      const waMessage = 
        `${salutation}\n\n` +
        `With hearts full of love and happiness, we’re delighted to invite you to celebrate the wedding that marks the beginning of our journey together. 🤍\n\n` +
        `It would truly mean the world to us to have you by our side on this very special day.\n\n` +
        `Wedding Invitation:\n${targetUrl}\n\n` +
        `We can’t wait to celebrate, share laughter, and create beautiful memories with you! ✨\n\n` +
        `With love,\nSashini & Tharaka 🤍`;

      return { guestName, targetUrl, salutation, waMessage };
    };

    const updateUI = () => {
      const { guestName, targetUrl, waMessage } = generatePayload();

      if (targetBadge) {
        targetBadge.textContent = guestName ? `For: ${guestName}` : 'For: Family & Friends';
      }

      if (generatedUrlText) {
        generatedUrlText.textContent = targetUrl;
      }

      if (shareWaTitle) {
        shareWaTitle.textContent = guestName ? `Send to ${guestName} via WhatsApp` : 'Send via WhatsApp';
      }

      if (shareWaSub) {
        shareWaSub.textContent = guestName ? `Opens WhatsApp with personalized invitation for ${guestName}` : 'Send general invitation link';
      }

      if (msgPreviewBody) {
        msgPreviewBody.innerHTML = waMessage.replace(/\n/g, '<br>');
      }
    };

    if (shareBtn && modal) {
      shareBtn.addEventListener('click', () => {
        modal.classList.add('open');
        updateUI();
        if (guestInput) {
          setTimeout(() => guestInput.focus(), 150);
        }
      });
    }

    const closeModal = () => {
      if (modal) modal.classList.remove('open');
      if (copyToast) copyToast.style.display = 'none';
    };

    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    if (backdrop) backdrop.addEventListener('click', closeModal);

    if (guestInput) {
      guestInput.addEventListener('input', updateUI);
    }

    if (clearGuestBtn && guestInput) {
      clearGuestBtn.addEventListener('click', () => {
        guestInput.value = '';
        updateUI();
        guestInput.focus();
      });
    }

    if (shareWaBtn) {
      shareWaBtn.addEventListener('click', () => {
        const { waMessage } = generatePayload();
        window.open(`https://wa.me/?text=${encodeURIComponent(waMessage)}`, '_blank');
      });
    }

    if (copyBtn) {
      copyBtn.addEventListener('click', () => {
        const { targetUrl } = generatePayload();
        navigator.clipboard.writeText(targetUrl).then(() => {
          if (copyToast) {
            copyToast.textContent = '✅ Link copied to clipboard!';
            copyToast.style.display = 'block';
            setTimeout(() => { copyToast.style.display = 'none'; }, 3000);
          }
        });
      });
    }

    if (testBtn) {
      testBtn.addEventListener('click', () => {
        const { targetUrl } = generatePayload();
        window.open(targetUrl, '_blank');
      });
    }

    if (togglePreview && msgPreviewBody) {
      togglePreview.addEventListener('click', () => {
        const isCollapsed = msgPreviewBody.style.display === 'none';
        msgPreviewBody.style.display = isCollapsed ? 'block' : 'none';
        const arrow = togglePreview.querySelector('.preview-arrow');
        if (arrow) arrow.textContent = isCollapsed ? '▾' : '▸';
      });
    }
  }

  // 8. Organizer Protected Dashboard
  initOrganizerDashboard() {
    const openBtn = document.getElementById('open-customizer-btn');
    const modal = document.getElementById('customize-modal');
    const closeBtn = document.getElementById('close-customizer-btn');
    const lockScreen = document.getElementById('organizer-lock-screen');
    const mainPanel = document.getElementById('organizer-main-panel');
    const pinForm = document.getElementById('organizer-pin-form');
    const pinInput = document.getElementById('organizer-pin-input');
    const pinError = document.getElementById('pin-error-msg');
    const lockBtn = document.getElementById('lock-organizer-btn');

    if (openBtn && modal) {
      openBtn.addEventListener('click', () => modal.classList.add('open'));
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => modal.classList.remove('open'));
    }

    if (pinForm) {
      pinForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (pinInput.value.trim() === WeddingState.adminPin) {
          if (lockScreen) lockScreen.style.display = 'none';
          if (mainPanel) mainPanel.style.display = 'block';
          if (pinError) pinError.style.display = 'none';
          if (typeof this.unlockHostMode === 'function') {
            this.unlockHostMode();
          }
          this.renderRsvpDashboard();
          this.renderOrganizerWishes();
        } else {
          if (pinError) pinError.style.display = 'block';
        }
      });
    }

    if (lockBtn) {
      lockBtn.addEventListener('click', () => {
        if (mainPanel) mainPanel.style.display = 'none';
        if (lockScreen) lockScreen.style.display = 'block';
        if (pinInput) pinInput.value = '';
        if (typeof this.lockHostMode === 'function') {
          this.lockHostMode();
        }
        if (modal) modal.classList.remove('open');
      });
    }

    // Tabs inside Organizer
    const tabs = document.querySelectorAll('.organizer-tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.getAttribute('data-tab');
        document.querySelectorAll('.organizer-tab-content').forEach(c => {
          c.style.display = (c.id === target) ? 'block' : 'none';
        });
        if (target === 'wishes-tab') {
          this.renderOrganizerWishes();
        }
      });
    });

    // Excel Export
    const exportBtn = document.getElementById('export-excel-btn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportRsvpCsv());
    }

    // Setup RSVP search input & filter buttons in Organizer Dashboard
    const rsvpSearchInput = document.getElementById('rsvp-search-input');
    if (rsvpSearchInput) {
      rsvpSearchInput.addEventListener('input', (e) => {
        this.rsvpSearchQuery = (e.target.value || '').toLowerCase().trim();
        this.renderRsvpDashboard();
      });
    }

    const rsvpFilterBtns = document.querySelectorAll('.rsvp-filter-btn');
    rsvpFilterBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        rsvpFilterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.rsvpFilterStatus = btn.getAttribute('data-status') || 'all';
        this.renderRsvpDashboard();
      });
    });

    // Guest Detail Modal Close handlers
    const detailModal = document.getElementById('guest-detail-modal');
    const closeDetailBtn = document.getElementById('close-guest-detail-btn');
    if (closeDetailBtn && detailModal) {
      closeDetailBtn.addEventListener('click', () => {
        detailModal.classList.remove('open');
        detailModal.style.display = 'none';
      });
      detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) {
          detailModal.classList.remove('open');
          detailModal.style.display = 'none';
        }
      });
    }

    // Tab 2: Personalized Link Generator inside Organizer Dashboard
    const customGuestInput = document.getElementById('personal-guest-name-input');
    const sendWaBtn = document.getElementById('send-personalized-wa-btn');
    const copyLinkBtn = document.getElementById('copy-personalized-link-btn');
    const previewLinkBtn = document.getElementById('preview-personalized-link-btn');
    const personalTargetBadge = document.getElementById('personal-link-target-badge');
    const personalUrlText = document.getElementById('personal-generated-url');
    const personalCopyToast = document.getElementById('personal-copy-toast');

    const getBaseUrl = () => {
      const url = new URL(window.location.href);
      url.search = '';
      url.hash = '';
      return url.toString();
    };

    const getPayload = () => {
      const baseUrl = getBaseUrl();
      const guestName = customGuestInput ? customGuestInput.value.trim() : '';
      let targetUrl = baseUrl;
      let salutation = 'Dear Family & Friends 🌸';

      if (guestName) {
        targetUrl = `${baseUrl}?g=${encodeURIComponent(guestName)}`;
        salutation = `Dear ${guestName} 🌸`;
      }

      const waMessage = 
        `${salutation}\n\n` +
        `With hearts full of love and happiness, we’re delighted to invite you to celebrate the wedding that marks the beginning of our journey together. 🤍\n\n` +
        `It would truly mean the world to us to have you by our side on this very special day.\n\n` +
        `Wedding Invitation:\n${targetUrl}\n\n` +
        `We can’t wait to celebrate, share laughter, and create beautiful memories with you! ✨\n\n` +
        `With love,\nSashini & Tharaka 🤍`;

      return { guestName, targetUrl, salutation, waMessage };
    };

    const updatePersonalUI = () => {
      const { guestName, targetUrl } = getPayload();
      if (personalTargetBadge) {
        personalTargetBadge.textContent = guestName ? `For: ${guestName}` : 'For: Family & Friends';
      }
      if (personalUrlText) {
        personalUrlText.textContent = targetUrl;
      }
    };

    if (customGuestInput) {
      customGuestInput.addEventListener('input', updatePersonalUI);
      updatePersonalUI();
    }

    if (sendWaBtn) {
      sendWaBtn.addEventListener('click', () => {
        const { waMessage } = getPayload();
        window.open(`https://wa.me/?text=${encodeURIComponent(waMessage)}`, '_blank');
      });
    }

    if (copyLinkBtn) {
      copyLinkBtn.addEventListener('click', () => {
        const { targetUrl } = getPayload();
        navigator.clipboard.writeText(targetUrl).then(() => {
          if (personalCopyToast) {
            personalCopyToast.style.display = 'block';
            setTimeout(() => { personalCopyToast.style.display = 'none'; }, 2500);
          } else {
            alert('Personalized invitation link copied!');
          }
        });
      });
    }

    if (previewLinkBtn) {
      previewLinkBtn.addEventListener('click', () => {
        const { targetUrl } = getPayload();
        window.open(targetUrl, '_blank');
      });
    }

    // Tab 3: Customizer Form
    const customForm = document.getElementById('customizer-form');
    if (customForm) {
      customForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const newPinInput = document.getElementById('custom-admin-pin');
        if (newPinInput && newPinInput.value.trim()) {
          WeddingState.adminPin = newPinInput.value.trim();
          localStorage.setItem('wedding_admin_pin', WeddingState.adminPin);
          newPinInput.value = '';
          alert('Security PIN updated successfully!');
        } else {
          alert('Details saved successfully!');
        }
      });
    }
  }

  renderRsvpDashboard() {
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
    } catch (e) {
      list = [];
    }

    const totalHeadcountEl = document.getElementById('total-attending-headcount');
    const acceptedCountEl = document.getElementById('total-accepted-count');
    const declinedCountEl = document.getElementById('total-declined-count');
    const tbody = document.getElementById('rsvp-table-body');
    const countBadge = document.getElementById('rsvp-table-count');
    const filterAllCount = document.getElementById('filter-count-all');
    const filterYesCount = document.getElementById('filter-count-yes');
    const filterNoCount = document.getElementById('filter-count-no');

    let totalHeadcount = 0;
    let accepted = 0;
    let declined = 0;

    list.forEach(item => {
      if (item.attending === 'yes') {
        accepted++;
        totalHeadcount += parseInt(item.guestCount || '1', 10);
      } else {
        declined++;
      }
    });

    if (totalHeadcountEl) totalHeadcountEl.textContent = totalHeadcount;
    if (acceptedCountEl) acceptedCountEl.textContent = accepted;
    if (declinedCountEl) declinedCountEl.textContent = declined;
    if (countBadge) countBadge.textContent = list.length;
    if (filterAllCount) filterAllCount.textContent = list.length;
    if (filterYesCount) filterYesCount.textContent = accepted;
    if (filterNoCount) filterNoCount.textContent = declined;

    // Filter by status and search query
    let filtered = list;
    if (this.rsvpFilterStatus && this.rsvpFilterStatus !== 'all') {
      filtered = filtered.filter(item => item.attending === this.rsvpFilterStatus);
    }
    if (this.rsvpSearchQuery) {
      const q = this.rsvpSearchQuery;
      filtered = filtered.filter(item => {
        const name = (item.name || '').toLowerCase();
        const contact = (item.contact || '').toLowerCase();
        return name.includes(q) || contact.includes(q);
      });
    }

    if (!tbody) return;
    tbody.innerHTML = '';

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" style="text-align: center; color: var(--text-muted); padding: 1.8rem;">
            ${list.length === 0 ? 'No RSVPs recorded yet. Responses will appear here live as guests submit.' : 'No RSVPs match your search/filter.'}
          </td>
        </tr>
      `;
      return;
    }

    filtered.forEach((item, index) => {
      const isAttending = item.attending === 'yes';
      const cleanPhone = (item.contact || '').replace(/[^0-9]/g, '');
      const waPhone = cleanPhone ? (cleanPhone.startsWith('0') ? '94' + cleanPhone.slice(1) : cleanPhone) : '';
      const rawIdx = list.indexOf(item);

      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td>
          <div style="font-weight: 600; color: var(--text-primary);">${this.escapeHtml(item.name)}</div>
        </td>
        <td>
          <div style="display: flex; align-items: center; gap: 0.35rem; flex-wrap: nowrap;">
            <a href="https://wa.me/${waPhone}" target="_blank" title="Chat on WhatsApp" class="table-contact-link wa-link">
              💬 ${this.escapeHtml(item.contact || 'N/A')}
            </a>
            ${cleanPhone ? `<a href="tel:${cleanPhone}" title="Call Guest" class="table-contact-link call-link">📞</a>` : ''}
          </div>
        </td>
        <td>
          <span class="${isAttending ? 'badge-accepted' : 'badge-declined'}">
            ${isAttending ? '✅ Accepted' : '❌ Declined'}
          </span>
        </td>
        <td>
          ${isAttending 
            ? `<span class="badge-count">${item.guestCount || 1} ${parseInt(item.guestCount || '1', 10) === 1 ? 'Guest' : 'Guests'}</span>` 
            : '<span style="color: var(--text-muted);">—</span>'}
        </td>
        <td style="white-space: nowrap; font-size: 0.72rem; color: var(--text-muted);">
          ${this.escapeHtml(item.time || 'Recent')}
        </td>
        <td>
          <div style="display: flex; gap: 0.3rem; align-items: center;">
            <button type="button" class="btn-rsvp-action btn-view-rsvp" data-rsvp-id="${this.escapeHtml(item.id || '')}" data-idx="${rawIdx}" title="View all details">
              👁️
            </button>
            <button type="button" class="btn-rsvp-action btn-del-rsvp" data-rsvp-id="${this.escapeHtml(item.id || '')}" data-idx="${rawIdx}" title="Delete this response">
              ✕
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });

    // View Details Modal handlers
    tbody.querySelectorAll('.btn-view-rsvp').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        const item = list[idx];
        if (!item) return;

        const isAttending = item.attending === 'yes';
        const cleanPhone = (item.contact || '').replace(/[^0-9]/g, '');
        const waPhone = cleanPhone ? (cleanPhone.startsWith('0') ? '94' + cleanPhone.slice(1) : cleanPhone) : '';

        const modal = document.getElementById('guest-detail-modal');
        const iconEl = document.getElementById('detail-modal-status-icon');
        const nameEl = document.getElementById('detail-modal-name');
        const badgeEl = document.getElementById('detail-modal-status-badge');
        const countEl = document.getElementById('detail-modal-count');
        const phoneEl = document.getElementById('detail-modal-phone');
        const timeEl = document.getElementById('detail-modal-time');
        const waBtn = document.getElementById('detail-modal-wa-btn');
        const callBtn = document.getElementById('detail-modal-call-btn');

        if (iconEl) iconEl.textContent = isAttending ? '🎉' : '💐';
        if (nameEl) nameEl.textContent = item.name;
        if (badgeEl) {
          badgeEl.className = isAttending ? 'badge-accepted' : 'badge-declined';
          badgeEl.textContent = isAttending ? '✅ Joyfully Attending' : '❌ Regretfully Declined';
        }
        if (countEl) countEl.textContent = isAttending ? `${item.guestCount || 1} Guest(s)` : '0 (Declined)';
        if (phoneEl) phoneEl.textContent = item.contact || 'N/A';
        if (timeEl) timeEl.textContent = item.time || 'N/A';

        if (waBtn) {
          const defaultMsg = encodeURIComponent(`Hi ${item.name}! 🌸 Thank you for confirming your attendance for Sashini & Tharaka's wedding.`);
          waBtn.href = waPhone ? `https://wa.me/${waPhone}?text=${defaultMsg}` : '#';
          waBtn.style.display = waPhone ? 'inline-flex' : 'none';
        }
        if (callBtn) {
          callBtn.href = cleanPhone ? `tel:${cleanPhone}` : '#';
          callBtn.style.display = cleanPhone ? 'inline-flex' : 'none';
        }

        if (modal) {
          modal.style.display = 'flex';
          modal.classList.add('open');
        }
      });
    });

    // Delete RSVP handlers
    tbody.querySelectorAll('.btn-del-rsvp').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-idx'), 10);
        const rsvpId = btn.getAttribute('data-rsvp-id');
        const item = list[idx];
        const name = item ? item.name : 'this guest';

        if (confirm(`Delete RSVP response for "${name}"?`)) {
          if (rsvpId && typeof WeddingFirebase !== 'undefined') {
            const db = WeddingFirebase.getDatabase();
            if (db) {
              try { db.ref('rsvps/' + rsvpId).remove(); } catch (e) {}
            }
          }
          list.splice(idx, 1);
          localStorage.setItem('wedding_rsvps', JSON.stringify(list));
          this.renderRsvpDashboard();
        }
      });
    });

    // Clear All button handler
    const clearAllBtn = document.getElementById('clear-all-rsvps-btn');
    if (clearAllBtn) {
      clearAllBtn.onclick = () => {
        if (confirm('Are you sure you want to clear ALL RSVPs? This will delete all responses permanently from both cloud and local storage.')) {
          if (typeof WeddingFirebase !== 'undefined') {
            const db = WeddingFirebase.getDatabase();
            if (db) {
              try { db.ref('rsvps').remove(); } catch (e) {}
            }
          }
          localStorage.removeItem('wedding_rsvps');
          this.renderRsvpDashboard();
        }
      };
    }
  }

  exportRsvpCsv() {
    let list = [];
    try {
      list = JSON.parse(localStorage.getItem('wedding_rsvps') || '[]');
    } catch (e) {
      list = [];
    }

    if (!list.length) {
      alert('No RSVPs recorded yet to export.');
      return;
    }

    let csv = "Guest Name,Contact Number,Attendance Status,Attending Guests,Registration Date & Time\n";
    list.forEach(r => {
      const name = (r.name || '').replace(/"/g, '""');
      const contact = (r.contact || '').replace(/"/g, '""');
      const status = r.attending === 'yes' ? 'Joyfully Accept' : 'Regretfully Decline';
      const count = r.attending === 'yes' ? (r.guestCount || 1) : 0;
      const time = (r.time || '').replace(/"/g, '""');
      csv += `"${name}","${contact}","${status}","${count}","${time}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Sashini_Tharaka_Wedding_RSVPs_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Render Wishes in Organizer Dashboard
  renderOrganizerWishes() {
    const listEl = document.getElementById('organizer-wishes-list');
    const totalWishesNum = document.getElementById('organizer-total-wishes-num');
    const totalLikesNum = document.getElementById('organizer-total-likes-num');
    const tabCount = document.getElementById('organizer-wishes-tab-count');

    let storedWishes = [];
    try {
      storedWishes = JSON.parse(localStorage.getItem('wedding_wishes') || '[]');
    } catch (e) {
      storedWishes = [];
    }

    let totalLikes = 0;
    storedWishes.forEach(w => { totalLikes += (w.likes || 0); });

    if (totalWishesNum) totalWishesNum.textContent = storedWishes.length;
    if (tabCount) tabCount.textContent = storedWishes.length;
    if (totalLikesNum) totalLikesNum.textContent = totalLikes;

    // Firebase Cloud Database URL config in Organizer Dashboard
    const dbUrlInput = document.getElementById('firebase-db-url-input');
    const saveDbBtn = document.getElementById('save-firebase-config-btn');
    const cloudStatusBadge = document.getElementById('organizer-cloud-status-badge');

    if (typeof WeddingFirebase !== 'undefined') {
      const cfg = WeddingFirebase.getConfig();
      if (dbUrlInput && cfg && cfg.databaseURL && !dbUrlInput.value) {
        dbUrlInput.value = cfg.databaseURL;
      }
      if (cloudStatusBadge) {
        const isOnline = WeddingFirebase.getStatus() === 'connected';
        cloudStatusBadge.textContent = isOnline ? '🟢 Live Sync Active' : '🟡 Local Mode';
        cloudStatusBadge.style.color = isOnline ? '#2e7d32' : '#b27b16';
        cloudStatusBadge.style.background = isOnline ? 'rgba(46, 125, 50, 0.15)' : 'rgba(216, 155, 35, 0.15)';
      }

      if (saveDbBtn && !saveDbBtn.dataset.bound) {
        saveDbBtn.dataset.bound = 'true';
        saveDbBtn.addEventListener('click', () => {
          const val = dbUrlInput ? dbUrlInput.value.trim() : '';
          if (val) {
            WeddingFirebase.saveConfig({ databaseURL: val });
            WeddingFirebase.init();
            const toast = document.getElementById('firebase-save-toast');
            if (toast) {
              toast.style.display = 'inline';
              setTimeout(() => { toast.style.display = 'none'; }, 3500);
            }
            if (cloudStatusBadge) {
              cloudStatusBadge.textContent = '🟢 Live Sync Active';
              cloudStatusBadge.style.color = '#2e7d32';
              cloudStatusBadge.style.background = 'rgba(46, 125, 50, 0.15)';
            }
            if (typeof this.initWishesWall === 'function') {
              this.initWishesWall();
            }
          }
        });
      }
    }

    if (!listEl) return;

    if (storedWishes.length === 0) {
      listEl.innerHTML = '<div style="text-align: center; color: var(--text-muted); padding: 1.5rem;">No wishes on the wall yet.</div>';
      return;
    }

    listEl.innerHTML = storedWishes.map((w, idx) => `
      <div class="organizer-wish-item">
        <div class="organizer-wish-details">
          <strong>${this.escapeHtml(w.name)}</strong>
          <span class="wish-relation-badge badge-${this.escapeHtml(w.relation || 'Well-Wisher')}" style="margin-left: 0.4rem;">
            ${this.escapeHtml(w.relation || 'Well-Wisher')}
          </span>
          <div class="organizer-wish-meta">
            Stamp: ${w.stamp || '🤍'} • Likes: ${w.likes || 0} • ${this.escapeHtml(w.time || 'Recent')}
          </div>
          <div class="organizer-wish-text">"${this.escapeHtml(w.message)}"</div>
        </div>
        <button type="button" class="btn-delete-wish" data-wish-id="${this.escapeHtml(w.id || '')}" data-wish-idx="${idx}" title="Delete this message">
          ✕ Delete
        </button>
      </div>
    `).join('');

    listEl.querySelectorAll('.btn-delete-wish').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-wish-idx'), 10);
        const wishId = btn.getAttribute('data-wish-id');
        if (confirm('Delete this wish from the wall?')) {
          if (wishId && typeof WeddingFirebase !== 'undefined') {
            const db = WeddingFirebase.getDatabase();
            if (db) {
              try { db.ref('wishes/' + wishId).remove(); } catch (e) {}
            }
          }
          storedWishes.splice(idx, 1);
          localStorage.setItem('wedding_wishes', JSON.stringify(storedWishes));
          this.renderOrganizerWishes();
          if (typeof this.initWishesWall === 'function') {
            this.initWishesWall();
          }
        }
      });
    });
  }

  // 9. Canvas Floating Pearl Dust & Gentle Petals
  initParticleCanvas() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    window.addEventListener('resize', () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    });

    const particles = [];
    const count = 35;

    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 3 + 1.2,
        speedY: Math.random() * 0.6 + 0.25,
        speedX: (Math.random() - 0.5) * 0.4,
        alpha: Math.random() * 0.45 + 0.15,
        color: ['#9ed4aa', '#be9fe2', '#a88bd4', '#ffffff', '#e8d3b0'][Math.floor(Math.random() * 5)]
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, width, height);

      particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;

        if (p.y > height) {
          p.y = -10;
          p.x = Math.random() * width;
        }

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
      });

      ctx.globalAlpha = 1.0;
      requestAnimationFrame(animate);
    };

    animate();
  }

  // 11. Scroll Animations
  initScrollAnimations() {
    const elements = document.querySelectorAll('.fade-in-element');
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    }, { threshold: 0.12 });

    elements.forEach(el => observer.observe(el));
  }

  escapeHtml(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
  window.weddingApp = new WeddingApp();
});
