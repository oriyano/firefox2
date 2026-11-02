/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this file,
 * You can obtain one at http://mozilla.org/MPL/2.0/. */

import { Preferences } from "chrome://global/content/preferences/Preferences.mjs";
import { SettingGroupManager } from "chrome://browser/content/preferences/config/SettingGroupManager.mjs";

Preferences.addAll([{ id: "vixen.shield.enabled", type: "bool" }]);

Preferences.addSetting({
  id: "vixenShieldEnabled",
  pref: "vixen.shield.enabled",
});

SettingGroupManager.registerGroups({
  vixenShield: {
    l10nId: "vixen-shield-header",
    headingLevel: 2,
    items: [
      {
        id: "vixenShieldEnabled",
        l10nId: "vixen-shield-enabled",
        control: "moz-toggle",
      },
    ],
  },
});
