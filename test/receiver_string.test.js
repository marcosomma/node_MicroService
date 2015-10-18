var should = require('should');
var utility = require('../utility/utility.js');

describe('# receiver.js (error_sting)', function() {
    it('STRING CASE: ', function (done) {
        this.timeout(29000);
        var util  = require('util'),
            spawn = require('child_process').spawn,
            test  = spawn('npm', ['start', '/home/marcosomma/Documents/sandbox/stuart_test']);

        var check = false;
        test.stdout.on('data', function (data) {
            var message = utility.processReceivedMessage(data);
            if(message === "[x]Connected to queue stuart-drivers.location"){
                create_message(function(){
                    check=true;
                });
            }
            if(check==true){
                console.log("   << MS Receive Message.");
                console.log("   >> MS Output Processed Message: %s",message);
                var response = JSON.parse(message);
                response.should.be.a.Object;
                response['main_error'].should.be.exactly('Wrong message type. Expexted type object.').and.be.a.String;
                check=false;
                done();
            }
        });

        test.stderr.on('data', function (data) {
            check=false;
            throw data;
        })
    });
});

function create_message(callback){
    var encode = "utf8",
        queueSocket = "amqp://localhost",
        queueName = "stuart",
        topicName = "drivers.location",
        context = require('rabbit.js').createContext(queueSocket);
    context.on(
        "ready", function (){
            var pub = context.socket("PUB",  {routing: 'topic'});
            pub.connect(queueName, function(){
                var message = "Test String";
                pub.publish(topicName, message, encode);
                console.log("   >> Publish Message: ", message);
                pub.close();
                callback();
            })
        }
    );
}