async function getSongs(folder) {
  let apiCall = await fetch(`/Songs/${folder}`);
  let textApi = await apiCall.text();
  let div = document.createElement("div");
  div.innerHTML = textApi;
  let as = div.querySelectorAll("a");
  let songsArray = [];
  for (let i = 0; i < as.length; i++) {
    if (as[i].href.endsWith(".mp3")) {
      songsArray.push(as[i]);
    }
  }
  return songsArray;
}

let currentSong = new Audio();
function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }
  let minutes = Math.floor(seconds / 60);
  let remainingSeconds = seconds % 60;

  // Adding leading zeros if necessary
  let minutesStr = minutes < 10 ? "0" + minutes : "" + minutes;
  let secondsStr = Math.floor(remainingSeconds); // Remove fractional part
  secondsStr = secondsStr < 10 ? "0" + secondsStr : "" + secondsStr;

  return minutesStr + ":" + secondsStr;
}
function timeUpdate() {
  currentSong.addEventListener("timeupdate", (e) => {
    document.querySelector(".songTime").innerHTML = `${secondsToMinutesSeconds(
      currentSong.currentTime
    )} /  ${secondsToMinutesSeconds(currentSong.duration)}`;

    function myFunction(x) {
      if (x.matches) {
        document.querySelector(".seekBar .circle").style.left = `${
          (currentSong.currentTime / currentSong.duration) * 96
        }%`;
      } else {
        document.querySelector(".seekBar .circle").style.left = `${
          (currentSong.currentTime / currentSong.duration) * 99
        }%`;
      }
    }
    let x = window.matchMedia("(max-width: 500px)");
    myFunction(x);
    x.addEventListener("change", function () {
      myFunction(x);
    });
  });
}

let singerName = [];
async function display_cards() {
  let apiCall = await fetch(`/Songs/`);
  let textApi = await apiCall.text();
  let div = document.createElement("div");
  div.innerHTML = textApi;
  let lis = div.querySelectorAll("li");
  for (let i = 0; i < lis.length; i++) {
    const element = lis[i];
    let as = element.querySelector("a");
    if (as.href.includes('Songs') && !as.href.includes('.htaccess')) {
      let jsonFile = await fetch(
        `/Songs/${
          as.href.split("/").slice(4)[0]
        }/info.json`
      );
      let respo = await jsonFile.json();
      singerName.push(respo.singer);
      document.querySelector(".cardContainer").innerHTML += `
      <div data-folder="${as.querySelector(".name").innerHTML}" class="card">
      <div class="card_img">
        <div class="playBtn">
          <img src="/imgs/playBtn.svg" alt="Play" />
        </div>

        <img
          src="/Songs/${as.querySelector(".name").innerHTML}/Artist Avatar.png"
          alt="Item"
        />
      </div>
      <h4>${respo.title}</h4>
      <p>${respo.description}</p>
    </div>
      `;
    }
  }
  // Play the songs
  // Add click Play List
  document.querySelectorAll(".card").forEach((item) => {
    item.addEventListener("click", async (e) => {
      document.querySelector("#playIcon").src = "/imgs/pause.svg";
      songs = await getSongs(e.currentTarget.dataset.folder);
      async function playSong() {
        document.querySelector(".songList ul").innerHTML = "";
        for (let i = 0; i < songs.length; i++) {
          const element = songs[i];
          let lis = document.createElement("li");
          lis.innerHTML = `<div class="musicNameAndIcons">
                  <span class="material-symbols-outlined"> music_note</span>
                  <div class="songName">
                    <p class="songNamePara">${
                      element.querySelector(".name").innerText
                    }</p>
                    <p class="singer">Manan Khan</p>
                  </div>
                </div>
                <div class="playSong">
                  <span>Play Now</span>
                  <img src="/imgs/play.svg" alt="Img">
                </div>`;
          document.querySelector(".songList ul").append(lis);
          lis.addEventListener("click", (f) => {
            if (
              element.title ==
              lis.querySelector(".songName .songNamePara").innerText
            ) {
              currentSong.src = element.href;
              currentSong.play();
              document.querySelector("#playIcon").src = "/imgs/pause.svg";
              document.querySelector(".songInfo").innerHTML =
                element.querySelector(".name").innerHTML;
              document.querySelector(".songTime").innerHTML = "00:00 / 00:00";
              timeUpdate();
            }
          });
        }
        let songIndex = 0;
        currentSong.src = songs[songIndex].href;
        document.querySelector(".songInfo").innerHTML =
          songs[songIndex].querySelector(".name").innerHTML;
        document.querySelector(".songTime").innerHTML = `00:00 / 00:00`;
        currentSong.play();
        timeUpdate();
      }
      playSong();
      function playNestAndPreviousIcons() {
        let next = document.querySelector("#next");
        let previous = document.querySelector("#previous");
        let arr = [];
        // Assuming songs is a globally defined array of song objects with href properties
        for (let i = 0; i < songs.length; i++) {
          const element = songs[i];
          arr.push(element.href);
        }

        // Function to update song info and play song
        function updateAndPlaySong(index) {
          if (index >= 0 && index < arr.length) {
            currentSong.src = arr[index];
            currentSong.play();
            let name = currentSong.src
              .split("/Songs/")[1]
              .replaceAll("%20", " ")
              .split("/")[1];
            document.querySelector(".songInfo").innerHTML = name.replaceAll(
              "%",
              " "
            );
            document.querySelector("#playIcon").src = "/imgs/pause.svg";
          } else {
            console.error("Index out of bounds: ", index);
          }
        }

        // previous
        previous.addEventListener("click", () => {
          let index = arr.indexOf(currentSong.src);
          if (index > 0) {
            updateAndPlaySong(index - 1);
          } else {
            currentSong.play();
          }
        });

        // next
        next.addEventListener("click", () => {
          let index = arr.indexOf(currentSong.src);
          if (index >= 0 && index + 1 < arr.length) {
            updateAndPlaySong(index + 1);
          } else {
            currentSong.play();
          }
        });
      }
      playNestAndPreviousIcons();

      // Add Seekbar click
      document.querySelector(".seekBar").addEventListener("click", (e) => {
        let percent =
          (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".seekBar .circle").style.left = percent + "%";
        currentSong.currentTime = (currentSong.duration * percent) / 100;
      });
    });
  });
}
let songs;
async function main() {
  // Display all the albums on the page
  display_cards();
  let play = document.querySelector("#playIcon");
  function play_push() {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "/imgs/pause.svg";
    } else {
      currentSong.pause();
      play.src = "/imgs/play.svg";
    }
  }
  play.addEventListener("click", async (e) => {
    timeUpdate();
    play_push();
  });

  function stylingCode() {
    document.querySelector("#menu_burger").addEventListener("click", (e) => {
      document.querySelector(".left").style.left = "0";
      document.querySelector(".right").style.opacity = "0.3";
      document
        .querySelector(".left .home .logo svg")
        .addEventListener("click", (e) => {
          document.querySelector(".left").style.left = "-100%";
          document.querySelector(".right").style.opacity = "1";
        });
    });
    let clickHidden = document.querySelector("#clickHidden");
    let playBar = document.querySelector(".playBar");
    clickHidden.querySelector("img").addEventListener("click", (e) => {
      document.querySelector(".playBar").classList.toggle("height_remove");
      clickHidden.classList.toggle("rotate_toggle");
    });
  }
  stylingCode();
  //Add Songs Volume range
  document
    .querySelector(".range")
    .querySelector("input")
    .addEventListener("change", (e) => {
      document.querySelector("#volumeText").innerHTML =
        e.target.value + " / 100";
      currentSong.volume = e.target.value / 100;
      if (currentSong.volume == 0) {
        document.querySelector(".range").querySelector("img").src =
          "/imgs/volumeNone.svg";
      } else {
        document.querySelector(".range").querySelector("img").src =
          "/imgs/volume.svg";
      }
    });
  document
    .querySelector(".playBar .songTimeOrVolume .range img")
    .addEventListener("click", (e) => {
      if (e.target.src.includes("/imgs/volume.svg")) {
        e.target.src = e.target.src.replace(
          "/imgs/volume.svg",
          "/imgs/volumeNone.svg"
        );
        currentSong.volume = 0;
        document.querySelector(".range").querySelector("input").value = 0;
      } else {
        e.target.src = e.target.src.replace(
          "/imgs/volumeNone.svg",
          "/imgs/volume.svg"
        );
        currentSong.volume = 80 / 100;
        document.querySelector(".range").querySelector("input").value = 80;
      }
    });
}
main();
