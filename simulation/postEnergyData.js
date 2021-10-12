
const EnergyData = require("../client/src/contracts/EnergyData.json")
const Web3 = require("web3")
const TruffleContract = require("@truffle/contract");
const fs = require("fs");

let web3Provider = 'ws://localhost:9545';
let web3 = new Web3(web3Provider);

let EnergyDataArtifact = EnergyData;
let contracts = {}
contracts.EnergyData = TruffleContract(EnergyDataArtifact);

// // Set the provider for our contract
contracts.EnergyData.setProvider(web3Provider);

let EnergyDataInstance
let account

contracts.EnergyData.deployed().then(async instance => {
    EnergyDataInstance = instance
    return await getAccount();
})

getAccount = async () => {
    await web3.eth.getAccounts((error, accounts) => {
        if (error) {
            console.log(error);
        }
        account = accounts[0]
        
    })
    return await getLines()
}


getLines = () => {
    let orgName = 'org1'        
    let fileName = 'diploma.energy.data.' + orgName + '.csv'
    fs.readFile(fileName, 'utf8', async (err,data) => {
        if (err)  
        return console.log(err)
        let lines = data.split('\n')
        lines = lines.slice(3)
        //return await postEnergyDataPerDay(lines.slice(1, 5));
        for (let day=1; day<=31; day++){
            await postEnergyDataPerDay(lines.slice(96*(day-1)+1, 96*day))
        }
    })

}

// sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

postEnergyDataPerDay = async (lines) => {
    await lines.forEach( async  line => {
        let [timestamp, energy] = line.split('\n')[0].split(', ')
        await EnergyDataInstance.postEnergyData(timestamp, energy, {from: account})
        
    })
    return await getCounter();
    //console.log(await EnergyDataInstance.getEnergyCounter.call());
}

getCounter = async () => {
    let k = await EnergyDataInstance.getEnergyCounter()
    k = parseInt(k)
    // for(let i = 1; i<=k; i++){
    //     console.log(await EnergyDataInstance.getEnergyData(i));
    // }
    console.log(k);
    // console.log(await EnergyDataInstance.getEnergyData(k+1));
    // console.log(await EnergyDataInstance.getEnergyData(k+2));
    // console.log(await EnergyDataInstance.getEnergyData(k+3));
    // console.log(await EnergyDataInstance.getEnergyData(k+4));
}