/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

const ENABLED_PREF = "vixen.shield.enabled";

/**
 * Hardened values applied to the default pref branch while Vixen Shield is
 * on. Values the user changed explicitly still win.
 */
const HARDENED_PREFS = {
  // HTTPS enforcement.
  "dom.security.https_only_mode": true,
  "dom.security.https_only_mode_send_http_background_request": false,
  "security.mixed_content.block_display_content": true,
  "security.cert_pinning.enforcement_level": 2,
  "security.OCSP.require": true,
  // Exploit mitigation: no JavaScript or WebAssembly JIT.
  "javascript.options.baselinejit": false,
  "javascript.options.ion": false,
  "javascript.options.native_regexp": false,
  "javascript.options.wasm_baselinejit": false,
  "javascript.options.wasm_optimizingjit": false,
  // Phishing: show internationalized domain names as punycode.
  "network.IDN_show_punycode": true,
  // Website permissions and cross-site leaks.
  "permissions.default.desktop-notification": 2,
  "media.peerconnection.ice.default_address_only": true,
  "network.http.referer.XOriginTrimmingPolicy": 2,
  "pdfjs.enableScripting": false,
  // Extensions.
  "extensions.quarantinedDomains.enabled": true,
  // TLS and certificates.
  "security.ssl.require_safe_negotiation": true,
  "security.tls.enable_0rtt_data": false,
  // Encrypted DNS only (DNS over HTTPS, no fallback to plain DNS).
  "network.trr.mode": 3,
  // Cookies and cross-site request forgery.
  "network.cookie.sameSite.laxByDefault": true,
  "network.cookie.cookieBehavior": 5,
  // Downloads: always ask before opening new file types.
  "browser.download.always_ask_before_handling_new_types": true,
  // Local network access from known trackers.
  "network.lna.block_trackers": true,
  // WebRTC: never expose local IP addresses.
  "media.peerconnection.ice.no_host": true,
  // Tracking and fingerprinting.
  "privacy.fingerprintingProtection": true,
  "privacy.trackingprotection.enabled": true,
  "privacy.trackingprotection.socialtracking.enabled": true,
  "privacy.query_stripping.enabled": true,
  "privacy.globalprivacycontrol.enabled": true,
};

const savedDefaults = new Map();

function readDefault(branch, name) {
  switch (branch.getPrefType(name)) {
    case branch.PREF_BOOL:
      return branch.getBoolPref(name);
    case branch.PREF_INT:
      return branch.getIntPref(name);
    case branch.PREF_STRING:
      return branch.getStringPref(name);
  }
  return undefined;
}

function writeDefault(branch, name, value) {
  if (typeof value == "boolean") {
    branch.setBoolPref(name, value);
  } else if (typeof value == "number") {
    branch.setIntPref(name, value);
  } else {
    branch.setStringPref(name, value);
  }
}

function apply() {
  let branch = Services.prefs.getDefaultBranch("");
  let enabled = Services.prefs.getBoolPref(ENABLED_PREF, false);
  for (let [name, value] of Object.entries(HARDENED_PREFS)) {
    if (!savedDefaults.has(name)) {
      savedDefaults.set(name, readDefault(branch, name));
    }
    let target = enabled ? value : savedDefaults.get(name);
    if (target !== undefined) {
      writeDefault(branch, name, target);
    }
  }
}

export const VixenShield = {
  HARDENED_PREFS,

  init() {
    apply();
    Services.prefs.addObserver(ENABLED_PREF, apply);
  },
};
