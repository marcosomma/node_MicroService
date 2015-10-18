var should = require('should');
var utility = require('../utility/utility.js');

describe('# receiver.js (processed_obj_null_coordinate)', function() {
    it('NULL COORDINATE CASE: ', function (done) {
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
                response['main_error'].should.be.exactly('key latitude missed or undefined.').and.be.a.String;
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
                var message = {
                        "driverId": 98,
                        "deviceId": 76,
                        "latitude": null,
                        "longitude": null,
                        "datetime": "2015-10-11T22:23:24385+00:00"
                    },
                    output = JSON.stringify(message);
                pub.publish(topicName, output, encode);
                console.log("   >> Publish Message: ", message);
                pub.close();
                callback();
            })
        }
    );
}