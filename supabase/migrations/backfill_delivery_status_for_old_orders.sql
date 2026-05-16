-- Backfill : Les commandes PAID créées AVANT l'ajout du système de tracking
-- (delivery_sent_at IS NULL et delivery_error IS NULL) signifie que le NOUVEAU système
-- n'a jamais tenté de livraison → elles ont été livrées par l'ANCIEN code sans tracking.
--
-- On les marque 'SENT' pour :
--   1. Afficher le bon statut dans le dashboard admin
--   2. Éviter que le cron delivery-retry ne leur renvoie un email en double
--
-- NOTE : Si une commande PAID a delivery_error IS NOT NULL, c'est que le nouveau système
-- a tenté et échoué → on ne la touche pas, le cron la retraitera.

UPDATE public.orders
SET
  delivery_status   = 'SENT',
  delivery_sent_at  = created_at,   -- date d'envoi inconnue → on utilise la date de commande
  delivery_error    = NULL
WHERE
  status            = 'PAID'
  AND delivery_sent_at IS NULL
  AND delivery_error   IS NULL;

-- Vérification après exécution :
-- SELECT COUNT(*), delivery_status FROM orders WHERE status = 'PAID' GROUP BY delivery_status;
