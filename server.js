//{"term":"lolcats funny","when":"2017-04-08T18:15:04.411Z"}
// User Story: I can get the image URLs, alt text and page urls for a set of images relating to a given search string.

// User Story: I can paginate through the responses by adding a ?offset=2 parameter to the URL.

// User Story: I can get a list of the most recently submitted search strings.
// https://cryptic-ridge-9197.herokuapp.com/api/imagesearch/lolcats%20funny?offset=10 and browse recent search queries like this: https://cryptic-ridge-9197.herokuapp.com/api/latest/imagesearch/. Then deploy it to Heroku.

//key 15fab64c1feecfb6223ae6bdfd71c600
//secret 324df69e2a365e4f
//https://www.flickr.com/services/api/flickr.photos.search.html
//https://api.flickr.com/services/rest/?method=flickr.photos.search&api_key=9da2d7f5b500d3f829998a98e4fbb2fb&text=cat&safe_search=1&page=1&format=rest
// {"url":"http://www.bajiroo.com/wp-content/uploads/2013/06/funny-lol-cats-fun-pics-images-photos-pictures-5.jpg","snippet":"33 Funniest LOLcats Ever | Bajiroo.com","thumbnail":"https://encrypted-tbn2.gstatic.com/images?q=tbn:ANd9GcTUXCGnfYdIRdxb86GIz-VCaSsgmgG5uS27hMCq1IquRvSTd2zwQwtphXA","context":"http://www.bajiroo.com/33-funniest-lolcats-ever"}
/*
<rsp stat="ok">
  <photos page="1" pages="2301" perpage="100" total="230022">
    <photo id="33073079064" owner="145133690@N04" secret="f2dbd913dc" server="3940" farm="4" title="When you fall in love with a big ginger cat at Pet Value left behind with his brother after a divorce .... my allergies say no... my heart breaks  #dontmakeyouranimalssuffer #humanssuck #allergictocats #gingercatlove" ispublic="1" isfriend="0" isfamily="0" />

    https://www.flickr.com/services/api/misc.urls.html

    https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}.jpg
	or
https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{secret}_[mstzb].jpg
	or
https://farm{farm-id}.staticflickr.com/{server-id}/{id}_{o-secret}_o.(jpg|gif|png)

https://www.flickr.com/photos/{user-id}/{photo-id} - individual photo
*/

var express = require("express");
var mongodb = require("mongodb").MongoClient;
var axios = require("axios");
var sprintf_js = require("sprintf-js");
//var RSVP = require('rsvp');

var app = express();

var connStr = "";

function logSearch(term, res)
{
    try 
    {
        mongodb.connect(connStr, 
            function (err, database) 
            {
                if (err) throw err;

                var when = new Date();

                var insert = database.collection("image_searches").insert({term: term, when: when.toString()},
                function(result)
                {
                    if (result && result.hasWriteError()) 
                    {
                        database.close();
                        throw { message: result.writeError.errmsg };
                    }
                });
            });
    }
    catch(err) 
    {
        console.log(err.message);
        res.json({error: error.message});
    }
}

try {
    app.get("/api/imagesearch/:keywords", function (req, res) {
    //
    try {
        
        axios.get('https://api.flickr.com/services/rest/', {
            params: {
            method: "flickr.photos.search",
            api_key: "15fab64c1feecfb6223ae6bdfd71c600",
            text: req.params.keywords,
            safe_search: 1,
            page: req.query.offset,
            format: "json"
            }
        })
        .then(function (response) 
        {
            var baseUrl = "https://farm%s.staticflickr.com/%s/";

            var dataStr = response.data.slice("jsonFlickrApi(".length, -1);
            
            var data = JSON.parse(dataStr);
            var results = data.photos.photo.map(function(p) {
                var url = sprintf_js.sprintf(baseUrl + "%s_%s", p.farm, p.server, p.id, p.secret);
                var result =
                {
                    url: url + ".jpg",
                    snippet: p.title,
                    thumbnail: url + "_t.jpg",
                    context: sprintf_js.sprintf("https://www.flickr.com/photos/%s/%s", p.owner, p.id)
                };
                return result;
            });

            logSearch(req.params.keywords, res);

            res.send(results);
        })
        .catch(function (error) 
        {
            console.log(error);
            res.status(500);
            res.json({error: error.message});
        });
    }
    catch(err) 
    {
        console.log(err.message);
        res.status(500);
        res.json({error: err.message});
    }
    });
}
 catch (err) 
{
    console.log(err.message);
    res.status(500);
    res.json({error: err.message});
}

app.get("/api/latest/imagesearch", 
    function (req, res) 
    {
        try 
        {
            mongodb.connect(connStr, 
                function (err, database) 
                {
                    if (err) throw err;

                    database.collection("image_searches").find({}, { term: 1, when: 1, _id: 0}).toArray(
                        function(err, searches)
                        {
                            if (err) 
                            {
                                database.close();
                                throw err;
                            }
                            database.close();

                            res.send(searches);
                        }
                    );
                });
        } 
        catch(err) 
        {
            console.log(err.message);
            res.status(500);
            res.json({error: err.message});
        }
    }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "localhost",
    function () 
    {
        console.log("App listening on port " + PORT);
    }
);