/* eslint-disable @typescript-eslint/no-namespace */
// lib/socket.js
import { io } from "socket.io-client";
// const URL =  "http://localhost:5000";
// const URL =  "http://192.168.108.218:5000";


const URL = import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

// Persistent socket connection
export const socket = io(URL, {
  autoConnect: false, // connect manually when needed
});
