var util = require('util'),
    request = require('request'),
    dictionary = require('./static_dictionary.json'),
    static_urls = dictionary.url_dictionary,
    static_strings = dictionary.string_dictionary;

module.exports = {
    messageValidator: function (json){
        var required_keys =[
            'driverId',
            'deviceId',
            'latitude',
            'longitude',
            'datetime'
        ];
        for(var key in required_keys){
            if(json[required_keys[key]] == undefined ){
                var error = {
                    type:'missing_key',
                    message: "key " + required_keys[key] + " missed or undefined."
                };
                throw error;
            }
        }
    },

    processApiResponse: function (error, api_data, message){
        try {
            var err = checkError(error, api_data);
            message['city'] = err ? {error: errorResponse(error, api_data)} : api_data.address.city;
            return message;
        } catch(err){
            throw this.processError(err);
        }
    },

    processReceivedMessage: function (message){
        var message_inspect = util.inspect(String(message), false, null);
        var output = message_inspect.replace(/(?:'|\\[rn]|[\r\n]+)+/g, '');
        return output
    },

    processError: function (err){
        var error_msg = err.message;
        switch (err.type){
            case 'unexpected_token':
                error_msg = static_strings.error_typeof_unexpected_token;
                break;
        }

        return console.log(JSON.stringify({main_error:error_msg}));
    },

    getLocation: function(data, callback) {
        var url = static_urls.nominatim + '&lat='+data.latitude+'&lon='+data.longitude;
        request({
            url: url,
            json: true
        }, function (error, response, body) {
            if(error || response.statusCode != 200){
                var error_message = error ? error : response.body;
                callback(error_message,null);
            } else {
                callback(null,body);
            }
        })

    }
};

function checkError(error, data) {
    if( error || typeof data != 'object' || data.error){
        return true;
    }
    return false;
}

function errorResponse(error, data) {
    var report = error ? error : data.error ? data.error : static_strings.error_typeof_init + (typeof data) + static_strings.error_typeof_end;
    return report;
}