import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { Button, Container, Form, Card,  } from "react-bootstrap";
import { VictoryAxis, VictoryLine, VictoryChart, VictoryTheme } from "victory";

class Vote extends React.Component {

  state = { 
    voteExistsHash: null, 
    winningProposal: "", 
    isFinishedHash: null, 
    messageHash: null, 
    mYesHash: null, 
    mNoHash: null, 
    day: "",
    dayItems: [], 
    energyDataDay: [],
    energyDataMonth: [],
  };

  componentDidMount() {
    const Vote = this.props.drizzle.contracts.Vote;
    const voteExistsHash = Vote.methods["voteExists"].cacheCall();
    const isFinishedHash = Vote.methods["isFinished"].cacheCall();
    const messageHash = Vote.methods["message"].cacheCall();
    const mYesHash = Vote.methods["mYes"].cacheCall();
    const mNoHash = Vote.methods["mNo"].cacheCall();
    this.setState({ voteExistsHash, isFinishedHash, messageHash, mYesHash, mNoHash })
    
    let dayItems = []
    for(let i=1; i<31; i++)
      dayItems[i] = i
    this.setState({ dayItems })
  };
    
  createVote() {
    this.props.drizzle.contracts.Vote.methods["createVote"].cacheSend({ from: this.props.drizzleState.accounts[0] });
  };

  postVote(proposal) {
    this.props.drizzle.contracts.Vote.methods["postVote"].cacheSend(proposal, { from: this.props.drizzleState.accounts[0] });
  };

  getWinningProposal() {
    const { isFinishedHash }  = this.state
    const drizzleState = this.props.drizzleState
    const winningProposal = this.props.drizzle.contracts.Vote.methods["getWinningProposal"].cacheSend({ from: drizzleState.accounts[0] });

    let isFinished = drizzleState.contracts.Vote.isFinished[isFinishedHash];
    isFinished = Boolean(isFinished && isFinished.value);
    
    if(isFinished){
      this.setState({ winningProposal:  winningProposal && winningProposal.value })
    } else {
      this.setState({ winningProposal: "Vote not finished!" })
    }
  };

  onSelectDay = (event) => {
    let day = event.target.value
    day = (day <= 9) ? ("0"+day) : day;
    this.setState({ day })
    this.getEnergyData()
  } 
  
  getEnergyData = async() => {
    let energyDataDay = []
    let daySum = 0
    let energyDataMonth = []
    for(let i= 1; i<=384; i++) {
      try{
        let data = await this.props.drizzle.contracts.EnergyData.methods.getEnergyData(i).call()
        let timestamp = data["0"]
        let day = timestamp[6] + timestamp[7]
        let time = timestamp[8] + timestamp[9] + ':' + timestamp[10] + timestamp[11]
        let energy = parseInt(data["1"])
        if (day == this.state.day)
          energyDataDay.push({x: time, y: energy})
        daySum += energy
        if (time == "23:45"){
          energyDataMonth.push({x: day, y: daySum/4})
          daySum = 0
        }
      }catch(err){
        alert("Error in getEnergyData:"+err);
      }
    }
    this.setState({
      energyDataDay,
      energyDataMonth
    })
  }

  render() {
    const { 
      voteExistsHash, 
      messageHash, 
      mYesHash, 
      mNoHash, 
      winningProposal, 
      dayItems, 
      day, 
      energyDataDay, 
      energyDataMonth,
    } = this.state;
    console.log(energyDataMonth);
    const Vote = this.props.drizzleState.contracts.Vote;
    let voteExists = Vote.voteExists[voteExistsHash];
    voteExists = Boolean(voteExists && voteExists.value);
    let message = Vote.message[messageHash];
    message = message && message.value;
    let mYes = Vote.mYes[mYesHash];
    mYes = mYes && mYes.value;
    let mNo = Vote.mNo[mNoHash];
    mNo = mNo && mNo.value;

    let A = () => {
      if (voteExists) {
        return (
          <Container>
            <p>Result: {winningProposal}</p>
            <Button onClick={() => this.postVote(0)}>vote yes</Button>
            <Button onClick={() => this.postVote(1)}>vote no</Button>
            <Button onClick={() => this.getWinningProposal()}>refresh</Button>
          </Container>
        )
      } else  {
        return (<Container/>)
      }
    } 
    
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
  }
}

export default Vote;