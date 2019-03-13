const { IncomingWebhook } = require('@slack/client');

module.exports = class Slack {
    constructor(url, channel, icon) {
        this.slack = new IncomingWebhook(url)
        this.channel = channel || 'general'
        this.icon = icon || ''
    }

    notify(status)
    {
        const message = {
            text: 'Camera is ' + status,
            icon_emoji: this.icon,
            channel: '#' + this.channel
        }

        this.slack.send(message, (err, res) => {
            if (err) {
                console.error('Error while sending slack message:', err);
            }
            else {
                console.log('Message sent to slack: ', res);
            }
        })
    }
}