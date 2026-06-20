# WALL.E - Frontend Application

This directory contains the user interface for the WALL.E Smart Waste Management Platform. It is built using modern web technologies to provide a fast, responsive, and beautiful experience for Citizens, Municipal Workers, and Administrators.

## Tech Stack

- **Framework**: Next.js (App Router)
- **Library**: React.js
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Components**: Radix UI / Custom Components
- **API Client**: Axios (configured in `lib/api.js`)

## Roles & Dashboards

The frontend dynamically routes users based on their authenticated role:
- **Citizen Portal (`/dashboard`)**: Where citizens can snap pictures of waste, submit reports, track their report statuses, and view their gamification points and badges.
- **Municipal Dashboard (`/municipal`)**: An interface for waste collection workers to see pending reports, view exact locations, and mark reports as "Collected".
- **Admin Panel (`/admin`)**: A comprehensive management suite to view user statistics, manage accounts, view system-wide reports, and generate Waste Analytics to send to the municipal corporation.

## Setup & Running Locally

1. **Install Dependencies**:
   Make sure you are in the `Frontend` directory, then run:
   ```bash
   npm install
   ```

2. **Environment Variables**:
   Create a `.env.local` file in this directory with the backend API URL:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. **Start the Development Server**:
   ```bash
   npm run dev
   ```
   The application will be available at [http://localhost:3000](http://localhost:3000).

## Project Structure
- `app/`: Next.js App Router pages (auth, dashboards, etc.)
- `components/`: Reusable UI components (buttons, inputs, protected routes)
- `context/`: React Context providers (AuthContext for managing user sessions)
- `lib/`: Utility functions and API configurations
