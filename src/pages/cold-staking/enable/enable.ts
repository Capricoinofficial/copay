import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Events, NavController, NavParams } from 'ionic-angular';

// providers
import { BwcProvider } from '../../../providers/bwc/bwc';
import { ConfigProvider } from '../../../providers/config/config';
import { Logger } from '../../../providers/logger/logger';
import { ProfileProvider } from '../../../providers/profile/profile';

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
    private configProvider: ConfigProvider,
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
    let opts = {
      coldStakingKeyFor: {}
    };
    opts.coldStakingKeyFor[this.navParams.data.walletId] = {
      label: this.coldStakingEnable.controls['label'].value,
      staking_key: this.coldStakingEnable.controls['staking_key'].value,
      xpubIndex: 0
    };
    this.configProvider.set(opts);

    this.events.publish('wallet:updated', this.navParams.data.walletId);
    this.navCtrl.pop();
  }

  public scanQR(): void {
    this.events.publish('ScanFromWallet', { fromColdStaking: true });
  }
}
