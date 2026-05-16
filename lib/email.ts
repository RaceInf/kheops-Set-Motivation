/**
 * Utilitaire d'envoi d'emails via l'API Brevo (Sendinblue)
 */

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';
const API_KEY = process.env.BREVO_API_KEY;

interface SendEmailParams {
  to: string;
  subject: string;
  htmlContent: string;
  tags?: string[];
}

export async function sendEmail({ to, subject, htmlContent, tags }: SendEmailParams) {
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
        tags: tags
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
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Barlow+Condensed:wght@400;700&display=swap');
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; }
        body { margin: 0; padding: 0; background-color: #000000; color: #ffffff; font-family: 'Barlow Condensed', Arial, sans-serif; }
        .wrapper { width: 100%; table-layout: fixed; background-color: #000000; padding: 40px 0; }
        .main { max-width: 600px; margin: 0 auto; width: 100%; background-color: #0a0a0a; border: 1px solid #1a1a1a; }
        .header { padding: 40px 40px 20px 40px; text-align: center; }
        .logo { font-family: 'Anton', Impact, sans-serif; font-size: 28px; color: #eeb149; letter-spacing: 2px; text-transform: uppercase; margin: 0; }
        .content { padding: 0 40px 40px 40px; }
        h1 { font-family: 'Anton', Impact, sans-serif; font-size: 42px; line-height: 1.1; color: #ffffff; text-transform: uppercase; margin: 0 0 20px 0; font-weight: normal; }
        p { font-size: 18px; line-height: 1.6; color: #d4d4d8; margin: 0 0 20px 0; }
        .highlight { color: #eeb149; font-weight: 700; }
        .button-container { text-align: left; margin: 40px 0; }
        .button { background-color: #eeb149; color: #000000 !important; padding: 18px 36px; text-decoration: none; font-family: 'Anton', Impact, sans-serif; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; }
        .footer { padding: 30px 40px; border-top: 1px solid #1a1a1a; text-align: center; background-color: #050505; }
        .footer-text { font-size: 12px; color: #71717a; text-transform: uppercase; letter-spacing: 2px; font-weight: 700; margin: 0; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <table class="main" align="center" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td class="header">
              <p class="logo">KHEOPS SET</p>
            </td>
          </tr>
          <tr>
            <td class="content">
              <h1>ORDRE VALIDÉ.</h1>
              <p>Bâtisseur,</p>
              <p>Ton accès au protocole <span class="highlight">${productName}</span> a été déverrouillé avec succès.</p>
              <p>L'infrastructure est en place. Tu peux maintenant télécharger ton matériel d'armement intellectuel.</p>
              
              <div class="button-container">
                <a href="${downloadUrl}" class="button">TÉLÉCHARGER L'OUTIL</a>
              </div>
              
              <p style="font-size: 14px; color: #71717a;">Ce lien est sécurisé et restera actif pendant <span style="color: #ffffff;">24 heures</span>.</p>
            </td>
          </tr>
          <tr>
            <td class="footer">
              <p class="footer-text">BÂTIR SON EMPIRE. SANS CONCESSION.</p>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
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
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: sans-serif; line-height: 1.6; color: #333; background-color: #f4f4f4; padding: 20px; }
        .card { max-width: 500px; margin: 0 auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .stat { margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px solid #eee; }
        .label { font-size: 12px; color: #888; text-transform: uppercase; font-weight: bold; }
        .value { font-size: 18px; color: #000; font-weight: bold; }
        .success { color: #10b981; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="card">
        <h2 style="margin-top: 0;">NOUVELLE VENTE ! 🚀</h2>
        <div class="stat">
          <div class="label">Produit</div>
          <div class="value">${productName}</div>
        </div>
        <div class="stat">
          <div class="label">Montant</div>
          <div class="value">${amount} FCFA</div>
        </div>
        <div class="stat">
          <div class="label">Client</div>
          <div class="value">${customerEmail}</div>
        </div>
        <p class="success">✓ Lien de téléchargement envoyé automatiquement.</p>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: 'kheopset@gmail.com',
    subject: `NOUVELLE VENTE : ${productName} (${amount} FCFA)`,
    htmlContent,
  });
}

/**
 * Email Marketing : Relance H+1 (Le Rappel)
 */
export async function sendMarketingReminderH1(customerEmail: string, productName: string, checkoutUrl: string, orderId?: string) {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Barlow+Condensed:wght@400;700&display=swap');
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        body { margin: 0; padding: 0; background-color: #000000; color: #ffffff; font-family: 'Barlow Condensed', Arial, sans-serif; }
        .wrapper { width: 100%; background-color: #000000; padding: 40px 0; }
        .main { max-width: 600px; margin: 0 auto; width: 100%; background-color: #000000; border: 4px solid #eeb149; }
        .content { padding: 50px 40px; }
        .surtitle { font-family: 'Anton', Impact, sans-serif; font-size: 16px; color: #eeb149; letter-spacing: 3px; text-transform: uppercase; margin: 0 0 30px 0; }
        h1 { font-family: 'Anton', Impact, sans-serif; font-size: 52px; line-height: 1.05; color: #ffffff; text-transform: uppercase; margin: 0 0 30px 0; font-weight: normal; }
        p { font-size: 19px; line-height: 1.5; color: #d4d4d8; margin: 0 0 20px 0; }
        .highlight { color: #ffffff; font-weight: 700; background-color: rgba(238, 177, 73, 0.15); padding: 0 4px; }
        .button-container { text-align: left; margin: 40px 0 0 0; }
        .button { background-color: #eeb149; color: #000000 !important; padding: 20px 40px; text-decoration: none; font-family: 'Anton', Impact, sans-serif; font-size: 20px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <table class="main" align="center" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td class="content">
              <p class="surtitle">KHEOPS SET MOTIVATION</p>
              <h1>INTERRUPTION<br/><span style="color: #eeb149;">DÉTECTÉE.</span></h1>
              <p>Bâtisseur,</p>
              <p>Le destin n'attend pas les indécis. Ton accès au protocole <span class="highlight">${productName}</span> est resté sur le seuil de la Forge.</p>
              <p>L'infrastructure est prête. Les outils sont affûtés. Il ne manque que ta validation pour lancer l'exécution.</p>
              <div class="button-container">
                <a href="${checkoutUrl}" class="button">REPRENDRE L'ACCÈS</a>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `[KSM] Interruption détectée : ${productName}`,
    htmlContent,
    tags: orderId ? [`order_${orderId}`, 'marketing_h1'] : ['marketing_h1']
  });
}

/**
 * Email Marketing : Relance H+24 (La Preuve)
 */
export async function sendMarketingReminderH24(customerEmail: string, productName: string, checkoutUrl: string, orderId?: string) {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Barlow+Condensed:wght@400;700&display=swap');
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        body { margin: 0; padding: 0; background-color: #050505; color: #ffffff; font-family: 'Barlow Condensed', Arial, sans-serif; }
        .wrapper { width: 100%; background-color: #050505; padding: 40px 0; }
        .main { max-width: 600px; margin: 0 auto; width: 100%; background-color: #0a0a0a; border-left: 8px solid #ffffff; }
        .content { padding: 50px 40px; }
        h1 { font-family: 'Anton', Impact, sans-serif; font-size: 48px; line-height: 1.05; color: #ffffff; text-transform: uppercase; margin: 0 0 30px 0; font-weight: normal; }
        p { font-size: 19px; line-height: 1.6; color: #d4d4d8; margin: 0 0 20px 0; }
        .quote { border-left: 3px solid #eeb149; padding-left: 20px; font-style: italic; color: #eeb149; font-size: 22px; margin: 35px 0; font-family: 'Georgia', serif; }
        .button-container { text-align: left; margin: 40px 0 0 0; }
        .button { background-color: #ffffff; color: #000000 !important; padding: 20px 40px; text-decoration: none; font-family: 'Anton', Impact, sans-serif; font-size: 18px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <table class="main" align="center" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td class="content">
              <h1>LE PRIX DE<br/>L'HÉSITATION.</h1>
              <p>Pendant que tu doutes, d'autres bâtissent.</p>
              <p>Le protocole <strong style="color: #ffffff;">${productName}</strong> n'est pas une option, c'est une nécessité pour ceux qui visent le sommet.</p>
              <div class="quote">
                "L'indécision est le voleur de l'opportunité."
              </div>
              <p>Hier, tu as failli franchir le pas. Qu'est-ce qui t'a arrêté ? Le doute ? La peur ? L'inaction est déjà une décision : celle de stagner.</p>
              <div class="button-container">
                <a href="${checkoutUrl}" class="button">ÉCRASER LE DOUTE</a>
              </div>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `[KSM] Le prix de l'hésitation...`,
    htmlContent,
    tags: orderId ? [`order_${orderId}`, 'marketing_h24'] : ['marketing_h24']
  });
}

/**
 * Email Marketing : Relance H+72 (L'Urgence)
 */
export async function sendMarketingReminderH72(customerEmail: string, productName: string, checkoutUrl: string, orderId?: string) {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Barlow+Condensed:wght@400;700&display=swap');
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        body { margin: 0; padding: 0; background-color: #000000; color: #ffffff; font-family: 'Barlow Condensed', Arial, sans-serif; }
        .wrapper { width: 100%; background-color: #000000; padding: 40px 0; }
        .main { max-width: 600px; margin: 0 auto; width: 100%; background-color: #eeb149; padding: 4px; }
        .inner { background-color: #000000; padding: 60px 40px; text-align: center; width: 100%; }
        h1 { font-family: 'Anton', Impact, sans-serif; font-size: 64px; line-height: 1; color: #eeb149; text-transform: uppercase; margin: 0 0 30px 0; font-weight: normal; }
        p { font-size: 20px; line-height: 1.5; color: #ffffff; margin: 0 0 20px 0; }
        .button-container { text-align: center; margin: 40px 0 0 0; }
        .button { background-color: #eeb149; color: #000000 !important; padding: 22px 50px; text-decoration: none; font-family: 'Anton', Impact, sans-serif; font-size: 22px; text-transform: uppercase; letter-spacing: 2px; display: inline-block; }
        .warning { color: #eeb149; font-size: 14px; margin-top: 30px; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; font-family: 'Anton', Impact, sans-serif; }
      </style>
    </head>
    <body>
      <div class="wrapper">
        <table class="main" align="center" border="0" cellpadding="0" cellspacing="0">
          <tr>
            <td>
              <table class="inner" align="center" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <h1>DERNIER<br/>APPEL.</h1>
                    <p>Ton accès prioritaire au <strong>${productName}</strong> expire dans quelques heures.</p>
                    <p style="color: #a1a1aa; font-size: 18px;">Demain, le système réinitialisera ton lien. Tu seras de retour à la case départ.</p>
                    <div class="button-container">
                      <a href="${checkoutUrl}" class="button">SÉCURISER L'ACCÈS</a>
                    </div>
                    <div class="warning">C'EST MAINTENANT OU JAMAIS.</div>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: customerEmail,
    subject: `[FINAL] Ton accès au ${productName} expire.`,
    htmlContent,
    tags: orderId ? [`order_${orderId}`, 'marketing_h72'] : ['marketing_h72']
  });
}

/**
 * Notification Admin : Rapport de relance marketing
 */
export async function sendMarketingAdminNotification(customerEmail: string, productName: string, reminderType: string) {
  const typeLabel = reminderType === 'h1' ? 'H+1 (Le Rappel)' : reminderType === 'h24' ? 'H+24 (La Preuve)' : 'H+72 (L\'Urgence)';
  
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #ffffff; background-color: #000000; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .card { background-color: #0a0a0a; border: 1px solid #eeb149; padding: 40px; }
        h1 { font-size: 20px; font-weight: 900; text-transform: uppercase; color: #eeb149; margin-bottom: 20px; border-bottom: 1px solid #1a1a1a; padding-bottom: 10px; }
        .item { margin-bottom: 15px; }
        .label { font-size: 10px; font-weight: bold; color: #3f3f46; text-transform: uppercase; letter-spacing: 2px; }
        .value { font-size: 14px; color: #ffffff; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="card">
          <h1>⚡ ACTIVITÉ MARKETING</h1>
          <div class="item">
            <div class="label">Action</div>
            <div class="value">Envoi d'un email de relance ${typeLabel}</div>
          </div>
          <div class="item">
            <div class="label">Produit</div>
            <div class="value">${productName}</div>
          </div>
          <div class="item">
            <div class="label">Cible</div>
            <div class="value">${customerEmail}</div>
          </div>
          <div style="margin-top: 30px; font-size: 11px; color: #27272a;">
            Système de récupération automatique KSM.
          </div>
        </div>
      </div>
    </body>
    </html>
  `;

  return sendEmail({
    to: 'ybaopportun@gmail.com', // Adresse de notification admin
    subject: `[KSM ADMIN] Relance ${reminderType.toUpperCase()} envoyée à ${customerEmail}`,
    htmlContent,
  });
}
