# Event Booking Platform - Frontend

A modern, responsive frontend for an event booking platform built with React, Vite, and TailwindCSS.

## 🏗️ Architecture

### Tech Stack
- **Framework**: React 19
- **Build Tool**: Vite
- **Styling**: TailwindCSS + shadcn/ui components
- **State Management**: TanStack Query (React Query)
- **Form Handling**: React Hook Form + Zod validation
- **Routing**: React Router DOM v7
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: Sonner

### Project Structure
```
frontend/
├── public/                    # Static assets
├── src/
│   ├── api/                   # API client and endpoints
│   │   ├── client.js          # Axios instance
│   │   ├── events.js          # Event API calls
│   │   └── attendees.js       # Attendee/Booking API calls
│   ├── components/            # React components
│   │   ├── ui/                # shadcn/ui components
│   │   ├── EventForm.jsx
│   │   ├── EventList.jsx
│   │   ├── AttendeeForm.jsx
│   │   ├── AttendeeList.jsx
│   │   ├── BookingModal.jsx
│   │   ├── Navbar.jsx
│   │   └── ProtectedRoute.jsx
│   ├── pages/                 # Page components
│   │   ├── PublicEventsPage.jsx
│   │   ├── EventsPage.jsx
│   │   ├── EventAttendeesPage.jsx
│   │   ├── LoginPage.jsx
│   │   └── SignupPage.jsx
│   ├── hooks/                 # Custom hooks
│   │   ├── useAuth.js
│   │   └── use-toast.js
│   ├── lib/                   # Utilities
│   │   ├── auth.js
│   │   ├── utils.js
│   │   └── queryClient.js
│   ├── schemas/               # Zod validation schemas
│   ├── App.jsx                # Main app component
│   ├── main.jsx              # App entry point
│   └── index.css             # Global styles
├── package.json
├── vite.config.js
├── tailwind.config.js
└── .env                      # Environment variables
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Backend API running

### Installation

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the frontend directory:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

   The app will open at `http://localhost:5173`

## 📱 Features & Pages

### Public Pages

#### Home / Events Page (`/`)
- View all available events
- See real-time seat availability (e.g., "15/50 booked")
- Book events (requires login)
- View booking status badges (Pending/Approved/Rejected)
- Cancel bookings
- **Admin Features**: Create, edit, delete events

#### Login Page (`/login`)
- User authentication
- JWT token management
- Redirect to home after login

#### Signup Page (`/signup`)
- New user registration
- Auto-login after signup

### Protected Pages (Require Authentication)

#### Events Management (`/events`)
- **Admin Only**: Full event CRUD operations
- View all events with attendee lists
- Manage event details

#### Event Attendees (`/events/:id/attendees`)
- **Admin Only**: Manage attendees for specific event
- Add attendees manually (auto-approved)
- Update attendee information
- Delete attendees
- **Booking Status Management**: 
  - Dropdown to change status: Pending → Approved/Rejected/Cancelled
  - Real-time status updates
  - Color-coded status badges

## 🎨 UI Components

### Custom Components

**EventList**: Displays events in a card grid
**EventForm**: Create/edit event modal with validation
**AttendeeList**: Table view with status dropdowns (admin) or badges (users)
**AttendeeForm**: Add/edit attendee modal
**BookingModal**: User-friendly booking interface with confirmation
**Navbar**: Responsive navigation with auth status
**ProtectedRoute**: Route wrapper for authentication/authorization

### shadcn/ui Components
- Button, Card, Dialog, Input, Label
- Table, Skeleton, Toast/Toaster
- All styled with TailwindCSS

## 🔐 Authentication Flow

### Login Process
1. User enters credentials
2. API returns JWT token + user data
3. Token stored in localStorage
4. User data cached in React Query
5. Automatic redirection

### Token Management
- Stored in `localStorage` as `authToken`
- Auto-attached to API requests via Axios interceptor
- Validated on protected routes
- Cleared on logout

### Role-Based UI
```jsx
{user?.role === 'admin' ? (
  <AdminControls />
) : (
  <UserControls />
)}
```

## 📡 API Integration

### API Client (`src/api/client.js`)
```javascript
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Auto-attach JWT token
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### React Query Setup
```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});
```

## 🎯 Key Features

### Booking Status Workflow
1. **User books event** → Status: `PENDING` (Yellow badge)
2. **Admin approves/rejects** → Status updates via dropdown
3. **User sees status** → Color-coded badge on home page
4. **States**: 
   - 🟡 `PENDING`: Awaiting admin approval
   - 🟢 `APPROVED`: Booking confirmed
   - 🔴 `REJECTED`: Booking denied
   - ⚫ `CANCELLED`: Booking cancelled

### Real-Time Updates
- Uses React Query's automatic cache invalidation
- Optimistic updates for instant UI feedback
- Background refetching on data changes
- Cache synchronization across pages

### Responsive Design
- Mobile-first approach
- Tailwind breakpoints: `sm:`, `md:`, `lg:`
- Responsive navigation
- Card grid layouts adapt to screen size

## 🛠️ Available Scripts

```bash
# Development server with HMR
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## 🌍 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API URL | `http://localhost:5000` |

**Note**: Vite requires `VITE_` prefix for env variables

## 🎨 Styling

### TailwindCSS Configuration
- Custom color scheme
- Animation utilities
- Component variants
- Responsive utilities

### Global Styles (`index.css`)
- CSS variables for theming
- Dark mode support (optional)
- Typography defaults
- Custom utility classes

## 📦 Build & Deployment

### Production Build
```bash
npm run build
```
- Output: `dist/` directory
- Optimized and minified
- Ready for static hosting

### Deployment Options
- **Vercel**: `vercel.json` included
- **Netlify**: Drag & drop `dist/`
- **GitHub Pages**: Use `vite-plugin-gh-pages`
- **Any static host**: Upload `dist/`

### Build Configuration
```javascript
// vite.config.js
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
```

## 🐛 Debugging

### Common Issues

**API Connection Error**
- Verify `VITE_API_URL` in `.env`
- Check backend server is running
- Verify CORS settings in backend

**Authentication Issues**
- Clear localStorage: `localStorage.clear()`
- Check token expiration (7 days)
- Verify JWT_SECRET matches backend

**Build Errors**
```bash
# Clear cache and rebuild
rm -rf node_modules dist .vite
npm install
npm run build
```

## 🔄 State Management

### React Query Queries
```javascript
// Fetch events
const { data: events, isLoading } = useQuery({
  queryKey: ['publicEvents'],
  queryFn: fetchPublicEvents,
});
```

### React Query Mutations
```javascript
// Book event
const bookingMutation = useMutation({
  mutationFn: bookEvent,
  onSuccess: () => {
    queryClient.invalidateQueries(['publicEvents']);
  },
});
```
