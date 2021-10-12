// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.5.16;

contract EnergyData {
    struct energyDatum{
        string timestamp;
        string energy;
    }

    mapping(uint256 => energyDatum) public energyData;
    uint256 public counter = 0;

    function postEnergyData(string memory _timestamp, string memory _energy) public {
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