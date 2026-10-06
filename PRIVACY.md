# Privacy Policy

**Effective Date:** 2026-10-06

## 1. Zero Cloud Data Collection
**LAN Screen Share** is a purely local network application. 
- We **do not** collect, store, or transmit your data to any external cloud servers.
- We **do not** use analytics, tracking pixels, or telemetry to monitor your usage.

## 2. Screen & Camera Access
This application requests access to your devices for core functionality:
- **Screen Recording (Host):** Requested on your PC to capture your screen, application windows, or browser tabs. 
- **Camera Access (Mobile):** Requested on your mobile device solely for scanning the QR code to join the screen share room.

**How this data is used:**
The captured screen data is transmitted *directly* from your PC to your mobile device over your local Wi-Fi network (LAN) using WebRTC (Peer-to-Peer). At no point does your video feed, camera feed, or QR code data touch the public internet, nor is it saved to any disk. Once you close the browser tab, the video stream is immediately destroyed.

## 3. WebRTC & Local Network (mDNS)
The app uses WebRTC and a local signaling server (`Socket.io`) running on your own PC. It broadcasts its presence on your local network using mDNS (e.g., `lanshare.local`) so your devices can find each other. This broadcast is limited to your router's local subnet.

## 4. Third-Party Services
This application is entirely self-hosted. There are no third-party APIs involved in the core screen-sharing or signaling process.

## 5. Contact
If you have any questions or concerns about how this application handles your privacy, please reach out via Discord:
- **@badhonvitality**
