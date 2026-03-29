# 🚧 PENDING WORK & ROADMAP

We have completed the core "Creative Engine." The following phases are required to move CutBoard from a "Prototype" to a "Production-Ready" SaaS.

---

## 🛡️ Phase 6: Real Security (Authentication)
- [ ] Replace `userController` mock bypass with **Supabase Auth**.
- [ ] Implement `requireAuth` middleware for all backend `/api` routes.
- [ ] Add "Protected Layout" to the frontend to prevent unauthorized access.
- [ ] Connect `ownerid` dynamically during video uploads.

## 🚀 Phase 9: Global Deployment
- [ ] Configure `CORS` origins for production (instead of `localhost`).
- [ ] Instructions for **Render/Railway** (Backend) and **Vercel** (Frontend).
- [ ] Build script optimization (`client/dist`).

## 🎨 Phase 10: The "Wow" Polish (UI/UX)
- [ ] **Framer Motion**: Add page-to-page fade-in and smooth card transitions.
- [ ] **Skeleton Loaders**: Replace "Opening Vault..." text with shimmering card skeletons.
- [ ] **Video Scrubbing**: Precise 0.1s frame scrubbing for frame-accurate review.
- [ ] **PDF Export**: Move from `.txt` to a beautiful, branded `.pdf` report for clients.

---

## 📈 Feature Backlog
- [ ] **Version Toggle**: A dropdown in the review page to switch between `v1`, `v2`, and `v3`. 🎮
- [ ] **Real-time Progress Bar**: Use Sockets to show the % progress of the AI Scan. 🔋
- [ ] **Email Notifications**: Notify the editor automatically when a client clicks "Approve." 📧
