# 🏨 Smart Hostel Management System (SmartHMS)

A modern, responsive, zero-dependency web application designed for college hostel operations. Built with pure vanilla HTML5, modern CSS, and modular JavaScript with simulated AI capabilities and `localStorage` persistence.

---

## 📁 Project Directory Structure

```text
HMS/
├── index.html               # Public landing page (Hero, facilities, stats, rules, contact)
├── login.html               # Dedicated resident & warden login portal with role switcher
├── student-dashboard.html   # Student portal (Room details, mess, leave, AI tickets, chatbot)
├── admin-dashboard.html     # Warden portal (Real-time counters, room grid, tickets, leave approval)
├── styles.css               # Shared CSS design system (tokens, cards, responsive layout, badges)
├── data.js                  # Initial seed data and StorageHelper abstraction layer
├── app.js                   # Core application logic, modular controllers, and AI engines
└── README.md                # Project documentation and presentation guide
```

### File Responsibilities

| File | Primary Role | Key Technologies / Concepts |
| :--- | :--- | :--- |
| `index.html` | Public Landing Page | Hero section, facilities, real-time statistics, rules, and contact info |
| `login.html` | Authentication Portal | Dual-tab login (Student vs Warden), sessionStorage session creation |
| `student-dashboard.html` | Student Portal | Room info, weekly mess menu, leave form, AI complaint form, chatbot |
| `admin-dashboard.html` | Warden Portal | Real-time counters, interactive room grid, ticket resolution, leave approval |
| `styles.css` | UI/UX & Responsive Design | CSS Variables (design tokens), Flexbox, CSS Grid, mobile media queries |
| `data.js` | Storage & Seeding | `localStorage` persistence wrapper, initial database seeding (`SEED_DATA`) |
| `app.js` | Business Logic & AI | Module pattern (`AuthModule`, `AICategorizer`, `AIAssistantModule`, etc.) |

---

## 🚀 How to Launch the App Locally

### Option 1: Using Python HTTP Server (Recommended)
You can run a lightweight local web server using Python:

1. Open your terminal or PowerShell in the project directory:
   ```powershell
   cd c:\Users\DELL\Desktop\HMS
   ```
2. Start the local server:
   ```powershell
   python -m http.server 8000
   ```
3. Open your web browser and navigate to:
   [http://localhost:8000](http://localhost:8000)

### Option 2: Direct File Launch
Because this project uses vanilla web technologies without any build steps or external dependencies, you can also double-click `index.html` to open it directly in Google Chrome, Microsoft Edge, or Mozilla Firefox.

---

## 🔑 Demo Login Credentials

| Role | User ID | Password | Access Rights |
| :--- | :--- | :--- | :--- |
| **Student** | `S001` | `password123` | Room A-101 details, file complaints, apply for leave, chat with bot |
| **Student** | `S003` | `pass789` | Room B-201 details |
| **Warden (Admin)** | `W001` | `warden123` | Full control over room occupancy, ticket progress, leave approvals |
| **Warden (Admin)** | `W002` | `warden456` | Secondary warden account |

---

## 🧠 Code Architecture & Core Logic Explained

### 1. Data Layer (`data.js`)
* **First-Run Seeding (`initData()`):** On application startup, `data.js` checks if the key `hms_version` exists in `localStorage`. If absent, it writes the default `SEED_DATA` (rooms, users, complaints, menus, rules) to `localStorage`.
* **Storage Abstraction (`StorageHelper`):** Encapsulates `localStorage.getItem` and `localStorage.setItem` with automatic `JSON.parse` and `JSON.stringify` handling to prevent serialization bugs.

### 2. State & Session Management (`AuthModule` in `app.js`)
* **Session Storage:** Active user session (`id`, `name`, `role`, `roomNo`) is stored in `sessionStorage` under `hms_session`.
* **Route Guards (`requireAuth(role)`):** Ensures unauthorized users or users with mismatched roles are redirected back to `index.html`.

### 3. AI Complaint Auto-Categorization (`AICategorizer` in `app.js`)
* **Natural Language Processing Simulation:** Analyzes student complaint descriptions in real time as they type.
* **Category Rules:** Detects categories such as `Electrical`, `Plumbing`, `Furniture`, `Cleanliness`, `Internet / Wi-Fi`, or `Air Conditioning` using keyword dictionaries.
* **Urgency & Priority Rules:** Flags urgency keywords (e.g., *"spark"*, *"flood"*, *"shock"*, *"fire"*, *"burst"*) to automatically elevate priority to **High** or **Medium**.
* **Live Feedback:** Shows an interactive preview card (`#aiPreviewBox`) before submission, eliminating tedious manual dropdown selection.
* **External AI Readiness:** Clearly labeled hook points (`── GEMINI API HOOK ──`) allow dropping in a live Google Gemini API endpoint with minimal code changes.

### 4. Floating AI Hostel Assistant (`AIAssistantModule` in `app.js`)
* Dynamically injects a non-intrusive floating chat button (`#aiw-toggle`) and modal window (`#aiw-modal`) on the bottom-right of the dashboard.
* Contains an intelligent knowledge base answering queries on mess schedules, gate curfew, visitor permissions, leave guidelines, fee refund rules, and emergency contacts.
* Features animated typing indicator dots and quick-reply question chips.

### 5. Warden Real-Time Dashboard (`AdminModule` in `app.js`)
* **Live Top Counters:** Instantly counts Total Students, Available Rooms, and Unresolved Tickets directly from `localStorage`.
* **One-Click Room Status Toggle:** Clicking any room cell in the room grid cycles status dynamically:
  Occupied -> Vacant -> Under Maintenance -> Occupied
* **3-Stage Complaint Workflow:** Advances tickets through:
  Pending -> In Progress -> Resolved
  Includes a **Reopen** feature to undo accidental closures.
* **Leave Decision Panel:** One-click **Approve** and **Reject** buttons with full **Undo** capability.
* **Unified Sync (`refreshAll()`):** Any mutation automatically synchronizes the top counters, KPI cards, and data tables across the UI without requiring a page refresh.

---

## 🎓 College Viva / Presentation Preparation Guide

### Q1: What architecture does this project follow?
> **Answer:** The project follows a modular client-side Single Page Architecture pattern implemented with vanilla JavaScript. It separates concerns into data persistence (`data.js`), presentation/layout (`styles.css`), and business logic modules (`app.js`) using plain JavaScript objects (`AuthModule`, `StudentModule`, `AdminModule`, `AICategorizer`, `AIAssistantModule`).

### Q2: How does data persist without a dedicated SQL backend?
> **Answer:** We use the browser's native Web Storage API (`localStorage`). `data.js` initializes default seed data on first run. Any changes made by the student (e.g. submitting a ticket) or the warden (e.g. toggling a room status or resolving a ticket) update the JSON structures in `localStorage`. This data persists across browser reloads.

### Q3: How does the AI Categorizer determine complaint categories and urgency?
> **Answer:** It uses rule-based Natural Language Processing with weighted keyword dictionaries. As the student types their complaint description, `AICategorizer.categorize()` evaluates lexical triggers (e.g., "fan", "spark", "water leak") and maps them to technical categories. Urgency modifiers automatically elevate the ticket priority to High. The module is also structured with an async hook to swap in the Google Gemini REST API.

### Q4: How is security handled for student vs warden access?
> **Answer:** We implement route-level authentication guards via `AuthModule.requireAuth(role)`. On page load, `sessionStorage` is inspected for a valid session token and matching role. If a student attempts to open `admin-dashboard.html`, the guard detects the role mismatch and immediately redirects to `index.html`.

### Q5: How do the Warden's actions reflect in real time?
> **Answer:** All state mutations trigger a centralized `AdminModule.refreshAll()` method. This recalculates computed metrics (such as available rooms, occupancy percentage, and unresolved ticket count) and updates the DOM nodes simultaneously, maintaining strict state consistency.
