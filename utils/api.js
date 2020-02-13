/**
 * Created by vlad on 01.11.2018.
 */
"use strict";

const request = require('request');
const Agent = require('socks5-https-client/lib/Agent');

module.exports = function (baseUrl, key, socksHost, socksPort) {
    return {
        get: function (method) {
            let options = {
                url: 'https://' + baseUrl + '/bot' + key + '/' + method
            };

            if (socksHost) {
                options.strictSSL = true;
                options.agentClass = Agent;
                options.agentOptions = {
                        socksHost: socksHost,
                        socksPort: socksPort
                    };
            }

            return new Promise(function(resolve, reject) {
                request(options, function (error, response, body) {
                    if (error) {
                        reject(error);
                    } else {
                        resolve(body);
                    }
                });
            });
        }
    };
};