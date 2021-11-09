#!/bin/bash

if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

clear

docker-compose down --volumes --remove-orphans 
rm -rf bootnode node-org1 node-org2 node-org3 node-org4 genesis.json

docker-compose -f docker-compose-cli.yaml up -d
sleep 15

ADDRESS1=$(cat node-org1/keystore/* | grep -Po '"address":"\K[^"]*')
echo $ADDRESS1 > node-org1/node-org1.address
ADDRESS2=$(cat node-org2/keystore/* | grep -Po '"address":"\K[^"]*')
echo $ADDRESS2 > node-org2/node-org2.address
ADDRESS3=$(cat node-org3/keystore/* | grep -Po '"address":"\K[^"]*')
echo $ADDRESS3 > node-org3/node-org3.address
ADDRESS4=$(cat node-org4/keystore/* | grep -Po '"address":"\K[^"]*')
echo $ADDRESS4 > node-org4/node-org4.address

genesis() {
  sed -e "s/\${ADDRESS1}/$1/" \
      -e "s/\${ADDRESS2}/$2/" \
      -e "s/\${ADDRESS3}/$3/" \
      -e "s/\${ADDRESS4}/$4/" \
      genesis-template.json
}

echo "$(genesis $ADDRESS1 $ADDRESS2 $ADDRESS3 $ADDRESS4)" > genesis.json

docker-compose up -d