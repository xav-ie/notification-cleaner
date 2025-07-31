# Notification Cleaner

A simple notification cleaner for macOS that clears all notifications from the Notification Center.

## Installation

### Using Nix

While Notification Center is open:

```bash
nix run github:xav-ie/notification-cleaner
```

### From Source

1. Build the project:

```bash
npm run build
```

2. Run the script:

```bash
osascript -l JavaScript ./dist/src/index.js
```

## Usage

Simply run the executable:

```bash
notification-cleaner
```

The tool will automatically:

- Find all available notifications
- Clear them using "Clear All" and "Close" actions
- Report how many notifications were cleared

## Requirements

- macOS

## License

MIT License - see [LICENSE](LICENSE) file for details.

