document.querySelector("input[type=button]").addEventListener("click", function() {
    localStorage.current_log = "";
    localStorage.ended_logs = "{}";
});


function sortArrayByTime(tableau)
{
    var i = 1;
    while (i < tableau.length)
    {
        if (tableau[i - 1][1] < tableau[i][1])
        {
            temp = tableau[i - 1];
            tableau[i - 1] = tableau[i];
            tableau[i] = temp;
            i = 1;
        }
        else
            i++;
    }
    return (tableau);
}

function convertTimeFromMillisecond(time)
{
    var seconds = Math.round(time / 1000);
    var minutes = Math.floor(seconds / 60);
    var hours = Math.floor(minutes / 60);
    var days = Math.floor(hours / 24);

    var result;

    if (minutes > 0)
    {
        seconds = seconds - minutes * 60;
        if (minutes < 60)
            result = minutes + " mins " + seconds + " secs";
        else
        {
            minutes = minutes - hours * 60;
            if (hours < 24)
                result = hours + " hrs " + minutes + " mins " + seconds + " secs";
            else
            {
                hours = hours - days * 24;
                result = days + " days " + hours + " hrs " + minutes + " mins " + seconds + " secs";
            }
        }
    }
    else
        result = seconds + " secs";

    return (result);
}

var logs = JSON.parse(localStorage.ended_logs);
var finalCount = [];
var totalTime = 0;

for (var i in logs)
{
    var time = 0;
    logs[i].forEach(function(log) {
        time += log.timestamp_end - log.timestamp_start;
        totalTime += log.timestamp_end - log.timestamp_start;
    });
    finalCount.push([i, time]);
}

finalCount = sortArrayByTime(finalCount);

var table = document.querySelector("tbody");
finalCount.forEach(function(site) {
    var tr = document.createElement("tr");
    var tdSite = document.createElement("td");
    var tdTime = document.createElement("td");
    var tdPercent = document.createElement("td");

    tdSite.innerHTML = site[0];
    tdTime.innerHTML = convertTimeFromMillisecond(site[1]);
    tdPercent.innerHTML = Math.round((site[1] / totalTime) * 100) + " %";

    tr.appendChild(tdSite);
    tr.appendChild(tdTime);
    tr.appendChild(tdPercent);
    table.appendChild(tr);
});
