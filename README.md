# AWS End-of-Life Dashboard

A local-first Progressive Web App (PWA) for tracking and monitoring AWS resources with end-of-life (EOL) and end-of-support (EOS) information.

![Status](https://img.shields.io/badge/status-active-green)
![License](https://img.shields.io/badge/license-MIT-blue)

## Features

- 📊 **Dashboard View** - Visual overview of resource status with charts
- 🔍 **Resource Tracking** - Monitor EC2, RDS, Lambda, and EKS resources
- 📅 **EOL Monitoring** - Track end-of-life dates for AWS services
- 💾 **Offline-First** - Works completely offline with local IndexedDB storage
- 📱 **PWA Support** - Install as a standalone app on any device
- 🌓 **Dark Mode** - Automatic theme switching based on system preferences
- 📤 **Import/Export** - Full data portability with JSON/CSV support
- 🔒 **Privacy-First** - All data stored locally, no cloud dependencies

## Quick Start

### Prerequisites

- Node.js 16+ and npm
- AWS CLI (for fetching data)
- Modern web browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/eol-final.git
   cd eol-final
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

4. **Open in browser**
   Navigate to `http://localhost:3000`

## Fetching AWS Data

The dashboard uses a shell script to fetch data from AWS:

1. **Configure AWS CLI**
   ```bash
   aws configure
   ```

2. **Run the fetch script**
   ```bash
   ./scripts/fetch-aws-resources.sh
   ```

3. **Import data into dashboard**
   - Go to Settings → Import/Export
   - Click "Import from File"
   - Select the generated `data/resources.json`

See [AWS_FETCH_GUIDE.md](AWS_FETCH_GUIDE.md) for detailed instructions.

## Project Structure

```
eol-final/
├── public/                 # Static files and PWA assets
├── src/
│   ├── components/        # React components
│   │   ├── ui/           # Reusable UI components
│   │   ├── Dashboard.js  # Main dashboard view
│   │   ├── Resources.js  # Resource list view
│   │   └── Settings.js   # Settings page
│   ├── config/           # Database configuration
│   ├── context/          # React context providers
│   ├── hooks/            # Custom React hooks
│   └── utils/            # Utility functions
├── scripts/              # AWS fetch scripts
│   ├── fetch-aws-resources.sh
│   └── aws-eol-dates.json
└── data/                 # Generated data files
```

## Key Features

### Progressive Web App (PWA)
- Install on desktop or mobile
- Works offline
- Automatic updates
- Native app-like experience

### Data Management
- Import/Export resources (JSON/CSV)
- Backup/Restore functionality
- Manual resource entry
- Multi-account support

### Monitoring Features
- Status indicators (Expired/Expiring/Supported)
- EOL date tracking
- Resource filtering and search
- Visual charts and statistics

## Development

### Available Scripts

- `npm start` - Start development server
- `npm build` - Build for production
- `npm test` - Run tests

### Technology Stack

- **Frontend**: React 18, React Router, Framer Motion
- **Styling**: TailwindCSS, CSS Modules
- **Database**: Dexie (IndexedDB wrapper)
- **Charts**: Chart.js with react-chartjs-2
- **Icons**: Lucide React, Heroicons
- **Build**: Create React App

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- AWS for providing comprehensive APIs
- The open-source community for the amazing tools
- Contributors and testers

## Support

For issues, questions, or contributions, please open an issue on GitHub.