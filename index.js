const userTab = document.querySelector("[data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-container");

const grantAccessContainer = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-SearchForm]");
const loadingScreen = document.querySelector(".loading-container");
const userInfoContainer = document.querySelector(".user-info-container");

const apiErrorImg = document.querySelector("[data-notFoundImg]");
const apiErrorMessage = document.querySelector("[data-apiErrorText]");
const apiErrorBtn = document.querySelector("[data-apiErrorBtn]");
const apiErrorContainer = document.querySelector(".api-error-container");
const msgText = document.querySelector("[data-msgText]");
//initial Variables
let currentTab = userTab;
const API_Key = "63544dc8592c70dc5f25af7d3fc0389f";
currentTab.classList.add("current-tab");

//switching tabs

function switchTab(clickedTab){
    apiErrorContainer.classList.remove("active");
    if(clickedTab != currentTab){
        currentTab.classList.remove("current-tab");
        currentTab = clickedTab;
        currentTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")){
            grantAccessContainer.classList.remove("active");
            userInfoContainer.classList.remove("active");
            searchForm.classList.add("active");
        }else{
            searchForm.classList.remove("active");
            userInfoContainer.classList.remove("active");
            //ab m yourweather m aa gaya hoon, toh weather ko visible kar do, Agar local coordinates saved hai (Lattitude and longitude)
            getfromSessionStorage();
        }

    }
};

userTab.addEventListener("click", () =>{
    //pass the current tab
    switchTab(userTab);
});

searchTab.addEventListener("click", () =>{
    //pass the current tab
    switchTab(searchTab);
});

//check local coordinates saved or not
function getfromSessionStorage(){
    const localCoordinates = sessionStorage.getItem("user-coordinates");
    if(!localCoordinates){
        grantAccessContainer.classList.add("active");
    }else{
        const coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(coordinates);
    }
};

async function fetchUserWeatherInfo(coordinates){
    const {lat, lon} = coordinates;
    //make Grant access location invisible
    grantAccessContainer.classList.remove("active");
    //loading screen make active
    loadingScreen.classList.add("active");

    //API CALL
    try{
        const response = await fetch(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&APPID=${API_Key}&units=metric`);
        const data = await response.json();
	    if (!data.sys) {
            throw data;
        }
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }catch(error){
        loadingScreen.classList.remove("active");
        apiErrorContainer.classList.add("active");
        apiErrorImg.style.display = "none";
        apiErrorMessage.innerText = `Error: ${error?.message}`;
        apiErrorBtn.addEventListener("click", getfromSessionStorage);
    }
};

function renderWeatherInfo(weatherInfo){
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const Desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temperature = document.querySelector("[data-temp]");

    const windSpeed = document.querySelector("[data-windSpeed]");
    const humidity = document.querySelector("[data-humidity]");
    const clouds = document.querySelector("[data-cloudiness]");

    //fetch data

    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    Desc.innerText = weatherInfo?.weather?.[0]?.main;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temperature.innerText = `${weatherInfo?.main?.temp} °C`;
    windSpeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity} %`;
    clouds.innerText = `${weatherInfo?.clouds?.all} %`;
};

function getLocation(){
    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(showPosition,showError);
    }else{
        grantAccessButton.style.display = "none";
        msgText.innerText = "No geoLocation Support Available";
    }
};

function showError(error) {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        msgText.innerText = "You denied the request for Geolocation.";
        break;
      case error.POSITION_UNAVAILABLE:
        msgText.innerText = "Location information is unavailable.";
        break;
      case error.TIMEOUT:
        msgText.innerText = "The request to get user location timed out.";
        break;
      case error.UNKNOWN_ERROR:
        msgText.innerText = "An unknown error occurred.";
        break;
    }
  }

function showPosition(position){
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    sessionStorage.setItem("user-coordinates",JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);
};

const grantAccessButton = document.querySelector("[data-grantAccess]");
getfromSessionStorage();
grantAccessButton.addEventListener("click",getLocation);


const searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit", (e) =>{
    e.preventDefault();
    let cityname = searchInput.value;
    if(cityname === "") return;

    fetchSearchWeatherCity(cityname);
});

async function fetchSearchWeatherCity(city){
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("remove");
    apiErrorContainer.classList.remove("active");
    try{
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_Key}&units=metric`);
        const data = await response.json();
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.add("active");
        console.log(data);
        if (!data.sys) {
            throw data;
        }
        renderWeatherInfo(data);
    }catch(error){
        loadingScreen.classList.remove("active");
        userInfoContainer.classList.remove("active");
        apiErrorContainer.classList.add("active");
        apiErrorImg.style.display="flex";
        apiErrorMessage.innerText = `${error?.message}`;
        apiErrorBtn.style.display = "none";
        apiErrorBtn.addEventListener("click", fetchSearchWeatherCity);
        // add karna hai 404
    }
}