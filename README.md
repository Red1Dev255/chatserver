# Game Server

This project is a game server built using Express and Socket.IO, designed for real-time communication and user interaction in a gaming environment.

## Project Structure

```
game-server
├── src
│   ├── server.ts              # Entry point of the application
│   ├── controllers
│   │   └── index.ts          # Contains game-related logic
│   ├── routes
│   │   └── index.ts          # Sets up API routes
│   └── types
│       └── index.ts          # Defines types used in the application
├── package.json               # npm configuration file
├── tsconfig.json              # TypeScript configuration file
└── README.md                  # Project documentation
```

## Setup Instructions

1. **Clone the repository:**
   ```
   git clone <repository-url>
   cd game-server
   ```

2. **Install dependencies:**
   ```
   npm install
   ```

3. **Compile TypeScript:**
   ```
   npm run build
   ```

4. **Run the server:**
   ```
   npm start
   ```

## Usage Guidelines

- The server listens on port 3000 by default.
- Users can connect to the server using WebSocket and join specific rooms to interact with each other.
- Messages can be sent and received in real-time within the rooms.

## Contributing

Feel free to submit issues or pull requests for improvements or bug fixes.