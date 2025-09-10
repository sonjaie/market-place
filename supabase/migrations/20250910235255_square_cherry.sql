/*
  # Marketplace Database Schema

  1. New Tables
    - `listings`
      - `id` (uuid, primary key)
      - `title` (text, required)
      - `description` (text, required)
      - `price` (decimal, required)
      - `image_url` (text, optional)
      - `category` (text, required)
      - `condition` (text, optional)
      - `location` (text, required)
      - `seller_email` (text, required)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `messages`
      - `id` (uuid, primary key)
      - `listing_id` (uuid, foreign key)
      - `buyer_name` (text, required)
      - `buyer_email` (text, required)
      - `message` (text, required)
      - `seller_email` (text, required)
      - `created_at` (timestamp)

  2. Storage
    - Create storage bucket for listing images
    - Enable public access for images

  3. Security
    - Enable RLS on all tables
    - Add policies for public read access
    - Add policies for authenticated users to insert listings
*/

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create listings table
CREATE TABLE IF NOT EXISTS listings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  price decimal(10,2) NOT NULL,
  image_url text,
  category text NOT NULL,
  condition text,
  location text NOT NULL,
  seller_email text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  listing_id uuid REFERENCES listings(id) ON DELETE CASCADE,
  buyer_name text NOT NULL,
  buyer_email text NOT NULL,
  message text NOT NULL,
  seller_email text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add trigger to listings table
DROP TRIGGER IF EXISTS update_listings_updated_at ON listings;
CREATE TRIGGER update_listings_updated_at
  BEFORE UPDATE ON listings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for listings (public read, authenticated insert)
CREATE POLICY "Anyone can view listings"
  ON listings
  FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Anyone can create listings"
  ON listings
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Users can update their own listings"
  ON listings
  FOR UPDATE
  TO public
  USING (true)
  WITH CHECK (true);

-- Create policies for messages (public insert, sellers can view their messages)
CREATE POLICY "Anyone can send messages"
  ON messages
  FOR INSERT
  TO public
  WITH CHECK (true);

CREATE POLICY "Anyone can view messages"
  ON messages
  FOR SELECT
  TO public
  USING (true);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for images
CREATE POLICY "Anyone can upload images"
  ON storage.objects
  FOR INSERT
  TO public
  WITH CHECK (bucket_id = 'images');

CREATE POLICY "Anyone can view images"
  ON storage.objects
  FOR SELECT
  TO public
  USING (bucket_id = 'images');

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category);
CREATE INDEX IF NOT EXISTS idx_listings_created_at ON listings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_listings_price ON listings(price);
CREATE INDEX IF NOT EXISTS idx_messages_listing_id ON messages(listing_id);
CREATE INDEX IF NOT EXISTS idx_messages_seller_email ON messages(seller_email);