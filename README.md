# 🇷🇼 Kigali Traffic Spotter & Route Recommender

> A real-time, community-powered traffic spotter and alternative bypass route recommender tailored for Kigali's topography, chokepoints, and arterial road networks.

Built completely on **100% Free-Tier Infrastructure** (Zero API costs, zero credit card required).

---

## 🌟 Key Features

1. **Kigali Chokepoint Live Radar & Dynamic Calculation**:
   - Real-time status dynamically computed from live community reports for critical arterial corridors: **Nyabugogo Valley**, **Sonatubes Roundabout**, **Gishushu / RDB**, **Kimicanga / KCC**, **Remera / Prince House**, and **Kinamba / Poids Lourds**.
   - Live incident counters, dynamic delay minute estimates, and estimated average speeds.
2. **Arterial Traffic Flow Corridors Layer**:
   - Visual glowing traffic polylines rendered along Kigali's primary arteries (**KN 1 Rd**, **KN 3 Rd**, **KG 2 Roundabout**, **KG 11 Ave**, **Poids Lourds**, and **KG 7 Ave**).
   - Dynamically color-coded: Green (Free Flow 45-50 km/h), Amber (Slow Crawl 15-20 km/h), Red (Standstill Gridlock <10 km/h), and Purple (Road Closed).
   - One-tap toggle button in the map controls to hide/show the live flow layer.
3. **Live Drive Mode & Speedometer HUD**:
   - Real-time velocity tracker (`km/h`) and cruise vs. crawl indicator while driving or riding.
   - **Proactive Gridlock Spotter**: Automatically detects when a commuter is crawling (<12 km/h) near a known chokepoint and prompts with a 1-tap prefilled traffic spotter action.
4. **Voice & Audio Traffic Radar Alerts**:
   - Synthesized voice announcements and chime alerts when approaching an active incident within 400m, with instant mute/unmute toggle.
5. **Intelligent Dynamic Routing & Jam Avoidance**:
   - Compares primary valley routes with hillside bypass corridors.
   - Live traffic jam penalty calculation avoids active gridlocks, police checkpoints, road closures, and mud runoff hazards.
   - **Mode-Specific Routing**:
     - 🚗 **Car Mode**: Penalizes bottleneck delays fully; prioritizes smooth asphalt corridors.
     - 🏍️ **Moto Mode**: Reflects Kigali motorcycle dynamics (filtering through queues with 75% reduced jam delays, higher transit speeds, and cobblestone *amapave* hillside shortcuts).
6. **Crowdsourced Traffic Spotting (Waze-Inspired)**:
   - One-tap incident reporting: Embouteillage (Standstill Gridlock), Traffic Police & Document Control, Road Closures / Diversions, Accidents, and Valley Mud / Runoff Hazards.
   - Community verification voting ("Still There" vs "Cleared").
   - Detailed road surface flags (*Asphalt*, *Cobblestone / Amapave*, *Dirt*).
7. **Live GPS Locate Me & Continuous Follow Mode**:
   - One-tap centering on device GPS location with pulsing beacon and continuous tracking.
8. **Light & Dark Theme Engine**:
   - Fully supported across maps, bottom drawer route planner, spotting modal, and incident cards with persistent user preference.
9. **100% Free-Tier Cloud Architecture**:
   - **Maps**: Leaflet with Esri World Street Map, OSM Humanitarian (HOT), and Standard OpenStreetMap.
   - **Routing Engine**: OSRM (Open Source Routing Machine) public service with bezier-curve local fallback.
   - **Backend & Cloud Database**: Supabase (PostgreSQL with PostGIS extensions) + Realtime WebSockets for instant cross-device updates.

---

## 🏗️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite 8, Tailwind CSS v4
- **Mapping**: Leaflet, React-Leaflet, Esri World Street Map, OSM
- **Icons**: Lucide React + Custom "Radar Beacon" vector SVG brand icon & favicon
- **Routing**: Public OSRM API + Custom topological bypass heuristic
- **Backend & Realtime Sync**: Supabase PostGIS + WebSocket subscriptions
- **Local Fallback**: Browser `localStorage` cache for instant offline startup

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- npm or yarn

### Installation
```bash
# Clone the repository
git clone https://github.com/nshh123/kigali-traffic-spotter.git
cd kigali-traffic-spotter

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### Running Locally
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Production Build
```bash
npm run build
```

---

## 🗄️ Supabase Cloud Synchronization (PostGIS)

The application works out-of-the-box in local-first mode. To activate multi-user live synchronization across devices:

1. Create a free project at [supabase.com](https://supabase.com).
2. Open the **SQL Editor** in your Supabase dashboard and run the migration script in [`supabase_schema.sql`](./supabase_schema.sql).
3. Populate your `.env` with your project credentials:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-publishable-or-anon-key-here
   ```
4. Restart the development server. All traffic reports will now synchronize in real time via WebSockets across all connected commuters.

---

## 📱 Mobile Roadmap (Flutter / Dart)

A companion Flutter mobile app can connect directly to the same backend:
- Direct reuse of the Supabase PostgreSQL database via `supabase_flutter`.
- Native mapping using `flutter_map` with the same tile endpoints.
- Same OSRM routing and PostGIS proximity queries.

---

## 📄 License
MIT License. Free to use, adapt, and build upon for the Kigali commuting community.
