const http = require('http');
const https = require('https');
const fs = require('fs');

function fileGetContent(url, dstPath, callback) {
    const writeFileToStorage = (response) => {
        const file = fs.createWriteStream(dstPath);

        file.on('finish', () => {
            callback(dstPath, undefined);
        });
        response.pipe(file);
    };

    if (!url.includes("https://") && !url.includes("http://")) {// physical path
        callback(url, undefined);
        return ;
    }

    let protocol = new URL(url).protocol;

    let request = null;

    if (protocol == "https:") {
        request = https.get(url, function(response) {
            writeFileToStorage(response);
        });
    } else {
        request = http.get(url, function(response) {
            writeFileToStorage(response);
        });
    }

    request.on('error', (error) => {
        callback(undefined, {'http': error});
    });

    request.on('timeout', (error) => {
        callback(undefined, {'timeout': error});
    });
};

exports.fileGetContent = fileGetContent;