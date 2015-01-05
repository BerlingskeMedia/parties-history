angular.module "partiesHistoryDirective", []
  .directive "partiesHistory", ($filter, xmlGetter) ->
    restrict: "E"
    templateUrl: "/upload/tcarlsen/parties-history/partials/parties-history.html"
    link: (scope, element, attr) ->
      currentYear = new Date().getFullYear()
      polls = []
      scope.inactive = {}
      activeArea = false
      scope.view = "percent"
      scope.polls = []
      scope.loading = true

      scope.showFill = ->
        $("g.areas").toggle()

        activeArea = (if activeArea then false else true)

      scope.toggleParty = (party) ->
        $("ul.parties li.#{party}").toggleClass "active"
        $("path.#{party}").toggle()
        $("circle.#{party}").toggle()

        if scope.inactive[party] then delete scope.inactive[party] else scope.inactive[party] = true

      scope.checkInactive = ->
        $("g.areas").show() if activeArea

        for party of scope.inactive
          $("path.#{party}").hide()
          $("circle.#{party}").hide()

      xmlGetter.get("parties.xml").then (data) ->
        scope.parties = $filter('orderBy')(data.parties.party, 'letter')

      xmlGetter.get("valgresultater.xml").then (data) ->
        scope.electionResults = data.result.poll

      angular.forEach [2010..currentYear], (year) ->
        xmlGetter.get("#{year}/10.xml").then (data) ->
          if data.error
            currentYear -= 1
          else
            polls.push
              year: year
              data: data.result.polls.poll

            if polls.length is [2010..currentYear].length
              polls = $filter('orderBy')(polls, 'year', true)

              for poll in polls
                scope.polls = scope.polls.concat poll.data

              scope.loading = false
