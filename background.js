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
    .catch(e => alert(e));
}

function requestAndParse() {
  console.log("fetching data...");

  fetch("https://oauth.reddit.com/r/acturnips/new?limit=1",
    {
      headers: { "Authorization": "Bearer " + token }
    })
    .then(r => r.json())
    .then(processResponse)
    .catch(e => alert(e));
}

refresh();
var interval = setInterval(requestAndParse, 10000);
var tokenInterval = setInterval(refresh, 60000 * 60);

function processResponse(res) {
  var data = res.data
  var latestPosting = data.children[0].data;
  var ellapsedSeconds = new Date().getTime() / 1000.0 - latestPosting.created_utc
  console.log(ellapsedSeconds);
  if (ellapsedSeconds < 60) {
    clearInterval(interval);
    openPosting(latestPosting);
  }
}

var audio = new Audio("https://upload.wikimedia.org/wikipedia/commons/8/81/Alarm_or_siren.ogg")

function openPosting(posting) {
  audio.play();
  chrome.tabs.create({
    url: "https://reddit.com/" + posting.permalink
  });
}

chrome.browserAction.onClicked.addListener(refresh);
