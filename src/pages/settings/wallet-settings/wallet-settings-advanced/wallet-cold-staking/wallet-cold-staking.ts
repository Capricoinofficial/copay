import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Events, NavController, NavParams } from 'ionic-angular';
import { Logger } from '../../../../../providers/logger/logger';

// providers
import { BwcProvider } from '../../../../../providers/bwc/bwc';
import { ProfileProvider } from '../../../../../providers/profile/profile';
import { WalletProvider } from '../../../../../providers/wallet/wallet';

import * as _ from 'lodash';

@Component({
  selector: 'page-wallet-cold-staking',
  templateUrl: 'wallet-cold-staking.html'
})
export class WalletColdStakingPage {
  public success: boolean = false;
  public wallet;
  public walletStakingForm: FormGroup;
  // private bitcore;
  // private _script;

  constructor(
    private profileProvider: ProfileProvider,
    private navCtrl: NavController,
    private navParams: NavParams,
    private logger: Logger,
    private formBuilder: FormBuilder,
    private events: Events,
    private bwcProvider: BwcProvider,
    private walletProvider: WalletProvider
  ) {
    // this.bitcore = this.bwcProvider.getBitcoreParticl();
    this.walletStakingForm = this.formBuilder.group({
      staking_key: [
        '',
        Validators.compose([Validators.minLength(1), Validators.required])
      ]
    });

    // this._script =
    //   'OP_NOP9 OP_IF OP_DUP OP_HASH160 {hash} OP_EQUALVERIFY OP_CHECKSIG ' +
    //   'OP_ELSE OP_DUP OP_SHA256 {sha256} OP_EQUALVERIFY OP_CHECKSIG OP_ENDIF';
  }

  ionViewDidLoad() {
    this.logger.info('Loaded:  WalletColdStakingPage');
  }

  ionViewWillEnter() {
    this.wallet = this.profileProvider.getWallet(this.navParams.data.walletId);
    this.walletStakingForm.value.staking_key = this.wallet.cachedStatus.wallet
      .coldStakingAddress
      ? this.wallet.cachedStatus.wallet.coldStakingAddress
      : '';
  }

  public activate(): void {
    this.walletProvider
      .setupColdStaking(this.wallet, {
        coldStakingAddress: this.walletStakingForm.value.staking_key
      })
      .then(resp => {
        this.logger.info('Success', resp);
      })
      .catch(err => {
        this.logger.error('Error', err);
      });

    // let opts = {
    //   coldStakingKeyFor: {}
    // };
    // opts.coldStakingKeyFor[
    //   this.wallet.credentials.walletId
    // ] = this.walletStakingForm.value.staking_key;

    // this.configProvider.set(opts);

    // let coldXpub, hotXPub;
    // try {
    //   coldXpub = new this.bitcore.HDPublicKey(
    //     this.walletStakingForm.value.staking_key
    //   );
    //   hotXPub = new this.bitcore.HDPublicKey(
    //     this.wallet.credentials.publicKeyRing[0].xPubKey
    //   );
    // } catch (e) {
    //   this.logger.error(e);
    // }

    // this.walletProvider
    //   .getMainAddresses(this.wallet, {
    //     reverse: true,
    //     limit: 1
    //   })
    //   .then(addresses => {
    //     this.logger.info('Address', addresses);

    //     let unusedAddress = addresses[0],
    //       unusedIndex = parseInt(
    //         unusedAddress.path.replace(/m\/[0-9]\//, ''),
    //         10
    //       );

    //     this.logger.info(unusedIndex);

    //     this.walletProvider
    //       .getBalance(this.wallet, {})
    //       .then(resp => {
    //         let withBalance = resp.byAddress;

    //         this.logger.info('withBalance', withBalance);

    //         _.each(withBalance, (n, i) => {
    //           this.logger.info('ddress index', i);
    //           let address = this.bitcore.Address.fromPublicKey(
    //               hotXPub.derive(unusedIndex++).publicKey,
    //               unusedAddress.network,
    //               true
    //             ),
    //             script = this._script
    //               .replace(
    //                 '{hash}',
    //                 coldXpub
    //                   .derive(i)
    //                   .publicKey.toAddress()
    //                   .hashBuffer.toString('hex')
    //               )
    //               .replace('{sha256}', address.hashBuffer.toString('hex'));

    //           this.wallet.getUtxos(
    //             {
    //               addresses: n.address
    //             },
    //             (err, utxos) => {
    //               if (err) {
    //                 this.logger.error(err);
    //               }

    //               let sum = 0;
    //               utxos.forEach(utxo => {
    //                 sum += utxo.satoshis;
    //                 utxo.path = n.path;
    //               });

    //               let output = {
    //                 toAddress: address.toString(),
    //                 script: new this.bitcore.Script.fromASM(script).toString(),
    //                 amount: sum - 30000,
    //                 message: 'Coldstake outputs'
    //               };

    //               this.logger.info('inputs', utxos);
    //               this.logger.info('outputs', output);

    //               this.walletProvider
    //                 .createTx(this.wallet, {
    //                   inputs: utxos,
    //                   outputs: [output],
    //                   message: 'Coldstake outputs',
    //                   fee: 30000
    //                 })
    //                 .then(txp => {
    //                   this.walletProvider
    //                     .publishAndSign(this.wallet, txp)
    //                     .catch(err => {
    //                       this.logger.error(err);
    //                     });
    //                 })
    //                 .catch(err => {
    //                   this.logger.error(err);
    //                 });
    //             }
    //           );
    //         });
    //       })
    //       .catch(err => {
    //         this.logger.error(err);
    //       });
    //   })
    //   .catch(err => {
    //     this.logger.error(err);
    //   });

    // this.logger.info(coldXpub, hotXPub);

    this.events.publish('wallet:updated', this.wallet.credentials.walletId);
    this.navCtrl.popToRoot();
  }
}
