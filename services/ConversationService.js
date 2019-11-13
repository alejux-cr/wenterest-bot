
class ConversationService {
    static async run(witService, text, context) {
        if (!context.conversation) {

            context.conversation = {
                entities = {},
                followUp: '',
                complete: false,
                exit: false,
            };
        }

        if (!text) {
            context.conversation.followUp = 'Hey back!';
            return context;
        }

        const entities = await witService.query(text);
        context.conversation.entities = { ...context.conversation.entities, ...entities };

        if (context.conversation.entities.intent === 'contentType') {// review the wit intents, this needs to be updated **
            return ConversationService.intentContentType(context);
        }
        context.conversation.followUp = 'Could you rephrase that?';
        return context;
    }
    static intentContentType(context) {
        const { conversation } = context;
        const { entities } = conversation;
        if (!entities.contentType) {
            conversation.followUp = 'What more do you want to know/talk about this domain?';
            return context;
        }
        // you can add the previous if statement for all type of entities you configure in your witService
        conversation.complete = true;
        return context;
    }
}

module.exports = ConversationService;