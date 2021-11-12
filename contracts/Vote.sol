// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.5.16;

contract Vote {
    struct Voter {
        bool voted;  // if true, that person already voted
        uint vote;   // index of the voted proposal
    }

    struct Proposal {
        string name;   // short name (up to 32 bytes)
        uint voteCount; // number of accumulated votes
    }
    bool public voteExists = false;
    bool public isFinished = false;
    string public message = "";
    uint public mYes = 0;
    uint public mNo = 0;
    
    //TODO you should inherit the addresses from sign up
    address org1 = 0xa7e2d1F80B92b75B3fd187490b2b01550043D0b3;
    address org2 = 0xa02A9A8D092a47dc4E7ABf569a9b392D0Ce07e43;
    address org3 = 0x448F178C88C0fC73eA74714b1e0494781548ff4C;
    address org4 = 0x7188D086E0415B0b394a67325Fc5c4534262e76a;

    mapping(address => Voter) public voters;
    
    Proposal[] public proposals;
    
    uint16 public numVotesLeft = 4;
    
    function createVote() public  {   
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
    
    function postVote(uint proposal) public {
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

    /** 
     * @dev Computes the winning proposal taking all previous votes into account.
     * @return winningProposal_ index of winning proposal in the proposals array
     * @return winnerName_ the name of winning proposal in the proposals array
     */
    function getWinningProposal() public
            returns (string memory winnerName_)
    {
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
            winnerName_ = "";
        } else {
            uint winningProposal_;
            voteExists = false;
            uint winningVoteCount = 0;
            for (uint p = 0; p < proposals.length; p++) {
                if (proposals[p].voteCount > winningVoteCount) {
                    winningVoteCount = proposals[p].voteCount;
                    winningProposal_ = p;
                }
            }
            message = "Vote is finished!";
            mYes = proposals[0].voteCount;
            mNo = proposals[1].voteCount;
            winnerName_ = proposals[winningProposal_].name;
        }
    }
}
