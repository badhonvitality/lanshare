<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# LAN Screen Share - Agent Context

**This section is intended for AI coding assistants working on this repository.**

## Project Overview
This project is a high-performance local network screen sharing application that allows a Windows PC host to stream its screen to a mobile phone on the same Wi-Fi network, directly over the LAN via WebRTC without external internet servers.

## Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Signaling**: Custom Node.js HTTP server running Socket.io
- **Streaming**: Native WebRTC (`RTCPeerConnection`)
- **Package Manager**: Bun

## Core Architecture
- **HTTPS & SSL**: The server MUST run on HTTPS for mobile browsers to allow `getUserMedia()` (QR scanner access) and modern WebRTC. We dynamically generate a self-signed certificate in-memory via `selfsigned` in `server.ts`.
- **mDNS (Zero-config)**: We run a multicast-dns server in `server.ts` that advertises `lanshare.local`. 
- **Signaling Server**: `server.ts` uses Socket.io to relay SDP offers, answers, and ICE candidates between the Host and Viewers.
- **Strict Mode Considerations**: Next.js React Strict Mode triggers double-mounts. Our custom WebRTC hooks (`useWebRTCHost.ts`, `useWebRTCViewer.ts`) use ICE candidate queues and `isProcessingOffer` guards to prevent WebRTC state machine crashes during HMR.

## Key Files
- `server.ts`: The custom Next.js server that binds to port 443, generates SSL certs, handles mDNS, and runs Socket.io signaling.
- `src/app/host/page.tsx`: The UI for the Host. Captures the screen via `getDisplayMedia` and generates a QR code for the view link.
- `src/app/connect/page.tsx`: The Mobile UI with a built-in QR Code scanner (using `html5-qrcode`).
- `src/app/view/[roomId]/ViewerClient.tsx`: The Viewer UI where the stream is received. Forces a landscape orientation using CSS rotations (`-rotate-90`). Includes a `muted` attribute on the `<video>` element, which is strict requirement for Mobile Autoplay policies.

## Development Rules
- **Do NOT remove the self-signed SSL implementation**. Mobile browsers require it.
- **Do NOT mutate ICE candidates without checking signaling state**. Use the implemented candidate queue.
- **Do NOT use placeholders**. Use real WebRTC APIs.
- When starting the dev server, recommend using `start.bat` or `bun dev` (which runs `bun run server.ts`).
