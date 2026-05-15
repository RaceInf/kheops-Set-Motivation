-- ============================================
-- TABLE: email_events
-- Tracking marketing email professionnel
-- ============================================

CREATE TABLE IF NOT EXISTS email_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  event_type TEXT NOT NULL,
  message_id TEXT,
  order_id TEXT,
  campaign_tag TEXT,
  reason TEXT,
  link_url TEXT,
  subject TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index pour les requêtes fréquentes
CREATE INDEX idx_email_events_email ON email_events(email);
CREATE INDEX idx_email_events_event_type ON email_events(event_type);
CREATE INDEX idx_email_events_order_id ON email_events(order_id);
CREATE INDEX idx_email_events_message_id ON email_events(message_id);
CREATE INDEX idx_email_events_timestamp ON email_events(timestamp DESC);

-- Contrainte unique pour déduplication (même message_id + même event = doublon)
CREATE UNIQUE INDEX idx_email_events_dedup ON email_events(message_id, event_type) WHERE message_id IS NOT NULL;
