var remote = require('remote');
var dialog = remote.require('dialog');
var fs = require('fs');

function openFile(fileName) {
    var object;
    if (fileName === undefined){
        dialog.showOpenDialog(function (fileNames) {
            if (fileNames === undefined) return;

            var fileName = fileNames[0];
            var data = fs.readFileSync(fileName, 'utf-8');
            object = JSON.parse(data);
        });
    }
    else {
        var data = fs.readFileSync(fileName, 'utf-8');
        object = JSON.parse(data);
    }
    return object;
}

function saveFile(object, fileName) {

    if (fileName === undefined) {
        var filters = {
            filters: [
                {name: 'text', extensions: ['txt']}
            ]
        };

        dialog.showSaveDialog(filters, function (fileName) {
            if (fileName === undefined) return;

            fs.writeFile(fileName, JSON.stringify(object), function (err) {
            });
        });
    } else {
        fs.writeFile(fileName, JSON.stringify(object), function (err) {
        });
    }
    /*

     object = {
     status: " file saved"
     };
     */

}