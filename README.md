# Blockchain DAO

Αρχικά θα χρειαστούμε το docker-desktop, to wsl, nvm, npm, truffle.

Ανοίγουμε το docker-desktop.

## Step 1 Start the network
```bash
cd geth_docker_network/
sudo su
./refresh.sh
! if the docker logs show "looking for peers" multiple times run the script ".refresh.sh" again.
```

## Step 2 Compile and migrate the contracts
In a different terminal
```bash
truffle compile
truffle migrate --network geth_docker_network_org1 --reset 
truffle migrate --network geth_docker_network_org2 --reset 
truffle migrate --network geth_docker_network_org3 --reset 
truffle migrate --network geth_docker_network_org4 --reset
```

## Step 3 Upload simulated data
In a different terminal 
`cd simulation/`

run the following sequentialy
```bash
node postEnergyData.js org1
node postEnergyData.js org2
node postEnergyData.js org3
node postEnergyData.js org4
```

## Step 4 Open client UI for every organisations in different terminals
```bash
cd client/
npm run start1
```
```bash
cd client/
npm run start2
```
```bash
cd client/
npm run start3
```
```bash
cd client/
npm run start4
```

## Optional: Stop the network
```bash
docker-compose down --volumes --remove-orphans
```
