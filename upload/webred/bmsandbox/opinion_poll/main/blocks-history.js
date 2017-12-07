var svg = $('<svg xmlns="http://www.w3.org/2000/svg" version="1.1"></svg>');
var timeline = $('<svg xmlns="http://www.w3.org/2000/svg" version="1.1"></svg>');
var partyData = [];
var electionData = [];
var dotGroupsArray = [];
var xmls = [];
var timelineData = [];
var timelineGrid = 0;
var pollsNum = 0;
var maxProcent = 0;
var maxMandates = 0;
var minProcent = 100;
var minMandates = 100;
var months = [];
    months[1] = 'januar';
    months[2] = 'febuar';
    months[3] = 'marts';
    months[4] = 'april';
    months[5] = 'maj';
    months[6] = 'juni';
    months[7] = 'juli';
    months[8] = 'august';
    months[9] = 'september';
    months[10] = 'oktober';
    months[11] = 'november';
    months[12] = 'december';

$.ajax({
    type: "GET",
    url: '../valgresultater.xml',
    dataType: "xml",
    success: function (xml) {
        $(xml).find('datetime').each(function () {
            electionData[$(this).text().substr(0, 4)] = $(this).text().substr(0, 10);
        });
    }
});

$.ajax({
    type: "GET",
    url: '../parties.xml',
    dataType: "xml",
    success: function (xml) {
        var procentPaths = '';
        var mandatesPaths = '';
        $(xml).find('party').each(function () {
            var partyId = parseFloat($(this).find("id").text());
            partyData[partyId] = [];
            partyData[partyId].id = $(this).find("id").text();
            partyData[partyId].letter = $(this).find("letter").text();
            partyData[partyId].shortname = $(this).find("shortname").text();
        });
        
        procentPaths += '<path class="procent one" stroke="#bb252e" fill="none"/>';
        procentPaths += '<path class="procent two" stroke="#136a90" fill="none"/>';
        procentPaths += '<path class="mandates one" stroke="#bb252e" fill="none"/>';
        procentPaths += '<path class="mandates two" stroke="#136a90" fill="none"/>';
               
        svg.append('<g id="chart-lines">' + procentPaths + mandatesPaths + '</g><g id="chart-dots"/><g id="chart-markers"/>');
        timeline.append('<g id="timeline-lines">' + procentPaths + '</g><g id="timeline-markers"/>');
        
        setTimeout('installation();', 2);
    }
});

var installation = function () {  
    var tooYear = new Date().getFullYear();
    
    for(var i = tooYear; i >= 2010; i--) {
        $.ajax({
            type: "GET",
            url: '../' + i + '/pollofpolls.xml',
            dataType: "xml",
            async: false,
            success: function (xml) {  
                $.merge(xmls, $(xml));
            }
        });
        
        if(i == 2010) {
            makeTimeline(xmls);
        }
    }
    
    addEvents();
};

var makeTimeline = function(xml) {
    var xmlPolls = $(xml).find("poll");
    var totalPolls = xmlPolls.length;
    var totalHeight = 35;
    var fromDate = $('datetime', xmlPolls[totalPolls - 1]).text().substr(0, 10);
    var toDate = $('datetime', xmlPolls[0]).text().substr(0, 10);
    var nextDate;
    var lastDate = fromDate;
    var xPlus = 917 / (dateDifference(fromDate, toDate));
    var yearIndicator = 0;
    var markers = '';
    var markerX;
    var partyId;
    var supportColor = 'blue';
    var timelineArrayCounter = 0;
    var timelineArrayCounter2 = 0;
    var timelineArrayPlus;
    var timelineX = 12;
    var timelineprocentLineSupportOne = '';
    var timelineprocentLineSupportTwo = '';
        timelineGrid = xPlus;
        
    for(var i = totalPolls; i --;) {
        var pollData = xmlPolls[i];
        var pollDate = $('datetime', pollData).text().substr(0, 10);
        var timelineLineProcentOne = 0;
        var timelineLineProcentTwo = 0;
        var timelineLineMandatesOne = 0;
        var timelineLineMandatesTwo = 0;
        
        if(i !== 0){
            nextDate = $('datetime', xmlPolls[i - 1]).text().substr(0, 10);
        } else {
            nextDate = pollDate;
        }
        
        var pollYear = parseFloat(pollDate.substr(0, 4));
        var pollEntries = $('entry', pollData);
        var pollEntriesTotal = pollEntries.length;
            timelineArrayPlus = dateDifference(pollDate, nextDate);
            
        for (var a = timelineArrayCounter; a <= (timelineArrayCounter + timelineArrayPlus); a ++) {
            timelineData[a] = [];
            timelineData[a].counter = timelineArrayCounter2; 
            timelineData[a].date = pollDate;
        }
        
        timelineX = timelineX + (xPlus * dateDifference(lastDate, pollDate));
         
        for(var o = pollEntriesTotal; o --;) {
            var entryData = pollEntries[o];
                partyId = $('id', entryData).text();
            var partyProcent = parseFloat($('percent', entryData).text());
            var partyMandates = parseFloat($('mandates', entryData).text());
            var partySupports = $('supports', entryData).text();
            
            if(partySupports == 1 || partySupports == 9) {
                timelineLineProcentOne = timelineLineProcentOne + partyProcent;
                timelineLineMandatesOne = timelineLineMandatesOne + partyMandates;
                
                if (partyData[partyId].letter == "A") {
                    supportColor = "red";
                }
            }
            else {
                timelineLineProcentTwo = timelineLineProcentTwo + partyProcent;
                timelineLineMandatesTwo = timelineLineMandatesTwo + partyMandates;
            }
                
            if(pollYear != yearIndicator) {
                markerX = timelineX - (dateDifference(pollYear + "-01-01", pollDate) * xPlus);
                
                if(markerX < 0) {
                    markerX = 12;
                }
                
                markers += '<g class="year-marker">'; 
                markers += '<text x="' + markerX + '" y="10" fill="#D2D2D2" font-size="11" text-anchor="middle">' + pollYear + '</text>'; 
                markers += '<line x1="' + markerX + '" y1="12" x2="' + markerX + '" y2="17" fill="none" stroke="#D2D2D2" stroke-width="1"/>'; 
                markers += '</g>'; 
                yearIndicator = pollYear;
            }
        } // for loop (entries)
        
        if(supportColor === 'blue') {
            var OldtimelineLineProcentOne = timelineLineProcentOne;
            timelineLineProcentOne = timelineLineProcentTwo;
            timelineLineProcentTwo = OldtimelineLineProcentOne;
        }
        
        var calculadedProcentOne = (timelineLineProcentOne / 50) * totalHeight;
            calculadedProcentOne = (totalHeight - calculadedProcentOne) - calculadedProcentOne;
            calculadedProcentOne = calculadedProcentOne + 65;
        var calculadedProcentTwo = (timelineLineProcentTwo / 50) * totalHeight;
            calculadedProcentTwo = (totalHeight - calculadedProcentTwo) - calculadedProcentTwo;
            calculadedProcentTwo = calculadedProcentTwo + 65;
        
        if (timelineprocentLineSupportOne === '') {
            timelineprocentLineSupportOne = 'M 0 ' + calculadedProcentOne;
            timelineprocentLineSupportOne += ' L ' + timelineX + ' ' + calculadedProcentOne;
            timelineprocentLineSupportTwo = 'M 0 ' + calculadedProcentTwo;
            timelineprocentLineSupportTwo += ' L ' + timelineX + ' ' + calculadedProcentTwo;
        }
        else {
            timelineprocentLineSupportOne += ' L ' + timelineX + ' ' + calculadedProcentOne;
            timelineprocentLineSupportTwo += ' L ' + timelineX + ' ' + calculadedProcentTwo;
            
            if(i === 0) {
                timelineprocentLineSupportOne += ' L 940 ' + calculadedProcentOne;
                timelineprocentLineSupportTwo += ' L 940 ' + calculadedProcentTwo;
            }
        }    
        
        if (timelineLineProcentOne > maxProcent) {
            maxProcent = timelineLineProcentOne;
        }
        else if (timelineLineProcentTwo > maxProcent) {
            maxProcent = timelineLineProcentTwo;
        }
        
        if (timelineLineMandatesOne > maxMandates) {
            maxMandates = timelineLineMandatesOne;
        }
        else if (timelineLineMandatesTwo > maxMandates) {
            maxMandates = timelineLineMandatesTwo;
        }
        
        if (timelineLineProcentOne < minProcent) {
            minProcent = timelineLineProcentOne;
        }
        else if (timelineLineProcentTwo < minProcent) {
            minProcent = timelineLineProcentTwo;
        }
        
        if (timelineLineMandatesOne < minMandates) {
            minMandates = timelineLineMandatesOne;
        }
        else if (timelineLineMandatesTwo < minMandates) {
            minMandates = timelineLineMandatesTwo;
        }
        
        if(timelineArrayPlus === 0) {
            timelineArrayPlus = 1;
        }
        
        timelineArrayCounter = timelineArrayCounter + timelineArrayPlus;
        timelineArrayCounter2++;
        lastDate = pollDate;
    } // for loop (polls
    
    $('#timeline-markers', timeline).append(markers);
    $('.one', timeline).attr('d', timelineprocentLineSupportOne).attr('stroke-width', 1.5);
    $('.two', timeline).attr('d', timelineprocentLineSupportTwo).attr('stroke-width', 1.5);
    $('#timeline').append(timeline).html($('#timeline').html());
    $('#zoomer, #timeline .info').show();
    
    makeSVG(xml);
};

var makeSVG = function(xml, start, totalPolls) {   
    var xmlPolls = $(xml).find("poll");
    var xPlus;
    var pollDate;
    var firstRun;
    var dotLoopStart = 0;
    var dotLoopEnd;
    var latestPoll;
    var yearIndicator = 0;
    var yearCounter = 0;
    var monthIndicator = 0;
    var markerX = 17;
    var lastMarkerX = 0;
    var markers = '';
    var markerSpace = 0;
    var dotGroupsHtml = '';
    var dotGroupId = 0;
    var supportOneProcent;
    var supportTwoProcent;
    var supportOneMandates;
    var supportTwoMandates;
    var supportOneColor;
    var supportOnePartys;
    var supportTwoPartys;
    var procentLineSupportOne = '';
    var procentLineSupportTwo = '';
    var mandatesLineSupportOne = '';
    var mandatesLineSupportTwo = '';
    var x = 17;
    
    if(totalPolls === undefined) {
        totalPolls = xmlPolls.length - 1;
        pollsNum = totalPolls;
        start = 0;
        dotLoopEnd = totalPolls; 
        firstRun = 1;
    }
    else {                
        $('#chart-dots g', svg).remove();
        $('#chart-markers g', svg).remove();
        $("#chart svg, #chart .lines").remove();
        
        dotLoopEnd = dotLoopStart + (totalPolls - start);  
    }
    
    var fromDate = $('datetime', xmlPolls[totalPolls]).text().substr(0, 10);
    var toDate = $('datetime', xmlPolls[start]).text().substr(0, 10);
    var lastDate = fromDate;
    
    xPlus = 905 / (dateDifference(fromDate, toDate));
    
    dotGroupsArray = []; 
    dotGroupsArray.length = 0; 
    
    for(var i = totalPolls; i >= start; i --) { 
        var pollData = xmlPolls[i];
            pollDate = $('datetime', pollData).text().substr(0, 10);
        var pollYear = parseFloat(pollDate.substr(0, 4));
        var pollMonth = pollDate.substr(5, 2);
        var pollRespondents = $('respondents', pollData).text();
        var pollEntries = $('entry', pollData);
        var pollEntriesTotal = pollEntries.length;
        var lineProcentOne = 0;
        var lineProcentTwo = 0;
        var lineMandatesOne = 0;
        var lineMandatesTwo = 0;
        var supportOnePartys = '';
        var supportTwoPartys = '';
        var supportColor = 'blue';
            x = x + (xPlus * dateDifference(lastDate, pollDate));
            
        var sortedArray = pollEntries.sort(function (a, b) {
            var d1 = $(b).find("party").find("letter").text();
            var d2 = $(a).find("party").find("letter").text();
    
            return (d1 < d2 ? -1 : (d1 > d2 ? +1 : 0));
        });
        
        for(var o = pollEntriesTotal; o --;) {
            var entryData = sortedArray[o];
            var partyId = $('id', entryData).text();
            var partyProcent = parseFloat($('percent', entryData).text());
            var partyMandates = parseFloat($('mandates', entryData).text());
            var partySupports = $('supports', entryData).text();
            var partyShortname = partyData[partyId].shortname;
            
            if(partySupports == 1 || partySupports == 9) {
                lineProcentOne = lineProcentOne + partyProcent;
                lineMandatesOne = lineMandatesOne + partyMandates;
                supportOnePartys += partyShortname + ', ';
                
                if (partyData[partyId].letter == "A") {
                    supportColor = "red";
                }
            }
            else {
                lineProcentTwo = lineProcentTwo + partyProcent;
                lineMandatesTwo = lineMandatesTwo + partyMandates;
                supportTwoPartys += partyShortname + ', ';
            }        
        } // for loop (entries)
        
        if(supportColor === 'blue') {
            var OldlineProcentOne = lineProcentOne;
            var OldlineMandatesOne = lineMandatesOne;
            
            lineProcentOne = lineProcentTwo;
            lineProcentTwo = OldlineProcentOne;
            lineMandatesOne = lineMandatesTwo;
            lineMandatesTwo = OldlineMandatesOne;
        }
        
        var calculadedProcentOne = ((lineProcentOne - minProcent) / (maxProcent - minProcent)) * 240;
            calculadedProcentOne = 260 - (calculadedProcentOne);
            
        var calculadedProcentTwo = ((lineProcentTwo - minProcent) / (maxProcent - minProcent)) * 240;
            calculadedProcentTwo = 260 - (calculadedProcentTwo);
            
        var calculadedMandatesOne = ((lineMandatesOne - minMandates) / (maxMandates - minMandates)) * 240;
            calculadedMandatesOne = 260 - (calculadedMandatesOne);
            
        var calculadedMandatesTwo = ((lineMandatesTwo - minMandates) / (maxMandates - minMandates)) * 240;
            calculadedMandatesTwo = 260 - (calculadedMandatesTwo);
        
        if (procentLineSupportOne === '') {
            procentLineSupportOne += ' M ' + x + ' ' + calculadedProcentOne;
            procentLineSupportTwo += ' M ' + x + ' ' + calculadedProcentTwo;
            
            mandatesLineSupportOne += ' M ' + x + ' ' + calculadedMandatesOne;
            mandatesLineSupportTwo += ' M ' + x + ' ' + calculadedMandatesTwo;
        }
        else {
            procentLineSupportOne += ' L ' + x + ' ' + calculadedProcentOne;
            procentLineSupportTwo += ' L ' + x + ' ' + calculadedProcentTwo;
            
            mandatesLineSupportOne += ' L ' + x + ' ' + calculadedMandatesOne;
            mandatesLineSupportTwo += ' L ' + x + ' ' + calculadedMandatesTwo;
        } 
        
        if (!dotGroupsArray[dotGroupId]) {
            dotGroupsArray[dotGroupId] = [];
            dotGroupsArray[dotGroupId].x = x;
            dotGroupsArray[dotGroupId].date = pollDate;
            dotGroupsArray[dotGroupId].respondents = pollRespondents;
            
            if(supportColor === 'red') {
                dotGroupsArray[dotGroupId].supportOneProcent = lineProcentOne;
                dotGroupsArray[dotGroupId].supportTwoProcent = lineProcentTwo;
                dotGroupsArray[dotGroupId].supportOneMandates = lineMandatesOne;
                dotGroupsArray[dotGroupId].supportTwoMandates = lineMandatesTwo;
            }
            else {
                dotGroupsArray[dotGroupId].supportOneProcent = lineProcentTwo;
                dotGroupsArray[dotGroupId].supportTwoProcent = lineProcentOne;
                dotGroupsArray[dotGroupId].supportOneMandates = lineMandatesTwo;
                dotGroupsArray[dotGroupId].supportTwoMandates = lineMandatesOne;
            }
            
            dotGroupsArray[dotGroupId].supportOnePartys = supportOnePartys;
            dotGroupsArray[dotGroupId].supportTwoPartys = supportTwoPartys;
            dotGroupsArray[dotGroupId].supportOneColor = supportColor;
            
            dotGroupsArray[dotGroupId].procentDots += '<circle class ="red procent" cx="' + x + '" cy="' + calculadedProcentOne + '" r="6" fill="transparent" stroke="#bb252e" stroke-width="0" date="' + pollDate + '" procent="' + lineProcentOne + '" mandates="' + lineMandatesOne + '"/>';
            dotGroupsArray[dotGroupId].mandatesDots += '<circle class ="red mandates" cx="' + x + '" cy="' + calculadedMandatesOne + '" r="6" fill="transparent" stroke="#bb252e" stroke-width="0"/>';
            
            dotGroupsArray[dotGroupId].procentDots += '<circle class ="blue procent" cx="' + x + '" cy="' + calculadedProcentTwo + '" r="6" fill="transparent" stroke="#136a90" stroke-width="0" date="' + pollDate + '" procent="' + lineProcentTwo + '" mandates="' + lineMandatesTwo + '"/>';
            dotGroupsArray[dotGroupId].mandatesDots += '<circle class ="blue mandates" cx="' + x + '" cy="' + calculadedMandatesTwo + '" r="6" fill="transparent" stroke="#136a90" stroke-width="0"/>';
        }        
        
        if(pollYear != yearIndicator) {
            if(electionData[pollYear] !== undefined) {
                markerX = x - (dateDifference(electionData[pollYear], pollDate) * xPlus);
                markers += '<g class="election-marker">';
                markers += '<line class="indicator" x1="' + markerX + '" y1="20" x2="' + markerX + '" y2="300" stroke="#76C276" stroke-width="0.3" />';
                markers += '<text x="' + markerX + '" y="14" fill="#76C276" font-size="11" text-anchor="middle">Valget ' + pollYear + '</text>';
                markers += '</g>';
            }
                
            markerX = x - (dateDifference(pollYear + "-01-01", pollDate) * xPlus);
            
            if(markerX > 0) {
                markers += '<g class="year-marker">'; 
                markers += '<text x="' + markerX + '" y="290" fill="#D2D2D2" font-size="12" text-anchor="middle">' + pollYear + '</text>';
                markers += '<g class="marker-arrow">';
                markers += '<line x1="' + (markerX + 16) + '" y1="286" x2="' + (markerX + 22) + '" y2="286" fill="none" stroke="#D2D2D2" stroke-width="2"/>'; 
                markers += '<path d="M ' + (markerX + 22) + ' 282 L ' + (markerX + 28) + ' 286 L ' + (markerX + 22) + ' 290" fill="#D2D2D2" stroke="#D2D2D2" stroke-width="1"/>';
                markers += '</g>';
                markers += '</g>';
                
                yearCounter++;  
            }
            
            yearIndicator = pollYear;
        }
        
        if(pollMonth != monthIndicator) {
            markerX = x - (dateDifference(pollYear + "-" + pollMonth + "-01", pollDate) * xPlus);
            
            if((markerX - lastMarkerX) > markerSpace && markerX > 9) {
                markers += '<g class="month-marker">'; 
                markers += '<text x="' + markerX + '" y="312" fill="#D2D2D2" font-size="11" text-anchor="middle">' + months[parseInt(pollMonth, 10)].substr(0, 3) + '.</text>'; 
                markers += '<line x1="' + markerX + '" y1="300" x2="' + markerX + '" y2="293" fill="none" stroke="#D2D2D2" stroke-width="1"/>'; 
                markers += '</g>';   
                
                lastMarkerX = markerX;
            }
            
            monthIndicator = pollMonth;
            markerSpace = 19;
        }
        dotGroupId++;
        lastDate = pollDate;
    } // for loop (polls)
    
    if (yearCounter === 0) {
        markers += '<g class="year-marker">'; 
        markers += '<text x="17" y="290" fill="#D2D2D2" font-size="12" text-anchor="middle">' + pollYear + '</text>';
        markers += '<g class="marker-arrow">';
        markers += '<line x1="33" y1="286" x2="39" y2="286" fill="none" stroke="#D2D2D2" stroke-width="2"/>'; 
        markers += '<path d="M 39 282 L 45 286 L 39 290" fill="#D2D2D2" stroke="#D2D2D2" stroke-width="1"/>';
        markers += '</g>';
        markers += '</g>';
        
        yearCounter++;
    }
    
    $('#chart-markers', svg).append(markers);
    
    if (yearCounter === 1) {
        $('.marker-arrow', svg).show();
    }
    
    var guideLineProcentNum = minProcent;
    var guideLineMandateNum = minMandates;
    var guideLineProcentNumPlus = (maxProcent - guideLineProcentNum) / 6;
    var guideLineMandateNumPlus = (maxMandates - guideLineMandateNum) / 6;
    var guideLines = '';
    
    for (var i = 0; i < 7; i ++) {
        guideLines = '<span class="lines"><p alt-value="' + parseInt(guideLineMandateNum, 10) + '">' + parseInt(guideLineProcentNum, 10) + '</p></span>' + guideLines;
        guideLineProcentNum = guideLineProcentNum + guideLineProcentNumPlus;
        guideLineMandateNum = guideLineMandateNum + guideLineMandateNumPlus;
    }
    
    $('#chart').append(guideLines);
    $('#chart .lines:first').addClass('top');
    
    if($('#mandates-toggle').hasClass('active')) {
        $('#chart-lines .procent', svg).hide();
        $('#chart-lines .mandates', svg).show();
    }
    
    $('.one.procent', svg).attr('d', procentLineSupportOne).attr('stroke-width', 4);
    $('.two.procent', svg).attr('d', procentLineSupportTwo).attr('stroke-width', 4);
    $('.one.mandates', svg).attr('d', mandatesLineSupportOne).attr('stroke-width', 4);
    $('.two.mandates', svg).attr('d', mandatesLineSupportTwo).attr('stroke-width', 4);
    
    var overlayX;
    var nextX;
    var overlayWidth;
    
    for(var i = dotLoopStart; i <= dotLoopEnd; i++) {
        dotGroupsHtml += '<g date="' + dotGroupsArray[i].date + '" respondents="' + dotGroupsArray[i].respondents + '"';
        dotGroupsHtml += ' support-one-procent="' + dotGroupsArray[i].supportOneProcent + '"';
        dotGroupsHtml += ' support-two-procent="' + dotGroupsArray[i].supportTwoProcent + '"';
        dotGroupsHtml += ' support-one-mandates="' + dotGroupsArray[i].supportOneMandates + '"';
        dotGroupsHtml += ' support-two-mandates="' + dotGroupsArray[i].supportTwoMandates + '"';
        dotGroupsHtml += ' support-one-partys="' + dotGroupsArray[i].supportOnePartys + '"';
        dotGroupsHtml += ' support-two-partys="' + dotGroupsArray[i].supportTwoPartys + '"';
        dotGroupsHtml += ' support-one-color="' + dotGroupsArray[i].supportOneColor + '"';                
        dotGroupsHtml += '>';                
        dotGroupsHtml += '<line class="guide" x1="' + dotGroupsArray[i].x + '" y1="20" x2="' + dotGroupsArray[i].x + '" y2="300" stroke="#bdbec0" stroke-width="0.3" visibility="hidden"/>';
        dotGroupsHtml += dotGroupsArray[i].procentDots;
        dotGroupsHtml += dotGroupsArray[i].mandatesDots;
        
        if (i  === dotLoopStart) {
            overlayX = dotGroupsArray[i].x - 5;
        } else {
            overlayX =  dotGroupsArray[i].x - ((dotGroupsArray[i].x - dotGroupsArray[i - 1].x) / 2);
        }
        
        if (i  === dotLoopEnd) {
            overlayWidth = dotGroupsArray[i].x;
        } else {
            nextX = dotGroupsArray[i].x + ((dotGroupsArray[i + 1].x - dotGroupsArray[i].x) / 2);
            overlayWidth = nextX - overlayX;
        }
        
        dotGroupsHtml += '<rect class="overlay" x="' + overlayX + '" y="20" width="' + overlayWidth + '" height="245" fill="transparent"/>';
        dotGroupsHtml += '</g>';
        
        if (i == dotLoopEnd) {
            supportOneProcent = dotGroupsArray[i].supportOneProcent;
            supportTwoProcent = dotGroupsArray[i].supportTwoProcent;
            supportOneMandates = dotGroupsArray[i].supportOneMandates;
            supportTwoMandates = dotGroupsArray[i].supportTwoMandates;
            supportOneColor = dotGroupsArray[i].supportOneColor;
            supportOnePartys = dotGroupsArray[i].supportOnePartys;
            supportTwoPartys = dotGroupsArray[i].supportTwoPartys;
            pollDate = dotGroupsArray[i].date.split('-');
            latestPoll = 'Berlingske Barometer ' + parseFloat(pollDate[2]) + '. ' + months[parseFloat(pollDate[1])] + ' ' + pollDate[0];
        }
    }
    
    $('#chart-dots', svg).append(dotGroupsHtml);
    
    var activeOne = supportOneProcent.toFixed(1).toString().replace(".", ",") + '%';
    var activeTwo = supportTwoProcent.toFixed(1).toString().replace(".", ",") + '%';
    var secondOne = supportOneMandates;
    var secondTwo = supportTwoMandates;
    var blueBlockTarget = $('#blockview-first-bottom .blue');
    var redBlockTarget = $('#blockview-first-bottom .red');

    var procentLeftOver = 100 - (supportOneProcent + supportTwoProcent);

    if (procentLeftOver > 0) {
        supportOneProcent = supportOneProcent + procentLeftOver;
    } else if (procentLeftOver < 0) {
        supportOneProcent = procentLeftOver + supportOneProcent;
    }
    
    if(firstRun !== undefined) {
        blueBlockTarget = $('#blockview-first-bottom .blue, #blockview-top .blue');
        redBlockTarget = $('#blockview-first-bottom .red, #blockview-top .red');
    }
    
    $('#blockview-first-bottom .red .info').html(latestPoll).show();
    $('#blockview-top, #blockview-first-bottom').show();

    if (supportOneColor == "red") {
        redBlockTarget.animate({
            width: supportOneProcent + '%'
        }, 700);
        $('.procent', redBlockTarget).attr('alt-value', secondOne).html(activeOne);
        $('#blockview-first-bottom .red .partys').html(supportOnePartys.substr(0, supportOnePartys.length - 2));
        blueBlockTarget.animate({
            width: supportTwoProcent + '%'
        }, 700);
        $('.procent', blueBlockTarget).attr('alt-value', secondTwo).html(activeTwo);
        $('#blockview-first-bottom .blue .partys').html(supportTwoPartys.substr(0, supportTwoPartys.length - 2));
    } else {
        redBlockTarget.animate({
            width: supportTwoProcent + '%'
        }, 700);
        $('.procent', redBlockTarget).attr('alt-value', secondTwo).html(activeTwo);
        $('#blockview-first-bottom .red .partys').html(supportTwoPartys.substr(0, supportTwoPartys.length - 2));
        blueBlockTarget.animate({
            width: supportOneProcent + '%'
        }, 700);
        $('.procent', blueBlockTarget).attr('alt-value', secondOne).html(activeOne);
        $('#blockview-first-bottom .blue .partys').html(supportOnePartys.substr(0, supportOnePartys.length - 2)); 
    }
    
    $('#chart').append(svg).html($('#chart').html());
    $('#loader').fadeOut(900);
    
    if(('ontouchstart' in window) === true) {
        var touch;
        var elementGroup;
        var touchedElements = [];
        
        $('#chart').bind('touchmove touchstart',function(e){
            e.preventDefault();
            
            $.map(touchedElements, function(n, i) {
                removeDotEvent(n) + i;
            });
            
            touchedElements = [];
            touch = e.originalEvent.touches[0] || e.originalEvent.changedTouches[0];
            elementGroup = $(document.elementFromPoint(touch.pageX, touch.pageY)).parent();
            touchedElements.push($(elementGroup));
            
            addDotEvent(elementGroup);
        });
    }
    else {
        $('#chart-dots g').mouseover(function() {
            addDotEvent($(this));
        }).mouseleave(function() {
            removeDotEvent($(this));
        });
    }
};

var addEvents = function() {           
    $('#toggles').click(function() {
        $('#blockview-first-bottom div, #blockview-top div').each(function() {
            var oldValue = $('.procent', this).html();
            
            $('.procent', this).html($('.procent', this).attr('alt-value'));
            $('.procent', this).attr('alt-value', oldValue);
        });
        
        $('.lines').each(function() {
            var oldValue = $('p', this).html();
            
            $('p', this).html($('p', this).attr('alt-value'));
            $('p', this).attr('alt-value', oldValue);
        });
        
        $('#chart-lines path').hide();
        
        if($('#mandates-toggle').hasClass('active')) {
            $('#chart-lines .procent').show();
        }
        else {
            $('#chart-lines .mandates').show();
        }
        
        $('#toggles p').toggleClass('active');
    });
 
    var minSelect = timelineGrid * 60;
 
    $('#zoomer .left').draggable({
        axis: "x",
        containment: "#zoomer",
        grid: [timelineGrid, 0],
        drag: function(event, ui) { 
            var leftPosition = ui.position.left;
            var rightPosition = $('#zoomer .right').position();
            
            if((leftPosition + minSelect) > rightPosition.left) {
                ui.position.left = rightPosition.left - minSelect;
                leftPosition = ui.position.left;
            }
            
            var newWidth = (rightPosition.left - leftPosition) + 10;
            
            $('#zoomer .bottom').css({
                left: leftPosition,
                width: newWidth
            });
            
            $('#zoomer .left-overlay').css('width', leftPosition);
                
            timelineTooltip();
            
            $('p', this).show();
            $('#timeline-markers').show();
        }
    });
    
    $('#zoomer .right').draggable({
        axis: "x",
        containment: "#zoomer",
        grid: [timelineGrid, 0],
        drag: function(event, ui) { 
            var leftPosition = $('#zoomer .left').position();
            var rightPosition = ui.position.left;
            
            if((rightPosition - minSelect) < leftPosition.left) {
                ui.position.left = leftPosition.left + minSelect;
                rightPosition = ui.position.left;
            }
            
            var newWidth = (rightPosition - leftPosition.left) + 10;
            var overlayWidth = (940 - rightPosition) - 12;
            
            $('#zoomer .bottom').css({
                left: leftPosition.left,
                width: newWidth
            });
            
            $('#zoomer .right-overlay').css('width', overlayWidth);
            
            timelineTooltip();
            
            $('p', this).show();
            $('#timeline-markers').show();
        }
    });
    
    $('#zoomer .bottom').draggable({
        axis: "x",
        containment: "#zoomer",
        snap: '.marker',
        drag: function(event, ui) { 
            var position = ui.position;
            var width = $(this).width();
            var newRight = (position.left + width) - 11;
            var overlayWidth = (940 - newRight) - 12;
            
            $('#zoomer .left').css('left', position.left);
            $('#zoomer .right').css('left', newRight);
            $('#zoomer .left-overlay').css('width', position.left);
            $('#zoomer .right-overlay').css('width', overlayWidth);
            
            timelineTooltip();
            
            $('#zoomer .left p, #zoomer .right p').show();
            $('#timeline-markers').show();
        }
    });
    
    $('#zoomer .left, #zoomer .right, #zoomer .bottom').on('dragstop', function(event, ui) {
        var startTotal = timelineTooltip();
        
        $('#loader').show();
        $('#timeline-markers, #zoomer .left p, #zoomer .right p').hide(); 
        
        setTimeout(function() {
            makeSVG(xmls, startTotal[0], startTotal[1]);
        }, 1);     
    });
};

var addDotEvent = function(groupElement) {
    var pollDate = $(groupElement).attr('date').split('-');
    var tooltipHeader = 'Berlingske Barometer ' + parseFloat(pollDate[2]) + '. ' + months[parseFloat(pollDate[1])] + ' ' + pollDate[0];
    
    var lineClass = 'procent';
        
    if($('#mandates-toggle').hasClass('active')) {
        lineClass = 'mandates';
    }
    
    $(groupElement).find('circle.' + lineClass).attr({
        'fill' : '#ffffff',
        'stroke-width' : '2'
    });
    $(groupElement).find('.guide').attr('visibility', 'visible');     
    
    supportOneProcent = parseFloat($(groupElement).attr('support-one-procent'));
    supportTwoProcent = parseFloat($(groupElement).attr('support-two-procent'));
    supportOneMandates = $(groupElement).attr('support-one-mandates');
    supportTwoMandates = $(groupElement).attr('support-two-mandates');
    supportOneColor = $(groupElement).attr('support-one-color');
    supportOnePartys = $(groupElement).attr('support-one-partys');
    supportTwoPartys = $(groupElement).attr('support-two-partys'); 
    
    var activeOne = supportOneMandates;
    var activeTwo = supportTwoMandates;
    var secondOne = supportOneProcent.toFixed(1).toString().replace(".", ",") + '%';
    var secondTwo = supportTwoProcent.toFixed(1).toString().replace(".", ",") + '%';       
    
    if ($('#procent-toggle').hasClass('active')) {
        activeOne = supportOneProcent.toFixed(1).toString().replace(".", ",") + '%';
        activeTwo = supportTwoProcent.toFixed(1).toString().replace(".", ",") + '%';
        secondOne = supportOneMandates;
        secondTwo = supportTwoMandates;
    }
    
    var procentLeftOver = 100 - (supportOneProcent + supportTwoProcent);

    if (procentLeftOver > 0) {
        supportOneProcent = supportOneProcent + procentLeftOver;
    } else if (procentLeftOver < 0) {
        supportOneProcent = procentLeftOver + supportOneProcent;
    }

    if (supportOneColor == "red") {
        $('#blockview-first-bottom .red').width(supportOneProcent + '%');
        $('#blockview-first-bottom .red .procent').attr('alt-value', secondOne).html(activeOne);
        $('#blockview-first-bottom .red .partys').html(supportOnePartys.substr(0, supportOnePartys.length - 2));
        $('#blockview-first-bottom .blue').width(supportTwoProcent + '%');
        $('#blockview-first-bottom .blue .procent').attr('alt-value', secondTwo).html(activeTwo);
        $('#blockview-first-bottom .blue .partys').html(supportTwoPartys.substr(0, supportTwoPartys.length - 2));
    } else {
        $('#blockview-first-bottom .red').width(supportTwoProcent + '%');
        $('#blockview-first-bottom .red .procent').attr('alt-value', secondTwo).html(activeTwo);
        $('#blockview-first-bottom .red .partys').html(supportTwoPartys.substr(0, supportTwoPartys.length - 2));
        $('#blockview-first-bottom .blue').width(supportOneProcent + '%');
        $('#blockview-first-bottom .blue .procent').attr('alt-value', secondOne).html(activeOne);
        $('#blockview-first-bottom .blue .partys').html(supportOnePartys.substr(0, supportOnePartys.length - 2));
    }
    
    $('#blockview-first-bottom .red .info').html(tooltipHeader); 
};

var removeDotEvent = function(groupElement) {
    $(groupElement).find('circle').attr({
        'fill' : 'transparent',
        'stroke-width' : '0'
    });
    $(groupElement).find('.guide').attr('visibility', 'hidden');

};

var timelineTooltip = function() {
    var leftTooltip = $('#zoomer .left p');
    var rightTooltip = $('#zoomer .right p');
    var leftPosition = ($('#zoomer .left').position()).left;
    var rightPosition = ($('#zoomer .right').position()).left;
    var leftNum = parseInt(leftPosition / timelineGrid, 10);
    var rightNum = parseInt((rightPosition - 10) / timelineGrid, 10);
    
    if(leftNum > timelineData.length - 1) {
        leftNum = timelineData.length - 1;
    }
    else if(leftNum < 0) {
        leftNum = 0;
    }
    
    if(rightNum > timelineData.length - 1) {
        rightNum = timelineData.length - 1;
    }
    else if(rightNum < 0) {
        rightNum = 0;
    }
    
    var leftDate = timelineData[leftNum].date.split('-');
    var rightDate = timelineData[rightNum].date.split('-');
    var leftPos = (leftTooltip.width() / 2);
    var rightPos = (rightTooltip.width() / 2);
    
    if((leftPosition + leftPos) < 50) {
        leftPos = -leftPos - ((leftPosition + leftPos) - 50);
    }
    else {
        leftPos = -(leftPos - 2);
    } 
    
    if((rightPosition + rightPos) > 930) {
        rightPos = -rightPos - ((rightPosition + rightPos) - 930);
    }
    else {
        rightPos = -(rightPos - 2);
    }    
    
    leftTooltip.text(parseFloat(leftDate[2]) + '. ' + months[parseFloat(leftDate[1])])
               .css('left', leftPos);
                   
    rightTooltip.text(parseFloat(rightDate[2]) + '. ' + months[parseFloat(rightDate[1])])
                .css('left', rightPos);
    
    rightNum = pollsNum - timelineData[rightNum].counter;
    leftNum = pollsNum - timelineData[leftNum].counter;
    return [rightNum, leftNum];
};

var dateDifference = function (from, to) {
    var startDate = new Date(from);
    var endDate = new Date(to);
    var days = ((endDate - startDate)/(1000*60*60*24));
    
    return days;
};