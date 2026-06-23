// ── Helpers ───────────────────────────────────────────────────────────────────

const EN_MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const FR_MONTHS = ['janvier','février','mars','avril','mai','juin','juillet','août','septembre','octobre','novembre','décembre']
const EN_DAYS   = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']
const FR_DAYS   = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi']

function fmtDate(iso: string, lang: string): string {
  const [y, m, d] = iso.split('-').map(Number)
  const dow = new Date(y, m - 1, d).getDay()
  return lang === 'fr'
    ? `${FR_DAYS[dow]} ${d} ${FR_MONTHS[m - 1]} ${y}`
    : `${EN_DAYS[dow]}, ${d} ${EN_MONTHS[m - 1]} ${y}`
}

function fmtTime(t: string): string {
  return t.substring(0, 5)
}

function calStart(date: string, time: string): string {
  return date.replace(/-/g, '') + 'T' + time.replace(/:/g, '').substring(0, 6).padEnd(6, '0')
}

function calEnd(date: string, time: string, durationMinutes: number): string {
  const [h, m] = time.split(':').map(Number)
  const total   = h * 60 + m + durationMinutes
  const nh      = String(Math.floor(total / 60) % 24).padStart(2, '0')
  const nm      = String(total % 60).padStart(2, '0')
  return date.replace(/-/g, '') + 'T' + nh + nm + '00'
}

function googleCalUrl(
  chateauName: string,
  chateauAddress: string | null,
  visitDate: string,
  visitTime: string,
  durationMinutes: number,
  bookingRef: string,
): string {
  const text     = encodeURIComponent(`${chateauName} – WinePass`)
  const details  = encodeURIComponent(`WinePass #${bookingRef}`)
  const location = encodeURIComponent(chateauAddress ?? `${chateauName}, Bordeaux, France`)
  const start    = calStart(visitDate, visitTime)
  const end      = calEnd(visitDate, visitTime, durationMinutes)
  return (
    `https://www.google.com/calendar/render?action=TEMPLATE` +
    `&amp;text=${text}` +
    `&amp;dates=${start}/${end}` +
    `&amp;details=${details}` +
    `&amp;location=${location}`
  )
}

function qrUrl(ref: string): string {
  return `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(ref)}&amp;size=200x200`
}

// ── Shared layout ─────────────────────────────────────────────────────────────

function layout(body: string): string {
  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WinePass</title>
  <style>@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&display=swap');</style>
</head>
<body style="margin:0;padding:0;background-color:#EDE4CF;font-family:Georgia,'Times New Roman',serif;">
<table width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#EDE4CF;">
<tr><td align="center" style="padding:32px 16px;">
<table width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;background:#FAF6EE;border-radius:8px;overflow:hidden;">

  <!-- HEADER -->
  <tr><td style="background:#5C1A1A;padding:36px 48px 28px;text-align:center;">
    <div style="font-family:'Playfair Display',Georgia,serif;font-size:30px;font-weight:bold;color:#C4963A;letter-spacing:4px;">WINEPASS</div>
    <div style="font-size:11px;color:#DDD0B3;letter-spacing:3px;text-transform:uppercase;margin-top:6px;">Bordeaux Wine Experiences</div>
  </td></tr>
  <!-- GOLD LINE -->
  <tr><td style="background:#C4963A;height:3px;padding:0;font-size:0;line-height:0;">&nbsp;</td></tr>

  <!-- BODY -->
  <tr><td style="padding:40px 48px;">${body}</td></tr>

  <!-- FOOTER -->
  <tr><td style="background:#1C0A0A;padding:24px 48px;text-align:center;">
    <div style="font-size:12px;color:#8B6B6B;margin-bottom:4px;">&copy; 2026 WinePass &middot; Bordeaux &middot; France</div>
    <div style="font-size:11px;color:#4A2020;">support@winepass.fr</div>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`
}

// ── Detail row helper ─────────────────────────────────────────────────────────

function row(label: string, value: string, highlight = false): string {
  return `<tr style="border-top:1px solid #F0E8D8;">
    <td style="font-size:11px;color:#8B6B6B;text-transform:uppercase;letter-spacing:1px;padding:8px 4px;width:38%;vertical-align:top;">${label}</td>
    <td style="font-size:${highlight ? '17' : '14'}px;color:${highlight ? '#5C1A1A' : '#1C0A0A'};font-weight:${highlight ? 'bold' : 'normal'};padding:8px 4px;">${value}</td>
  </tr>`
}

// ── 1. Booking Confirmation ───────────────────────────────────────────────────

export interface ConfirmationParams {
  lang: string
  guestName: string | null
  chateauName: string
  chateauAddress: string | null
  chateauSlug: string
  experienceNameEn: string
  experienceNameFr: string
  durationMinutes: number
  visitDate: string
  visitTime: string
  guestsCount: number
  addons: Array<{ name?: string; price?: number }>
  totalPrice: number
  bookingRef: string
  siteUrl: string
}

export function confirmationEmail(p: ConfirmationParams): { subject: string; html: string } {
  const isFr    = p.lang === 'fr'
  const name    = p.guestName ?? (isFr ? 'cher client' : 'there')
  const expName = isFr ? p.experienceNameFr : p.experienceNameEn
  const gcal    = googleCalUrl(p.chateauName, p.chateauAddress, p.visitDate, p.visitTime, p.durationMinutes, p.bookingRef)
  const apple   = `${p.siteUrl}/api/calendar/${encodeURIComponent(p.bookingRef)}`

  const addonRows = p.addons.length > 0
    ? row(isFr ? 'Options' : 'Extras', p.addons.map(a => a.name ?? '').filter(Boolean).join(', '))
    : ''

  const subject = isFr
    ? `Réservation confirmée – ${p.chateauName}`
    : `Booking Confirmed – ${p.chateauName}`

  const body = `
  <!-- HEADING -->
  <div style="text-align:center;margin-bottom:32px;">
    <div style="width:52px;height:52px;background:#5C1A1A;border-radius:50%;margin:0 auto 14px;display:inline-block;line-height:52px;font-size:26px;color:#C4963A;">&check;</div>
    <div style="font-family:'Playfair Display',Georgia,serif;font-size:24px;color:#5C1A1A;font-weight:bold;margin-bottom:8px;">${isFr ? 'Réservation confirmée' : 'Booking Confirmed'}</div>
    <div style="font-size:14px;color:#8B6B6B;">${isFr ? `Bonjour ${name}, votre expérience est réservée.` : `Hello ${name}, your experience is booked.`}</div>
  </div>

  <!-- QR CODE -->
  <div style="text-align:center;margin-bottom:32px;">
    <img src="${qrUrl(p.bookingRef)}" alt="QR Code" width="180" height="180"
         style="border:4px solid #DDD0B3;border-radius:8px;display:block;margin:0 auto 10px;">
    <div style="font-size:11px;color:#8B6B6B;letter-spacing:2px;text-transform:uppercase;">${p.bookingRef}</div>
    <div style="font-size:11px;color:#8B6B6B;margin-top:4px;">${isFr ? 'Présentez ce QR à l&rsquo;entrée' : 'Show this QR at the entrance'}</div>
  </div>

  <!-- DETAILS BOX -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #DDD0B3;border-left:4px solid #C4963A;border-radius:6px;margin-bottom:28px;">
  <tr><td style="padding:20px 24px;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="font-size:11px;color:#8B6B6B;text-transform:uppercase;letter-spacing:1px;padding:4px;width:38%;">Château</td>
      <td style="font-size:15px;color:#1C0A0A;font-weight:bold;padding:4px;">${p.chateauName}</td>
    </tr>
    ${row(isFr ? 'Expérience' : 'Experience', expName)}
    ${row(isFr ? 'Date' : 'Date', fmtDate(p.visitDate, p.lang))}
    ${row(isFr ? 'Heure' : 'Time', fmtTime(p.visitTime))}
    ${row(isFr ? 'Participants' : 'Guests', String(p.guestsCount))}
    ${addonRows}
    <tr style="border-top:1px solid #DDD0B3;">
      <td style="font-size:11px;color:#8B6B6B;text-transform:uppercase;letter-spacing:1px;padding:12px 4px 4px;">${isFr ? 'Total payé' : 'Total paid'}</td>
      <td style="font-size:20px;color:#5C1A1A;font-weight:bold;padding:12px 4px 4px;">&euro;${p.totalPrice.toFixed(2)}</td>
    </tr>
  </table>
  </td></tr>
  </table>

  <!-- CALENDAR BUTTONS -->
  <div style="text-align:center;margin-bottom:28px;">
    <div style="font-size:12px;color:#8B6B6B;margin-bottom:14px;text-transform:uppercase;letter-spacing:1px;">${isFr ? 'Ajouter à votre agenda' : 'Add to your calendar'}</div>
    <a href="${gcal}" style="display:inline-block;background:#5C1A1A;color:#C4963A;text-decoration:none;padding:11px 22px;border-radius:4px;font-size:12px;margin:4px;letter-spacing:1px;text-transform:uppercase;">Google Calendar</a>
    <a href="${apple}" style="display:inline-block;background:#3D0F0F;color:#DDD0B3;text-decoration:none;padding:11px 22px;border-radius:4px;font-size:12px;margin:4px;letter-spacing:1px;text-transform:uppercase;">Apple Calendar</a>
  </div>

  <!-- CANCELLATION POLICY -->
  <div style="font-size:12px;color:#8B6B6B;text-align:center;padding-top:20px;border-top:1px solid #EDE4CF;">
    ${isFr ? 'Annulation gratuite jusqu&rsquo;à 48h avant la visite.' : 'Free cancellation up to 48 hours before your visit.'}
  </div>`

  return { subject, html: layout(body) }
}

// ── 2. 24h Reminder ──────────────────────────────────────────────────────────

export interface ReminderParams {
  lang: string
  guestName: string | null
  chateauName: string
  chateauAddress: string | null
  durationMinutes: number
  visitDate: string
  visitTime: string
  guestsCount: number
  bookingRef: string
  siteUrl: string
}

export function reminderEmail(p: ReminderParams): { subject: string; html: string } {
  const isFr = p.lang === 'fr'
  const name = p.guestName ?? (isFr ? 'cher client' : 'there')
  const gcal = googleCalUrl(p.chateauName, p.chateauAddress, p.visitDate, p.visitTime, p.durationMinutes, p.bookingRef)

  const subject = isFr
    ? `Demain : votre visite au ${p.chateauName}`
    : `Tomorrow: Your visit to ${p.chateauName}`

  const body = `
  <!-- HEADING -->
  <div style="text-align:center;margin-bottom:32px;">
    <div style="font-size:36px;margin-bottom:12px;">&#127863;</div>
    <div style="font-family:'Playfair Display',Georgia,serif;font-size:24px;color:#5C1A1A;font-weight:bold;margin-bottom:8px;">${isFr ? 'Rappel de visite' : 'Visit Reminder'}</div>
    <div style="font-size:14px;color:#8B6B6B;">${isFr ? `Bonjour ${name}, votre visite est demain !` : `Hello ${name}, your visit is tomorrow!`}</div>
  </div>

  <!-- DETAILS BOX -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #DDD0B3;border-left:4px solid #C4963A;border-radius:6px;margin-bottom:28px;">
  <tr><td style="padding:20px 24px;">
  <table width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="font-size:11px;color:#8B6B6B;text-transform:uppercase;letter-spacing:1px;padding:4px;width:38%;">Château</td>
      <td style="font-size:15px;color:#1C0A0A;font-weight:bold;padding:4px;">${p.chateauName}</td>
    </tr>
    ${row(isFr ? 'Date' : 'Date', fmtDate(p.visitDate, p.lang))}
    ${row(isFr ? 'Heure' : 'Time', fmtTime(p.visitTime))}
    ${row(isFr ? 'Adresse' : 'Address', p.chateauAddress ?? `${p.chateauName}, Bordeaux, France`)}
    ${row(isFr ? 'Référence' : 'Reference', p.bookingRef)}
  </table>
  </td></tr>
  </table>

  <!-- QR REMINDER -->
  <div style="text-align:center;margin-bottom:28px;">
    <div style="font-size:12px;color:#8B6B6B;margin-bottom:12px;">${isFr ? 'Votre QR code d&rsquo;entrée' : 'Your entry QR code'}</div>
    <img src="${qrUrl(p.bookingRef)}" alt="QR Code" width="150" height="150"
         style="border:4px solid #DDD0B3;border-radius:8px;display:block;margin:0 auto;">
  </div>

  <!-- CALENDAR BUTTON -->
  <div style="text-align:center;margin-bottom:28px;">
    <a href="${gcal}" style="display:inline-block;background:#5C1A1A;color:#C4963A;text-decoration:none;padding:11px 28px;border-radius:4px;font-size:12px;letter-spacing:1px;text-transform:uppercase;">
      ${isFr ? 'Voir dans Google Calendar' : 'View in Google Calendar'}
    </a>
  </div>

  <!-- FOOTER NOTE -->
  <div style="font-size:12px;color:#8B6B6B;text-align:center;padding-top:20px;border-top:1px solid #EDE4CF;">
    ${isFr ? `À demain au ${p.chateauName} !` : `See you tomorrow at ${p.chateauName}!`}
  </div>`

  return { subject, html: layout(body) }
}

// ── 3. Post-visit Review Request ─────────────────────────────────────────────

export interface ReviewRequestParams {
  lang: string
  guestName: string | null
  chateauName: string
  chateauSlug: string
  visitDate: string
  bookingRef: string
  siteUrl: string
}

export function reviewRequestEmail(p: ReviewRequestParams): { subject: string; html: string } {
  const isFr      = p.lang === 'fr'
  const name      = p.guestName ?? (isFr ? 'cher client' : 'there')
  const reviewUrl = `${p.siteUrl}/review/${encodeURIComponent(p.bookingRef)}`

  const subject = isFr
    ? `Comment s’est passée votre visite au ${p.chateauName} ?`
    : `How was your visit to ${p.chateauName}?`

  const body = `
  <!-- HEADING -->
  <div style="text-align:center;margin-bottom:32px;">
    <div style="font-size:36px;margin-bottom:12px;">&#11088;</div>
    <div style="font-family:'Playfair Display',Georgia,serif;font-size:24px;color:#5C1A1A;font-weight:bold;margin-bottom:8px;">
      ${isFr ? 'Votre avis nous intéresse' : 'Share your experience'}
    </div>
    <div style="font-size:14px;color:#8B6B6B;">
      ${isFr
        ? `Bonjour ${name}, nous espérons que votre visite au ${p.chateauName} a été exceptionnelle.`
        : `Hello ${name}, we hope your visit to ${p.chateauName} was wonderful.`
      }
    </div>
  </div>

  <!-- CHATEAU NAME BLOCK -->
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #DDD0B3;border-left:4px solid #C4963A;border-radius:6px;margin-bottom:28px;">
  <tr><td style="padding:24px;">
    <div style="font-size:12px;color:#8B6B6B;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px;">${isFr ? 'Votre visite' : 'Your visit'}</div>
    <div style="font-size:18px;color:#5C1A1A;font-weight:bold;margin-bottom:4px;">${p.chateauName}</div>
    <div style="font-size:13px;color:#8B6B6B;">${fmtDate(p.visitDate, p.lang)}</div>
  </td></tr>
  </table>

  <!-- STAR RATINGS VISUAL -->
  <div style="text-align:center;margin-bottom:28px;">
    <div style="font-size:28px;letter-spacing:4px;color:#C4963A;">&#9733;&#9733;&#9733;&#9733;&#9733;</div>
    <div style="font-size:13px;color:#8B6B6B;margin-top:10px;">
      ${isFr ? 'Votre avis aide d&rsquo;autres amateurs de vin à choisir leur expérience.' : 'Your review helps other wine lovers choose their experience.'}
    </div>
  </div>

  <!-- CTA BUTTON -->
  <div style="text-align:center;margin-bottom:28px;">
    <a href="${reviewUrl}" style="display:inline-block;background:#C4963A;color:#1C0A0A;text-decoration:none;padding:14px 36px;border-radius:4px;font-size:14px;font-weight:bold;letter-spacing:1px;">
      ${isFr ? 'Laisser mon avis →' : 'Leave a Review →'}
    </a>
  </div>

  <!-- FOOTER NOTE -->
  <div style="font-size:12px;color:#8B6B6B;text-align:center;padding-top:20px;border-top:1px solid #EDE4CF;">
    ${isFr
      ? `Référence : ${p.bookingRef} &middot; Merci de votre confiance.`
      : `Reference: ${p.bookingRef} &middot; Thank you for choosing WinePass.`
    }
  </div>`

  return { subject, html: layout(body) }
}
