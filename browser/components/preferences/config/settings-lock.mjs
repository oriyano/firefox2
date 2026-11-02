/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Preferences } from "chrome://global/content/preferences/Preferences.mjs";
import { SettingGroupManager } from "chrome://browser/content/preferences/config/SettingGroupManager.mjs";

const { AppConstants } = ChromeUtils.importESModule(
  "resource://gre/modules/AppConstants.sys.mjs"
);

const POLICY_NAME = "SettingsLock";
const LOCK_GROUP_ID = "settingsLock";

function policyKeyPath() {
  return `SOFTWARE\\Policies\\Mozilla\\${Services.appinfo.name}`;
}

/**
 * Whether the lock is active in this session (applied at startup from the
 * machine-wide policy).
 */
function isLockActive() {
  return !!Services.policies.getActivePolicies()?.[POLICY_NAME];
}

/**
 * Whether the machine-wide registry currently asks for the lock. This can
 * differ from isLockActive() until Vixen restarts.
 */
function isLockRequested() {
  if (AppConstants.platform != "win") {
    return false;
  }
  let key = Cc["@mozilla.org/windows-registry-key;1"].createInstance(
    Ci.nsIWindowsRegKey
  );
  try {
    key.open(
      Ci.nsIWindowsRegKey.ROOT_KEY_LOCAL_MACHINE,
      policyKeyPath(),
      Ci.nsIWindowsRegKey.ACCESS_READ | Ci.nsIWindowsRegKey.WOW64_64
    );
  } catch (e) {
    return false;
  }
  try {
    return (
      key.hasValue(POLICY_NAME) &&
      key.getValueType(POLICY_NAME) == Ci.nsIWindowsRegKey.TYPE_INT &&
      key.readIntValue(POLICY_NAME) == 1
    );
  } catch (e) {
    return false;
  } finally {
    key.close();
  }
}

/**
 * Writes or removes the machine-wide policy through an elevated reg.exe, so
 * Windows shows an administrator (UAC) prompt.
 *
 * @param {boolean} enable
 * @returns {Promise<void>} Resolves once the elevated process has exited.
 */
function setLockRequested(enable) {
  let system32 = Services.dirsvc.get("SysD", Ci.nsIFile);
  let powershell = system32.clone();
  powershell.append("WindowsPowerShell");
  powershell.append("v1.0");
  powershell.append("powershell.exe");
  let regArgs = enable
    ? `'add','HKLM\\${policyKeyPath()}','/v','${POLICY_NAME}','/t','REG_DWORD','/d','1','/f'`
    : `'delete','HKLM\\${policyKeyPath()}','/v','${POLICY_NAME}','/f'`;
  let command =
    "Start-Process -FilePath reg.exe -Verb RunAs -Wait -WindowStyle Hidden " +
    `-ArgumentList ${regArgs}`;
  let process = Cc["@mozilla.org/process/util;1"].createInstance(Ci.nsIProcess);
  process.init(powershell);
  process.startHidden = true;
  return new Promise(resolve => {
    process.runwAsync(
      ["-NoProfile", "-NonInteractive", "-Command", command],
      4,
      { observe: () => resolve() }
    );
  });
}

function restartBrowser() {
  let cancelQuit = Cc["@mozilla.org/supports-PRBool;1"].createInstance(
    Ci.nsISupportsPRBool
  );
  Services.obs.notifyObservers(
    cancelQuit,
    "quit-application-requested",
    "restart"
  );
  if (!cancelQuit.data) {
    Services.startup.quit(
      Ci.nsIAppStartup.eAttemptQuit | Ci.nsIAppStartup.eRestart
    );
  }
}

/**
 * Makes every settings control except the lock itself unusable while the
 * lock is active.
 */
function applyLockToPage() {
  let root = document.getElementById("mainPrefPane");
  if (!root) {
    return;
  }
  document.documentElement.setAttribute("settings-locked", "true");
  let lockAll = () => {
    for (let el of root.querySelectorAll("setting-group, groupbox")) {
      if (el.getAttribute("groupid") != LOCK_GROUP_ID) {
        el.inert = true;
      }
    }
  };
  lockAll();
  new MutationObserver(lockAll).observe(root, {
    childList: true,
    subtree: true,
  });
}

Preferences.addSetting({
  id: "settingsLockStatus",
  visible: () => AppConstants.platform == "win",
  getControlConfig: config => {
    let active = isLockActive();
    let requested = isLockRequested();
    let l10nId = "vixen-settings-lock-off";
    if (active && requested) {
      l10nId = "vixen-settings-lock-on";
    } else if (requested) {
      l10nId = "vixen-settings-lock-pending-on";
    } else if (active) {
      l10nId = "vixen-settings-lock-pending-off";
    }
    return { ...config, l10nId };
  },
});

Preferences.addSetting({
  id: "settingsLockToggle",
  visible: () => AppConstants.platform == "win",
  getControlConfig: config => ({
    ...config,
    l10nId: isLockRequested()
      ? "vixen-settings-lock-turn-off"
      : "vixen-settings-lock-turn-on",
  }),
  onUserClick: async (e, _deps, setting) => {
    let button = e.target;
    button.disabled = true;
    try {
      await setLockRequested(!isLockRequested());
    } finally {
      button.disabled = false;
    }
    setting.emit("change");
    Preferences.getSetting("settingsLockStatus")?.emit("change");
    Preferences.getSetting("settingsLockRestart")?.emit("change");
  },
});

Preferences.addSetting({
  id: "settingsLockRestart",
  visible: () =>
    AppConstants.platform == "win" && isLockActive() != isLockRequested(),
  onUserClick: () => restartBrowser(),
});

SettingGroupManager.registerGroups({
  [LOCK_GROUP_ID]: {
    l10nId: "vixen-settings-lock-header",
    headingLevel: 2,
    items: [
      {
        id: "settingsLockStatus",
        control: "moz-message-bar",
        controlAttrs: { role: "status" },
      },
      {
        id: "settingsLockToggle",
        control: "moz-button",
      },
      {
        id: "settingsLockRestart",
        l10nId: "vixen-settings-lock-restart",
        control: "moz-button",
        controlAttrs: { type: "primary" },
      },
    ],
  },
});

if (isLockActive()) {
  applyLockToPage();
}
