const API_KEY = "AIzaSyA7-ImZbnAct7e4D8oZVJ_eTP7bb0hrXSU";
let nextPageToken = "";
let currentQuery = "trending";
let isLoading = false;

// Load initial videos
window.addEventListener("DOMContentLoaded", () => {
  fetchVideos(currentQuery);
});

// Fetch videos from YouTube API
async function fetchVideos(query, append = true) {
  if (isLoading) return;
  isLoading = true;
  currentQuery = query;

  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&q=${encodeURIComponent(
    query
  )}&maxResults=10&key=${API_KEY}&pageToken=${nextPageToken}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    nextPageToken = data.nextPageToken;

    const grid = document.querySelector(".video-grid");
    if (!append) grid.innerHTML = ""; // clear if not appending

    data.items.forEach((video) => {
      const videoCard = createVideoCard(video);
      grid.appendChild(videoCard);
    });
  } catch (error) {
    console.error("Error fetching videos:", error);
  }

  isLoading = false;
}

// Create video card
function createVideoCard(video) {
  const videoId = video.id.videoId;
  const { url } = video.snippet.thumbnails.medium;
  const title = video.snippet.title;
  const channel = video.snippet.channelTitle;

  const videoCard = document.createElement("div");
  videoCard.classList.add("video-preview");

  videoCard.innerHTML = `
    <div class="thumbnail-row">
      <img class="thumbnail" src="${url}" data-video-id="${videoId}">
      <div class="video-time">Live</div>
    </div>
    <div class="video-info-grid">
      <div class="channel-picture">
        <img class="profile-picture" src="https://via.placeholder.com/36">
      </div>
      <div class="video-info">
        <p class="video-title">${title}</p>
        <p class="video-author">${channel}</p>
      </div>
    </div>
  `;

  videoCard.querySelector(".thumbnail").addEventListener("click", () => {
    window.open(`https://www.youtube.com/watch?v=${videoId}`, "_blank");
  });

  return videoCard;
}

// Infinite scroll
window.addEventListener("scroll", () => {
  if (
    window.innerHeight + window.scrollY >= document.body.offsetHeight - 300 &&
    !isLoading
  ) {
    fetchVideos(currentQuery, true);
  }
}); 

// Live Search Suggestions (YouTube Suggest API)
const searchInput = document.getElementById("searchInput");

const suggestionBox = document.createElement("div");
suggestionBox.style.position = "absolute";
suggestionBox.style.backgroundColor = "#181818";
suggestionBox.style.color = "#fff";
suggestionBox.style.borderRadius = "8px";
suggestionBox.style.padding = "8px 0";
suggestionBox.style.zIndex = "1000";
suggestionBox.style.display = "none";
suggestionBox.style.minWidth = "200px";
suggestionBox.style.maxHeight = "200px";
suggestionBox.style.overflowY = "auto";
document.body.appendChild(suggestionBox);

searchInput.addEventListener("input", async () => {
  const query = searchInput.value.trim();
  suggestionBox.innerHTML = "";

  if (!query) {
    suggestionBox.style.display = "none";
    return;
  }

  try {
    const res = await fetch(
      `https://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=${encodeURIComponent(query)}`
    );
    const data = await res.json();
    const suggestions = data[1].slice(0, 5);

    suggestions.forEach((suggestion) => {
      const div = document.createElement("div");
      div.style.padding = "6px 12px";
      div.style.cursor = "pointer";
      div.innerText = suggestion;

      div.addEventListener("click", () => {
        searchInput.value = suggestion;
        suggestionBox.style.display = "none";
        nextPageToken = "";
        fetchVideos(suggestion, false);
      });

      suggestionBox.appendChild(div);
    });

    const rect = searchInput.getBoundingClientRect();
    suggestionBox.style.left = `${rect.left}px`;
    suggestionBox.style.top = `${rect.bottom + window.scrollY}px`;
    suggestionBox.style.width = `${rect.width}px`;
    suggestionBox.style.display = "block";
  } catch (err) {
    console.error("Suggestion fetch failed", err);
    suggestionBox.style.display = "none";
  }
});

// Search on Enter key
searchInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    const query = searchInput.value.trim();
    if (query) {
      suggestionBox.style.display = "none";
      nextPageToken = "";
      fetchVideos(query, false);
    }
  }
});

// Static thumbnail mappings (if needed)
document.addEventListener("DOMContentLoaded", () => {
  const mappings = {
    "Viktor Axelsen": "-s7E8v90qI4",
    "VICKY KAUSHAL": "8E9XRKrKY9E",
    "Midnight Squad": "fW_NJUfAk9k",
    "Humraah": "hJBHSmyqv0Y",
    "Nadaaniyan": "U4L--2EFuY4",
    "KL Rahul": "zUdiCvpsyik"
  };

  const thumbnails = document.querySelectorAll(".video-preview");

  thumbnails.forEach((thumb) => {
    const title = thumb.querySelector(".video-title")?.innerText || "";

    for (const key in mappings) {
      if (title.includes(key)) {
        thumb.style.cursor = "pointer";
        thumb.addEventListener("click", () => {
          window.open(`https://www.youtube.com/watch?v=${mappings[key]}`, "_blank");
        });
      }
    }
  });
});
