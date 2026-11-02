/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Smart Window is not part of Vixen; its menu items never show.
 */
export class AIWindowMenu {
  static canShowAITabMenu() {
    return false;
  }

  addMenuitems() {}
}
