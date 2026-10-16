# Caramelow Mobile App

A photo-sharing social app (Instagram-style MVP) built with TypeScript, React Native, and [Expo SDK 58](https://docs.expo.dev).

## What the MVP does

- **Log in / sign up** with a username and password (stored on-device).
- **Post a picture** with a caption (picked from your photo library).
- **Follow / unfollow** people from the Search tab or their profile.
- **Feed** shows posts from people you follow plus your own, newest first.
- **Profiles** with post grid and posts/followers/following counts.

> The backend is a local mock (AsyncStorage): accounts, follows and posts exist
> only on this device. Two accounts on the same phone can see and follow each
> other — phones cannot see each other. See TECH_README.md for the swap-to-a-real-backend
> plan. Demo account: `ava` / `demo1234`.

## Quick Start

```bash
npm install           # Install dependencies
npm start             # Start Metro dev server (or: npx expo start)
```

Then scan the QR code shown in the terminal:

- **Android**: open the Expo Go app and scan the QR code (or press `a` in the terminal to launch on an emulator if one is running).
- **iOS**: scan the QR code with the Camera app, then open the link in the Expo Go app (iOS requires the app; the App Store account must match your region).

No Android Studio or Xcode is needed for development with Expo Go.

## Prerequisites

- **Node.js**: 22.13+ or 24.3+ (check with `node --version`)
- **npm** 10+ (ships with Node)
- **Expo Go** app on your phone (free, from Google Play / App Store)
- VS Code (recommended; see below)

## Running in VS Code

The repo ships with workspace settings:

- `.vscode/extensions.json` — prompts you to install recommended extensions on first open (Expo Tools, ESLint, Prettier, EditorConfig).
- `.vscode/launch.json` — a "Run Expo dev server" launch configuration (F5 / Run and Debug) that starts Metro with the debugger attached.
- `.vscode/settings.json` — uses the workspace TypeScript version, hides noise from search.
- `.editorconfig` — consistent formatting (UTF-8, LF, 2-space indentation).

## Available Scripts

- `npm start` — Start Metro dev server
- `npm run lint` — Run ESLint (expo config)
- `npm run android` — Start dev server and open on Android (emulator or device)
- `npm run ios` — Start dev server and open on iOS (macOS required to launch a simulator)
- `npm run web` — Start dev server and open in a browser
- `npm run typecheck` — Run `tsc --noEmit`
- `npm run doctor` — Run expo-doctor (validates dependencies and config)

## Device Options

| Goal | Requirement | Command |
|---|---|---|
| Develop on a physical phone | Expo Go app installed | `npm start`, scan QR |
| Develop on an Android emulator | Android Studio (see [TECH_README.md](TECH_README.md)) | `npm run android` |
| Develop on an iOS simulator | A Mac with Xcode | `npm run ios` (on the Mac) |
| Build an iOS app from Linux/Windows | Free Expo account | `npx eas-cli@latest build --platform ios` |

See [TECH_README.md](TECH_README.md) for the full technical setup, architecture, and build details.
