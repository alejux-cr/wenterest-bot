const express = require('express');
const { createEventAdapter } = require('@slack/events-api');
const { WebClient } = require('@slack/web-api');

const router = express.Router();

module.exports = (params) => {
    const { config, witService, domainService } = params;

    const slackEvents = createEventAdapter(config.slack.signingSecret);
    const slackWebClient = new WebClient(config.slack.token);

    router.use('/events', slackEvents.requestListener());

    async function handleMention(event) {
        const mention = /<@[A-Z0-9]+>/;
        const eventText = event.text.resplace(mention, '').trim();

        let text = '';

        if (!eventText) {
            text = 'Hey!';
        } else {
            const entities = await witService.query(eventText);
            const { intent, userName, contentType, domain } = entities;

            if (!intent || intent !== 'contentType' || !domain) { // ADD HERE THE DOMAIN OR INTEREST THE USER WANTS TO DISCUSS AS WELL
                text = 'Sorry, could you please provide a type of content and domain I suggested?'
            } else {
                const domainResult = await domainService.tryDomain(domain);
                text = domainResult; // Check for type of response. json or text
            }
        }
        return slackWebClient.chat.postMessage({
            text, //'Hi there, I\'m Wee! What are you interested in talking about?',
            channel: event.channel,
            username: 'Wee',
        })
    }

    slackEvents.on('app_mention', handleMention);

    return router;
}