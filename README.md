# Rhythm Row — Dance Workshop Website (v5)

Dark + Light glass theme, ek accent colour with glow, "Choose your classes" booking, teachers, UPI payment, My Ticket, Google Sheet backend.

**Sab kuch `assets/js/config.js` se control hota hai.** `style.css` aur `app.js` ko chhedna nahi hai.

---

## 1. Turant dekhna (demo mode)

`index.html` double-click karo. `scriptUrl` khali hai, isliye demo mode chalta hai (data sirf us browser mein rehta hai). Poora flow test kar sakte ho: class chuno → details → payment → ticket.
Demo promo code: `WELCOME100`.

---

## 2. Client ke liye badalna (config.js)

| Kya badalna hai | Config mein kahan |
|---|---|
| Naam, tagline, hero ki 3 lines, intro | `brand`, `tagline`, `headline`, `intro` |
| **Accent colour (glow wala)** | `theme.accent` — koi bhi hex, jaise `'#FF5A1F'` (orange), `'#2DD4A0'` (green), `'#4C8DFF'` (blue) |
| Light theme mein text colour | `theme.accentOnLight` (thoda gehra version) |
| Default theme | `theme.default` = `'dark'`, `'light'` ya `'system'` |
| WhatsApp / phone / email / Instagram / YouTube | `contact` |
| UPI ID aur naam | `payment` |
| Logo, hero photos, gallery | `images` (files `assets/img/` mein rakho) |
| Section on/off | `sections` (`teachers: false` karte hi chhup jaata hai) |
| Teachers | `teachers` (photo, styles, instagram, bio) |
| Workshops aur unki classes | `workshops` |
| Reviews, FAQ, "How it works", About | `reviews`, `faqs`, `how`, `about` |
| Google Analytics | `analyticsId` |

Visitor uppar corner ke button se dark/light badal sakta hai, choice yaad rehti hai.

### Naya workshop kaise jodna
`workshops` list mein ek block copy karo:
```js
{ id:'w4', teacher:'t2', tag:'Dance Workshop', date:'2026-12-20', city:'Bhubaneswar',
  venue:'Hall name, Area', mapLink:'https://maps.google.com/...', groupLink:'https://chat.whatsapp.com/...',
  bundle:{ min:3, off:150 },            // 3+ classes par Rs 150 off (nahi chahiye to hata do)
  classes:[
    { id:'c10', name:'Song name', time:'1:00 PM', price:950, seats:20 },
    { id:'c11', name:'Song name', time:'4:00 PM', price:950, seats:20 } ] }
```
`id` har jagah alag hona chahiye. Purane workshops (date nikal gayi) apne aap chhup jaate hain.

---

## 3. Google Sheet backend (admin ke liye, sab kuch Sheet se)

Ye sirf tab chahiye jab client khud Sheet se workshops badalna chahe aur seats/booking track ho.

**Part A — ek baar setup (10 minute)**
1. [sheets.new](https://sheets.new) kholo, naam rakho `Rhythm Row`.
2. Menu: **Extensions → Apps Script**. Jo code hai sab delete karo, `apps-script/Code.gs` ka poora code paste karo. Upar `BRAND` aur `OWNER_EMAIL` apna daalo. Save (Ctrl+S).
3. Upar function dropdown mein **setup** chuno → **Run**. Google permission maangega: *Review permissions → apna account → Advanced → Go to project → Allow*. Ab Sheet mein 5 tab ban jaate hain (Teachers, Workshops, Classes, Promo, Registrations) sample data ke saath.
4. **Deploy → New deployment → type: Web app**. *Execute as: Me*, *Who has access: Anyone*. **Deploy** dabao, jo **Web app URL** mile use copy karo.
5. `config.js` mein `scriptUrl: 'wo URL'` paste karo. Bas. Ab site Sheet se chalti hai.

> Code.gs baad mein badlo to **Deploy → Manage deployments → Edit → New version** karna padega, warna purana code chalta rahega.

**Part B — roz ka kaam**
- **Teachers tab:** ek teacher = ek row. `styles` mein comma se likho: `Bollywood, Hip Hop`.
- **Workshops tab:** ek workshop = ek row. `teacher` mein teacher ka `id`. `date` format `2026-12-20`. `active` = `no` karo to chhup jaata hai.
- **Classes tab:** ek class/gaana = ek row. `workshop` mein workshop ka `id`. `seats` khali = unlimited.
- **Promo tab:** `type` = `flat` (Rs off) ya `percent`.
- **Registrations tab:** har booking yahan aati hai, Status **Pending**. Apna UPI app kholo, UTR match karo, phir Status ko **Verified** karo. Customer ko turant mail jaati hai aur uske ticket par WhatsApp group link dikhta hai. Galat payment ho to **Rejected** (seat wapas khul jaati hai).

Workshop ke group ka link `Workshops` tab ke `groupLink` column mein daalo. Wo sirf Verified ticket par dikhta hai.

---

## 4. Live kaise karein (free)
1. [app.netlify.com/drop](https://app.netlify.com/drop) kholo.
2. Poora folder (jisme `index.html` hai) drag-drop karo. Link mil jaata hai.
3. Apna domain jodna ho to Netlify → Domain settings.

---

## 5. Honest notes
- Payment **manual verify** hota hai (UPI se auto-verify ke liye Razorpay jaisa gateway chahiye, wo alag kaam hai).
- Photos client se lo (teacher + hero). Bina photo ke initial wale placeholder dikhte hain.
- Ek hi phone number se kai booking ho sakti hain; UTR dobara use nahi ho sakta.
- Phone par sab kuch test kiya gaya hai (320px se 1366px tak, horizontal scroll nahi).

## Files
```
index.html
assets/css/style.css     (design, mat chhedna)
assets/js/config.js      (YAHI badalna hai)
assets/js/app.js         (logic, mat chhedna)
assets/img/              (logo, photos)
apps-script/Code.gs      (Google Sheet backend)
```
