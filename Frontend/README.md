# 🌍 Smart Waste Management System

A modern waste management platform with role-based dashboards, real-time reporting, and AI-powered waste classification.

## ✨ Features

- **Citizens**: Report waste with photos and geolocation
- **Municipal Workers**: Manage waste collection and routes
- **Administrators**: Oversee system and manage users
- Beautiful gradient-based design with dark mode
- Drag-and-drop image upload with preview
- Automatic geolocation detection
- JWT authentication with protected routes

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:5000/api" > .env.local

# Start backend (in another terminal)
cd ../waste_mgmt_project/backend
npm start

# Start frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Structure

```
app/
├── admin/          # Admin dashboard
├── citizen/        # Citizen dashboard
├── municipal/      # Municipal dashboard
├── login/          # Login page
├── register/       # Registration page
├── select-role/    # Role selection
└── page.js         # Home page

components/
├── Navbar.js           # Navigation
├── ProtectedRoute.js   # Route protection
└── ui/                 # UI components

context/
└── AuthContext.js      # Authentication state

lib/
└── api.js              # API configuration
```

## 🎯 Routes

| Route | Access |
|-------|--------|
| `/` | Public |
| `/select-role` | Public |
| `/login` | Public |
| `/register` | Public |
| `/citizen` | Citizens only |
| `/municipal` | Municipal only |
| `/admin` | Admins only |
| `/about` | Public |
| `/contact` | Public |

## 🛠️ Tech Stack

- Next.js 14, React 18, Tailwind CSS
- Radix UI + shadcn/ui components
- Framer Motion animations
- Axios for API calls
- React Context for state management

## 🌐 Backend

Requires backend running on `http://localhost:5000`

API endpoints:
- `/api/auth/login`, `/api/auth/register`
- `/api/citizen/report`, `/api/citizen/reports`
- `/api/municipal/reports`
- `/api/admin/users`, `/api/admin/reports`
