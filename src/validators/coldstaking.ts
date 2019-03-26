import { FormControl } from '@angular/forms';

// Providers
import { BwcProvider } from '../providers/bwc/bwc';

import * as bech32 from 'bech32-buffer';

export class ColdStakingValidator {
  static particlBitcore;
  static network: string;

  constructor(private bwcProvider: BwcProvider, private network: string) {
    ColdStakingValidator.particlBitcore = this.bwcProvider.getBitcoreParticl();
    ColdStakingValidator.network = this.network;
  }

  isKeyValid(control: FormControl) {
    if (
      !ColdStakingValidator.particlBitcore.HDPublicKey.isValidSerialized(
        control.value
      )
    ) {
      try {
        let address = bech32.decode(control.value);
        const prefixes = {
          livenet: 'pcs',
          testnet: 'tpcs'
        };

        if (
          address.prefix !== prefixes.livenet &&
          address.prefix !== prefixes.testnet
        )
          return { error: 'The address provided has the wrong prefix.' };

        if (prefixes[ColdStakingValidator.network] !== address.prefix)
          return { error: 'The address provided has the wrong network.' };
      } catch (e) {
        return { error: 'Invalid cold staking public key or pool address.' };
      }
    } else {
      const prefixes = {
        livenet: 'PPAR',
        testnet: 'ppar'
      };
      if (
        !control.value.startsWith(prefixes.livenet) &&
        !control.value.startsWith(prefixes.testnet)
      )
        return { error: 'The xpub provided has the wrong prefix.' };

      if (!control.value.startsWith(prefixes[ColdStakingValidator.network]))
        return { error: 'The xpub provided has the wrong network.' };
    }
    return null;
  }
}
