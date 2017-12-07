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
            partyData[partyId].id = partyId;
            partyData[partyId].color = $('color', sortedArray[i]).text();
            partyData[partyId].letter = $('letter', sortedArray[i]).text();
            partyData[partyId].name = $('name', sortedArray[i]).text();
            partyData[partyId].shortname = $('shortname', sortedArray[i]).text();
            partyDataOrder.push(partyId);
        }
        installation();
    }
});

var sourcePicker = $('<ul id="source-picker"></ul>');
var sourcePickerContent;
var partyData = [];
var partyDataOrder = [];
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

var pollofpollsText = function (polls, date) {
    return 'Det vægtede gennemsnit viser et gennemsnit af de ' + polls + ' politiske meningsmålinger, der er blevet offentliggjort 31 dage fra den ' + date + '. Da nye meningsmålinger vejer tungere end ældre, er Barometerets gennemsnit udtryk for en vægtet tendens, som giver dig et mere retvisende bud på partiernes reelle opbakning end enkeltstående meningsmålinger.';
};

var installation = function () {
    var partyNum = partyData.length - 1;
    var partyLeftExtender = $('#chart').width() / partyNum;
    var partyLeft = partyLeftExtender - (partyLeftExtender / 2);
    var html = '';
    var o;

    for(var i = partyNum; i --;) {
        o = partyDataOrder[i];
        html+= '<div class="party ' + partyData[o].id + '" style="left: ' + partyLeft + 'px">';
        html+= '<span class="letter" style="background-color:' + partyData[o].color + '">' + partyData[o].letter + '</span>';
        html+= '<div class="hover-name">' + partyData[o].name + '</div>';
        html+= '<span class="second-letter" style="background-color:' + partyData[o].color + '"></span>';
        html+= '<div class="bar" style="background-color:' + partyData[o].color + '"></div>';
        html+= '<div class="second-bar" style="background-color:' + partyData[o].color + '"></div>';
        html+= '<p class="procent"></p>';
        html+= '<p class="second-procent"></p>';
        html+= '</div>';
        partyLeft += partyLeftExtender;
    }

    $('#chart').append(html);
    sourceMenu();
};

var sourceMenu = function () {
    var datetime;
    var date;
    var displayDatetime;
    var description;
    var poll;
    var respondents;
    var tooYear = new Date().getFullYear();
    var run = 1;
    var cache = false;

    $.ajax({
        type: "GET",
        url: '../overview.xml',
        dataType: "xml",
        cache: true,
        success: function (xml) {
            sourcePickerContent = $('<li id="all"></li>');
            sourcePickerContent.append('<h4>Seneste målinger</h4>');
            sourcePickerContent.append('<ul class="sub-menu"></ul>');

            for (var i = tooYear; i >= 2010; i--) {
                $.ajax({
                    type: "GET",
                    url: "../" + i + "/all.xml",
                    dataType: "xml",
                    async: false,
                    cache: cache,
                    success: function (xml) {
                        sourceMenuItems('all', 'Seneste målinger', $(xml).find("poll"));
                        cache = true;
                    }
                });
            }

            sourcePicker.append(sourcePickerContent);

            sourcePickerContent = $('<li id="pollofpolls"></li>');
            sourcePickerContent.append('<h4>Vægtet gennemsnit</h4>');
            sourcePickerContent.append('<ul class="sub-menu"></ul>');

            cache = false;

            for (var i = tooYear; i >= 2010; i--) {
                $.ajax({
                    type: "GET",
                    url: "../" + i + "/pollofpolls.xml",
                    dataType: "xml",
                    async: false,
                    cache: cache,
                    success: function (xml) {
                        if(run === 1) {
                            datetime = $(xml).find('datetime:first').text().split(" ");
                            date = datetime[0].split("-");
                            displayDatetime = parseFloat(date[2]) + '. ' + months[parseFloat(date[1])] + ' ' + date[0] + ' ';
                            description = $(xml).find('description:first').text();
                            poll = $(xml).find("poll:first").find("entry");
                            respondents = $(xml).find('respondents:first').text();
                            run = 0;
                        }
                        sourceMenuItems('pollofpolls', 'Vægtet gennemsnit', $(xml).find("poll"));
                        cache = true;
                    }
                });
            }

            sourcePicker.append(sourcePickerContent);

            var sortedArray = $(xml).find('institute').sort(function (a, b) {
                var d2 = $(b).find("name").text();
                var d1 = $(a).find("name").text();

                return (d1 < d2 ? -1 : (d1 > d2 ? +1 : 0));
            });

            sortedArray.each(function () {
                sourcePickerContent = $('<li id="' + $(this).find("id").text() + '"></li>');
                sourcePickerContent.append('<h4>' + $(this).find("name").text() + '</h4>');
                sourcePickerContent.append('<ul class="sub-menu"></ul>');

                cache = false;

                for (var o = $('xml', this).length; o--;) {
                    var instituteXml = $('xml', this).eq(o).find('url').text();
                    instituteXml = instituteXml.replace("http://www.berlingske.dk/upload/webred/bmsandbox/opinion_poll/", "../");

                    $.ajax({
                        type: "GET",
                        url: instituteXml,
                        dataType: "xml",
                        async: false,
                        cache: cache,
                        success: function (xml) {
                            sourceMenuItems($(xml).find("institute").find("id").text(), $(xml).find("institute").find("name").text(), $(xml).find("poll"));
                            cache = true;
                        }
                    });
                }
                if ($(this).find("name").text() === 'Valgresultater') {
                    $('#pollofpolls', sourcePicker).after(sourcePickerContent);
                }
                else {
                    sourcePicker.append(sourcePickerContent);
                }
            });
        }
    });

    $("#container").ajaxStop(function () {
        $('#menu').append(sourcePicker);
        $('#source-picker .sub-menu').sbscroller();
        $('#source-picker').accordion();

        addEvents()
        mainPoll('pollofpolls', 'Vægtet gennemsnit', displayDatetime, poll, pollofpollsText(description, displayDatetime), respondents);
        $('#loader').fadeOut(900);
    });
};

var sourceMenuItems = function (id, name, polls) {
    for(var i = 0; i < polls.length; i ++) {
        var datetime = $('datetime', polls[i]).text().split(" ");
        var date = datetime[0].split("-");
        var displayDatetime = parseFloat(date[2]) + '. ' + months[parseFloat(date[1])] + ' ' + date[0] + ' ';
        var display = displayDatetime;
        var description = $('description:first', polls[i]).text();

        if (id == 'all') {
            name = $('name:first', polls[i]).text();
            display = name + ' ' + displayDatetime;
        }

        if (id == 'pollofpolls') {
            description = pollofpollsText(description, display);
        }

        $('.sub-menu', sourcePickerContent).append('<li><a href="#">' + display + '</a></li>');
        $('.sub-menu li:last a', sourcePickerContent).click({
            id: id,
            name: name,
            displayDatetime: displayDatetime,
            poll: $('entries', polls[i]).find("entry"),
            description: description,
            respondents: $('respondents:first', polls[i]).text()
        }, function (event) {
            var sourceType = $('.source-button.active').parent().attr('id');

            sourcePicker.hide();
            $('.source-button').removeClass('active');

            if (sourceType == "main-poll") {
                mainPoll(event.data.id, event.data.name, event.data.displayDatetime, event.data.poll, event.data.description, event.data.respondents);
            } else {
                secondPoll(event.data.id, event.data.name, event.data.displayDatetime, event.data.poll, event.data.description, event.data.respondents);
            }
        });
    }
};

var addEvents = function () {
    $('.info-button').click(function () {
        if (!$(this).hasClass('active')) {
            $(this).animate({
                top: $(this).parent().find('.info').height() + 32
            }, 500);

            $(this).parent().find('.info').slideDown(500, function () {});
            $(this).addClass('active');
        } else {
            $(this).animate({
                top: 20
            }, 500);

            $(this).parent().find('.info').slideUp(500, function () {});
            $(this).removeClass('active');
        }
    });

    if (('ontouchstart' in window) === true) {
        $('.scroll-content').draggable({
            axis: "y",
            drag: function (event, ui) {
                var position = ui.position;
                var height = $(this).height() - 100;
                var handle = $(this).parent().find('.ui-slider-handle');
                var defference = height - Math.abs(position.top);
                var newBottomValue = (defference / height) * 100;

                $(handle).css('bottom', newBottomValue + '%');

                if (position.top > 0 || position.top < -height) {
                    return false;
                }
            }
        });
    }

    $('.source-button').click(function (event) {
        var buttonPosition = $(this).parent().offset();
        sourcePicker.css({
            top: (buttonPosition.top + 20),
            left: buttonPosition.left
        }).show();
        $('#source-picker .sub-menu').css({
            width: ($(this).parent().width() - 5)
        });

        $('#source-picker .scroll-content').css({
            width: ($(this).parent().width() - 15)
        });

        $('.source-button').removeClass('active');
        $(this).addClass('active');

        event.stopPropagation();
    });

    sourcePicker.bind('touchmove touchstart click', function (event) {
        event.stopPropagation();
    });

    $('html').bind('touchmove touchstart click', function () {
        sourcePicker.hide();
        $('.source-button').removeClass('active');
    });

    $('#procent-toggle, #mandates-toggle').click(function () {
        if ($('#procent-toggle').hasClass('active')) {
            $('#uncertainty-toggle').css({
                opacity: 0.4
            });
        } else {
            $('#uncertainty-toggle').css({
                opacity: 1
            });
        }

        $('#uncertainty-toggle').toggleClass('disabled');

        $('#chart .party').each(function () {
            if ($('#uncertainty-toggle').hasClass('active')) {
                $('#chart .party').each(function () {
                    $('.procent, .second-procent', this).toggleClass('uncertainty');
                });
            }

            var oldHeight = $('.bar', this).height();
            var oldTop = $('.procent', this).css('top');
            var oldValue = $('.procent', this).html();

            $('.bar', this).animate({
                height: $('.bar', this).attr('altHeight')
            }, 300, function () {
                $(this).attr('altHeight', oldHeight);
            });

            $('.procent', this).html($('.procent', this).attr('altValue'));
            $('.procent', this).css({
                marginLeft: (-($('.procent', this).width() - 23) / 2)
            });

            $('.procent', this).animate({
                top: $('.procent', this).attr('altTop')
            }, 300, function () {
                $(this).attr('altTop', oldTop);
                $(this).attr('altValue', oldValue);
            });

            if ($('#chart .party:first .second-procent').text() !== '') {
                var oldSecondHeight = $('.second-bar', this).height();
                var oldSecondTop = $('.second-procent', this).css('top');
                var oldSecondValue = $('.second-procent', this).html();

                $('.second-bar', this).animate({
                    height: $('.second-bar', this).attr('altHeight')
                }, 300, function () {
                    $(this).attr('altHeight', oldSecondHeight);
                });

                $('.second-procent', this).html($('.second-procent', this).attr('altValue'));
                $('.second-procent', this).css({
                    marginLeft: (-($('.second-procent', this).width() - 23) / 2)
                });

                $('.second-procent', this).animate({
                    top: $('.second-procent', this).attr('altTop')
                }, 300, function () {
                    $(this).attr('altTop', oldSecondTop);
                    $(this).attr('altValue', oldSecondValue);
                });
            }

        });

        $('#blockview-first-bottom div, #blockview-second-bottom div, #blockview-top div').each(function () {
            var oldValue = $('.procent', this).html();

            $('.procent', this).html($('.procent', this).attr('altValue'));
            $('.procent', this).attr('altValue', oldValue);
        });

        $('#procent-toggle, #mandates-toggle').toggleClass('active');
    });

    $('#uncertainty-toggle').click(function () {
        if ($(this).hasClass('disabled')) {
            return false;
        }

        $('#chart .party').each(function () {
            $('.procent, .second-procent', this).toggleClass('uncertainty');
        });

        $('#uncertainty-toggle').toggleClass('active');
    });

    $('.party').bind('mouseover mouseout', function () {
        var width = $('.hover-name', this).width();

        $('.hover-name', this).css('left', '-' + (width-22)/2 + 'px').toggle();
    });
};

var mainPoll = function (id, name, displayDatetime, poll, info, respondents) {
    $('#main-poll .source-button, #blockview-first-bottom .red .info').html('Loader...');
    $('#main-poll .info').hide();
    $('#main-poll .info-button').css({
        top: 20
    }).hide();

    var supportOneProcent = 0;
    var supportTwoProcent = 0;
    var supportOneMandates = 0;
    var supportTwoMandates = 0;
    var supportOnePartys = '';
    var supportTwoPartys = '';
    var supportOneColor = "blue";
    var partyId;
    var percentBarHeight;
    var mandatesBarHeight;
    var percentTextTop;
    var mandatesTextTop;
    var partyShortname;
    var activeBarHeight;
    var activeTextTop;
    var secondBarHeight;
    var secondTextTop;
    var activeText;
    var secondText;
    var activeOne;
    var activeTwo;
    var secondOne;
    var secondTwo;

    for(var i = poll.length; i --;) {
        partyId = parseFloat($('id', poll[i]).text());
        percentBarHeight = (parseFloat($('percent', poll[i]).text()) / 60) * 245;
        mandatesBarHeight = (parseFloat($('mandates', poll[i]).text()) / 60) * 245;
        percentTextTop = -percentBarHeight - 70;
        mandatesTextTop = -mandatesBarHeight - 70;
        partyShortname = partyData[partyId].shortname;

        if ($('#procent-toggle').hasClass('active')) {
            activeBarHeight = percentBarHeight;
            activeTextTop = percentTextTop;
            secondBarHeight = mandatesBarHeight;
            secondTextTop = mandatesTextTop;
            activeText = $('percent', poll[i]).text().replace(".", ",");
            secondText = $('mandates', poll[i]).text();
        } else {
            activeBarHeight = mandatesBarHeight;
            activeTextTop = mandatesTextTop;
            secondBarHeight = percentBarHeight;
            secondTextTop = percentTextTop;
            activeText = $('mandates', poll[i]).text();
            secondText = $('percent', poll[i]).text().replace(".", ",");
        }

        var uncertainty = $('uncertainty', poll[i]).text();

        $('.party.' + partyId + ' .bar').attr('altHeight', secondBarHeight);
        $('.party.' + partyId + ' .procent').attr({
            'altTop': secondTextTop,
            'altValue': secondText,
            'data-content': uncertainty
        }).html(activeText);

        $('.party.' + partyId + ' .procent').css({
            marginLeft: (-($('.party.' + partyId + ' .procent').width() - 23) / 2)
        });
        $('.party.' + partyId + ' .procent').animate({
            top: activeTextTop
        }, 700);
        $('.party.' + partyId + ' .bar').animate({
            height: activeBarHeight
        }, 700);

        if ($('supports', poll[i]).text() == 1 || $('supports', poll[i]).text() == 9) {
            supportOneProcent += parseFloat($('percent', poll[i]).text());
            supportOneMandates += parseFloat($('mandates', poll[i]).text());
            supportOnePartys += partyShortname + ', ';
            if ($('letter', poll[i]).text() == "A") {
                supportOneColor = "red";
            }
        } else if ($('supports', poll[i]).text() == 2) {
            supportTwoProcent += parseFloat($('percent', poll[i]).text());
            supportTwoMandates += parseFloat($('mandates', poll[i]).text());
            supportTwoPartys += partyShortname + ', ';
        }
    }

    if ($('#procent-toggle').hasClass('active')) {
        activeOne = supportOneProcent.toFixed(1).toString().replace(".", ",") + '%';
        activeTwo = supportTwoProcent.toFixed(1).toString().replace(".", ",") + '%';
        secondOne = supportOneMandates;
        secondTwo = supportTwoMandates;
    } else {
        activeOne = supportOneMandates;
        activeTwo = supportTwoMandates;
        secondOne = supportOneProcent.toFixed(1).toString().replace(".", ",") + '%';
        secondTwo = supportTwoProcent.toFixed(1).toString().replace(".", ",") + '%';
    }

    var procentLeftOver = 100 - (supportOneProcent + supportTwoProcent);

    if (procentLeftOver > 0) {
        supportOneProcent = supportOneProcent + procentLeftOver;
    } else if (procentLeftOver < 0) {
        supportOneProcent = procentLeftOver + supportOneProcent;
    }
    $('#blockview-first-bottom').show();
    if (supportOneColor == "red") {
        $('#blockview-first-bottom .red').animate({
            width: supportOneProcent + '%'
        }, 700);
        $('#blockview-first-bottom .red .procent').attr('altValue', secondOne).html(activeOne);
        $('#blockview-first-bottom .red .partys').html(supportOnePartys.substr(0, supportOnePartys.length - 2));
        $('#blockview-first-bottom .blue').animate({
            width: supportTwoProcent + '%'
        }, 700);
        $('#blockview-first-bottom .blue .procent').attr('altValue', secondTwo).html(activeTwo);
        $('#blockview-first-bottom .blue .partys').html(supportTwoPartys.substr(0, supportTwoPartys.length - 2));
    } else {
        $('#blockview-first-bottom .red').animate({
            width: supportTwoProcent + '%'
        }, 700);
        $('#blockview-first-bottom .red .procent').attr('altValue', secondTwo).html(activeTwo);
        $('#blockview-first-bottom .red .partys').html(supportTwoPartys.substr(0, supportTwoPartys.length - 2));
        $('#blockview-first-bottom .blue').animate({
            width: supportOneProcent + '%'
        }, 700);
        $('#blockview-first-bottom .blue .procent').attr('altValue', secondOne).html(activeOne);
        $('#blockview-first-bottom .blue .partys').html(supportOnePartys.substr(0, supportOnePartys.length - 2));
    }

    $(".bar, .red, .blue").promise().done(function () {
        $('#main-poll .source-button, #blockview-first-bottom .red .info').html(name + ' ' + displayDatetime).show();

        if (respondents === '') {
            $('#main-poll .info-button').hide();
        } else {
            $('#main-poll .info').html('<strong>' + respondents + ' respondenter</strong>' + info).width($('#main-poll').width());
            $('#main-poll .info-button').show();
        }
    });
};

var secondPoll = function (id, name, displayDatetime, poll, info, respondents) {
    $('#second-poll .source-button, #blockview-second-bottom .info').html('Loader...');
    $('#second-poll .info').hide();
    $('#second-poll .info-button').css({
        top: 20
    }).hide();

    var supportOneProcent = 0;
    var supportTwoProcent = 0;
    var supportOneMandates = 0;
    var supportTwoMandates = 0;
    var supportOnePartys = '';
    var supportTwoPartys = '';
    var supportOneColor = "blue";
    var partyId;
    var percentBarHeight;
    var mandatesBarHeight;
    var percentTextTop;
    var mandatesTextTop;
    var partyShortname;
    var activeBarHeight;
    var activeTextTop;
    var secondBarHeight;
    var secondTextTop;
    var activeText;
    var secondText;
    var activeOne;
    var activeTwo;
    var secondOne;
    var secondTwo;
    var uncertainty;

    for(var i = poll.length; i --;) {
        partyId = parseFloat($('id', poll[i]).text());
        percentBarHeight = (parseFloat($('percent', poll[i]).text()) / 60) * 245;
        mandatesBarHeight = (parseFloat($('mandates', poll[i]).text()) / 60) * 245;
        percentTextTop = -percentBarHeight - 55;
        mandatesTextTop = -mandatesBarHeight - 55;
        partyShortname = partyData[partyId].shortname;

        if ($('#procent-toggle').hasClass('active')) {
            activeBarHeight = percentBarHeight;
            activeTextTop = percentTextTop;
            secondBarHeight = mandatesBarHeight;
            secondTextTop = mandatesTextTop;
            activeText = '/ ' + $('percent', poll[i]).text().replace(".", ",");
            secondText = '/ ' + $('mandates', poll[i]).text();
        } else {
            activeBarHeight = mandatesBarHeight;
            activeTextTop = mandatesTextTop;
            secondBarHeight = percentBarHeight;
            secondTextTop = percentTextTop;
            activeText = $('mandates', poll[i]).text();
            secondText = $('percent', poll[i]).text().replace(".", ",");
        }

        uncertainty = $('uncertainty', poll[i]).text();

        $('.party.' + partyId + ' .second-bar').attr('altHeight', secondBarHeight);
        $('.party.' + partyId + ' .second-procent').attr({
            'altTop': secondTextTop,
            'altValue': secondText,
            'data-content': uncertainty
        }).html(activeText).show();
        $('.party.' + partyId + ' .second-procent').animate({
            top: activeTextTop
        }, 700);
        $('.party.' + partyId + ' .second-bar').animate({
            height: activeBarHeight
        }, 700);

        $('.party.' + partyId + ' .second-letter').show();

        if ($('supports', poll[i]).text() == 1 || $('supports', poll[i]).text() == 9) {
            supportOneProcent += parseFloat($('percent', poll[i]).text());
            supportOneMandates += parseFloat($('mandates', poll[i]).text());
            supportOnePartys += partyShortname + ', ';
            if ($('letter', poll[i]).text() == "A") {
                supportOneColor = "red";
            }
        } else if ($('supports', poll[i]).text() == 2) {
            supportTwoProcent += parseFloat($('percent', poll[i]).text());
            supportTwoMandates += parseFloat($('mandates', poll[i]).text());
            supportTwoPartys += partyShortname + ', ';
        }
    }

    if ($('#procent-toggle').hasClass('active')) {
        activeOne = supportOneProcent.toFixed(1).toString().replace(".", ",") + '%';
        activeTwo = supportTwoProcent.toFixed(1).toString().replace(".", ",") + '%';
        secondOne = supportOneMandates;
        secondTwo = supportTwoMandates;
    } else {
        activeOne = supportOneMandates;
        activeTwo = supportTwoMandates;
        secondOne = supportOneProcent.toFixed(1).toString().replace(".", ",") + '%';
        secondTwo = supportTwoProcent.toFixed(1).toString().replace(".", ",") + '%';
    }

    var procentLeftOver = 100 - (supportOneProcent + supportTwoProcent);

    if (procentLeftOver > 0) {
        supportOneProcent = supportOneProcent + procentLeftOver;
    } else if (procentLeftOver < 0) {
        supportOneProcent = procentLeftOver + supportOneProcent;
    }

    $('#info').css({
        marginTop: 42
    });

    $('#blockview-second-bottom').show();

    if (supportOneColor == "red") {
        $('#blockview-second-bottom .red').animate({
            width: supportOneProcent + '%'
        }, 700);
        $('#blockview-second-bottom .red .procent').attr('altValue', secondOne).html(activeOne).show();
        $('#blockview-second-bottom .red .partys').html(supportOnePartys.substr(0, supportOnePartys.length - 2));
        $('#blockview-second-bottom .blue').animate({
            width: supportTwoProcent + '%'
        }, 700);
        $('#blockview-second-bottom .blue .procent').attr('altValue', secondTwo).html(activeTwo).show();
        $('#blockview-second-bottom .blue .partys').html(supportTwoPartys.substr(0, supportTwoPartys.length - 2));
    } else {
        $('#blockview-second-bottom .red').animate({
            width: supportTwoProcent + '%'
        }, 700);
        $('#blockview-second-bottom .red .procent').attr('altValue', secondTwo).html(activeTwo).show();
        $('#blockview-second-bottom .red .second-partys').html(supportTwoPartys.substr(0, supportTwoPartys.length - 2));
        $('#blockview-second-bottom .blue').animate({
            width: supportOneProcent + '%'
        }, 700);
        $('#blockview-second-bottom .blue .procent').attr('altValue', secondOne).html(activeOne).show();
        $('#blockview-second-bottom .blue .partys').html(supportOnePartys.substr(0, supportOnePartys.length - 2));
    }

    $(".second-bar, .second-red, .second-blue").promise().done(function () {
        $('#second-poll .source-button, #blockview-second-bottom .info').html(name + ' ' + displayDatetime).show();

        if (respondents === '') {
            $('#second-poll .info-button').hide();
        } else {
            $('#second-poll .info').html('<strong>' + respondents + ' respondenter</strong>' + info).width($('#second-poll').width());
            $('#second-poll .info-button').show();
        }
    });
};
