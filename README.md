# Parties History

![preview](https://cloud.githubusercontent.com/assets/145288/5262575/9ae5f458-7a27-11e4-9093-0a742b9246bb.png)

## Embed HTML

```
<style>
  @media (max-width: 767px) {
    .article-share {
      position: relative !important;
    }
  }

  .article-share {
    position: absolute;
    top: 5px;
    right: 11px;
    width: auto;
    margin-top: 23px;
  }

  parties-history {
    margin-top: 23px;
  }

  .index-summery {
    max-width: 500px;
    margin: 0 0 5px;
  }

  .d3-tip {
    z-index: 1;
  }
</style>

<h2><span>Berlingske Barometer <i>- partiernes historik</i></span></h2>
<p>Her kan du se, hvordan vælgeropbakningen til partierne har udviklet sig i Berlingske Barometers vægtede gennemsnit siden januar 2010.</p> <small>Du kan tilføje eller fjerne partier ved at klikke på deres logo.</small>
<link rel="stylesheet" href="http://www.b.dk/upload/tcarlsen/parties-history/styles.min.css">      
<parties-history ng-app="partiesHistoryApp"></parties-history>
<script src="http://www.b.dk/upload/tcarlsen/parties-history/lib/xml2json.min.js"></script>
<script src="//cdnjs.cloudflare.com/ajax/libs/d3/3.4.13/d3.min.js"></script>
<script src="http://www.b.dk/upload/tcarlsen/parties-history/lib/d3-tip.min.js"></script>
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.0/angular.min.js"></script>
<script src="https://ajax.googleapis.com/ajax/libs/angularjs/1.3.0/angular-touch.min.js"></script>
<script src="http://www.b.dk/upload/tcarlsen/parties-history/scripts.min.js"></script>
<small style="margin-top: -30px">Du kan indstille tidsperioden ved at trække i pilene - både til højre og venstre.</small>
```

## Contribute

```bash
$ git clone https://github.com/tcarlsen/parties-history && cd parties-history
$ npm install && bower install
```

Lets fire this baby up by running the `gulp` script! :fire:

## License

This code may only be used on [politiko.dk](http://www.politiko.dk) unless special rights have been granted.
