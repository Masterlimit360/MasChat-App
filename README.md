# MasChat Monorepo

Full‑stack social platform consisting of a React Native (Expo) mobile app and a Spring Boot backend with PostgreSQL, WebSockets, JWT auth, marketplace, messaging, stories/reels, notifications, and an in‑app token economy (MassCoin) with **Web3 blockchain integration**.

## Contents
- Mobile app (Expo/React Native): `MasChat-main/`
- Backend (Spring Boot/PostgreSQL): `MasChat-B-/`

---

## Architecture Overview

- Mobile (Expo, React Native 0.79, Expo Router)
  - File‑based routing in `MasChat-main/app/`
  - Axios API client with JWT interceptor in `MasChat-main/app/api/client.ts`
  - STOMP over WebSocket for realtime chat/notifications
  - Firebase (notifications), image/video capture, local media, theming
  - **Web3 Integration**: MassCoin cryptocurrency, blockchain wallet, smart contracts

- Backend (Spring Boot 3.5, Java 17)
  - REST APIs, WebSockets (`/ws-chat`), JWT auth, Flyway migrations
  - PostgreSQL database, JPA/Hibernate
  - Controllers in `MasChat-B-/src/main/java/.../controller`
  - Static uploads served from `uploads/`
  - **Blockchain Services**: MassCoin management, transaction tracking

---

## Key Features

- Authentication: signup, login, password reset, JWT auth
- Social: posts, comments, likes, stories, reels, memories, feeds
- Messaging: 1:1 and group chat, realtime via WebSockets
- Friends: requests, suggestions, lists, profiles
- Notifications: in‑app banners, push integration
- Marketplace: items, orders, reviews, saved searches, business accounts
- **MassCoin (Web3)**: ERC-20 token, balance, send/tip, staking, transactions, transfer requests, blockchain integration
- Settings: privacy, security, notification, accessibility, content prefs
- AI Chat: assistant via backend `AIChatController`

---

## Web3 & Blockchain Features

### **MassCoin Cryptocurrency**
- **ERC-20 Token**: Built on Polygon network with smart contracts
- **Token Economics**: 1 billion total supply, staking rewards (5-15% APY)
- **Smart Contracts**: MassCoin token and staking contracts (Solidity)
- **Wallet Integration**: MetaMask, WalletConnect, and custom wallet support
- **Cross-Platform**: Works on mobile, web, and desktop

### **Blockchain Functionality**
- **Real-time Transactions**: Instant MassCoin transfers between users
- **Staking System**: Lock tokens for rewards and passive income
- **Transaction History**: Complete on-chain transaction tracking
- **Gas Optimization**: Efficient Polygon network transactions
- **Smart Contract Integration**: Automated token distribution and management

### **Development Status**
- ✅ **Smart Contracts**: Compiled and ready for deployment
- ✅ **Web3 Services**: Full blockchain integration layer
- ✅ **Mock System**: Functional with simulated blockchain data
- ✅ **UI Components**: Complete MassCoin interface
- ⏳ **Network Deployment**: Ready for Polygon Amoy testnet or mainnet

---

## Prerequisites

- Node.js 18+ and npm
- Java 17 (JDK)
- Maven (or use Maven wrapper)
- PostgreSQL 14+
- Android Studio (emulator) and/or Xcode (simulator), or a physical device
- **For Web3**: MetaMask wallet, Polygon network access

---

## Quick Start (Local Development)

1) Start the backend (first)

```bash
cd MasChat-B-
# Option A: automated helpers (Windows)
./setup-local-db.ps1   # or: setup-local-db.bat
./start-local.ps1      # or: start-local.bat

# Option B: manual
./mvnw spring-boot:run
```

Defaults (override as needed) live in `MasChat-B-/src/main/resources/application.properties`:
- Port: `8080`
- DB: `jdbc:postgresql://localhost:5432/MasChatDB`
- User/Password: `postgres` / (set yours) — update file if different
- JWT secret/expiration
- Static uploads at `uploads/`

2) Point the mobile app to your backend IP

The source of truth for the API base URL is `MasChat-main/app/api/client.ts`.

```ts
// Example
export const API_CONFIG = {
  BASE_URL: `http://<YOUR_LOCAL_IP>:8080/api`,
  WS_URL: `http://<YOUR_LOCAL_IP>:8080/ws-chat`,
  UPLOAD_URL: `http://<YOUR_LOCAL_IP>:8080/uploads`,
}
```

Notes:
- Ensure your phone/emulator can reach your machine over LAN (same Wi‑Fi).
- `MasChat-main/app.json` also contains `extra.API_URL`; however `config.ts` imports from `app/api/client.ts`. Keep them consistent.
- Docs: see `MasChat-main/IP_CONFIGURATION.md` and `MasChat-main/IP_UPDATE_SUMMARY.md`. Utilities: `MasChat-main/update-ip.bat`, `MasChat-main/get-current-ip.js`, `MasChat-main/update-ip.js`.

3) Start the mobile app

```bash
cd MasChat-main
npm install
npm run start        # expo start
# or
npm run android      # emulator/device
npm run ios          # simulator
```

Open the Expo Developer Tools and launch on your device/emulator.

---

## Blockchain Setup

### **Network Configuration**
- **Polygon Amoy (Testnet)**: Chain ID 80002, RPC: `https://rpc-amoy.polygon.technology`
- **Polygon Mainnet**: Chain ID 137, RPC: `https://polygon-rpc.com`

### **Smart Contract Deployment**
```bash
cd MasChat-main

# Compile contracts
npm run compile

# Deploy to testnet
npm run deploy:amoy

# Deploy to mainnet
npm run deploy:polygon
```

### **Enable Blockchain Features**
After deployment, update contract addresses in:
- `app/lib/services/web3Service.ts` - Update `CONTRACT_ADDRESSES`
- `app/lib/services/massCoinService.ts` - Update any hardcoded addresses

Then enable blockchain functionality:
```typescript
// Programmatically
massCoinService.enableBlockchain();
web3Service.enableBlockchain();

// Or via UI using BlockchainStatus component
```

### **Environment Variables**
Create `.env` file with:
```env
# For Amoy testnet
AMOY_RPC_URL=https://rpc-amoy.polygon.technology
PRIVATE_KEY=your_private_key_here

# For Polygon mainnet
POLYGON_RPC_URL=https://polygon-rpc.com
POLYGONSCAN_API_KEY=your_polygonscan_api_key
```

---

## Project Structure (high‑level)

```
MasChat-main/
  app/                 # screens and file-based routes
    (auth)/            # login/signup/reset
    (create)/          # new post/reel/story/message
    (tabs)/            # home, videos, marketplace, notifications, profile, menu
    api/client.ts      # axios client (JWT interceptor), base URLs, WS URLs
    context/           # Auth, Theme, Notification, Web3 contexts
    friends/, marketplace/, screens/  # features
    lib/services/      # API and Web3 services (massCoinService, web3Service)
  components/          # UI components (AI chat modal, MassCoin, headers, etc.)
  contracts/           # Smart contracts (MassCoin.sol, MassCoinStaking.sol)
  assets/              # images, fonts, sounds
  config.ts            # imports API URL from api/client
  app.json             # Expo config (also includes extra.API_URL)

MasChat-B-/
  src/main/java/com/postgresql/MasChat/
    controller/        # REST controllers (Auth, User, Post, Reel, Chat, etc.)
    service/, repository/, model/      # domain logic & persistence
    config/            # security, websocket, jackson, app config
  src/main/resources/  # application.properties, Flyway migrations
  uploads/             # local file storage for uploads
```

---

## Backend Details

- Base URL: `http://<host>:8080/api`
- WebSocket endpoint: `ws-chat` (STOMP)
- Health checks: `/actuator/health`, app health `/api/health`
- Controllers overview (see `MasChat-B-/src/main/java/.../controller`):
  - `AuthController`: login, register, token flows
  - `UserController`, `UserSettingsController`
  - `PostController`, `StoryController`, `ReelController`, `MemoriesController`
  - `MessageController`, `ChatController`, `GroupController`
  - `FriendController`, `NotificationController`
  - `MarketplaceController`, `MarketplaceReviewController`, `MarketplaceSavedSearchController`, `MarketplaceBusinessAccountController`
  - `MassCoinController`: **Web3 token management and transactions**
  - `AIChatController`, `DashboardController`, `HealthController`, `RootController`

Database & migrations:
- Flyway enabled; initial schema in `src/main/resources/db/migration`
- JPA `ddl-auto=update` for local/dev

Security:
- Spring Security + JWT; passwords hashed (BCrypt)
- CORS configured for mobile dev

Static uploads:
- Served from `uploads/` via Spring static resources

---

## Mobile App Details

- Expo Router, typed routes, theming, animations
- Auth flow stored in `AsyncStorage` (`userToken`), auto‑attached via axios interceptor
- Realtime via STOMP client (`@stomp/stompjs` + `sockjs-client`)
- Media: camera, image picker, video, image manipulation
- Push notifications (Expo/Firebase wiring), banners
- **MassCoin UI**: balance display, send/tip buttons, staking interface, transfer requests
- **Web3 Integration**: wallet connection, blockchain status, transaction history
- Error boundaries and modern UI components

Scripts:
- `npm run start` / `android` / `ios` / `web`
- `npm run reset-project` (bootstraps a blank `app/`)
- **Blockchain**: `npm run compile`, `npm run deploy:amoy`, `npm run deploy:polygon`
- Windows helper: `start-expo.bat`

---

## Configuration

Backend (`MasChat-B-/src/main/resources/application.properties`):
- `server.port=8080`
- `spring.datasource.url=jdbc:postgresql://localhost:5432/MasChatDB`
- `spring.datasource.username=postgres`
- `spring.datasource.password=<your password>`
- `jwt.secret` / `jwt.expiration`
- `spring.web.resources.static-locations` (includes `uploads/`)

Mobile:
- Primary: `MasChat-main/app/api/client.ts` (BASE_URL, WS_URL, UPLOAD_URL)
- Keep `MasChat-main/app.json` → `extra.API_URL` consistent if used elsewhere
- `MasChat-main/config.ts` simply re‑exports BASE_URL from `client.ts`
- **Web3**: `MasChat-main/app/lib/services/web3Service.ts` (network config, contract addresses)

IP addressing tips:
- Use your machine's LAN IP (e.g. `192.168.x.y`) so a device on the same network can reach the backend
- See `MasChat-main/IP_CONFIGURATION.md` & `MasChat-main/IP_UPDATE_SUMMARY.md`

---

## Build & Run (Production)

Backend JAR:
```bash
cd MasChat-B-
./mvnw -DskipTests clean package
java -jar target/MasChat-0.0.1-SNAPSHOT.jar
```

Backend Docker (example):
```bash
cd MasChat-B-
docker build -t maschat-backend:local .
docker run -p 8080:8080 \
  -e SPRING_DATASOURCE_URL="jdbc:postgresql://host.docker.internal:5432/MasChatDB" \
  -e SPRING_DATASOURCE_USERNAME=postgres \
  -e SPRING_DATASOURCE_PASSWORD=******** \
  -e JWT_SECRET=change-me \
  maschat-backend:local
```

Mobile builds (EAS):
```bash
cd MasChat-main
npx eas-cli build -p android   # requires Expo account and EAS setup
npx eas-cli build -p ios
```

**Smart Contract Deployment (Production)**:
```bash
cd MasChat-main
npm run compile
npm run deploy:polygon
# Update contract addresses in services
# Enable blockchain functionality
```

---

## Troubleshooting

- Mobile cannot reach backend
  - Ensure backend is running on your LAN IP and port 8080
  - Update `MasChat-main/app/api/client.ts` with the correct IP
  - Verify device and dev machine are on the same Wi‑Fi; disable VPNs or firewalls as needed

- DB connection failures
  - Confirm PostgreSQL is running and credentials match `application.properties`
  - Create DB `MasChatDB` (use `MasChat-B-/setup-local-db.*` scripts)

- Port already in use
  - Change `server.port` or stop the conflicting service

- Auth 401s on API calls
  - Token expired; the interceptor clears storage on 401. Re‑login.

- Media upload/view issues
  - Check `uploads/` folder permissions and URL base in `client.ts`

- **Blockchain/Web3 Issues**
  - Ensure correct network configuration in `web3Service.ts`
  - Verify contract addresses are updated after deployment
  - Check RPC URL accessibility and network connectivity
  - Use `BlockchainStatus` component to verify blockchain state

---

## Useful Scripts & Docs

- Backend helpers: `MasChat-B-/setup-local-db.*`, `MasChat-B-/start-local.*`
- Mobile helpers: `MasChat-main/start-expo.bat`, `MasChat-main/update-ip.bat`
- **Blockchain helpers**: `MasChat-main/fix-metro.bat`, `MasChat-main/hackathon-start.bat`
- Cloud/media docs: `MasChat-main/CLOUDINARY_SETUP.md`, `MasChat-main/UPLOAD_FIX.md`
- Video notes: `MasChat-main/COMPREHENSIVE_VIDEO_AND_LIKE_FIXES.md`
- **Blockchain setup**: `MasChat-main/BLOCKCHAIN_SETUP.md`

---

## API Surface (at a glance)

Base path: `/api`

Selected areas (see controllers for details):
- `/auth/*`, `/users/*`, `/posts/*`, `/stories/*`, `/reels/*`, `/messages/*`, `/friends/*`
- `/notifications/*`, `/marketplace/*`, `/masscoin/*` (**Web3 token endpoints**), `/ai-chat/*`
- Health: `/health` and `/actuator/health`

---

## License

Proprietary – internal project. Do not distribute without permission.


