-- ============================================================
-- Risk-Flux — Add phone field to profiles
-- Run this in the Supabase SQL Editor after 002_seed_posts.sql
-- ============================================================

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS location TEXT;
