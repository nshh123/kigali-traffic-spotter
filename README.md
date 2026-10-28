# 🇷🇼 Kigali Traffic Spotter & Route Recommender

> A real-time, community-powered traffic spotter and alternative bypass route recommender tailored for Kigali's topography, chokepoints, and arterial road networks.

Built completely on **100% Free-Tier Infrastructure** (Zero API costs, zero credit card required).

---

## 🌟 Key Features

1. **Kigali Chokepoint Live Radar**:
   - Real-time status for critical arterial corridors: **Nyabugogo Valley**, **Sonatubes Roundabout**, **Gishushu / RDB**, **Kimicanga / KCC**, **Remera / Prince House**, and **Kinamba / Poids Lourds**.
2. **Intelligent Dynamic Routing & Jam Avoidance**:
   - Compares primary valley routes with hillside bypass corridors.
   - Live traffic jam penalty calculation avoids active gridlocks, police checkpoints, road closures, and mud runoff hazards.
   - **Mode-Specific Routing**:
     - 🚗 **Car Mode**: Penalizes bottleneck delays fully; prioritizes smooth asphalt corridors.
     - 🏍️ **Moto Mode**: Reflects Kigali motorcycle dynamics (filtering through queues with 75% reduced jam delays, higher transit speeds, and cobblestone *amapave* hillside shortcuts).
3. **Crowdsourced Traffic Spotting (Waze-Inspired)**:
   - One-tap incident reporting: Embouteillage (Standstill Gridlock), Traffic Police & Document Control, Road Closures / Diversions, Accidents, and Valley Mud / Runoff Hazards.
   - Community verification voting ("Still There" vs "Cleared").
   - Detailed road surface flags (*Asphalt*, *Cobblestone / Amapave*, *Dirt*).
4. **Live GPS Locate Me & Follow Mode**:
   - One-tap centering on device GPS location with pulsing beacon and continuous tracking.
5. **Light & Dark Theme Engine**:
   - Fully supported across maps, bottom drawer route planner, spotting modal, and incident cards with persistent user preference.
6. **100% Free-Tier Cloud Architecture**:
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
