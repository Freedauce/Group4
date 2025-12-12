# KigaliDrive - Team Contributions

## Project Overview
KigaliDrive is a premium car rental platform built by a team of 4 developers. Each team member was responsible for a specific layer of the application.

---

## 👥 Team Members & Contributions

### 1. Freedauce - Database & Data Layer
**GitHub:** [@Freedauce](https://github.com/Freedauce)
**Role:** Database Architect & Backend Data Handler

**Responsibilities:**
- Designed the complete database schema
- Created all Entity Framework models
- Implemented data transfer objects (DTOs)
- Set up database migrations
- Configured ApplicationDbContext

**Files Contributed:**
```
📁 Models/
   ├── User.cs
   ├── Car.cs
   ├── Booking.cs
   ├── Payment.cs
   ├── Notification.cs
   ├── PasswordResetToken.cs
   ├── LoginVerificationToken.cs
   └── Enums/
       └── Enums.cs

📁 DTOs/
   ├── Auth/AuthDtos.cs
   ├── CarDto.cs
   ├── BookingDto.cs
   ├── PaymentDto.cs
   ├── UserDto.cs
   └── NotificationDto.cs

📁 Data/
   └── ApplicationDbContext.cs

📁 Migrations/
   └── [All migration files]

📄 FinalExam3.csproj
📄 Program.cs (initial setup)
📄 appsettings.json
```

---

### 2. mdanny11 - Backend API Layer
**GitHub:** [@mdanny11](https://github.com/mdanny11)
**Role:** Backend Developer & API Architect

**Responsibilities:**
- Built all RESTful API controllers
- Implemented business logic services
- Created authentication & authorization logic
- Developed email notification system
- Implemented JWT token generation

**Files Contributed:**
```
📁 Controllers/
   ├── AuthController.cs
   ├── UsersController.cs
   ├── CarsController.cs
   ├── BookingsController.cs
   ├── PaymentsController.cs
   ├── ReportsController.cs
   ├── NotificationsController.cs
   └── HealthController.cs

📁 Services/
   ├── AuthService.cs
   ├── UserService.cs
   ├── CarService.cs
   ├── BookingService.cs
   ├── PaymentService.cs
   ├── EmailService.cs
   ├── NotificationService.cs
   ├── ReportService.cs
   └── Interfaces/
       ├── IAuthService.cs
       ├── IUserService.cs
       ├── ICarService.cs
       ├── IBookingService.cs
       ├── IPaymentService.cs
       ├── IEmailService.cs
       ├── INotificationService.cs
       └── IReportService.cs

📁 Helpers/
   └── PagedResponse.cs
```

---

### 3. dush04souvenir - Frontend State & API Integration
**GitHub:** [@dush04souvenir](https://github.com/dush04souvenir)
**Role:** Frontend Developer & State Management

**Responsibilities:**
- Set up Redux state management
- Created API service layer
- Implemented routing configuration
- Built authentication flow logic
- Connected frontend to backend APIs

**Files Contributed:**
```
📁 kigalidrive-frontend/src/
   ├── store/
   │   ├── store.js
   │   └── slices/
   │       ├── authSlice.js
   │       ├── carSlice.js
   │       ├── bookingSlice.js
   │       └── notificationSlice.js
   │
   ├── services/
   │   └── api.js
   │
   ├── App.jsx (routing)
   ├── main.jsx
   └── index.html

📄 package.json
📄 vite.config.js
📄 .env.example
```

---

### 4. Gerry-13 - Frontend UI/UX Design
**GitHub:** [@Gerry-13](https://github.com/Gerry-13)
**Role:** Frontend Designer & UI Developer

**Responsibilities:**
- Created all React page components
- Designed responsive UI layouts
- Implemented CSS styling and themes
- Built reusable UI components
- Designed user experience flows

**Files Contributed:**
```
📁 kigalidrive-frontend/src/
   ├── pages/
   │   ├── Home.jsx
   │   ├── Login.jsx
   │   ├── Register.jsx
   │   ├── Dashboard.jsx
   │   ├── Cars.jsx
   │   ├── CarDetails.jsx
   │   ├── MyCars.jsx
   │   ├── AddCar.jsx
   │   ├── MyBookings.jsx
   │   ├── OwnerBookings.jsx
   │   ├── Payments.jsx
   │   ├── Users.jsx
   │   ├── Approvals.jsx
   │   ├── Reports.jsx
   │   ├── Profile.jsx
   │   └── NotFound.jsx
   │
   ├── components/
   │   ├── Layout.jsx
   │   ├── Navbar.jsx
   │   ├── Sidebar.jsx
   │   ├── Footer.jsx
   │   ├── CarCard.jsx
   │   ├── BookingModal.jsx
   │   ├── ProtectedRoute.jsx
   │   ├── ThemeProvider.jsx
   │   └── RevenueCharts.jsx
   │
   └── index.css
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                      KIGALIDRIVE                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────────┐  ┌─────────────────┐                   │
│  │   Gerry-13      │  │  dush04souvenir │                   │
│  │   UI/Design     │  │  State/Routing  │                   │
│  │   (Pages, CSS)  │  │  (Redux, API)   │                   │
│  └────────┬────────┘  └────────┬────────┘                   │
│           │    FRONTEND        │                             │
│           └────────┬───────────┘                             │
│                    │                                         │
│  ══════════════════╪═════════════════════════════════════   │
│                    │ HTTP/REST                               │
│  ══════════════════╪═════════════════════════════════════   │
│                    │                                         │
│           ┌────────┴───────────┐                             │
│           │     mdanny11       │                             │
│           │   Controllers &    │                             │
│           │     Services       │                             │
│           └────────┬───────────┘                             │
│                    │    BACKEND                              │
│           ┌────────┴───────────┐                             │
│           │    Freedauce       │                             │
│           │   Models, DTOs,    │                             │
│           │   Database Layer   │                             │
│           └────────────────────┘                             │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Contribution Statistics

| Developer | Layer | Files | Lines of Code |
|-----------|-------|-------|---------------|
| Freedauce | Data Layer | ~20 | ~1,500 |
| mdanny11 | API Layer | ~18 | ~3,000 |
| dush04souvenir | State/Routing | ~10 | ~800 |
| Gerry-13 | UI/Design | ~25 | ~4,000 |

---

## 🔄 Development Workflow

1. **Freedauce** created the database schema and models
2. **mdanny11** built the API endpoints using those models
3. **dush04souvenir** connected the frontend to the backend APIs
4. **Gerry-13** designed and styled the user interface

---

## 📝 Commit History

### Push 1: Database & Data Layer (Freedauce)
- Initial project setup
- Database models and enums
- DTOs for data transfer
- Entity Framework migrations
- ApplicationDbContext configuration

### Push 2: Backend API Layer (mdanny11)
- REST API controllers
- Business logic services
- Authentication & JWT
- Email service implementation
- API documentation

### Push 3: Frontend State & Routing (dush04souvenir)
- Redux store setup
- API service integration
- React Router configuration
- Protected routes implementation
- Vite configuration

### Push 4: Frontend UI/Design (Gerry-13)
- React page components
- Reusable UI components
- CSS styling and themes
- Responsive design
- User experience flows
