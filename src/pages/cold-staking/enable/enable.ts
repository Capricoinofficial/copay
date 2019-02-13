import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Events, NavController, NavParams } from 'ionic-angular';

// providers
import { BwcProvider } from '../../../providers/bwc/bwc';
import { Logger } from '../../../providers/logger/logger';
import { ProfileProvider } from '../../../providers/profile/profile';
import { WalletProvider } from '../../../providers/wallet/wallet';

// validators
import { ColdStakingValidator } from '../../../validators/coldstaking';

@Component({
  selector: 'page-cold-staking-enable',
  templateUrl: 'enable.html'
})
export class ColdStakingEnablePage {
  private coldStakingEnable: FormGroup;
  private wallet;

  constructor(
    private events: Events,
    private formBuilder: FormBuilder,
    private navCtrl: NavController,
    private navParams: NavParams,
    private profileProvider: ProfileProvider,
    private bwcProvider: BwcProvider,
    private walletProvider: WalletProvider,
    private logger: Logger
  ) {
    this.coldStakingEnable = this.formBuilder.group({
      label: [''],
      staking_key: ['', Validators.required]
    });

    this.events.subscribe('update:coldStakingKey', data => {
      this.coldStakingEnable.controls['staking_key'].setValue(data.value);
    });
  }

  ionViewWillEnter() {
    this.wallet = this.profileProvider.getWallet(this.navParams.data.walletId);
    this.coldStakingEnable.controls['staking_key'].setValidators([
      Validators.required,
      new ColdStakingValidator(this.bwcProvider, this.wallet.network).isKeyValid
    ]);
  }

  ionViewDidLoad() {
    this.logger.info('Loaded: ColdStakingEnablePage');
  }

  ngOnDestroy() {
    this.events.unsubscribe('update:coldStakingKey');
  }

  public save(): void {
    let config = {
      label: this.coldStakingEnable.controls['label'].value,
      staking_key: this.coldStakingEnable.controls['staking_key'].value
    };

    this.walletProvider.setStakingConfig(this.wallet, config);

    this.events.publish('wallet:updated', this.navParams.data.walletId);
    this.navCtrl.pop();
  }

  public scanQR(): void {
    this.events.publish('ScanFromWallet', { fromColdStaking: true });
  }
}
