/**
 * ============================================================
 *  app.js — Core Application Logic  (Sprint 3 / v3.0)
 *  Smart Hostel Management System
 * ============================================================
 *
 *  Module map:
 *  ──────────
 *  ThemeModule       — Dark / Light mode switcher with persistence
 *  MobileNavModule   — Responsive mobile drawer navigation
 *  AuthModule        — Login, simulated JWT, role-based access control
 *  TabModule         — Generic tab navigation
 *  RenderModule      — UI helpers (badges, stars, currency, formatting)
 *  AICategorizer     — AI Complaint Categorizer & Priority Detection
 *  SentimentAnalyzer — Automated NLP Sentiment Analysis for feedback
 *  SmartSearchModule — Natural Language search parser for Admin/Warden
 *  SafetyModule      — One-Click SOS Emergency dispatch & broadcast
 *  GatePassModule    — Digital boarding-pass generator with embedded QR
 *  ExportModule      — CSV export & print-to-PDF reports
 *  StudentModule     — Student dashboard (9 tabs, photo tickets, feedback)
 *  ChatbotModule     — In-tab intelligent AI FAQ assistant
 *  AIAssistantModule — Floating AI widget available on all pages
 *  AdminModule       — Warden & Admin portal (8 tabs, Notice Generator,
 *                      Sentiment Breakdown, Smart Search, Reports)
 *  SecurityModule    — Security guard portal (QR Verifier & Visitor Log)
 *  LoginModule       — login.html form & 4-role tab handling
 *  bootstrap()       — Universal page router
 *
 *  GEMINI API INTEGRATION:
 *    Search "── GEMINI API HOOK ──" to connect live Gemini AI models.
 * ============================================================
 */

"use strict";


// ─────────────────────────────────────────────────────────────
//  THEME MODULE — Dark / Light Mode with localStorage Memory
// ─────────────────────────────────────────────────────────────
const ThemeModule = {
  THEME_KEY: "hms_theme",

  init() {
    const saved = localStorage.getItem(this.THEME_KEY) || "light";
    this.apply(saved);

    document.querySelectorAll(".theme-toggle-btn").forEach(btn => {
      btn.addEventListener("click", () => this.toggle());
    });
  },

  apply(theme) {
    if (theme === "dark") {
      document.documentElement.setAttribute("data-theme", "dark");
      document.body.classList.add("dark-theme");
    } else {
      document.documentElement.removeAttribute("data-theme");
      document.body.classList.remove("dark-theme");
    }

    document.querySelectorAll(".theme-toggle-btn").forEach(btn => {
      const isDark = theme === "dark";
      btn.innerHTML = isDark ? `☀️ <span class="theme-label">Light</span>` : `🌙 <span class="theme-label">Dark</span>`;
      btn.setAttribute("title", isDark ? "Switch to Light Mode" : "Switch to Dark Mode");
    });
  },

  toggle() {
    const current = localStorage.getItem(this.THEME_KEY) || "light";
    const next = current === "dark" ? "light" : "dark";
    localStorage.setItem(this.THEME_KEY, next);
    this.apply(next);
  }
};


// ─────────────────────────────────────────────────────────────
//  MOBILE NAV MODULE — Responsive Hamburger Navigation
// ─────────────────────────────────────────────────────────────
const MobileNavModule = {
  init() {
    const btn = document.getElementById("mobileMenuBtn");
    const sidebar = document.querySelector(".sidebar");
    if (!btn || !sidebar) return;

    // Create backdrop if not existing
    let backdrop = document.querySelector(".sidebar-backdrop");
    if (!backdrop) {
      backdrop = document.createElement("div");
      backdrop.className = "sidebar-backdrop";
      backdrop.style.display = "none";
      document.body.appendChild(backdrop);
    }

    const openMenu = () => {
      sidebar.classList.add("mobile-open");
      backdrop.style.display = "block";
    };

    const closeMenu = () => {
      sidebar.classList.remove("mobile-open");
      backdrop.style.display = "none";
    };

    btn.addEventListener("click", () => {
      if (sidebar.classList.contains("mobile-open")) closeMenu();
      else openMenu();
    });

    backdrop.addEventListener("click", closeMenu);

    // Auto-close sidebar on tab selection in mobile
    document.querySelectorAll(".sidebar .tab-btn").forEach(t => {
      t.addEventListener("click", () => {
        if (window.innerWidth <= 768) closeMenu();
      });
    });
  }
};


// ─────────────────────────────────────────────────────────────
//  AUTH MODULE  (RBAC + Simulated JWT)
// ─────────────────────────────────────────────────────────────
const AuthModule = {
  SESSION_KEY: "hms_session",
  TOKEN_KEY:   "hms_token",
  TOKEN_TTL:   86400,

  _generateToken(user) {
    const now = Math.floor(Date.now() / 1000);
    const header  = { alg: "HS256-sim", typ: "JWT" };
    const payload = {
      sub:  user.id,
      name: user.name,
      role: user.role,
      iat:  now,
      exp:  now + this.TOKEN_TTL
    };
    return `${btoa(JSON.stringify(header))}.${btoa(JSON.stringify(payload))}.${btoa("hms-simulated-signature")}`;
  },

  verifyToken() {
    const raw = localStorage.getItem(this.TOKEN_KEY);
    if (!raw) return null;
    try {
      const parts = raw.split(".");
      if (parts.length !== 3) return null;
      const payload = JSON.parse(atob(parts[1]));
      if (Math.floor(Date.now() / 1000) > payload.exp) {
        localStorage.removeItem(this.TOKEN_KEY);
        return null;
      }
      return payload;
    } catch { return null; }
  },

  login(userId, password) {
    const users = StorageHelper.get("hms_users") || [];
    const user  = users.find(u => u.id === userId.trim() && u.password === password);
    if (!user) return null;

    const session = { id: user.id, name: user.name, role: user.role, roomNo: user.roomNo };
    sessionStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(this.TOKEN_KEY, this._generateToken(user));
    return user;
  },

  getSession() {
    const payload = this.verifyToken();
    if (payload) return { id: payload.sub, name: payload.name, role: payload.role };

    const raw = sessionStorage.getItem(this.SESSION_KEY);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  },

  logout() {
    sessionStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.TOKEN_KEY);
    window.location.href = "login.html";
  },

  requireAuth(allowedRoles) {
    const roles   = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
    const session = this.getSession();
    if (!session || !roles.includes(session.role)) {
      window.location.href = "login.html";
      return null;
    }
    return session;
  },

  redirectByRole(role) {
    const map = {
      student:  "student-dashboard.html",
      warden:   "admin-dashboard.html",
      admin:    "admin-dashboard.html",
      security: "security-dashboard.html"
    };
    window.location.href = map[role] || "login.html";
  }
};


// ─────────────────────────────────────────────────────────────
//  TAB MODULE
// ─────────────────────────────────────────────────────────────
const TabModule = {
  init(navSelector = ".tab-nav", panelSelector = ".tab-panel") {
    const tabs   = document.querySelectorAll(`${navSelector} .tab-btn`);
    const panels = document.querySelectorAll(panelSelector);

    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t   => t.classList.remove("active"));
        panels.forEach(p => p.classList.remove("active"));
        tab.classList.add("active");
        const panel = document.getElementById(tab.getAttribute("data-tab"));
        if (panel) panel.classList.add("active");
      });
    });

    if (tabs.length > 0 && !document.querySelector(`${navSelector} .tab-btn.active`)) {
      tabs[0].click();
    }
  },

  switchTo(tabId) {
    const btn = document.querySelector(`.tab-btn[data-tab="${tabId}"]`);
    if (btn) btn.click();
  }
};


// ─────────────────────────────────────────────────────────────
//  RENDER MODULE — Shared DOM Helpers
// ─────────────────────────────────────────────────────────────
const RenderModule = {
  badge(status) {
    const cls   = (status || "unknown").toLowerCase().replace(/[\s-]/g, "");
    return `<span class="badge badge-${cls}">${status || "Unknown"}</span>`;
  },
  priorityBadge(priority) {
    const cls = (priority || "low").toLowerCase();
    return `<span class="badge badge-${cls}">${priority}</span>`;
  },
  roleBadge(role) {
    const icons = { student: "🎓", warden: "🛡️", admin: "⚙️", security: "🔒" };
    return `<span class="badge badge-${role}">${icons[role] || "👤"} ${role}</span>`;
  },
  sentimentBadge(sentiment) {
    const s = (sentiment || "Neutral").toLowerCase();
    const config = {
      positive: { cls: "badge-positive", emoji: "😊", label: "Positive" },
      neutral:  { cls: "badge-neutral",  emoji: "😐", label: "Neutral" },
      negative: { cls: "badge-negative", emoji: "😡", label: "Negative" }
    };
    const c = config[s] || config.neutral;
    return `<span class="badge ${c.cls}">${c.emoji} ${c.label}</span>`;
  },
  stars(count) {
    const n = Math.max(1, Math.min(5, Number(count) || 5));
    return "⭐".repeat(n);
  },
  emptyState(icon = "📭", message = "No records found.") {
    return `<div class="empty-state"><div class="empty-icon">${icon}</div><p>${message}</p></div>`;
  },
  showFormMessage(el, type, text) {
    if (!el) return;
    el.textContent = text;
    el.className   = `form-message ${type}`;
    setTimeout(() => { el.className = "form-message"; }, 4000);
  },
  fmtCurrency(n) {
    return "₹" + Number(n).toLocaleString("en-IN");
  },
  fmtDateTime(str) {
    if (!str) return "—";
    return str.replace("T", " ").substring(0, 16);
  }
};


// ─────────────────────────────────────────────────────────────
//  AI CATEGORIZER MODULE  (Heuristic Classification & Urgency)
// ─────────────────────────────────────────────────────────────
const AICategorizer = {
  CATEGORIES: [
    {
      category: "Electrical",
      keywords: ["fan","switch","light","bulb","socket","wire","shock","spark","power",
                 "electricity","mcb","fuse","short circuit","trip","inverter","charging",
                 "voltage","heater","geyser","wiring","smoke","blackout"],
      urgencyKeywords: ["shock","spark","fire","short circuit","no power","tripped","smoke","blackout","burning"]
    },
    {
      category: "Plumbing",
      keywords: ["water","tap","pipe","leak","drain","toilet","flush","shower","overflow",
                 "blockage","clog","basin","sewage","pump","sink","geyser leak","tank",
                 "dripping","choked"],
      urgencyKeywords: ["flood","overflow","sewage","blocked","no water","burst","leaking heavily"]
    },
    {
      category: "Internet",
      keywords: ["wifi","wi-fi","internet","network","broadband","router","signal","speed",
                 "disconnect","connection","bandwidth","lag","ping","lan","ethernet","portal",
                 "hotspot","dns","offline"],
      urgencyKeywords: ["no internet","completely down","exam","offline"]
    },
    {
      category: "Cleaning",
      keywords: ["dirty","clean","hygiene","waste","garbage","trash","cockroach","rat","mouse",
                 "pest","smell","odour","mold","sweep","mop","dustbin","washroom","stain",
                 "spider","insects","sanitization","litter"],
      urgencyKeywords: ["cockroach","rat","sewage","mold","infestation","maggots","unhygienic"]
    },
    {
      category: "Carpentry",
      keywords: ["chair","table","desk","bed","shelf","wardrobe","cupboard","drawer","hinge",
                 "latch","door","window","lock","handle","wood","mattress","furniture",
                 "cabinet","bolt","plywood","almirah"],
      urgencyKeywords: ["broken lock","door jammed","window broken","unsafe","collapsed","falling"]
    }
  ],

  PRIORITY_HIGH_KEYWORDS: [
    "spark","smoke","flood","no water","fire","shock","electric shock","urgent","emergency",
    "immediately","broken lock","burst","critical","danger","dangerous","hazardous","unbearable",
    "infestation","completely down","cannot open","door jammed","heavy leak","burning"
  ],

  PRIORITY_LOW_KEYWORDS: [
    "minor","small","slight","sometimes","occasionally","can wait","low priority","whenever",
    "creaking","paint","cosmetic","loose screw","dusty"
  ],

  categorize(text) {
    const lower = (text || "").toLowerCase();
    let matched = "Electrical";
    let maxMatches = -1;

    for (const rule of this.CATEGORIES) {
      let count = 0;
      for (const kw of rule.keywords) {
        if (lower.includes(kw)) count += 1;
      }
      if (count > maxMatches) {
        maxMatches = count;
        matched = rule.category;
      }
    }

    if (maxMatches <= 0) {
      if (lower.includes("chair") || lower.includes("table") || lower.includes("door") || lower.includes("lock")) matched = "Carpentry";
      else if (lower.includes("leak") || lower.includes("water") || lower.includes("toilet")) matched = "Plumbing";
      else if (lower.includes("net") || lower.includes("wifi")) matched = "Internet";
      else if (lower.includes("clean") || lower.includes("smell") || lower.includes("waste")) matched = "Cleaning";
      else matched = "Electrical";
    }

    let priority = "Medium";
    for (const rule of this.CATEGORIES) {
      if (rule.category === matched && rule.urgencyKeywords.some(k => lower.includes(k))) {
        priority = "High";
        break;
      }
    }

    if (this.PRIORITY_HIGH_KEYWORDS.some(k => lower.includes(k))) {
      priority = "High";
    } else if (this.PRIORITY_LOW_KEYWORDS.some(k => lower.includes(k))) {
      priority = "Low";
    }

    return { category: matched, priority };
  }
};


// ─────────────────────────────────────────────────────────────
//  SENTIMENT ANALYZER MODULE  (Heuristic NLP for Feedback)
// ─────────────────────────────────────────────────────────────
const SentimentAnalyzer = {
  POSITIVE_WORDS: [
    "great","good","excellent","delicious","tasty","clean","fast","prompt","helpful","friendly",
    "awesome","love","best","satisfied","polite","comfortable","smooth","hygienic","cooperative",
    "improved","peaceful","punctual","superb","wonderful","appreciate","thank","safe","enjoy",
    "top","nice","well","refreshing","pleased"
  ],

  NEGATIVE_WORDS: [
    "bad","terrible","awful","poor","worst","dirty","slow","rude","broken","cold","delay",
    "disgusting","unhygienic","pathetic","noisy","smell","stink","pest","cockroach","bug","stale",
    "arrogant","ignored","unusable","leaking","horrible","harsh","waste","problem","useless",
    "angry","complaint","frustrated","uncomfortable","pain","disappointed","late","fail"
  ],

  analyze(text, rating = 4) {
    const lower = (text || "").toLowerCase();
    let posCount = 0;
    let negCount = 0;

    this.POSITIVE_WORDS.forEach(w => { if (lower.includes(w)) posCount++; });
    this.NEGATIVE_WORDS.forEach(w => { if (lower.includes(w)) negCount++; });

    let score = (posCount - negCount);
    const numRating = Number(rating) || 3;
    if (numRating >= 4) score += 1.5;
    else if (numRating <= 2) score -= 1.5;

    let sentiment = "Neutral";
    let emoji = "😐";
    let badgeClass = "badge-neutral";

    if (score > 0.5) {
      sentiment = "Positive";
      emoji = "😊";
      badgeClass = "badge-positive";
    } else if (score < -0.5) {
      sentiment = "Negative";
      emoji = "😡";
      badgeClass = "badge-negative";
    }

    return { sentiment, emoji, score, badgeClass, posCount, negCount };
  }
};


// ─────────────────────────────────────────────────────────────
//  SAFETY & EMERGENCY MODULE (One-Click SOS Dispatch & Alert)
// ─────────────────────────────────────────────────────────────
const SafetyModule = {
  STORAGE_KEY: "hms_sos_alerts",

  initStudent(session) {
    const btn = document.getElementById("sosEmergencyTriggerBtn");
    const modal = document.getElementById("sosIncidentModal");
    const closeBtn = document.getElementById("closeSosModalBtn");
    const form = document.getElementById("sosIncidentForm");

    if (btn && modal) {
      btn.addEventListener("click", () => {
        modal.style.display = "flex";
      });
    }

    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
      });
    }

    if (form) {
      form.addEventListener("submit", (e) => {
        e.preventDefault();
        const type = form.sosType.value;
        const details = form.sosDetails.value.trim();
        const now = new Date().toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" });

        const alerts = StorageHelper.get(this.STORAGE_KEY) || [];
        const newAlert = {
          id: `SOS-${Date.now()}`,
          studentId: session.id,
          studentName: session.name,
          roomNo: session.roomNo || "Campus",
          type,
          details: details || "Immediate assistance requested.",
          timestamp: `${new Date().toLocaleDateString("en-IN")} ${now}`,
          status: "Active"
        };

        alerts.unshift(newAlert);
        StorageHelper.set(this.STORAGE_KEY, alerts);

        // Close modal and alert
        modal.style.display = "none";
        form.reset();
        alert(`🚨 EMERGENCY BROADCASTED!\n\nIncident ID: ${newAlert.id}\nCategory: ${type}\nLocation: Room ${newAlert.roomNo}\n\nWarden & Security desks have been alerted with highest priority.`);
      });
    }
  },

  initAdminOrSecurity() {
    this.checkAndRenderBanner();

    // Listen to cross-tab storage updates
    window.addEventListener("storage", (e) => {
      if (e.key === this.STORAGE_KEY) {
        this.checkAndRenderBanner();
      }
    });
  },

  checkAndRenderBanner() {
    const banner = document.getElementById("emergencyAlertBanner");
    if (!banner) return;

    const alerts = StorageHelper.get(this.STORAGE_KEY) || [];
    const active = alerts.find(a => a.status === "Active");

    if (!active) {
      banner.style.display = "none";
      banner.innerHTML = "";
      return;
    }

    banner.style.display = "flex";
    banner.className = "emergency-broadcast-banner";
    banner.innerHTML = `
      <div class="emergency-banner-content">
        <span class="emergency-banner-icon">🚨</span>
        <div>
          <div style="font-weight:800;font-size:1.05rem;letter-spacing:0.5px;">ACTIVE EMERGENCY ALERT — IMMEDIATE DISPATCH REQUIRED</div>
          <div style="font-size:0.88rem;margin-top:2px;">
            <strong>${active.type}</strong> reported by <strong>${active.studentName}</strong> in <strong>Room ${active.roomNo}</strong> at ${active.timestamp}.
            ${active.details ? `<br><em>"${active.details}"</em>` : ""}
          </div>
        </div>
      </div>
      <div style="display:flex;gap:8px;align-items:center;">
        <button class="btn btn-sm" style="background:#fff;color:#991b1b;font-weight:700;" onclick="SafetyModule.acknowledgeAlert('${active.id}')">
          🛡️ Acknowledge &amp; Dispatch Guard
        </button>
        <button class="btn btn-sm btn-outline" style="border-color:#fecdd3;color:#fff;" onclick="SafetyModule.resolveAlert('${active.id}')">
          ✔ Mark Resolved
        </button>
      </div>`;
  },

  acknowledgeAlert(id) {
    const alerts = StorageHelper.get(this.STORAGE_KEY) || [];
    const alertItem = alerts.find(a => a.id === id);
    if (!alertItem) return;
    alertItem.status = "Acknowledged";
    StorageHelper.set(this.STORAGE_KEY, alerts);
    alert(`✅ Alert ${id} acknowledged. Security response unit dispatched to Room ${alertItem.roomNo}.`);
    this.checkAndRenderBanner();
  },

  resolveAlert(id) {
    const alerts = StorageHelper.get(this.STORAGE_KEY) || [];
    const alertItem = alerts.find(a => a.id === id);
    if (!alertItem) return;
    alertItem.status = "Resolved";
    StorageHelper.set(this.STORAGE_KEY, alerts);
    alert(`✅ Alert ${id} marked as resolved and logged in incident history.`);
    this.checkAndRenderBanner();
  }
};


// ─────────────────────────────────────────────────────────────
//  GATE PASS MODULE — Digital Boarding Pass & QR Generation
// ─────────────────────────────────────────────────────────────
const GatePassModule = {
  init() {
    const closeBtn = document.getElementById("closeGatePassModalBtn");
    const modal = document.getElementById("gatePassModal");
    if (closeBtn && modal) {
      closeBtn.addEventListener("click", () => {
        modal.style.display = "none";
      });
    }
  },

  /**
   * Generates a self-contained SVG QR code matrix (offline capable)
   */
  generateQR_SVG(text, size = 140) {
    // Generate an SVG matrix barcode representation with standard positioning squares
    const hash = Array.from(text).reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const cells = 21;
    const cellSize = size / cells;
    let rects = "";

    // Draw position detection squares (top-left, top-right, bottom-left)
    const drawFinder = (startX, startY) => {
      rects += `<rect x="${startX * cellSize}" y="${startY * cellSize}" width="${7 * cellSize}" height="${7 * cellSize}" fill="#0f172a"/>`;
      rects += `<rect x="${(startX + 1) * cellSize}" y="${(startY + 1) * cellSize}" width="${5 * cellSize}" height="${5 * cellSize}" fill="#fff"/>`;
      rects += `<rect x="${(startX + 2) * cellSize}" y="${(startY + 2) * cellSize}" width="${3 * cellSize}" height="${3 * cellSize}" fill="#0f172a"/>`;
    };

    drawFinder(0, 0);
    drawFinder(14, 0);
    drawFinder(0, 14);

    // Timing patterns
    for (let i = 8; i < 13; i++) {
      if (i % 2 === 0) {
        rects += `<rect x="${6 * cellSize}" y="${i * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0f172a"/>`;
        rects += `<rect x="${i * cellSize}" y="${6 * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0f172a"/>`;
      }
    }

    // Pseudorandom deterministic data cells based on text hash
    for (let r = 0; r < cells; r++) {
      for (let c = 0; c < cells; c++) {
        const isFinder = (r < 8 && (c < 8 || c > 12)) || (r > 12 && c < 8) || (r === 6 || c === 6);
        if (!isFinder) {
          const val = ((r * c + hash + r + c * 3) % 7);
          if (val === 0 || val === 2 || val === 5) {
            rects += `<rect x="${c * cellSize}" y="${r * cellSize}" width="${cellSize}" height="${cellSize}" fill="#0f172a"/>`;
          }
        }
      }
    }

    return `
      <svg width="${size}" height="${size}" viewBox="0 0 ${size}" class="pass-qr-code" style="background:#fff;padding:6px;border-radius:6px;">
        ${rects}
      </svg>`;
  },

  openPassModal(passId) {
    const modal = document.getElementById("gatePassModal");
    const body = document.getElementById("gatePassModalBody");
    if (!modal || !body) return;

    const passes = StorageHelper.get("hms_gatePasses") || [];
    const pass = passes.find(p => p.id === passId);
    if (!pass) {
      alert("Pass not found.");
      return;
    }

    const isApproved = pass.status === "approved" || pass.status === "checked-out" || pass.status === "returned";
    const qrSvg = this.generateQR_SVG(pass.qrId, 130);

    body.innerHTML = `
      <div class="printable-gatepass">
        <div class="pass-header">
          <div class="pass-brand">
            <span>🏨</span>
            <div>
              <div style="font-size:1.05rem;line-height:1.2;">Sunrise College Residence</div>
              <div style="font-size:0.75rem;color:#64748b;font-weight:600;">Official Resident Digital Gate Pass</div>
            </div>
          </div>
          <span class="pass-badge" style="background:${isApproved ? '#dcfce7;color:#15803d;' : '#fef3c7;color:#b45309;'}">
            ${pass.status.toUpperCase()}
          </span>
        </div>

        <div class="pass-grid">
          <div>
            <div class="pass-field-lbl">Student Name</div>
            <div class="pass-field-val">${pass.studentName}</div>
          </div>
          <div>
            <div class="pass-field-lbl">Student ID / Room</div>
            <div class="pass-field-val">${pass.studentId} · Room ${pass.roomNo}</div>
          </div>
          <div>
            <div class="pass-field-lbl">Pass Category</div>
            <div class="pass-field-val">${pass.type.toUpperCase()}</div>
          </div>
          <div>
            <div class="pass-field-lbl">Destination</div>
            <div class="pass-field-val">${pass.destination}</div>
          </div>
          <div>
            <div class="pass-field-lbl">Valid Departure</div>
            <div class="pass-field-val">${pass.fromDateTime}</div>
          </div>
          <div>
            <div class="pass-field-lbl">Expected Return</div>
            <div class="pass-field-val">${pass.toDateTime}</div>
          </div>
        </div>

        <div class="pass-qr-wrap">
          ${qrSvg}
          <div class="pass-qr-id">${pass.qrId}</div>
          <div style="font-size:0.75rem;color:#64748b;margin-top:2px;">Scan at Main Security Checkpoint to Check Out / Return</div>
        </div>

        <div style="margin-top:10px;font-size:0.75rem;color:#64748b;display:flex;justify-content:space-between;">
          <span>Pass ID: <strong>${pass.id}</strong></span>
          <span>Approved By: <strong>${pass.approvedBy || "Warden Office"}</strong></span>
        </div>
      </div>

      <div style="display:flex;gap:10px;margin-top:var(--sp-md);justify-content:flex-end;">
        <button type="button" class="btn btn-outline" onclick="window.print()">
          🖨️ Print / Download PDF
        </button>
        <button type="button" class="btn btn-primary" onclick="document.getElementById('gatePassModal').style.display='none'">
          Done
        </button>
      </div>`;

    modal.style.display = "flex";
  }
};


// ─────────────────────────────────────────────────────────────
//  EXPORT MODULE — CSV & Printable Reports
// ─────────────────────────────────────────────────────────────
const ExportModule = {
  toCSV(filename, headers, rows) {
    const escapeCell = (val) => {
      const str = String(val ?? "");
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    const csvContent = [
      headers.map(escapeCell).join(","),
      ...rows.map(row => row.map(escapeCell).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  printSection(title, containerId) {
    const el = document.getElementById(containerId);
    if (!el) return;

    // Create a temporary print frame
    const originalTitle = document.title;
    document.title = `SmartHMS Report — ${title}`;
    window.print();
    document.title = originalTitle;
  },

  exportComplaintsCSV() {
    const complaints = StorageHelper.get("hms_complaints") || [];
    const headers = ["Ticket ID", "Student ID", "Student Name", "Room", "Category", "Title", "Priority", "Status", "Date"];
    const rows = complaints.map(c => [
      c.id, c.studentId, c.studentName, c.roomNo, c.category, c.title || "", c.priority, c.status, c.date
    ]);
    this.toCSV("SmartHMS_Complaints_Report", headers, rows);
  },

  exportRoomsCSV() {
    const rooms = StorageHelper.get("hms_rooms") || [];
    const headers = ["Room No", "Block", "Floor", "Type", "Capacity", "Occupants Count", "AC Available", "WiFi", "Status"];
    const rows = rooms.map(r => [
      r.roomNo, r.block, r.floor, r.type, r.capacity, r.occupants.length, r.hasAC ? "Yes" : "No", r.hasWifi ? "Yes" : "No", r.status
    ]);
    this.toCSV("SmartHMS_Room_Occupancy_Report", headers, rows);
  },

  exportGatePassesCSV() {
    const passes = StorageHelper.get("hms_gatePasses") || [];
    const headers = ["Pass ID", "QR ID", "Student Name", "Room", "Type", "Destination", "From", "To", "Status", "Check-Out", "Check-In"];
    const rows = passes.map(p => [
      p.id, p.qrId, p.studentName, p.roomNo, p.type, p.destination, p.fromDateTime, p.toDateTime, p.status, p.checkOutTime || "", p.checkInTime || ""
    ]);
    this.toCSV("SmartHMS_Gate_Passes_Report", headers, rows);
  },

  exportLeavesCSV() {
    const leaves = StorageHelper.get("hms_leaveRequests") || [];
    const headers = ["Leave ID", "Student Name", "Room", "From Date", "To Date", "Reason", "Applied On", "Status"];
    const rows = leaves.map(l => [
      l.id, l.studentName, l.roomNo, l.fromDate, l.toDate, l.reason, l.appliedOn, l.status
    ]);
    this.toCSV("SmartHMS_Leave_Applications_Report", headers, rows);
  },

  exportVisitorsCSV() {
    const visitors = StorageHelper.get("hms_visitorLog") || [];
    const headers = ["Visitor ID", "Name", "Phone", "Relation", "Host Student", "Host Room", "Purpose", "Entry Time", "Exit Time", "Status"];
    const rows = visitors.map(v => [
      v.id, v.visitorName, v.visitorPhone, v.relation, v.hostStudentName, v.hostRoomNo, v.purpose, v.entryTime, v.exitTime || "", v.status
    ]);
    this.toCSV("SmartHMS_Visitor_Log_Report", headers, rows);
  },

  exportFeedbackCSV() {
    const feedbacks = StorageHelper.get("hms_feedback") || [];
    const headers = ["Feedback ID", "Student Name", "Room", "Category", "Rating", "Sentiment", "Date", "Comments"];
    const rows = feedbacks.map(f => [
      f.id, f.studentName, f.roomNo, f.category, f.rating, f.sentiment, f.date, f.message
    ]);
    this.toCSV("SmartHMS_Feedback_Sentiment_Report", headers, rows);
  }
};


// ─────────────────────────────────────────────────────────────
//  SMART SEARCH MODULE  (Natural Language Intent Parser)
// ─────────────────────────────────────────────────────────────
const SmartSearchModule = {
  init() {
    const input = document.getElementById("adminSmartSearch");
    const clearBtn = document.getElementById("smartSearchClearBtn");
    const resultsBox = document.getElementById("smartSearchResults");
    if (!input || !resultsBox) return;

    input.addEventListener("input", () => {
      const q = input.value.trim();
      if (clearBtn) clearBtn.style.display = q ? "flex" : "none";
      if (!q) {
        resultsBox.style.display = "none";
        resultsBox.innerHTML = "";
        return;
      }
      this.execute(q);
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        input.value = "";
        clearBtn.style.display = "none";
        resultsBox.style.display = "none";
        resultsBox.innerHTML = "";
        input.focus();
      });
    }

    document.querySelectorAll(".smart-chip").forEach(chip => {
      chip.addEventListener("click", () => {
        const query = chip.getAttribute("data-query") || chip.textContent;
        input.value = query;
        if (clearBtn) clearBtn.style.display = "flex";
        this.execute(query);
      });
    });
  },

  execute(query) {
    const q = query.toLowerCase();
    const resultsBox = document.getElementById("smartSearchResults");
    if (!resultsBox) return;

    const rooms      = StorageHelper.get("hms_rooms") || [];
    const complaints = StorageHelper.get("hms_complaints") || [];
    const fees       = StorageHelper.get("hms_feeRecords") || [];
    const leaves     = StorageHelper.get("hms_leaveRequests") || [];
    const passes     = StorageHelper.get("hms_gatePasses") || [];
    const visitors   = StorageHelper.get("hms_visitorLog") || [];
    const students   = StorageHelper.get("hms_studentProfiles") || [];

    let matchedIntent = "Keyword Query Matches";
    let cardsHtml = "";
    let totalMatches = 0;

    if (q.includes("vacant") || q.includes("available room") || q.includes("free room")) {
      matchedIntent = "Vacant & Available Rooms";
      const matched = rooms.filter(r => r.status === "vacant");
      totalMatches = matched.length;
      cardsHtml = matched.map(r => `
        <div class="smart-result-card">
          <div class="smart-result-title">
            <span>Room ${r.roomNo} (${r.type})</span>
            <span class="badge badge-vacant">Vacant</span>
          </div>
          <div style="color:var(--clr-muted);font-size:0.8rem;">Block ${r.block}, Floor ${r.floor} · Beds: ${r.capacity} · AC: ${r.hasAC ? 'Yes' : 'No'}</div>
          <div style="margin-top:6px;"><button class="btn btn-sm btn-outline" onclick="TabModule.switchTo('tab-rooms')">View in Room Map →</button></div>
        </div>`).join("");
    } else if (q.includes("pending complaint") || q.includes("pending ticket") || q.includes("open complaint") || q.includes("unresolved")) {
      matchedIntent = "Open Maintenance Complaints";
      const matched = complaints.filter(c => c.status !== "resolved");
      totalMatches = matched.length;
      cardsHtml = matched.map(c => `
        <div class="smart-result-card">
          <div class="smart-result-title">
            <span>${c.id} — ${c.studentName} (${c.roomNo})</span>
            ${RenderModule.priorityBadge(c.priority)}
          </div>
          <div style="font-weight:600;font-size:0.84rem;">${c.title || c.description.substring(0, 40)}</div>
          <div style="color:var(--clr-muted);font-size:0.78rem;">🏷️ ${c.category} · Status: ${RenderModule.badge(c.status)}</div>
          <div style="margin-top:6px;"><button class="btn btn-sm" onclick="TabModule.switchTo('tab-complaints')">Manage Ticket →</button></div>
        </div>`).join("");
    } else if (q.includes("unpaid") || q.includes("fee due") || q.includes("pending fee") || q.includes("defaulter")) {
      matchedIntent = "Pending Fee Dues & Defaulters";
      const unpaid = fees.filter(f => f.status !== "paid");
      totalMatches = unpaid.length;
      cardsHtml = unpaid.map(f => `
        <div class="smart-result-card" style="border-left:4px solid #f97316;">
          <div class="smart-result-title">
            <span>${f.studentName} (${f.roomNo})</span>
            <span class="fee-status fee-${f.status}">${f.status.toUpperCase()}</span>
          </div>
          <div style="font-size:0.82rem;">Due: ${RenderModule.fmtCurrency(f.totalDue)} | Pending: <strong style="color:var(--clr-danger);">${RenderModule.fmtCurrency(f.totalDue - f.amountPaid)}</strong></div>
          <div style="color:var(--clr-muted);font-size:0.75rem;">Due by: ${f.dueDate}</div>
        </div>`).join("");
    } else if (q.includes("high priority") || q.includes("urgent")) {
      matchedIntent = "High Priority & Urgent Issues";
      const matched = complaints.filter(c => c.priority === "High");
      totalMatches = matched.length;
      cardsHtml = matched.map(c => `
        <div class="smart-result-card" style="border-left:4px solid var(--clr-danger);">
          <div class="smart-result-title"><span>${c.id} — Room ${c.roomNo}</span><span class="badge badge-high">URGENT</span></div>
          <div style="font-size:0.84rem;">${c.title || c.description.substring(0, 45)}</div>
          <div style="color:var(--clr-muted);font-size:0.78rem;">Category: ${c.category}</div>
        </div>`).join("");
    } else if (q.includes("visitor") || q.includes("inside")) {
      matchedIntent = "Visitors Currently On Campus";
      const inside = visitors.filter(v => v.status === "inside");
      totalMatches = inside.length;
      cardsHtml = inside.map(v => `
        <div class="smart-result-card">
          <div class="smart-result-title"><span>👤 ${v.visitorName} (${v.relation})</span><span class="badge badge-inside">Inside</span></div>
          <div style="font-size:0.82rem;">Host: ${v.hostStudentName} (Room ${v.hostRoomNo})</div>
          <div style="color:var(--clr-muted);font-size:0.78rem;">Entry: ${v.entryTime} · Purpose: ${v.purpose}</div>
        </div>`).join("");
    } else {
      matchedIntent = `Results for "${query}"`;
      const hits = [];

      students.filter(s => s.name.toLowerCase().includes(q) || s.studentId.toLowerCase().includes(q) || s.roomNo.toLowerCase().includes(q))
        .forEach(s => {
          hits.push(`
            <div class="smart-result-card">
              <div class="smart-result-title"><span>🎓 ${s.name} (${s.studentId})</span><span class="badge badge-student">Student</span></div>
              <div style="font-size:0.82rem;">Room: <strong>${s.roomNo}</strong> · ${s.course}</div>
            </div>`);
        });

      complaints.filter(c => c.description.toLowerCase().includes(q) || (c.title && c.title.toLowerCase().includes(q)) || c.roomNo.toLowerCase().includes(q))
        .forEach(c => {
          hits.push(`
            <div class="smart-result-card">
              <div class="smart-result-title"><span>🛠️ ${c.id} (Room ${c.roomNo})</span>${RenderModule.badge(c.status)}</div>
              <div style="font-size:0.82rem;">${c.title || c.description.substring(0, 40)}</div>
            </div>`);
        });

      totalMatches = hits.length;
      cardsHtml = hits.join("");
    }

    resultsBox.style.display = "block";
    resultsBox.innerHTML = `
      <div class="smart-search-match-header">
        <span>✨ AI Smart Search: ${matchedIntent}</span>
        <span class="badge badge-neutral">${totalMatches} found</span>
      </div>
      ${totalMatches > 0
        ? `<div class="smart-search-items-grid">${cardsHtml}</div>`
        : RenderModule.emptyState("🔍", `No records matched: "${query}". Try "Show vacant rooms" or "Pending complaints".`)}`;
  }
};


// ─────────────────────────────────────────────────────────────
//  STUDENT MODULE — Student Dashboard (9 Tabs)
// ─────────────────────────────────────────────────────────────
const StudentModule = {
  session: null,
  currentTicketImageData: null,

  init() {
    this.session = AuthModule.requireAuth("student");
    if (!this.session) return;

    const userEl = document.getElementById("sidebarUserName");
    if (userEl) userEl.textContent = this.session.name;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", () => AuthModule.logout());

    TabModule.init(".tab-nav", ".tab-panel");

    // Initialize Safety Module (SOS) and Gate Pass Modal
    SafetyModule.initStudent(this.session);
    GatePassModule.init();

    // Render contents
    this._renderNotices();
    this._renderRoom();
    this._renderProfile();
    this._renderMess();
    this._renderGatePass();
    this._wireTicketImagePreview();
    this._renderTicketForm();
    this._renderMyTickets();
    this._renderFees();
    this._renderSOS();
    this._renderFeedback();
    this._wireFeedbackForm();

    AIAssistantModule.init();
    ChatbotModule.init();
  },

  _renderNotices() {
    const el = document.getElementById("studentNoticesContainer");
    if (!el) return;

    const notices = (StorageHelper.get("hms_notices") || []).filter(n => n.status === "Active");
    if (!notices.length) { el.innerHTML = ""; return; }

    el.innerHTML = `
      <div style="margin-bottom:var(--sp-md);">
        <h3 style="margin-bottom:var(--sp-sm);display:flex;align-items:center;gap:8px;">
          📢 Official Announcements
          <span class="badge badge-neutral" style="font-size:0.75rem;">${notices.length} active</span>
        </h3>
        ${notices.map(n => `
          <div class="notice-card ${n.urgency === 'Urgent' ? 'notice-urgent' : ''}">
            <div class="notice-header">
              <span class="notice-title">${n.title}</span>
              <span class="badge ${n.urgency === 'Urgent' ? 'badge-high' : 'badge-neutral'}">${n.urgency}</span>
            </div>
            <div class="notice-meta">📅 ${n.date} · 👤 ${n.postedBy} · 🎯 ${n.targetAudience}</div>
            <div class="notice-body">${n.content}</div>
          </div>`).join("")}
      </div>`;
  },

  _renderRoom() {
    const rooms = StorageHelper.get("hms_rooms") || [];
    const room  = rooms.find(r => r.roomNo === this.session.roomNo);
    const el    = document.getElementById("roomInfoContainer");
    if (!el) return;
    if (!room) { el.innerHTML = RenderModule.emptyState("🏠", "No room assigned yet."); return; }

    el.innerHTML = `
      <div class="cards-grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));">
        <div class="card"><div class="card-title">🏠 Room No.</div><div class="card-value">${room.roomNo}</div></div>
        <div class="card"><div class="card-title">🏢 Block</div><div class="card-value">Block ${room.block}</div></div>
        <div class="card"><div class="card-title">📐 Type</div><div class="card-value">${room.type}</div></div>
        <div class="card"><div class="card-title">🛏️ Capacity</div><div class="card-value">${room.capacity} Beds</div></div>
        <div class="card"><div class="card-title">❄️ AC</div><div class="card-value">${room.hasAC ? "Yes ✅" : "No ❌"}</div></div>
        <div class="card"><div class="card-title">📶 Wi-Fi</div><div class="card-value">${room.hasWifi ? "Yes ✅" : "No ❌"}</div></div>
        <div class="card"><div class="card-title">🔑 Status</div><div class="card-value">${RenderModule.badge(room.status)}</div></div>
        <div class="card"><div class="card-title">👥 Occupants</div><div class="card-value">${room.occupants.length} / ${room.capacity}</div></div>
      </div>`;
  },

  _renderProfile() {
    const profiles = StorageHelper.get("hms_studentProfiles") || [];
    const profile  = profiles.find(p => p.studentId === this.session.id);
    const el       = document.getElementById("profileContainer");
    if (!el) return;
    if (!profile) { el.innerHTML = RenderModule.emptyState("👤", "Profile not found."); return; }

    const docStatus = (ok) => ok ? `<span class="badge badge-paid">Submitted ✅</span>` : `<span class="badge badge-overdue">Pending ⚠️</span>`;

    const histRows = (profile.roomHistory || []).map(h => `
      <tr>
        <td><strong>${h.roomNo}</strong></td>
        <td>${h.from}</td>
        <td>${h.to || "Present"}</td>
        <td>${h.reason}</td>
      </tr>`).join("");

    el.innerHTML = `
      <div class="profile-card">
        <div class="profile-avatar">${profile.name.charAt(0)}</div>
        <div class="profile-meta">
          <h3>${profile.name}</h3>
          <span class="badge badge-student">🎓 Student · ID: ${profile.studentId}</span>
        </div>
      </div>
      <div class="cards-grid" style="margin-top:var(--sp-lg);grid-template-columns:repeat(auto-fit,minmax(220px,1fr));">
        <div class="card"><div class="card-title">🎓 Course</div><div class="card-value" style="font-size:1rem;">${profile.course}</div></div>
        <div class="card"><div class="card-title">📅 Year</div><div class="card-value" style="font-size:1rem;">${profile.year}</div></div>
        <div class="card"><div class="card-title">🆔 Enrollment No.</div><div class="card-value" style="font-size:1rem;">${profile.enrollNo}</div></div>
        <div class="card"><div class="card-title">🩸 Blood Group</div><div class="card-value">${profile.bloodGroup}</div></div>
        <div class="card"><div class="card-title">📱 Phone</div><div class="card-value" style="font-size:1rem;">${profile.phone}</div></div>
        <div class="card"><div class="card-title">📧 Email</div><div class="card-value" style="font-size:0.85rem;">${profile.email}</div></div>
        <div class="card"><div class="card-title">🏠 Hometown</div><div class="card-value" style="font-size:1rem;">${profile.hometown}</div></div>
        <div class="card"><div class="card-title">🎂 Date of Birth</div><div class="card-value" style="font-size:1rem;">${profile.dob}</div></div>
      </div>

      <h3 style="margin:var(--sp-xl) 0 var(--sp-md);">🆘 Registered Emergency Contact</h3>
      <div class="card" style="max-width:420px;">
        <div class="card-title">👤 ${profile.emergencyContact.name}</div>
        <div style="font-size:0.9rem;color:var(--clr-muted);">${profile.emergencyContact.relation}</div>
        <div style="font-size:1rem;font-weight:600;margin-top:var(--sp-sm);">📞 ${profile.emergencyContact.phone}</div>
      </div>

      <h3 style="margin:var(--sp-xl) 0 var(--sp-md);">📄 Document Compliance</h3>
      <div style="display:flex;gap:var(--sp-md);flex-wrap:wrap;">
        <div>Aadhar Card: ${docStatus(profile.documents.aadhar)}</div>
        <div>Photograph: ${docStatus(profile.documents.photo)}</div>
        <div>Transfer Cert: ${docStatus(profile.documents.tc)}</div>
        <div>Medical Cert: ${docStatus(profile.documents.medicalCert)}</div>
      </div>

      <h3 style="margin:var(--sp-xl) 0 var(--sp-md);">🏠 Room Allotment History</h3>
      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead><tr><th>Room</th><th>From</th><th>To</th><th>Reason</th></tr></thead>
          <tbody>${histRows}</tbody>
        </table>
      </div>`;
  },

  _renderMess() {
    const menu = StorageHelper.get("hms_messMenu") || {};
    const el   = document.getElementById("messMenuContainer");
    if (!el) return;
    const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    const today = days[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1];

    el.innerHTML = days.map(day => {
      const m = menu[day] || {};
      const isToday = day === today;
      return `
        <div class="card${isToday ? ' card-highlight' : ''}" style="margin-bottom:var(--sp-md);">
          <div class="card-title">${isToday ? "⭐ " : ""}${day}${isToday ? " (Today's Scheduled Menu)" : ""}</div>
          <div style="display:grid;gap:var(--sp-xs);margin-top:var(--sp-sm);">
            <div><span style="font-weight:600;">🌅 Breakfast:</span> ${m.breakfast || "—"}</div>
            <div><span style="font-weight:600;">☀️ Lunch:</span>     ${m.lunch     || "—"}</div>
            <div><span style="font-weight:600;">🌙 Dinner:</span>    ${m.dinner    || "—"}</div>
          </div>
        </div>`;
    }).join("");
  },

  _renderGatePass() {
    this._renderGatePassList();
    this._wireGatePassForm();
  },

  _renderGatePassList() {
    const passes = StorageHelper.get("hms_gatePasses") || [];
    const mine   = passes.filter(p => p.studentId === this.session.id);
    const listEl = document.getElementById("myGatePassList");
    if (!listEl) return;

    if (!mine.length) {
      listEl.innerHTML = RenderModule.emptyState("🚪", "No gate passes applied yet.");
      return;
    }

    const rows = mine.map(p => `
      <tr>
        <td><strong>${p.id}</strong><br><span style="font-size:0.78rem;color:var(--clr-muted);font-family:monospace;">${p.qrId}</span></td>
        <td>${p.type.charAt(0).toUpperCase() + p.type.slice(1)}</td>
        <td>${p.destination}</td>
        <td>${p.fromDateTime}</td>
        <td>${p.toDateTime}</td>
        <td>${RenderModule.badge(p.status)}</td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="GatePassModule.openPassModal('${p.id}')">
            🪪 View / Print Pass
          </button>
        </td>
      </tr>`).join("");

    listEl.innerHTML = `
      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead>
            <tr><th>Pass ID / QR</th><th>Type</th><th>Destination</th><th>From</th><th>To</th><th>Status</th><th>Digital Pass</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  },

  _wireGatePassForm() {
    const form = document.getElementById("gatePassForm");
    const msg  = document.getElementById("gatePassMsg");
    if (!form) return;

    form.addEventListener("submit", e => {
      e.preventDefault();
      const type        = form.passType.value;
      const destination = form.destination.value.trim();
      const fromDT      = form.fromDateTime.value;
      const toDT        = form.toDateTime.value;
      const reason      = form.passReason.value.trim();

      if (!destination || !fromDT || !toDT) {
        RenderModule.showFormMessage(msg, "error", "Please fill all required fields.");
        return;
      }

      const passes = StorageHelper.get("hms_gatePasses") || [];
      const newId  = `GP-${String(passes.length + 1).padStart(3, "0")}`;
      const qrId   = `QR-${new Date().getFullYear()}-${String(passes.length + 1).padStart(3, "0")}`;

      passes.push({
        id: newId, qrId, studentId: this.session.id, studentName: this.session.name,
        roomNo: this.session.roomNo, type, destination,
        fromDateTime: fromDT, toDateTime: toDT, reason,
        appliedOn: new Date().toISOString().split("T")[0],
        approvedBy: null, status: "pending",
        checkOutTime: null, checkInTime: null, guardId: null
      });
      StorageHelper.set("hms_gatePasses", passes);
      form.reset();
      RenderModule.showFormMessage(msg, "success", `✅ Gate pass ${newId} submitted! QR: ${qrId}`);
      this._renderGatePassList();
    });
  },

  _wireTicketImagePreview() {
    const fileInput = document.getElementById("ticketImage");
    const wrap = document.getElementById("ticketImagePreviewWrap");
    const previewImg = document.getElementById("ticketImagePreview");
    const removeBtn = document.getElementById("ticketImageRemoveBtn");
    if (!fileInput) return;

    fileInput.addEventListener("change", () => {
      const file = fileInput.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.currentTicketImageData = e.target.result;
          if (previewImg) previewImg.src = this.currentTicketImageData;
          if (wrap) wrap.style.display = "inline-block";
        };
        reader.readAsDataURL(file);
      }
    });

    if (removeBtn) {
      removeBtn.addEventListener("click", () => {
        fileInput.value = "";
        this.currentTicketImageData = null;
        if (wrap) wrap.style.display = "none";
        if (previewImg) previewImg.src = "";
      });
    }
  },

  _renderTicketForm() {
    const form    = document.getElementById("ticketForm");
    const preview = document.getElementById("aiPreviewBox");
    const descEl  = document.getElementById("ticketDesc");
    const msg     = document.getElementById("ticketMsg");
    if (!form) return;

    let debounce;
    if (descEl && preview) {
      descEl.addEventListener("input", () => {
        clearTimeout(debounce);
        debounce = setTimeout(() => {
          const text = descEl.value.trim();
          if (text.length < 4) { preview.style.display = "none"; return; }
          const result = AICategorizer.categorize(text);
          preview.style.display = "block";
          preview.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
              <span>🤖 <strong>AI Suggestion:</strong></span>
              <span class="badge badge-neutral">Category: <strong>${result.category}</strong></span>
              <span>Priority: ${RenderModule.priorityBadge(result.priority)}</span>
            </div>`;
        }, 300);
      });
    }

    form.addEventListener("submit", e => {
      e.preventDefault();
      const titleEl = document.getElementById("ticketTitle");
      const title   = titleEl ? titleEl.value.trim() : "";
      const desc    = descEl  ? descEl.value.trim()  : "";

      if (!title || !desc) {
        RenderModule.showFormMessage(msg, "error", "Please enter both title and description.");
        return;
      }

      const result = AICategorizer.categorize(desc);

      setTimeout(() => {
        const tickets = StorageHelper.get("hms_complaints") || [];
        const newId   = `TKT-${String(tickets.length + 1).padStart(3, "0")}`;
        tickets.push({
          id: newId,
          studentId: this.session.id,
          studentName: this.session.name,
          roomNo: this.session.roomNo,
          category: result.category,
          title,
          description: desc,
          priority: result.priority,
          image: this.currentTicketImageData || null,
          status: "pending",
          date: new Date().toISOString().split("T")[0],
          aiTagged: true
        });
        StorageHelper.set("hms_complaints", tickets);

        form.reset();
        this.currentTicketImageData = null;
        const wrap = document.getElementById("ticketImagePreviewWrap");
        if (wrap) wrap.style.display = "none";
        if (preview) preview.style.display = "none";

        RenderModule.showFormMessage(msg, "success",
          `✅ Ticket ${newId} submitted! Categorized under "${result.category}" (${result.priority} priority).`);
        this._renderMyTickets();
      }, 600);
    });
  },

  _renderMyTickets() {
    const tickets = (StorageHelper.get("hms_complaints") || [])
                      .filter(t => t.studentId === this.session.id)
                      .sort((a, b) => {
                        const order = { pending: 0, "in-progress": 1, resolved: 2 };
                        return (order[a.status] ?? 3) - (order[b.status] ?? 3);
                      });
    const el = document.getElementById("myTicketsList");
    if (!el) return;

    if (!tickets.length) { el.innerHTML = RenderModule.emptyState("📋", "No tickets raised yet."); return; }

    el.innerHTML = tickets.map(t => `
      <div class="card" style="margin-bottom:var(--sp-md);">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:var(--sp-sm);">
          <div>
            <span style="font-weight:700;">${t.id}</span>
            <span style="margin-left:var(--sp-sm);color:var(--clr-muted);font-size:0.85rem;">📅 ${t.date}</span>
          </div>
          <div style="display:flex;gap:var(--sp-sm);">
            ${RenderModule.badge(t.status)}
            ${RenderModule.priorityBadge(t.priority)}
          </div>
        </div>
        <div style="font-weight:700;font-size:1.05rem;margin:var(--sp-sm) 0 4px;">${t.title || "Complaint"}</div>
        <div style="font-size:0.88rem;color:var(--clr-muted);">${t.description}</div>
        ${t.image ? `
          <div style="margin-top:8px;">
            <img src="${t.image}" alt="Issue photo" class="ticket-thumbnail" onclick="window.open(this.src)" title="Click to view photo" />
            <span style="font-size:0.75rem;color:var(--clr-muted);margin-left:6px;">Attached Photo</span>
          </div>` : ""}
        <div style="font-size:0.82rem;margin-top:var(--sp-sm);">
          🏷️ <strong>${t.category}</strong>
          ${t.aiTagged ? '<span style="color:var(--clr-primary);margin-left:6px;font-weight:600;">🤖 AI-tagged</span>' : ""}
        </div>
      </div>`).join("");
  },

  _renderFees() {
    const fees = StorageHelper.get("hms_feeRecords") || [];
    const fee  = fees.find(f => f.studentId === this.session.id);
    const el   = document.getElementById("feesContainer");
    if (!el) return;

    if (!fee) { el.innerHTML = RenderModule.emptyState("💰", "No fee record found."); return; }

    const outstanding = fee.totalDue - fee.amountPaid;
    const statusCls   = { paid: "paid", pending: "pending-fee", overdue: "overdue" };

    el.innerHTML = `
      <div class="cards-grid" style="grid-template-columns:repeat(auto-fit,minmax(200px,1fr));margin-bottom:var(--sp-lg);">
        <div class="card"><div class="card-title">🏛️ Hostel Fee</div><div class="card-value">${RenderModule.fmtCurrency(fee.hostelFee)}</div></div>
        <div class="card"><div class="card-title">🍽️ Mess Fee</div><div class="card-value">${RenderModule.fmtCurrency(fee.messFee)}</div></div>
        <div class="card"><div class="card-title">📎 Other Charges</div><div class="card-value">${RenderModule.fmtCurrency(fee.otherFee)}</div></div>
        <div class="card"><div class="card-title">💳 Total Due</div><div class="card-value">${RenderModule.fmtCurrency(fee.totalDue)}</div></div>
        <div class="card"><div class="card-title">✅ Amount Paid</div><div class="card-value" style="color:var(--clr-success);">${RenderModule.fmtCurrency(fee.amountPaid)}</div></div>
        <div class="card"><div class="card-title">⚠️ Outstanding</div><div class="card-value" style="color:${outstanding > 0 ? 'var(--clr-danger)' : 'var(--clr-success)'};">${outstanding > 0 ? RenderModule.fmtCurrency(outstanding) : "Cleared ✅"}</div></div>
      </div>

      <div class="fee-table-wrap">
        <table class="data-table fee-table">
          <thead>
            <tr><th>Semester</th><th>Due Date</th><th>Paid On</th><th>Mode</th><th>Receipt No.</th><th>Status</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>${fee.semester}</td>
              <td>${fee.dueDate}</td>
              <td>${fee.paidOn || "—"}</td>
              <td>${fee.paymentMode || "—"}</td>
              <td>${fee.receiptNo  || "—"}</td>
              <td><span class="fee-status fee-${statusCls[fee.status] || fee.status}">${fee.status.toUpperCase()}</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      ${fee.status === "paid" ? `
        <button class="btn btn-outline" style="margin-top:var(--sp-md);" onclick="alert('Receipt #${fee.receiptNo} verified. Ready for download.')">
          📥 Download Official Receipt
        </button>` : `
        <div class="card" style="background:#fff7ed;border-color:#f97316;margin-top:var(--sp-md);">
          <strong>⚠️ Payment Due:</strong> Please clear ${RenderModule.fmtCurrency(outstanding)} by ${fee.dueDate} via UPI or Bank Transfer.
        </div>`}`;
  },

  _renderSOS() {
    const profiles = StorageHelper.get("hms_studentProfiles") || [];
    const profile  = profiles.find(p => p.studentId === this.session.id);
    const el       = document.getElementById("sosContainer");
    if (!el) return;

    const contacts = [
      { icon: "🏥", label: "Campus Medical Centre", number: "+91-11000-00001", note: "24/7 Emergency Clinic" },
      { icon: "🚑", label: "National Ambulance",    number: "108",             note: "Toll-Free Emergency" },
      { icon: "🚔", label: "Police Assistance",      number: "100",             note: "National Emergency" },
      { icon: "🔥", label: "Fire Station",           number: "101",             note: "National Emergency" },
      { icon: "🛡️", label: "Warden (Block A/C)",     number: "+91-98100-11001", note: "Dr. Ramesh Kumar" },
      { icon: "🛡️", label: "Warden (Block B)",        number: "+91-98100-11002", note: "Ms. Sunita Rao" },
      { icon: "🔒", label: "Main Gate Security",     number: "+91-11000-00002", note: "24/7 Gate Patrol" },
      { icon: "🏨", label: "Hostel Admin Office",    number: "+91-11000-00003", note: "Office Hours (9 AM - 5 PM)" }
    ];

    const personalEC = profile ? `
      <div class="sos-card personal-ec">
        <div class="sos-icon">👨‍👩‍👧</div>
        <div class="sos-info">
          <div class="sos-label">Your Registered Guardian: ${profile.emergencyContact.name}</div>
          <div class="sos-note">${profile.emergencyContact.relation}</div>
          <a class="sos-number" href="tel:${profile.emergencyContact.phone.replace(/[^+\d]/g, '')}">
            ${profile.emergencyContact.phone}
          </a>
        </div>
      </div>` : "";

    el.innerHTML = `
      <div class="card" style="background:#fff7ed;border-color:#f97316;margin-bottom:var(--sp-lg);">
        <strong>🆘 Emergency Action Protocol:</strong> For life-threatening emergencies, immediately dial <strong>108 (Ambulance)</strong> or <strong>100 (Police)</strong>. You can also trigger the top <strong>🚨 SOS EMERGENCY</strong> button for immediate warden dispatch.
      </div>
      ${personalEC}
      <h3 style="margin-bottom:var(--sp-md);">📞 Emergency Helplines</h3>
      <div class="sos-grid">
        ${contacts.map(c => `
          <div class="sos-card">
            <div class="sos-icon">${c.icon}</div>
            <div class="sos-info">
              <div class="sos-label">${c.label}</div>
              <div class="sos-note">${c.note}</div>
              <a class="sos-number" href="tel:${c.number.replace(/[^+\d]/g, '')}">${c.number}</a>
            </div>
          </div>`).join("")}
      </div>`;
  },

  _renderFeedback() {
    this._renderMyFeedbackList();
  },

  _renderMyFeedbackList() {
    const listEl = document.getElementById("myFeedbackList");
    if (!listEl) return;

    const all = StorageHelper.get("hms_feedback") || [];
    const mine = all.filter(f => f.studentId === this.session.id);

    if (!mine.length) {
      listEl.innerHTML = RenderModule.emptyState("💬", "No feedback submitted yet. Share your thoughts above!");
      return;
    }

    listEl.innerHTML = mine.map(f => `
      <div class="card" style="margin-bottom:var(--sp-md);">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
          <div>
            <strong>${f.category}</strong>
            <span style="margin-left:8px;font-size:0.85rem;color:var(--clr-muted);">📅 ${f.date}</span>
          </div>
          <div>
            ${RenderModule.stars(f.rating)}
            <span style="margin-left:8px;">${RenderModule.sentimentBadge(f.sentiment)}</span>
          </div>
        </div>
        <div style="margin-top:8px;font-size:0.9rem;color:#334155;line-height:1.5;">${f.message}</div>
      </div>`).join("");
  },

  _wireFeedbackForm() {
    const form = document.getElementById("feedbackForm");
    const msgInput = document.getElementById("fbMessage");
    const ratingInput = document.getElementById("fbRating");
    const previewBox = document.getElementById("sentimentLivePreview");
    const msgAlert = document.getElementById("feedbackMsg");
    if (!form || !msgInput) return;

    let debounce;
    const updatePreview = () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        const text = msgInput.value.trim();
        if (text.length < 5) {
          if (previewBox) previewBox.style.display = "none";
          return;
        }
        const res = SentimentAnalyzer.analyze(text, ratingInput.value);
        if (previewBox) {
          previewBox.style.display = "block";
          previewBox.innerHTML = `
            <div style="display:flex;align-items:center;gap:10px;">
              <span>🤖 <strong>AI Sentiment Analysis:</strong></span>
              <span class="badge ${res.badgeClass}">${res.emoji} ${res.sentiment}</span>
              <span style="font-size:0.8rem;color:var(--clr-muted);">Score: ${res.score.toFixed(1)}</span>
            </div>`;
        }
      }, 300);
    };

    msgInput.addEventListener("input", updatePreview);
    if (ratingInput) ratingInput.addEventListener("change", updatePreview);

    form.addEventListener("submit", e => {
      e.preventDefault();
      const category = form.fbCategory.value;
      const rating   = Number(form.fbRating.value) || 4;
      const message  = msgInput.value.trim();

      if (!message) {
        RenderModule.showFormMessage(msgAlert, "error", "Please write your feedback.");
        return;
      }

      const res = SentimentAnalyzer.analyze(message, rating);
      const all = StorageHelper.get("hms_feedback") || [];
      const newId = `FB-${String(all.length + 1).padStart(3, "0")}`;

      all.unshift({
        id: newId,
        studentId: this.session.id,
        studentName: this.session.name,
        roomNo: this.session.roomNo,
        category,
        rating,
        date: new Date().toISOString().split("T")[0],
        message,
        sentiment: res.sentiment,
        sentimentScore: res.score
      });

      StorageHelper.set("hms_feedback", all);
      form.reset();
      if (previewBox) previewBox.style.display = "none";
      RenderModule.showFormMessage(msgAlert, "success", `✅ Feedback recorded! Tagged as ${res.sentiment} sentiment.`);
      this._renderMyFeedbackList();
    });
  }
};


// ─────────────────────────────────────────────────────────────
//  CHATBOT MODULE — In-Tab AI FAQ Assistant
// ─────────────────────────────────────────────────────────────
const ChatbotModule = {
  init() {
    const form    = document.getElementById("chatForm");
    const input   = document.getElementById("chatInput");
    const history = document.getElementById("chatHistory");
    if (!form || !input || !history) return;

    form.addEventListener("submit", e => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      this._addMessage(history, text, "user");
      input.value = "";
      const reply = this._getReply(text);
      setTimeout(() => this._addMessage(history, reply, "bot"), 600);
    });
  },

  _addMessage(container, text, who) {
    const div = document.createElement("div");
    div.className = `chat-msg chat-${who}`;
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
  },

  _getReply(text) {
    const t = text.toLowerCase();

    if (t.includes("curfew") || t.includes("gate time") || t.includes("gate close") || t.includes("late entry"))
      return "⏰ Curfew Regulation: The main gates close at 10:00 PM daily. Students returning late must sign the gate register and obtain warden authorization. Repeat violations attract fines.";

    if (t.includes("leave") || t.includes("gate pass") || t.includes("outpass") || t.includes("overnight") || t.includes("go home"))
      return "🚪 Gate Pass Policy: Submit applications via the 'Gate Pass / Leave' tab 48 hours prior. Once approved, click 'View / Print Pass' to access your digital QR code for scanning at the gate.";

    if (t.includes("fee") || t.includes("payment") || t.includes("rent") || t.includes("receipt") || t.includes("fine"))
      return "💰 Fee Schedule (Semester):\n• Hostel Room: ₹25,000\n• Mess & Food: ₹14,000\n• Utilities Deposit: ₹1,500\nTotal Due: ₹40,500. Pay online via UPI or submit DD receipts at the admin office.";

    if (t.includes("mess") || t.includes("food") || t.includes("meal") || t.includes("lunch") || t.includes("dinner") || t.includes("breakfast"))
      return "🍽️ Mess Timings:\n• Breakfast: 7:00 AM – 9:00 AM\n• Lunch: 12:00 PM – 2:00 PM\n• Dinner: 7:00 PM – 9:00 PM\nCheck the 'Mess Menu' tab to see today's dishes!";

    if (t.includes("wifi") || t.includes("internet") || t.includes("speed"))
      return "📶 Wi-Fi Amenities: Shared 100 Mbps broadband is available campus-wide. Passwords rotate on the 1st of each month. High-bandwidth streaming is limited during quiet hours.";

    if (t.includes("visitor") || t.includes("guest") || t.includes("parent"))
      return "👥 Visitor Rules: Guests are allowed in the Common Lounge between 10:00 AM and 6:00 PM. Photo ID verification is mandatory at the security gate. Room entry is strictly forbidden.";

    if (t.includes("complaint") || t.includes("maintenance") || t.includes("repair") || t.includes("broken"))
      return "🔧 Maintenance Assistance: Go to the 'Maintenance' tab, enter issue details, and optionally attach a photo. Our AI auto-categorizes the ticket (Electrical, Plumbing, Internet, Cleaning, Carpentry).";

    if (t.includes("sos") || t.includes("emergency") || t.includes("ambulance") || t.includes("police"))
      return "🆘 Immediate Assistance:\n• National Ambulance: 108\n• Police Control: 100\n• Campus Medical Center: +91-11000-00001\n• Or click the red '🚨 SOS EMERGENCY' button at the top!";

    if (t.includes("rule") || t.includes("regulation") || t.includes("ragging") || t.includes("iron"))
      return "📜 Hostel Regulations:\n1. Zero tolerance for ragging (instant expulsion).\n2. Heating/cooking appliances (>500W) banned in rooms.\n3. Silence hours: 10:00 PM to 6:00 AM.\n4. Student ID required always.";

    if (t.includes("hello") || t.includes("hi") || t.includes("hey"))
      return "Hello! 👋 I am your SmartHMS AI Assistant. Ask me about curfew rules, gate passes, fees, mess menus, or maintenance!";

    return "I can help with curfew timings, leave passes, fee payments, mess menus, visitor rules, maintenance, or emergency helplines. Try asking 'What are the curfew hours?' or 'How do I download my fee receipt?'";
  }
};


// ─────────────────────────────────────────────────────────────
//  AI ASSISTANT MODULE — Floating Widget Across All Pages
// ─────────────────────────────────────────────────────────────
const AIAssistantModule = {
  _open: false,

  init() {
    this._injectStyles();
    this._injectHTML();
    this._wireEvents();
  },

  _injectStyles() {
    const id = "ai-assistant-styles";
    if (document.getElementById(id)) return;
    const style = document.createElement("style");
    style.id = id;
    style.textContent = `
      #ai-fab { position:fixed; bottom:24px; right:24px; z-index:9999;
        width:56px; height:56px; border-radius:50%; background:var(--clr-primary);
        color:#fff; border:none; font-size:1.4rem; cursor:pointer;
        box-shadow:0 4px 16px rgba(99,102,241,.4); transition:transform .2s; }
      #ai-fab:hover { transform:scale(1.08); }
      #ai-widget { position:fixed; bottom:92px; right:24px; z-index:9998;
        width:350px; height:480px; background:#fff; border-radius:16px;
        box-shadow:0 8px 40px rgba(0,0,0,.18); display:none; flex-direction:column;
        overflow:hidden; }
      #ai-widget.open { display:flex; }
      #ai-widget-header { background:var(--clr-primary); color:#fff; padding:14px 16px;
        font-weight:700; font-size:1rem; display:flex; justify-content:space-between; align-items:center; }
      #ai-widget-close { background:none; border:none; color:#fff; font-size:1.2rem; cursor:pointer; }
      #ai-widget-msgs { flex:1; overflow-y:auto; padding:12px; display:flex; flex-direction:column; gap:8px; }
      .aw-msg { max-width:85%; padding:8px 12px; border-radius:12px; font-size:0.88rem; line-height:1.45; white-space:pre-line; }
      .aw-bot { background:#f1f5fe; color:var(--clr-text); align-self:flex-start; border-bottom-left-radius:2px; }
      .aw-user { background:var(--clr-primary); color:#fff; align-self:flex-end; border-bottom-right-radius:2px; }
      .aw-typing { font-style:italic; color:var(--clr-muted); font-size:0.82rem; align-self:flex-start; }
      #ai-widget-chips { padding:8px 12px; display:flex; flex-wrap:wrap; gap:6px; border-top:1px solid var(--clr-border); }
      .aw-chip { background:#eef2ff; color:var(--clr-primary); border:1px solid #c7d2fe;
        border-radius:20px; padding:4px 10px; font-size:0.78rem; cursor:pointer; white-space:nowrap; }
      .aw-chip:hover { background:var(--clr-primary); color:#fff; }
      #ai-widget-form { display:flex; gap:8px; padding:10px 12px; border-top:1px solid var(--clr-border); }
      #ai-widget-input { flex:1; border:1px solid var(--clr-border); border-radius:8px;
        padding:8px 10px; font-size:0.88rem; outline:none; }
      #ai-widget-send { background:var(--clr-primary); color:#fff; border:none;
        border-radius:8px; padding:8px 14px; cursor:pointer; font-size:0.88rem; }`;
    document.head.appendChild(style);
  },

  _injectHTML() {
    if (document.getElementById("ai-fab")) return;
    const chips = ["Curfew timings?","Mess menu?","Leave rules?","Fee structure?","Emergency SOS?"];
    document.body.insertAdjacentHTML("beforeend", `
      <button id="ai-fab" title="AI Hostel Assistant">🤖</button>
      <div id="ai-widget" role="dialog" aria-label="AI Hostel Assistant">
        <div id="ai-widget-header">
          🤖 AI Hostel Assistant
          <button id="ai-widget-close" aria-label="Close">✕</button>
        </div>
        <div id="ai-widget-msgs">
          <div class="aw-msg aw-bot">Hello! 👋 I am your SmartHMS AI Assistant. Ask me about curfew rules, mess menus, gate passes, or fee structures!</div>
        </div>
        <div id="ai-widget-chips">
          ${chips.map(c => `<button class="aw-chip" type="button">${c}</button>`).join("")}
        </div>
        <form id="ai-widget-form">
          <input id="ai-widget-input" type="text" placeholder="Ask hostel questions…" autocomplete="off" />
          <button type="submit" id="ai-widget-send">Send</button>
        </form>
      </div>`);
  },

  _wireEvents() {
    const fab    = document.getElementById("ai-fab");
    const widget = document.getElementById("ai-widget");
    const close  = document.getElementById("ai-widget-close");
    const form   = document.getElementById("ai-widget-form");
    const input  = document.getElementById("ai-widget-input");
    const msgs   = document.getElementById("ai-widget-msgs");
    const chips  = document.querySelectorAll(".aw-chip");

    fab.addEventListener("click", () => {
      this._open = !this._open;
      widget.classList.toggle("open", this._open);
      fab.textContent = this._open ? "✕" : "🤖";
      if (this._open) input.focus();
    });

    close.addEventListener("click", () => {
      this._open = false; widget.classList.remove("open"); fab.textContent = "🤖";
    });

    form.addEventListener("submit", e => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;
      this._addMsg(msgs, text, "user");
      input.value = "";
      const typingDiv = this._addMsg(msgs, "Checking regulations…", "typing");
      setTimeout(() => {
        msgs.removeChild(typingDiv);
        this._addMsg(msgs, ChatbotModule._getReply(text), "bot");
      }, 500);
    });

    chips.forEach(chip => chip.addEventListener("click", () => {
      this._addMsg(msgs, chip.textContent, "user");
      const typingDiv = this._addMsg(msgs, "Checking regulations…", "typing");
      setTimeout(() => {
        msgs.removeChild(typingDiv);
        this._addMsg(msgs, ChatbotModule._getReply(chip.textContent), "bot");
      }, 500);
    }));
  },

  _addMsg(container, text, who) {
    const div = document.createElement("div");
    div.className = `aw-msg aw-${who}`;
    div.textContent = text;
    container.appendChild(div);
    container.scrollTop = container.scrollHeight;
    return div;
  }
};


// ─────────────────────────────────────────────────────────────
//  ADMIN MODULE — Warden & Admin Dashboard (8 Tabs)
// ─────────────────────────────────────────────────────────────
const AdminModule = {
  session: null,

  init() {
    this.session = AuthModule.requireAuth(["admin", "warden"]);
    if (!this.session) return;

    const nameEl = document.getElementById("sidebarUserName");
    const roleEl = document.getElementById("sidebarRoleLabel");
    if (nameEl) nameEl.textContent = this.session.name;
    if (roleEl) roleEl.textContent = this.session.role === "admin" ? "⚙️ Administrator Portal" : "🛡️ Warden Portal";

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", () => AuthModule.logout());

    TabModule.init(".tab-nav", ".tab-panel");
    SmartSearchModule.init();
    SafetyModule.initAdminOrSecurity();
    this._wireNoticeGenerator();
    this.refreshAll();
    AIAssistantModule.init();
  },

  refreshAll() {
    this.renderTopCounters();
    this.renderOverview();
    this.renderRoomGrid();
    this.renderRoomDetailTable();
    this.renderComplaints();
    this.renderGatePasses();
    this.renderLeaveApprovals();
    this.renderVisitorLog();
    this.renderActiveNotices();
    this.renderFeedbackInsights();
  },

  // ── Summary KPI Cards ────────────────────────────────────────
  renderTopCounters() {
    const rooms      = StorageHelper.get("hms_rooms") || [];
    const complaints = StorageHelper.get("hms_complaints") || [];
    const leaves     = StorageHelper.get("hms_leaveRequests") || [];
    const passes     = StorageHelper.get("hms_gatePasses") || [];
    const fees       = StorageHelper.get("hms_feeRecords") || [];

    const totalStudents   = rooms.reduce((s, r) => s + r.occupants.length, 0);
    const occupiedRooms   = rooms.filter(r => r.status === "occupied").length;
    const occupancyRate   = rooms.length ? Math.round((occupiedRooms / rooms.length) * 100) : 0;
    const openTickets     = complaints.filter(c => c.status !== "resolved").length;
    const pendingPasses   = passes.filter(p => p.status === "pending").length + leaves.filter(l => l.status === "pending").length;
    const totalFeeRevenue = fees.reduce((sum, f) => sum + (Number(f.amountPaid) || 0), 0);

    const el = document.getElementById("adminTopCounters");
    if (!el) return;
    el.innerHTML = `
      <div class="counter-item"><span class="counter-val">${totalStudents}</span><span class="counter-lbl">Total Students</span></div>
      <div class="counter-item"><span class="counter-val">${occupancyRate}%</span><span class="counter-lbl">Occupancy Rate</span></div>
      <div class="counter-item"><span class="counter-val">${openTickets}</span><span class="counter-lbl">Open Tickets</span></div>
      <div class="counter-item"><span class="counter-val">${pendingPasses}</span><span class="counter-lbl">Pending Passes</span></div>
      <div class="counter-item"><span class="counter-val">${RenderModule.fmtCurrency(totalFeeRevenue)}</span><span class="counter-lbl">Total Fee Collection</span></div>`;
  },

  renderOverview() {
    const rooms      = StorageHelper.get("hms_rooms") || [];
    const complaints = StorageHelper.get("hms_complaints") || [];
    const leaves     = StorageHelper.get("hms_leaveRequests") || [];
    const fees       = StorageHelper.get("hms_feeRecords") || [];
    const feedbacks  = StorageHelper.get("hms_feedback") || [];

    const occupied    = rooms.filter(r => r.status === "occupied").length;
    const vacant      = rooms.filter(r => r.status === "vacant").length;
    const maintenance = rooms.filter(r => r.status === "maintenance").length;
    const pending     = complaints.filter(c => c.status === "pending").length;
    const inProgress  = complaints.filter(c => c.status === "in-progress").length;
    const resolved    = complaints.filter(c => c.status === "resolved").length;
    const pLeave      = leaves.filter(l => l.status === "pending").length;
    const occPct      = rooms.length ? Math.round((occupied / rooms.length) * 100) : 0;
    const feeDue      = fees.filter(f => f.status !== "paid").length;
    const totalRev    = fees.reduce((s, f) => s + (Number(f.amountPaid) || 0), 0);

    const posCount = feedbacks.filter(f => f.sentiment === "Positive").length;
    const posPct   = feedbacks.length ? Math.round((posCount / feedbacks.length) * 100) : 100;

    const el = document.getElementById("kpiContainer");
    if (!el) return;

    const kpis = [
      { icon:"🏢", label:"Total Rooms",        val: rooms.length,   cls:"" },
      { icon:"✅", label:"Occupied Rooms",     val: occupied,       cls:"clr-success" },
      { icon:"🟡", label:"Vacant Rooms",       val: vacant,         cls:"" },
      { icon:"🔧", label:"Under Maintenance",  val: maintenance,    cls:"clr-warning" },
      { icon:"📋", label:"Pending Tickets",    val: pending,        cls:"clr-danger" },
      { icon:"🔄", label:"In Progress",        val: inProgress,     cls:"" },
      { icon:"✔️", label:"Resolved Tickets",   val: resolved,       cls:"clr-success" },
      { icon:"📊", label:"Occupancy Rate",     val: occPct + "%",   cls:"" },
      { icon:"🚪", label:"Pending Leaves",     val: pLeave,         cls:"clr-warning" },
      { icon:"💰", label:"Fee Dues Pending",   val: feeDue,         cls:"clr-danger" },
      { icon:"💵", label:"Total Revenue",      val: RenderModule.fmtCurrency(totalRev), cls:"clr-success" },
      { icon:"😊", label:"Positive Sentiment", val: posPct + "%",   cls:"clr-success" }
    ];

    el.innerHTML = kpis.map(k => `
      <div class="card kpi-card">
        <div class="card-title">${k.icon} ${k.label}</div>
        <div class="card-value ${k.cls || ''}">${k.val}</div>
      </div>`).join("");
  },

  renderRoomGrid() {
    const rooms  = StorageHelper.get("hms_rooms") || [];
    const blocks = ["A", "B", "C"];
    const el     = document.getElementById("roomGridContainer");
    if (!el) return;

    el.innerHTML = blocks.map(blk => {
      const blkRooms = rooms.filter(r => r.block === blk);
      const cells    = blkRooms.map(r => `
        <button class="room-cell room-${r.status}"
                onclick="AdminModule.toggleRoomStatus('${r.roomNo}')"
                title="Room ${r.roomNo} — ${r.status}. Click to toggle.">
          <span class="room-no">${r.roomNo}</span>
          <span class="room-occ">${r.occupants.length}/${r.capacity}</span>
        </button>`).join("");
      return `<div class="block-section">
                <h4 class="block-title">Block ${blk}</h4>
                <div class="room-grid">${cells}</div>
              </div>`;
    }).join("");
  },

  toggleRoomStatus(roomNo) {
    const rooms = StorageHelper.get("hms_rooms") || [];
    const room  = rooms.find(r => r.roomNo === roomNo);
    if (!room) return;
    const cycle = { occupied: "vacant", vacant: "maintenance", maintenance: "occupied" };
    room.status = cycle[room.status] || "vacant";
    StorageHelper.set("hms_rooms", rooms);
    this.refreshAll();
  },

  setRoomStatus(roomNo, status) {
    const rooms = StorageHelper.get("hms_rooms") || [];
    const room  = rooms.find(r => r.roomNo === roomNo);
    if (!room) return;
    room.status = status;
    StorageHelper.set("hms_rooms", rooms);
    this.refreshAll();
  },

  renderRoomDetailTable() {
    const rooms = StorageHelper.get("hms_rooms") || [];
    const el    = document.getElementById("roomDetailTableContainer");
    if (!el) return;

    const rows = rooms.map(r => `
      <tr>
        <td><strong>${r.roomNo}</strong></td>
        <td>Block ${r.block}</td><td>Floor ${r.floor}</td><td>${r.type}</td>
        <td>${r.occupants.length} / ${r.capacity}</td>
        <td>${r.hasAC ? "✅" : "❌"}</td><td>${r.hasWifi ? "✅" : "❌"}</td>
        <td>${RenderModule.badge(r.status)}</td>
        <td>
          <select onchange="AdminModule.setRoomStatus('${r.roomNo}', this.value)" style="font-size:0.8rem;border:1px solid var(--clr-border);border-radius:4px;padding:2px 4px;">
            <option value="occupied"    ${r.status === "occupied"    ? "selected" : ""}>Occupied</option>
            <option value="vacant"      ${r.status === "vacant"      ? "selected" : ""}>Vacant</option>
            <option value="maintenance" ${r.status === "maintenance" ? "selected" : ""}>Maintenance</option>
          </select>
        </td>
      </tr>`).join("");

    el.innerHTML = `
      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead>
            <tr><th>Room</th><th>Block</th><th>Floor</th><th>Type</th><th>Occupants</th><th>AC</th><th>Wi-Fi</th><th>Status</th><th>Set Status</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  },

  renderComplaints() {
    const complaints = (StorageHelper.get("hms_complaints") || [])
      .sort((a, b) => {
        const o = { pending: 0, "in-progress": 1, resolved: 2 };
        return (o[a.status] ?? 3) - (o[b.status] ?? 3);
      });
    const el = document.getElementById("complaintsContainer");
    if (!el) return;

    if (!complaints.length) { el.innerHTML = RenderModule.emptyState("📋","No complaints."); return; }

    const rows = complaints.map(c => `
      <tr>
        <td><strong>${c.id}</strong></td>
        <td>${c.studentName}<br><span style="font-size:0.78rem;color:var(--clr-muted);">${c.roomNo}</span></td>
        <td>
          <div style="font-weight:600;">${c.title || "Complaint"}</div>
          <div style="font-size:0.8rem;color:var(--clr-muted);">${c.description.substring(0, 50)}...</div>
          ${c.image ? `<img src="${c.image}" class="ticket-thumbnail" onclick="window.open(this.src)" title="Click to open attached photo" />` : ""}
        </td>
        <td><span class="badge badge-neutral">${c.category}</span></td>
        <td>${RenderModule.priorityBadge(c.priority)}</td>
        <td>${RenderModule.badge(c.status)}</td>
        <td>${c.date}</td>
        <td>
          ${c.status !== "resolved"
            ? `<button class="btn btn-sm" onclick="AdminModule.advanceTicket('${c.id}')">
               ${c.status === "pending" ? "▶ Start" : "✔ Resolve"}</button>`
            : `<button class="btn btn-sm btn-outline" onclick="AdminModule.reopenTicket('${c.id}')">↩ Reopen</button>`}
        </td>
      </tr>`).join("");

    el.innerHTML = `
      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead>
            <tr><th>ID</th><th>Student</th><th>Issue &amp; Photo</th><th>Category</th><th>Priority</th><th>Status</th><th>Date</th><th>Action</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  },

  advanceTicket(id) {
    const tickets = StorageHelper.get("hms_complaints") || [];
    const t       = tickets.find(c => c.id === id);
    if (!t) return;
    const cycle = { pending: "in-progress", "in-progress": "resolved" };
    t.status = cycle[t.status] || t.status;
    StorageHelper.set("hms_complaints", tickets);
    this.refreshAll();
  },

  reopenTicket(id) {
    const tickets = StorageHelper.get("hms_complaints") || [];
    const t       = tickets.find(c => c.id === id);
    if (!t) return;
    t.status = "pending";
    StorageHelper.set("hms_complaints", tickets);
    this.refreshAll();
  },

  renderGatePasses() {
    const passes = (StorageHelper.get("hms_gatePasses") || [])
      .sort((a,b) => {
        const o = {pending:0, approved:1, "checked-out":2, returned:3, rejected:4};
        return (o[a.status]??5)-(o[b.status]??5);
      });
    const el = document.getElementById("gatePassesContainer");
    if (!el) return;

    if (!passes.length) { el.innerHTML = RenderModule.emptyState("🚪","No gate passes."); return; }

    const rows = passes.map(p => `
      <tr>
        <td><strong>${p.id}</strong><br><span style="font-size:0.78rem;color:var(--clr-muted);font-family:monospace;">${p.qrId}</span></td>
        <td>${p.studentName}<br><span style="font-size:0.78rem;color:var(--clr-muted);">${p.roomNo}</span></td>
        <td>${p.type}</td>
        <td>${p.destination}</td>
        <td>${p.fromDateTime}</td>
        <td>${p.toDateTime}</td>
        <td>${RenderModule.badge(p.status)}</td>
        <td>
          ${p.status === "pending"
            ? `<button class="btn btn-sm" style="background:var(--clr-success);" onclick="AdminModule.updateGatePass('${p.id}','approved')">✅ Approve</button>
               <button class="btn btn-sm" style="background:var(--clr-danger);margin-left:4px;" onclick="AdminModule.updateGatePass('${p.id}','rejected')">❌ Reject</button>`
            : p.status === "approved"
            ? `<button class="btn btn-sm btn-outline" onclick="AdminModule.updateGatePass('${p.id}','pending')">↩ Undo</button>`
            : "—"}
        </td>
      </tr>`).join("");

    el.innerHTML = `
      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead>
            <tr><th>Pass ID / QR</th><th>Student</th><th>Type</th><th>Destination</th><th>From</th><th>To</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  },

  updateGatePass(id, action) {
    const passes = StorageHelper.get("hms_gatePasses") || [];
    const p      = passes.find(x => x.id === id);
    if (!p) return;
    p.status     = action;
    p.approvedBy = action === "approved" ? this.session.id : p.approvedBy;
    StorageHelper.set("hms_gatePasses", passes);
    this.refreshAll();
  },

  renderLeaveApprovals() {
    const leaves = (StorageHelper.get("hms_leaveRequests") || [])
      .sort((a, b) => { const o={pending:0,approved:1,rejected:2}; return (o[a.status]??3)-(o[b.status]??3); });
    const el = document.getElementById("leaveApprovalsContainer");
    if (!el) return;

    if (!leaves.length) { el.innerHTML = RenderModule.emptyState("🚪","No leave requests."); return; }

    const rows = leaves.map(l => `
      <tr>
        <td><strong>${l.id}</strong></td>
        <td>${l.studentName}<br><span style="font-size:0.78rem;color:var(--clr-muted);">${l.roomNo}</span></td>
        <td>${l.fromDate}</td><td>${l.toDate}</td>
        <td style="max-width:200px;white-space:normal;">${l.reason}</td>
        <td>${l.appliedOn}</td>
        <td>${RenderModule.badge(l.status)}</td>
        <td>
          ${l.status === "pending"
            ? `<button class="btn btn-sm" style="background:var(--clr-success);" onclick="AdminModule.updateLeave('${l.id}','approved')">✅ Approve</button>
               <button class="btn btn-sm" style="background:var(--clr-danger);margin-left:4px;" onclick="AdminModule.updateLeave('${l.id}','rejected')">❌ Reject</button>`
            : `<button class="btn btn-sm btn-outline" onclick="AdminModule.updateLeave('${l.id}','pending')">↩ Undo</button>`}
        </td>
      </tr>`).join("");

    el.innerHTML = `
      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead>
            <tr><th>ID</th><th>Student</th><th>From</th><th>To</th><th>Reason</th><th>Applied</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  },

  updateLeave(id, action) {
    const leaves = StorageHelper.get("hms_leaveRequests") || [];
    const l      = leaves.find(x => x.id === id);
    if (!l) return;
    l.status = action;
    StorageHelper.set("hms_leaveRequests", leaves);
    this.refreshAll();
  },

  renderVisitorLog() {
    const visitors = (StorageHelper.get("hms_visitorLog") || [])
      .sort((a,b) => { const o={inside:0,exited:1}; return (o[a.status]??2)-(o[b.status]??2); });
    const el = document.getElementById("visitorLogContainer");
    if (!el) return;

    if (!visitors.length) { el.innerHTML = RenderModule.emptyState("👥","No visitor records."); return; }

    const rows = visitors.map(v => `
      <tr>
        <td><strong>${v.id}</strong></td>
        <td>${v.visitorName}<br><span style="font-size:0.78rem;color:var(--clr-muted);">${v.visitorPhone}</span></td>
        <td>${v.relation}</td>
        <td>${v.hostStudentName}<br><span style="font-size:0.78rem;color:var(--clr-muted);">${v.hostRoomNo}</span></td>
        <td>${v.purpose}</td>
        <td>${v.entryTime}</td>
        <td>${v.exitTime || "—"}</td>
        <td>${RenderModule.badge(v.status)}</td>
      </tr>`).join("");

    el.innerHTML = `
      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead>
            <tr><th>ID</th><th>Visitor</th><th>Relation</th><th>Host Student</th><th>Purpose</th><th>Entry</th><th>Exit</th><th>Status</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  },

  _wireNoticeGenerator() {
    const btn = document.getElementById("generateNoticeBtn");
    if (!btn) return;
    btn.addEventListener("click", () => this.generateNotice());
  },

  generateNotice() {
    const topicEl    = document.getElementById("noticeTopic");
    const audienceEl = document.getElementById("noticeAudience");
    const urgencyEl  = document.getElementById("noticeUrgency");
    const detailsEl  = document.getElementById("noticeDetails");
    const container  = document.getElementById("noticeGeneratedContainer");
    if (!container) return;

    const topic    = topicEl ? topicEl.value : "Mess Inspection";
    const audience = audienceEl ? audienceEl.value : "All Residents";
    const urgency  = urgencyEl ? urgencyEl.value : "Normal";
    const details  = detailsEl ? detailsEl.value.trim() : "";
    const todayStr = new Date().toLocaleDateString("en-IN", { year:'numeric', month:'short', day:'numeric' });

    let title = `${topic.toUpperCase()} — OFFICIAL ANNOUNCEMENT`;
    let content = "";

    switch (topic) {
      case "Mess Inspection":
        title = "OFFICIAL MESS INSPECTION & QUALITY REVIEW";
        content = `To All Residents (${audience}),\n\n` +
          `The Warden Mess Inspection Committee completed its surprise hygiene and ingredient quality audit on ${todayStr}.\n` +
          `• Overall kitchen cleanliness compliance was rated at 98%.\n` +
          `• All drinking water filters (UV+RO) have been serviced and sanitized.\n` +
          `• Special meal requests and diet changes are being incorporated into next week's schedule.\n\n` +
          (details ? `Special Notes:\n${details}\n\n` : "") +
          `Residents experiencing any catering grievances are advised to submit feedback directly via the SmartHMS student portal.\n\n` +
          `Hostel Mess Committee\n${this.session.name} (${this.session.role.toUpperCase()})`;
        break;

      case "Maintenance Shutdown":
        title = "SCHEDULED HOSTEL INFRASTRUCTURE MAINTENANCE";
        content = `To All Residents of ${audience},\n\n` +
          `Please be notified that mandatory utility maintenance will be conducted across the premises on ${todayStr}.\n` +
          `• Water supply lines and overhead pumps will undergo scheduled pressure balancing.\n` +
          `• Backup electrical generators will be tested between scheduled hours.\n\n` +
          (details ? `Operational Schedule & Details:\n${details}\n\n` : "Shutdown Window: 2:00 PM – 5:00 PM.\n\n") +
          `Residents are requested to store essential water beforehand. We regret any temporary inconvenience.\n\n` +
          `Maintenance Department & Hostel Office\nSunrise Hostel`;
        break;

      case "Gate Timing Revision":
        title = "REVISED MAIN GATE ENTRY & EXIT PROTOCOL";
        content = `To All Residents (${audience}),\n\n` +
          `Effective immediately, main campus entry gates will be governed under the revised safety protocol:\n` +
          `1. Gate closes strictly at 10:00 PM daily.\n` +
          `2. Students returning after 10 PM must have an approved Gate Pass in their portal and show QR proof to security.\n` +
          `3. Unauthorized late entries without prior approval will attract an official warning.\n\n` +
          (details ? `Important Instructions:\n${details}\n\n` : "") +
          `Security personnel are authorized to enforce digital QR verification for all arrivals.\n\n` +
          `Office of the Chief Warden\nDr. Ramesh Kumar`;
        break;

      case "Curfew Reminder":
        title = "REMINDER: STRICT ADHERENCE TO HOSTEL CURFEW";
        content = `To All Residents,\n\n` +
          `All students are reminded that curfew timings are strictly 10:00 PM. Silence hours commence from 10:00 PM until 6:00 AM.\n` +
          `Corridor gatherings, loud music, and unauthorized visitors inside rooms are strictly barred.\n\n` +
          (details ? `Special Notice:\n${details}\n\n` : "") +
          `Let us work together to preserve a safe and studious environment.\n\n` +
          `Hostel Administration`;
        break;

      case "Fee Payment Deadline":
        title = "DEADLINE REMINDER: SEMESTER HOSTEL & MESS FEES";
        content = `To All Residents (${audience}),\n\n` +
          `This is a final reminder that all outstanding hostel and mess dues for the current term must be settled immediately.\n` +
          `• Clear dues online via the college portal or submit DD receipts at the office.\n` +
          `• Late fees of ₹50/day will apply to balances outstanding after the cutoff date.\n\n` +
          (details ? `Accounts Office Note:\n${details}\n\n` : "") +
          `Accounts & Finance Department\nSunrise Hostel`;
        break;

      default:
        title = `${topic.toUpperCase()} — ANNOUNCEMENT`;
        content = `To All Residents (${audience}),\n\n` +
          `This is an official announcement regarding: ${topic}.\n\n` +
          (details ? `${details}\n\n` : "Please observe all regulations accordingly.\n\n") +
          `Hostel Administration\nSunrise Hostel`;
    }

    container.innerHTML = `
      <div style="margin-bottom:var(--sp-sm);">
        <label style="font-weight:700;font-size:0.85rem;">Notice Title (Editable):</label>
        <input type="text" id="editableNoticeTitle" class="form-control" value="${title}" style="font-weight:700;" />
      </div>
      <div style="margin-bottom:var(--sp-sm);">
        <label style="font-weight:700;font-size:0.85rem;">Notice Content (Editable):</label>
        <textarea id="editableNoticeContent" class="notice-editor-box">${content}</textarea>
      </div>
      <div style="display:flex;gap:var(--sp-sm);flex-wrap:wrap;margin-top:var(--sp-md);">
        <button type="button" class="btn btn-primary" onclick="AdminModule.publishNotice('${topic}','${audience}','${urgency}')">
          📢 Publish to Student Portal
        </button>
        <button type="button" class="btn btn-outline" onclick="AdminModule.copyNoticeText()">
          📋 Copy to Clipboard
        </button>
      </div>`;
  },

  copyNoticeText() {
    const textEl = document.getElementById("editableNoticeContent");
    if (!textEl) return;
    navigator.clipboard.writeText(textEl.value).then(() => {
      alert("✅ Notice copied to clipboard!");
    });
  },

  publishNotice(topic, audience, urgency) {
    const titleEl   = document.getElementById("editableNoticeTitle");
    const contentEl = document.getElementById("editableNoticeContent");
    if (!titleEl || !contentEl) return;

    const title   = titleEl.value.trim();
    const content = contentEl.value.trim();

    if (!title || !content) {
      alert("Please ensure both title and content are populated.");
      return;
    }

    const notices = StorageHelper.get("hms_notices") || [];
    const newId   = `NTC-${String(notices.length + 1).padStart(3, "0")}`;

    notices.unshift({
      id: newId,
      title,
      topic,
      targetAudience: audience,
      date: new Date().toISOString().split("T")[0],
      postedBy: `${this.session.name} (${this.session.role.toUpperCase()})`,
      urgency,
      content,
      status: "Active"
    });

    StorageHelper.set("hms_notices", notices);
    alert(`✅ Notice "${title}" published! Students can view it on their dashboard.`);
    this.renderActiveNotices();
  },

  deleteNotice(id) {
    if (!confirm("Are you sure you want to remove this notice?")) return;
    let notices = StorageHelper.get("hms_notices") || [];
    notices = notices.filter(n => n.id !== id);
    StorageHelper.set("hms_notices", notices);
    this.renderActiveNotices();
  },

  renderActiveNotices() {
    const el = document.getElementById("activeNoticesList");
    if (!el) return;

    const notices = StorageHelper.get("hms_notices") || [];
    if (!notices.length) {
      el.innerHTML = RenderModule.emptyState("📢", "No active announcements published yet.");
      return;
    }

    el.innerHTML = notices.map(n => `
      <div class="notice-card ${n.urgency === 'Urgent' ? 'notice-urgent' : ''}">
        <div class="notice-header">
          <div>
            <span class="notice-title">${n.title}</span>
            <span style="font-size:0.75rem;color:var(--clr-muted);margin-left:8px;">ID: ${n.id}</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="badge ${n.urgency === 'Urgent' ? 'badge-high' : 'badge-neutral'}">${n.urgency}</span>
            <button class="btn btn-sm btn-outline" style="color:var(--clr-danger);border-color:#fca5a5;" onclick="AdminModule.deleteNotice('${n.id}')">Delete</button>
          </div>
        </div>
        <div class="notice-meta">📅 Published on: ${n.date} · 👤 By: ${n.postedBy} · 🎯 Audience: ${n.targetAudience}</div>
        <div class="notice-body">${n.content}</div>
      </div>`).join("");
  },

  renderFeedbackInsights() {
    const summaryCard = document.getElementById("sentimentSummaryCard");
    const container   = document.getElementById("adminFeedbackContainer");
    if (!summaryCard && !container) return;

    const feedbacks = StorageHelper.get("hms_feedback") || [];
    const total = feedbacks.length;
    const positiveCount = feedbacks.filter(f => f.sentiment === "Positive").length;
    const neutralCount  = feedbacks.filter(f => f.sentiment === "Neutral").length;
    const negativeCount = feedbacks.filter(f => f.sentiment === "Negative").length;

    const posPct = total ? Math.round((positiveCount / total) * 100) : 0;
    const neuPct = total ? Math.round((neutralCount  / total) * 100) : 0;
    const negPct = total ? Math.round((negativeCount / total) * 100) : 0;
    const avgRating = total ? (feedbacks.reduce((sum, f) => sum + (Number(f.rating) || 3), 0) / total).toFixed(1) : "0.0";

    if (summaryCard) {
      summaryCard.innerHTML = `
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:var(--sp-sm);">
          <div>
            <h3 style="margin-bottom:4px;">📊 AI Sentiment Analytics</h3>
            <p style="color:var(--clr-muted);font-size:0.85rem;margin:0;">Aggregated feedback sentiment computed via real-time heuristic NLP.</p>
          </div>
          <div style="font-size:1.15rem;font-weight:700;">
            Average Rating: ⭐ ${avgRating} / 5.0
          </div>
        </div>

        <div class="sentiment-meter-bar" title="Positive: ${posPct}% | Neutral: ${neuPct}% | Negative: ${negPct}%">
          <div class="sentiment-seg-pos" style="width:${posPct}%;"></div>
          <div class="sentiment-seg-neu" style="width:${neuPct}%;"></div>
          <div class="sentiment-seg-neg" style="width:${negPct}%;"></div>
        </div>

        <div class="sentiment-stats-row">
          <div class="sentiment-stat-pill"><span class="sentiment-stat-dot" style="background:#22c55e;"></span><span>Positive: <strong>${positiveCount}</strong> (${posPct}%)</span></div>
          <div class="sentiment-stat-pill"><span class="sentiment-stat-dot" style="background:#f59e0b;"></span><span>Neutral: <strong>${neutralCount}</strong> (${neuPct}%)</span></div>
          <div class="sentiment-stat-pill"><span class="sentiment-stat-dot" style="background:#ef4444;"></span><span>Negative: <strong>${negativeCount}</strong> (${negPct}%)</span></div>
          <div class="sentiment-stat-pill"><span>Total Submissions: <strong>${total}</strong></span></div>
        </div>`;
    }

    if (container) {
      if (!feedbacks.length) {
        container.innerHTML = RenderModule.emptyState("💬", "No student feedback records received yet.");
        return;
      }

      const rows = feedbacks.map(f => `
        <tr>
          <td><strong>${f.id}</strong></td>
          <td>${f.studentName}<br><span style="font-size:0.78rem;color:var(--clr-muted);">${f.roomNo}</span></td>
          <td>${f.category}</td>
          <td>${RenderModule.stars(f.rating)}</td>
          <td>${RenderModule.sentimentBadge(f.sentiment)}</td>
          <td style="max-width:320px;white-space:normal;font-size:0.88rem;">${f.message}</td>
          <td>${f.date}</td>
        </tr>`).join("");

      container.innerHTML = `
        <div style="overflow-x:auto;">
          <table class="data-table">
            <thead>
              <tr><th>ID</th><th>Student</th><th>Category</th><th>Rating</th><th>Sentiment</th><th>Comments</th><th>Date</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>`;
    }
  }
};


// ─────────────────────────────────────────────────────────────
//  SECURITY MODULE — Security Guard Portal
// ─────────────────────────────────────────────────────────────
const SecurityModule = {
  session: null,

  init() {
    this.session = AuthModule.requireAuth("security");
    if (!this.session) return;

    const nameEl = document.getElementById("sidebarUserName");
    if (nameEl) nameEl.textContent = this.session.name;

    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) logoutBtn.addEventListener("click", () => AuthModule.logout());

    TabModule.init(".tab-nav", ".tab-panel");
    SafetyModule.initAdminOrSecurity();
    this._wireQRVerifier();
    this._renderVisitorLog();
    this._wireVisitorForm();
    this._renderGatePassQueue();
    AIAssistantModule.init();
  },

  _wireQRVerifier() {
    const form      = document.getElementById("qrVerifierForm");
    const resultBox = document.getElementById("qrResult");
    const camBtn    = document.getElementById("simulateCameraScanBtn");
    if (!form) return;

    form.addEventListener("submit", e => {
      e.preventDefault();
      const qrId = form.qrInput.value.trim().toUpperCase();
      this.verifyCode(qrId);
    });

    if (camBtn) {
      camBtn.addEventListener("click", () => {
        const passes = StorageHelper.get("hms_gatePasses") || [];
        const candidate = passes.find(p => p.status === "approved" || p.status === "checked-out") || passes[0];
        if (candidate) {
          form.qrInput.value = candidate.qrId;
          this.verifyCode(candidate.qrId);
        } else {
          alert("No test passes found in queue.");
        }
      });
    }

    document.querySelectorAll(".qr-test-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        form.qrInput.value = btn.getAttribute("data-qr");
        this.verifyCode(btn.getAttribute("data-qr"));
      });
    });
  },

  verifyCode(qrId) {
    const resultBox = document.getElementById("qrResult");
    if (!resultBox) return;

    // Check if it is a visitor pass
    if (qrId.startsWith("VQR-") || qrId.startsWith("VIS-")) {
      const visitors = StorageHelper.get("hms_visitorLog") || [];
      const v = visitors.find(x => x.qrId.toUpperCase() === qrId || x.id.toUpperCase() === qrId);
      if (!v) {
        resultBox.innerHTML = `
          <div class="qr-result qr-invalid">
            <div class="qr-result-icon">❌</div>
            <div class="qr-result-title">INVALID VISITOR PASS</div>
            <div class="qr-result-note">No visitor pass found for ID: <strong>${qrId}</strong>.</div>
          </div>`;
        return;
      }

      resultBox.innerHTML = `
        <div class="qr-result qr-valid">
          <div class="qr-result-icon">👤</div>
          <div class="qr-result-title">VISITOR RECORD VERIFIED</div>
          <div class="qr-result-rows">
            <div><span>Visitor Name:</span> <strong>${v.visitorName} (${v.relation})</strong></div>
            <div><span>Host Student:</span> <strong>${v.hostStudentName} (Room ${v.hostRoomNo})</strong></div>
            <div><span>Purpose:</span> ${v.purpose}</div>
            <div><span>Entry Timestamp:</span> ${v.entryTime}</div>
            <div><span>Current Status:</span> ${RenderModule.badge(v.status)}</div>
          </div>
          ${v.status === "inside" ? `
            <button class="btn btn-primary" style="margin-top:10px;" onclick="SecurityModule.markVisitorExit('${v.id}'); SecurityModule.verifyCode('${qrId}');">
              ✔ Mark Visitor Exit Now
            </button>` : `<span class="badge badge-resolved" style="margin-top:8px;">Visitor has already exited campus</span>`}
        </div>`;
      return;
    }

    // Check Gate Pass
    const passes = StorageHelper.get("hms_gatePasses") || [];
    const pass   = passes.find(p => p.qrId.toUpperCase() === qrId || p.id.toUpperCase() === qrId);

    if (!pass) {
      resultBox.innerHTML = `
        <div class="qr-result qr-invalid">
          <div class="qr-result-icon">❌</div>
          <div class="qr-result-title">INVALID GATE PASS CODE</div>
          <div class="qr-result-note">No gate pass found for: <strong>${qrId}</strong>. Access denied.</div>
        </div>`;
      return;
    }

    const isValid = pass.status === "approved" || pass.status === "checked-out";
    const now     = new Date().toLocaleString("en-IN", { hour12: true });

    let actionBtnHtml = "";
    if (pass.status === "approved") {
      actionBtnHtml = `
        <button class="btn btn-primary" style="margin-top:10px;" onclick="SecurityModule.togglePassStatus('${pass.id}', 'checked-out')">
          🚶 Authorize Student Exit (Check-Out)
        </button>`;
    } else if (pass.status === "checked-out") {
      actionBtnHtml = `
        <button class="btn btn-sm" style="background:#22c55e;color:#fff;margin-top:10px;" onclick="SecurityModule.togglePassStatus('${pass.id}', 'returned')">
          🏠 Log Student Return (Check-In)
        </button>`;
    }

    const statusMsg = {
      approved: "PASSED — Authorized for Exit",
      "checked-out": "STUDENT CURRENTLY OUT — Awaiting Return",
      returned: "RETURNED — Resident Inside Campus",
      rejected: "REJECTED PASS — Entry/Exit Denied",
      pending: "PENDING WARDEN APPROVAL — Exit Denied"
    };

    resultBox.innerHTML = `
      <div class="qr-result ${isValid ? 'qr-valid' : (pass.status === 'returned' ? 'qr-valid' : 'qr-warn')}">
        <div class="qr-result-icon">${pass.status === 'approved' ? '✅' : (pass.status === 'checked-out' ? '🚶' : (pass.status === 'returned' ? '🏠' : '⚠️'))}</div>
        <div class="qr-result-title">${statusMsg[pass.status] || pass.status.toUpperCase()}</div>
        <div class="qr-result-rows">
          <div><span>Pass ID:</span> <strong>${pass.id}</strong></div>
          <div><span>QR Code:</span> <strong>${pass.qrId}</strong></div>
          <div><span>Student Name:</span> <strong>${pass.studentName}</strong></div>
          <div><span>Room Allocation:</span> <strong>Room ${pass.roomNo}</strong></div>
          <div><span>Category &amp; Destination:</span> ${pass.type.toUpperCase()} · ${pass.destination}</div>
          <div><span>Validity Window:</span> ${pass.fromDateTime} to ${pass.toDateTime}</div>
          <div><span>Check-Out Log:</span> ${pass.checkOutTime || "Not yet exited"}</div>
          <div><span>Return Log:</span> ${pass.checkInTime || "Not yet returned"}</div>
        </div>
        ${actionBtnHtml}
      </div>`;
  },

  togglePassStatus(passId, newStatus) {
    const passes = StorageHelper.get("hms_gatePasses") || [];
    const pass = passes.find(p => p.id === passId);
    if (!pass) return;

    const now = new Date().toLocaleString("en-IN", { hour12: true });
    pass.status = newStatus;
    if (newStatus === "checked-out") {
      pass.checkOutTime = now;
      pass.guardId = this.session.id;
    } else if (newStatus === "returned") {
      pass.checkInTime = now;
      pass.guardId = this.session.id;
    }

    StorageHelper.set("hms_gatePasses", passes);
    this.verifyCode(pass.qrId);
    this._renderGatePassQueue();
  },

  _renderGatePassQueue() {
    const passes = StorageHelper.get("hms_gatePasses") || [];
    const el     = document.getElementById("gatePassQueueContainer");
    if (!el) return;

    if (!passes.length) { el.innerHTML = RenderModule.emptyState("🚪","No gate passes today."); return; }

    const rows = passes.map(p => `
      <tr>
        <td><span style="font-size:0.8rem;font-family:monospace;">${p.qrId}</span></td>
        <td>${p.studentName}</td>
        <td>${p.roomNo}</td>
        <td>${p.type}</td>
        <td>${p.destination}</td>
        <td>${p.toDateTime}</td>
        <td>${RenderModule.badge(p.status)}</td>
        <td>
          <button class="btn btn-sm btn-outline" onclick="SecurityModule.verifyCode('${p.qrId}')">Verify</button>
        </td>
      </tr>`).join("");

    el.innerHTML = `
      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead>
            <tr><th>QR Code</th><th>Student</th><th>Room</th><th>Type</th><th>Destination</th><th>Return By</th><th>Status</th><th>Scan Action</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  },

  _renderVisitorLog() {
    const visitors = (StorageHelper.get("hms_visitorLog") || [])
      .sort((a,b) => { const o={inside:0,exited:1}; return (o[a.status]??2)-(o[b.status]??2); });
    const el = document.getElementById("visitorLogSecurity");
    if (!el) return;

    if (!visitors.length) { el.innerHTML = RenderModule.emptyState("👥","No visitors logged today."); return; }

    const rows = visitors.map(v => `
      <tr>
        <td><strong>${v.id}</strong></td>
        <td>${v.visitorName}<br><span style="font-size:0.78rem;color:var(--clr-muted);">${v.visitorPhone}</span></td>
        <td>${v.relation}</td>
        <td>${v.hostStudentName} (${v.hostRoomNo})</td>
        <td>${v.purpose}</td>
        <td>${v.entryTime}</td>
        <td>${v.exitTime || "—"}</td>
        <td>${RenderModule.badge(v.status)}</td>
        <td>
          ${v.status === "inside"
            ? `<button class="btn btn-sm" onclick="SecurityModule.markVisitorExit('${v.id}')">✔ Mark Exit</button>`
            : "—"}
        </td>
      </tr>`).join("");

    el.innerHTML = `
      <div style="overflow-x:auto;">
        <table class="data-table">
          <thead>
            <tr><th>ID</th><th>Visitor</th><th>Relation</th><th>Host</th><th>Purpose</th><th>Entry</th><th>Exit</th><th>Status</th><th>Action</th></tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  },

  markVisitorExit(id) {
    const visitors = StorageHelper.get("hms_visitorLog") || [];
    const v        = visitors.find(x => x.id === id);
    if (!v) return;
    v.status   = "exited";
    v.exitTime = new Date().toLocaleString("en-IN", { year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false });
    StorageHelper.set("hms_visitorLog", visitors);
    this._renderVisitorLog();
  },

  _wireVisitorForm() {
    const form = document.getElementById("visitorRegForm");
    const msg  = document.getElementById("visitorRegMsg");
    if (!form) return;

    form.addEventListener("submit", e => {
      e.preventDefault();
      const vName    = form.visitorName.value.trim();
      const vPhone   = form.visitorPhone.value.trim();
      const relation = form.relation.value.trim();
      const hostId   = form.hostStudentId.value.trim().toUpperCase();
      const purpose  = form.purpose.value.trim();

      if (!vName || !vPhone || !hostId || !purpose) {
        RenderModule.showFormMessage(msg, "error", "Please fill all required fields.");
        return;
      }

      const users = StorageHelper.get("hms_users") || [];
      const host  = users.find(u => u.id === hostId && u.role === "student");
      if (!host) {
        RenderModule.showFormMessage(msg, "error", `Student ID "${hostId}" not found.`);
        return;
      }

      const visitors = StorageHelper.get("hms_visitorLog") || [];
      const newId    = `VIS-${String(visitors.length + 1).padStart(3, "0")}`;
      const qrId     = `VQR-${new Date().getFullYear()}-${String(visitors.length + 1).padStart(3, "0")}`;
      const now      = new Date().toLocaleString("en-IN", { year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false });

      visitors.push({
        id: newId, qrId,
        visitorName: vName, visitorPhone: vPhone, relation: relation || "Guest",
        hostStudentId: host.id, hostStudentName: host.name, hostRoomNo: host.roomNo,
        purpose, entryTime: now, exitTime: null,
        guardId: this.session.id, status: "inside"
      });

      StorageHelper.set("hms_visitorLog", visitors);
      form.reset();
      RenderModule.showFormMessage(msg, "success", `✅ Visitor ${vName} registered as ${newId}.`);
      this._renderVisitorLog();
    });
  }
};


// ─────────────────────────────────────────────────────────────
//  LOGIN MODULE
// ─────────────────────────────────────────────────────────────
const LoginModule = {
  currentRole: "student",

  init() {
    const session = AuthModule.getSession();
    if (session) { AuthModule.redirectByRole(session.role); return; }

    this._wireRoleTabs();
    this._wireLoginForm();
  },

  _wireRoleTabs() {
    const tabs = document.querySelectorAll(".role-tab");
    tabs.forEach(tab => {
      tab.addEventListener("click", () => {
        tabs.forEach(t => t.classList.remove("active"));
        tab.classList.add("active");
        this.currentRole = tab.getAttribute("data-role");
        this._updateDemoHint();
        const err = document.getElementById("loginError");
        if (err) err.classList.remove("visible");
      });
    });
    this._updateDemoHint();
  },

  _updateDemoHint() {
    const hintEl = document.getElementById("demoHint");
    if (!hintEl) return;
    const hints = {
      student:  "<strong>Demo (Student):</strong> ID: <code>S001</code> &nbsp;| Password: <code>password123</code>",
      warden:   "<strong>Demo (Warden):</strong> ID: <code>W001</code> &nbsp;| Password: <code>warden123</code>",
      admin:    "<strong>Demo (Admin):</strong> ID: <code>A001</code> &nbsp;| Password: <code>admin123</code>",
      security: "<strong>Demo (Security):</strong> ID: <code>G001</code> &nbsp;| Password: <code>guard123</code>"
    };
    hintEl.innerHTML = hints[this.currentRole] || "";
  },

  _wireLoginForm() {
    const form = document.getElementById("loginForm");
    if (!form) return;

    form.addEventListener("submit", e => {
      e.preventDefault();
      const userId   = form.userId.value.trim();
      const password = form.password.value;
      const errorEl  = document.getElementById("loginError");

      const user = AuthModule.login(userId, password);
      if (!user) {
        errorEl.textContent = "❌ Invalid ID or password. Please verify your credentials.";
        errorEl.classList.add("visible");
        return;
      }

      if (user.role !== this.currentRole) {
        errorEl.textContent = `❌ This account is registered as role "${user.role}". Please select the correct tab above.`;
        errorEl.classList.add("visible");
        return;
      }

      AuthModule.redirectByRole(user.role);
    });
  }
};


// ─────────────────────────────────────────────────────────────
//  BOOTSTRAP — Universal Page Router & Global Initializer
// ─────────────────────────────────────────────────────────────
function bootstrap() {
  // Always initialize Theme & Mobile Navigation on every page
  ThemeModule.init();
  MobileNavModule.init();

  const page = window.location.pathname.split("/").pop() || "index.html";

  if (page === "login.html" || document.getElementById("loginForm")) {
    LoginModule.init();
  } else if (page === "student-dashboard.html") {
    StudentModule.init();
  } else if (page === "admin-dashboard.html") {
    AdminModule.init();
  } else if (page === "security-dashboard.html") {
    SecurityModule.init();
  } else if (page === "index.html" || page === "") {
    AIAssistantModule.init();
  }
}

document.addEventListener("DOMContentLoaded", bootstrap);
