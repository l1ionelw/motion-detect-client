API_URL = "http://98.42.152.32:2500"
var statbox = document.getElementById("status-box")
var image = document.getElementById("status-image")

console.log("Script loaded")

setInterval(() => {
    getStatus()
}, 1000);

function getStatus() {
    fetch(API_URL).then((resp) => resp.json()).then((json) => {
        changeBox(json)
    })
}

function changeBox(json) {
    if (json.motion === null) {
        statbox.classList.remove("red")
        statbox.classList.remove("green")
        statbox.classList.add("blue")
    }
    if (json.motion === 0) {
        // no one detected
        statbox.classList.remove("red")
        statbox.classList.remove("blue")
        statbox.classList.add("green")
        setImage(null)
    }
    if (json.motion > 0) {
        // someone detected
        statbox.classList.remove("green")
        statbox.classList.remove("blue")
        statbox.classList.add("red")
        setImage()
    }
}


function setImage(thing) {
    if (thing === null) {
        image.style.visibility = "hidden"
        return
    }
    image.style.visibility = ""
    fetch(`${API_URL}/image`).then((response) => response.text()).then((text) => {
        console.log(text)
        image.src = `data:image/jpeg;base64, ${text}`
    })
}

window.addEventListener("keydown", (event) => {
    console.log("Key pressed " + event.key)
    if (event.key === "r") {
        fetch(`${API_URL}/renew`)
    }
    if (event.key === "n") {
        fetch(`${API_URL}/start`)
    }
    if (event.key === "m") {
        fetch(`${API_URL}/stop`)
    }
});