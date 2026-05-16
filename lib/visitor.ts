/**
 * Gère l'identifiant unique du visiteur (Session)
 */
export const getVisitorId = () => {
  if (typeof window === 'undefined') return null;

  // On essaie de récupérer l'ID existant dans le sessionStorage
  // sessionStorage dure tant que l'onglet est ouvert
  let visitorId = sessionStorage.getItem('ksm_visitor_id');

  if (!visitorId) {
    // Génération cryptographiquement sûre (Math.random() est prédictible)
    const bytes = new Uint8Array(16);
    crypto.getRandomValues(bytes);
    visitorId = 'v_' + Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
    sessionStorage.setItem('ksm_visitor_id', visitorId);
  }

  return visitorId;
};
