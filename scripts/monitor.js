 // initialisation de localStorage
chrome.runtime.onInstalled.addListener(function() {
    if (!localStorage.logs)
        localStorage.logs = "{}";
});

var currentLog = {
    host: "",
    timestamp_start: 0
};

function createNewLogFromUrl(url)
{
    var re = /^(\S+:\/\/\/?)?([\da-z.\-_]+)\/?/i;
	//var re = /^(\S+:\/\/\/?)?([\da-z\-_]+\.)?([\da-z\-_]+\.?[\da-z.\-_]+)\/?/i;

    url = re.exec(url);
    if (url[1].indexOf("http") == -1 || url[1] == undefined)
        var host = url[1] + url[2];
    else
        var host = url[2];

    if (currentLog.host == "")
    {
        currentLog.host = host;
        currentLog.timestamp_start = Date.now();
    }
    else
    {
        if (currentLog.host != host)
        {
            endLog();
            currentLog.host = host;
            currentLog.timestamp_start = Date.now();
        }
    }
}

function endLog()
{
    if (currentLog.host != "")
    {
        //var currentLog = JSON.parse(localStorage.current_log);
        var allLogs = JSON.parse(localStorage.logs);

        var newLog = {
            timestamp_start: currentLog.timestamp_start,
            timestamp_end: Date.now()
        };

        if (localStorage.logs.indexOf(currentLog.host) != -1)
        {
            for (var i in allLogs)
            {
                if (i == currentLog.host)
                    allLogs[i].push(newLog);
            }
        }
        else
            allLogs[currentLog.host] = [newLog];

        currentLog.host = "";
        currentLog.timestamp_start = 0;
        localStorage.logs = JSON.stringify(allLogs);
    }
}

function createNewLog()
{
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tab) {
        if (tab.length == 1)
        {
            // permet de voir si l'utilisateur est sorti de Chrome
            chrome.windows.get(tab[0].windowId, function(win) {
                if (win.focused)
                    createNewLogFromUrl(tab[0].url);
                else
                    endLog();
            });
        }
        else
            endLog();
    });
}


chrome.alarms.create("updateTab", { periodInMinutes: 1 });
chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name == "updateTab")
        createNewLog();
});

//nouvelle URL chargée
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == "complete" && tab.active == true)
        createNewLog();
});

// nouvelle tab ou changement de tab
chrome.tabs.onActivated.addListener(function() {
    createNewLog();
});

chrome.windows.onFocusChanged.addListener(function(winId) {
    if (winId == -1) //chrome.windows.WINDOW_ID_NONE
        endLog();
    else
        createNewLog();
});

chrome.idle.onStateChanged.addListener(function(newState) {
    if (newState == "active")
        createNewLog();
    else
        endLog();
});

// onglet fermé
chrome.tabs.onRemoved.addListener(function(tabId, tabInfo) {
    createNewLog();
});
