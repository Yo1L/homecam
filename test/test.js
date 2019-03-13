var expect = require('chai').expect
const axios = require('axios')
var Camera = require('../Camera')
var sinon = require('sinon')

describe('camera status', () => {
    const camera = new Camera('localhost:3000')
    let sandbox = null
    beforeEach(() => sandbox = sinon.createSandbox())
    afterEach(() => sandbox.restore())

    it('should return off', () => {
        sandbox.stub(axios, 'get').returns(Promise.resolve({
            data: "OK getprivacystate=1"
        }))

        camera.getStatus().then(result => {
            expect(result).to.equal('off')
        })
        .catch(error => {
            expect(error).false
        })
    })

    it('should return on', () => {
        sandbox.stub(axios, 'get').returns(Promise.resolve({
            data: "OK getprivacystate=0"
        }))

        camera.getStatus().then(result => {
            expect(result).to.equal('on')
        })
        .catch(error => {
            expect(error).false
        })
    })

    it('should set state to off', () => {
        sandbox.stub(axios, 'get').returns(Promise.resolve({
            data: 'OK setprivacycontrol\nOK setprivacystate\nOK ledmode=0\n\u0000',
        }))

        camera.setState('off').then(result => {
            expect(result).true
        })
        .catch(error => {
            expect(error).false
        })
    })

    it('should set state to off', () => {
        sandbox.stub(axios, 'get').returns(Promise.resolve({
            data: 'OK setprivacycontrol\nOK setprivacystate\nOK ledmode=1\n\u0000',
        }))

        camera.setState('on').then(result => {
            expect(result).true
        })
        .catch(error => {
            expect(error).false
        })
    })

    it('should failed gracefully to set state', () => {
        sandbox.stub(axios, 'get').returns(Promise.resolve({
            data: 'ERROR',
        }))

        camera.setState('no').then(result => {
            expect(result).false
        })
        .catch(error => {
            expect(error).false
        })
    })
})