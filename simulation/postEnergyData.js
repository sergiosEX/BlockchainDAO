
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

postEnergyData = () => {
    let orgName = 'org1'        
    let fileName = 'diploma.energy.data.' + orgName + '.csv'
    fs.readFile(fileName, 'utf8', async (err,data) => {
        if (err)  
        return console.log(err)
        let lines = data.split('\n')
        lines = lines.slice(3)
        for (let day=1; day<=2; day++){
            await postEnergyDataPerDay(lines.slice(96*(day-1), 96*day))
            await getCounter()
            await getEnergyData()
        }
    })

}

postEnergyDataPerDay = async (lines) => {
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
let account
let k

main = async () => {
    try {
        EnergyDataInstance = await contracts.EnergyData.deployed()
        let accounts = await web3.eth.getAccounts()
        account = accounts[0]
        await postEnergyData()
    } catch (err) {
        console.log(err);
    }
}

main()