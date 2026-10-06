# LAN Screen Share - GitHub Copilot Instructions

Whenever you generate code for this repository, please adhere to the following enterprise rules:

1. **Strict TypeScript**: Do not use `any`. Always define proper interfaces for Zustand stores and Socket.io events.
2. **WebRTC Priority**: Remember that video streams must never touch the signaling server. They go directly peer-to-peer.
3. **Local Network Context**: The app is designed for local LANs. Features requiring external internet APIs should be avoided to maintain the privacy-first approach.
4. **Code Quality**: Ensure the code passes ESLint without using `@ts-ignore` or uncommented `@ts-expect-error`.
