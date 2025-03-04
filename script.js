const speedSlider = document.getElementById("setSpeed")
const speedValue = document.getElementById("speedValue")
const speedButtons = document.querySelectorAll(".speed-btn")

function updateSpeedDisplay(speed) {
  speedValue.textContent = speed.toFixed(2) + "x"
  speedSlider.value = speed
}

function getCurrentSpeed() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return

    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        func: () => {
          const video = document.querySelector("video")
          return video ? video.playbackRate : 1
        },
      },
      (results) => {
        if (results && results[0]) {
          const currentSpeed = results[0].result
          updateSpeedDisplay(currentSpeed)
        }
      },
    )
  })
}

function setPlaybackSpeed(speed) {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length === 0) return

    chrome.scripting.executeScript({
      target: { tabId: tabs[0].id },
      func: (speed) => {
        const video = document.querySelector("video")
        if (video) video.playbackRate = speed
      },
      args: [speed],
    })
  })
}

// Event listeners
speedSlider.addEventListener("input", () => {
  const speed = Number.parseFloat(speedSlider.value)
  updateSpeedDisplay(speed)
  setPlaybackSpeed(speed)
})

speedButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const speed = Number.parseFloat(button.getAttribute("data-speed"))
    updateSpeedDisplay(speed)
    setPlaybackSpeed(speed)
  })
})

// Highlight active button based on current speed
function highlightActiveButton(speed) {
  speedButtons.forEach((button) => {
    const buttonSpeed = Number.parseFloat(button.getAttribute("data-speed"))
    if (Math.abs(speed - buttonSpeed) < 0.01) {
      button.classList.add("active")
    } else {
      button.classList.remove("active")
    }
  })
}

const originalUpdateSpeedDisplay = updateSpeedDisplay
updateSpeedDisplay = (speed) => {
  originalUpdateSpeedDisplay(speed)
  highlightActiveButton(speed)
}

// Add subtle animation to speed value when it changes
let previousSpeed = null
const animateSpeedChange = (speed) => {
  if (previousSpeed !== null && previousSpeed !== speed) {
    speedValue.style.transform = "scale(1.1)"
    speedValue.style.transition = "transform 0.15s ease"

    setTimeout(() => {
      speedValue.style.transform = "scale(1)"
    }, 150)
  }
  previousSpeed = speed
}

// Enhance the updateSpeedDisplay function with animation
const enhancedUpdateSpeedDisplay = updateSpeedDisplay
updateSpeedDisplay = (speed) => {
  enhancedUpdateSpeedDisplay(speed)
  animateSpeedChange(speed)
}

getCurrentSpeed()

