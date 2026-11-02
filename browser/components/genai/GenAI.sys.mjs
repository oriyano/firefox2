/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

function hide(item) {
  if (item) {
    item.hidden = true;
  }
}

/**
 * The AI chatbot is not part of Vixen. Its menus and settings never show.
 */
export const GenAI = {
  canOfferChatbot: false,
  chatProviders: new Map(),
  currentChatProviderInfo: { iconUrl: "", name: "" },

  init() {},
  canTurnOnSelectionMenu() {
    return false;
  },
  async buildAskChatMenu(menu) {
    hide(menu);
  },
  async buildTabMenu(menu) {
    hide(menu);
    if (menu?.nextElementSibling?.localName == "menuseparator") {
      hide(menu.nextElementSibling);
    }
  },
  async buildTabSummarizeItem(item) {
    hide(item);
  },
  initializeSelectionShortcutPanel() {},
  markSelectionCalloutSeen() {},
  async summarizeCurrentPage() {},
  turnOnSelectionMenu() {},
};
