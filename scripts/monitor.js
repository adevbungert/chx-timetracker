 // initialisation de localStorage
chrome.runtime.onInstalled.addListener(function() {
    localStorage.current_log = "";

    if (!localStorage.ended_logs)
        localStorage.ended_logs = "{}";
});


function createNewLogFromUrl(url)
{
    var re = /^(\S+:\/\/\/?)?([\da-z.\-_]+)\/?/i;

    url = re.exec(url);
    if (url[1].indexOf("http") == -1 || url[1] == undefined)
        var host = url[1] + url[2] + "\n(" + url + ")";
    else
        var host = url[2];

    var newLog = {
        host: host,
        timestamp_start: Date.now()
    };
    localStorage.current_log = JSON.stringify(newLog);
}

function createNewLog()
{
    chrome.tabs.query({ active: true, currentWindow: true }, function(tab) {
        if (tab.length == 1)
            createNewLogFromUrl(tab[0].url);
    });
}

function endLog()
{
    if (localStorage.current_log != "")
    {
        var currentLog = JSON.parse(localStorage.current_log);
        var endedLogs = JSON.parse(localStorage.ended_logs);

        var newLog = {
            timestamp_start: currentLog.timestamp_start,
            timestamp_end: Date.now()
        };

        if (localStorage.ended_logs.indexOf(currentLog.host) != -1)
        {
            for (var i in endedLogs)
            {
                if (i == currentLog.host)
                    endedLogs[i].push(newLog);
            }
        }
        else
            endedLogs[currentLog.host] = [newLog];

        localStorage.current_log = "";
        localStorage.ended_logs = JSON.stringify(endedLogs);
    }
}

/***
lastFocusedWindow: la dernière fenetre ayant eu le focus
currentWindow: la fenetre executant un script actuellement, pas forcement celle en premier plan
***/
function checkActiveTab()
{
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tab) {
        if (tab[0])
        {
            // permet de voir si l'utilisateur est sorti de Chrome
            chrome.windows.get(tab[0].windowId, function(win) {
                if (win.focused)
                    return (tab.url);
                else
                    return (null);
            });
        }
        else
            return  (null);
    });
}

chrome.alarms.create("updateTab", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name == "updateTab")
        checkActiveTab();
});





//nouvelle URL chargée
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == "complete" && tab.active == true)
    {
        endLog();
        createNewLog();
    }
});

// nouvelle tab ou changement de tab
chrome.tabs.onActivated.addListener(function() {
    endLog();
    createNewLog();
});

chrome.windows.onFocusChanged.addListener(function(winId) {
    if (winId == chrome.windows.WINDOW_ID_NONE)
        endLog();
    else
    {
        endLog();
        createNewLog();
    }
    console.log("onFocusChanged");
});





chrome.idle.onStateChanged.addListener(function(newState) {
    console.log(newState);
    if (newState == "active");
        //createNewLog();
    else
        endLog();
});
/****
// QUELLE DIFFERENCE AVEC onStateChanged ???
****/
chrome.idle.queryState(15, function(newState) {
    console.log(newState);
});






//vérifier si l'ID n'a pas été changé en cours de navigation à cause du PRERENDERING
chrome.tabs.onReplaced.addListener(function(newId, OldId) {
    console.log("onReplaced TRIGGERED");
})

// onglet fermé
chrome.tabs.onRemoved.addListener(function(tabId, tabInfo) {
    endLog();
    createNewLog();
});







/*
// nouvelle page visitée
chrome.history.onVisited.addListener(function(result) {
    chrome.history.getVisits({ url: result.url }, function(cb) {
        var last = cb.length - 1;
        console.log(cb);
        console.log(cb[last]);
    });
    console.log(result)
});

// nouvelle page ouverte à partir d'un lien. on peut récupérer le lien qui a trigger l'action
chrome.webNavigation.onCreatedNavigationTarget.addListener(function(result) {
    endLog(result.sourceTabId);
});
*/
