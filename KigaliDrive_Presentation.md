# KigaliDrive - Project Presentation
## Premium Car Rental Platform for Rwanda

---

# Problem Statement

**The Challenge in Rwanda's Car Rental Market:**

1. **Fragmented Market**: Car owners have no centralized platform to list their vehicles
2. **Trust Issues**: Clients struggle to find verified, reliable rental options
3. **Manual Processes**: Booking, payment, and communication happen through phone calls and cash
4. **No Transparency**: Hidden fees, unclear availability, and no standardized pricing
5. **Limited Access**: Tourist and business travelers have difficulty renting cars

**KigaliDrive solves these problems** by providing a modern, secure platform that connects car owners with clients, with professional email notifications, secure payments, and transparent booking workflows.

---

# Our Solution: KigaliDrive

| Problem | Solution |
|---------|----------|
| Fragmented market | Centralized platform for all listings |
| Trust issues | Role-based verification & approval workflow |
| Manual processes | Automated booking & payment system |
| No transparency | Real-time availability & clear pricing |
| Limited access | Web platform accessible from anywhere |

**Key Value Proposition:**
- 5% platform commission model
- Professional email notifications
- Secure JWT authentication
- Real-time in-app notifications
- Admin dashboard with analytics

---

# Technology Stack

| Layer | Technology |
|-------|------------|
| **Backend** | .NET 8 Web API |
| **Database** | SQLite with Entity Framework Core |
| **Authentication** | JWT Bearer Tokens + BCrypt + Google OAuth |
| **Frontend** | React 18 + Redux Toolkit |
| **Build Tool** | Vite |
| **Email** | Gmail SMTP |
| **Deployment** | Docker + Docker Compose |
| **Web Server** | Nginx |

---

# Team Presentation

This project was developed by a team of 4 developers, each responsible for a specific layer of the application.

---

# PART 1: Database & Data Layer
## Presented by: Freedauce
**Role: Database Architect & Backend Data Handler**

---

## 1.1 Overview

As the **Database Architect**, I designed the complete data foundation for KigaliDrive. My work involved creating the database schema, Entity Framework models, data transfer objects (DTOs), and migrations.

**My Core Responsibilities:**
- Design complete database schema
- Create Entity Framework models
- Implement DTOs for clean data transfer
- Set up database migrations
- Configure ApplicationDbContext

---

## 1.2 Database Schema Design

```
┌─────────────┐       ┌─────────────┐       ┌─────────────┐
│    User     │1     N│    Car      │1     N│   Booking   │
├─────────────┤◄──────┤─────────────│◄──────┤─────────────┤
│ Id (PK)     │       │ Id (PK)     │       │ Id (PK)     │
│ FirstName   │       │ Make        │       │ UserId (FK) │
│ LastName    │       │ Model       │       │ CarId (FK)  │
│ Email (UK)  │       │ Year        │       │ StartDate   │
│ PasswordHash│       │ LicensePlate│       │ EndDate     │
│ PhoneNumber │       │ PricePerDay │       │ TotalPrice  │
│ Role        │       │ OwnerId (FK)│       │ Status      │
│ IsActive    │       │ Status      │       └──────┬──────┘
│ IsEmailVer. │       │ IsAvailable │              │1
└─────────────┘       └─────────────┘              │
                                              ┌─────┴─────┐
                                              │  Payment  │
                                              ├───────────┤
                                              │ Id (PK)   │
                                              │BookingId  │
                                              │ Amount    │
                                              │ Status    │
                                              └───────────┘
```

---

## 1.3 Key Models I Created

### User Model
- Stores authentication data (email, password hash)
- Role-based access control (Admin, Manager, CarOwner, Client)
- Email verification tracking

### Car Model  
- Complete vehicle information (make, model, year, license plate)
- Linked to owner with foreign key
- Status tracking for approval workflow

### Booking Model
- Links clients to cars with date ranges
- Automatic total price calculation
- Status progression (Pending → Confirmed → InProgress → Completed)

### Payment Model
- One-to-one relationship with Booking
- Platform commission tracking (5%)
- Payment confirmation workflow

---

## 1.4 Enums I Designed

```csharp
public enum UserRole { Admin=1, Manager=2, CarOwner=3, Client=4 }
public enum ApprovalStatus { Pending=1, Approved=2, Rejected=3 }
public enum BookingStatus { Pending=1, Confirmed=2, InProgress=3, Completed=4, Cancelled=5 }
public enum PaymentStatus { Pending=1, Paid=2, Failed=3 }
public enum CarStatus { PendingApproval=1, Available=2, Rented=3, Maintenance=4 }
```

---

## 1.5 Files I Contributed

```
📁 Models/
   ├── User.cs
   ├── Car.cs
   ├── Booking.cs
   ├── Payment.cs
   ├── Notification.cs
   ├── PasswordResetToken.cs
   └── LoginVerificationToken.cs

📁 DTOs/
   ├── AuthDtos.cs
   ├── CarDto.cs
   ├── BookingDto.cs
   ├── PaymentDto.cs
   ├── UserDto.cs
   └── NotificationDto.cs

📁 Data/
   └── ApplicationDbContext.cs

📁 Migrations/
   └── [All migration files]
```

---

# PART 2: Backend API Layer
## Presented by: mdanny11
**Role: Backend Developer & API Architect**

---

## 2.1 Overview

As the **Backend Developer**, I built the entire RESTful API that powers KigaliDrive. This includes all controllers, business logic services, authentication system, and email notifications.

**My Core Responsibilities:**
- Build RESTful API controllers
- Implement business logic services
- Create authentication & authorization (JWT)
- Develop email notification system
- Handle all server-side validation

---

## 2.2 API Architecture

I organized the backend into distinct layers:

```
┌─────────────────────────────────────────┐
│            Controllers                   │
│  (HTTP Endpoints - Request/Response)     │
├─────────────────────────────────────────┤
│              Services                    │
│    (Business Logic & Validation)         │
├─────────────────────────────────────────┤
│           Data Layer                     │
│    (Entity Framework & Database)         │
└─────────────────────────────────────────┘
```

---

## 2.3 Controllers I Built

| Controller | Endpoints | Purpose |
|------------|-----------|---------|
| **AuthController** | 8 | Registration, login, verification, password reset |
| **UsersController** | 7 | User management, approvals, deactivation |
| **CarsController** | 8 | Car listings, approvals, availability |
| **BookingsController** | 6 | Booking creation, status updates |
| **PaymentsController** | 4 | Payment confirmation, tracking |
| **ReportsController** | 3 | Dashboard statistics, analytics |
| **NotificationsController** | 4 | In-app notifications |
| **HealthController** | 1 | API health check |

---

## 2.4 Key Services I Implemented

### AuthService
- User registration with 6-digit email verification
- JWT token generation (7-day expiry)
- Password hashing with BCrypt
- Google OAuth integration

### EmailService
- Gmail SMTP integration
- Professional HTML email templates
- CEO welcome emails
- Verification code emails
- Payment confirmation emails

### BookingService
- Date conflict detection
- Automatic price calculation
- Status workflow management

---

## 2.5 Authentication Flow I Designed

```
Client/CarOwner Registration:
1. User submits form → 2. 6-digit code generated
3. Email sent → 4. User enters code
5. Account verified → 6. JWT token issued
```

```
Admin/Manager Login:
1. Credentials submitted → 2. JWT token returned immediately
```

---

## 2.6 Files I Contributed

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
   └── ReportService.cs

📁 Services/Interfaces/
   └── [All interface files]
```

---

# PART 3: Frontend State & API Integration
## Presented by: dush04souvenir
**Role: Frontend Developer & State Management**

---

## 3.1 Overview

As the **Frontend State Manager**, I connected the React frontend to the backend API. I set up Redux for global state management, created the API service layer, and implemented routing.

**My Core Responsibilities:**
- Set up Redux Toolkit store
- Create API service integration
- Implement React Router configuration
- Build authentication flow logic
- Connect frontend to backend APIs

---

## 3.2 Redux Store Architecture

```javascript
store/
├── store.js           // Redux store configuration
└── slices/
    ├── authSlice.js       // Authentication state
    ├── carSlice.js        // Cars data
    ├── bookingSlice.js    // Bookings management
    └── notificationSlice.js // Notifications
```

---

## 3.3 API Service Layer

I created a centralized API service that:
- Manages all HTTP requests to the backend
- Automatically attaches JWT tokens
- Handles authentication errors
- Provides consistent error handling

```javascript
// api.js features:
- Axios instance with base URL
- Request interceptor for JWT token
- Response interceptor for error handling
- All API endpoints centralized
```

---

## 3.4 Authentication Flow

```
Login Flow:
1. User submits credentials
2. API call to /api/auth/login
3. Receive JWT token
4. Store in localStorage
5. Update Redux auth state
6. Navigate to dashboard

Logout Flow:
1. Clear localStorage
2. Reset Redux state
3. Redirect to login
```

---

## 3.5 Protected Routes

I implemented route protection to ensure users can only access pages they're authorized for:

```jsx
<Route path="/dashboard" element={
  <ProtectedRoute roles={['Admin', 'Manager', 'CarOwner', 'Client']}>
    <Dashboard />
  </ProtectedRoute>
} />

<Route path="/users" element={
  <ProtectedRoute roles={['Admin']}>
    <Users />
  </ProtectedRoute>
} />
```

---

## 3.6 Files I Contributed

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
   ├── App.jsx (routing configuration)
   ├── main.jsx
   └── index.html

📄 package.json
📄 vite.config.js
📄 .env.example
```

---

# PART 4: Frontend UI/UX Design
## Presented by: Gerry-13
**Role: Frontend Designer & UI Developer**

---

## 4.1 Overview

As the **UI/UX Designer**, I created all the visual components and pages for KigaliDrive. I focused on creating a modern, responsive, and user-friendly interface.

**My Core Responsibilities:**
- Create all React page components
- Design responsive UI layouts
- Implement CSS styling and themes
- Build reusable UI components
- Design user experience flows

---

## 4.2 Pages I Designed

| Page | Purpose | Key Features |
|------|---------|--------------|
| **Home** | Landing page | Hero section, featured cars |
| **Login** | Authentication | Form validation, Google OAuth |
| **Register** | New account | Role selection, email verification |
| **Dashboard** | Overview | Stats, charts, quick actions |
| **Cars** | Browse listings | Filters, search, car cards |
| **CarDetails** | Single car view | Booking modal, availability |
| **MyCars** | Owner's cars | Status tracking, edit/delete |
| **MyBookings** | Client's bookings | Status timeline |
| **Payments** | Payment management | Confirmation workflow |
| **Reports** | Analytics | Revenue charts, export options |

---

## 4.3 Reusable Components

I built these reusable components for consistent UI:

- **Layout.jsx** - Main app layout with sidebar
- **Navbar.jsx** - Top navigation with user menu
- **Sidebar.jsx** - Dashboard navigation
- **Footer.jsx** - App footer
- **CarCard.jsx** - Car listing card component
- **BookingModal.jsx** - Booking form popup
- **ProtectedRoute.jsx** - Auth-protected wrapper
- **ThemeProvider.jsx** - Dark/light mode support
- **RevenueCharts.jsx** - Analytics visualizations

---

## 4.4 Design Highlights

### Color Palette
- Primary: Modern blue tones
- Accent: Professional accents
- Dark mode support

### Typography
- Clean, readable fonts
- Proper hierarchy
- Responsive sizing

### User Experience
- Intuitive navigation
- Clear call-to-actions
- Loading states
- Error handling displays

---

## 4.5 Responsive Design

I ensured all pages work perfectly on:
- 📱 Mobile devices
- 📱 Tablets
- 💻 Laptops
- 🖥️ Desktop monitors

---

## 4.6 Files I Contributed

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
   │   └── Profile.jsx
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

# System Architecture Summary

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

# Key Features Summary

| Feature | Description |
|---------|-------------|
| **Multi-Role System** | Admin, Manager, Car Owner, Client |
| **Email Verification** | 6-digit code for registration |
| **Google OAuth** | One-click sign-in |
| **Real-Time Notifications** | In-app + Email |
| **Payment Processing** | 5% platform commission |
| **Car Management** | Listing & approval workflow |
| **Booking System** | Date-based with conflict detection |
| **Analytics Dashboard** | Revenue, bookings, statistics |
| **Docker Deployment** | Cross-platform containerization |

---

# Contribution Statistics

| Developer | Layer | Files | Lines of Code |
|-----------|-------|-------|---------------|
| Freedauce | Data Layer | ~20 | ~1,500 |
| mdanny11 | API Layer | ~18 | ~3,000 |
| dush04souvenir | State/Routing | ~10 | ~800 |
| Gerry-13 | UI/Design | ~25 | ~4,000 |

**Total: ~73 files, ~9,300 lines of code**

---

# Demo Links

- **Frontend (Netlify)**: [https://group004.netlify.app/](https://group004.netlify.app/)
- **Backend (Railway)**: Connected via API

---

# Conclusion

KigaliDrive successfully demonstrates:
- ✅ Full-stack web development
- ✅ Role-based access control
- ✅ Secure authentication
- ✅ Real-world business logic
- ✅ Professional email system
- ✅ Modern React frontend
- ✅ RESTful API design
- ✅ Database design & ORM
- ✅ Team collaboration

---

# Thank You!

**Team KigaliDrive**
- Freedauce - Database & Data Layer
- mdanny11 - Backend API Layer
- dush04souvenir - Frontend State & Routing
- Gerry-13 - Frontend UI/UX Design
