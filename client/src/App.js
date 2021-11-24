/* eslint eqeqeq: "off"*/
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { ButtonGroup , Button, Container, Row, Col, Form, Card, Nav, Navbar } from "react-bootstrap";
import { VictoryAxis, VictoryLine, VictoryChart, VictoryTheme } from "victory";

const Web3 = require("web3")
const TruffleContract = require("@truffle/contract");

let port = process.env.REACT_APP_PORT;
let contractFile = process.env.REACT_APP_SM_FILE;
let url = 'ws://localhost:'+port;

class App extends React.Component {

    state = { 
        day: "",
        account: "", 
        EnergyDataInstance: {},
        VoteInstance: {},
        dayItems: [], 
        energyDataDay: [],
        energyDataMonth: [],
        voteExists: false,
        winnerProposalName: "",
        message: "",
        mYes: 0,
        mNo: 0,
        energyPercentage: 0,
        energySum: 0,
        loading: true
    };

    componentDidMount = async () => {
        let web3 = new Web3(url);

        const EnergyData = require("./contracts/"+contractFile)
        const Vote = require("./contracts/Vote.json")

        let EnergyDataArtifact = EnergyData;
        let VoteArtifact = Vote;

        let contracts = {}
        contracts.EnergyData = TruffleContract(EnergyDataArtifact);
        contracts.Vote = TruffleContract(VoteArtifact);
        contracts.EnergyData.setProvider(url);
        contracts.Vote.setProvider(url);

        let accounts = await web3.eth.getAccounts()
        let account = accounts[0]

        let VoteInstance = await contracts.Vote.deployed()
        let EnergyDataInstance = await contracts.EnergyData.deployed()
        this.setState({ account, EnergyDataInstance, VoteInstance })

        let dayItems = []
        for(let i=1; i<31; i++)
        dayItems[i] = i
        this.setState({ dayItems })

        let energyPercentage = await VoteInstance.getEnergyPercentage();
        energyPercentage = parseInt(String(energyPercentage))
        console.log(energyPercentage, typeof(energyPercentage));
        this.setState({ energyPercentage })

        let lastMonthEnergySum = await VoteInstance.getEnergySum();
        if (lastMonthEnergySum == 0) {
            await this.getEnergyData()
            let energySum = 0;
            let { energyDataMonth } = this.state;
            for (let index in energyDataMonth){
                let item = energyDataMonth[index]
                console.log(item.y);
                energySum += item.y;
            }
            energySum = Math.round(energySum)
            this.setState( { energySum })
            await VoteInstance.setEnergySum(energySum, {from: account})
        }

        await this.updateState()
        this.setState({ loading: false})
    };
    
    updateState = async() => {
        let { VoteInstance } = this.state
        let voteExists = await VoteInstance.voteExists()
        let winnerProposalName = await VoteInstance.winnerProposalName();
        let message = await VoteInstance.message()
        let mYes = await VoteInstance.mYes()
        mYes = parseInt(mYes)
        let mNo = await VoteInstance.mNo()
        mNo = parseInt(mNo)
        let energyPercentage = await VoteInstance.getEnergyPercentage()
        energyPercentage = parseInt(String(energyPercentage))
        console.log(energyPercentage);
        
        this.setState({ voteExists, message, mYes, mNo, winnerProposalName, energyPercentage })
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

    updateVoteState = async() => {
        let { VoteInstance, account } = this.state
        await VoteInstance.updateVoteState({ from: account });
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
        let dayEnergySum = new Array(31).fill(0);
        let dayCounter = new Array(31).fill(0);
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
                dayEnergySum[dayInt-1] += energy
                dayCounter[dayInt-1] += 1
                if (dayCounter[dayInt-1] == 96){
                    energyDataMonth.push({x: day_tmp, y: dayEnergySum[dayInt-1]/4})
                }
            }catch(err){
                alert("Error in getEnergyData:"+err);
            }
        }
        energyDataDay.sort((a, b) => {
            if (a.x > b.x)
                return 1
            else 
                return -1
        })
        console.log(dayCounter);
        this.setState({ energyDataDay, energyDataMonth })
    }

    render() {
        let {
            winnerProposalName, 
            dayItems, 
            day, 
            energyDataDay, 
            energyDataMonth,
            voteExists, 
            message, 
            mYes, 
            mNo,
            account,
            energyPercentage,
            loading
        } = this.state


        let A = () => {
          if (voteExists) {
            return (
                <Container>
                    <p>Result: {winnerProposalName}</p>
                    <ButtonGroup>
                        <Button onClick={() => this.postVote(0)}>vote yes</Button>
                        <Button onClick={() => this.postVote(1)}>vote no</Button>
                        <Button onClick={() => this.updateVoteState()}>refresh</Button>
                    </ButtonGroup>
                </Container>
            )
          } else  {
            return (<Container/>)
          }
        } 
        if (!loading){
            return(
                <Container>
                    <Navbar bg="dark" expand="lg" variant="dark" className="justify-content-between">
                        <Nav>
                            <Navbar.Text>Signed in as: {account}, url={url}</Navbar.Text>
                        </Nav>
                        <Navbar.Text> My production Percentage: {energyPercentage} </Navbar.Text>
                    </Navbar>
                    <br/>
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
                    <Row >
                        <Col sm={6}>
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
                        </Col>
                        <Col sm={6}>
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
                        </Col>
                    </Row>
                </Container>
            )
        } else {
            return(<p>Loading...</p>)
        }
    }
}

export default App;
