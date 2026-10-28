-- ========================================================
-- Kigali Traffic Spotter: PostGIS & Realtime Supabase Schema
-- 100% Free Tier Compatible
-- Run this in your Supabase SQL Editor (supabase.com)
-- ========================================================

-- 1. Enable PostGIS for geospatial distance & spatial queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Create the incidents table
CREATE TABLE IF NOT EXISTS public.traffic_incidents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL CHECK (type IN ('gridlock', 'police', 'closure', 'accident', 'hazard')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'moderate', 'severe', 'blocked')),
    title TEXT NOT NULL,
    description TEXT,
    location_name TEXT NOT NULL,
    geom GEOMETRY(Point, 4326) NOT NULL,
    lat DOUBLE PRECISION NOT NULL,
    lng DOUBLE PRECISION NOT NULL,
    reported_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    confirmations INTEGER DEFAULT 1 NOT NULL,
    cleared_votes INTEGER DEFAULT 0 NOT NULL,
    road_type TEXT DEFAULT 'asphalt' CHECK (road_type IN ('asphalt', 'amapave', 'dirt'))
);

-- 3. Create spatial index for lightning-fast bounding box & radius lookups
CREATE INDEX IF NOT EXISTS idx_traffic_incidents_geom ON public.traffic_incidents USING GIST (geom);
CREATE INDEX IF NOT EXISTS idx_traffic_incidents_reported_at ON public.traffic_incidents (reported_at DESC);

-- 4. Enable Row Level Security (RLS) & allow anonymous public read & write for crowdsourcing
ALTER TABLE public.traffic_incidents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access"
    ON public.traffic_incidents
    FOR SELECT
    TO anon, authenticated
    USING (true);

CREATE POLICY "Allow public insert"
    ON public.traffic_incidents
    FOR INSERT
    TO anon, authenticated
    WITH CHECK (true);

CREATE POLICY "Allow public update for voting"
    ON public.traffic_incidents
    FOR UPDATE
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- 5. Enable Realtime publication so clients get live updates on new incidents!
ALTER PUBLICATION supabase_realtime ADD TABLE public.traffic_incidents;
