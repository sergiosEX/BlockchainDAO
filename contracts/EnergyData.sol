// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.5.16;

contract EnergyData {
    struct energyDatum{
        string timestamp;
        string declaration;
        string production;
    }

    address org1 = 0xa7e2d1F80B92b75B3fd187490b2b01550043D0b3;
    address org2 = 0xa02A9A8D092a47dc4E7ABf569a9b392D0Ce07e43;
    address org3 = 0x448F178C88C0fC73eA74714b1e0494781548ff4C;
    address org4 = 0x7188D086E0415B0b394a67325Fc5c4534262e76a;

    modifier isOrg {
        require(msg.sender == org1 || msg.sender == org2 || msg.sender == org3 || msg.sender == org4, "This function is restricted to the addresses of the organizations");
        _;
    }

    mapping(uint => energyDatum) public energyData;
    uint public counter = 0;
    address private owner;

    constructor() public{
        owner = msg.sender;
    }

    function getOwner() public view returns (address) {
        return msg.sender;
    }

    function postEnergyData(string memory _timestamp, string memory _declaration, string memory _production) public isOrg {
        counter++;
        energyDatum storage kati = energyData[counter];
        kati.timestamp = _timestamp;
        kati.declaration = _declaration;
        kati.production = _production;
    }

    function getEnergyData(uint index) public view returns (string memory, string memory, string memory) {
        string memory datumTimestamp = energyData[index].timestamp;
        string memory datumDeclaration = energyData[index].declaration;
        string memory datumProduction = energyData[index].production;
        return (datumTimestamp, datumDeclaration, datumProduction);
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