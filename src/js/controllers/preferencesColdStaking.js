'use strict';

angular.module('copayApp.controllers').controller('preferencesColdStakingController',
  function($scope, $log, $stateParams, profileService, bitcore) {
    var _script = 'OP_ISCOINSTAKE OP_IF OP_DUP OP_HASH160 {hash} OP_EQUALVERIFY OP_CHECKSIG'
                + 'OP_ELSE OP_DUP OP_SHA256 {sha256} OP_EQUALVERIFY OP_CHECKSIG OP_ENDIF';
    $scope.success = null;

    var wallet = profileService.getWallet($stateParams.walletId);
    $scope.wallet = wallet;

    var walletId = wallet.credentials.walletId;
    var config = configService.getSync();
    $scope.coldstaking = {
      value: (config.coldstaking && config.coldstaking[walletId]) || ''
    };

    $scope.save = function() {
      var xpub = new bitcore.HDPublicKey($scope.coldstaking.value),
          withBalance = [],
          wallet = profileService.getWallet(value.wallet);

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
              .replace('{sha256}', ); // TODO: replace with new sha256 key

          // TODO: Build transaction, prompt to sign and broadcast transaction.
        })
      });
    };
  });




