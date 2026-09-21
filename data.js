/**
 * ============================================================
 *  data.js — Seed Data & localStorage Helpers  (v2.0)
 *  Smart Hostel Management System — Sprint 1
 * ============================================================
 *
 *  Collections:
 *    users            — accounts for Student, Warden, Admin, Security
 *    studentProfiles  — extended student details, emergency contacts
 *    blocks           — A/B/C block and floor metadata
 *    rooms            — room records (unchanged structure)
 *    messMenu         — weekly menu (unchanged)
 *    complaints       — maintenance tickets (unchanged)
 *    leaveRequests    — leave applications (unchanged)
 *    gatePasses       — outpass / overnight passes with QR IDs
 *    feeRecords       — hostel + mess fee payment records
 *    visitorLog       — visitor registry (name, host, timestamps, QR)
 *    rules            — hostel rules for chatbot
 * ============================================================
 */

// ─────────────────────────────────────────────
//  SECTION 1 — SEED DATA
// ─────────────────────────────────────────────
const SEED_DATA = {

  // ── Version — bump this to re-seed localStorage ────────────────
  _version: "hms-v2.1",

  // ── User accounts (all 4 roles) ────────────────────────────────
  users: [
    // ── Students ──────────────────────────────────────────────────
    { id: "S001", password: "password123", role: "student",  name: "Aarav Sharma",    roomNo: "A-101" },
    { id: "S002", password: "pass456",     role: "student",  name: "Priya Patel",     roomNo: "A-102" },
    { id: "S003", password: "pass789",     role: "student",  name: "Rohan Mehta",     roomNo: "B-201" },
    { id: "S004", password: "passabc",     role: "student",  name: "Sneha Iyer",      roomNo: "B-202" },
    { id: "S005", password: "passdef",     role: "student",  name: "Karan Verma",     roomNo: "C-301" },
    { id: "S006", password: "passghi",     role: "student",  name: "Divya Nair",      roomNo: "C-302" },
    { id: "S007", password: "passjkl",     role: "student",  name: "Arjun Singh",     roomNo: "A-201" },
    { id: "S008", password: "passmno",     role: "student",  name: "Meena Krishnan",  roomNo: "B-301" },
    // ── Wardens ───────────────────────────────────────────────────
    { id: "W001", password: "warden123",   role: "warden",   name: "Dr. Ramesh Kumar",  roomNo: null },
    { id: "W002", password: "warden456",   role: "warden",   name: "Ms. Sunita Rao",    roomNo: null },
    // ── Administrators ────────────────────────────────────────────
    { id: "A001", password: "admin123",    role: "admin",    name: "Mr. Vijay Desai",   roomNo: null },
    { id: "A002", password: "admin456",    role: "admin",    name: "Dr. Anita Joshi",   roomNo: null },
    // ── Security Guards ───────────────────────────────────────────
    { id: "G001", password: "guard123",    role: "security", name: "Suresh Patil",      roomNo: null },
    { id: "G002", password: "guard456",    role: "security", name: "Ravi Kumar",        roomNo: null }
  ],

  // ── Student Profiles (extended details) ────────────────────────
  // Includes: course, year, emergency contacts, document placeholders, room history
  studentProfiles: [
    {
      studentId: "S001",
      name: "Aarav Sharma",
      roomNo: "A-101",
      block: "A",
      photo: null,                                     // placeholder for uploaded photo
      course: "B.Tech Computer Science",
      year: "3rd Year",
      enrollNo: "CSE/2024/001",
      phone: "+91-98765-43201",
      email: "aarav.sharma@sunrise.edu",
      bloodGroup: "O+",
      dob: "2004-03-12",
      hometown: "Jaipur, Rajasthan",
      aadharNo: "XXXX-XXXX-3201",            // masked for privacy
      emergencyContact: { name: "Rajesh Sharma", relation: "Father", phone: "+91-94000-11001" },
      documents: { aadhar: true, photo: true, tc: true, medicalCert: false },
      roomHistory: [
        { roomNo: "A-103", from: "2024-08-01", to: "2024-12-31", reason: "Initial allotment" },
        { roomNo: "A-101", from: "2025-01-01", to: null,          reason: "Room change request" }
      ]
    },
    {
      studentId: "S002",
      name: "Priya Patel",
      roomNo: "A-102",
      block: "A",
      photo: null,
      course: "B.Tech Electronics",
      year: "2nd Year",
      enrollNo: "ECE/2025/002",
      phone: "+91-98765-43202",
      email: "priya.patel@sunrise.edu",
      bloodGroup: "A+",
      dob: "2005-07-25",
      hometown: "Ahmedabad, Gujarat",
      aadharNo: "XXXX-XXXX-3202",
      emergencyContact: { name: "Kiran Patel", relation: "Mother", phone: "+91-94000-11002" },
      documents: { aadhar: true, photo: true, tc: true, medicalCert: true },
      roomHistory: [
        { roomNo: "A-102", from: "2025-08-01", to: null, reason: "Initial allotment" }
      ]
    },
    {
      studentId: "S003",
      name: "Rohan Mehta",
      roomNo: "B-201",
      block: "B",
      photo: null,
      course: "B.Tech Mechanical",
      year: "3rd Year",
      enrollNo: "MECH/2024/003",
      phone: "+91-98765-43203",
      email: "rohan.mehta@sunrise.edu",
      bloodGroup: "B+",
      dob: "2004-11-08",
      hometown: "Mumbai, Maharashtra",
      aadharNo: "XXXX-XXXX-3203",
      emergencyContact: { name: "Sunil Mehta", relation: "Father", phone: "+91-94000-11003" },
      documents: { aadhar: true, photo: true, tc: false, medicalCert: false },
      roomHistory: [
        { roomNo: "B-201", from: "2024-08-01", to: null, reason: "Initial allotment" }
      ]
    },
    {
      studentId: "S004",
      name: "Sneha Iyer",
      roomNo: "B-202",
      block: "B",
      photo: null,
      course: "B.Sc Physics",
      year: "1st Year",
      enrollNo: "PHY/2026/004",
      phone: "+91-98765-43204",
      email: "sneha.iyer@sunrise.edu",
      bloodGroup: "AB-",
      dob: "2006-02-14",
      hometown: "Chennai, Tamil Nadu",
      aadharNo: "XXXX-XXXX-3204",
      emergencyContact: { name: "Lakshmi Iyer", relation: "Mother", phone: "+91-94000-11004" },
      documents: { aadhar: true, photo: true, tc: true, medicalCert: true },
      roomHistory: [
        { roomNo: "B-202", from: "2026-08-01", to: null, reason: "Initial allotment" }
      ]
    },
    {
      studentId: "S005",
      name: "Karan Verma",
      roomNo: "C-301",
      block: "C",
      photo: null,
      course: "B.Tech Civil",
      year: "4th Year",
      enrollNo: "CIVIL/2023/005",
      phone: "+91-98765-43205",
      email: "karan.verma@sunrise.edu",
      bloodGroup: "O-",
      dob: "2003-09-30",
      hometown: "Delhi",
      aadharNo: "XXXX-XXXX-3205",
      emergencyContact: { name: "Anil Verma", relation: "Father", phone: "+91-94000-11005" },
      documents: { aadhar: true, photo: true, tc: true, medicalCert: false },
      roomHistory: [
        { roomNo: "C-303", from: "2023-08-01", to: "2024-12-31", reason: "Initial allotment" },
        { roomNo: "C-301", from: "2025-01-01", to: null,          reason: "Room upgrade" }
      ]
    },
    {
      studentId: "S006",
      name: "Divya Nair",
      roomNo: "C-302",
      block: "C",
      photo: null,
      course: "B.Sc Chemistry",
      year: "2nd Year",
      enrollNo: "CHEM/2025/006",
      phone: "+91-98765-43206",
      email: "divya.nair@sunrise.edu",
      bloodGroup: "A-",
      dob: "2005-05-18",
      hometown: "Thiruvananthapuram, Kerala",
      aadharNo: "XXXX-XXXX-3206",
      emergencyContact: { name: "Rajan Nair", relation: "Father", phone: "+91-94000-11006" },
      documents: { aadhar: true, photo: true, tc: true, medicalCert: true },
      roomHistory: [
        { roomNo: "C-302", from: "2025-08-01", to: null, reason: "Initial allotment" }
      ]
    },
    {
      studentId: "S007",
      name: "Arjun Singh",
      roomNo: "A-201",
      block: "A",
      photo: null,
      course: "MBA Finance",
      year: "1st Year",
      enrollNo: "MBA/2026/007",
      phone: "+91-98765-43207",
      email: "arjun.singh@sunrise.edu",
      bloodGroup: "B-",
      dob: "2002-12-01",
      hometown: "Lucknow, Uttar Pradesh",
      aadharNo: "XXXX-XXXX-3207",
      emergencyContact: { name: "Harpal Singh", relation: "Father", phone: "+91-94000-11007" },
      documents: { aadhar: true, photo: false, tc: true, medicalCert: false },
      roomHistory: [
        { roomNo: "A-201", from: "2026-08-01", to: null, reason: "Initial allotment" }
      ]
    },
    {
      studentId: "S008",
      name: "Meena Krishnan",
      roomNo: "B-301",
      block: "B",
      photo: null,
      course: "M.Tech Software",
      year: "2nd Year",
      enrollNo: "MTECH/2025/008",
      phone: "+91-98765-43208",
      email: "meena.krishnan@sunrise.edu",
      bloodGroup: "O+",
      dob: "2001-08-22",
      hometown: "Coimbatore, Tamil Nadu",
      aadharNo: "XXXX-XXXX-3208",
      emergencyContact: { name: "Geetha Krishnan", relation: "Mother", phone: "+91-94000-11008" },
      documents: { aadhar: true, photo: true, tc: true, medicalCert: true },
      roomHistory: [
        { roomNo: "B-301", from: "2025-08-01", to: null, reason: "Initial allotment" }
      ]
    }
  ],

  // ── Block & Floor metadata ──────────────────────────────────────
  blocks: [
    {
      id: "A", name: "Block A", gender: "Boys", warden: "Dr. Ramesh Kumar",
      floors: [
        { floor: 1, rooms: ["A-101","A-102","A-103","A-104"], totalBeds: 8, occupiedBeds: 4 },
        { floor: 2, rooms: ["A-201","A-202","A-203","A-204"], totalBeds: 8, occupiedBeds: 2 },
        { floor: 3, rooms: ["A-301","A-302","A-303","A-304"], totalBeds: 8, occupiedBeds: 0 },
        { floor: 4, rooms: ["A-401","A-402"],                 totalBeds: 4, occupiedBeds: 0 }
      ]
    },
    {
      id: "B", name: "Block B", gender: "Girls", warden: "Ms. Sunita Rao",
      floors: [
        { floor: 1, rooms: ["B-101","B-102","B-103","B-104"], totalBeds: 8, occupiedBeds: 0 },
        { floor: 2, rooms: ["B-201","B-202","B-203","B-204"], totalBeds: 8, occupiedBeds: 3 },
        { floor: 3, rooms: ["B-301","B-302","B-303","B-304"], totalBeds: 8, occupiedBeds: 1 },
        { floor: 4, rooms: ["B-401","B-402"],                 totalBeds: 4, occupiedBeds: 0 }
      ]
    },
    {
      id: "C", name: "Block C", gender: "Mixed (PG)", warden: "Dr. Ramesh Kumar",
      floors: [
        { floor: 1, rooms: ["C-101","C-102","C-103","C-104"], totalBeds: 8, occupiedBeds: 0 },
        { floor: 2, rooms: ["C-201","C-202","C-203","C-204"], totalBeds: 8, occupiedBeds: 0 },
        { floor: 3, rooms: ["C-301","C-302","C-303","C-304"], totalBeds: 8, occupiedBeds: 2 },
        { floor: 4, rooms: ["C-401","C-402"],                 totalBeds: 4, occupiedBeds: 0 }
      ]
    }
  ],

  // ── Room details (expanded to cover all floors) ─────────────────
  rooms: [
    // Block A
    { roomNo: "A-101", block: "A", floor: 1, type: "Double",  capacity: 2, occupants: ["S001"], hasAC: true,  hasWifi: true,  status: "occupied"    },
    { roomNo: "A-102", block: "A", floor: 1, type: "Single",  capacity: 1, occupants: ["S002"], hasAC: true,  hasWifi: true,  status: "occupied"    },
    { roomNo: "A-103", block: "A", floor: 1, type: "Double",  capacity: 2, occupants: [],       hasAC: false, hasWifi: true,  status: "vacant"      },
    { roomNo: "A-104", block: "A", floor: 1, type: "Triple",  capacity: 3, occupants: [],       hasAC: false, hasWifi: true,  status: "vacant"      },
    { roomNo: "A-201", block: "A", floor: 2, type: "Double",  capacity: 2, occupants: ["S007"], hasAC: true,  hasWifi: true,  status: "occupied"    },
    { roomNo: "A-202", block: "A", floor: 2, type: "Single",  capacity: 1, occupants: [],       hasAC: false, hasWifi: true,  status: "vacant"      },
    { roomNo: "A-203", block: "A", floor: 2, type: "Double",  capacity: 2, occupants: [],       hasAC: true,  hasWifi: false, status: "maintenance" },
    { roomNo: "A-204", block: "A", floor: 2, type: "Triple",  capacity: 3, occupants: [],       hasAC: false, hasWifi: true,  status: "vacant"      },
    // Block B
    { roomNo: "B-201", block: "B", floor: 2, type: "Double",  capacity: 2, occupants: ["S003"], hasAC: true,  hasWifi: true,  status: "occupied"    },
    { roomNo: "B-202", block: "B", floor: 2, type: "Single",  capacity: 1, occupants: ["S004"], hasAC: false, hasWifi: true,  status: "occupied"    },
    { roomNo: "B-203", block: "B", floor: 2, type: "Double",  capacity: 2, occupants: [],       hasAC: true,  hasWifi: false, status: "maintenance" },
    { roomNo: "B-204", block: "B", floor: 2, type: "Triple",  capacity: 3, occupants: [],       hasAC: false, hasWifi: true,  status: "vacant"      },
    { roomNo: "B-301", block: "B", floor: 3, type: "Double",  capacity: 2, occupants: ["S008"], hasAC: true,  hasWifi: true,  status: "occupied"    },
    { roomNo: "B-302", block: "B", floor: 3, type: "Single",  capacity: 1, occupants: [],       hasAC: false, hasWifi: true,  status: "vacant"      },
    { roomNo: "B-303", block: "B", floor: 3, type: "Double",  capacity: 2, occupants: [],       hasAC: true,  hasWifi: true,  status: "vacant"      },
    { roomNo: "B-304", block: "B", floor: 3, type: "Triple",  capacity: 3, occupants: [],       hasAC: false, hasWifi: true,  status: "vacant"      },
    // Block C
    { roomNo: "C-301", block: "C", floor: 3, type: "Double",  capacity: 2, occupants: ["S005"], hasAC: true,  hasWifi: true,  status: "occupied"    },
    { roomNo: "C-302", block: "C", floor: 3, type: "Double",  capacity: 2, occupants: ["S006"], hasAC: true,  hasWifi: true,  status: "occupied"    },
    { roomNo: "C-303", block: "C", floor: 3, type: "Single",  capacity: 1, occupants: [],       hasAC: false, hasWifi: true,  status: "vacant"      },
    { roomNo: "C-304", block: "C", floor: 3, type: "Triple",  capacity: 3, occupants: [],       hasAC: true,  hasWifi: true,  status: "vacant"      }
  ],

  // ── Weekly Mess Menu ────────────────────────────────────────────
  messMenu: {
    Monday:    { breakfast: "Poha, Chai, Banana",               lunch: "Dal, Rice, Roti, Sabzi, Salad",        dinner: "Paneer Butter Masala, Naan, Raita"    },
    Tuesday:   { breakfast: "Idli (3), Sambar, Coconut Chutney",lunch: "Rajma, Rice, Roti, Pickle",            dinner: "Chole Bhature, Kheer"                 },
    Wednesday: { breakfast: "Aloo Paratha, Curd, Pickle",       lunch: "Mixed Veg, Dal Tadka, Rice, Roti",     dinner: "Kadai Paneer, Jeera Rice, Salad"       },
    Thursday:  { breakfast: "Upma, Chutney, Juice",             lunch: "Dal Makhani, Rice, Roti, Papad",       dinner: "Veg Biryani, Boondi Raita"            },
    Friday:    { breakfast: "Puri Bhaji, Chai",                 lunch: "Sambar Rice, Papad, Curd",             dinner: "Aloo Gobi, Roti, Sweet (Halwa)"       },
    Saturday:  { breakfast: "Bread Toast, Butter, Boiled Egg",  lunch: "Special Thali (Paneer + 2 Sabzi)",     dinner: "Fried Rice, Manchurian, Soup"         },
    Sunday:    { breakfast: "Chole Puri, Tea/Coffee",           lunch: "Mutton/Soya Curry, Rice, Roti, Salad", dinner: "Pasta, Garlic Bread, Ice Cream"       }
  },

  // ── Maintenance Complaints / Tickets ───────────────────────────
  complaints: [
    { id: "TKT-001", studentId: "S001", studentName: "Aarav Sharma",   roomNo: "A-101", category: "Electrical",     title: "Fan noise",          description: "Ceiling fan is making loud noise and vibrating.",                      priority: "High",   status: "pending",     date: "2026-09-15", aiTagged: true  },
    { id: "TKT-002", studentId: "S003", studentName: "Rohan Mehta",    roomNo: "B-201", category: "Plumbing",       title: "Water leak",         description: "Water tap in bathroom is leaking continuously.",                        priority: "High",   status: "in-progress", date: "2026-09-17", aiTagged: true  },
    { id: "TKT-003", studentId: "S004", studentName: "Sneha Iyer",     roomNo: "B-202", category: "Furniture",      title: "Broken table",       description: "Study table leg is broken, needs replacement.",                         priority: "Medium", status: "resolved",    date: "2026-09-10", aiTagged: true  },
    { id: "TKT-004", studentId: "S005", studentName: "Karan Verma",    roomNo: "C-301", category: "Internet / Wi-Fi", title: "Wi-Fi drops",      description: "Wi-Fi connection drops every few minutes in room.",                    priority: "Medium", status: "pending",     date: "2026-09-19", aiTagged: true  },
    { id: "TKT-005", studentId: "S006", studentName: "Divya Nair",     roomNo: "C-302", category: "Cleanliness",    title: "Dirty toilet",       description: "Common toilet on 3rd floor has not been cleaned for 3 days.",          priority: "High",   status: "pending",     date: "2026-09-20", aiTagged: true  },
    { id: "TKT-006", studentId: "S007", studentName: "Arjun Singh",    roomNo: "A-201", category: "Electrical",     title: "Socket sparking",    description: "Wall socket near study desk gives sparks when plugging in charger.",   priority: "High",   status: "in-progress", date: "2026-09-21", aiTagged: true  },
    { id: "TKT-007", studentId: "S008", studentName: "Meena Krishnan", roomNo: "B-301", category: "Plumbing",       title: "Shower blocked",     description: "Shower drain is completely blocked. Water accumulates.",               priority: "Medium", status: "pending",     date: "2026-09-21", aiTagged: true  }
  ],

  // ── Leave Requests ──────────────────────────────────────────────
  leaveRequests: [
    { id: "LV-001", studentId: "S001", studentName: "Aarav Sharma",   roomNo: "A-101", fromDate: "2026-09-22", toDate: "2026-09-24", reason: "Family function at home town",        status: "pending",  appliedOn: "2026-09-20" },
    { id: "LV-002", studentId: "S003", studentName: "Rohan Mehta",    roomNo: "B-201", fromDate: "2026-09-25", toDate: "2026-09-27", reason: "Medical appointment and follow-up",   status: "approved", appliedOn: "2026-09-18" },
    { id: "LV-003", studentId: "S004", studentName: "Sneha Iyer",     roomNo: "B-202", fromDate: "2026-09-28", toDate: "2026-09-30", reason: "Sister's wedding ceremony",           status: "rejected", appliedOn: "2026-09-16" },
    { id: "LV-004", studentId: "S005", studentName: "Karan Verma",    roomNo: "C-301", fromDate: "2026-10-01", toDate: "2026-10-03", reason: "Project presentation at college fest", status: "pending",  appliedOn: "2026-09-21" },
    { id: "LV-005", studentId: "S007", studentName: "Arjun Singh",    roomNo: "A-201", fromDate: "2026-10-05", toDate: "2026-10-07", reason: "Diwali vacation at home",             status: "approved", appliedOn: "2026-09-22" },
    { id: "LV-006", studentId: "S008", studentName: "Meena Krishnan", roomNo: "B-301", fromDate: "2026-10-10", toDate: "2026-10-11", reason: "Research conference attendance",       status: "pending",  appliedOn: "2026-09-22" }
  ],

  // ── Gate Passes (Outpass / Overnight) ──────────────────────────
  // qrId: unique QR code string security guard scans to verify
  gatePasses: [
    {
      id: "GP-001",
      qrId: "QR-2026-001",
      studentId: "S001",
      studentName: "Aarav Sharma",
      roomNo: "A-101",
      type: "outpass",                  // outpass | overnight | leave
      destination: "Jaipur (Home)",
      fromDateTime: "2026-09-22 10:00",
      toDateTime:   "2026-09-22 22:00",
      appliedOn: "2026-09-20",
      approvedBy: null,
      status: "pending",               // pending | approved | rejected | checked-out | returned
      checkOutTime: null,
      checkInTime:  null,
      guardId: null
    },
    {
      id: "GP-002",
      qrId: "QR-2026-002",
      studentId: "S003",
      studentName: "Rohan Mehta",
      roomNo: "B-201",
      type: "overnight",
      destination: "Mumbai (Relative)",
      fromDateTime: "2026-09-25 08:00",
      toDateTime:   "2026-09-27 20:00",
      appliedOn: "2026-09-18",
      approvedBy: "W001",
      status: "approved",
      checkOutTime: null,
      checkInTime:  null,
      guardId: null
    },
    {
      id: "GP-003",
      qrId: "QR-2026-003",
      studentId: "S005",
      studentName: "Karan Verma",
      roomNo: "C-301",
      type: "outpass",
      destination: "City Market",
      fromDateTime: "2026-09-21 14:00",
      toDateTime:   "2026-09-21 20:00",
      appliedOn: "2026-09-21",
      approvedBy: "W001",
      status: "checked-out",
      checkOutTime: "2026-09-21 14:05",
      checkInTime:  null,
      guardId: "G001"
    },
    {
      id: "GP-004",
      qrId: "QR-2026-004",
      studentId: "S006",
      studentName: "Divya Nair",
      roomNo: "C-302",
      type: "outpass",
      destination: "Hospital (Checkup)",
      fromDateTime: "2026-09-22 09:00",
      toDateTime:   "2026-09-22 18:00",
      appliedOn: "2026-09-22",
      approvedBy: "W002",
      status: "approved",
      checkOutTime: null,
      checkInTime:  null,
      guardId: null
    },
    {
      id: "GP-005",
      qrId: "QR-2026-005",
      studentId: "S002",
      studentName: "Priya Patel",
      roomNo: "A-102",
      type: "overnight",
      destination: "Ahmedabad (Home)",
      fromDateTime: "2026-09-19 08:00",
      toDateTime:   "2026-09-21 20:00",
      appliedOn: "2026-09-17",
      approvedBy: "W001",
      status: "returned",
      checkOutTime: "2026-09-19 08:15",
      checkInTime:  "2026-09-21 19:45",
      guardId: "G001"
    }
  ],

  // ── Fee Records ─────────────────────────────────────────────────
  feeRecords: [
    {
      id: "FEE-001",
      studentId: "S001",
      studentName: "Aarav Sharma",
      roomNo: "A-101",
      semester: "Odd 2026-27",
      hostelFee:  25000,
      messFee:    14000,
      otherFee:    1500,     // laundry, maintenance deposit etc.
      totalDue:   40500,
      amountPaid: 40500,
      dueDate: "2026-08-15",
      paidOn: "2026-08-10",
      paymentMode: "Online (UPI)",
      receiptNo: "RCP/2026/001",
      status: "paid"         // paid | pending | overdue
    },
    {
      id: "FEE-002",
      studentId: "S002",
      studentName: "Priya Patel",
      roomNo: "A-102",
      semester: "Odd 2026-27",
      hostelFee:  22000,
      messFee:    14000,
      otherFee:    1500,
      totalDue:   37500,
      amountPaid: 20000,
      dueDate: "2026-08-15",
      paidOn: null,
      paymentMode: null,
      receiptNo: null,
      status: "pending"
    },
    {
      id: "FEE-003",
      studentId: "S003",
      studentName: "Rohan Mehta",
      roomNo: "B-201",
      semester: "Odd 2026-27",
      hostelFee:  25000,
      messFee:    14000,
      otherFee:    1500,
      totalDue:   40500,
      amountPaid: 40500,
      dueDate: "2026-08-15",
      paidOn: "2026-08-12",
      paymentMode: "DD / Bank Transfer",
      receiptNo: "RCP/2026/003",
      status: "paid"
    },
    {
      id: "FEE-004",
      studentId: "S004",
      studentName: "Sneha Iyer",
      roomNo: "B-202",
      semester: "Odd 2026-27",
      hostelFee:  22000,
      messFee:    14000,
      otherFee:    1500,
      totalDue:   37500,
      amountPaid:     0,
      dueDate: "2026-08-15",
      paidOn: null,
      paymentMode: null,
      receiptNo: null,
      status: "overdue"
    },
    {
      id: "FEE-005",
      studentId: "S005",
      studentName: "Karan Verma",
      roomNo: "C-301",
      semester: "Odd 2026-27",
      hostelFee:  25000,
      messFee:    14000,
      otherFee:    1500,
      totalDue:   40500,
      amountPaid: 40500,
      dueDate: "2026-08-15",
      paidOn: "2026-08-14",
      paymentMode: "Online (Net Banking)",
      receiptNo: "RCP/2026/005",
      status: "paid"
    },
    {
      id: "FEE-006",
      studentId: "S006",
      studentName: "Divya Nair",
      roomNo: "C-302",
      semester: "Odd 2026-27",
      hostelFee:  25000,
      messFee:    14000,
      otherFee:    1500,
      totalDue:   40500,
      amountPaid: 25000,
      dueDate: "2026-08-15",
      paidOn: null,
      paymentMode: null,
      receiptNo: null,
      status: "pending"
    },
    {
      id: "FEE-007",
      studentId: "S007",
      studentName: "Arjun Singh",
      roomNo: "A-201",
      semester: "Odd 2026-27",
      hostelFee:  28000,
      messFee:    14000,
      otherFee:    1500,
      totalDue:   43500,
      amountPaid: 43500,
      dueDate: "2026-08-15",
      paidOn: "2026-08-05",
      paymentMode: "Online (UPI)",
      receiptNo: "RCP/2026/007",
      status: "paid"
    },
    {
      id: "FEE-008",
      studentId: "S008",
      studentName: "Meena Krishnan",
      roomNo: "B-301",
      semester: "Odd 2026-27",
      hostelFee:  25000,
      messFee:    14000,
      otherFee:    1500,
      totalDue:   40500,
      amountPaid: 40500,
      dueDate: "2026-08-15",
      paidOn: "2026-08-11",
      paymentMode: "DD / Bank Transfer",
      receiptNo: "RCP/2026/008",
      status: "paid"
    }
  ],

  // ── Visitor Log ─────────────────────────────────────────────────
  visitorLog: [
    {
      id: "VIS-001",
      qrId: "VQR-2026-001",
      visitorName: "Rajesh Sharma",
      visitorPhone: "+91-94000-11001",
      relation: "Father",
      hostStudentId: "S001",
      hostStudentName: "Aarav Sharma",
      hostRoomNo: "A-101",
      purpose: "Dropping items",
      entryTime: "2026-09-20 10:30",
      exitTime:  "2026-09-20 12:00",
      guardId: "G001",
      status: "exited"          // inside | exited
    },
    {
      id: "VIS-002",
      qrId: "VQR-2026-002",
      visitorName: "Kiran Patel",
      visitorPhone: "+91-94000-11002",
      relation: "Mother",
      hostStudentId: "S002",
      hostStudentName: "Priya Patel",
      hostRoomNo: "A-102",
      purpose: "Fee payment & visit",
      entryTime: "2026-09-21 11:00",
      exitTime:  "2026-09-21 13:30",
      guardId: "G002",
      status: "exited"
    },
    {
      id: "VIS-003",
      qrId: "VQR-2026-003",
      visitorName: "Sunil Mehta",
      visitorPhone: "+91-94000-11003",
      relation: "Father",
      hostStudentId: "S003",
      hostStudentName: "Rohan Mehta",
      hostRoomNo: "B-201",
      purpose: "General visit",
      entryTime: "2026-09-22 10:00",
      exitTime:  null,
      guardId: "G001",
      status: "inside"
    },
    {
      id: "VIS-004",
      qrId: "VQR-2026-004",
      visitorName: "Anil Verma",
      visitorPhone: "+91-94000-11005",
      relation: "Father",
      hostStudentId: "S005",
      hostStudentName: "Karan Verma",
      hostRoomNo: "C-301",
      purpose: "Collecting documents",
      entryTime: "2026-09-22 14:15",
      exitTime:  null,
      guardId: "G001",
      status: "inside"
    }
  ],


  // ── Official Notices (published by Wardens / Admins) ────────────
  notices: [
    {
      id: "NTC-001",
      title: "Hostel Gate Timing & Curfew Revision",
      topic: "Gate Timing Revision",
      targetAudience: "All Residents",
      date: "2026-09-21",
      postedBy: "Dr. Ramesh Kumar (Warden)",
      urgency: "Urgent",
      content: "All residents are hereby informed that main hostel gates strictly close at 10:00 PM. Late entry without prior warden written clearance is not permitted. Security will enforce strict register entry.",
      status: "Active"
    },
    {
      id: "NTC-002",
      title: "Monthly Mess Hygiene & Quality Inspection",
      topic: "Mess Inspection",
      targetAudience: "All Residents",
      date: "2026-09-20",
      postedBy: "Hostel Committee",
      urgency: "Normal",
      content: "The monthly mess inspection report showed 98% hygiene compliance. Deep kitchen sanitization is scheduled for Sunday 3 PM - 5 PM without disruption to scheduled meal times.",
      status: "Active"
    },
    {
      id: "NTC-003",
      title: "Scheduled Plumbing Maintenance in Block B",
      topic: "Maintenance Shutdown",
      targetAudience: "Block B Residents",
      date: "2026-09-19",
      postedBy: "Ms. Sunita Rao (Warden)",
      urgency: "High Priority",
      content: "Water pump overhaul for Block B will take place tomorrow between 10 AM and 1 PM. Residents are requested to store necessary water in advance.",
      status: "Active"
    }
  ],

  // ── Student Feedbacks with AI Sentiment Tags ───────────────────
  feedbacks: [
    {
      id: "FB-001",
      studentId: "S001",
      studentName: "Aarav Sharma",
      roomNo: "A-101",
      category: "Mess & Food",
      rating: 5,
      date: "2026-09-21",
      message: "Wednesday dinner special paneer and jeera rice was delicious! Mess staff was very cooperative and hygiene has visibly improved.",
      sentiment: "Positive",
      sentimentScore: 0.92
    },
    {
      id: "FB-002",
      studentId: "S003",
      studentName: "Rohan Mehta",
      roomNo: "B-201",
      category: "Wi-Fi & Internet",
      rating: 2,
      date: "2026-09-20",
      message: "Internet speed in second floor B wing drops frequently during peak study hours. Very slow connection during semester submission.",
      sentiment: "Negative",
      sentimentScore: -0.80
    },
    {
      id: "FB-003",
      studentId: "S004",
      studentName: "Sneha Iyer",
      roomNo: "B-202",
      category: "Room & Cleaning",
      rating: 4,
      date: "2026-09-19",
      message: "Corridor sweepers are punctual and bathrooms are sanitized daily. Good maintenance overall.",
      sentiment: "Positive",
      sentimentScore: 0.85
    },
    {
      id: "FB-004",
      studentId: "S002",
      studentName: "Priya Patel",
      roomNo: "A-102",
      category: "Security & Facilities",
      rating: 3,
      date: "2026-09-18",
      message: "Night security guard at main gate is strict but gate pass QR scanning takes some time when crowd arrives.",
      sentiment: "Neutral",
      sentimentScore: 0.10
    },
    {
      id: "FB-005",
      studentId: "S005",
      studentName: "Karan Verma",
      roomNo: "C-301",
      category: "Room & Cleaning",
      rating: 2,
      date: "2026-09-17",
      message: "Water leakage issue was fixed late by plumber. Tap kept dripping for almost two full days.",
      sentiment: "Negative",
      sentimentScore: -0.70
    },
    {
      id: "FB-006",
      studentId: "S006",
      studentName: "Divya Nair",
      roomNo: "C-302",
      category: "Mess & Food",
      rating: 5,
      date: "2026-09-16",
      message: "South Indian breakfast idli and sambar on Tuesday was authentic and warm. Great job by breakfast kitchen team!",
      sentiment: "Positive",
      sentimentScore: 0.95
    }
  ],

  // ── Hostel Rules (chatbot context) ──────────────────────────────
  rules: [
    "Gate closes at 10:00 PM. Students must sign the register before entry.",
    "Mess timings: Breakfast 7–9 AM · Lunch 12–2 PM · Dinner 7–9 PM.",
    "Visitors are allowed only in the common room between 10 AM – 6 PM.",
    "Any electrical appliance above 500W (e.g. iron, kettle) is strictly prohibited.",
    "Ragging in any form is a punishable offence and will lead to immediate expulsion.",
    "Silence hours are enforced from 10 PM – 6 AM. Keep noise levels low.",
    "Students must carry their ID card at all times inside the hostel premises.",
    "Leave must be applied at least 48 hours in advance. Emergency leaves require warden approval.",
    "Room keys must be deposited at the office if leaving for more than 2 days.",
    "Wi-Fi is provided for academic use only. Streaming during exam periods is restricted.",
    "Gate passes (outpass) must be approved by the warden before exit.",
    "Security guards verify gate passes via QR code at the main gate."
  ]
};


// ─────────────────────────────────────────────
//  SECTION 2 — STORAGE HELPER
// ─────────────────────────────────────────────
/**
 * StorageHelper wraps localStorage with automatic JSON serialisation.
 * Every module uses StorageHelper.get() / .set() — never raw localStorage.
 */
const StorageHelper = {
  get(key) {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    try   { return JSON.parse(raw); }
    catch { return raw; }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  remove(key) {
    localStorage.removeItem(key);
  },
  /** clearAll() — factory reset, wipes all HMS keys */
  clearAll() {
    const keys = [
      "hms_version", "hms_users", "hms_studentProfiles", "hms_blocks",
      "hms_rooms", "hms_messMenu", "hms_complaints", "hms_leaveRequests",
      "hms_gatePasses", "hms_feeRecords", "hms_visitorLog", "hms_rules", "hms_notices", "hms_feedback", "hms_sos_alerts", "hms_theme",
      "hms_token"
    ];
    keys.forEach(k => localStorage.removeItem(k));
    sessionStorage.clear();
  }
};


// ─────────────────────────────────────────────
//  SECTION 3 — INITIALISE DATA
// ─────────────────────────────────────────────
/**
 * initData() — Seeds localStorage with SEED_DATA on first run,
 * or whenever the version string changes (upgrade migration).
 */
function initData() {
  const storedVersion = StorageHelper.get("hms_version");
  if (storedVersion === SEED_DATA._version) return;   // already seeded

  console.log("[HMS] Seeding localStorage with fresh v2.0 data...");
  StorageHelper.set("hms_version",        SEED_DATA._version);
  StorageHelper.set("hms_users",          SEED_DATA.users);
  StorageHelper.set("hms_studentProfiles",SEED_DATA.studentProfiles);
  StorageHelper.set("hms_blocks",         SEED_DATA.blocks);
  StorageHelper.set("hms_rooms",          SEED_DATA.rooms);
  StorageHelper.set("hms_messMenu",       SEED_DATA.messMenu);
  StorageHelper.set("hms_complaints",     SEED_DATA.complaints);
  StorageHelper.set("hms_leaveRequests",  SEED_DATA.leaveRequests);
  StorageHelper.set("hms_gatePasses",     SEED_DATA.gatePasses);
  StorageHelper.set("hms_feeRecords",     SEED_DATA.feeRecords);
  StorageHelper.set("hms_visitorLog",     SEED_DATA.visitorLog);
  StorageHelper.set("hms_rules", "hms_notices", "hms_feedback", "hms_sos_alerts", "hms_theme",          SEED_DATA.rules);
  console.log("[HMS] v2.0 Seeding complete.");
}

// Auto-run as soon as data.js is loaded (before app.js runs)
initData();
