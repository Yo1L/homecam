const express = require('express')

const app = express()
require('dotenv').config()

const HTTP_PORT = process.env.HTTP_PORT || 3000

const Camera = require('./Camera')
const camera = new Camera(process.env.CAMERA_IP, process.env.CAMERA_USERNAME, process.env.CAMERA_PASSWORD)

const Slack = require('./Slack')
const slack = new Slack(process.env.SLACK_WEBHOOK_URL, process.env.SLACK_ROOM, process.env.SLACK_ICON)

/**
 * Middleware: logger
 */
app.use((req, res, next) => {
    console.log(req.url + ' from ' + req.ip)
    next()
})

/**
 * API : get the status of the camera on|off
 */
app.get('/camera/status', (req, res) => {
    camera.getStatus()
    .then(status => {
        slack.notify(status)
        res.send(status)
    })
    .catch(error => {
        res.send("oups...")
    })
}) 

/**
 * change the state of the camera on|off
 */
app.get('/camera/state/:state', (req, res) => {
    var params = null
    let state = req.params.state
    camera.setState(state)
    .then(result => {
        slack.notify(state)
        res.send(state)
    })
    .catch(error => {
        res.send("oups...")
    })
})

/**
 * toggle the state of the camera on <-> off
 */
app.get('/camera/toggle', (req, res) => {
    var params = null
    camera.getStatus()
    .then(status => {
        let state = status == 'off' ? 'on' : 'off'
        camera.setState(state)
        .then(result => {
            slack.notify(state)
            res.send(state)
        })
        .catch(error => {
            res.send("oups, cannot update state")
        })
    })
    .catch(error => {
        res.send("oups, cannot retrieve status")
    })
})

/**
 * Starting web server
 */
app.listen(HTTP_PORT, () => {
    console.log('Waiting for connection on port ' + HTTP_PORT)
})