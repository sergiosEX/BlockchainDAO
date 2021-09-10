# Blockchain DAO

## How to run the sample 7nodes quorum network

Αρχικά θα χρειαστούμε το docker-desktop και to wsl.

Ανοίγουμε το docker-desktop.

Στο περιβάλλον του wsl σε φάκελο της επιλογής μας εκτελούμε τα ακόλουθα. Με τις εντολές αυτές κατεβάζουμε τoν κώδικα από το quorum-examples και ανοίγουμε ένα docker με 7 nodes και 7 transaction managers.

```bash
git clone https://github.com/jpmorganchase/quorum-examples.git
mkdir BlockchainDAO && cd BlockchainDAO
git init
mv ../quorum-examples/examples . && mv ../quorum-examples/docker-compose.yml .
docker-compose up -d
```

Για να κλείσουμε το δίκτυο εκτελούμε `docker-compose down`

Για περισσότερα δες [εδώ](https://github.com/ConsenSys/quorum-examples)

## Initialize truffle project and test run it on the network

Αρχικοποιούμε ένα νέο truffle project, τροποποιούμε το configuration για το quorum, προσθέτουμε ένα νέο contract, ένα νέο migration και κάνουμε compile και migrate.

```bash
mkdir dapp && cd dapp
truffle init
```

```javascript
// File: `truffle-config.js` (edited for 7nodes example)
module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 22000, // was 8545
      network_id: "*", // Match any network id
      gasPrice: 0,
      gas: 4500000,
      type: "quorum" // needed for Truffle to support Quorum
    }
  }
};
```

```solidity
// File: `./contracts/SimpleStorage.sol`

pragma solidity ^0.5.16;

contract SimpleStorage {
  uint public storedData;

  constructor(uint initVal) public {
    storedData = initVal;
  }

  function set(uint x) public {
    storedData = x;
  }

  function get() view public returns (uint retVal) {
    return storedData;
  }
}
```

```javascript
// File: `./migrations/2_deploy_simplestorage.js`

var SimpleStorage = artifacts.require("SimpleStorage");

module.exports = function(deployer) {
  // Pass 42 to the contract as the first constructor parameter
  deployer.deploy(SimpleStorage, 42, {privateFor: ["ROAZBWtSacxXQrOe3FGAqJDyJjFePR5ce4TSIzmJ0Bc="]})
};
```

```bash
truffle compile
truffle migrate
```

Για περισσότερα δες [εδώ](https://www.trufflesuite.com/guides/building-dapps-for-quorum-private-enterprise-blockchains) 

