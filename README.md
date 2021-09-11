# Blockchain DAO

## How to run the sample 7nodes quorum network

Αρχικά θα χρειαστούμε το docker-desktop, to wsl, nvm, npm, truffle.

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

## Setting up a Truffle project with React and Drizzle from scratch

Ο οδηγός αυτός βρίσκεται με μεγαλύτερη λεπτομέρεια [εδώ](https://www.trufflesuite.com/guides/getting-started-with-drizzle-and-react)

```solidity
// File: `./contracts/MyStringStore.sol

pragma solidity ^0.5.16;

contract MyStringStore {
  string public myString = "Hello World";

  function set(string memory x) public {
    myString = x;
  }
}
```

```
~/BlockchainDAO$ truffle develop
truffle(develop)> compile
```

```solidity
// File: `./migrations/3_deploy_contracts.js

const MyStringStore = artifacts.require("MyStringStore");

module.exports = function(deployer) {
  deployer.deploy(MyStringStore);
};
```

```
truffle(develop)> migrate
```

```javascript
// File: `./test/MyStringStore.js

const MyStringStore = artifacts.require("./MyStringStore.sol");

contract("MyStringStore", accounts => {
  it("should store the string 'Hey there!'", async () => {
    const myStringStore = await MyStringStore.deployed();

    // Set myString to "Hey there!"
    await myStringStore.set("Hey there!", { from: accounts[0] });

    // Get myString from public variable getter
    const storedString = await myStringStore.myString.call();

    assert.equal(storedString, "Hey there!", "The string was not stored");
  });
});
```

```
truffle(develop)> test
```

```
~/BlockchainDAO$ npx create-react-app client
```

```js
// please add the following in the File:`./truffle-config.js

const path = require("path");

module.exports = {
  contracts_build_directory: path.join(__dirname, "client/src/contracts")
};
```

Please restart the truffle develop console!

```
~/BlockchainDAO$ truffle develop
truffle(develop)> compile
truffle(develop)> migrate --reset
```

```sh
~/BlockchainDAO/client$ npm install @drizzle/store
~/BlockchainDAO/client$ npm start
```

```react
// Please change the File: `./client/src/index.js`

import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';

// import drizzle functions and contract artifact
import { Drizzle } from "@drizzle/store";
import MyStringStore from "./contracts/MyStringStore.json";

// let drizzle know what contracts we want and how to access our test blockchain
const options = {
  contracts: [MyStringStore],
  web3: {
    fallback: {
      type: "ws",
      url: "ws://127.0.0.1:9545",
    },
  },
};

// setup the drizzle store and drizzle
const drizzle = new Drizzle(options);

ReactDOM.render(<App drizzle={drizzle} />, document.getElementById('root'));
```



```react
// File: `client/src/App.js`

import './App.css';
import { Component } from 'react';
import ReadString from "./ReadString";
import SetString from "./SetString";

class App extends Component {
  state = { loading: true, drizzleState: null };

  componentDidMount() {
    const { drizzle } = this.props;

    // subscribe to changes in the store
    this.unsubscribe = drizzle.store.subscribe(() => {

      // every time the store updates, grab the state from drizzle
      const drizzleState = drizzle.store.getState();

      // check to see if it's ready, if so, update local component state
      if (drizzleState.drizzleStatus.initialized) {
        this.setState({ loading: false, drizzleState });
      }
    });
  }

  componentWillUnmount() {
    this.unsubscribe();
  }

 render() {
    if (this.state.loading) return "Loading Drizzle...";
    return (
      <div className="App">
        <ReadString
          drizzle={this.props.drizzle}
          drizzleState={this.state.drizzleState}
        />
        <SetString
          drizzle={this.props.drizzle}
          drizzleState={this.state.drizzleState}
        />
      </div>
    );
 }
}

export default App;
```

```react
// File: `client/src/ReadString.js

import React from "react";

class ReadString extends React.Component {
  state = { dataKey: null };

  componentDidMount() {
    const { drizzle } = this.props;
    const contract = drizzle.contracts.MyStringStore;

    // let drizzle know we want to watch the `myString` method
    const dataKey = contract.methods["myString"].cacheCall();

    // save the `dataKey` to local component state for later reference
    this.setState({ dataKey });
  }

  render() {
    // get the contract state from drizzleState
    const { MyStringStore } = this.props.drizzleState.contracts;

    // using the saved `dataKey`, get the variable we're interested in
    const myString = MyStringStore.myString[this.state.dataKey];

    // if it exists, then we display its value
    return <p>My stored string: {myString && myString.value}</p>;
  }
}

export default ReadString;
```

```react
// File: `client/src/SetString.js`

import React from "react";

class SetString extends React.Component {
  state = { stackId: null };

  handleKeyDown = e => {
    // if the enter key is pressed, set the value with the string
    if (e.keyCode === 13) {
      this.setValue(e.target.value);
    }
  };

  setValue = value => {
    const { drizzle, drizzleState } = this.props;
    const contract = drizzle.contracts.MyStringStore;

    // let drizzle know we want to call the `set` method with `value`
    const stackId = contract.methods["set"].cacheSend(value, {
      from: drizzleState.accounts[0]
    });

    // save the `stackId` for later reference
    this.setState({ stackId });
  };

  getTxStatus = () => {
    // get the transaction states from the drizzle state
    const { transactions, transactionStack } = this.props.drizzleState;

    // get the transaction hash using our saved `stackId`
    const txHash = transactionStack[this.state.stackId];

    // if transaction hash does not exist, don't display anything
    if (!txHash) return null;

    // otherwise, return the transaction status
    return `Transaction status: ${transactions[txHash] && transactions[txHash].status}`;
  };

  render() {
    return (
      <div>
        <input type="text" onKeyDown={this.handleKeyDown} />
        <div>{this.getTxStatus()}</div>
      </div>
    );
  }
}

export default SetString;
```

