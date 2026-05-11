/**
 * Utilitaire d'envoi d'emails via l'API Brevo (Sendinblue)
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const API_KEY = process.env.BREVO_API_KEY;

interface SendEmailParams {
  to: string;
  subject: string;
  htmlContent: string;
}

export async function sendEmail({ to, subject, htmlContent }: SendEmailParams) {
  if (!API_KEY) {
    console.error('BREVO_API_KEY is missing. Email not sent.');
    return { success: false, error: 'API Key missing' };
  }

  try {
    const response = await fetch(BREVO_API_URL, {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': API_KEY,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        sender: {
          name: 'Kheops Set Motivation',
          email: 'kheopset@gmail.com',
        },
        to: [{ email: to }],
        subject: subject,
        htmlContent: htmlContent,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Brevo API Error:', errorData);
      return { success: false, error: errorData };
    }

    return { success: true };
  } catch (error) {
    console.error('Failed to send email:', error);
    return { success: false, error };
  }
}

/**
 * Envoie le livre numérique au client
 */
export async function sendProductDeliveryEmail(customerEmail: string, productName: string, downloadUrl: string) {
  const htmlContent = `
    <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #000; color: #fff; padding: 40px; border: 1px solid #333;">
      <h1 style="color: #eeb149; text-transform: uppercase; letter-spacing: 2px;">Ordre Validé</h1>
      <p>Bâtisseur,</p>
      <p>Ton paiement pour <strong>${productName}</strong> a été confirmé avec succès.</p>
      <p>Tu peux accéder à ton matériel immédiatement en cliquant sur le bouton ci-dessous :</p>
      <div style="text-align: center; margin: 40px 0;">
        <a href="${downloadUrl}" style="background-color: #eeb149; color: #000; padding: 15px 30px; text-decoration: none; font-weight: bold; text-transform: uppercase; display: inline-block;">
          Télécharger mon livre
        </a>
      </div>
      <p style="font-size: 12px; color: #666;">Ce lien est sécurisé et restera actif pendant 24 heures.</p>
      <hr style="border: 0; border-top: 1px solid #333; margin: 40px 0;">
      <p style="font-size: 10px; color: #444; text-transform: uppercase; letter-spacing: 1px;">Kheops Set Motivation - Bâtir son Empire</p>
    </div>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `[KSM] Livraison : ${productName}`,
    htmlContent,
  });
}

/**
 * Notifie l'admin d'une nouvelle vente
 */
export async function sendAdminNotification(customerEmail: string, productName: string, amount: number) {
  const htmlContent = `
    <div style="font-family: sans-serif; color: #333;">
      <h2>Nouvelle Vente ! 🚀</h2>
      <p><strong>Produit :</strong> ${productName}</p>
      <p><strong>Montant :</strong> ${amount} FCFA</p>
      <p><strong>Client :</strong> ${customerEmail}</p>
      <p>Le client a reçu son lien de téléchargement automatiquement.</p>
    </div>
  `;

  return sendEmail({
    to: 'kheopset@gmail.com',
    subject: `NOUVELLE VENTE : ${productName} (${amount} FCFA)`,
    htmlContent,
  });
}
