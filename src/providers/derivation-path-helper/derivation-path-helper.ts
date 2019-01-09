import { Injectable } from '@angular/core';

@Injectable()
export class DerivationPathHelperProvider {
  public default: {
    btc: string;
    bch: string;
    part: string;
  };
  public defaultTestnet: string;

  public constructor() {
    this.default = {
      btc: "m/44'/0'/0'",
      bch: "m/44'/0'/0'",
      part: "m/44'/44'/0'"
    };
    this.defaultTestnet = "m/44'/1'/0'";
  }

  public getDerivationStrategy(path: string): string {
    const purpose = path.split('/')[1];
    let derivationStrategy: string;

    switch (purpose) {
      case "44'":
        derivationStrategy = 'BIP44';
        break;
      case "45'":
        derivationStrategy = 'BIP45';
        break;
      case "48'":
        derivationStrategy = 'BIP48';
        break;
    }
    return derivationStrategy;
  }

  public getNetworkName(path: string): string {
    const coinType = path.split('/')[2];
    let networkName: string;

    switch (coinType) {
      case "0'":
      case "44'":
        networkName = 'livenet';
        break;
      case "1'":
        networkName = 'testnet';
        break;
    }
    return networkName;
  }

  public getAccount(path: string): number {
    const match = path.split('/')[3].match(/(\d+)'/);
    if (!match) return undefined;
    return +match[1];
  }
}
