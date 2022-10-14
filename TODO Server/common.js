import { writeFileSync } from 'fs';
function parseJSON(JSONdata, response) {
    try {
        return JSON.parse(JSONdata);
    } catch (error) {
        response.statusCode = 400;
        response.end(generateResponseData({ status: 1, errorText: "The type must be JSON" }));
    }
}

function writeFile(path, data) {
    writeFileSync(path, JSON.stringify(data), error => {
        console.error(error);
    });
}

function generateResponseData({ status, errorText, data }) {
    let responseObj = {};
    responseObj.status = status;

    if (status === 1) {
        responseObj.errorText = errorText;
    } else {
        responseObj.data = data;
    }

    return JSON.stringify(responseObj);
}

function checkDataLength(request, data) {
    if (data.length > 1e6) {
        request.connection.destroy();
    }
}

export default {
    parseJSON,
    writeFile,
    generateResponseData,
    checkDataLength
};