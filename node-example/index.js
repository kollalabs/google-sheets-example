// This script assumes you already have a linked account with google sheets connector in your kolla account
// You will need the consumer ID and the connector ID
// You also need a Kolla API key set as an environment variable KOLLA_API_KEY
const {OAuth2Client} = require('google-auth-library');
const {google} = require('googleapis');
const oAuth2Client = new OAuth2Client()

// SET THESE VALUES TO YOUR SPECIFIC VALUES
const connectorID = "google-drive-kolla-2" // Set this to your google drive connector ID
const consumerID = "test-customer-002" // Set this to your ocnsumer ID that was set when you created the consumer_token
const apiKey = process.env.KOLLA_API_KEY

// This function gets the OAuth2 credentials from the Kolla API then sets them in the Google API SDK
async function getCredentials() {
  var axios = require('axios');
  var data = JSON.stringify({
    "consumer_id": consumerID
  });
  // This axios config is for the KollaConnect API. This function gets the credentials for a linked account
  var config = {
    method: 'post',
    url: 'https://api.getkolla.com/connect/v1/connectors/' + connectorID + '/linkedaccounts/-:credentials',
    headers: { 
      'Content-Type': 'application/json', 
      'Accept': 'application/json', 
      'Authorization': 'Bearer ' + apiKey
    },
    data : data
  };

  const response = await axios(config)
  
  oAuth2Client.setCredentials({access_token: response.data.credentials.token})
}

// This function creates the google sheets document using the credentials from the KollaConnect API
async function createDocument() {

  const title = "My New Spreadsheet"
  
  const service = google.sheets({version: 'v4', auth: oAuth2Client});
  const resource = {
    properties: {
      title,
    },
  };
  try {
    const spreadsheet = await service.spreadsheets.create({
      resource,
      fields: 'spreadsheetId',
    });
    console.log(`Spreadsheet ID: ${spreadsheet.data.spreadsheetId}`);
    return spreadsheet.data.spreadsheetId;
  } catch (err) {
    // TODO (developer) - Handle exception
    throw err;
  }
}

async function main() {
  await getCredentials()
  await createDocument()
}

main()



  

  