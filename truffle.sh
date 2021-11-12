#!/bin/bash

truffle migrate --network geth_docker_network_org1 --reset 
truffle migrate --network geth_docker_network_org2 --reset 
truffle migrate --network geth_docker_network_org3 --reset 
truffle migrate --network geth_docker_network_org4 --reset 