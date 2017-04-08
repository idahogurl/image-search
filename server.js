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
var sprintf = require("sprintf-js");
//var RSVP = require('rsvp');

var app = express();

var connStr = "mongodb://idahogurl:Re99ba1Ml@ds155130.mlab.com:55130/heroku_29g02tsm"

function getBaseUrl(farmId, serverId) {
    
}


// var promise = new RSVP.Promise(function(resolve, reject) {
//   mongodb.connect(connStr, function (err, database) {
//         console.log("here");
//         if (err) reject(err);
//         return resolve(database);
//     }); 
// });
try {
    app.get("/imagesearch/:keywords", function (req, res) {
    //
    try {
        
        axios.get('https://api.flickr.com/services/rest/', {
            params: {
            method: "flickr.photos.search",
            api_key: "9da2d7f5b500d3f829998a98e4fbb2fb",
            text: req.params.keywords,
            safe_search: 1,
            page: req.query.offset,
            format: "json"
            }
        })
        .then(function (response) {
            var baseUrl = "https://farm%s.staticflickr.com/%s/";
            
            var dataStr = response.data.slice("jsonFlickrApi(".length, -1);
            var data = JSON.parse(dataStr);
            var results = data.photos.photo.map(function(p) {
                var url = sprintf.sprintf(baseUrl + "%s_%s", p.farm, p.server, p.id, p.secret);
                return
                {
                    url: url + ".jpg",
                    snippet: p.title,
                    thumbnail: url + "_t.jpg",
                    context: sprintf.sprintf("https://www.flickr.com/photos/%s/%s", p.owner, p.id
                };
            });
            res.send(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });
       
        // promise.then(
        //     function(database) 
        //     {
            
        //     return database; 
        //     }, 
        //     function(err) 
        //     {
        //         res.json({error: err.message});
        //     }
        // )
        // .then(
        //     function(database)
        //     {
        //         var getNextSequence = new RSVP.Promise(function(resolve, reject) {
        //             //https://docs.mongodb.com/v3.0/tutorial/create-an-auto-incrementing-field/
        //             database.collection("counters").findAndModify({ _id: "url_id" }, [['_id', 'asc']], { $inc: { seq: 1 } }, { new: true, upsert: true }, function (err, doc) {
        //                 if (err) reject(err);
                    
        //                 console.log(doc.value.seq);
        //                 resolve({ database: database, id: doc.value.seq });
        //             });
        //         });
        //         return getNextSequence;
        //     }
        // )
        // .then(
        //     function(data){
        //         var insert = new RSVP.Promise(
        //             function(resolve, reject) 
        //             {
        //                 data.database.collection("short_urls")
        //                     .insert({ _id: data.id, url: req.query.url },
        //                         function (result)
        //                         {
        //                             console.log(data.id);
        //                             if (result && result.hasWriteError()) reject(result.writeError.errmsg);

        //                             resolve(data.id);
        //                         }
        //                     );
        //             }
        //         );
        //         return insert;
        //     }
        // )
        // .then(
        //     function(id) 
        //     {
        //         res.json({ "original_url":req.query.url, "short_url":"http://0.0.0.0:3000/" + id });
        //     }
        // )
        // .catch(
        //     function(error) 
        //     {
        //         res.json({error: error.message});
        //     }
        // );
    }
    catch(err) 
    {
        res.json({error: error.message});
    }
    });
} catch (err) {
    console.log(err.message);
}

app.get("/:id", 
    function (req, res) 
    {
        try 
        {
            mongodb.connect(connStr, 
                function (err, database) 
                {
                    var document = database.collection("short_urls").findOne({ _id: Number(req.params.id) });
                    
                    document.then(function(result) {
                        if (!result) 
                        {
                            res.sendStatus(404);
                        } 
                        else
                        {
                            res.redirect(result.url);
                        }
                });
            });
        } 
        catch(err) 
        {
            console.log(err.message);
        }
    }
);

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0",
    function () 
    {
    console.log("App listening on port " + PORT);
    }
);