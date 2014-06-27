/**
 * Created by doryglauberman on 6/26/14.
 */



var category = "none";

document.getElementById("artist").addEventListener('click', function () {
    category = "artist";
    document.getElementById("artist").className = "active";
    document.getElementById("genre").className = "inactive";
    document.getElementById("year").className = "inactive";
    //console.log(category);
});

document.getElementById("genre").addEventListener('click', function () {
    category = "genre";
    document.getElementById("artist").className = "inactive";
    document.getElementById("genre").className = "active";
    document.getElementById("year").className = "inactive";
    //console.log(category);
});

document.getElementById("year").addEventListener('click', function () {
    category = "year";
    document.getElementById("artist").className = "inactive";
    document.getElementById("genre").className = "inactive";
    document.getElementById("year").className = "active";
    //console.log(category);
});

var nowPlayingAudio = null;
var nowPlaying = null;

var t; // search term

var playlist = [];

function playFirstSong (track) {

    var req = new XMLHttpRequest();
    req.open('GET', 'https://api.spotify.com/v1/search?q=' + track.innerHTML + '&artist:' + t + '&type=track');
    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            var data = JSON.parse(req.responseText);
            stop();
            nowPlaying = data.tracks.items[0];
            nowPlayingAudio = new Audio(data.tracks.items[0].preview_url);
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
                }
            });
            $("#results").hide();
            document.getElementById("songtitle").innerText = data.tracks.items[0].name;
            var artistNames = "";
            for (var i = 0; i < data.tracks.items[0].artists.length; i++) {
                if (i == data.tracks.items[0].artists.length - 1)
                    artistNames += data.tracks.items[0].artists[i].name;
                else
                    artistNames += data.tracks.items[0].artists[i].name + ", ";
            }
            document.getElementById("songartist").innerText = artistNames;
            $("#songdetails").show();
            playlist.push(nowPlaying.name + " by " + artistNames);
        }
    };

    req.send(null);

}

function playNextSongByArtist(searchTerm) {

    var req = new XMLHttpRequest();


    req.open('GET', 'https://api.spotify.com/v1/search?q=artist:' + searchTerm + '&type=track&limit=50');


    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            var data = JSON.parse(req.responseText);
            stop();

            var num = Math.floor((Math.random() * (data.tracks.items.length - 1)));

            nowPlaying = data.tracks.items[num];

            nowPlayingAudio = new Audio(data.tracks.items[num].preview_url);
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

    var req = new XMLHttpRequest();
    req.open('GET', nowPlaying.artists[0].href);

    req.onreadystatechange = function() {
        if (req.readyState == 4 && req.status == 200) {
            var data = JSON.parse(req.responseText);
            stop();
            var genres = data.genres;
            console.log(genres.toString());

            if (genres.length == 0) {
                console.log("no genres");
                playNextSongByArtist();
            }
            else {
                var genre = genres[0].replace(/\s+/g, '');
                var req2 = new XMLHttpRequest();
                req2.open('GET', 'https://api.spotify.com/v1/search?q=genre:' + genre + '&type=artist&limit=50');

                req2.onreadystatechange = function () {
                    if (req2.readyState == 4 && req2.status == 200) {
                        var data2 = JSON.parse(req2.responseText);
                        stop();
                        //console.log(data2.artists.items.length);
                        var num = Math.floor((Math.random() * (data2.artists.items.length - 1)));
                        //console.log(num);
                        playNextSongByArtist(data2.artists.items[num].name);

                    }
                };

                req2.send(null);
            }
        }
    };

    req.send(null);

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


document.getElementById("playpause").addEventListener('click', function () {
    console.log(playlist.toString());
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
        default:
            //playNextSongByArtist(nowPlaying.artists[0].name);
            break;
    }
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

    var l = playlist.length;
    for (var i = 0; i < l; i++){
        playlist.pop();
    }

    $("#playlist").show();
});

function findTracks() {
    t = document.getElementById("search").elements[0].value;
    console.log(t);

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
            var tracks = results.tracks;
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