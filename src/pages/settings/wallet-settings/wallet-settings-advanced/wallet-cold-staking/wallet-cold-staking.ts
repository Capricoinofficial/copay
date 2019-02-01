import { Component } from '@angular/core';
import { Events, NavParams } from 'ionic-angular';
import { Logger } from '../../../../../providers/logger/logger';

// providers
import { BwcProvider } from '../../../../../providers/bwc/bwc';
import { ConfigProvider } from '../../../../../providers/config/config';
import { ProfileProvider } from '../../../../../providers/profile/profile';

import * as bech32 from 'bech32-buffer';

@Component({
  selector: 'page-wallet-cold-staking',
  templateUrl: 'wallet-cold-staking.html'
})
export class WalletColdStakingPage {
  public wallet;
  public isActivated: boolean;
  public activationPercent = 0;
  private OP_ISCOINSTAKE = 'b8';
  private bitcoreParticl;

  public search: string = '';
  public invalidColdStakingKey: boolean;
  public stakingKeyError: string = '';

  constructor(
    private profileProvider: ProfileProvider,
    private navParams: NavParams,
    private logger: Logger,
    private events: Events,
    private configProvider: ConfigProvider,
    private bwcProvider: BwcProvider
  ) {
    this.bitcoreParticl = this.bwcProvider.getBitcoreParticl();

    this.events.subscribe('update:coldStakingKey', data => {
      this.search = data.value;
      this.processInput();
    });
  }

  ionViewDidLoad() {
    this.logger.info('Loaded:  WalletColdStakingPage');
  }

  ionViewWillEnter() {
    this.wallet = this.profileProvider.getWallet(this.navParams.data.walletId);

    this.isActive();

    this.coldStakingStats();
  }

  ngOnDestroy() {
    this.events.unsubscribe('update:coldStakingKey');
  }

  public activate(): void {
    this.toggleColdStaking(this.search);
  }

  public deactivate(): void {
    this.toggleColdStaking(null);
  }

  public openScanner(): void {
    this.events.publish('ScanFromWallet', { fromColdStaking: true });
  }

  public processInput(): void {
    this.search = this.search.trim();

    if (this.search !== '') {
      this.validateColdStakingKey();
    }
  }

  private isActive(): void {
    const config = this.configProvider.get();
    this.search =
      (config.coldStakingKeyFor &&
        config.coldStakingKeyFor[this.wallet.credentials.walletId]) ||
      '';
    this.isActivated =
      config.coldStakingKeyFor &&
      config.coldStakingKeyFor[this.wallet.credentials.walletId] &&
      config.coldStakingKeyFor[this.wallet.credentials.walletId] !== null;
  }

  private toggleColdStaking(staking_key?): void {
    let opts = {
      coldStakingKeyFor: {}
    };
    opts.coldStakingKeyFor[this.wallet.credentials.walletId] = staking_key;
    this.configProvider.set(opts);

    this.events.publish('wallet:updated', this.wallet.credentials.walletId);

    this.isActive();
  }

  private validateColdStakingKey() {
    this.stakingKeyError = '';
    this.invalidColdStakingKey = false;

    if (!this.bitcoreParticl.HDPublicKey.isValidSerialized(this.search)) {
      try {
        let address = bech32.decode(this.search);
        const prefixes = {
          livenet: 'pcs',
          testnet: 'tpcs'
        };

        if (
          address.prefix !== prefixes.livenet &&
          address.prefix !== prefixes.testnet
        ) {
          this.invalidColdStakingKey = true;
          this.stakingKeyError = 'The address provided has the wrong prefix.';
        }

        if (prefixes[this.wallet.network] !== address.prefix) {
          this.invalidColdStakingKey = true;
          this.stakingKeyError = 'The address provided has the wrong network.';
        }
      } catch (e) {
        this.invalidColdStakingKey = true;
        this.stakingKeyError = 'Invalid cold staking xpub or bech32 address.';
      }
    } else {
      const prefixes = {
        livenet: 'PPAR',
        testnet: 'ppar'
      };
      if (
        !this.search.startsWith(prefixes.livenet) &&
        !this.search.startsWith(prefixes.testnet)
      ) {
        this.invalidColdStakingKey = true;
        this.stakingKeyError = 'The xpub provided has the wrong prefix.';
      }

      if (!this.search.startsWith(prefixes[this.wallet.network])) {
        this.invalidColdStakingKey = true;
        this.stakingKeyError = 'The xpub provided has the wrong network.';
      }
    }
  }

  private coldStakingStats() {
    if (!this.isActivated) return;

    this.wallet.getUtxos({}, (err, utxos) => {
      if (err) {
        this.logger.error(err);
      }

      let total = 0,
        staked = 0;
      utxos.forEach(utxo => {
        total += utxo.satoshis;

        if (
          utxo.scriptPubKey &&
          utxo.scriptPubKey.startsWith(this.OP_ISCOINSTAKE)
        ) {
          staked += utxo.satoshis;
        }
      });

      this.activationPercent = total ? Math.floor((staked / total) * 100) : 0;
    });
  }
}
