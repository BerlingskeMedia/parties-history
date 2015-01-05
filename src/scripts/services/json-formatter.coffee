angular.module "jsonFormatterService", []
  .service "jsonFormatter", ->
    format: (polls) ->
      parties = []
      max =
        percent: 0
        mandates: 0
      dates = []
      parseDate = d3.time.format("%Y-%m-%d %X").parse

      for poll in polls
        continue if !poll.entries.entry

        for entry in poll.entries.entry
          if !parties[entry.party.letter]
            parties[entry.party.letter] =
              letter: entry.party.letter
              name: entry.party.shortname
              values: []

          parties[entry.party.letter].values.push
            date: parseDate poll.datetime
            letter: entry.party.letter
            percent: entry.percent
            mandates: entry.mandates
            uncertainty: entry.uncertainty

          max.percent = parseFloat(entry.percent) if parseFloat(entry.percent) > max.percent
          max.mandates = parseInt(entry.mandates) if parseInt(entry.mandates) > max.mandates

        dates.push {date: parseDate poll.datetime}

      parties = d3.values parties
      parties.sort (a, b) ->
        return b.values[0].percent - a.values[0].percent

      dates.sort (a, b) ->
        return a.date - b.date

      dateDomain =  d3.extent polls, (d) -> parseDate d.datetime

      return {
        parties: parties
        dates: dates
        fulDateDomain: dateDomain
        initDateDomain: [parseDate("2011-06-15 00:00:00"), dateDomain[1]]
        view: "percent"
        max: max
      }
