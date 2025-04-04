# SoloFitness

A Solo Leveling inspired fitness tracking application that helps you level up your training journey.

## Features

- Daily exercise tracking (push-ups, sit-ups, squats, running)
- Leveling system with XP progression
- AI fitness coach integration
- Dark mode with Solo Leveling inspired theme
- Progressive Web App (PWA) support
- Offline functionality
- Push notifications for workout reminders

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/solofitness.git
cd solofitness
```

2. Install dependencies:
```bash
npm install
```

3. Create a .env file in the root directory with the following variables:
```
MONGODB_URI=your_mongodb_connection_string
PORT=3000
```

4. Start the development server:
```bash
npm run dev
```

5. Open your browser and navigate to `http://localhost:3000`

## Project Structure

```
solofitness/
├── public/             # Static files
│   ├── css/           # Stylesheets
│   ├── js/            # Client-side JavaScript
│   ├── icons/         # PWA icons
│   ├── index.html     # Main HTML file
│   ├── manifest.json  # PWA manifest
│   └── sw.js          # Service Worker
├── server.js          # Express server
├── package.json       # Project dependencies
├── .env              # Environment variables
├── .gitignore        # Git ignore file
├── PLANNING.md       # Project planning document
└── TASKS.md          # Task tracking document
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Inspired by Solo Leveling anime/manga
- Special thanks to the open-source community 