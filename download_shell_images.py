#!/usr/bin/env python3
"""
Mod Machine — Shell & Button Image Downloader
=============================================
Run this script once from the same folder as pixel-surgery-editorial.html.
It downloads product images from eXtremeRate and HHL, saves them to
images/shells/ with filenames matching the site's shell IDs.

Usage:
    pip install requests beautifulsoup4
    python download_shell_images.py

Images land in ./images/shells/[id].jpg — the HTML references these paths.
The placeholder SVGs are overridden once real images exist.
"""

import os, sys, time, re
import requests
from bs4 import BeautifulSoup
from pathlib import Path

OUT_DIR = Path("images/shells")
OUT_DIR.mkdir(parents=True, exist_ok=True)

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/124.0.0.0 Safari/537.36",
    "Accept": "image/avif,image/webp,image/apng,*/*;q=0.8",
}

BASE = "https://www.extremerate.com"

# ── DIRECT CDN URLs ──────────────────────────────────────────────────────────
# These were confirmed from collection pages — no page scrape needed.
DIRECT = {

    # ── GBA (Game Boy Advance) ───────────────────────────────────────────────
    "gba-carbon":
        f"{BASE}/cdn/shop/files/eXtremeRateIPSReadyUpgradedGBAReplacementFullSetShellswithButtonsforGameboyAdvance-GraphiteCarbonFiber-1.jpg",
    "gba-black":
        f"{BASE}/cdn/shop/files/eXtremeRateIPSReadyUpgradedGBAReplacementFullSetShellswithBlackButtonsforGameboyAdvance-1.jpg",
    "gba-white":
        f"{BASE}/cdn/shop/products/TAGP3008-_7.jpg",       # white + gray buttons
    "gba-champ-pb":
        f"{BASE}/cdn/shop/products/TAGP3001-_7.jpg",
    "gba-champ-gp":
        f"{BASE}/cdn/shop/files/eXtremeRateIPSReadyUpgradedGBAReplacementFullSetShellswithButtonsforGameboyAdvance-ChameleonGreenPurple-1.jpg",
    "gba-scarlet":
        f"{BASE}/cdn/shop/products/TAGP3003-_1.jpg",
    "gba-cherry-blossom":
        f"{BASE}/cdn/shop/products/TAGP3012-_7.jpg",
    "gba-glow-green":
        f"{BASE}/cdn/shop/files/eXtremeRateIPSReadyUpgradedGBAReplacementFullSetShellswithButtonsforGameboyAdvance-GlowinDark-Green-1.jpg",
    "gba-clear":
        f"{BASE}/cdn/shop/products/TAGM5001-_1.jpg",
    "gba-clr-black":
        f"{BASE}/cdn/shop/files/eXtremeRateIPSReadyUpgradedClearBlackGBAReplacementShellFullHousingCoverButtons_WhiteScreenLensforGameboyAdvance-1.jpg",

    # ── GBA SP (Advance SP) ──────────────────────────────────────────────────
    "sp-classic-fc":
        f"{BASE}/cdn/shop/files/eXtremeRateIPSReadyUpgradedReplacementFullSetShellswithButtonsforGameboyAdvanceSP-ClassicFCStyle-1.jpg",
    "sp-classic-snes":
        f"{BASE}/cdn/shop/products/ASPY001-_1.jpg",
    "sp-classic-dmg":
        f"{BASE}/cdn/shop/products/ASPY003-_1.jpg",
    "sp-classic-sfc":
        f"{BASE}/cdn/shop/products/ASPY004-_1.jpg",
    "sp-classic-nes":
        f"{BASE}/cdn/shop/products/ASPY005-_1.jpg",
    "sp-monster":
        f"{BASE}/cdn/shop/files/MonsterIndexConsoleStyleIPSReadyUpgradedReplacementHousingShellforGameboyAdvanceSPGBASP-1.jpg",
    "sp-black":
        f"{BASE}/cdn/shop/products/ASPP3005-_1.jpg",
    "sp-white":
        f"{BASE}/cdn/shop/products/ASPP3002-_1.jpg",

    # ── GBC (Game Boy Color) ─────────────────────────────────────────────────
    "gbc-black":
        f"{BASE}/cdn/shop/products/QCBP3013-_7.jpg",
}

# ── PRODUCT PAGE URLs ────────────────────────────────────────────────────────
# Script fetches og:image from each page to get the CDN URL, then downloads.
PAGES = {

    # ── GBA remaining ────────────────────────────────────────────────────────
    "gba-clr-atomic":
        f"{BASE}/products/ips-ready-upgraded-extremerate-clear-atomic-purple-gba-replacement-shell-full-housing-cover-buttons-for-gameboy-advance-compatible-with-both-ips-standard-lcd-console-ips-screen-not-included-tagm5005",
    "gba-clr-cherry-pink":
        f"{BASE}/products/extremerate-ips-ready-upgraded-gba-replacement-full-set-shells-with-buttons-for-gameboy-advance-compatible-with-both-ips-standard-lcd-clear-cherry-pink",

    # ── GBA SP remaining ─────────────────────────────────────────────────────
    "sp-gold":
        f"{BASE}/products/extremerate-ips-ready-upgraded-replacement-full-set-shells-with-buttons-for-gameboy-advance-sp-gba-sp-compatible-with-both-ips-standard-lcd-chrome-gold",
    "sp-champ-pb":
        f"{BASE}/products/extremerate-ips-ready-upgraded-replacement-full-set-shells-with-buttons-for-gameboy-advance-sp-gba-sp-compatible-with-both-ips-standard-lcd-chameleon-purple-blue",
    "sp-scarlet":
        f"{BASE}/products/extremerate-ips-ready-upgraded-replacement-full-set-shells-with-buttons-for-gameboy-advance-sp-gba-sp-compatible-with-both-ips-standard-lcd-scarlet-red",
    "sp-cherry-blossom":
        f"{BASE}/products/extremerate-ips-ready-upgraded-replacement-full-set-shells-with-buttons-for-gameboy-advance-sp-gba-sp-compatible-with-both-ips-standard-lcd-cherry-blossoms-pink",
    "sp-clear":
        f"{BASE}/products/extremerate-ips-ready-upgraded-replacement-full-set-shells-with-buttons-for-gameboy-advance-sp-gba-sp-compatible-with-both-ips-standard-lcd-clear",
    "sp-glacier":
        f"{BASE}/products/extremerate-ips-ready-upgraded-replacement-full-set-shells-with-buttons-for-gameboy-advance-sp-gba-sp-compatible-with-both-ips-standard-lcd-glacier-blue",
    "sp-clr-atomic":
        f"{BASE}/products/ips-ready-upgraded-extremerate-clear-atomic-purple-custom-replacement-housing-shell-for-gameboy-advance-sp-gba-sp-compatible-with-both-ips-standard-lcd-console-screen-not-included-aspm5005",
    "sp-clr-blue":
        f"{BASE}/products/extremerate-ips-ready-upgraded-replacement-full-set-shells-with-buttons-for-gameboy-advance-sp-gba-sp-compatible-with-both-ips-standard-lcd-clear-blue",
    "sp-clr-emerald":
        f"{BASE}/products/extremerate-ips-ready-upgraded-replacement-full-set-shells-with-buttons-for-gameboy-advance-sp-gba-sp-compatible-with-both-ips-standard-lcd-clear-emerald-green",
    "sp-clr-cherry-pink":
        f"{BASE}/products/extremerate-ips-ready-upgraded-replacement-full-set-shells-with-buttons-for-gameboy-advance-sp-gba-sp-compatible-with-both-ips-standard-lcd-clear-cherry-pink",
    "sp-clr-black":
        f"{BASE}/products/extremerate-ips-ready-upgraded-replacement-full-set-shells-with-buttons-for-gameboy-advance-sp-gba-sp-compatible-with-both-ips-standard-lcd-clear-black",
    "sp-clr-glow":
        f"{BASE}/products/extremerate-ips-ready-upgraded-replacement-full-set-shells-with-buttons-for-gameboy-advance-sp-gba-sp-compatible-with-both-ips-standard-lcd-clear-glow-in-the-dark",
    "sp-matcha":
        f"{BASE}/products/extremerate-ips-ready-upgraded-replacement-full-set-shells-with-buttons-for-gameboy-advance-sp-gba-sp-compatible-with-both-ips-standard-lcd-matcha-green",
    "sp-passion-red":
        f"{BASE}/products/extremerate-ips-ready-upgraded-replacement-full-set-shells-with-buttons-for-gameboy-advance-sp-gba-sp-compatible-with-both-ips-standard-lcd-passion-red-white",
    "sp-champ-gp":
        f"{BASE}/products/extremerate-ips-ready-upgraded-replacement-full-set-shells-with-buttons-for-gameboy-advance-sp-gba-sp-compatible-with-both-ips-standard-lcd-chameleon-green-purple",

    # ── GBC all shells ───────────────────────────────────────────────────────
    "gbc-nes":
        f"{BASE}/products/extremerate-ips-ready-upgraded-gbc-replacement-full-set-shells-with-buttons-for-gameboy-color-compatible-with-gbc-osd-ips-regular-ips-standard-lcd-classic-nes",
    "gbc-champ-pb":
        f"{BASE}/products/extremerate-ips-ready-upgraded-gbc-replacement-full-set-shells-with-buttons-for-gameboy-color-compatible-with-gbc-osd-ips-regular-ips-standard-lcd-chameleon-purple-blue",
    "gbc-scarlet":
        f"{BASE}/products/extremerate-ips-ready-upgraded-gbc-replacement-full-set-shells-with-buttons-for-gameboy-color-compatible-with-gbc-osd-ips-regular-ips-standard-lcd-scarlet-red",
    "gbc-gold":
        f"{BASE}/products/extremerate-ips-ready-upgraded-gbc-replacement-full-set-shells-with-buttons-for-gameboy-color-compatible-with-gbc-osd-ips-regular-ips-standard-lcd-chrome-gold",
    "gbc-white":
        f"{BASE}/products/extremerate-ips-ready-upgraded-gbc-replacement-full-set-shells-with-buttons-for-gameboy-color-compatible-with-gbc-osd-ips-regular-ips-standard-lcd-white",
    "gbc-gray":
        f"{BASE}/products/extremerate-ips-ready-upgraded-gbc-replacement-full-set-shells-with-buttons-for-gameboy-color-compatible-with-gbc-osd-ips-regular-ips-standard-lcd-classic-gray",
    "gbc-purple":
        f"{BASE}/products/extremerate-ips-ready-upgraded-gbc-replacement-full-set-shells-with-buttons-for-gameboy-color-compatible-with-gbc-osd-ips-regular-ips-standard-lcd-purple",
    "gbc-cherry-blossom":
        f"{BASE}/products/extremerate-ips-ready-upgraded-gbc-replacement-full-set-shells-with-buttons-for-gameboy-color-compatible-with-gbc-osd-ips-regular-ips-standard-lcd-cherry-blossoms-pink",
    "gbc-clear":
        f"{BASE}/products/ips-ready-upgraded-extremerate-transparent-clear-replacement-shell-full-housing-cover-buttons-for-gameboy-color-fit-for-gbc-osd-ips-regular-ips-standard-lcd-console-ips-screen-not-included-qcbm5001",
    "gbc-clr-cherry-pink":
        f"{BASE}/products/extremerate-ips-ready-upgraded-gbc-replacement-full-set-shells-with-buttons-for-gameboy-color-compatible-with-gbc-osd-ips-regular-ips-standard-lcd-clear-cherry-pink",
    "gbc-clr-atomic":
        f"{BASE}/products/ips-ready-upgraded-extremerate-clear-atomic-purple-replacement-shell-full-housing-cover-buttons-for-gameboy-color-fit-for-gbc-osd-ips-regular-ips-standard-lcd-console-ips-screen-not-included-qcbm5005",
    "gbc-glacier":
        f"{BASE}/products/ips-ready-upgraded-extremerate-glacier-blue-replacement-shell-full-housing-cover-buttons-for-gameboy-color-fit-for-gbc-osd-ips-regular-ips-standard-lcd-console-ips-screen-not-included-qcbm5006",
    "gbc-clr-red":
        f"{BASE}/products/ips-ready-upgraded-extremerate-transparent-clear-red-replacement-shell-full-housing-cover-buttons-for-gameboy-color-fit-for-gbc-osd-ips-regular-ips-standard-lcd-console-ips-screen-not-included-qcbm5002",
    "gbc-bluebell":
        f"{BASE}/products/extremerate-ips-ready-upgraded-gbc-replacement-full-set-shells-with-buttons-for-gameboy-color-compatible-with-gbc-osd-ips-regular-ips-standard-lcd-gradient-translucent-bluebell",
    "gbc-grn-blue":
        f"{BASE}/products/extremerate-ips-ready-upgraded-gbc-replacement-full-set-shells-with-buttons-for-gameboy-color-compatible-with-gbc-osd-ips-regular-ips-standard-lcd-gradient-translucent-green-blue",
    "gbc-wood":
        f"{BASE}/products/extremerate-ips-ready-upgraded-gbc-replacement-full-set-shells-with-buttons-for-gameboy-color-compatible-with-gbc-osd-ips-regular-ips-standard-lcd-wood-grain",
    "gbc-wave":
        f"{BASE}/products/extremerate-ips-ready-upgraded-gbc-replacement-full-set-shells-with-buttons-for-gameboy-color-compatible-with-gbc-osd-ips-regular-ips-standard-lcd-the-great-wave",
    "gbc-glow":
        f"{BASE}/products/extremerate-ips-ready-upgraded-gbc-replacement-full-set-shells-with-buttons-for-gameboy-color-compatible-with-gbc-osd-ips-regular-ips-standard-lcd-glow-in-dark-green",
}

# ── Hispeedido DMG shells ────────────────────────────────────────────────────
# Sourced from HHL — all colors are variants of one product listing.
# The main product page cycles through all colors; we scrape the og:image
# for the first color and note that per-color photos need individual page grabs.
HHL_BASE = "https://handheldlegend.com"
DMG_PAGES = {
    "dmg-gray":      f"{HHL_BASE}/products/game-boy-dmg-laminated-ips-shell-hispeedido?variant=gray",
    "dmg-black":     f"{HHL_BASE}/products/game-boy-dmg-laminated-ips-shell-hispeedido?variant=black",
    "dmg-white":     f"{HHL_BASE}/products/game-boy-dmg-laminated-ips-shell-hispeedido?variant=white",
    "dmg-red":       f"{HHL_BASE}/products/game-boy-dmg-laminated-ips-shell-hispeedido?variant=red",
    "dmg-blue":      f"{HHL_BASE}/products/game-boy-dmg-laminated-ips-shell-hispeedido?variant=blue",
    "dmg-yellow":    f"{HHL_BASE}/products/game-boy-dmg-laminated-ips-shell-hispeedido?variant=yellow",
    "dmg-green":     f"{HHL_BASE}/products/game-boy-dmg-laminated-ips-shell-hispeedido?variant=green",
    "dmg-teal":      f"{HHL_BASE}/products/game-boy-dmg-laminated-ips-shell-hispeedido?variant=teal",
    "dmg-clear":     f"{HHL_BASE}/products/game-boy-dmg-laminated-ips-shell-hispeedido?variant=clear",
    "dmg-clr-black": f"{HHL_BASE}/products/game-boy-dmg-laminated-ips-shell-hispeedido?variant=clear-black",
    "dmg-clr-green": f"{HHL_BASE}/products/game-boy-dmg-laminated-ips-shell-hispeedido?variant=clear-green",
    "dmg-atomic":    f"{HHL_BASE}/products/game-boy-dmg-laminated-ips-shell-hispeedido?variant=atomic-purple",
    "dmg-midnight":  f"{HHL_BASE}/products/game-boy-dmg-laminated-ips-shell-hispeedido?variant=midnight-blue",
    "dmg-glow-blue": f"{HHL_BASE}/products/game-boy-dmg-laminated-ips-shell-hispeedido?variant=clear-blue-glow",
    "dmg-glow-mint": f"{HHL_BASE}/products/game-boy-dmg-laminated-ips-shell-hispeedido?variant=clear-mint-glow",
    "dmg-glow-sea":  f"{HHL_BASE}/products/game-boy-dmg-laminated-ips-shell-hispeedido?variant=clear-sea-green-glow",
    "dmg-clr-red":   f"{HHL_BASE}/products/game-boy-dmg-laminated-ips-shell-hispeedido?variant=clear-red",
    "dmg-clr-orange":f"{HHL_BASE}/products/game-boy-dmg-laminated-ips-shell-hispeedido?variant=clear-orange",
    "dmg-clr-dpink": f"{HHL_BASE}/products/game-boy-dmg-laminated-ips-shell-hispeedido?variant=clear-dark-pink",
    "dmg-lime":      f"{HHL_BASE}/products/game-boy-dmg-laminated-ips-shell-hispeedido?variant=lime-green",
    "dmg-sp-yellow": f"{HHL_BASE}/products/game-boy-dmg-laminated-ips-shell-hispeedido?variant=special-edition-yellow-gray",
}

# ── Helpers ──────────────────────────────────────────────────────────────────
session = requests.Session()
session.headers.update(HEADERS)

def get_og_image(url):
    """Fetch a product page and return the og:image URL."""
    try:
        r = session.get(url, timeout=15)
        r.raise_for_status()
        soup = BeautifulSoup(r.text, "html.parser")
        tag = soup.find("meta", property="og:image")
        if tag and tag.get("content"):
            img = tag["content"]
            # Strip size params that Shopify sometimes appends
            img = re.sub(r'\?.*$', '', img)
            return img
    except Exception as e:
        print(f"  ⚠ Page fetch failed: {e}")
    return None

def download(shell_id, url, ext="jpg"):
    """Download image URL to images/shells/<shell_id>.<ext>."""
    dest = OUT_DIR / f"{shell_id}.{ext}"
    if dest.exists():
        print(f"  ✓ {shell_id} — already exists, skipping")
        return True
    try:
        r = session.get(url, timeout=20, stream=True)
        r.raise_for_status()
        content_type = r.headers.get("content-type", "")
        # Detect actual extension
        if "png" in content_type:
            dest = OUT_DIR / f"{shell_id}.png"
        with open(dest, "wb") as f:
            for chunk in r.iter_content(8192):
                f.write(chunk)
        size_kb = dest.stat().st_size // 1024
        print(f"  ✓ {shell_id} — {size_kb} KB")
        return True
    except Exception as e:
        print(f"  ✗ {shell_id} — download failed: {e}")
        return False

# ── Main ──────────────────────────────────────────────────────────────────────
def main():
    print("=" * 60)
    print("  MOD MACHINE — Shell Image Downloader")
    print("=" * 60)

    total = 0
    ok    = 0
    failed = []

    # 1. Direct CDN URLs
    print(f"\n[1/3] Direct CDN downloads ({len(DIRECT)} images)")
    for shell_id, url in DIRECT.items():
        total += 1
        success = download(shell_id, url)
        if success: ok += 1
        else: failed.append(shell_id)
        time.sleep(0.3)

    # 2. eXtremeRate product pages
    print(f"\n[2/3] Page-scraped downloads ({len(PAGES)} images)")
    for shell_id, page_url in PAGES.items():
        total += 1
        print(f"  → Fetching {shell_id} from product page...")
        img_url = get_og_image(page_url)
        if img_url:
            success = download(shell_id, img_url)
            if success: ok += 1
            else: failed.append(shell_id)
        else:
            print(f"  ✗ {shell_id} — no og:image found on page")
            failed.append(shell_id)
        time.sleep(0.5)

    # 3. Hispeedido DMG (HHL)
    print(f"\n[3/3] Hispeedido DMG shells from HHL ({len(DMG_PAGES)} images)")
    print("  NOTE: HHL's color variants may redirect to the same base image.")
    print("  If colors look identical, manually navigate HHL and save each color.")
    for shell_id, page_url in DMG_PAGES.items():
        total += 1
        print(f"  → Fetching {shell_id}...")
        img_url = get_og_image(page_url)
        if img_url:
            success = download(shell_id, img_url)
            if success: ok += 1
            else: failed.append(shell_id)
        else:
            print(f"  ✗ {shell_id} — no og:image found")
            failed.append(shell_id)
        time.sleep(0.5)

    # Summary
    print("\n" + "=" * 60)
    print(f"  Done: {ok}/{total} images downloaded")
    if failed:
        print(f"  Failed ({len(failed)}): {', '.join(failed)}")
        print("\n  For failed items, manually download from the product page")
        print("  and save to images/shells/<id>.jpg")
    print("=" * 60)

if __name__ == "__main__":
    main()
