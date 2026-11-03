"""Make one landing page per route (for example kalka-shimla.html) from index.html.

Each page is the full Window Safar ride with that route already chosen, plus its own
title, description and WhatsApp/Google preview image. Also rewrites sitemap.xml.

Run from the site folder after changing index.html or tools/route-pages.json:
    python3 tools/make_route_pages.py
"""
import json, html, re, datetime, pathlib

SITE = "https://windowsafar.com/"
root = pathlib.Path(__file__).resolve().parent.parent
routes = json.loads((root / "tools/route-pages.json").read_text(encoding="utf-8"))
index = (root / "index.html").read_text(encoding="utf-8")

def swap(s, pattern, new):
    s2, n = re.subn(pattern, lambda m: new, s, count=1, flags=re.S)
    assert n == 1, pattern
    return s2

for r in routes:
    name = r["name"]; plain = name.replace("→", "to")
    title = f"{name} train from your window seat · Window Safar"
    desc = (f"Ride the {plain} train from your desk: real window footage, live weather at all "
            f"{r['n']} stations, {r['curt']} curtains, chai on your table and a stamp at every station.")
    intro = (f"Ride the {plain} train from your desk. {r['blurb']} "
             f"{r['n']} stations, live weather at each one, {r['curt']} curtains from {r['place']}, and a stamp at every station.")
    url = SITE + r["slug"] + ".html"; img = SITE + "photos/routes/og-" + r["slug"] + ".jpg"
    e = lambda x: html.escape(x, quote=True)
    p = index
    p = swap(p, r"<title>.*?</title>", f"<title>{e(title)}</title>")
    p = swap(p, r'<meta name="description" content="[^"]*">', f'<meta name="description" content="{e(desc)}">')
    p = swap(p, r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{e(name)} · ride it from your desk">')
    p = swap(p, r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{e(desc)}">')
    p = swap(p, r'<meta property="og:url" content="[^"]*">', f'<meta property="og:url" content="{url}">')
    p = swap(p, r'<meta property="og:image" content="[^"]*">', f'<meta property="og:image" content="{img}">')
    p = swap(p, r'<meta property="og:image:alt" content="[^"]*">', f'<meta property="og:image:alt" content="A train window on the {e(plain)} route framed by {e(r["curt"])} curtains">')
    p = swap(p, r'<meta name="twitter:image" content="[^"]*">', f'<meta name="twitter:image" content="{img}">')
    p = swap(p, r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{url}">')
    p = swap(p, r'(<p data-i18n="heroP">).*?(</p>)', f'<p data-i18n="heroP">{e(intro)}</p>')
    p = swap(p, r'<script src="js/settings.js"></script>', f'<script>window.WS_ROUTE="{r["id"]}";</script>\n<script src="js/settings.js"></script>')
    (root / (r["slug"] + ".html")).write_text(p, encoding="utf-8")
    print("wrote", r["slug"] + ".html")

today = datetime.date.today().isoformat()
pages = [("", "1.0")] + [(r["slug"] + ".html", "0.9") for r in routes] + \
        [(x, "0.5") for x in ("about.html", "contact.html", "disclosure.html", "privacy.html")]
xml = ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for path, pr in pages:
    xml.append(f"  <url><loc>{SITE}{path}</loc><lastmod>{today}</lastmod><priority>{pr}</priority></url>")
xml.append("</urlset>")
(root / "sitemap.xml").write_text("\n".join(xml) + "\n", encoding="utf-8")
print("wrote sitemap.xml with", len(pages), "pages")
