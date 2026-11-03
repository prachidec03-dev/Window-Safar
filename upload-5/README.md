# Window Safar 🚂

**Train journeys you can ride from your desk.**
Live at **[windowsafar.com](https://windowsafar.com)**

Window Safar lets you ride Indian train routes from a window seat. Pick a route and the curtains open, printed in that region's textile, onto real window footage with live weather at every station. Chai and regional food land on your table depending on the time and weather, a co-passenger chats with you, film songs match the region, and every station stamps your passport-style stamp book. In English and हिंदी.

## Routes

Every route has its own page with its own preview image for WhatsApp and Google.

| Free | With the Pass (demo) |
|---|---|
| [Kalka → Shimla](https://windowsafar.com/kalka-shimla.html) | [Siliguri → Darjeeling](https://windowsafar.com/siliguri-darjeeling.html) |
| [Mumbai → Goa](https://windowsafar.com/mumbai-goa.html) | [Ernakulam → Kollam](https://windowsafar.com/ernakulam-kollam.html) |
| [Jodhpur → Jaisalmer](https://windowsafar.com/jodhpur-jaisalmer.html) | [Madurai → Rameswaram](https://windowsafar.com/madurai-rameswaram.html) |
| [Mumbai → Pune](https://windowsafar.com/mumbai-pune.html) | [Visakhapatnam → Araku](https://windowsafar.com/visakhapatnam-araku.html) |
| [Mettupalayam → Ooty](https://windowsafar.com/mettupalayam-ooty.html) | |

## The core journey

1. **Choose a train route** from the tickets, and watch the regional curtains open.
2. Tap **Real footage** for actual window video of the route. The creator is credited on the window.
3. **Get down at the platform**: walk along it, buy chai from a hawker, and get a **got-down stamp**.
4. **Board the train again** before the horn. Stamps keep arriving at every station.
5. Open the **Stamp book** to see every station collected.

Also try the **Focus and sleep timer**, **Play music**, the **co-passenger**, **Share this route** and **हिंदी** in the top corner.

## How it makes money

- **Affiliate links** on every route: "Book this train" and "Stay in…" through EarnKaro, and "Take home" souvenirs through Amazon Associates.
- **UPI tips**: "Buy the maker a chai".
- **Window Safar Pass** (₹149/year): four more routes with real footage. Paid through Razorpay and checked on the server (see below).

## Measuring it

Microsoft Clarity records visits privately (only the owner sees the dashboard). The site also sends named events, so the funnel can be counted:

| Event | When |
|---|---|
| `route_<id>` | A route is chosen (for example `route_shimla`) |
| `real_footage` | Real window footage is switched on |
| `got_down` · `boarded_again` | Stepping onto the platform, and boarding again |
| `stamp_collected` · `route_completed` | A stamp, and a full route |
| `stamp_book_open` | The stamp book is opened |
| `focus_timer_start` · `focus_timer_done` · `sleep_timer_start` · `sleep_timer_done` | The timer |
| `music_play` · `share_route` | Music, and sharing a route page |
| `affiliate_train` · `affiliate_stay` · `affiliate_amazon` · `tip_chai` / `tip_coffee` / `tip_momos` | Money clicks |
| `pass_click` · `pass_checkout_open` · `pass_purchased` · `pass_payment_failed` | The Pass funnel |
| `return_visit` | The same browser comes back on a different day |

Clarity also tags each session with `visitor` (new or returning) and `route`.

## Built with

- Plain HTML, CSS and JavaScript (no framework), built with Claude
- Hosted on Netlify with a custom domain
- Window footage embedded with YouTube's official player; songs with Spotify's official player
- Live weather from Open-Meteo (no API key)
- Visitor analytics with Microsoft Clarity
- Sign-in (Google or an email link) and stamp sync with Firebase Authentication and Firestore
- Pass payments with Razorpay Checkout, verified by Netlify Functions (`netlify/functions/`)

## Files

| File | What it is |
|---|---|
| `index.html` | The page: window, curtains, food card, music, platform, stamp book, tickets |
| `kalka-shimla.html` and the other route pages | The same ride with that route already chosen, and its own title and preview image (made by `tools/make_route_pages.py`) |
| `css/app.css` | Styles for the ride |
| `js/settings.js` | UPI ID and affiliate links (the only file to edit for money settings) |
| `js/analytics.js` | Clarity events and returning-visitor tag |
| `js/routes.js` | Route data: stations, footage, songs, curtains, co-passengers and food |
| `js/core.js` | Language, live weather, shared state and the animated window |
| `js/platform.js` | The platform, fogged glass, horn and announcements |
| `js/media.js` | YouTube footage with on-screen creator credit, and Spotify music |
| `js/table.js` | The food card beside the window |
| `js/stamps.js` | Station stories, stamps and the stamp book |
| `js/ui.js` | Ride it for real, tips, sign-in, curtains, co-passenger, main loop, routes, sharing and controls |
| `js/timer.js` | Focus and sleep timer |
| `js/qrcode.js` | QR codes for UPI tips (qrcode-generator, MIT) |
| `about.html`, `contact.html`, `privacy.html`, `disclosure.html`, `login.html` | Supporting pages, styled by `pages.css` |
| `auth.js` | Sign-in and stamp sync (Firebase) |
| `js/pass.js` | The Pass button and Razorpay Checkout |
| `netlify/functions/` | Server code: `pass-order`, `pass-verify`, `pass-status`, `razorpay-webhook` |
| `netlify/lib/` | Shared server code, and the Pass routes' footage list |
| `firestore.rules` | Firestore security rules (paste into Firebase) |
| `netlify.toml`, `_redirects`, `404.html` | Netlify settings, private paths and the not-found page |
| `photos/` | Food and platform photos (my own), and `photos/routes/` preview images |
| `favicon.svg`, `favicon.ico`, `icon-*.png`, `site.webmanifest` | Icons |
| `robots.txt`, `sitemap.xml` | For search engines |
| `tools/make_route_pages.py` | Rebuilds the route pages and sitemap: `python3 tools/make_route_pages.py` |

## How the Pass is protected

1. You sign in, so the Pass belongs to your account rather than one browser.
2. `pass-order` (server) creates a ₹149 Razorpay order tagged with your account.
3. Razorpay Checkout takes the payment (UPI, card or netbanking).
4. `pass-verify` (server) checks Razorpay's signature with the secret key, confirms the order is yours, paid and ₹149, and only then writes `pass: true` and `passUntil` to Firestore. `razorpay-webhook` does the same if the tab was closed.
5. `firestore.rules` lets each person edit only their own document and never the Pass fields; only the server's service account can set them.
6. On each visit `pass-status` confirms the Pass and only then sends the Pass routes' footage, so changing anything in the browser console can't unlock it.

Secrets (Razorpay key secret, webhook secret, Firebase service account) live only in Netlify's environment variables. The functions use no npm packages.

| Netlify environment variable | Where it comes from |
|---|---|
| `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET` | Razorpay → Account & Settings → API Keys |
| `RAZORPAY_WEBHOOK_SECRET` | The secret you type when adding the webhook in Razorpay |
| `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` | Firebase → Project settings → Service accounts → Generate new private key |

## Footage credits

Window footage belongs to the YouTube creators who filmed it. It plays in YouTube's own player, and the creator's name is shown on the window with a link to the full video.

Made by Prachi Purohit · 2026
