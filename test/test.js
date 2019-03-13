var expect = require('chai').expect
const axios = require('axios')
var Camera = require('../Camera')
var sinon = require('sinon')

describe('get camera status', () => {
    const camera = new Camera('localhost:3000')
    let sandbox = null
    beforeEach(() => sandbox = sinon.createSandbox())
    afterEach(() => sandbox.restore())

    it('should return off', () => {
        sandbox.stub(axios, 'get').returns(Promise.resolve({
            status: 200,
            body: "getprivacystate=1"
        }))

        camera.getStatus().then(result => {
            console.log(result)
            expect(result).to.equal('off')
        })
        .catch(error => {
            console.log('error')
            expect(error).to.be.false
        })
    })
})