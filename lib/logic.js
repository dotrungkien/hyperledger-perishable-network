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
    grower.accountbalance = 0

    var shipper = factory.newResource(NS, 'Shipper', 'farmer@gmail.com')
    var shipperAddress = factory.newConcept(NS, 'Address')
    shipperAddress.country = 'USA'
    shipper.address = shipperAddress
    shipper.accountbalance = 0


    var importer = factory.newResource(NS, 'Importer', 'farmer@gmail.com')
    var importerAddress = factory.newConcept(NS, 'Address')
    shipperAddress.country = 'USA'
    importer.address = importerAddress
    importer.accountbalance = 0

    var contract = factory.newResource(NS, 'Contract', 'CON_001')
    contract.grower = factory.newRelationShip(NS, 'Grower', 'farmer@gmail.com')
    contract.shipper = factory.newRelationShip(NS, 'Shipper', 'shipper@gmail.com')
    contract.importer = factory.newRelationShip(NS, 'Importer', 'importer@gmail.com')
    var tomorrow = ourSetupDemo.timestamp
    tomorrow.setDate(tomorrow.getDate() + 1)
    contract.arrivalDateTime = tomorrow
    contract.unitPrice = 0.5
    contract.minTemperature = 2
    contract.maxTemperature = 10
    contract.minPenaltyFactor = 0.2
    contract.maxPenaltyFactor = 0.5

}