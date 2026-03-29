# 🎬 CutBoard AI
**The Creative Audit Workspace for Next-Gen Video Editors.**

CutBoard is a project-centric video review platform that combines **Human Feedback** with **AI Creative Auditing**. Designed for high-speed collaboration, it helps editors ensure their cuts perfectly match the client brief before the final export.

---

## 🚀 Key Features

- **Project-Centric Kanban**: A streamlined 2-column workspace ("Active Projects" vs "Finished") for managing complex campaigns.
- **AI Creative Audit**: Powered by **Gemini 1.5 Pro**, it automatically scans your video against a text brief to identify compliance errors, branding mismatches, and missed requirements.
- **Interactive Review Suite**: 
    - **Mark Cut**: Drop instant ✂️ pinpoints for trimming.
    - **Timestamp Comments**: Pin feedback to the exact frame.
    - **Live Timeline**: Real-time sync of markers and reactions via Socket.io.
- **Automated Processing**: Backend FFmpeg integration for real-time thumbnail generation and metadata extraction.
- **Cloud-Native Storage**: Seamlessly integrated with **Supabase Storage** for high-speed video hosting.

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite), Tailwind CSS, Lucide Icons, dnd-kit (Kanban).
- **Backend**: Node.js, Express, Socket.io (Real-time).
- **Database/Cloud**: Supabase (PostgreSQL, Storage, Auth).
- **Video Engine**: FFmpeg (Fluent-FFmpeg).
- **AI Engine**: Google Gemini REST API.

---

## 📦 Installation & Setup

### 1. Prerequisites
- Node.js (v18+)
- FFmpeg installed on your system.
- Supabase Account.

### 2. Backend Setup
```bash
cd server
npm install
# Create a .env file with:
# PORT=5000
# GEMINI_API_KEY=your_key
# SUPABASE_URL=your_url
# SUPABASE_ANON_KEY=your_key
node src/server.js
```

### 3. Frontend Setup
```bash
cd client
npm install
npm run dev
```

---

## 🚥 Current Status: Phase 5 (Stabilized)
- [x] AI REST Engine (Gemini Integration)
- [x] FFmpeg Thumbnail Pipeline
- [x] 2-Column Kanban Workspace
- [x] Persistent Mark Cut & Timestamped Comments
- [x] Export (Audit Report + Video Download)
