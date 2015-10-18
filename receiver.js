var utility = require("./utility/utility.js"),
    dictionary = require('./utility/static_dictionary.json'),
    queueSocket = "amqp://localhost",
    queueName = "stuart",
    topicName = "drivers.location",
    context = require('rabbit.js').createContext(queueSocket),
    static_strings = dictionary.string_dictionary;
console.log(static_strings.context_create + queueSocket);

context.on("ready", function (){
    console.log(static_strings.context_ready);

    var sub = context.socket("SUB",  {routing: 'topic'});
    sub.connect(queueName, topicName, function(){
        console.log(static_strings.context_queue + queueName + "-" + topicName);

        sub.on("data", function(message_buffer) {
            try {
                var message = JSON.parse(utility.processReceivedMessage(message_buffer));
                utility.messageValidator(message);

                utility.getLocation(message, function (error, api_data) {
                    var processed_oputput = utility.processApiResponse(error, api_data, message);
                    var output = utility.processReceivedMessage(JSON.stringify(processed_oputput));

                    return console.log(output);
                });

            } catch(err) {
                return utility.processError(err);
            }
        })
    })
});