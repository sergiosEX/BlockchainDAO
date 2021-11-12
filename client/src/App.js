import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { ButtonGroup , Button, Container, Form, Card,  } from "react-bootstrap";
import { VictoryAxis, VictoryLine, VictoryChart, VictoryTheme } from "victory";

const Web3 = require("web3")
const TruffleContract = require("@truffle/contract");

class App extends React.Component {

    state = { 
        winningProposal: "", 
        day: "",
        account: "", 
        EnergyDataInstance: {},
        VoteInstance: {},
        dayItems: [], 
        isConnected: false,
        energyDataDay: [],
        energyDataMonth: [],
        voteExists: false,
        message: "",
        mYes: 0,
        mNo: 0
    };

    componentDidMount = async () => {
        let port = "8551"
        let web3Provider = 'ws://localhost:'+port;
        let web3 = new Web3(web3Provider);

        let contractFile = 'EnergyData.json'
        const EnergyData = require("./contracts/"+contractFile)
        const Vote = require("./contracts/Vote.json")

        let EnergyDataArtifact = EnergyData;
        let VoteArtifact = Vote;

        let contracts = {}
        contracts.EnergyData = TruffleContract(EnergyDataArtifact);
        contracts.Vote = TruffleContract(VoteArtifact);
        contracts.EnergyData.setProvider(web3Provider);
        contracts.Vote.setProvider(web3Provider);

        let accounts = await web3.eth.getAccounts()
        let account = accounts[0]

        let VoteInstance = await contracts.Vote.deployed()
        let EnergyDataInstance = await contracts.EnergyData.deployed()
        this.setState({ account, EnergyDataInstance, VoteInstance, isConnected: true })

        let dayItems = []
        for(let i=1; i<31; i++)
        dayItems[i] = i
        this.setState({ dayItems })
    };
    
    updateState = async() => {
        let { VoteInstance } = this.state
        let voteExists = await VoteInstance.voteExists()
        let message = await VoteInstance.message()
        let mYes = await VoteInstance.mYes()
        mYes = parseInt(mYes)
        let mNo = await VoteInstance.mNo()
        mNo = parseInt(mNo)

        this.setState({ voteExists, message, mYes, mNo })
    }

    createVote = async() => {
        let { VoteInstance, account } = this.state
        await VoteInstance.createVote({ from: account });
        this.updateState()
    };

    postVote = async(proposal) => {
        let { VoteInstance, account } = this.state
        await VoteInstance.postVote(proposal, { from: account });
        this.updateState()
    };

    getWinningProposal = async() => {
        let { VoteInstance, account } = this.state
        const winningProposal = await VoteInstance.getWinningProposal({ from: account });

        let isFinished = await VoteInstance.isFinished()
        
        if(isFinished){
            this.setState({ winningProposal})
        } else {
            this.setState({ winningProposal: "Vote not finished!" })
        }
        this.updateState()
    };

    onSelectDay = async(event) => {
        let day = event.target.value
        day = (day <= 9) ? ("0"+day) : day;
        await this.setState({ day })
        this.getEnergyData()
    } 
  
    getEnergyData = async() => {
        let { EnergyDataInstance, day } = this.state
        let energyDataDay = []
        let dayInt
        let dayEnergySum = new Array(32).fill(0);
        let dayCounter = new Array(32).fill(0);
        let energyDataMonth = []
        for(let i= 1; i<=96*31; i++) {
            try{
                let data = await EnergyDataInstance.getEnergyData(i)
                let timestamp = data["0"]
                let day_tmp = timestamp[6] + timestamp[7]
                let time = timestamp[8] + timestamp[9] + ':' + timestamp[10] + timestamp[11]
                let energy = parseInt(data["1"])
                if (day_tmp == day)
                    energyDataDay.push({x: time, y: energy})
                dayInt = parseInt(day_tmp)
                dayEnergySum[dayInt] += energy
                dayCounter[dayInt] += 1
                if (dayCounter[dayInt] == 96){
                    energyDataMonth.push({x: day_tmp, y: dayEnergySum[dayInt]/4})
                }
            }catch(err){
                alert("Error in getEnergyData:"+err);
            }
        }
        console.log(dayCounter);
        this.setState({ energyDataDay, energyDataMonth })
    }

    render() {
        let {
            isConnected, 
            winningProposal, 
            dayItems, 
            day, 
            energyDataDay, 
            energyDataMonth,
            voteExists, 
            message, 
            mYes, 
            mNo
        } = this.state
        console.log(energyDataDay);
        console.log(energyDataMonth);


        let A = () => {
          if (voteExists) {
            return (
                <Container>
                    <p>Result: {winningProposal}</p>
                    <ButtonGroup>
                        <Button onClick={() => this.postVote(0)}>vote yes</Button>
                        <Button onClick={() => this.postVote(1)}>vote no</Button>
                        <Button onClick={() => this.getWinningProposal()}>refresh</Button>
                    </ButtonGroup>
                </Container>
            )
          } else  {
            return (<Container/>)
          }
        } 

        if (isConnected){
            return(
                <Container>
                    <p>My vote: {message}</p>
                    <A/>
                    <Button onClick={() => this.createVote()}>create vote</Button>
                    <p>Board: Yes: {mYes} No:{mNo}</p>
                    <Form>
                    <Form.Label>Select a day !</Form.Label>
                    <Form.Control as="select" onChange={(e) => this.onSelectDay(e)}>
                        <option value={0} key={0}>Choose...</option>
                        {dayItems.map(item => 
                            <option value={item} key={item}>{item}</option>
                        )}
                    </Form.Control>
                    </Form>
                    <Card>
                    <Card.Header>
                        TODAY <br/>
                        Day: {day}, Month: January, Year: 2021
                    </Card.Header>
                    <Card.Body>
                        <VictoryChart theme={VictoryTheme.material}>
                        <VictoryAxis crossAxis
                            domain={[0, 96]}
                            label="time"
                            style={{tickLabels: {angle: 270, fontSize: 3}, axisLabel: {fontSize: 14, padding: 30}}}
                            />
                        <VictoryAxis dependentAxis crossAxis
                            label="Energy Power (MW)"
                            style={{tickLabels: {angle: 270, fontSize: 8}, axisLabel: {fontSize: 14, padding: 30}}}
                            />
                        <VictoryLine
                            style={{
                                data: { stroke: "#c43a31" },
                                parent: { border: "1px solid #ccc"}
                            }}
                            data={energyDataDay}
                            />
                        </VictoryChart>
                    </Card.Body>
                    </Card>
                    <Card>
                    <Card.Header>
                        THIS MONTH <br/>
                        Month: January, Year: 2021
                    </Card.Header>
                    <Card.Body>
                        <VictoryChart theme={VictoryTheme.material}>
                        <VictoryAxis crossAxis
                            domain={[0, 31]}
                            label="day"
                            style={{tickLabels: {angle: 270, fontSize: 3}, axisLabel: {fontSize: 14, padding: 30}}}
                        />
                        <VictoryAxis dependentAxis crossAxis
                            label="Average Energy Power (MW)"
                            style={{tickLabels: {angle: 270, fontSize: 8}, axisLabel: {fontSize: 14, padding: 30}}}
                        />
                        <VictoryLine
                            style={{
                            data: { stroke: "#c43a31" },
                            parent: { border: "1px solid #ccc"}
                            }}
                            data={energyDataMonth}
                            />
                        </VictoryChart>
                    </Card.Body>
                    </Card>
                </Container>
            )
        } else {
            return(<p>Loading...</p>)
        }
    }
}

export default App;
