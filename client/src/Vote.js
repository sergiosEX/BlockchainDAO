import React from "react";

class Vote extends React.Component {

  state = { accountNum: 1, voteExistsHash: null, winningProposal: "", isFinishedHash: null, messageHash: null, mYesHash: null, mNoHash: null};

  componentDidMount() {
    const { drizzle } = this.props;
    const contract = drizzle.contracts.Vote;

    // let drizzle know we want to watch the `myString` method
    const voteExistsHash = contract.methods["voteExists"].cacheCall();
    const isFinishedHash = contract.methods["isFinished"].cacheCall();
    const messageHash = contract.methods["message"].cacheCall();
    const mYesHash = contract.methods["mYes"].cacheCall();
    const mNoHash = contract.methods["mNo"].cacheCall();

    this.setState({ voteExistsHash })
    this.setState({ isFinishedHash })
    this.setState({ messageHash })
    this.setState({ mYesHash })
    this.setState({ mNoHash })
  };
    
  createVote() {
    const { drizzle, drizzleState } = this.props;
    const contract = drizzle.contracts.Vote;
    contract.methods["createVote"].cacheSend({
      from: drizzleState.accounts[this.state.accountNum] // TODO : fix the number accordingly
    });
  };

  postVote(proposal) {
    const { drizzle, drizzleState } = this.props;
    const contract = drizzle.contracts.Vote;
    contract.methods["postVote"].cacheSend(proposal, {
      from: drizzleState.accounts[this.state.accountNum]
    });

  };

  getWinningProposal() {
    const { drizzle, drizzleState } = this.props;
    const contract = drizzle.contracts.Vote;
    const { Vote } = this.props.drizzleState.contracts;
    const winningProposal = contract.methods["getWinningProposal"].cacheSend({
      from: drizzleState.accounts[this.state.accountNum]
    });
    
    let isFinished = Vote.isFinished[this.state.isFinishedHash];
    isFinished = Boolean(isFinished && isFinished.value);
    
    if(isFinished){
      this.setState({winningProposal:  winningProposal && winningProposal.value})
    } else {
      this.setState({winningProposal: "Vote not finished!"})
    }
  };

  render() {
    const { Vote } = this.props.drizzleState.contracts;
    let voteExists = Vote.voteExists[this.state.voteExistsHash];
    voteExists = Boolean(voteExists && voteExists.value);
    let message = Vote.message[this.state.messageHash];
    message = message && message.value;
    let mYes = Vote.mYes[this.state.mYesHash];
    mYes = mYes && mYes.value;
    let mNo = Vote.mNo[this.state.mNoHash];
    mNo = mNo && mNo.value;
    // return <p>Vote Exists: {value.toString()}</p>
    if (voteExists) {
      return(
        <div>
          <p>My vote: {message}</p>
          <p>Result: {this.state.winningProposal}</p>
          <button onClick={() => this.postVote(0)}>vote yes</button>
          <button onClick={() => this.postVote(1)}>vote no</button>
          <button onClick={() => this.getWinningProposal()}>refresh</button>
          <button onClick={() => this.createVote()}>create vote</button>
          <p>Board: Yes: {mYes} No:{mNo}</p>
        </div>
      )
    }
    else 
      return (
        <div>
          <p>My vote: {message}</p>
          <button onClick={() => this.createVote()}>create vote</button>
          <p>Board: Yes: {mYes} No:{mNo}</p>
        </div>
      )
    }
}

export default Vote;