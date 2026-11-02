/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Smart Window is not part of Vixen, so there are no stored chats.
 */
export const ChatStore = {
  async findRecentConversations() {
    return [];
  },
  async deleteConversationsByDateRange() {},
  async deleteAllConversations() {},
};
