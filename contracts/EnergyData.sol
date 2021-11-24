// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.5.16;

contract EnergyData {
    struct energyDatum{
        string timestamp;
        string energy;
    }

    mapping(uint => energyDatum) public energyData;
    uint public counter = 0;
    address private owner;

    constructor() public{
        owner = msg.sender;
    }
    
    modifier isOwner {
        require(owner == msg.sender, "This function is restricted to the contract's owner");
        _;
    }

    function getOwner() public view returns (address) {
        return owner;
    }

    function postEnergyData(string memory _timestamp, string memory _energy) public isOwner {
        counter++;
        energyDatum storage kati = energyData[counter];
        kati.timestamp = _timestamp;
        kati.energy = _energy;
    }

    function getEnergyData(uint index) public view returns (string memory, string memory) {
        string memory datumTimestamp = energyData[index].timestamp;
        string memory datumEnergy = energyData[index].energy;

        return (datumTimestamp, datumEnergy);
    }

    function getEnergyCounter() public view returns (string memory) {
        return uint2str(counter);
    }

    function uint2str(uint _i) internal pure returns (string memory _uintAsString) {
        if (_i == 0) {
            return "0";
        }
        uint j = _i;
        uint len;
        while (j != 0) {
            len++;
            j /= 10;
        }
        bytes memory bstr = new bytes(len);
        uint k = len - 1;
        while (_i != 0) {
            bstr[k--] = byte(uint8(48 + _i % 10));
            _i /= 10;
        }
        return string(bstr);
    }
}