// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.5.16;

contract Vote {
    // my structs
    struct Voter {
        bool voted;  // if true, that person already voted
        uint vote;   // index of the voted proposal
    }

    struct Proposal {
        string name;   // short name (up to 32 bytes)
        uint voteCount; // number of accumulated votes
    }

    // my variables
    string public winnerProposalName = "";
    bool public voteExists = false;
    bool public isFinished = false;
    string public message = "";
    uint public mYes = 0;
    uint public mNo = 0;
    Proposal[] public proposals;
    uint16 public numVotesLeft = 4;
    
    //TODO you should inherit the addresses from sign up
    address org1 = 0xa7e2d1F80B92b75B3fd187490b2b01550043D0b3;
    address org2 = 0xa02A9A8D092a47dc4E7ABf569a9b392D0Ce07e43;
    address org3 = 0x448F178C88C0fC73eA74714b1e0494781548ff4C;
    address org4 = 0x7188D086E0415B0b394a67325Fc5c4534262e76a;
    
    // my mappings
    mapping(address => uint) public energyPercentage;
    mapping(address => uint) private energySum;
    mapping(address => Voter) public voters;
    
    // my modifiers
    modifier isOrg {
        require(msg.sender == org1 || msg.sender == org2 || msg.sender == org3 || msg.sender == org4, "This function is restricted to the addresses of the organizations");
        _;
    }

    // and finally: my functions()
    function getEnergyPercentage() public view returns (uint) {
        uint per = energyPercentage[msg.sender];
        return per;
    }

    function getEnergySum() public view returns (uint) {
        uint sum = energySum[msg.sender];
        return sum;
    }

    function setEnergySum(uint sum) public {
        energySum[msg.sender] = sum;
    }
    
    function createVote() public isOrg {   
        uint len = proposals.length;
        for(uint k = 0; k < len; k++){
            proposals.pop();
        }
        proposals.push(Proposal({
                name: "Yes",
                voteCount: 0
            }));
        proposals.push(Proposal({
                name: "No",
                voteCount: 0
            }));
        voteExists = true;
        winnerProposalName = "";
        message = "Vote created successfully!";
        mYes = proposals[0].voteCount;
        mNo = proposals[1].voteCount;
        
        Voter storage sender = voters[org1];
        sender.voted = false;
        sender = voters[org2];
        sender.voted = false;
        sender = voters[org3];
        sender.voted = false;
        sender = voters[org4];
        sender.voted = false;
        numVotesLeft = 4;
    }
      
    function postVote(uint proposal) public isOrg {
        Voter storage sender = voters[msg.sender];
        if(sender.voted){
            message = "Already voted.";
        } else {
            sender.voted = true;
            sender.vote = proposal;
            
            numVotesLeft -= 1;
            proposals[proposal].voteCount += 1;
            message = "Voted successfully!";
            mYes = proposals[0].voteCount;
            mNo = proposals[1].voteCount;
        }
    }

    function updateVoteState() public isOrg {
        if(proposals[0].voteCount > proposals[1].voteCount + numVotesLeft){
            isFinished = true;
        } else if (proposals[1].voteCount > proposals[0].voteCount + numVotesLeft){
            isFinished = true;
        } else {
            isFinished = false;
        }

        if(!isFinished){
            message = "Vote not finished!";
            mYes = proposals[0].voteCount;
            mNo = proposals[1].voteCount;
            winnerProposalName = "";
        } else if ( keccak256(bytes(winnerProposalName)) == keccak256(bytes("")) ){ //winnerProposalName == ""
            uint winningProposal_;
            voteExists = false;
            uint winningVoteCount = 0;
            for (uint p = 0; p < proposals.length; p++) {
                if (proposals[p].voteCount > winningVoteCount) {
                    winningVoteCount = proposals[p].voteCount;
                    winningProposal_ = p;
                }
            }
            mYes = proposals[0].voteCount;
            mNo = proposals[1].voteCount;
            winnerProposalName = proposals[winningProposal_].name;

            if ( keccak256(bytes(winnerProposalName)) == keccak256(bytes("Yes")) ){ //winnerProposalName == "Yes"
                uint energySumAll = energySum[org1] + energySum[org2] + energySum[org3] + energySum[org4];
                energyPercentage[org1] = calculatePercentage(energySum[org1], energySumAll);
                energyPercentage[org2] = calculatePercentage(energySum[org2], energySumAll);
                energyPercentage[org3] = calculatePercentage(energySum[org3], energySumAll);
                energyPercentage[org4] = calculatePercentage(energySum[org4], energySumAll);
                message = "The vote is done. The result is Yes.";
            } else {
                message = "The vote is done. The result is No";
            }
        }
    }

    function calculatePercentage( uint sum, uint sumAll ) private returns (uint result){
        uint temp = ( ( 1000 * sum ) / sumAll ) % 10;
        result = ( 100 * sum ) / sumAll;
        if ( temp > 5 ) {
            result += 1;
        } 
    }
}
