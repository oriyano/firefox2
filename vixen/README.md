# Building Vixen on Windows

Vixen is built from this Firefox source tree with its own branding and build settings.

## One-time setup

1. Use Windows 10 or 11 (x64) with at least 16 GB RAM and 60 GB free disk on an SSD.
2. Install [Visual Studio 2022](https://visualstudio.microsoft.com/) (Community is fine) with the
   "Desktop development with C++" workload, the latest Windows 11 SDK, and the
   "Windows App SDK C++ Templates" component (needed later for the WinUI 3 shell).
3. Install [MozillaBuild](https://wiki.mozilla.org/MozillaBuild) to `C:\mozilla-build`.
4. Add Microsoft Defender exclusions for `C:\mozilla-build` and your source folder; scanning slows the build a lot.
5. Open `C:\mozilla-build\start-shell.bat` and clone the repository into a short path:

   ```
   cd /c
   git clone https://github.com/oriyano/firefox2 vixen-src
   cd vixen-src
   ```

6. Run `./mach bootstrap` and choose "Firefox for Desktop". It installs the Rust, clang and
   other toolchains the build needs.

7. Optional, for phishing and malware warnings: create a Google Safe Browsing API key
   (see below) and save it, alone on one line, to `~/.vixen-keys/google-safebrowsing.key`
   (in Windows, `C:\Users\<you>\.vixen-keys\google-safebrowsing.key`). The mozconfigs pick it
   up automatically. Never commit this file. Without it, Vixen builds but shows no warnings.

### Getting a Safe Browsing key

1. Sign in at the [Google Cloud console](https://console.cloud.google.com/) and create a project.
2. Under "APIs & Services" > "Library", enable the "Safe Browsing API".
3. Under "APIs & Services" > "Credentials", choose "Create credentials" > "API key".
4. Edit the key: under "API restrictions", restrict it to the Safe Browsing API.

Google allows this key for non-commercial use only. A commercial release needs Google's Web Risk API instead.

## Building

```
export MOZCONFIG=$PWD/vixen/mozconfig.win64-dev
./mach build
./mach run
```

The first build takes about 1 to 2 hours; later builds only recompile what changed.

For a hardened, optimized build use `vixen/mozconfig.win64-release` instead. It is much slower
because of link-time optimization.

To make a portable zip: `./mach package` (output in `obj-vixen-*/dist/`).
To make a setup .exe from that zip (output in `obj-vixen-*/dist/`):

```
ZIP_IN=$PWD/obj-vixen-dev/dist/vixen-<version>.en-US.win64.zip ./mach build -C browser/installer/windows installer
```

The installer is not code-signed yet, so Windows SmartScreen will warn when it runs.

## What the build settings change

- Vixen name and branding (`browser/branding/vixen`), and a separate profile folder so Vixen
  never touches an existing Firefox profile.
- Removed: crash reporter, Mozilla updater and maintenance service, default-browser agent,
  background update agent, and DRM (Encrypted Media Extensions).
- Off and locked: all telemetry, Glean and usage uploads, studies and experiments (Normandy,
  Nimbus), extension and feature recommendations, and the New Tab stories feed, sponsored
  tiles and New Tab analytics (`browser/branding/vixen/pref/firefox-branding.js`).
- Also off and locked: Firefox Suggest, the New Tab weather widget, region lookup, Web Push,
  OpenH264 codec downloads, system add-on updates, add-on metadata lookups, captive portal and
  connectivity checks, local AI models and Firefox Labs. Remote Settings (blocklists and
  certificate revocation) stays on for security.
- The health report and Normandy are no longer built (`browser/moz.configure`).
- All AI features are blocked and the AI Controls page is hidden: chatbot, Smart Window, link
  previews, smart tab groups, PDF alt text, translations and speech recognition.
- Only Google and DuckDuckGo are offered as search engines (`browser.search.engineAllowlist`),
  and sites, users and extensions can't add others.

The Vixen logo is generated into `browser/branding/vixen` (app icons, Windows tiles, installer
art, New Tab and About logo). The private-browsing and macOS icons are still placeholders.

## Settings Lock

Settings Lock is at the top of the first Settings page (Account & Sync). Turning it on or off
shows a Windows administrator prompt and writes or removes the `SettingsLock` policy
(`HKLM\SOFTWARE\Policies\Mozilla\Vixen`, DWORD 1); it takes effect after a restart. While it
is on, every settings control is disabled, `about:config` is blocked, and extensions can't be
installed. An administrator can also set the same registry value directly, for example via
Group Policy. Editing `prefs.js` or `user.js` in the profile folder is not blocked yet.

## Vixen Shield

A switch at the top of Privacy & Security (`vixen.shield.enabled`). When on, `VixenShield.sys.mjs`
changes the default values of a set of hardening prefs: HTTPS-Only mode, strict certificate
pinning and OCSP, mixed-content blocking, no JavaScript/WebAssembly JIT, punycode for
look-alike domains, blocked notification requests, WebRTC IP protection, trimmed cross-site
referrers and no PDF scripting. It also turns on DNS over HTTPS with no plain-DNS fallback,
SameSite=Lax cookies by default, fingerprinting protection, tracking and social-tracker blocking,
query-parameter stripping, Global Privacy Control, a prompt before opening new download types,
no WebRTC host candidates, blocking local-network access from trackers, and stricter TLS (safe
renegotiation required, no 0-RTT). Settings the user changed explicitly keep their value.

Always on, with or without Shield: CSP, SRI, CORS, Trusted Types, frame-ancestors and
X-Frame-Options, COOP/COEP, active mixed-content blocking, cookie prefixes, local network
access prompts, CRLite and Certificate Transparency enforcement, Safe Browsing (with a key) and
enterprise policies.
