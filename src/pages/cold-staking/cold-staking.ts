import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Events, NavController } from 'ionic-angular';
import { Logger } from '../../providers/logger/logger';

// providers
import { ConfigProvider } from '../../providers/config/config';
import { ExternalLinkProvider } from '../../providers/external-link/external-link';
import { PopupProvider } from '../../providers/popup/popup';
import { ProfileProvider } from '../../providers/profile/profile';
import { WalletProvider } from '../../providers/wallet/wallet';
import { WalletTabsProvider } from '../wallet-tabs/wallet-tabs.provider';

// pages
import { WalletTabsChild } from '../wallet-tabs/wallet-tabs-child';
import { ColdStakingEnablePage } from './enable/enable';

@Component({
  selector: 'page-cold-staking',
  templateUrl: 'cold-staking.html'
})
export class ColdStakingPage extends WalletTabsChild {
  public activationPercent;
  public getStakingConfig;
  public isStaking;
  private OP_ISCOINSTAKE = 'b8';

  constructor(
    navCtrl: NavController,
    private logger: Logger,
    profileProvider: ProfileProvider,
    private externalLinkProvider: ExternalLinkProvider,
    private translate: TranslateService,
    walletTabsProvider: WalletTabsProvider,
    private popupProvider: PopupProvider,
    private walletProvider: WalletProvider,
    private configProvider: ConfigProvider,
    private events: Events
  ) {
    super(navCtrl, profileProvider, walletTabsProvider);
  }

  ionViewDidLoad() {
    this.logger.info('Loaded:  WalletColdStakingPage');
  }

  ionViewWillEnter() {
    this.isColdStakingActive();
    this.coldStakingStats();
  }

  public learnMore(): void {
    let url = 'https://particl.wiki/tutorials#staking';
    let optIn = true;
    let title = null;
    let message = this.translate.instant(
      'Learn more about cold staking on the Particl wiki.'
    );
    let okText = this.translate.instant('Open Particl Wiki');
    let cancelText = this.translate.instant('Go Back');
    this.externalLinkProvider.open(
      url,
      optIn,
      title,
      message,
      okText,
      cancelText
    );
  }

  public enableColdStaking(): void {
    this.navCtrl.push(ColdStakingEnablePage, {
      walletId: this.wallet.id
    });
  }

  public disableColdStaking(): void {
    this.popupProvider
      .ionicConfirm(
        'Disable staking?',
        'This means you will stop receiving interest on your PART coins.',
        'Disable',
        'Cancel'
      )
      .then((res: boolean) => {
        if (res) {
          let opts = {
            coldStakingKeyFor: {}
          };
          opts.coldStakingKeyFor[this.wallet.id] = null;
          this.configProvider.set(opts);

          this.events.publish('wallet:updated', this.wallet.id);
          this.isColdStakingActive();
        }
      });
  }

  private isColdStakingActive(): void {
    this.getStakingConfig = this.walletProvider.getStakingConfig(this.wallet);
    this.isStaking = this.getStakingConfig !== null;
  }

  private coldStakingStats() {
    this.wallet.getUtxos({}, (err, utxos) => {
      if (err) {
        this.logger.error(err);
      }

      let total = 0,
        staked = 0;
      utxos.forEach(utxo => {
        if (utxo.confirmations > 0) {
          total += utxo.satoshis;
          if (
            utxo.scriptPubKey &&
            utxo.scriptPubKey.startsWith(this.OP_ISCOINSTAKE)
          ) {
            staked += utxo.satoshis;
          }
        }
      });
      this.activationPercent = total
        ? ((staked / total) * 100).toFixed(2)
        : '0';
    });
  }
}
