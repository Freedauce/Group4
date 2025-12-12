# Git Push Instructions for Team

## 🔄 Push Order & Commands

Each team member needs to push in order. After each push, the next person needs to pull first.

---

## 📦 PUSH 1: Freedauce (Database & Data Layer)
**Repository:** https://github.com/Freedauce/Group4.git

### Files to stage:
```
Models/
DTOs/
Data/
Migrations/
FinalExam3.csproj
FinalExam3.sln
Program.cs
appsettings.json
.gitignore
README.md
TEAM_CONTRIBUTIONS.md
```

### Commands:
```bash
# Navigate to project
cd G:/FinalExam3

# Initialize (already done)
git init

# Add files for Push 1
git add .gitignore
git add README.md
git add TEAM_CONTRIBUTIONS.md
git add FinalExam3.csproj
git add FinalExam3.sln
git add Program.cs
git add appsettings.json
git add Models/
git add DTOs/
git add Data/
git add Migrations/

# Commit
git commit -m "feat: Database schema and data layer

- Added User, Car, Booking, Payment, Notification models
- Created DTOs for data transfer
- Set up ApplicationDbContext with EF Core
- Added database migrations
- Configured enums for roles and statuses

Contributor: Freedauce"

# Connect to remote
git branch -M main
git remote add origin https://github.com/Freedauce/Group4.git

# Push
git push -u origin main
```

---

## 📦 PUSH 2: mdanny11 (Backend API Layer)
**Repository:** Will push to same repo after being added as collaborator

### Files to stage:
```
Controllers/
Services/
Helpers/
```

### Commands:
```bash
# Clone repo (on mdanny11's machine)
git clone https://github.com/Freedauce/Group4.git
cd Group4

# OR if already have the project folder
cd G:/FinalExam3
git pull origin main

# Add files for Push 2
git add Controllers/
git add Services/
git add Helpers/

# Commit
git commit -m "feat: Backend API controllers and services

- Implemented AuthController with JWT authentication
- Added CarController, BookingController, PaymentController
- Created all business logic services
- Implemented EmailService for notifications
- Added role-based authorization

Contributor: mdanny11"

# Push
git push origin main
```

---

## 📦 PUSH 3: dush04souvenir (Frontend State & Routing)
**Repository:** Will push to same repo after being added as collaborator

### Files to stage:
```
kigalidrive-frontend/src/store/
kigalidrive-frontend/src/services/
kigalidrive-frontend/src/App.jsx
kigalidrive-frontend/src/main.jsx
kigalidrive-frontend/index.html
kigalidrive-frontend/package.json
kigalidrive-frontend/vite.config.js
kigalidrive-frontend/.env.example
```

### Commands:
```bash
# Pull latest changes
cd G:/FinalExam3
git pull origin main

# Add files for Push 3
git add kigalidrive-frontend/package.json
git add kigalidrive-frontend/package-lock.json
git add kigalidrive-frontend/vite.config.js
git add kigalidrive-frontend/index.html
git add kigalidrive-frontend/.env.example
git add kigalidrive-frontend/src/main.jsx
git add kigalidrive-frontend/src/App.jsx
git add kigalidrive-frontend/src/store/
git add kigalidrive-frontend/src/services/

# Commit
git commit -m "feat: Frontend state management and routing

- Set up Redux store with slices
- Implemented API service layer with Axios
- Configured React Router for navigation
- Added protected routes for authentication
- Created auth, car, booking slices

Contributor: dush04souvenir"

# Push
git push origin main
```

---

## 📦 PUSH 4: Gerry-13 (Frontend UI/Design)
**Repository:** Will push to same repo after being added as collaborator

### Files to stage:
```
kigalidrive-frontend/src/pages/
kigalidrive-frontend/src/components/
kigalidrive-frontend/src/index.css
kigalidrive-frontend/public/
```

### Commands:
```bash
# Pull latest changes
cd G:/FinalExam3
git pull origin main

# Add remaining files for Push 4
git add kigalidrive-frontend/src/pages/
git add kigalidrive-frontend/src/components/
git add kigalidrive-frontend/src/index.css
git add kigalidrive-frontend/public/

# Commit
git commit -m "feat: Frontend UI components and styling

- Created all page components (Home, Login, Dashboard, etc.)
- Built reusable UI components (Navbar, Sidebar, CarCard)
- Implemented responsive CSS styling
- Added dark/light theme support
- Designed booking and payment modals

Contributor: Gerry-13"

# Push
git push origin main
```

---

## 🔑 Adding Collaborators

On GitHub, the repo owner (Freedauce) needs to:
1. Go to https://github.com/Freedauce/Group4/settings/access
2. Click "Add people"
3. Add: mdanny11, dush04souvenir, Gerry-13

---

## ⚠️ Important Notes

1. **Push in order** - Each person must wait for the previous push to complete
2. **Always pull first** - Run `git pull origin main` before pushing
3. **Use different accounts** - Log in with the correct GitHub account before each push
4. **Check .gitignore** - Sensitive files (.env, node_modules) are excluded

---

## 📋 Quick Reference

| Push | Developer | Layer | Main Folders |
|------|-----------|-------|--------------|
| 1 | Freedauce | Data | Models, DTOs, Data, Migrations |
| 2 | mdanny11 | API | Controllers, Services |
| 3 | dush04souvenir | State | store, services, App.jsx |
| 4 | Gerry-13 | UI | pages, components, CSS |
