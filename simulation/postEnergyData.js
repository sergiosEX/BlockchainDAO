
const EnergyData = require("../client/src/contracts/EnergyData.json")
const Web3 = require("web3")
const TruffleContract = require("@truffle/contract");
const fs = require("fs");

let web3Provider = 'ws://localhost:9545';
// let web3Provider = 'http://localhost:22000';
let web3 = new Web3(web3Provider);

let EnergyDataArtifact = EnergyData;
let contracts = {}

contracts.EnergyData = TruffleContract(EnergyDataArtifact);
contracts.EnergyData.setProvider(web3Provider);

postEnergyData = async (orgName, account) => {
    let fileName = 'diploma.energy.data.' + orgName + '.csv'
    let lines
    try {
        lines = fs.readFileSync(fileName, 'utf8')
    } catch (err) {
        console.error(err)
    }
    lines = lines.split('\n')
    lines = lines.slice(3)
    for (let day=1; day<=2; day++){
        await postEnergyDataPerDay(lines.slice(96*(day-1), 96*day), account)
        await getCounter()
        await getEnergyData()
    }

}

postEnergyDataPerDay = async (lines, account) => {
    lines.forEach(  line => {
        let [timestamp, energy] = line.split('\n')[0].split(', ')
        try {
            EnergyDataInstance.postEnergyData(timestamp, energy, {from: account})
        } catch(err) {
            console.log("Error in postEnergyData:"+err);
        }
    })
}

getCounter = async () => {
    try{
        k = await EnergyDataInstance.getEnergyCounter()
        k = parseInt(k)
        console.log(k);
    } catch(err){
        console.log("Error in getEnergyCounter:"+err)
    }
}

getEnergyData = async () => {
    for(let i= k+1; i<= k+96; i++) {
        try{
            console.log(await EnergyDataInstance.getEnergyData(i));
        }catch(err){
            console.log("Error in getEnergyData:"+err);
        }
    }
}

let EnergyDataInstance
let k

main = async () => {
    try {
        EnergyDataInstance = await contracts.EnergyData.deployed()
        let accounts = await web3.eth.getAccounts()
        await postEnergyData('org1', accounts[0])
        EnergyDataInstance = await contracts.EnergyData.deployed()
        await postEnergyData('org2', accounts[1])
        // EnergyDataInstance = await contracts.EnergyData.deployed()
        // await postEnergyData('org3', accounts[2])
        // EnergyDataInstance = await contracts.EnergyData.deployed()
        // await postEnergyData('org4', accounts[3])
    } catch (err) {
        console.log(err);
    }
}

main()