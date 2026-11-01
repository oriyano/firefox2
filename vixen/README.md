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

The icons in `browser/branding/vixen` are still the generic unofficial-build placeholders and
need to be replaced with Vixen artwork.
