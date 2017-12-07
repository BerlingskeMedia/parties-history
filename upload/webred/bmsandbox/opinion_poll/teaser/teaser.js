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
          if (year >= 2007){
            get_xml(year - 1);
          }
        }
    });
};

var generate_view = function (poll, date) {
    var supportOneProcent = 0;
    var supportTwoProcent = 0;
    var supportOneMandates = 0;
    var supportTwoMandates = 0;
    var supportOneColor = "blue";
    var totalWidth = $('#mini-barometer').width() - 70;

    for (var i = poll.length; i--;) {
        var partyId = $('id', poll[i]).text();
        var procent = $('percent', poll[i]).text();
        var mandates = $('mandates', poll[i]).text();
        var letter = partyData[partyId].letter;
        var color = partyData[partyId].color;
        var percentBarWidth = (parseFloat(procent) / 40) * totalWidth;
        var mandatesBarWidth = (parseFloat(mandates) / 60) * totalWidth;
        var percentTextMargin = 20 + percentBarWidth;
        var mandatesTextMargin = 20 + mandatesBarWidth;
        var activeBarWidth = percentBarWidth;
        var activeTextMargin = percentTextMargin;
        var secondBarWidth = mandatesBarWidth;
        var secondTextMargin = mandatesTextMargin;
        var activeText = procent.replace(".", ",") + '%';
        var secondText = mandates;

        $('#chart').append('<div class="party ' + letter + '"></div>');
        $('#chart .party:last-child').append('<span class="letter" style="background-color: ' + color + '">' + letter + '</span>');
        $('#chart .party:last-child').append('<div class="bar" altWidth="' + secondBarWidth + '" style="background-color: ' + color + '"></div><p style="margin-left: 10px;" altMargin="' + secondTextMargin + '" altValue="' + secondText + '">' + activeText + '</p>');
        $('#chart .party:last-child p').animate({
            marginLeft: activeTextMargin
        }, 700);
        $('#chart .party:last-child .bar').animate({
            width: activeBarWidth
        }, 700);

        if ($('supports', poll[i]).text() == 1 || $('supports', poll[i]).text() == 9) {
            supportOneProcent += parseFloat(procent);
            supportOneMandates += parseFloat(mandates);
            if (letter == "A") {
                supportOneColor = "red";
            }
        } else if ($('supports', poll[i]).text() == 2) {
            supportTwoProcent += parseFloat(procent);
            supportTwoMandates += parseFloat(mandates);
        }
    }

    var activeOne = supportOneProcent.toFixed(1).toString().replace(".", ",") + '%';
    var activeTwo = supportTwoProcent.toFixed(1).toString().replace(".", ",") + '%';
    var secondOne = supportOneMandates;
    var secondTwo = supportTwoMandates;

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
        $('#blockview .red').append('<p altValue="' + secondOne + '">' + activeOne + '</p>');
        $('#blockview .blue').animate({
            width: supportTwoProcent + '%'
        }, 700);
        $('#blockview .blue').append('<p altValue="' + secondTwo + '">' + activeTwo + '</p>');
    } else {
        $('#blockview .red').animate({
            width: supportTwoProcent + '%'
        }, 700);
        $('#blockview .red').append('<p altValue="' + secondTwo + '">' + activeTwo + '</p>');
        $('#blockview .blue').animate({
            width: supportOneProcent + '%'
        }, 700);
        $('#blockview .blue').append('<p altValue="' + secondOne + '">' + activeOne + '</p>');
    }

    add_events();
};

var add_events = function () {
    $('#controls p').click(function () {
        if ($(this).hasClass('active')) {
            return false;
        }
        $('#chart .party').each(function () {
            var oldWidth = $('.bar', this).width();
            var oldMargin = $('p', this).css('margin-left');
            var oldValue = $('p', this).html();

            $('.bar', this).animate({
                width: $('.bar', this).attr('altWidth')
            }, 300, function () {
                $(this).attr('altWidth', oldWidth);
            });

            $('p', this).html($('p', this).attr('altValue'));

            $('p', this).animate({
                marginLeft: $('p', this).attr('altMargin')
            }, 300, function () {
                $(this).attr('altMargin', oldMargin);
                $(this).attr('altValue', oldValue);
            });
        });

        $('#blockview div').each(function () {
            var oldValue = $('p', this).html();

            $('p', this).html($('p', this).attr('altValue'));
            $('p', this).attr('altValue', oldValue);
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

        for (var i = sortedArray.length; i--;) {
            partyId = parseFloat($('id', sortedArray[i]).text());
            partyData[partyId] = [];
            partyData[partyId].color = $('color', sortedArray[i]).text();
            partyData[partyId].letter = $('letter', sortedArray[i]).text();
        }
        var thisYear = new Date().getFullYear();
        get_xml(thisYear);
    }
});
