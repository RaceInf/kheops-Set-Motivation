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
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; line-height: 1.6; color: #ffffff; background-color: #000000; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
        .header { text-align: center; margin-bottom: 40px; }
        .logo { font-size: 24px; font-weight: 900; letter-spacing: 5px; color: #eeb149; text-transform: uppercase; margin-bottom: 10px; }
        .card { background-color: #0a0a0a; border: 1px solid #1a1a1a; padding: 40px; border-radius: 4px; }
        h1 { font-size: 28px; font-weight: 900; text-transform: uppercase; letter-spacing: -1px; margin-bottom: 24px; color: #ffffff; line-height: 1.1; }
        p { font-size: 16px; color: #a1a1aa; margin-bottom: 24px; }
        .highlight { color: #ffffff; font-weight: bold; }
        .button-container { text-align: center; margin: 40px 0; }
        .button { background-color: #eeb149; color: #000000 !important; padding: 18px 36px; text-decoration: none; font-weight: 900; font-size: 14px; text-transform: uppercase; letter-spacing: 2px; display: inline-block; border-radius: 2px; }
        .footer { text-align: center; margin-top: 40px; padding-top: 20px; border-top: 1px solid #1a1a1a; }
        .footer-text { font-size: 11px; color: #52525b; text-transform: uppercase; letter-spacing: 2px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo">KHEOPS SET</div>
        </div>
        <div class="card">
          <h1>ORDRE VALIDÉ.</h1>
          <p>Bâtisseur,</p>
          <p>Ton accès au protocole <span class="highlight">${productName}</span> a été déverrouillé avec succès.</p>
          <p>Tu peux maintenant télécharger ton matériel en cliquant sur le bouton ci-dessous :</p>
          
          <div class="button-container">
            <a href="${downloadUrl}" class="button">TÉLÉCHARGER L'OUTIL</a>
          </div>
          
          <p style="font-size: 13px; text-align: center;">Ce lien est sécurisé et restera actif pendant <span class="highlight">24 heures</span>.</p>
        </div>
        <div class="footer">
          <div class="footer-text">BÂTIR SON EMPIRE. SANS CONCESSION.</div>
        </div>
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
 * Email Marketing : Relance H+1 (L'Outil t'attend)
 * Design : Bannière hero pyramide + élégant, mystérieux
 */
export async function sendMarketingReminderH1(customerEmail: string, productName: string, checkoutUrl: string, orderId?: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kheops-set-motivation.vercel.app';
  const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#000000;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;color:#e4e4e7;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;">
    <tr><td align="center" style="padding:30px 15px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#0a0a0a;border-radius:4px;overflow:hidden;">
        <tr><td style="padding:0;"><img src="${siteUrl}/images/email/banner-h1.png" alt="Kheops Set" width="600" style="display:block;width:100%;height:auto;border:0;" /></td></tr>
        <tr><td style="background-color:#eeb149;height:3px;font-size:0;line-height:0;">&nbsp;</td></tr>
        <tr><td style="padding:45px 40px 20px;">
          <h1 style="font-size:32px;line-height:1.15;color:#ffffff;text-transform:uppercase;letter-spacing:1px;margin:0 0 8px;font-weight:900;">TON OUTIL<br/><span style="color:#eeb149;">T'ATTEND.</span></h1>
          <p style="font-size:11px;letter-spacing:4px;color:#eeb149;text-transform:uppercase;font-weight:700;margin:0 0 30px;opacity:0.7;">RELANCE AUTOMATIQUE</p>
        </td></tr>
        <tr><td style="padding:0 40px 30px;">
          <p style="font-size:16px;line-height:1.7;color:#d4d4d8;margin:0 0 20px;">Bâtisseur,</p>
          <p style="font-size:16px;line-height:1.7;color:#d4d4d8;margin:0 0 20px;">Il y a quelques instants, tu étais à un clic de transformer ta trajectoire. Le protocole <strong style="color:#ffffff;">${productName}</strong> est resté sur le seuil de la Forge.</p>
          <p style="font-size:16px;line-height:1.7;color:#d4d4d8;margin:0 0 20px;">L'infrastructure est prête. Les outils sont affûtés. <strong style="color:#ffffff;">Il ne manque que ta décision.</strong></p>
        </td></tr>
        <tr><td align="center" style="padding:10px 40px 45px;">
          <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background-color:#eeb149;border-radius:2px;">
            <a href="${checkoutUrl}" target="_blank" style="display:inline-block;padding:18px 45px;color:#000000;font-size:14px;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:2px;">REPRENDRE L'ACCÈS ➔</a>
          </td></tr></table>
        </td></tr>
        <tr><td style="padding:0 40px;"><div style="border-top:1px solid #1f1f22;"></div></td></tr>
        <tr><td style="padding:30px 40px;text-align:center;">
          <p style="font-size:10px;color:#52525b;text-transform:uppercase;letter-spacing:3px;font-weight:700;margin:0;">LE SUCCÈS EST UNE DISCIPLINE.</p>
          <p style="font-size:9px;color:#3f3f46;margin:10px 0 0;letter-spacing:1px;">Kheops Set Motivation — L'Ordre du Bâtisseur</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

  return sendEmail({
    to: customerEmail,
    subject: \`[KSM] \${productName} — ton outil t'attend, Bâtisseur.\`,
    htmlContent,
    tags: orderId ? [\`order_\${orderId}\`, 'marketing_h1'] : ['marketing_h1']
  });
}

/**
 * Email Marketing : Relance H+24 (Le Prix du Silence)
 * Design : Bannière silhouette ambitieuse + accent gauche or
 */
export async function sendMarketingReminderH24(customerEmail: string, productName: string, checkoutUrl: string, orderId?: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kheops-set-motivation.vercel.app';
  const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#000000;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;color:#e4e4e7;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;">
    <tr><td align="center" style="padding:30px 15px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#0a0a0a;border-radius:4px;overflow:hidden;">
        <tr><td style="padding:0;"><img src="${siteUrl}/images/email/banner-h24.png" alt="L'Empire t'attend" width="600" style="display:block;width:100%;height:auto;border:0;" /></td></tr>
        <tr><td style="padding:0;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
            <td width="5" style="background-color:#eeb149;"></td>
            <td style="padding:45px 40px 20px 35px;">
              <p style="font-size:11px;letter-spacing:4px;color:#71717a;text-transform:uppercase;font-weight:700;margin:0 0 20px;">24 HEURES PLUS TARD</p>
              <h1 style="font-size:30px;line-height:1.15;color:#ffffff;text-transform:uppercase;letter-spacing:1px;margin:0 0 30px;font-weight:900;">PENDANT QUE TU HÉSITES,<br/><span style="color:#eeb149;">D'AUTRES BÂTISSENT.</span></h1>
              <p style="font-size:16px;line-height:1.7;color:#d4d4d8;margin:0 0 20px;">Hier, tu as failli franchir le pas. Le protocole <strong style="color:#ffffff;">${productName}</strong> était à portée de main.</p>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:25px 0;"><tr>
                <td style="background-color:#18181b;border-left:3px solid #eeb149;padding:20px 25px;">
                  <p style="font-size:15px;font-style:italic;color:#a1a1aa;margin:0;line-height:1.6;">"L'indécision est le voleur de l'opportunité.<br/>La stagnation est le salaire de la peur."</p>
                </td>
              </tr></table>
              <p style="font-size:16px;line-height:1.7;color:#d4d4d8;margin:0 0 10px;">Qu'est-ce qui t'a arrêté ? <strong style="color:#ffffff;">Le doute ? La complaisance ?</strong></p>
              <p style="font-size:16px;line-height:1.7;color:#d4d4d8;margin:0 0 30px;">Les bâtisseurs ne réfléchissent pas éternellement. <strong style="color:#eeb149;">Ils exécutent.</strong></p>
              <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background-color:#ffffff;border-radius:2px;">
                <a href="${checkoutUrl}" target="_blank" style="display:inline-block;padding:18px 45px;color:#000000;font-size:14px;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:2px;">ÉCRASER LE DOUTE ➔</a>
              </td></tr></table>
            </td>
          </tr></table>
        </td></tr>
        <tr><td style="padding:0 40px;"><div style="border-top:1px solid #1f1f22;"></div></td></tr>
        <tr><td style="padding:30px 40px;text-align:center;">
          <p style="font-size:10px;color:#52525b;text-transform:uppercase;letter-spacing:3px;font-weight:700;margin:0;">BÂTIR SON EMPIRE. SANS CONCESSION.</p>
          <p style="font-size:9px;color:#3f3f46;margin:10px 0 0;letter-spacing:1px;">Kheops Set Motivation — L'Ordre du Bâtisseur</p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

  return sendEmail({
    to: customerEmail,
    subject: \`[KSM] Pendant que tu hésites, d'autres bâtissent...\`,
    htmlContent,
    tags: orderId ? [\`order_\${orderId}\`, 'marketing_h24'] : ['marketing_h24']
  });
}

/**
 * Email Marketing : Relance H+72 (Dernier Signal)
 * Design : Sablier doré + bordure or englobante, urgence maximale
 */
export async function sendMarketingReminderH72(customerEmail: string, productName: string, checkoutUrl: string, orderId?: string) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://kheops-set-motivation.vercel.app';
  const htmlContent = `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background-color:#000000;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#000000;">
    <tr><td align="center" style="padding:30px 15px;">
      <table role="presentation" width="604" cellpadding="0" cellspacing="0" style="max-width:604px;width:100%;background-color:#eeb149;border-radius:4px;">
        <tr><td style="padding:3px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0a;border-radius:2px;overflow:hidden;">
            <tr><td style="padding:0;"><img src="${siteUrl}/images/email/banner-h72.png" alt="Le temps presse" width="598" style="display:block;width:100%;height:auto;border:0;" /></td></tr>
            <tr><td align="center" style="padding:40px 40px 15px;">
              <p style="font-size:11px;letter-spacing:5px;color:#eeb149;text-transform:uppercase;font-weight:900;margin:0 0 20px;">⚠ NOTIFICATION FINALE</p>
              <h1 style="font-size:42px;line-height:1;color:#ffffff;text-transform:uppercase;letter-spacing:1px;margin:0 0 25px;font-weight:900;">DERNIER<br/><span style="color:#eeb149;">APPEL.</span></h1>
            </td></tr>
            <tr><td style="padding:0 40px 20px;">
              <p style="font-size:17px;line-height:1.6;color:#e4e4e7;margin:0 0 20px;text-align:center;font-weight:600;">Ton accès prioritaire au <strong style="color:#eeb149;">${productName}</strong> expire dans quelques heures.</p>
              <p style="font-size:15px;line-height:1.6;color:#a1a1aa;margin:0 0 20px;text-align:center;">Demain, le système réinitialisera ton lien sécurisé. Tu seras de retour à la case départ, avec ceux qui observent au lieu d'agir.</p>
            </td></tr>
            <tr><td align="center" style="padding:15px 40px 20px;">
              <table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background-color:#eeb149;border-radius:2px;">
                <a href="${checkoutUrl}" target="_blank" style="display:inline-block;padding:20px 50px;color:#000000;font-size:16px;font-weight:900;text-decoration:none;text-transform:uppercase;letter-spacing:3px;">SÉCURISER L'ACCÈS ➔</a>
              </td></tr></table>
            </td></tr>
            <tr><td align="center" style="padding:15px 40px 40px;">
              <p style="font-size:12px;color:#eeb149;font-weight:900;text-transform:uppercase;letter-spacing:3px;margin:0;">C'EST MAINTENANT OU JAMAIS.</p>
            </td></tr>
            <tr><td style="padding:0 40px;"><div style="border-top:1px solid #1f1f22;"></div></td></tr>
            <tr><td style="padding:25px 40px;text-align:center;">
              <p style="font-size:9px;color:#3f3f46;letter-spacing:1px;margin:0;">Kheops Set Motivation — L'Ordre du Bâtisseur</p>
            </td></tr>
          </table>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
`;

  return sendEmail({
    to: customerEmail,
    subject: \`[FINAL] Dernier appel : ton accès au \${productName} expire.\`,
    htmlContent,
    tags: orderId ? [\`order_\${orderId}\`, 'marketing_h72'] : ['marketing_h72']
  });
}

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
