var statbox = document.getElementById("status-box")
var image = document.getElementById("status-image")
var content_div = document.getElementById("content")
var login_div = document.getElementById("login")

function set_api_url() {
    const API_URL = localStorage.getItem("api_url")
    if (API_URL === null) {
        content_div.style.display = "none"
        login_div.style.display = ""
    } else {
        content_div.style.display = ""
        login_div.style.display = "none"
    }
    return API_URL
}

API_URL = "http://" + set_api_url()
setInterval(() => {
    getStatus()
}, 1000);

async function getStatus() {
    let resp = ""
    try {
        resp = await fetch(API_URL)
    } catch (e) {
        console.log("Exception occurred, server couldn't be reached")
        changeBox(null)
        return
    }
    if (!resp.ok) {
        console.log("Something went wrong")
        changeBox(null)
        return
    }
    changeBox(await resp.json())
}

function changeBox(json) {
    if (json === null) {
        // Server is off, show white
        statbox.classList.remove("red")
        statbox.classList.remove("green")
        statbox.classList.remove("blue")
    }
    if (json.motion === null) {
        // Server is on, but motion detection is off, show blue
        statbox.classList.remove("red")
        statbox.classList.remove("green")
        statbox.classList.add("blue")
    }
    if (json.motion === 0) {
        // No motion detected, show green
        statbox.classList.remove("red")
        statbox.classList.remove("blue")
        statbox.classList.add("green")
        setImage(null)
    }
    if (json.motion > 0) {
        // Motion detected, show red
        statbox.classList.remove("green")
        statbox.classList.remove("blue")
        statbox.classList.add("red")
        setImage()
    }
}


function setImage(thing) {
    if (thing === null) {
        image.style.display = "none"
        return
    }
    image.style.display = ""
    fetch(`${API_URL}/image`).then((response) => response.text()).then((text) => {
        console.log(text)
        image.src = `data:image/jpeg;base64, ${text}`
    })
}

window.addEventListener("keydown", (event) => {
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

document.getElementById("submit").addEventListener("click", (e) => {
        e.preventDefault()
        const val = document.getElementById("ip").value.trim()
        console.log(val)
        localStorage.setItem("api_url", val)
        window.location.reload()
    }
)