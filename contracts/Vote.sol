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
    uint public org1Sum = 0;
    uint public org2Sum = 0;
    uint public org3Sum = 0;
    uint public org4Sum = 0;

    // my mappings
    mapping(address => uint) public energyPercentage;
    mapping(address => Voter) public voters;
    
    // my modifiers
    modifier isOrg {
        require(msg.sender == org1 || msg.sender == org2 || msg.sender == org3 || msg.sender == org4, "This function is restricted to the addresses of the organizations");
        _;
    }

    // and finally: my functions()
    function getEnergyPercentage(address account) public view returns (uint) {
        return energyPercentage[account];
    }

    function getEnergySum(address account) public view returns (uint) {
        if(account == org1){
            return org1Sum;
        } else if(account == org2){
            return org2Sum;
        } else if(account == org3){
            return org3Sum;
        } else if(account == org4){
            return org4Sum;
        }
    }

    function setEnergySum(uint sum) public {
        if(msg.sender == org1){
            org1Sum = sum;
        } else if(msg.sender == org2){
            org2Sum = sum;
        } else if(msg.sender == org3){
            org3Sum = sum;
        } else if(msg.sender == org4){
            org4Sum = sum;
        }
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
            voteExists = false;
            // winnerProposalName = proposals[0].name;
            winnerProposalName = "Yes";
            uint energySumAll = org1Sum + org2Sum + org3Sum + org4Sum;
            energyPercentage[org1] = calculatePercentage(org1Sum, energySumAll);
            energyPercentage[org2] = calculatePercentage(org2Sum, energySumAll);
            energyPercentage[org3] = calculatePercentage(org3Sum, energySumAll);
            energyPercentage[org4] = calculatePercentage(org4Sum, energySumAll);
            message = "The vote is done. The result is Yes.";
        } else if (proposals[1].voteCount > proposals[0].voteCount + numVotesLeft){
            voteExists = false;
            winnerProposalName = "No";
            message = "The vote is done. The result is No";
        } else {
            message = "Vote not finished!";
            mYes = proposals[0].voteCount;
            mNo = proposals[1].voteCount;
            winnerProposalName = "";
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
