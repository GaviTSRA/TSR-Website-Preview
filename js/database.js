function init() {
    const { Client } = require('pg')
    const client = new Client()
    await client.connect()
}

module.exports = {

}