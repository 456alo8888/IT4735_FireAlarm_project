# Fire Alarm System Dashboard

A modern, responsive web dashboard for monitoring and managing fire alarm devices in real-time. Built with React, TypeScript, and Tailwind CSS.

## 🚀 Features

### Real-time Monitoring
- **Live Device Status**: Monitor fire alarm devices (smoke detectors, heat sensors, etc.) in real-time
- **Automatic Status Updates**: Devices automatically update their status every 5 seconds
- **Manual Testing**: Trigger test events to verify system functionality
- **Activity Logging**: Track all device events and system activities with timestamps

### Dashboard Overview
- **Summary Cards**: View total devices and status breakdown (Normal, Warning, Alarm)
- **Device Status Table**: Detailed view of all devices with their current status and sensor readings
- **Activity Log**: Real-time feed of system events and device status changes
- **Command Panel**: Interface for sending commands to devices (placeholder for future implementation)

### User Experience
- **Dark/Light Mode**: Toggle between light and dark themes
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices
- **Accessibility**: Full keyboard navigation and screen reader support
- **Error Handling**: Comprehensive error boundaries and loading states

## 🛠️ Technology Stack

### Frontend Framework
- **React 18** - Modern React with hooks and concurrent features
- **TypeScript** - Type-safe development with comprehensive interfaces
- **Vite** - Fast development server and optimized builds

### Styling & UI
- **Tailwind CSS** - Utility-first CSS framework
- **Material Symbols** - Modern iconography system
- **CSS Custom Properties** - Theme system for dark/light modes

### Testing & Quality
- **Vitest** - Fast unit testing framework
- **React Testing Library** - Component testing utilities
- **ESLint** - Code linting and formatting
- **Prettier** - Code formatting and consistency

## 📁 Project Structure

```
fire-alarm-dashboard/
├── src/
│   ├── components/          # React components
│   │   ├── SummaryCard.tsx     # Status summary cards
│   │   ├── DeviceStatusTable.tsx # Device listing table
│   │   ├── ActivityLog.tsx     # Activity feed component
│   │   ├── CommandPanel.tsx    # Device command interface
│   │   ├── ThemeToggle.tsx     # Dark/light mode toggle
│   │   └── ErrorBoundary.tsx   # Error handling component
│   ├── contexts/           # React Context providers
│   │   ├── DeviceContext.tsx   # Device state management
│   │   ├── ActivityContext.tsx # Activity logging state
│   │   └── ThemeContext.tsx    # Theme state management
│   ├── hooks/              # Custom React hooks
│   │   └── useRealtimeSimulation.ts # Real-time simulation logic
│   ├── types/              # TypeScript type definitions
│   │   └── index.ts            # Core type interfaces
│   ├── test/               # Test configuration
│   │   └── setup.ts            # Test environment setup
│   ├── App.tsx             # Main application component
│   ├── main.tsx            # Application entry point
│   └── index.css           # Global styles
├── public/                # Static assets
├── package.json           # Dependencies and scripts
├── tailwind.config.js     # Tailwind CSS configuration
├── tsconfig.json          # TypeScript configuration
└── vite.config.ts         # Vite build configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm
- Git for version control

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd fire-alarm-system/fire-alarm-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   Navigate to `http://localhost:5173` (or the URL shown in terminal)

### Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run preview      # Preview production build

# Building
npm run build        # Build for production
npm run build:test   # Build and test

# Code Quality
npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check code formatting

# Testing
npm run test         # Run unit tests
npm run test:ui      # Run tests with UI
npm run test:coverage # Run tests with coverage report
```

## 🏗️ Architecture

### State Management
The application uses React Context for state management:

- **DeviceContext**: Manages device list, status updates, and statistics
- **ActivityContext**: Handles activity logging and event tracking
- **ThemeContext**: Controls dark/light theme switching

### Component Architecture
- **Functional Components**: Using modern React hooks
- **Composition Pattern**: Reusable, composable components
- **Props Interface**: Strong TypeScript typing for all components
- **Error Boundaries**: Graceful error handling throughout the app

### Real-time Simulation
The app includes a sophisticated simulation system:
- **Automatic Updates**: Random device status changes every 5 seconds
- **Event Correlation**: Status changes generate corresponding activity logs
- **Manual Testing**: "Test Event" button for on-demand status changes
- **Realistic Scenarios**: Multiple device types with appropriate status values

## 📊 Device Types & Status

### Device Categories
- **Smoke Detectors**: Measure smoke density percentage
- **Heat Sensors**: Monitor temperature in Celsius
- **Multi-sensor Detectors**: Combined smoke and heat detection

### Status Levels
- **Normal**: Device operating within normal parameters
- **Warning**: Device detects concerning conditions (elevated temperature, moderate smoke)
- **Alarm**: Critical conditions detected requiring immediate attention

### Sensor Readings
- **Smoke Detectors**: Show smoke density (0-100%)
- **Heat Sensors**: Display temperature readings
- **Location Tracking**: Each device has an assigned location

## 🎨 Theme System

### Light Theme
- Background: Clean grays and whites
- Text: High contrast for readability
- Status Colors: Intuitive color coding (green=normal, yellow=warning, red=alarm)

### Dark Theme
- Background: Dark grays for reduced eye strain
- Text: Optimized contrast ratios
- Status Colors: Adjusted for dark mode visibility

### Customization
The theme system is easily extensible through Tailwind CSS configuration and CSS custom properties.

## 🧪 Testing

### Test Structure
- **Unit Tests**: Component logic and hooks
- **Integration Tests**: Component interactions
- **Accessibility Tests**: Screen reader and keyboard navigation
- **Visual Tests**: Component rendering across themes

### Running Tests
```bash
# Watch mode for development
npm run test

# Full test suite with coverage
npm run test:coverage

# Interactive test UI
npm run test:ui
```

## 🚀 Deployment

### Production Build
```bash
npm run build
```
Creates optimized static files in the `dist/` folder ready for deployment.

### Deployment Options
- **Static Hosting**: Deploy to Vercel, Netlify, or GitHub Pages
- **CDN**: Upload build files to any CDN
- **Web Server**: Serve from Apache, Nginx, or similar
- **Docker**: Containerize for scalable deployments

### Environment Configuration
- **Development**: Uses Vite development server
- **Production**: Optimized static build with minification
- **Testing**: Isolated test environment with jsdom

## 🔧 Configuration

### Tailwind CSS
Custom theme configuration in `tailwind.config.js`:
- Custom color palette
- Font family settings
- Dark mode support

### TypeScript
Strict TypeScript configuration:
- Comprehensive type definitions
- Interface inheritance
- Generic types for reusable components

### Build Tools
- **Vite**: Fast HMR and optimized builds
- **ESLint**: Code quality and consistency
- **Prettier**: Automatic code formatting

## 🤝 Contributing

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Code Style
- Follow TypeScript best practices
- Use Prettier for formatting
- Write meaningful commit messages
- Include tests for new features

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues, questions, or contributions:
- Create an issue in the repository
- Check existing documentation
- Review the test files for usage examples

## 🔮 Future Enhancements

### Planned Features
- **Real API Integration**: Connect to actual fire alarm systems
- **WebSocket Support**: Real-time bidirectional communication
- **Mobile App**: React Native companion application
- **Data Analytics**: Historical data analysis and reporting
- **Multi-building Support**: Manage multiple facilities
- **User Authentication**: Role-based access control
- **Alert Notifications**: Email/SMS alert system
- **Map Integration**: Visual device location mapping

### Technical Improvements
- **Performance**: Advanced code splitting and lazy loading
- **Offline Support**: PWA capabilities for offline operation
- **Internationalization**: Multi-language support
- **Advanced Testing**: E2E testing with Playwright or Cypress

---

**Built with ❤️ for safety and security**