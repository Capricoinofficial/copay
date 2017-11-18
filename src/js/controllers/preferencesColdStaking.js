'use strict';

angular.module('copayApp.controllers').controller('preferencesColdStakingController',
  function($scope, $log, $stateParams, configService, gettextCatalog, profileService, popupService, walletService, bitcore, bwcError) {
    var _script = 'OP_NOP9 OP_IF OP_DUP OP_HASH160 {hash} OP_EQUALVERIFY OP_CHECKSIG '
                + 'OP_ELSE OP_DUP OP_SHA256 {sha256} OP_EQUALVERIFY OP_CHECKSIG OP_ENDIF';
    $scope.success = null;

    var wallet = profileService.getWallet($stateParams.walletId);
    $scope.wallet = wallet;

    var walletId = wallet.credentials.walletId;
    var config = configService.getSync();

    $scope.coldstake = {
      value: (config.coldstake && config.coldstake[walletId]) || ''
    };

    $scope.save = function() {
      try {
        var coldXpub = new bitcore.HDPublicKey($scope.coldstake.value),
            withBalance = [],
            hotXPub = new bitcore.HDPublicKey(wallet.credentials.publicKeyRing[0].xPubKey);
      } catch(e) {
        $log.error('Error with xpub:', e);
        return popupService.showAlert(gettextCatalog.getString('Error'), gettextCatalog.getString(e.message));
      }

      wallet.getMainAddresses({
        reverse: true,
        limit: 1
      }, function(err, addr) {
        if (err) {
          $scope.loading = false;
          return popupService.showAlert(bwcError.msg(err, gettextCatalog.getString('Could not get addresses')));
        }
        var unused = addr[0],
            unusedIndex = parseInt(unused.path.replace(/m\/[0-9]\//, ''));

        walletService.getBalance($scope.wallet, {}, function(err, resp) {
          if (err) {
            $scope.loading = false;
            return popupService.showAlert(bwcError.msg(err, gettextCatalog.getString('Could not get balances')));
          }

          withBalance = resp.byAddress;

          withBalance.forEach(function(index, idx) {
            // console.log(index, unused, unused.network);
            var address = bitcore.Address.fromPublicKey(hotXPub.derive(unusedIndex++).publicKey, unused.network, true),
                script = _script
                .replace('{hash}', coldXpub.derive(idx).publicKey.toAddress().hashBuffer.toString('hex'))
                .replace('{sha256}', address.hashBuffer.toString('hex')); // TODO: replace with new sha256 key
            // console.log(script);
            // TODO: Build transaction, prompt to sign and broadcast transaction.
            wallet.getUtxos({
              addresses: index.address,
            }, function(err, utxos) {
              if (err) {
                $scope.loading = false;
                return popupService.showAlert(bwcError.msg(err, gettextCatalog.getString('Could not get utxos')));
              }

              var sum = 0;
              utxos.forEach(function(utxo) {
                sum += utxo.satoshis;
                utxo.path = index.path;
              });

              var output = {
                toAddress: address.toString(),
                script: (new bitcore.Script.fromASM(script)).toString(),
                amount: sum - 30000
              };
              wallet.createTxProposal({ // TODO: Maybe create a single proposal for all inputs and outputs? Not sure...
                inputs: utxos,
                outputs: [output],
                message: 'Coldstake outputs',
                fee: 30000,
              }, function(err, txp) {
                if (err) {
                  $scope.loading = false;
                  return popupService.showAlert(gettextCatalog.getString('Error'), err);
                }
                wallet.publishTxProposal({
                  txp: txp
                }, console.log); // TODO: Callback function? :)
              });
            });
          })
        });
      });
    };
  });




