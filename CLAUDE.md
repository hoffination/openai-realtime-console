# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is an example application demonstrating the OpenAI Realtime API with WebRTC. It enables real-time voice conversations with OpenAI's GPT models using browser microphone input and audio output.

## Commands

- `npm run dev` - Start development server with hot reload (runs on port 3000)
- `npm run build` - Build both client and server for production
- `npm run lint` - Run ESLint with auto-fix on .js and .jsx files

## Architecture

### Server (server.js)
Express server that:
- Serves the React frontend via Vite middleware (SSR-enabled)
- Provides `/token` endpoint to generate ephemeral OpenAI API keys for client-side WebRTC connections
- Provides `/session` endpoint for experimental all-in-one SDP exchange

### Client (client/)
React 18 application using Vite with SSR support:

- **entry-client.jsx / entry-server.jsx** - SSR hydration entry points
- **components/App.jsx** - Main component managing WebRTC connection lifecycle
  - Handles peer connection setup, audio tracks, and data channel
  - Uses `/token` endpoint for ephemeral keys, then connects directly to OpenAI's Realtime API
- **components/EventLog.jsx** - Displays Realtime API events (with delta event deduplication)
- **components/SessionControls.jsx** - Start/stop session and send text messages
- **components/ToolPanel.jsx** - Example of client-side function calling (color palette tool)

### WebRTC Flow
1. Client fetches ephemeral token from `/token`
2. Creates RTCPeerConnection with audio track from getUserMedia
3. Creates data channel "oai-events" for Realtime API events
4. Exchanges SDP offer/answer with OpenAI's `/v1/realtime/calls` endpoint
5. All Realtime API events flow through the data channel as JSON

### Configuration
- Requires `OPENAI_API_KEY` in `.env` file
- Vite config roots from `client/` directory
- Uses Tailwind CSS for styling
