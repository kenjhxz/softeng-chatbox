# WhatYaNeed - Community Needs Board

A platform connecting community members who need help with volunteers who can offer assistance.

## Features

### Core Functionality
- **User Management**: Registration and authentication for requesters and volunteers
- **Request System**: Create and browse help requests with categories and urgency levels
- **Offer Management**: Volunteers can offer help on requests
- **Notifications**: Real-time notification system for updates

### New Features (Latest Release)

#### 1. Chat System
- Real-time messaging between requesters and volunteers
- Auto-polling for new messages (3-second interval)
- Message history persistence
- XSS protection with server-side HTML sanitization
- Auto-scroll to latest messages

#### 2. Offer Management
- Requesters can accept or decline volunteer offers
- Status tracking (pending, accepted, declined)
- Automatic notifications when offers are processed
- Display pending offers count in dashboard

#### 3. Interactive Map Display
- Uses free OpenStreetMap with Leaflet library (no API keys required)
- Display volunteer markers when offer is accepted
- Popup information on marker click
- Auto-fit map to show all markers
- Coordinate validation for security
- Responsive design

## Technology Stack

### Backend
- Node.js with Express.js
- MySQL database
- Session-based authentication
- bcrypt for password hashing

### Frontend
- Vanilla JavaScript
- Leaflet.js for maps
- Font Awesome icons
- Responsive CSS

## Installation

1. Clone the repository
```bash
git clone https://github.com/kenjhxz/softeng-chatbox.git
cd softeng-chatbox
```

2. Install dependencies
```bash
npm install
```

3. Set up database
```bash
# Create MySQL database
mysql -u root -p < whatyaneed-database.sql
```

4. Configure environment variables
```bash
# Create .env file with:
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=WhatYaNeed
PORT=3000
```

5. Start the server
```bash
npm start
# or for development
npm run dev
```

6. Open the frontend
Open `whatyaneed-frontend.html` in a browser or serve it with a local web server.

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Requests
- `GET /api/requests` - Get all open requests
- `POST /api/requests` - Create new request (requester only)
- `GET /api/requester/requests` - Get requester's requests

### Offers
- `POST /api/offers` - Create offer (volunteer only)
- `GET /api/volunteer/offers` - Get volunteer's offers
- `GET /api/requests/:request_id/offers` - Get offers for a request (requester only)
- `POST /api/offers/:offer_id/accept` - Accept offer (requester only)
- `POST /api/offers/:offer_id/decline` - Decline offer (requester only)

### Chat
- `POST /api/messages` - Send message
- `GET /api/messages?offer_id=:id` - Get message history

### Map
- `GET /api/offers/:offer_id/volunteer-location` - Get volunteer location

### Notifications
- `GET /api/notifications` - Get notifications
- `GET /api/notifications/unread-count` - Get unread count
- `PATCH /api/notifications/:id/read` - Mark as read

## Security Features

- **XSS Protection**: Server-side HTML sanitization for chat messages
- **SQL Injection Prevention**: Parameterized queries
- **CSRF Protection**: Session-based authentication
- **Authorization Checks**: Endpoint-level access control
- **Password Security**: bcrypt hashing with salt
- **Input Validation**: Coordinate and data validation

## Database Schema

### Tables
- `users` - User accounts (requesters, volunteers, admins)
- `requests` - Help requests
- `help_offers` - Volunteer offers with acceptance tracking
- `messages` - Chat messages between users
- `notifications` - System notifications

## File Structure

```
softeng-chatbox/
├── server.js                    # Backend server
├── whatyaneed-frontend.html     # Main HTML file
├── whatyaneed-frontend.js       # Frontend JavaScript
├── whatyaneed-frontend.css      # Frontend styles
├── chat-system.js               # Chat interface class
├── chat-map-styles.css          # Chat and map styling
├── map-display.js               # Map display class
├── whatyaneed-database.sql      # Database schema
├── package.json                 # Dependencies
└── README.md                    # This file
```

## Usage

### As a Requester
1. Register as a requester
2. Create a help request with details
3. View offers from volunteers on your dashboard
4. Accept or decline offers
5. Chat with volunteers
6. View volunteer location on map when offer is accepted

### As a Volunteer
1. Register as a volunteer
2. Browse available requests
3. Offer help on requests
4. Chat with requesters
5. View your offer status on dashboard

## Development

- `npm start` - Start production server
- `npm run dev` - Start development server with auto-reload
- `npm run init-db` - Initialize database

## License

ISC

## Authors

Ducut, Mascardo