/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Smart Window is not part of Vixen. Every check reports it as unavailable.
 */
export const AIWindow = {
  isBlocked: true,
  isEnabled: false,
  isAvailable: false,
  isDefaultWindow: false,
  chatStore: null,
  newTabURL: "about:newtab",
  initialStartupURL: "about:home",

  isAIWindowActive() {
    return false;
  },
  isAIWindowEnabled() {
    return false;
  },
  isAIWindowActiveAndEnabled() {
    return false;
  },
  isOpeningAIWindow() {
    return false;
  },
  isAIWindowContentPage() {
    return false;
  },
  isAIWindowNewTabPage() {
    return false;
  },
  hasActiveAIWindows() {
    return false;
  },
  shouldOpenAsSmartWindow() {
    return false;
  },
  shouldUseImmersiveView() {
    return false;
  },
  getChatTabConversationId() {
    return null;
  },
  getSmartbarForWindow() {
    return null;
  },
  handleAIWindowOptions({ args } = {}) {
    return args;
  },
  appMenu() {},
  createAITab() {},
  launchWindow() {},
  recordOpenWindowTelemetry() {},
  toggleAIWindow() {},
  updateImmersiveView() {},
};
