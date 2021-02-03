var CLIENT_ID = '************';
var API_KEY = '*************';

// Array of API discovery doc URLs for APIs used by the quickstart
var DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];

// accesses only the appData folder
var SCOPES = 'https://www.googleapis.com/auth/drive.appdata';

var authorizeButton = document.getElementById('authorize_button');

var signoutButton = document.getElementById('signout_button');

/*
 On load, called to load the auth2 library and API client library.
*/
  
function handleClientLoad() {
        gapi.load('client:auth2', initClient);
      } //initClient: callback not a driveAPI method

/*
  Initializes the API client library and sets up sign-in state listeners.
*/

function initClient() {
  gapi.client.init({
    apiKey: API_KEY,
    clientId: CLIENT_ID,
    discoveryDocs: DISCOVERY_DOCS,
    scope: SCOPES
  }).then(function () {
    // Listen for sign-in state changes.
    gapi.auth2.getAuthInstance().isSignedIn.listen(updateSigninStatus);
    // Handle the initial sign-in state.
    updateSigninStatus(gapi.auth2.getAuthInstance().isSignedIn.get());
    authorizeButton.onclick = handleAuthClick;
    signoutButton.onclick = handleSignoutClick;
    
  }, function(error) {
    appendPre(JSON.stringify(error, null, 2));
  });
}

/*
  Called when the signed in status changes, to update the UI appropriately. After a sign-in, the API is called.
*/

function updateSigninStatus(isSignedIn) {
  if (isSignedIn) {
    authorizeButton.style.display = 'none';
    signoutButton.style.display = 'block';
    listFiles();
    listFolder();
  } else {
    authorizeButton.style.display = 'block';
    signoutButton.style.display = 'none';
  }
}

/*
  Sign in the user upon button click.
*/
function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

/*
  Sign out the user upon button click.
*/

function handleSignoutClick(event) {
  gapi.auth2.getAuthInstance().signOut();
}

/*
  Append a pre element to the body containing the given message as its text node. Used to display the results of the API call.
  @param {string} message Text to be placed in pre element.
*/
function appendPre(message) {
  var pre = document.getElementById('content');
  var textContent = document.createTextNode(message + '\n');
  pre.appendChild(textContent);
}

/*
  Print files.
*/

function listFiles() {
  var request = gapi.client.drive.files.list({
    'spaces': 'appDataFolder',
    'pageSize': 10,
    'fields': "nextPageToken, files(id, name, webContentLink, webViewLink)"
  })
  request.then(function(response) {
    appendPre('Files:');
    files = response.result.files;
    if (files && files.length > 0) {
      for (var i = 0; i < files.length; i++) {
        var file = files[i];
        appendPre(file.name + ' (' + file.id + " link " + file.webContentLink + " viewlink " + file.webViewLink + ')');
      }
    } else {
      appendPre('No files found.');
    }
    
  }, (err) => {console.log('Error:' ,err)});
      }

//ADDITION

function upload() {
  const boundary='foo_bar_baz';
  const delimiter = "\r\n--" + boundary + "\r\n";
  const close_delim = "\r\n--" + boundary + "--";
  var fileName='mychat123';
  var fileData='this is a sample data';
  var contentType='text/plain'
  var metadata = {
          'name': fileName,
          'mimeType': contentType,
          'parents': ['appDataFolder']
        };
  var multipartRequestBody =
  
  delimiter +
  'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
  JSON.stringify(metadata) + delimiter +
  'Content-Type: ' + contentType + '\r\n\r\n' +
  fileData+'\r\n'+
  close_delim;
  
  console.log(multipartRequestBody);
  var request = window.gapi.client.request({
    'path': 'https://www.googleapis.com/upload/drive/v3/files',
    'method': 'POST',
    'params': {'uploadType': 'multipart'},
    'headers': {
      'Content-Type': 'multipart/related; boundary=' + boundary + ''
    },
    'body':multipartRequestBody});
    request.execute(function(file) {
      console.log(file)
    })
}
    
function readFile(fileId, callback) {
    var request = gapi.client.drive.files.get({
        fileId: fileId,
        alt: 'media'
    })
    request.then(function(response) {
        console.log(response); //response.body contains the string value of the file
        if (typeof callback === "function") callback(response);
    }, function(error) {
        console.error(error)
    })
    return request;
}

async function update(fileId, updateData) {
        var request = gapi.client.drive.files.get({
          fileId: fileId,
        })
        let file = await request
        console.log(file, "logged")
        const boundary='foo_bar_baz'
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";

        var multipartRequestBody =
          delimiter +
          'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
          JSON.stringify(file.result) +
          delimiter +
          'Content-Type: ' + file.result.mimeType + '\r\n\r\n' +
          updateData +'\r\n'+
          close_delim;

          console.log(multipartRequestBody);
 
          var request2 = window.gapi.client.request({
            'path': '/upload/drive/v2/files/' + fileId,
            'method': 'PUT',
            'params': {'uploadType': 'multipart'},
            'headers': {
              'Content-Type': 'multipart/related; boundary=' + boundary + ''
            },
            'body': multipartRequestBody});
        request2.execute(function(file) {
          console.log(file)
      })
    }

function uploadFolder() {
        const boundary='foo_bar_baz'
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";
        var fileName='UniClip';
        var contentType='application/vnd.google-apps.folder'
        var metadata = {
          'name': fileName,
          'mimeType': contentType,
          'parents': ['appDataFolder']
        };

        var multipartRequestBody =
          delimiter +
          'Content-Type: application/json; charset=UTF-8\r\n\r\n' +
          JSON.stringify(metadata) +
          delimiter +
          'Content-Type: ' + contentType + '\r\n\r\n' + '\r\n'+
          close_delim;

          console.log(multipartRequestBody);

          var request = window.gapi.client.request({
            'path': 'https://www.googleapis.com/upload/drive/v3/files',
            'method': 'POST',
            'params': {'uploadType': 'multipart'},
            'headers': {
              'Content-Type': 'multipart/related; boundary=' + boundary + ''
            },
            'body': multipartRequestBody});
        request.execute(function(file) {
          console.log(file)
      })
    }
    
function listFolder() {
      var request = gapi.client.drive.files.list({
        'spaces' : 'appDataFolder',
        'q': "mimeType = 'application/vnd.google-apps.folder'",
        fields: 'nextPageToken, files(id,name)'
      }).then(function(response) {
          appendPre('\nFolders:');
          files = response.result.files;
          if (files && files.length > 0) {
            for (var i = 0; i < files.length; i++) {
              var file = files[i];
              appendPre(file.name + ' (' + file.id + ')');
            }
          } else {
            appendPre('No folders found.');
          }
    })
    }
    
function deleteFile(fileId) {
      var request = gapi.client.drive.files.delete({
        'fileId': fileId
      });  
      request.execute(function(resp) {console.log(resp) });
    }