# Rhythm Row: Dance Workshop Website (v5)

Dark and light glass theme, one accent colour with a glow, "Choose your classes" booking, teacher profiles, UPI payment, My Ticket, and an optional Google Sheet backend.

**Everything is controlled from `assets/js/config.js`.** You never need to edit `style.css` or `app.js`.

---

## 1. Preview it (demo mode)

Double-click `index.html`. `scriptUrl` is empty, so the site runs in demo mode (data stays in that browser only). You can test the whole flow: choose classes, enter details, pay, get a ticket.
Demo promo code: `WELCOME100`.

---

## 2. Customise for a client (config.js)

| What to change | Where in config |
|---|---|
| Name, tagline, hero lines, intro | `brand`, `tagline`, `headline`, `intro` |
| **Accent colour (the glow)** | `theme.accent`: any hex, e.g. `'#FF5A1F'` (orange), `'#2DD4A0'` (green), `'#4C8DFF'` (blue) |
| Accent text colour in light theme | `theme.accentOnLight` (a slightly darker shade) |
| Default theme | `theme.default`: `'dark'`, `'light'` or `'system'` |
| WhatsApp, phone, email, Instagram, YouTube | `contact` |
| UPI ID and name | `payment.upiId`, `payment.upiName` |
| Your own UPI QR image (optional) | `payment.qrImage`, e.g. `'assets/img/upi-qr.png'` |
| Logo, hero photos, gallery | `images` (put files in `assets/img/`) |
| Turn sections on/off | `sections` (e.g. `teachers: false`) |
| Teachers | `teachers` (photo, styles, Instagram, bio) |
| Workshops and their classes | `workshops` |
| Reviews, FAQ, How it works, About | `reviews`, `faqs`, `how`, `about` |
| Google Analytics | `analyticsId` |

Visitors can switch dark/light with the button in the top corner, and their choice is remembered.

### Payment QR
Leave `qrImage` empty and the site generates a QR for every booking containing your UPI ID, name and the exact total, so the customer never types the amount. Use `qrImage` only if the client wants their own branded static QR (the customer then has to type the amount). Either way, set a real `upiId` and test with ₹1 before going live.

### Adding a workshop
Copy a block inside `workshops`:
```js
{ id:'w4', teacher:'t2', tag:'Dance Workshop', date:'2026-12-20', city:'Your City',
  venue:'Hall name, Area', mapLink:'https://maps.google.com/...', groupLink:'https://chat.whatsapp.com/...',
  bundle:{ min:3, off:150 },            // 3+ classes = Rs 150 off (remove if not needed)
  classes:[
    { id:'c10', name:'Song name', time:'1:00 PM', price:950, seats:20 },
    { id:'c11', name:'Song name', time:'4:00 PM', price:950, seats:20 } ] }
```
Every `id` must be unique. Past workshops (date has passed) hide automatically.

---

## 3. Google Sheet backend (optional, for managing everything from a Sheet)

Use this when the client wants to edit workshops from a spreadsheet and track bookings and seats.

**Part A: one-time setup (about 10 minutes)**
1. Open [sheets.new](https://sheets.new) and name it `Rhythm Row`.
2. Go to **Extensions → Apps Script**. Delete the existing code and paste all of `apps-script/Code.gs`. Set `BRAND` and `OWNER_EMAIL` at the top. Save.
3. In the function dropdown choose **setup** and click **Run**. Google asks for permission: *Review permissions → your account → Advanced → Go to project → Allow*. Five tabs are created with sample data: Teachers, Workshops, Classes, Promo, Registrations.
4. Click **Deploy → New deployment → Web app**. Set *Execute as: Me* and *Who has access: Anyone*. Click **Deploy** and copy the **Web app URL**.
5. Paste it into `config.js` as `scriptUrl: 'that URL'`. The site now runs from the Sheet.

> If you change `Code.gs` later, use **Deploy → Manage deployments → Edit → New version**, otherwise the old code keeps running.

**Part B: day-to-day use**
- **Teachers tab:** one teacher per row. In `styles`, separate with commas: `Bollywood, Hip Hop`.
- **Workshops tab:** one workshop per row. `teacher` is the teacher's `id`. `date` format is `2026-12-20`. Set `active` to `no` to hide it. Put the WhatsApp group link in `groupLink`.
- **Classes tab:** one class/song per row. `workshop` is the workshop's `id`. Leave `seats` empty for unlimited.
- **Promo tab:** `type` is `flat` (Rs off) or `percent`.
- **Registrations tab:** every booking lands here as **Pending**. Open your UPI app, match the UTR, then set Status to **Verified**. The customer gets an email and their ticket shows the WhatsApp group link. Set **Rejected** for a bad payment (the seat is released).

---

## 4. Put it live

**GitHub Pages (free)**
1. Create a new public repo on GitHub, e.g. `rhythm-row`.
2. In the project folder run:
```
git init
git add .
git commit -m "Rhythm Row v5"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/rhythm-row.git
git push -u origin main
```
3. Repo → **Settings → Pages** → Deploy from a branch → `main` / root → Save. Your link: `https://YOUR_USERNAME.github.io/rhythm-row/`

**Netlify (drag and drop)**
Open [app.netlify.com/drop](https://app.netlify.com/drop) and drop the whole folder. You get a link instantly. Custom domains are easiest here.

Note: the UPI ID and phone number in `config.js` are visible to anyone on a public repo (they are shown on the site anyway).

---

## 5. Honest notes
- Payment is **verified manually**. Automatic verification needs a payment gateway such as Razorpay, which is a separate piece of work.
- Get teacher and hero photos from the client. Without photos, initial-letter placeholders are shown.
- The QR code library loads from a CDN, so it needs internet. If it fails to load, the QR block hides and the "Pay with UPI app" button still works.
- The same phone number can make multiple bookings. A UTR can never be used twice.
- Checked on screens from 320px to 1366px with no horizontal scroll.

## Files
```
index.html
assets/css/style.css     (design, don't edit)
assets/js/config.js      (EDIT THIS)
assets/js/app.js         (logic, don't edit)
assets/img/              (logo, photos, optional QR)
apps-script/Code.gs      (Google Sheet backend)
```