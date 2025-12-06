-- Create tables for MMI ART 26 registration form

-- Artists table
CREATE TABLE IF NOT EXISTS artists (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  mmi_year VARCHAR(50) NOT NULL,
  age INT NOT NULL,
  email VARCHAR(255) NOT NULL,
  avatar_url VARCHAR(500),
  bio TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Social links table
CREATE TABLE IF NOT EXISTS social_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  platform VARCHAR(50) NOT NULL,
  link VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Works table
CREATE TABLE IF NOT EXISTS works (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id UUID REFERENCES artists(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  year INT NOT NULL,
  category VARCHAR(100) NOT NULL,
  technique TEXT,
  description TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Work images table
CREATE TABLE IF NOT EXISTS work_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_id UUID REFERENCES works(id) ON DELETE CASCADE,
  image_url VARCHAR(500) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create storage bucket for uploads
-- Run this in Supabase SQL Editor:
-- INSERT INTO storage.buckets (id, name, public) VALUES ('mmiart26-uploads', 'mmiart26-uploads', true);

-- Create storage policy for uploads
-- CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'mmiart26-uploads');
-- CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'mmiart26-uploads');
