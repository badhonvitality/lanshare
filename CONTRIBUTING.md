# Contributing to LAN Screen Share

First off, thank you for considering contributing to **LAN Screen Share**! It's people like you that make the open source community such an amazing place to learn, inspire, and create.

## How Can I Contribute?

### Reporting Bugs
If you find a bug, please create a GitHub Issue and include:
- Your operating system and browser.
- Steps to reproduce the bug.
- Expected vs actual behavior.
- Any relevant terminal logs or browser console errors.

### Suggesting Enhancements
If you have an idea for a new feature or improvement:
- Create an Issue labeled `enhancement`.
- Describe how it would work and why it would be beneficial.

### Pull Requests
We welcome Pull Requests! Here is the process:
1. **Fork** the repository.
2. **Clone** it to your local machine.
3. Create a new branch: `git checkout -b feature/your-feature-name`
4. Make your changes and commit them: `git commit -m "feat: add new awesome feature"`
5. Push to the branch: `git push origin feature/your-feature-name`
6. Submit a **Pull Request**.

## Local Development Setup

To run the project locally and test your changes:

1. **Prerequisites:** Install [Bun](https://bun.sh/) and Node.js.
2. **Install Dependencies:**
   ```bash
   bun install
   ```
3. **Run the Development Server:**
   ```bash
   bun run server.ts
   ```
   *Note: On Windows, you can also double click `start.bat`.*
4. The server will run on port `443` (HTTPS) by default. You can access it at `https://localhost` or `https://lanshare.local`.

## Development Guidelines
- **Strict Mode Compatibility:** Be aware that Next.js React Strict Mode will double-mount components. Ensure your `useEffect` hooks clean up properly (especially for WebRTC connections and Socket.io listeners).
- **WebRTC:** If modifying the video streaming, ensure changes do not break mobile browser autoplay restrictions (e.g., keep the `muted` attribute on the mobile video tag).
- **Styling:** We use Tailwind CSS. Please adhere to the existing minimalist and modern UI design language.

## Code of Conduct
Please note that this project is released with a [Contributor Code of Conduct](./CODE_OF_CONDUCT.md). By participating in this project you agree to abide by its terms.

Thank you! 🚀
