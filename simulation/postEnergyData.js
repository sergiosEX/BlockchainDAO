// const EnergyData = require("../client/src/contracts/EnergyData.json")
const Web3 = require("web3")
const TruffleContract = require("@truffle/contract");
const fs = require("fs");

// let EnergyDataArtifact = EnergyData;
// let contracts = {}
// contracts.EnergyData = TruffleContract(EnergyDataArtifact);

setPrerequisites = async (port, contractFile) => {
    // let web3Provider = 'ws://localhost:9545';
    // let web3Provider = 'http://localhost:22000';
    const EnergyData = require("../client/src/contracts/"+contractFile)
    let web3Provider = 'ws://localhost:'+port;
    let web3 = new Web3(web3Provider);
    let EnergyDataArtifact = EnergyData;
    contracts.EnergyData = TruffleContract(EnergyDataArtifact);
    contracts.EnergyData.setProvider(web3Provider);
    let accounts = await web3.eth.getAccounts()
    account = accounts[0]

    EnergyDataInstance = await contracts.EnergyData.deployed()
}

postEnergyData = async () => {
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
        await postEnergyDataPerDay(lines.slice(96*(day-1), 96*day))
    }
    
}

postEnergyDataPerDay = async (lines) => {
    lines.forEach(async line => {
        let [timestamp, energy] = line.split('\n')[0].split(', ')
        try {
            await EnergyDataInstance.postEnergyData(timestamp, energy, {from: account})
        } catch(err) {
            console.log("Error in postEnergyData:"+err);
        }
    })
}

getCounter = async () => {
    try{
        k = await EnergyDataInstance.getEnergyCounter()
        k = parseInt(k)
    } catch(err){
        console.log("Error in getEnergyCounter:"+err)
    }
}

getEnergyData = async () => {
    for(let i= 1; i<= 192; i++) {
        try{
            console.log(await EnergyDataInstance.getEnergyData(i));
        }catch(err){
            console.log("Error in getEnergyData:"+err);
        }
    }
}

let k
let orgName 
let account
let EnergyDataInstance
let contracts = {}

sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms))

main = async () => {
    let args = process.argv.slice(2)
    if (args.length != 1)
    console.log("Error: please give organization name as argument")
    else if (args[0] == 'org1' || args[0] == 'org2' || args[0] == 'org3' || args[0] == 'org4') {
        orgName = args[0]    
        let port
        if (orgName == 'org1'){
            await setPrerequisites(8551, "EnergyData.json")
        } else if (orgName == 'org2'){
            await setPrerequisites(8552, "EnergyData1.json")
        } else if (orgName == 'org3'){
            await setPrerequisites(8553, "EnergyData2.json")
        } else if (orgName == 'org4'){
            await setPrerequisites(8554, "EnergyData3.json")
        } try {
            await postEnergyData()   
            await getCounter()
            while (k < 192){
                sleep(1000)
                await getCounter()
            }
            await getEnergyData()
        } catch (err) {
            console.log(err);
        }
    } else
        console.log("Error: please give 'org1' or 'org2' or 'org3' or 'org4'")
}

main()