const axios = require('axios')

const STATUS_ON = 'on'
const STATUS_OFF = 'off'

module.exports = class Camera {
    constructor(ip, username, password) {
        this.url = 'http://' + ip + '/vb.htm'
        this.username = username || ''
        this.password = password || ''
        this.timeout = 5000
    }

    /**
     * send an HTTP get request to the camera
     * @param {object} params to send to the cam
     * @param {boolean} get_first_value of the matching returned response from the cam
     */
    send(params, get_first_value = false) {
        return new Promise( (resolve, reject) => {
            axios.get(this.url, {
                params: params,
                timeout: this.timeout,
                auth: {
                    username: this.username,
                    password: this.password 
                },
            })
            .then(response => {
                var result = true
                Object.keys(params).forEach( param => {
                    
                    if (!response || !response.data) {
                        reject("invalid response from camera")
                        return
                    }
                    
                    // "OK getprivacystate=0 
                    const regex = new RegExp('(.*) ' + param + '(=([01]))?')
                    const matches = response.data.match(regex)
                        
                    if (matches) {
                        if (matches[1] != 'OK') {
                            result = false
                        } 
                        if( result && get_first_value && matches.length > 2 ) {
                            // return the first value for get
                            result = matches[3]
                        }
                    }
                    else {
                        result = false
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
     * get human readable status of the camera
     */
    getStatus() {
        return new Promise( (resolve, reject) => {
            const params = {
                'getprivacystate': 1,
            }

            this.send(params, true)
            .then(result => {
                const status = result == 0 ? STATUS_ON : STATUS_OFF 
                resolve(status)
            })
            .catch(error => {
                console.error("could not retrieve camera status")
                reject(error)
            })
        })
    }

    /**
     * modify privacy state of the camera
     * @param {string} state on|off
     */
    setState(state) {
        return new Promise( (resolve, reject) => {
            let params = {
                'setprivacycontrol': 1,
                'setprivacystate': 0,
                'ledmode': 1,
            }

            if (state == STATUS_OFF) {
                params.setprivacystate = 1
                params.ledmode = 0
            }

            this.send(params)
            .then(result => {
                resolve(result)
            })
            .catch(error => {
                console.error("could not set camera status")
                reject(error)
            })
        })
    }
}