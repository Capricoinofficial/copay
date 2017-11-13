'use strict';

angular.module('copayApp.controllers').controller('preferencesColdStakingController',
  function($scope, $log, $stateParams, configService, gettextCatalog, profileService, popupService, walletService, bitcore) {
    var _script = 'OP_ISCOINSTAKE OP_IF OP_DUP OP_HASH160 {hash} OP_EQUALVERIFY OP_CHECKSIG'
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
        var xpub = new bitcore.HDPublicKey($scope.coldstake.value),
            withBalance = [];
      } catch(e) {
        $log.error('Error with xpub:', e);
        return popupService.showAlert(gettextCatalog.getString('Error'), gettextCatalog.getString(e.message));
      }

      walletService.getBalance($scope.wallet, {}, function(err, resp) {
        if (err) {
          $scope.loading = false;
          return popupService.showAlert(bwcError.smsg(err, gettextCatalog.getString('Could not update wallet')));
        }

        withBalance = resp.byAddress;

        withBalance.forEach(function(index, idx) {
          var address = bitcore.Address(index.address),
              script = _script
              .replace('{hash}', xpub.derive(idx).toAddress().hashBuffer.hexSlice())
              .replace('{sha256}', ''); // TODO: replace with new sha256 key
          console.log(_script.toString());
          // TODO: Build transaction, prompt to sign and broadcast transaction.
        })
      });
    };
  });




