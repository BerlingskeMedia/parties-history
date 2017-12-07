var partyData = [];

var get_xml = function (year) {
    $.ajax({
        type: "GET",
        url: '../' + year + '/pollofpolls.xml',
        dataType: "xml",
        cache: false,
        success: function (xml) {
            var poll = $(xml).find("poll:first").find("entry").sort(function (a, b) {
                var d2 = $(a).find("party").find("letter").text();
                var d1 = $(b).find("party").find("letter").text();

                return (d1 < d2 ? -1 : (d1 > d2 ? +1 : 0));
            });

            var pollDateTime = $(xml).find("poll:first").find("datetime:first").text().split(' ');
            var pollDate = pollDateTime[0].split('-');

            generate_view(poll, pollDate);
        },
        error: function () {
            get_xml(year - 1);
        }
    });
};

var generate_view = function (poll, date) {
    var supportOneProcent = 0;
    var supportTwoProcent = 0;
    var supportOneMandates = 0;
    var supportTwoMandates = 0;
    var supportOnePartys = '';
    var supportTwoPartys = '';
    var supportOneColor = "blue";
    var partyLeftExtender = $('#chart').width() / poll.length;
    var partyLeft = partyLeftExtender - (partyLeftExtender / 2) + 10;

    for (var i = poll.length; i--;) {
        var partyId = $('id', poll[i]).text();
        var procent = $('percent', poll[i]).text();
        var mandates = $('mandates', poll[i]).text();
        var letter = partyData[partyId].letter;
        var color = partyData[partyId].color;
        var shortname = partyData[partyId].shortname;
        var percentBarHeight = (parseFloat(procent) / 60) * 105;
        var mandatesBarHeight = (parseFloat(mandates) / 60) * 105;
        var percentTextTop = -percentBarHeight - 55;
        var mandatesTextTop = -mandatesBarHeight - 55;
        var activeBarHeight = percentBarHeight;
        var activeTextTop = percentTextTop;
        var secondBarHeight = mandatesBarHeight;
        var secondTextTop = mandatesTextTop;
        var activeText = procent.replace(".", ",");
        var secondText = mandates;

        $('#chart').append('<div class="party ' + letter + '" style="left: ' + partyLeft + 'px"></div>');
        $('#chart .party:last-child').append('<span class="letter" style="background-color: ' + color + '">' + letter + '</span>');
        $('#chart .party:last-child').append('<div class="bar" altHeight="' + secondBarHeight + '" style="background-color: ' + color + '"></div><p altTop="' + secondTextTop + '" altValue="' + secondText + '">' + activeText + '</p>');
        $('#chart .party:last-child p').css({
            marginLeft: (-($('#chart .party:last-child p').width() - 17) / 2)
        });
        $('#chart .party:last-child p').animate({
            top: activeTextTop
        }, 700);
        $('#chart .party:last-child .bar').animate({
            height: activeBarHeight
        }, 700);

        if ($('supports', poll[i]).text() == 1 || $('supports', poll[i]).text() == 9) {
            supportOneProcent += parseFloat(procent);
            supportOneMandates += parseFloat(mandates);
            supportOnePartys += shortname + ', ';
            if ($('letter', poll[i]).text() == "A") {
                supportOneColor = "red";
            }
        } else if ($('supports', poll[i]).text() == 2) {
            supportTwoProcent += parseFloat(procent);
            supportTwoMandates += parseFloat(mandates);
            supportTwoPartys += shortname + ', ';
        }

        partyLeft += partyLeftExtender;
    }

    var activeOne = supportOneProcent.toFixed(1).toString().replace(".", ",") + '%';
    var activeTwo = supportTwoProcent.toFixed(1).toString().replace(".", ",") + '%';
    var secondOne = supportOneMandates + ' man.';
    var secondTwo = supportTwoMandates + ' man.';

    var procentLeftOver = 100 - (supportOneProcent + supportTwoProcent);

    if (procentLeftOver > 0) {
        supportOneProcent = supportOneProcent + procentLeftOver;
    } else if (procentLeftOver < 0) {
        supportOneProcent = procentLeftOver + supportOneProcent;
    }

    if (supportOneColor == "red") {
        $('#blockview .red').animate({
            width: supportOneProcent + '%'
        }, 700);
        $('#blockview .red').append('<p class="procent" altValue="' + secondOne + '">' + activeOne + '</p>');
        $('#blockview .red .partys').html(supportOnePartys.substr(0, supportOnePartys.length - 2));
        $('#blockview .blue').animate({
            width: supportTwoProcent + '%'
        }, 700);
        $('#blockview .blue').append('<p class="procent" altValue="' + secondTwo + '">' + activeTwo + '</p>');
        $('#blockview .blue .partys').html(supportTwoPartys.substr(0, supportTwoPartys.length - 2));
    } else {
        $('#blockview .red').animate({
            width: supportTwoProcent + '%'
        }, 700);
        $('#blockview .red').append('<p class="procent" altValue="' + secondTwo + '">' + activeTwo + '</p>');
        $('#blockview .red .partys').html(supportTwoPartys.substr(0, supportTwoPartys.length - 2));
        $('#blockview .blue').animate({
            width: supportOneProcent + '%'
        }, 700);
        $('#blockview .blue').append('<p class="procent" altValue="' + secondOne + '">' + activeOne + '</p>');
        $('#blockview .blue .partys').html(supportOnePartys.substr(0, supportOnePartys.length - 2));
    }

    $('#pollInfo').html('Seneste Gennemsnit ' + date[2] + '.' + date[1] + '.' + date[0]);
    add_events();
};

var add_events = function () {
    $('#controls p').click(function () {
        if ($(this).hasClass('active')) {
            return false;
        }
        $('#chart .party').each(function () {
            var oldHeight = $('.bar', this).height();
            var oldTop = $('p', this).css('top');
            var oldValue = $('p', this).html();

            $('.bar', this).animate({
                height: $('.bar', this).attr('altHeight')
            }, 300, function () {
                $(this).attr('altHeight', oldHeight);
            });

            $('p', this).html($('p', this).attr('altValue'));
            $('p', this).css({
                marginLeft: (-($('p', this).width() - 17) / 2)
            });

            $('p', this).animate({
                top: $('p', this).attr('altTop')
            }, 300, function () {
                $(this).attr('altTop', oldTop);
                $(this).attr('altValue', oldValue);
            });
        });

        $('#blockview div').each(function () {
            var oldValue = $('.procent', this).html();

            $('.procent', this).html($('.procent', this).attr('altValue'));
            $('.procent', this).attr('altValue', oldValue);
        });

        $('#controls p').toggleClass('active');
    });
};

$.ajax({
    type: "GET",
    url: '../parties.xml',
    dataType: "xml",
    cache: true,
    success: function (xml) {
        var partyId;
        var sortedArray = $(xml).find('party').sort(function (a, b) {
            var d2 = $(b).find("letter").text();
            var d1 = $(a).find("letter").text();
    
            return (d1 < d2 ? -1 : (d1 > d2 ? +1 : 0));
        });
        
        for(var i = sortedArray.length; i --;) {
            partyId = parseFloat($('id', sortedArray[i]).text());
            partyData[partyId] = [];
            partyData[partyId].color = $('color', sortedArray[i]).text();
            partyData[partyId].letter = $('letter', sortedArray[i]).text();
            partyData[partyId].shortname = $('shortname', sortedArray[i]).text();
        }
        var thisYear = new Date().getFullYear();
        get_xml(thisYear);
    }
});