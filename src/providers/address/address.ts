import { Injectable } from '@angular/core';

// Providers
import { BwcProvider } from '../../providers/bwc/bwc';

@Injectable()
export class AddressProvider {
  private bitcore;
  private bitcoreCash;
  private bitcoreParticl;
  private Bitcore;

  constructor(private bwcProvider: BwcProvider) {
    this.bitcore = this.bwcProvider.getBitcore();
    this.bitcoreCash = this.bwcProvider.getBitcoreCash();
    this.bitcoreParticl = this.bwcProvider.getBitcoreParticl();
    this.Bitcore = {
      btc: {
        lib: this.bitcore,
        translateTo: 'bch'
      },
      bch: {
        lib: this.bitcoreCash,
        translateTo: 'btc'
      },
      part: {
        lib: this.bitcoreParticl
      }
    };
  }

  public getCoin(address: string) {
    address = address.replace(
      /^(bitcoincash:|bchtest:|bitcoin:|particl:)/i,
      ''
    );
    try {
      new this.Bitcore['btc'].lib.Address(address);
      return 'btc';
    } catch (e) {
      try {
        new this.Bitcore['bch'].lib.Address(address);
        return 'bch';
      } catch (e) {
        try {
          new this.Bitcore['part'].lib.Address(address);
          return 'part';
        } catch (e) {
          return null;
        }
      }
    }
  }

  public getNetwork(address: string) {
    address = address.replace(
      /^(bitcoincash:|bchtest:|bitcoin:|particl:)/i,
      ''
    );
    let network;
    try {
      network = this.bwcProvider.getBitcore().Address(address).network.name;
    } catch (e) {
      try {
        network = this.bwcProvider.getBitcoreCash().Address(address).network
          .name;
      } catch (e) {
        try {
          network = this.bwcProvider.getBitcoreParticl().Address(address)
            .network.name;
        } catch (e) {}
      }
    }
    return network;
  }

  private translateAddress(address: string) {
    var origCoin = this.getCoin(address);
    if (!origCoin || origCoin == 'part') return undefined;

    var origAddress = new this.Bitcore[origCoin].lib.Address(address);
    var origObj = origAddress.toObject();

    var resultCoin = this.Bitcore[origCoin].translateTo;
    var resultAddress = this.Bitcore[resultCoin].lib.Address.fromObject(
      origObj
    );
    return {
      origCoin,
      origAddress: address,
      resultCoin,
      resultAddress: resultAddress.toString()
    };
  }

  public validateAddress(address: string) {
    let Address = this.bitcore.Address;
    let AddressCash = this.bitcoreCash.Address;
    let AddressParticl = this.bitcoreParticl.Address;
    let isLivenet = Address.isValid(address, 'livenet');
    let isTestnet = Address.isValid(address, 'testnet');
    let isLivenetCash = AddressCash.isValid(address, 'livenet');
    let isTestnetCash = AddressCash.isValid(address, 'testnet');
    let isLivenetPart = AddressParticl.isValid(address, 'livenet');
    let isTestnetPart = AddressParticl.isValid(address, 'testnet');
    return {
      address,
      isValid:
        isLivenet ||
        isTestnet ||
        isLivenetCash ||
        isTestnetCash ||
        isLivenetPart ||
        isTestnetPart,
      network:
        isTestnet || isTestnetCash || isTestnetPart ? 'testnet' : 'livenet',
      coin: this.getCoin(address),
      translation: this.translateAddress(address)
    };
  }

  public checkCoinAndNetworkFromAddr(
    coin: string,
    network: string,
    address: string
  ): boolean {
    let addressData;
    if (this.isValid(address)) {
      let extractedAddress = this.extractAddress(address);
      addressData = this.validateAddress(extractedAddress);
      return addressData.coin == coin && addressData.network == network
        ? true
        : false;
    } else {
      return false;
    }
  }

  public checkCoinAndNetworkFromPayPro(
    coin: string,
    network: string,
    payProDetails
  ): boolean {
    return payProDetails.coin == coin && payProDetails.network == network
      ? true
      : false;
  }

  public extractAddress(address: string): string {
    let extractedAddress = address
      .replace(/^(bitcoincash:|bchtest:|bitcoin:|particl:)/i, '')
      .replace(/\?.*/, '');
    return extractedAddress || address;
  }

  public isValid(address: string): boolean {
    let URI = this.bitcore.URI;
    let Address = this.bitcore.Address;
    let URICash = this.bitcoreCash.URI;
    let AddressCash = this.bitcoreCash.Address;
    let URIParticl = this.bitcoreParticl.URI;
    let AddressParticl = this.bitcoreParticl.Address;

    // Bip21 uri
    let uri, isAddressValidLivenet, isAddressValidTestnet;
    if (/^bitcoin:/.test(address)) {
      let isUriValid = URI.isValid(address);
      if (isUriValid) {
        uri = new URI(address);
        isAddressValidLivenet = Address.isValid(
          uri.address.toString(),
          'livenet'
        );
        isAddressValidTestnet = Address.isValid(
          uri.address.toString(),
          'testnet'
        );
      }
      if (isUriValid && (isAddressValidLivenet || isAddressValidTestnet)) {
        return true;
      }
    } else if (/^bitcoincash:/i.test(address) || /^bchtest:/i.test(address)) {
      let isUriValid = URICash.isValid(address);
      if (isUriValid) {
        uri = new URICash(address);
        isAddressValidLivenet = AddressCash.isValid(
          uri.address.toString(),
          'livenet'
        );
        isAddressValidTestnet = AddressCash.isValid(
          uri.address.toString(),
          'testnet'
        );
      }
      if (isUriValid && (isAddressValidLivenet || isAddressValidTestnet)) {
        return true;
      }
    } else {
      if (/^particl:/.test(address)) {
        let isUriValid = URIParticl.isValid(address);
        if (isUriValid) {
          uri = new URIParticl(address);
          isAddressValidLivenet = AddressParticl.isValid(
            uri.address.toString(),
            'livenet'
          );
          isAddressValidTestnet = AddressParticl.isValid(
            uri.address.toString(),
            'testnet'
          );
        }
        if (isUriValid && (isAddressValidLivenet || isAddressValidTestnet)) {
          return true;
        }
      }
    }

    // Regular Address: try Bitcoin, Bitcoin Cash and Particl
    let regularAddressLivenet = Address.isValid(address, 'livenet');
    let regularAddressTestnet = Address.isValid(address, 'testnet');
    let regularAddressCashLivenet = AddressCash.isValid(address, 'livenet');
    let regularAddressCashTestnet = AddressCash.isValid(address, 'testnet');
    let regularAddressParticlLivenet = AddressParticl.isValid(
      address,
      'livenet'
    );
    let regularAddressParticlTestnet = AddressParticl.isValid(
      address,
      'testnet'
    );
    if (
      regularAddressLivenet ||
      regularAddressTestnet ||
      regularAddressCashLivenet ||
      regularAddressCashTestnet ||
      regularAddressParticlLivenet ||
      regularAddressParticlTestnet
    ) {
      return true;
    }

    return false;
  }
}
