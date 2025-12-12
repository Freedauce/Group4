# KigaliDrive 🚗

A premium car rental platform for the Rwandan market.

## Tech Stack
- **Backend:** .NET 8, Entity Framework Core, SQLite
- **Frontend:** React 18, Redux Toolkit, Vite
- **Auth:** JWT, BCrypt, Google OAuth
- **Email:** Gmail SMTP
- **Container:** Docker

## Features
- Multi-role system (Admin, Manager, Car Owner, Client)
- Email verification with 6-digit codes
- Car listing with approval workflow
- Booking system with payment processing
- Real-time notifications
- Admin dashboard with analytics

## Quick Start

### Backend
```bash
cd FinalExam3
dotnet restore
dotnet run
# API: http://localhost:5139
```

### Frontend
```bash
cd kigalidrive-frontend
npm install
npm run dev
# App: http://localhost:5173
```

### Docker
```bash
cp .env.example .env
docker-compose up --build
# Frontend: http://localhost:3000
# API: http://localhost:5139
```

## Team
- [@Freedauce](https://github.com/Freedauce) - Database & Data Layer
- [@mdanny11](https://github.com/mdanny11) - Backend API Layer
- [@dush04souvenir](https://github.com/dush04souvenir) - Frontend State & Routing
- [@Gerry-13](https://github.com/Gerry-13) - Frontend UI/Design

## License
MIT
