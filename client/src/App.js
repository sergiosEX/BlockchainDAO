/* eslint eqeqeq: "off"*/
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { ButtonGroup , Button, Container, Row, Col, Card, Nav, Navbar } from "react-bootstrap";
import { VictoryAxis, VictoryLine, VictoryChart, VictoryTheme, VictoryLegend } from "victory";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const Web3 = require("web3")
const TruffleContract = require("@truffle/contract");

let port = process.env.REACT_APP_PORT;
let contractFile = process.env.REACT_APP_SM_FILE;
let url = 'ws://localhost:'+port;

class App extends React.Component {

    state = { 
        account: "", 
        EnergyDataInstance: {},
        VoteInstance: {},
        declarationDataDay: [],
        productionDataDay: [],
        declarationDataMonth: [],
        productionDataMonth: [],
        voteExists: false,
        winnerProposalName: "",
        message: "",
        mYes: 0,
        mNo: 0,
        declarationPercentage: 0,
        productionPercentage: 0,
        declarationSum: 0,
        productionSum: 0,
        loading: true,
        selectedDate: new Date(),
        selectedDay: '',
        selectedMonth: '', 
        selectedYear: ''
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

        this.setDate(this.state.selectedDate)

        let energyPercentage = await VoteInstance.getEnergyPercentage(account);
        let declarationPercentage = parseInt(String(energyPercentage['0']))
        let productionPercentage = parseInt(String(energyPercentage['1']))
        console.log("declarationPercentage:"+declarationPercentage);
        console.log("productionPercentage:"+productionPercentage);
        this.setState({ declarationPercentage, productionPercentage })

        let energySum = await VoteInstance.getEnergySum(account);
        let lastMonthDeclarationSum = energySum['0']
        let lastMonthProductionSum = energySum['1']
        console.log("lastMonthDeclarationSum before:"+lastMonthDeclarationSum);
        console.log("lastMonthProductionSum before:"+lastMonthProductionSum);
        if (lastMonthDeclarationSum == 0) {
            await this.getEnergyData() 
            let declarationSum = 0;
            let productionSum = 0;
            let { declarationDataMonth, productionDataMonth } = this.state;
            for (let index in declarationDataMonth){
                let declaration = declarationDataMonth[index]
                let production = productionDataMonth[index]
                declarationSum += declaration.y;
                productionSum += production.y;
            }
            declarationSum = Math.round(declarationSum)
            productionSum = Math.round(productionSum)
            console.log("this.state.declarationSum:"+declarationSum, typeof(declarationSum));
            console.log("this.state.productionSum:"+productionSum, typeof(productionSum));
            this.setState( { declarationSum, productionSum })
            await VoteInstance.setEnergySum(declarationSum, productionSum, {from: account})
            let _energySum = await VoteInstance.getEnergySum(account);
            lastMonthDeclarationSum = _energySum['0']
            lastMonthProductionSum = _energySum['1']
            console.log("lastMonthDeclarationSum after:"+lastMonthDeclarationSum);
            console.log("lastMonthProductionSum after:"+lastMonthProductionSum);
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
        let account = this.state.account;
        let energyPercentage = await VoteInstance.getEnergyPercentage(account)
        let declarationPercentage = parseInt(String(energyPercentage['0']))
        let productionPercentage = parseInt(String(energyPercentage['1']))
        console.log("declarationPercentage in updateState:"+declarationPercentage);
        console.log("productionPercentage in updateState:"+productionPercentage);
        
        this.setState({ voteExists, message, mYes, mNo, winnerProposalName, declarationPercentage, productionPercentage })
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

    getEnergyData = async() => {
        let { EnergyDataInstance } = this.state
        let declarationDataDay = []
        let productionDataDay = []
        let dayInt
        let dayDeclarationSum = new Array(31).fill(0);
        let dayProductionSum = new Array(31).fill(0);
        let dayCounter = new Array(31).fill(0);
        let declarationDataMonth = []
        let productionDataMonth = []
        for(let i= 1; i<=96*31; i++) {
            try{
                let data = await EnergyDataInstance.getEnergyData(i)
                let timestamp = data["0"]
                let day_tmp = timestamp[6] + timestamp[7]
                let time = timestamp[8] + timestamp[9] + ':' + timestamp[10] + timestamp[11]
                let declaration = parseInt(data["1"])
                let production = parseInt(data["2"])
                if (day_tmp == this.state.selectedDay){
                    declarationDataDay.push({x: time, y: declaration})
                    productionDataDay.push({x: time, y: production})
                }
                dayInt = parseInt(day_tmp)
                dayDeclarationSum[dayInt-1] += declaration
                dayProductionSum[dayInt-1] += production
                dayCounter[dayInt-1] += 1
                if (dayCounter[dayInt-1] == 96){
                    declarationDataMonth.push({x: day_tmp, y: dayDeclarationSum[dayInt-1]/4})
                    productionDataMonth.push({x: day_tmp, y: dayProductionSum[dayInt-1]/4})
                }
            }catch(err){
                alert("Error in getEnergyData:"+err);
            }
        }
        const sortFunc = (a, b) => {
            if (a.x > b.x)
                return 1
            else 
                return -1
        }
        declarationDataDay.sort(sortFunc)
        productionDataDay.sort(sortFunc)
        console.log(dayCounter);
        this.setState({ declarationDataDay, productionDataDay, declarationDataMonth, productionDataMonth })
    }
    
    setDate(selectedDate) {
        var selectedDay = String(selectedDate.getDate()).padStart(2, '0');
        let selectedMonth = String(selectedDate.getMonth() + 1).padStart(2, '0');
        let selectedYear = selectedDate.getFullYear();
        this.setState({ selectedDate, selectedDay, selectedMonth, selectedYear })
        this.getEnergyData() //TODO: is this necessary
    }

    render() {
        let {
            winnerProposalName,
            declarationDataDay, 
            productionDataDay, 
            declarationDataMonth,
            productionDataMonth,
            voteExists, 
            message, 
            mYes, 
            mNo,
            account,
            declarationPercentage,
            productionPercentage,
            loading,
            selectedDay, 
            selectedDate, 
            selectedMonth, 
            selectedYear
        } = this.state


        let A = () => {
          if (voteExists) {
            return (
                <Container>
                    <p>Result: {winnerProposalName}</p>
                    <ButtonGroup>
                        <Button onClick={() => this.postVote(0)}>vote yes</Button>
                        <Button onClick={() => this.postVote(1)}>vote no</Button>
                        <Button onClick={() => this.updateVoteState()}>refresh vote</Button>
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
                        <Navbar.Text> My declaration Percentage: {declarationPercentage}, My production Percentage: {productionPercentage} </Navbar.Text>
                    </Navbar>
                    <br/>
                    <p>My vote: {message}</p>
                    <A/>
                    <Button onClick={() => this.createVote()}>create vote</Button>
                    <Button onClick={() => this.updateState()}>refresh</Button>
                    <p>Board: Yes: {mYes} No:{mNo}</p>
                    Please select a Date:
                    <DatePicker selected={selectedDate} onChange={(date) => this.setDate(date)} />
                    <br/><br/>
                    <Row >
                        <Col sm={6}>
                            <Card>
                                <Card.Header>
                                    THIS DAY <br/>
                                    Day: {selectedDay}, Month: {selectedMonth}, Year: {selectedYear}
                                </Card.Header>
                                <Card.Body>
                                    <VictoryChart theme={VictoryTheme.material}>
                                        <VictoryLegend x={80}
                                            orientation="horizontal"
                                            gutter={20}
                                            style={{ border: { stroke: "black" }, title: {fontSize: 20 } }}
                                            data={[
                                                { name: "Declaration", symbol: { fill: "red" } },
                                                { name: "Production", symbol: { fill: "blue" } }
                                            ]}
                                        />
                                        <VictoryAxis crossAxis
                                            domain={[0, 96]}
                                            label="time"
                                            style={{tickLabels: {angle: 270, fontSize: 3}, axisLabel: {fontSize: 14, padding: 30}}}
                                            />
                                        <VictoryAxis dependentAxis crossAxis
                                            label="Energy (MWH)"
                                            style={{tickLabels: {angle: 270, fontSize: 8}, axisLabel: {fontSize: 14, padding: 30}}}
                                            />
                                        <VictoryLine
                                            style={{
                                                data: { stroke: "red" },
                                                parent: { border: "1px solid #ccc"}
                                            }}
                                            data={declarationDataDay}
                                        />
                                        <VictoryLine
                                            style={{
                                                data: { stroke: "blue" },
                                                parent: { border: "1px solid #ccc"}
                                            }}
                                            data={productionDataDay}
                                        />
                                    </VictoryChart>
                                </Card.Body>
                            </Card>
                        </Col>
                        <Col sm={6}>
                            <Card>
                                <Card.Header>
                                    THIS MONTH <br/>
                                    Month: {selectedMonth}, Year: {selectedYear}
                                </Card.Header>
                                <Card.Body>
                                    <VictoryChart theme={VictoryTheme.material}>
                                        <VictoryAxis crossAxis
                                            domain={[0, 31]}
                                            label="day"
                                            style={{tickLabels: {angle: 270, fontSize: 3}, axisLabel: {fontSize: 14, padding: 30}}}
                                        />
                                        <VictoryAxis dependentAxis crossAxis
                                            label="Average Energy (MWH)"
                                            style={{tickLabels: {angle: 270, fontSize: 8}, axisLabel: {fontSize: 14, padding: 30}}}
                                        />
                                        <VictoryLine
                                            style={{
                                                data: { stroke: "red" },
                                                parent: { border: "1px solid #ccc"}
                                            }}
                                            data={declarationDataMonth}
                                        />
                                        <VictoryLine
                                            style={{
                                                data: { stroke: "blue" },
                                                parent: { border: "1px solid #ccc"}
                                            }}
                                            data={productionDataMonth}
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
