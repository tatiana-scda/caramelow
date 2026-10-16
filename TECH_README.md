# Technical Readme — Caramelow Mobile App

## Core Technology Stack

| Package | Version | Notes |
|---|---|---|
| Expo SDK | ~58.0.14 | Framework, tooling, CNG (see below) |
| React Native | 0.88.0 | |
| React | 19.3.0 | |
| TypeScript | ~6.0.3 | Strict mode enabled |

Node.js requirement for Expo SDK 58: `^22.13.0 || ^24.3.0 || ^26.0.0 || >=27.0.0`.

## Architecture

### Expo with Continuous Native Generation (CNG)

There are no `android/` or `ios/` folders in the repository. Native projects are
generated on demand from `app.json` when you run `expo prebuild` or
`npx expo run:android|ios`, and are git-ignored. Consequences:

- Never create or edit native folders by hand. Configure native behavior in
  `app.json` and Expo config plugins.
- The JS-only workflow (`npm start` + Expo Go) never needs Android Studio or Xcode.
- Once you add a library with native code, Expo Go no longer works for that
  library — switch to a development build (`npx expo run:android`, or
  `eas build --profile development`).

### Project Structure

```
caramelow/
├── app.json             # Expo config (app name, scheme, icon, platform settings)
├── assets/              # Icons + seed/ demo images
├── src/
│   ├── app/             # Expo Router routes (every file = screen)
│   │   ├── _layout.tsx        # Root stack, auth gate
│   │   ├── login.tsx          # Log in / sign up
│   │   ├── post.tsx           # Post composer (image picker + caption)
│   │   ├── user/[id].tsx      # Other user's profile (follow button)
│   │   └── (tabs)/            # Bottom tabs
│   │       ├── _layout.tsx    # Tab navigator
│   │       ├── index.tsx      # Feed
│   │       ├── search.tsx     # Find and follow people
│   │       └── profile.tsx    # Own profile
│   ├── components/      # Reusable UI (PostCard, UserRow, Avatar, ...)
│   ├── context/        # AuthContext (session state)
│   ├── lib/            # Data layer
│   │   ├── backend.ts  # The "API": auth, follows, posts, feed, seed data
│   │   ├── db.ts       # AsyncStorage tables (users, posts, follows, session)
│   │   ├── types.ts    # User, Post, Follow, FeedPost, UserStats
│   │   └── util.ts     # makeId, hashPassword (mock-only), timeAgo
│   └── theme.ts        # Colors, spacing, typography tokens
├── .vscode/            # Editor settings
└── package.json
```

### Mock backend

All data lives in AsyncStorage under `caramelow.*` keys, seeded on first launch
with two demo users (`ava`, `leo`, password `demo1234`). Everything is scoped to
one device: **accounts, follows and posts are not shared between phones.**
Passwords use a non-cryptographic hash — acceptable only because the data never
leaves the device.

The UI talks to `src/lib/backend.ts` exclusively (a repository-style API:
`signUp`, `signIn`, `follow`, `unfollow`, `createPost`, `getFeed`, ...). To move
to a real backend (e.g. Supabase): implement the same functions against the
remote API, keep the signatures, and the screens do not change. Post images are
stored as base64 data URIs — fine for a demo, but AsyncStorage will cap out
after a few dozen photos; a real backend should upload to object storage
(Supabase Storage / S3) and store URLs instead.

### TypeScript

- `strict: true` (all strict flags, including `noImplicitAny` and
  `strictNullChecks`).
- Path alias: `@/*` maps to `src/*` (configured in `tsconfig.json`; Expo's
  Metro/Babel toolchain resolves it automatically, no extra packages needed).

```typescript
import { colors } from '@/theme';
import HomeScreen from '@/screens/HomeScreen';
```

### Path aliases and commands

```bash
npx expo install <pkg>   # ALWAYS use instead of npm/yarn/pnpm add — resolves SDK-compatible versions
npm run typecheck        # tsc --noEmit
npm run lint            # ESLint with eslint-config-expo (flat config)
npm run doctor           # expo-doctor
npx expo export --platform android   # headless bundle check without a device
```

## Development Environment

### VS Code

Open the repo root in VS Code. On first open it will offer to install the
recommended extensions from `.vscode/extensions.json`:

- **Expo Tools** — schema/validation for `app.json`, previews for icons/splash.
- **ESLint / Prettier / EditorConfig** — lint and consistent formatting.

`F5` (Run and Debug) starts the Expo dev server via `.vscode/launch.json`.

### Android (emulator or device builds)

Needed only if you want to run a development build with native code, or use an
emulator:

1. Install [Android Studio](https://developer.android.com/studio) with the
   default components (SDK, emulator).
2. Set environment variables in `~/.bashrc` / `~/.zshrc`:

   ```bash
   export ANDROID_HOME=$HOME/Android/Sdk
   export PATH=$PATH:$ANDROID_HOME/platform-tools
   ```

3. JDK 17 or newer is required for Gradle builds.
4. Create an AVD via Android Studio (Device Manager) or use a physical device
   with USB debugging enabled.
5. Run `npx expo run:android` from the project root — this generates the
   `android/` folder, builds, and installs the app.

For pure JS development, none of this is needed: `npm start` + the Expo Go app
on your phone is enough.

### iOS

iOS builds require macOS with Xcode:

- On a Mac: `npx expo run:ios` (simulator) — CocoaPods is installed
  automatically on first run.
- From this Linux machine: use cloud builds with EAS
  (`npx eas-cli@latest build --platform ios`), or test on a physical iPhone via
  the Expo Go app (press `s` in the `npm start` terminal to switch, or just scan
  the QR code with the iPhone camera). Note: Expo Go for iOS requires signing in
  with an Apple developer account if installed outside the App Store.

### Release Builds

- Android/iOS app-store builds: `npx eas-cli@latest build --platform all`
  (requires a free Expo account; produces signed APK/AAB and IPA).
- Over-the-air updates (JS-only changes): `eas update`.

### Environment Variables

- Never commit `.env` files (already git-ignored).
- Use `app.config.ts` or EAS secrets for build-time configuration.

## Version Compatibility Notes

- Expo SDK 58 / React Native 0.88 / React 19.3 / TypeScript 6.
- Adding third-party React Native libraries: check compatibility on
  [reactnative.directory](https://reactnative.directory) and install with
  `npx expo install` so versions match the SDK.
- Keep the project healthy: run `npm run doctor` after adding dependencies.
