/**
 * CampX speed dial — hold / swipe / tap pill to open, tap destination to navigate.
 * Configure via <html data-campx-nav="college|community|explore|swift|settings"
 *            data-campx-pill="Optional pill label override (e.g. Profile when inside Settings)">
 */
(function () {
  const NAV_ITEMS = [
    {
      id: "college",
      label: "College",
      href: "/college-feed",
      icon:
        '<svg viewBox="0 0 24 24"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    },
    {
      id: "community",
      label: "Community",
      href: "/communities",
      icon:
        '<svg viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
    },
    {
      id: "explore",
      label: "Explore",
      href: "/explore-feed",
      icon:
        '<svg viewBox="0 0 24 24"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>',
    },
    {
      id: "swift",
      label: "Swift Zone",
      href: "/swift-zone",
      icon:
        '<svg viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>',
    },
    {
      id: "settings",
      label: "Settings",
      href: "/settings",
      icon:
        '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>',
    },
  ];

  const FAN_POSITIONS = [
    { x: -164, y: 110 },
    { x: -84, y: 168 },
    { x: 0, y: 190 },
    { x: 84, y: 168 },
    { x: 164, y: 110 },
  ];

  const phone = document.querySelector(".phone");
  const pill = document.getElementById("campx-navPill");
  if (!phone || !pill) return;

  const backdrop = document.getElementById("campx-backdrop");
  const speedDial = document.getElementById("campx-speedDial");
  const holdHint = document.getElementById("campx-holdHint");
  if (!speedDial) return;
  const pillLabel = document.getElementById("campx-pillLabel");
  const screenChip = document.getElementById("campx-screenChip");

  const root = document.documentElement;
  const navId = (root.dataset.campxNav || "").trim();
  const pillOverride = (root.dataset.campxPill || "").trim();

  const match = NAV_ITEMS.find((n) => n.id === navId);
  if (pillLabel) {
    pillLabel.textContent = pillOverride || match?.label || NAV_ITEMS[0].label;
  }
  if (screenChip) {
    screenChip.textContent = pillOverride || match?.label || NAV_ITEMS[0].label;
  }

  let dialOpen = false;
  let holdHintTimer = null;
  let holdOpenTimer = null;
  let isHolding = false;
  let touchStartY = 0;
  let hasOpened = false;

  function getDialItem(id) {
    return document.getElementById("campx-dial-" + id);
  }

  NAV_ITEMS.forEach((item, i) => {
    const el = document.createElement("div");
    el.className = "dial-item" + (item.id === navId ? " active-nav" : "");
    el.id = "campx-dial-" + item.id;
    el.style.left = "50%";
    el.style.bottom = "0px";
    el.style.transitionDelay = `${(NAV_ITEMS.length - 1 - i) * 0.03}s`;
    el.innerHTML =
      '<button type="button" class="dial-btn" aria-label="' +
      item.label +
      '">' +
      item.icon +
      '</button><div class="dial-lbl">' +
      item.label +
      "</div>";
    el.querySelector(".dial-btn").addEventListener("click", () => selectNav(item));
    speedDial.appendChild(el);
  });

  function openDial() {
    if (dialOpen) return;
    dialOpen = true;
    if (backdrop) backdrop.classList.add("open");
    if (speedDial) speedDial.classList.add("open");
    NAV_ITEMS.forEach((item, i) => {
      const el = getDialItem(item.id);
      const pos = FAN_POSITIONS[i];
      el.style.left = `calc(50% + ${pos.x}px)`;
      el.style.bottom = `${pos.y}px`;
      el.style.transitionDelay = `${i * 0.05}s`;
      el.offsetHeight;
      el.classList.add("visible");
    });
    if (holdHint) holdHint.classList.remove("visible");
    pill.classList.remove("held");
  }

  function closeDial() {
    if (!dialOpen) return;
    dialOpen = false;
    if (backdrop) backdrop.classList.remove("open");
    if (speedDial) speedDial.classList.remove("open");
    NAV_ITEMS.forEach((item, i) => {
      const el = getDialItem(item.id);
      el.style.transitionDelay = `${(NAV_ITEMS.length - 1 - i) * 0.03}s`;
      el.classList.remove("visible");
    });
    pill.classList.remove("held");
  }

  window.campxCloseDial = closeDial;

  function selectNav(item) {
    closeDial();
    if (item.href) {
      window.location.href = item.href;
    }
  }

  if (backdrop) {
    backdrop.addEventListener("click", closeDial);
  }

  pill.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    touchStartY = e.clientY;
    isHolding = false;
    hasOpened = false;
    pill.classList.add("held");
    clearTimeout(holdHintTimer);
    clearTimeout(holdOpenTimer);
    holdHintTimer = setTimeout(() => {
      if (holdHint) holdHint.classList.add("visible");
    }, 200);
    holdOpenTimer = setTimeout(() => {
      isHolding = true;
      if (!dialOpen) openDial();
      hasOpened = true;
    }, 400);
    pill.setPointerCapture(e.pointerId);
  });

  pill.addEventListener("pointermove", (e) => {
    const dy = touchStartY - e.clientY;
    if (dy > 20 && !hasOpened) {
      clearTimeout(holdHintTimer);
      clearTimeout(holdOpenTimer);
      isHolding = true;
      hasOpened = true;
      if (!dialOpen) openDial();
    }
  });

  pill.addEventListener("pointerup", (e) => {
    clearTimeout(holdHintTimer);
    clearTimeout(holdOpenTimer);
    if (holdHint) holdHint.classList.remove("visible");
    pill.classList.remove("held");
    const dy = touchStartY - e.clientY;
    if (dy < 10 && !dialOpen && !hasOpened) {
      openDial();
    }
  });

  pill.addEventListener("pointercancel", () => {
    clearTimeout(holdHintTimer);
    clearTimeout(holdOpenTimer);
    pill.classList.remove("held");
    if (holdHint) holdHint.classList.remove("visible");
  });
})();
