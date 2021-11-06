#!/bin/bash

if [ "$EUID" -ne 0 ]
  then echo "Please run as root"
  exit
fi

clear

docker-compose down --volumes --remove-orphans 
rm -rf bootnode node-org1 node-org2 genesis.json

docker-compose -f docker-compose-cli.yaml up -d
sleep 5

ADDRESS1=$(cat node-org1/keystore/* | grep -Po '"address":"\K[^"]*')
echo $ADDRESS1 > node-org1/node-org1.address
ADDRESS2=$(cat node-org2/keystore/* | grep -Po '"address":"\K[^"]*')
echo $ADDRESS2 > node-org2/node-org2.address

genesis() {
  sed -e "s/\${ADDRESS1}/$1/" \
      -e "s/\${ADDRESS2}/$2/" \
      genesis-template.json
}

echo "$(genesis $ADDRESS1 $ADDRESS2)" > genesis.json

docker-compose up -d