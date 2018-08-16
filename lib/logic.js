/**
 * Initialize some test assets and participants useful for running a demo
 * @param {framgia.quickship.OurSetupDemo} ourSetupDemo - the SetupDemo transaction
 * @transaction
 */

async function ourSetupDemo(ourSetupDemo) {
    const factory = getFactory()
    const NS = 'framgia.quickship'

    var grower = factory.newResource(NS, 'Grower', 'farmer@gmail.com')
    var growerAddress = factory.newConcept(NS, 'Address')
    growerAddress.country = 'USA'
    grower.address = growerAddress
    grower.accountBalance = 5125
    var grower2 = factory.newResource(NS, 'Grower', 'farmer2@gmail.com')
    var grower2Address = factory.newConcept(NS, 'Address')
    grower2Address.country = 'Vietnam'
    grower2.address = grower2Address
    grower2.accountBalance = 100
    var grower3 = factory.newResource(NS, 'Grower', 'farmer3@gmail.com')
    var grower3Address = factory.newConcept(NS, 'Address')
    grower3Address.country = 'Japan'
    grower3.address = grower3Address
    grower3.accountBalance = 4000

    var shipper = factory.newResource(NS, 'Shipper', 'shipper@gmail.com')
    var shipperAddress = factory.newConcept(NS, 'Address')
    shipperAddress.country = 'USA'
    shipper.address = shipperAddress
    shipper.accountBalance = 0


    var importer = factory.newResource(NS, 'Importer', 'importer@gmail.com')
    var importerAddress = factory.newConcept(NS, 'Address')
    importerAddress.country = 'USA'
    importer.address = importerAddress
    importer.accountBalance = 0

    var contract = factory.newResource(NS, 'Contract', 'CON_001')
    contract.grower = factory.newRelationship(NS, 'Grower', 'farmer@gmail.com')
    contract.shipper = factory.newRelationship(NS, 'Shipper', 'shipper@gmail.com')
    contract.importer = factory.newRelationship(NS, 'Importer', 'importer@gmail.com')
    var tomorrow = ourSetupDemo.timestamp
    tomorrow.setDate(tomorrow.getDate() + 1)
    contract.arrivalDateTime = tomorrow
    contract.unitPrice = 0.5
    contract.minTemperature = 2
    contract.maxTemperature = 10
    contract.minPenaltyFactor = 0.2
    contract.maxPenaltyFactor = 0.5

    var shipment = factory.newResource(NS, 'Shipment', 'SHIP_001')
    shipment.type = 'BANANAS'
    shipment.status = 'IN_TRANSIT'
    shipment.unitCount = 5000
    shipment.contract = factory.newRelationship(NS, 'Contract', 'CON_001')

    // add the growers
    const growerRegistry = await getParticipantRegistry(NS + '.Grower')
    await growerRegistry.addAll([grower, grower2, grower3])

    // add the importers
    const importerRegistry = await getParticipantRegistry(NS + '.Importer')
    await importerRegistry.addAll([importer])

    // add the shippers
    const shipperRegistry = await getParticipantRegistry(NS + '.Shipper')
    await shipperRegistry.addAll([shipper])

    // add the contracts
    const contractRegistry = await getAssetRegistry(NS + '.Contract')
    await contractRegistry.addAll([contract])

    // add the shipments
    const shipmentRegistry = await getAssetRegistry(NS + '.Shipment')
    await shipmentRegistry.addAll([shipment])
}

/**
 * A temperature reading on one of the perishable shipments
 * @param {framgia.quickship.TemperatureReading} temperatureReading
 * @transaction
 */

async function temperatureReading(temperatureReading) {
    const shipment = temperatureReading.shipment
    console.log('Adding temperature of ' + temperatureReading.centigrade + ' to shipment')
    if (shipment.temperatureReadings) {
        shipment.temperatureReadings.push(temperatureReading)
    } else {
        shipment.temperatureReadings = [temperatureReading]
    }
    const shipmentRegistry = await getAssetRegistry('framgia.quickship.Shipment')
    shipmentRegistry.update(shipment)
}

/**
 * A shipment has been received and funds need to be allocated
 * @param {framgia.quickship.ShipmentReceived} ShipmentReceived
 * @transaction
 */

 async function shipmentReceived(shipmentReceived) {
    var contract = shipmentReceived.shipment.contract
    var shipment = shipmentReceived.shipment
    var money = contract.unitPrice * shipment.unitCount

    console.log('Received at: ' + shipmentReceived.timestamp)
    console.log('Contract arrivalDatetime: ' + contract.arrivalDateTime)

    shipment.status = 'ARRIVED'
    if (shipmentReceived.timestamp > contract.arrivalDateTime) {
        money = 0;
        console.log('Late shipment, no money received by grower')
    } else {
        if (shipment.temperatureReadings) {
            // Get the lowest and the highest temp reading
            shipment.temperatureReadings.sort((a, b) => {
                return (a.centigrade - b.centigrade)
            })
            var lowestReading = shipment.temperatureReadings[0]
            var highestReading = shipment.temperatureReadings[shipment.temperatureReadings.length - 1]
            var penalty = 0
            console.log('Lowest temp reading: ' + lowestReading.centigrade)
            console.log('Highest temp reading: ' + highestReading.centigrade)

            if (lowestReading.centigrade < contract.minTemperature) {
                penalty += (contract.minTemperature - lowestReading.centigrade) * contract.minPenaltyFactor
                console.log('Min temp price penalty: ' + penalty)
            }
            if (highestReading.centigrade > contract.maxTemperature) {
                penalty += (-contract.maxTemperature + highestReading.centigrade) * contract.maxPenaltyFactor
                console.log('Max temp price penalty: ' + penalty)
            }
        }
        money -= penalty * shipment.unitCount

        if (money < 0) money = 0
    }
    console.log('Money received: ' + money)

    // Update account balance appropriately
    contract.grower.accountBalance += money
    contract.importer.accountBalance -= money

    const growerRegistry = await getParticipantRegistry('framgia.quickship.Grower')
    growerRegistry.update(contract.grower)
    const importerRegistry = await getParticipantRegistry('framgia.quickship.Importer')
    importerRegistry.update(contract.importer)
    const shipmentRegistry = await getAssetRegistry('framgia.quickship.Shipment')
    shipmentRegistry.update(shipment)
}
