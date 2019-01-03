<img src="https://raw.githubusercontent.com/particl/copay/master/resources/copay/android/icon/drawable-xxxhdpi-icon.png" alt="Copay" width="79">

[![Build Status](https://secure.travis-ci.org/particl/copay.svg)](http://travis-ci.org/particl/copay)

Particl Copay is a secure particl wallet platform for both desktop and mobile devices. Copay uses [Bitcore Wallet Service](https://github.com/particl/bitcore-wallet-service) (BWS) for peer synchronization and network interfacing.

For a list of frequently asked questions please visit the [Copay FAQ](https://github.com/bitpay/copay/wiki/COPAY---FAQ).

## Main Features

- Bitcoin and Bitcoin Cash coin support
- Multiple wallet creation and management in-app
- Intuitive, multisignature security for personal or shared wallets
- Easy spending proposal flow for shared wallets and group payments
- [BIP32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki) Hierarchical deterministic (HD) address generation and wallet backups
- Device-based security: all private keys are stored locally, not in the cloud
- Support for Particl testnet wallets
- Synchronous access across all major mobile and desktop platforms
- Payment protocol (BIP70-BIP73) support: easily-identifiable payment requests and verifiable, secure bitcoin payments
- Support for over 150 currency pricing options and unit denomination in BTC or bits
- Mnemonic (BIP39) support for wallet backups
- Paper wallet sweep support (BIP38)
- Email notifications for payments and transfers
- Push notifications (only available for ios and android versions)
- Customizable wallet naming and background colors
- Multiple languages supported

## Testing in a Browser

> **Note:** This method should only be used for development purposes. When running Copay in a normal browser environment, browser extensions and other malicious code might have access to internal data and private keys. For production use, see the latest official [releases](https://github.com/particl/copay/releases/).

Clone the repo and open the directory:

```sh
git clone https://github.com/particl/copay.git
cd copay
```

Ensure you have [Node](https://nodejs.org/) installed, then install and start Copay:

```sh
npm install
npm run apply:copay
npm run start
```

Visit [`localhost:8100`](http://localhost:8100/) to view the app.

## Unit & E2E Tests (Karma & Protractor)

To run the tests, run:

```
 npm run test
```

## Testing on Real Devices

It's recommended that all final testing be done on a real device – both to assess performance and to enable features that are unavailable to the emulator (e.g. a device camera).

### Android

Follow the [Cordova Android Platform Guide](https://cordova.apache.org/docs/en/latest/guide/platforms/android/) to set up your development environment.

When your developement enviroment is ready, run the `start:android` package script.

```sh
npm run apply:copay
npm run prepare:copay
npm run start:android
```

### iOS

Follow the [Cordova iOS Platform Guide](https://cordova.apache.org/docs/en/latest/guide/platforms/ios/) to set up your development environment.

When your developement enviroment is ready, run the `start:ios` package script.

```sh
npm run apply:copay
npm run prepare:copay
npm run start:ios
```

### Windows Phone

Follow the [Cordova Windows Phone Platform Guide](https://cordova.apache.org/docs/en/latest/guide/platforms/win8/index.html) to set up your development environment.

When your developement enviroment is ready, follow this instructions:

- Go to app-template folder, search for config-template.xml and then remove this line:
```sh
<plugin name="cordova-plugin-qrscanner" spec="~2.5.0" />
```
and then enable this one:
```sh
<plugin name="phonegap-plugin-barcodescanner" spec="https://github.com/phonegap/phonegap-plugin-barcodescanner.git" />
```
- Run:
```sh
npm run clean-all
npm run apply:copay
npm run start:windows
```
- Then open the project file with VS inside cordova/platform/windows/

### Desktop (Linux, macOS, and Windows)

The desktop version of Copay currently uses Electron. To get started, first install Electron on your system from [the Electron website](https://electronjs.org/).

When Electron is installed, run the `start:desktop` package script.

```sh
npm run apply:copay
npm run start:desktop
```

## Build Copay App Bundles

Before building the release version for a platform, run the `clean-all` command to delete any untracked files in your current working directory. (Be sure to stash any uncommited changes you've made.) This guarantees consistency across builds for the current state of this repository.

The `final` commands build the production version of the app, and bundle it with the release version of the platform being built.

### Android

```sh
npm run clean-all
npm install
npm run apply:copay
npm run prepare:copay
npm run final:android
```

### iOS

```sh
npm run clean-all
npm install
npm run apply:copay
npm run prepare:copay
npm run final:ios
```

### Push Notifications

- Install Visual Studio 2015 (or newer)
- Go to app-template folder, search for config-template.xml and then remove this line:
```sh
<plugin name="cordova-plugin-qrscanner" spec="~2.5.0" />
```
and then enable this one:
```sh
<plugin name="phonegap-plugin-barcodescanner" spec="https://github.com/phonegap/phonegap-plugin-barcodescanner.git" />
```
- Run:
```sh
npm run clean-all
npm run apply:copay
npm run final:windows
```
- Then open the project file with VS inside cordova/platform/windows/

A current workaround is to comment out the line to prevent the removal of the file during the debug build (line 56 in platforms/ios/cordova/lib/copy-www-build-step.js).

[Source](https://github.com/phonegap/phonegap-plugin-push/issues/2518)

### Desktop (Linux, macOS, and Windows)

```sh
npm run clean-all
npm install
npm run apply:copay
npm run final:desktop
```

## Desktop Data Path

Per-user application data directory for Copay or BitPay distribution.

```sh
"~/Library/Containers/com.bitpay.copay.desktop2/Data/.copay"
# or
"~/Library/Containers/com.bitpay.wallet.desktop/Data/.bitpay"
```

## Configuration

### Enable External Services

To enable external services, set the `COPAY_EXTERNAL_SERVICES_CONFIG_LOCATION` or `BITPAY_EXTERNAL_SERVICES_CONFIG_LOCATION` environment variable to the location of your configuration before running the `apply` task.

```sh
COPAY_EXTERNAL_SERVICES_CONFIG_LOCATION="~/.copay/externalServices.json" npm run apply:copay
# or
BITPAY_EXTERNAL_SERVICES_CONFIG_LOCATION="~/.bitpay/externalServices.json" npm run apply:bitpay
```

## About Copay

### General

Copay implements a multisig wallet using [p2sh](https://en.bitcoin.it/wiki/Pay_to_script_hash) addresses. It supports multiple wallets, each with its own configuration, such as 3-of-5 (3 required signatures from 5 participant peers) or 2-of-3. To create a multisig wallet shared between multiple participants, Copay requires the extended public keys of all the wallet participants. Those public keys are then incorporated into the wallet configuration and combined to generate a payment address where funds can be sent into the wallet. Conversely, each participant manages their own private key and that private key is never transmitted anywhere.

To unlock a payment and spend the wallet's funds, a quorum of participant signatures must be collected and assembled in the transaction.  The funds cannot be spent without at least the minimum number of signatures required by the wallet configuration (2-of-3, 3-of-5, 6-of-6, etc.).  Once a transaction proposal is created, the proposal is distributed among the wallet participants for each to sign the transaction locally.  Finally, when the transaction is signed, the last signing participant will broadcast the transaction to the Particl network.

Copay also implements [BIP32](https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki) to generate new addresses for peers. The public key that each participant contributes to the wallet is a BIP32 extended public key. As additional public keys are needed for wallet operations (to produce new addresses to receive payments into the wallet, for example) new public keys can be derived from the participants' original extended public keys. Once again, it's important to stress that each participant keeps their own private keys locally - private keys are not shared - and are used to sign transaction proposals to make payments from the shared wallet.

For more information regarding how addresses are generated using this procedure, see: [Structure for Deterministic P2SH Multisignature Wallets](https://github.com/bitcoin/bips/blob/master/bip-0045.mediawiki).

## Copay Backups and Recovery

Since v1.2 Copay uses BIP39 mnemonics for backing up wallets. The BIP44 standard is used for wallet address derivation. Multisig wallets use P2SH addresses, while non-multisig wallets use P2PKH.

Information about backup and recovery procedures is available at: https://github.com/particl/copay/blob/master/backupRecovery.md

Previous versions of Copay used files as backups. See the following section.

It is possible to recover funds from a Copay Wallet without using Copay or the Wallet Service, check the [Copay Recovery Tool](https://github.com/bitpay/copay-recovery/tree/master).

## Wallet Export Format

Copay encrypts the backup with the [Stanford JS Crypto Library](http://bitwiseshiftleft.github.io/sjcl/). To extract the private key of your wallet you can go to settings, choose your wallet, click in "more options", then "wallet information", scroll to the bottom and click in "Extended Private Key". That information is enough to sign any transaction from your wallet, so be careful when handling it!

The backup also contains the key `publicKeyRing` that holds the extended public keys of the Copayers.
Depending on the key `derivationStrategy`, addresses are derived using
[BIP44](https://github.com/bitcoin/bips/blob/master/bip-0044.mediawiki) or [BIP45](https://github.com/bitcoin/bips/blob/master/bip-0045.mediawiki). Wallets created in Copay v1.2 and forward always use BIP44, all previous wallets use BIP45. Also note that since Copay version v1.2, non-multisig wallets use address types Pay-to-PublicKeyHash (P2PKH) while multisig wallets still use Pay-to-ScriptHash (P2SH) (key `addressType` at the backup):

| Copay Version | Wallet Type               | Derivation Strategy | Address Type |
| ------------- | ------------------------- | ------------------- | ------------ |
| <1.2          | All                       | BIP45               | P2SH         |
| ≥1.2          | Non-multisig              | BIP44               | P2PKH        |
| ≥1.2          | Multisig                  | BIP44               | P2SH         |
| ≥1.5          | Multisig Hardware wallets | BIP44 (root m/48’)  | P2SH         |

Using a tool like [Bitcore PlayGround](http://bitcore.io/playground) all wallet addresses can be generated. (TIP: Use the `Address` section for P2PKH address type wallets and `Multisig Address` for P2SH address type wallets). For multisig addresses, the required number of signatures (key `m` on the export) is also needed to recreate the addresses.

BIP45 note: All addresses generated at BWS with BIP45 use the 'shared cosigner index' (2147483647) so Copay address indexes look like: `m/45'/2147483647/0/x` for main addresses and `m/45'/2147483647/1/y` for change addresses.

Since version 1.5, Copay uses the root `m/48'` for hardware multisignature wallets. This was coordinated with Ledger and Trezor teams. While the derivation path format is still similar to BIP44, the root was in order to indicate that these wallets are not discoverable by scanning addresses for funds. Address generation for multisignature wallets requires the other copayers extended public keys.

## Bitcore Wallet Service

Copay depends on [Bitcore Wallet Service](https://github.com/particl/bitcore-wallet-service) (BWS) for blockchain information, networking and Copayer synchronization.  A BWS instance can be setup and operational within minutes or you can use a public instance like `https://bws.particl.io`.  Switching between BWS instances is very simple and can be done with a click from within Copay.  BWS also allows Copay to interoperate with other wallets like [Bitcore Wallet CLI] (https://github.com/particl/bitcore-wallet).

Please note that Copay v5.3.0 and above use CSP to restrict network access. To use a custom BWS see [CSP announcement](https://github.com/bitpay/copay/blob/master/CSP.md).

## Translations

Copay uses standard gettext PO files for translations and [Crowdin](https://crowdin.com/project/copay) as the front-end tool for translators. To join our team of translators, please create an account at [Crowdin](https://crowdin.com) and translate the Copay documentation and application text into your native language.

To use Trezor, you need to have the Trezor Chrome Extension installed, available at:
https://chrome.google.com/webstore/detail/trezor-chrome-extension/jcjjhjgimijdkoamemaghajlhegmoclj

To create or join a wallet using Ledger or Trezor go to:

  Add Wallet -> Create or Join -> Advanced options -> Wallet Seed -> select Trezor or Ledger

Both devices support multiple accounts, so you can use them for multiple wallets. Select the account and then click on create or join.

It is also possible to import a wallet from a device using:
  Add Wallet -> Import -> Hardware wallet

Here it is also necesary to select the account number.

When creating or joining a wallet, Copay will ask for two public keys for the device. One public keys is used for the wallet itself and the other is used as an entropy source to create a private / public key pair for signing requests to the Wallet Service.

Every time you need to sign a transaction, the device will be needed to perform the signature. Follow the on screen instructions after clicking the `send` or `accept` buttons.

Finally, in case you lose the device and you have the 24 word seed for the device, you can recover access to your funds using Copay, see: https://github.com/particl/copay/blob/master/backupRecovery.md#hardware-wallets


## Translations
Copay uses standard gettext PO files for translations and [Crowdin](https://crowdin.com/project/copay) as the front-end tool for translators.  To join our team of translators, please create an account at [Crowdin](https://crowdin.com) and translate the Copay documentation and application text into your native language.

To download and build using the latest translations from Crowdin, please use the following commands:

```sh
cd i18n
node crowdin_download.js
```

This will download all partial and complete language translations while also cleaning out any untranslated ones.

**Translation Credits:**

- Japanese: @dabura667
- French: @kirvx
- Portuguese: @pmichelazzo
- Spanish: @cmgustavo
- German: @saschad
- Russian: @vadim0

_Gracias totales!_

## Release Schedules

Copay uses the `MAJOR.MINOR.BATCH` convention for versioning. Any release that adds features should modify the MINOR or MAJOR number.

### Bug Fixing Releases

We release bug fixes as soon as possible for all platforms. Usually around a week after patches, a new release is made with language translation updates (like 1.1.4 and then 1.1.5). There is no coordination so all platforms are updated at the same time.

### Minor and Major Releases

- t+0: tag the release 1.2 and "text lock" (meaning only non-text related bug fixes. Though this rule is sometimes broken, it's good to make a rule.)
- t+7: testing for 1.2 is finished, translation is also finished, and 1.2.1 is tagged with all translations along with bug fixes made in the last week.
- t+7: iOS is submitted for 1.2.1. All other platforms are submitted with auto-release off.
- t + (~17): All platforms 1.2.1 are released when Apple approves the iOS application update.

## Contributing to this project

Anyone and everyone is welcome to contribute. Please take a moment to
review the [guidelines for contributing](CONTRIBUTING.md).

- [Bug reports](CONTRIBUTING.md#bugs)
- [Feature requests](CONTRIBUTING.md#features)
- [Pull requests](CONTRIBUTING.md#pull-requests)

## Current Active Developers GPG keys ID

- 15EDAD8D9F2EB1AF @cmgustavo

- FC283098DA862864 @gabrielbazan7

- DD6D7EAADE12280D @Gamboster

- D87947CC8A32D91C @msalcala11

- 612C9C4DDAC47B61 @rastajpa

- F8FC1D9B1B46486D @matiu

## Support

Please see [Support requests](CONTRIBUTING.md#support)

## License

Copay is released under the MIT License.  Please refer to the [LICENSE](https://github.com/particl/copay/blob/master/LICENSE) file that accompanies this project for more information including complete terms and conditions.
