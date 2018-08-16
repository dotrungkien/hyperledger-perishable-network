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

    var shipper = factory.newResource(NS, 'Shipper', 'farmer@gmail.com')
    var shipperAddress = factory.newConcept(NS, 'Address')
    shipperAddress.country = 'USA'
    shipper.address = shipperAddress
    shipper.accountBalance = 0


    var importer = factory.newResource(NS, 'Importer', 'farmer@gmail.com')
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