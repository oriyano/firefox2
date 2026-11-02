/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

/**
 * Vixen ships without machine-learning field detection, so autofill relies on
 * its regular rules only.
 */
export class FormAutofillML {
  static getModelVersion() {
    return "";
  }

  async isModelInstalled() {
    return false;
  }

  async detectFields() {}
}
