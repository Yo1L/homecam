const express = require('express')
const axios = require('axios')
const { IncomingWebhook } = require('@slack/client');

const app = express()
require('dotenv').config()

const CAMERA_IP = process.env.CAMERA_IP || '192.168.0.1'
const CAMERA_URL = 'http://' + CAMERA_IP + '/vb.htm'
const HTTP_PORT = process.env.HTTP_PORT || 3000

const url = process.env.SLACK_WEBHOOK_URL;
const slack = new IncomingWebhook(url);

const CAMERA_STATUS_ON = 'on'
const CAMERA_STATUS_OFF = 'off'

/**
 * Middleware: logger
 */
app.use((req, res, next) => {
    console.log(req.url + ' from ' + req.ip)
    next()
})

/**
 * send an HTTP get request to the camera
 * @param {object} params to send to the cam
 * @param {boolean} get_first_value of the matching returned response from the cam
 */
function sendCamera(params, get_first_value = false) {
    return new Promise( (resolve, reject) => {
        axios({
            url: CAMERA_URL,
            method: 'get',
            params: params,
            timeout: 5000,
            auth: {
                username: process.env.CAMERA_USERNAME || '',
                password: process.env.CAMERA_PASSWORD || ''
            },
        })
        .then(response => {
            var result = true
            Object.keys(params).forEach( param => {
                const regex = new RegExp('(.*) ' + param + '(=([01]))?')
                const matches = response.data.match(regex)

                if (matches) {
                    if (matches[1] != 'OK') {
                        result = false
                    } 
                    if( get_first_value && matches.length > 2 ) {
                        // return the first value for get
                        result = matches[3]
                    }
                }
            })

            resolve(result)
        })
        .catch(error => {
            console.error(error)
            reject(error)
        })
    })
}

/**
 * get human readable status of the camera and send result to the slack room
 */
function getCameraStatus() {
    return new Promise( (resolve, reject) => {
        const params = {
            'getprivacystate': 1,
        }

        sendCamera(params, true)
        .then(result => {
            const status = result == 0 ? CAMERA_STATUS_ON : CAMERA_STATUS_OFF 
            resolve(status)
        })
        .catch(error => {
            console.error("could not retrieve camera status")
            reject(error)
        })
    })
}

function notifyStatus(status)
{
    const message = {
        text: 'Camera is ' + status,
        icon_emoji: process.env.SLACK_ICON || '',
        channel: '#' + (process.env.SLACK_ROOM || 'general')
    }

    slack.send(message, (err, res) => {
        if (err) {
            console.error('Error while sending slack message:', err);
        }
        else {
            console.log('Message sent to slack: ', res);
        }
    })
}

function setCameraState(state)
{
    return new Promise( (resolve, reject) => {
        if (state == CAMERA_STATUS_ON) {
            params = {
                'setprivacycontrol': 1,
                'setprivacystate': 0,
                'ledmode': 1,
            }
        }
        else if (state == CAMERA_STATUS_OFF) {
            params = {
                'setprivacycontrol': 1,
                'setprivacystate': 1,
                'ledmode': 0,
            }
        }
        else {
            res.send("unknow state")
            return
        }

        sendCamera(params)
        .then(result => {
            resolve(result)
        })
        .catch(error => {
            console.error("could not set camera status")
            reject(error)
        })
    })
}

/**
 * API : get the status of the camera on|off
 */
app.get('/camera/status', (req, res) => {
    getCameraStatus()
    .then(status => {
        notifyStatus(status)
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
    setCameraState(state)
    .then(result => {
        notifyStatus(state)
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
    getCameraStatus()
    .then(status => {
        let state = status == CAMERA_STATUS_OFF ? CAMERA_STATUS_ON : CAMERA_STATUS_OFF
        setCameraState(state)
        .then(result => {
            notifyStatus(state)
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