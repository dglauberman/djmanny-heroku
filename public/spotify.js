/**
 * Created by doryglauberman on 6/26/14.
 */

var category = "none";

document.getElementById("artist").addEventListener('click', function () {
    category = "artist";
    document.getElementById("artist").className = "active";
    document.getElementById("genre").className = "inactive";
    document.getElementById("year").className = "inactive";
    document.getElementById("city").className = "inactive";
    //console.log(category);
    setCurrentArtist();
});

document.getElementById("genre").addEventListener('click', function () {
    category = "genre";
    document.getElementById("artist").className = "inactive";
    document.getElementById("genre").className = "active";
    document.getElementById("year").className = "inactive";
    document.getElementById("city").className = "inactive";
    //console.log(category);
    currentArtist = nowPlaying.artists[0].name;
    setCurrentGenre();
});

document.getElementById("year").addEventListener('click', function () {
    category = "year";
    document.getElementById("artist").className = "inactive";
    document.getElementById("genre").className = "inactive";
    document.getElementById("year").className = "active";
    document.getElementById("city").className = "inactive";
    //console.log(category);
    currentArtist = nowPlaying.artists[0].name;
    setCurrentYear();

});

document.getElementById("city").addEventListener('click', function () {
    category = "city";
    document.getElementById("artist").className = "inactive";
    document.getElementById("genre").className = "inactive";
    document.getElementById("year").className = "inactive";
    document.getElementById("city").className = "active";
    //console.log(category);
    currentArtist = nowPlaying.artists[0].name;
    setCurrentCity();

});

var nowPlayingAudio = null;
var nowPlaying = null;

var t; // search term

var playlist = [];

var currentArtist;
var currentGenre;
var currentYear;
var currentCity;

var tracks;

function setCurrentArtist() {
    currentArtist = nowPlaying.artists[0].name;
    document.getElementById("path").innerHTML = "Path: " + currentArtist;
}

function setCurrentGenre() {
    var req = new XMLHttpRequest();
    req.open('GET', nowPlaying.artists[0].href);

    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            var data = JSON.parse(req.responseText);
            //stop();
            var genres = data.genres;
            //console.log(genres);
            if (genres.length > 0) {
                currentGenre = genres[0];
                document.getElementById("path").innerHTML = "Path: " + currentGenre;
            }
            else {
                currentGenre = "";
                document.getElementById("path").innerHTML = "This artist does not have any available genres, " +
                    "please choose another path.";
            }
        }
    };

    req.send(null);
}

function setCurrentYear() {
    var req = new XMLHttpRequest();
    req.open('GET', nowPlaying.href);

    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            var data = JSON.parse(req.responseText);
            stop();

            var req2 = new XMLHttpRequest();
            req2.open('GET', data.album.href);

            req2.onreadystatechange = function () {
                if (req2.readyState == 4 && req2.status == 200) {
                    var data2 = JSON.parse(req2.responseText);
                    stop();

                    //console.log(data2.release_date);
                    var year = data2.release_date.substr(0, 4);
                    //console.log(year);
                    currentYear = year;
                    document.getElementById("path").innerHTML = "Path: " + currentYear;

                }
            };

            req2.send(null);

        }
    };

    req.send(null);
}

function setCurrentCity() {
    var id;
    var req = new XMLHttpRequest();
    var artist = currentArtist.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
    //console.log(artist);
    req.open('GET', "http://developer.echonest.com/api/v4/artist/search?api_key=XMQVSZDOTAALO0S7F&format=json&name="
        + artist + "&results=1");
    req.onreadystatechange = function () {
        if (req.readyState == 4 && req.status == 200) {
            var results = JSON.parse(req.responseText);
            stop();
            id = results.response.artists[0].id;

            var req2 = new XMLHttpRequest();
            req2.open('GET', "http://developer.echonest.com/api/v4/artist/profile?api_key=XMQVSZDOTAALO0S7F&id="
                + id + "&format=json&bucket=artist_location");
            req2.onreadystatechange = function () {
                if (req2.readyState == 4 && req2.status == 200) {
                    var results2 = JSON.parse(req2.responseText);
                    stop();

                    if (results2.response.artist.artist_location == null) {
                        currentCity = "";
                        document.getElementById("path").innerHTML = "This artist does not have an available city, " +
                            "please choose another path.";
                    }
                    else {
                        var city = results2.response.artist.artist_location.city;
                        currentCity = city;
                        document.getElementById("path").innerHTML = "Path: " + currentCity;
                    }

                }
            };

            req2.send(null);
        }
    };

    req.send(null);
}

function playFirstSong (track) {

    var url;
    var index;
    var s = track.innerHTML.replace('&amp;', '&');

    for (var i = 0; i < tracks.items.length; i++){
        if (tracks.items[i].name == s){
            url = tracks.items[i].preview_url;
            index = i;
            break;
        }
    }

    nowPlaying = tracks.items[index];
    currentArtist = nowPlaying.artists[0].name;
    nowPlayingAudio = new Audio(url);
    nowPlayingAudio.play();
    document.getElementById("playpause").className = "playing";
    nowPlayingAudio.addEventListener('ended', function() {
        switch(category){
            case "artist":
                playNextSongByArtist(nowPlaying.artists[0].name);
                break;
            case "genre":
                playNextSongByGenre();
                break;
            case "year":
                playNextSongByYear();
                break;
            case "city":
                playNextSongByCity();
                break;
        }
    });
    $("#results").hide();
    document.getElementById("songtitle").innerText = nowPlaying.name;
    var artistNames = "";
    for (var i = 0; i < nowPlaying.artists.length; i++) {
        if (i == nowPlaying.artists.length - 1)
            artistNames += nowPlaying.artists[i].name;
        else
            artistNames += nowPlaying.artists[i].name + ", ";
    }
    document.getElementById("songartist").innerText = artistNames;
    $("#songdetails").show();
    playlist.push(nowPlaying.name + " by " + artistNames);



//    $("#musiccontrol").removeClass("hide");
//    $("#categories").removeClass("hide");
    $("#musiccontrol").show();
    $("#categories").show();
    $("#path").show();
    document.getElementById("artist").className = "inactive";
    document.getElementById("genre").className = "inactive";
    document.getElementById("year").className = "inactive";
    document.getElementById("city").className = "inactive";
    $("#search").hide();
    $("#playlist").hide();

}

function playNextSongByArtist(searchTerm) {

    //currentArtist = searchTerm;
    var req = new XMLHttpRequest();


    req.open('GET', 'https://api.spotify.com/v1/search?q=artist:' + searchTerm + '&type=track&limit=50');


    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            var data = JSON.parse(req.responseText);
            stop();

            var num = Math.floor((Math.random() * (data.tracks.items.length - 1)));

            nowPlaying = data.tracks.items[num];

            nowPlayingAudio = new Audio(data.tracks.items[num].preview_url);
            if (category == "artist") {
                setCurrentArtist();
            }
            if (category == "genre") {
                setCurrentGenre();
            }
//            if (category == "city") {
//                setCurrentCity();
//            }
            nowPlayingAudio.play();
            nowPlayingAudio.addEventListener('ended', function() {
                switch(category){
                    case "artist":
                        playNextSongByArtist(currentArtist);
                        break;
                    case "genre":
                        playNextSongByGenre();
                        break;
                    case "year":
                        playNextSongByYear();
                        break;
                    case "city":
                        playNextSongByCity();
                        break;
                }
            });

            document.getElementById("songtitle").innerText = data.tracks.items[num].name;
            var artistNames = "";
            for (var i = 0; i < data.tracks.items[num].artists.length; i++) {
                if (i == data.tracks.items[num].artists.length - 1)
                    artistNames += data.tracks.items[num].artists[i].name;
                else
                    artistNames += data.tracks.items[num].artists[i].name + ", ";
            }
            document.getElementById("songartist").innerText = artistNames;
            playlist.push(nowPlaying.name + " by " + artistNames);
        }

    };

    req.send(null);

}


function playNextSongByGenre() {

    if (currentGenre == "") {
        //console.log("no genre, playing by artist");
        playNextSongByArtist(nowPlaying.artists[0].name);
    }
    else {
        var genre = currentGenre.replace(/\s+/g, '');
        var req2 = new XMLHttpRequest();
        req2.open('GET', 'https://api.spotify.com/v1/search?q=genre:' + genre + '&type=artist&limit=50');

        req2.onreadystatechange = function () {
            if (req2.readyState == 4 && req2.status == 200) {
                var data2 = JSON.parse(req2.responseText);
                stop();
                //console.log(data2.artists.items.length);
                if (data2.artists.items.length == 0) {
                    playNextSongByArtist(nowPlaying.artists[0].name);
                }
                else {
                    var num = Math.floor((Math.random() * (data2.artists.items.length - 1)));
                    //console.log(num);
                    playNextSongByArtist(data2.artists.items[num].name);
                }
            }
        };

        req2.send(null);
    }

    //setCurrentGenre();
}

function playNextSongByYear() {

    var req = new XMLHttpRequest();
    req.open('GET', nowPlaying.href);

    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            var data = JSON.parse(req.responseText);
            stop();

            //console.log(data.album.name);

            var req2 = new XMLHttpRequest();
            req2.open('GET', data.album.href);

            req2.onreadystatechange = function () {
                if (req2.readyState == 4 && req2.status == 200) {
                    var data2 = JSON.parse(req2.responseText);
                    stop();

                    //console.log(data2.release_date);
                    var year = data2.release_date.substr(0, 4);
                    console.log(year);

                    var req3 = new XMLHttpRequest();
                    req3.open('GET', 'https://api.spotify.com/v1/search?q=year:' + year + '&type=track&limit=50');

                    req3.onreadystatechange = function() {
                        if (req3.readyState == 4 && req3.status == 200) {
                            var data3 = JSON.parse(req3.responseText);
                            stop();

                            var num = Math.floor((Math.random() * (data3.tracks.items.length - 1)));

                            nowPlaying = data3.tracks.items[num];
                            nowPlayingAudio = new Audio(data3.tracks.items[num].preview_url);
                            nowPlayingAudio.play();
                            nowPlayingAudio.addEventListener('ended', function() {
                                switch(category){
                                    case "artist":
                                        playNextSongByArtist(nowPlaying.artists[0].name);
                                        break;
                                    case "genre":
                                        playNextSongByGenre();
                                        break;
                                    case "year":
                                        playNextSongByYear();
                                        break;
                                    case "city":
                                        playNextSongByCity();
                                        break;
                                }

                            });

                            document.getElementById("songtitle").innerText = data3.tracks.items[num].name;
                            var artistNames = "";
                            for (var i = 0; i < data3.tracks.items[num].artists.length; i++) {
                                if (i == data3.tracks.items[num].artists.length - 1)
                                    artistNames += data3.tracks.items[num].artists[i].name;
                                else
                                    artistNames += data3.tracks.items[num].artists[i].name + ", ";
                            }
                            document.getElementById("songartist").innerText = artistNames;
                            playlist.push(nowPlaying.name + " by " + artistNames);
                        }
                    };

                    req3.send(null);
                }
            };

            req2.send(null);

        }
    };

    req.send(null);

}

function playNextSongByCity() {
    if (currentCity == "") {
        playNextSongByArtist(nowPlaying.artists[0].name);
    }
    else {
        var req3 = new XMLHttpRequest();
        req3.open('GET', "http://developer.echonest.com/api/v4/artist/search?api_key=XMQVSZDOTAALO0S7F" +
            "&format=json&artist_location=city:" + currentCity + "&bucket=artist_location");

        req3.onreadystatechange = function () {
            if (req3.readyState == 4 && req3.status == 200) {
                var results3 = JSON.parse(req3.responseText);

                var num = Math.floor((Math.random() * (results3.response.artists.length - 1)));
                //console.log(results3.response.artists.length);
                playNextSongByArtist(results3.response.artists[num].name);
            }
        };

        req3.send(null);
    }
}


document.getElementById("playpause").addEventListener('click', function () {
    //console.log(playlist.toString());
    if (nowPlayingAudio != null) {
        if (!nowPlayingAudio.paused){
            nowPlayingAudio.pause();
            document.getElementById("playpause").className = "paused";
        }
        else {
            nowPlayingAudio.play();
            document.getElementById("playpause").className = "playing";
        }

    }
});

document.getElementById("next").addEventListener('click', function() {
    nowPlayingAudio.pause();
    switch(category){
        case "artist":
            playNextSongByArtist(nowPlaying.artists[0].name);
            break;
        case "genre":
            playNextSongByGenre();
            break;
        case "year":
            playNextSongByYear();
            break;
        case "city":
            playNextSongByCity();
            break;
        default:
            //playNextSongByArtist(nowPlaying.artists[0].name);
            break;
    }

//    console.log(currentArtist);
//    console.log(currentGenre);
//    console.log(currentYear);
//    console.log(currentCity);
});

document.getElementById("end").addEventListener('click', function () {
    nowPlayingAudio.pause();
    nowPlayingAudio = null;
    console.log(playlist.toString());
    var myNode = document.getElementById("playlist");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }

    var h = document.createElement('h2');
    h.innerText = "Journey";
    document.getElementById("playlist").appendChild(h);

    for (var i = 0; i < playlist.length; i++){
        var song = document.createElement('p');
        song.innerText = playlist[i];
        document.getElementById("playlist").appendChild(song);
    }

    playlist = [];

    $("#songdetails").hide();
    $("#musiccontrol").hide();
    $("#categories").hide();
    $("#path").hide();
    $("#search").show();
    $("#playlist").show();

});

function findTracks() {
    t = document.getElementById("search").elements[0].value;
    //console.log(t);

    var myNode = document.getElementById("results");
    while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild);
    }
    var req = new XMLHttpRequest();
    req.open('GET', 'https://api.spotify.com/v1/search?type=track&q=' + t);
    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            var results = JSON.parse(req.responseText);
            stop();
            tracks = results.tracks;
            for (var i = 0; i < tracks.items.length; i++){
                var track = document.createElement('button');
                track.innerHTML = tracks.items[i].name;
                track.onclick = function() {
                    playFirstSong(this);
                };

                document.getElementById("results").appendChild(track);
            }

        }
    };
    req.send(null);

    $("#results").show();

}



