const express = require('express');
const { createEventAdapter } = require('@slack/events-api');
const { WebClient } = require('@slack/web-api');

const ConversationService = require('../../services/ConversationService');

const router = express.Router();

function createSessionId(channel, user, ts) {
    return `${channel}-${user}-${ts}`;
}

module.exports = (params) => {
    const {
        config,
        witService,
        domainService,
        sessionService,
    } = params;

    const slackEvents = createEventAdapter(config.slack.signingSecret);
    const slackWebClient = new WebClient(config.slack.token);

    router.use('/events', slackEvents.requestListener());

    async function processEvent(session, event) {
        const mention = /<@[A-Z0-9]+>/;
        const eventText = event.text.resplace(mention, '').trim();

        const context = await ConversationService.run(witService, eventText, session.context);
        const { conversation } = context;
        const { entities } = conversation;

        console.log(entities); // REMOVE after debuggin'

        let text = '';

        if (!conversation.complete) {
            text = conversation.followUp;
        } else {
            const {
                intent,
                userName,
                contentType,
                domain
            } = entities;

            const domainResult = await domainService.tryDomain(domain);
            text = domainResult; // Check for type of response. json or text
        }
        return slackWebClient.chat.postMessage({
            text, //'Hi there, I\'m Wee! What are you interested in talking about?',
            channel: session.context.slack.channel,
            thread_ts: session.context.slack.thread_ts,
            username: 'Wee',
        })
    }
    async function handleMention(event) {
        const sessionId = createSessionId(event.channel, event.user, event.thread_ts);
        let session = sessionService.get(sessionId);

        if (!session) {
            session = sessionService.create(sessionId);

            session.context = {
                slack: {
                    channel: event.channel,
                    user: event.user,
                    thread_ts: event.thread_ts
                },
            };
        }
        return processEvent(session, event);
    }

    async function handleMessage(event) {
        const sessionId = createSessionId(event.channel, event.user, event.thread_ts);
        const session = sessionService.get(sessionId);

        if (!session) return false;
        return processEvent(session, event);
    }

    slackEvents.on('app_mention', handleMention);
    slackEvents.on('message', handleMessage);

    return router;
}