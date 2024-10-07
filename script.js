let songlist = document.querySelector(".song_playlist");
// select the seekbar


// Global variables
let currentsong = null;  // Holds the current audio element
let isPlaying = false;   // Track whether the song is playing
let play = document.querySelector(".playsong"); // Play button
let next = document.querySelector(".next"); // Next button
let previous = document.querySelector(".previous"); // Previous button
let seekbar = document.querySelector(".seekbar"); // Seekbar element
let circle = document.querySelector(".circle"); // Circle element
let currentsongindex = 0; // Current song index
let songs = []; // Song list
// the hamburger
let hamburger=document.querySelector(".hamburger")
// the close button to close the hamburger item
let close=document.querySelector(".close");
// select the card
let card=document.querySelector(".card");
// select the search button and the inputbox
let searchbtn=document.querySelector(".search");
let input=document.querySelector(".sechsong")

// Function to fetch songs from API
async function getsongs() {
    const api = 'http://127.0.0.1:3000/songs/';
    let promise = await fetch(api);
    let response = await promise.text();
    console.log(response);

    let div = document.createElement("div");
    div.innerHTML = response;

    // Get all anchor tags with .mp3 files
    let as = div.getElementsByTagName("a");

    songs = [];
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split("/songs/")[1]);  // Extract song name
        }
    }
    return songs;
}

// Function to play the selected song
const playmusic = (track, startTime = 0) => {
    // If a song is already playing, stop it
    if (currentsong) {
        currentsong.pause();
        currentsong.currentTime = 0; // Reset the song position
    }

    // Create a new audio object for the selected track
    currentsong = new Audio(`http://127.0.0.1:3000/songs/${track}`);
    document.querySelector(".songinfo").innerHTML = track.replaceAll("%20", " ");

    // Store the current song and its time in localStorage
    localStorage.setItem("song", track);
    localStorage.setItem("currenttime", startTime);

    // Resume the song from the stored time
    currentsong.currentTime = startTime;

    // Get the song's duration when metadata is loaded
    currentsong.addEventListener('loadedmetadata', () => {
        let duration = currentsong.duration; // Get song duration in seconds
        let minute = Math.floor(duration / 60);
        let second = Math.floor(duration % 60);
        second = second < 10 ? '0' + second : second;

        document.querySelector(".songtime").innerHTML = `/${minute}:${second}`; // Display total duration
    });

    // Update the current playback time and seekbar
    currentsong.addEventListener('timeupdate', () => {
        let currentTime =currentsong.duration- currentsong.currentTime; // Get current playback time
        let currentMinute = Math.floor(currentTime / 60);
        let currentSecond = Math.floor(currentTime % 60);
        currentSecond = currentSecond < 10 ? '0' + currentSecond : currentSecond;

        // Update the seekbar and circle position
        let progress = (currentsong.currentTime / currentsong.duration) * 100;
        circle.style.left = `${progress}%`;



        // Display the current time
        document.querySelector(".currenttime").innerHTML = `${currentMinute}:${currentSecond}`;

        // Store the current playback time in localStorage
        localStorage.setItem('currenttime', currentsong.currentTime);
    });



    // Play the song
    currentsong.play();
    isPlaying = true;  // Set state to playing
}
// the function to search the song
// Function to search for a song and play it
function searchsong(query) {
    // Normalize the search query (remove spaces and make lowercase)
    query = query.toLowerCase().trim();

    // Loop through the song list
    for (let i = 0; i < songs.length; i++) {
        let song = songs[i].toLowerCase(); // Normalize the song name (to lowercase)
        
        // Check if the song name contains the search query
        if (song.includes(query)) {
            playmusic(songs[i]); // Play the found song
            console.log(`Playing song: ${songs[i]}`);
            return; // Exit the loop after finding the song
        }
    }

    // If no song is found
    console.log("Song not found.");
    alert("Song not found.");
}


// Function to play the next song
const playnext = () => {
    currentsongindex++;
    if (currentsongindex >= songs.length) {
        currentsongindex = 0;
    }
    playmusic(songs[currentsongindex]);
}

// Function to play the previous song
const playPrevious = () => {
    if (currentsongindex > 0) {
        currentsongindex--;
    } else {
        console.log("No previous song.");
        return;
    }
    playmusic(songs[currentsongindex]);
}

// Function to check if a song was last played and resume it
const resumeLastPlayedSong = () => {
    let playedSong = localStorage.getItem("song"); // Get the last played song
    let playedTime = localStorage.getItem("currenttime") || 0; // Get the last played time

    if (!playedSong && songs.length > 0) {
        console.log("No song was previously selected. Playing the first song.");
        playmusic(songs[0]);  // Play the first song in the list
    } else if (playedSong) {
        playmusic(playedSong, parseFloat(playedTime)); // Resume song from stored time
    }
    else {
        console.log("no song is selected");

    }
}


// Main function to fetch and display songs
async function main() {
    let songs = await getsongs();
    console.log(songs);

    // Add all songs to the playlist
    let songul = songlist.getElementsByTagName("ul")[0];
    for (const song of songs) {
        songul.innerHTML += `
            <li>
                <img src="svg/music.svg" alt="music icon">
                <div class="info">
                    <div class="songname">${song.replaceAll("%20", " ")}</div>
                    <div class="songartist">Song Artist</div>
                </div>
                <div class="playnow">
                    <h3>Play Now</h3>
                    <img src="svg/play.svg" alt="play button" class="playnow">
                </div>
            </li>
        `;
    }

    // Attach event listeners to each song
    Array.from(document.querySelector(".song_playlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            console.log(e);

            let songName = e.querySelector(".info .songname").innerHTML.trim();
            console.log("Playing:", songName);
            playmusic(songName);
        });
    });

    // Attach event listener to play/pause button
    play.addEventListener("click", () => {
        if (currentsong) {
            if (isPlaying) {
                currentsong.pause();  // Pause the song
                isPlaying = false;    // Update state
                play.src = "pause.svg"; // Change icon to pause
            } else {
                currentsong.play();   // Play the song
                isPlaying = true;     // Update state
                play.src = "playsong.svg"; // Change icon to play
            }
        } else {
            console.log("No song is selected to play");
        }
    });

    // Attach event listeners for next and previous buttons
    next.addEventListener("click", playnext);
    previous.addEventListener("click", playPrevious);
    // add a event listernet to seekbar
    seekbar.addEventListener("click", (e) => {
        let seekPercentage = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        console.log(seekPercentage); // Log for debugging

        circle.style.left = `${seekPercentage}%`; // Move the circle to the clicked position

        if (currentsong && currentsong.duration) {
            // Adjust the current playback time
            currentsong.currentTime = (seekPercentage / 100) * currentsong.duration;
        }
    });


    // Resume the last played song from localStorage
    resumeLastPlayedSong();
    // add an eventlistner to the hamburger menu
    hamburger.addEventListener("click",()=>{
        document.querySelector(".left").style.left=0;
        document.querySelector(".playbar").style.position='relative';
        close.style.display='block';
         
    })
    // the code to close the hamburger menu
    close.addEventListener("click",()=>{
        document.querySelector(".left").style.left="-120%";
        document.querySelector(".left").style.transition="all .3s"
        close.style.display="none";
   
    })
    card.addEventListener("click",()=>{
        playmusic(songs[0]);
    })
    searchbtn.addEventListener("click",()=>{
        // console.log(input.value);
        let quarry=input.value;
        
        searchsong(quarry)
    })
    
    
}

main();
