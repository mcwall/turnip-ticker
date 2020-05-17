const stopWords = ["daisy", "mae", "pig", "snot", "swine"]

var token = ""

function refresh() {
  const tokenHeader = "Basic <creds_here>";
  console.log("fetching token...");

  let formData = new FormData();
  formData.append("grant_type", "client_credentials");

  fetch("https://www.reddit.com/api/v1/access_token",
    {
      headers: { "Authorization": tokenHeader },
      body: formData,
      method: "post"
    })
    .then(r => r.json())
    .then(r => {
      token = r.access_token
    })
    .then(requestAndParse)
    .catch(e => showError(e));
}

function requestAndParse() {
  console.log("fetching data...");

  fetch("https://oauth.reddit.com/r/acturnips/new?limit=1",
    {
      headers: { "Authorization": "Bearer " + token }
    })
    .then(r => r.json())
    .then(processResponse)
    .catch(e => showError(e));
}

function processResponse(res) {
  let latestPosting = res.data.children[0].data;
  let ellapsedSeconds = new Date().getTime() / 1000.0 - latestPosting.created_utc;
  if (ellapsedSeconds > 60){
    return;
  }

  console.log("New Posting: " + latestPosting.title);

  for (const stopWord of stopWords){
    console.log(stopWord);
    if (latestPosting.title.toLowerCase().includes(stopWord)){
      return;
    }
  }
  
  openPosting(latestPosting);
  deactivate();
}

var audio = new Audio("https://upload.wikimedia.org/wikipedia/commons/8/81/Alarm_or_siren.ogg")

function openPosting(posting) {
  audio.play();
  chrome.tabs.create({
    url: "https://reddit.com/" + posting.permalink
  });
}

var fetchInterval, tokenInterval;
var isActive = false;
function activate() {
  isActive = true;
  fetchInterval = setInterval(requestAndParse, 10000);
  tokenInterval = setInterval(refresh, 60000 * 60);
  chrome.browserAction.setIcon({path: 'icon-active.png'});
  refresh();
}

function deactivate() {
  isActive = false;
  clearInterval(fetchInterval);
  clearInterval(tokenInterval);
  chrome.browserAction.setIcon({path: 'icon.png'});
}

function showError(e) {
  console.log(e);
  isActive = false;
  chrome.browserAction.setIcon({path: 'icon-error.png'});
}

function onClicked() {
  if (isActive)
    deactivate();
  else 
    activate();
}

chrome.browserAction.onClicked.addListener(onClicked);
activate();
