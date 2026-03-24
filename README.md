# EaseOn
EaseOn project. Currently a working prototype.

ease-on/
├── frontend/              ← React app (Vite)
│   ├── src/
│   │   ├── EaseOn.jsx     ← Main app component (all screens)
│   │   └── main.jsx       ← Entry point
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── backend/               ← Node.js API server
│   ├── server.js          ← Entry point (Express + Socket.IO)
│   ├── config/            ← DB, Firebase, Socket configs
│   ├── routes/            ← API endpoints
│   ├── controllers/       ← Request handlers
│   ├── services/          ← Business logic
│   ├── models/            ← Sequelize models (7 tables)
│   ├── middleware/         ← Auth, validation, errors
│   ├── migrations/        ← DB schema
│   ├── seeders/           ← Sample data
│   └── package.json
│
├── setup.sh               ← One-command Mac setup
├── package.json            ← Root scripts
└── README.md               ← You are here
