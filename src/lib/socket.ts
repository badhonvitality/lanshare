import { io } from "socket.io-client";

// Connect to the same host that serves the page
export const socket = io(typeof window !== "undefined" ? window.location.origin : "", {
  autoConnect: false,
});
