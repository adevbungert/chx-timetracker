 // initialisation de localStorage
chrome.runtime.onInstalled.addListener(function() {
    localStorage.current_log = "";

    if (!localStorage.ended_logs)
        localStorage.ended_logs = "{}";
});


function createNewLogFromUrl(url)
{
    var re = /^(\S+:\/\/\/?)?([\da-z.\-_]+)\/?/i;
	//var re = /^(\S+:\/\/\/?)?([\da-z\-_]+\.)?([\da-z\-_]+\.?[\da-z.\-_]+)\/?/i;

    url = re.exec(url);
    if (url[1].indexOf("http") == -1 || url[1] == undefined)
        var host = url[1] + url[2];
    else
        var host = url[2];

    var newLog = {
        host: host,
        timestamp_start: Date.now()
    };
    localStorage.current_log = JSON.stringify(newLog);
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

function createNewLog()
{
    endLog();

    chrome.tabs.query({ active: true, lastFocusedWindow: true }, function(tab) {
        if (tab[0])
        {
            // permet de voir si l'utilisateur est sorti de Chrome
            chrome.windows.get(tab[0].windowId, function(win) {
                if (win.focused)
                    createNewLogFromUrl(tab[0].url);
                else
                    return (null);
            });
        }
        else
            return  (null);
    });
}




chrome.alarms.create("updateTab", { periodInMinutes: 1 });
/*chrome.alarms.onAlarm.addListener(function(alarm) {
    if (alarm.name == "updateTab")
        getActiveTab();
});*/


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
    if (winId == chrome.windows.WINDOW_ID_NONE)
        endLog();
    else
        createNewLog();
});




chrome.idle.queryState(60, function(newState) {
    console.log(newState);
});

chrome.idle.onStateChanged.addListener(function(newState) {
    if (newState == "active")
        createNewLog();
    else
        endLog();
});


//vérifier si l'ID n'a pas été changé en cours de navigation à cause du PRERENDERING
chrome.tabs.onReplaced.addListener(function(newId, OldId) {
    console.log("onReplaced TRIGGERED");
})

// onglet fermé
chrome.tabs.onRemoved.addListener(function(tabId, tabInfo) {
    createNewLog();
});
