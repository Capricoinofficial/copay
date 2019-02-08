import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { Events, NavController, Platform } from 'ionic-angular';
import { Logger } from '../../providers/logger/logger';

// providers
import { ActionSheetProvider } from '../../providers/action-sheet/action-sheet';
import { BwcErrorProvider } from '../../providers/bwc-error/bwc-error';
import { BwcProvider } from '../../providers/bwc/bwc';
import { ConfigProvider } from '../../providers/config/config';
import { ExternalLinkProvider } from '../../providers/external-link/external-link';
import { FeeProvider } from '../../providers/fee/fee';
import { OnGoingProcessProvider } from '../../providers/on-going-process/on-going-process';
import { PopupProvider } from '../../providers/popup/popup';
import { ProfileProvider } from '../../providers/profile/profile';
import { ReplaceParametersProvider } from '../../providers/replace-parameters/replace-parameters';
import {
  TransactionProposal,
  WalletProvider
} from '../../providers/wallet/wallet';
import { WalletTabsProvider } from '../wallet-tabs/wallet-tabs.provider';

// pages
import { WalletTabsChild } from '../wallet-tabs/wallet-tabs-child';
import { ColdStakingEnablePage } from './enable/enable';

import { Subscription } from 'rxjs';

@Component({
  selector: 'page-cold-staking',
  templateUrl: 'cold-staking.html'
})
export class ColdStakingPage extends WalletTabsChild {
  public activationPercent;
  public getStakingConfig;
  public isStaking;
  public canZap;
  private OP_ISCOINSTAKE = 'b8';
  private particlBitcore;
  private onResumeSubscription: Subscription;

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
    private bwcProvider: BwcProvider,
    private onGoingProcessProvider: OnGoingProcessProvider,
    private actionSheetProvider: ActionSheetProvider,
    private bwcErrorProvider: BwcErrorProvider,
    private feeProvider: FeeProvider,
    private replaceParametersProvider: ReplaceParametersProvider,
    private events: Events,
    private platform: Platform
  ) {
    super(navCtrl, profileProvider, walletTabsProvider);

    this.particlBitcore = this.bwcProvider.getBitcoreParticl();
  }

  ionViewDidLoad() {
    this.logger.info('Loaded:  WalletColdStakingPage');
    this.events.subscribe('Wallet/updateAll', () => {
      this.isColdStakingActive();
      this.coldStakingStats();
    });
  }

  ionViewWillEnter() {
    this.onResumeSubscription = this.platform.resume.subscribe(() => {
      this.isColdStakingActive();
      this.coldStakingStats();
      this.events.subscribe('Wallet/updateAll', () => {
        this.isColdStakingActive();
        this.coldStakingStats();
      });
    });
  }

  ionViewDidEnter() {
    this.isColdStakingActive();
    this.coldStakingStats();
  }

  ionViewWillLeave() {
    this.onResumeSubscription.unsubscribe();
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
        this.translate.instant('Disable Staking'),
        this.translate.instant(
          'This means you will stop receiving interest on your PART coins.'
        ),
        this.translate.instant('Disable'),
        this.translate.instant('Cancel')
      )
      .then((res: boolean) => {
        if (res) {
          this.balanceTransfer(false)
            .then(() => {
              let opts = {
                coldStakingKeyFor: {}
              };
              opts.coldStakingKeyFor[this.wallet.id] = null;
              this.configProvider.set(opts);

              this.events.publish('wallet:updated', this.wallet.id);
              this.isColdStakingActive();
            })
            .catch(err => {
              this.showErrorInfoSheet(err);
            });
        }
      });
  }

  public zap(): void {
    this.popupProvider
      .ionicConfirm(
        this.translate.instant('Cold Stake Zap'),
        this.translate.instant(
          'Zapping will fast-forward the cold staking progress instantly to 100%.<br><br>Be warned, that this decreases your financial privacy, as it bundles all your remaining coins into one big transaction. It is advised to zap only the small remaining part of your coins (last ~10 %) &ndash; those that take ages to get processed.'
        ),
        this.translate.instant('Zap'),
        this.translate.instant('Cancel')
      )
      .then((res: boolean) => {
        if (res) {
          this.balanceTransfer(true)
            .then(() => {
              this.coldStakingStats();
            })
            .catch(err => {
              this.showErrorInfoSheet(err);
            });
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
        staked = 0,
        hasUnconfirmed = false;
      utxos.forEach(utxo => {
        if (utxo.confirmations > 0) {
          total += utxo.satoshis;
          if (
            utxo.scriptPubKey &&
            utxo.scriptPubKey.startsWith(this.OP_ISCOINSTAKE)
          ) {
            staked += utxo.satoshis;
          }
        } else {
          hasUnconfirmed = true;
        }
      });

      if (hasUnconfirmed) {
        this.activationPercent = this.translate.instant(
          'Waiting on unconfirmed transactions...'
        );
        this.canZap = false;
      } else {
        const percentDone = total ? (staked / total) * 100 : 0;
        this.activationPercent = percentDone.toFixed(2) + '%';
        this.canZap = !hasUnconfirmed && total > 0 && percentDone < 100;
      }
    });
  }

  private balanceTransfer(isZap): Promise<any> {
    return new Promise((resolve, reject) => {
      this.onGoingProcessProvider.set('calculatingFee');
      this.wallet.getUtxos({}, (err, utxos) => {
        if (err) {
          this.logger.error(err);
          reject(err);
        }
        let inputs = [],
          total = 0;
        utxos.forEach(utxo => {
          if (utxo.confirmations > 0) {
            const utxoStaking =
              utxo.scriptPubKey &&
              utxo.scriptPubKey.startsWith(this.OP_ISCOINSTAKE);

            if (isZap && !utxoStaking) {
              inputs.push(utxo);
              total += utxo.satoshis;
            }

            if (!isZap && utxoStaking) {
              inputs.push(utxo);
              total += utxo.satoshis;
            }
          }
        });

        const txp: Partial<TransactionProposal> = {};
        txp.inputs = inputs;

        // Placeholder for fee calculation
        txp.outputs = [
          {
            toAddress: '',
            amount: total,
            message: ''
          }
        ];

        txp.message = 'Balance Transfer';
        txp.excludeUnconfirmedUtxos = true;

        this.feeProvider
          .getEstimatedFee(this.wallet, txp)
          .then(fee => {
            this.onGoingProcessProvider.clear();
            this.popupProvider
              .ionicConfirm(
                this.translate.instant('Balance Transfer'),
                this.replaceParametersProvider.replace(
                  this.translate.instant(
                    'This balance transfer will incur a fee of {{fee}} {{unit}}.'
                  ),
                  { fee: fee / 1e8, unit: this.wallet.coin.toUpperCase() }
                ),
                this.translate.instant('Proceed'),
                this.translate.instant('Cancel')
              )
              .then((res: boolean) => {
                if (res) {
                  txp.fee = fee;
                  txp.outputs[0].amount = txp.outputs[0].amount - fee;

                  this.wallet.createAddress(
                    { isChange: true, sha256: !!isZap },
                    (err, addr) => {
                      if (err) {
                        this.logger.error(err);
                        reject(err);
                      }
                      txp.outputs[0].toAddress = addr.address;
                      if (isZap) {
                        txp.outputs[0].script = this.particlBitcore.Script.fromAddress(
                          addr.address,
                          this.getStakingConfig.staking_key
                        ).toString();
                      }
                      this.walletProvider
                        .createTx(this.wallet, txp)
                        .then(ctxp => {
                          this.walletProvider
                            .publishAndSign(this.wallet, ctxp)
                            .then(() => {
                              this.onGoingProcessProvider.clear();
                              resolve();
                            })
                            .catch(err => {
                              this.onGoingProcessProvider.clear();
                              this.logger.error(err);
                              reject(err);
                            });
                        })
                        .catch(err => {
                          this.onGoingProcessProvider.clear();
                          this.logger.error(err);
                          reject(err);
                        });
                    }
                  );
                }
              });
          })
          .catch(err => {
            this.onGoingProcessProvider.clear();
            this.logger.error(err);
            reject(err);
          });
      });
    });
  }

  public showErrorInfoSheet(error: Error | string, title?: string): void {
    if (!error) return;
    const infoSheetTitle = title ? title : this.translate.instant('Error');

    const errorInfoSheet = this.actionSheetProvider.createInfoSheet(
      'default-error',
      { msg: this.bwcErrorProvider.msg(error), title: infoSheetTitle }
    );
    errorInfoSheet.present();
  }
}
