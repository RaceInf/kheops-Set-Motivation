-- Migration: Ajout des champs customer_name et whatsapp_number à la table orders
-- Ces champs sont utilisés dans le checkout, les relances marketing et le dashboard admin.
-- À exécuter dans Supabase SQL Editor si ce n'est pas déjà fait.

ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS customer_name TEXT,
  ADD COLUMN IF NOT EXISTS whatsapp_number TEXT;
