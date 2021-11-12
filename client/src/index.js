import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';

// import drizzle functions and contract artifact
import { Drizzle } from "@drizzle/store";
import MyStringStore from "./contracts/MyStringStore.json";
import Vote from "./contracts/Vote.json";
import EnergyData from "./contracts/EnergyData.json";

// let drizzle know what contracts we want and how to access our test blockchain
const options = {
  contracts: [MyStringStore, Vote, EnergyData],
  web3: {
    fallback: {
      type: "ws",
      url: "ws://127.0.0.1:8551",
    },
  }
};

// setup the drizzle store and drizzle
const drizzle = new Drizzle(options);

ReactDOM.render(<App drizzle={drizzle} />, document.getElementById('root'));