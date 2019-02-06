#!/usr/bin/env node

'use strict';
var fs = require('fs');
var path = require('path');
var https = require('https');

var crowdin_identifier = 'particl-copay';

var local_file_name1 = path.join(__dirname, 'template.pot');

// Similar to Github, normalize all line breaks to CRLF so that different people
// using different OSes to update does not constantly swith format back and forth.
var local_file1_text = fs.readFileSync(local_file_name1, 'utf8');
local_file1_text = local_file1_text.replace(/\r\n/g, '\n');
local_file1_text = local_file1_text.replace(/\n/g, '\r\n');
fs.writeFileSync(local_file_name1, local_file1_text);

// obtain the crowdin api key
var crowdin_api_key = fs.readFileSync(
  path.join(__dirname, 'crowdin_api_key.txt')
);
// Convert to string and replace \n
crowdin_api_key = crowdin_api_key.toString('utf8').replace(/\n/g, '');
// console.log('api key: ' + crowdin_api_key);

if (crowdin_api_key != '') {
  var payload =
    '------WebKitFormBoundary7MA4YWxkTrZu0gW\r\nContent-Disposition: form-data; name="files[template.pot]"; filename="template.pot"\r\nContent-Type: application/vnd.ms-powerpoint\r\n\r\n' +
    local_file1_text +
    '\r\n------WebKitFormBoundary7MA4YWxkTrZu0gW--';

  var options = {
    method: 'POST',
    hostname: 'api.crowdin.com',
    path:
      '/api/project/' +
      crowdin_identifier +
      '/update-file?key=' +
      crowdin_api_key,
    headers: {
      'content-type':
        'multipart/form-data; boundary=----WebKitFormBoundary7MA4YWxkTrZu0gW'
    }
  };

  var req = https.request(options, response => {
    console.log(`STATUS: ${response.statusCode}`);
    console.log(`HEADERS: ${JSON.stringify(response.headers)}`);

    response.setEncoding('utf8');

    response.on('data', chunk => {
      console.log(`BODY: ${chunk}`);
    });
    response.on('end', () => {
      // This call will tell the server to generate a new zip file for you based on most recent translations.
      https
        .get(
          'https://api.crowdin.com/api/project/' +
            crowdin_identifier +
            '/export?key=' +
            crowdin_api_key,
          res => {
            console.log('Export Got response: ' + res.statusCode);
            res.on('data', chunk => {
              console.log(chunk.toString('utf8'));
            });
          }
        )
        .on('error', e => {
          console.log('Export Got error: ' + e.message);
        });
    });
  });
  req.on('error', e => {
    console.error(`problem with request: ${e.message}`);
  });

  req.write(payload);
  req.end();
}
