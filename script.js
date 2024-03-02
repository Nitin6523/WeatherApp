const API_key ="32fd0133e26ccb58bcd25ebb132598cb";

const userTab = document.querySelector("[data-userWeather]")
const searchTab = document.querySelector("[data-searchWeather]")
const userContainer = document.querySelector(".weather-container")
const grantAccessContainer = document.querySelector(".grant-location-container")
const searchForm = document.querySelector("[data-searchForm]")
const loadingScreen = document.querySelector(".loading-screen")
const userInfoContainer = document.querySelector(".weather-info-container")
const notFoundContainer = document.querySelector(".notFound-container")


let currentTab = userTab;
currentTab.classList.add("current-tab");
getfromSessionStorage();


// function for switiching tab your weather <-> search city
function switchTab(clickedTab){

    if(clickedTab != currentTab){

        // remove background color from currentTab
        notFoundContainer.classList.remove("active");
        currentTab.classList.remove("current-tab");

        currentTab = clickedTab;

        // add background color to currentTab
        currentTab.classList.add("current-tab");

        if(!searchForm.classList.contains("active")){
            // console.log("on search tab");
            //clicked on search tab

            // make search container visible
            grantAccessContainer.classList.remove("active")
            notFoundContainer.classList.remove("active");
            // notFoundContainer.classList.remove("active");
            userInfoContainer.classList.remove("active");
            searchForm.classList.add("active");
            
        }
        else{
            // console.log("on your weather tab");
            // we are on search tab and clicked on your weather tab 

            // make your weather visible
            userInfoContainer.classList.remove("active");
            // notFoundContainer.classList.remove("active");
            // grantAccessContainer.classList.remove("active")
            searchForm.classList.remove("active");

            // we are in your weather tab we have to diaplay info check local storage first for co-od if we saved them
            getfromSessionStorage();
        }
    }
}

userTab.addEventListener("click",()=>{
    // clicked tab as input parameter
    switchTab(userTab);
});

searchTab.addEventListener("click",()=>{
    // clicked tab as input parameter
    switchTab(searchTab);
});

// check if co-od are present in storage
function getfromSessionStorage(){
    // console.log(" get session storge called...");
    const localCoordinates = sessionStorage.getItem("user-coordinates")
    if(!localCoordinates){
        // local coordinate not saved means location acces not granted 
        // grant access tab
        grantAccessContainer.classList.add("active");   
    }
    else{
        const Coordinates = JSON.parse(localCoordinates);
        fetchUserWeatherInfo(Coordinates);
    }
}

// fetch weather data on basis of co ordinates
async function fetchUserWeatherInfo(Coordinates){
    // console.log("fetch user weather info on co ord called..");
    const {lat,lon} = Coordinates;

    //make grant access container invisible
    grantAccessContainer.classList.remove("active");

    // loader visible
    
    loadingScreen.classList.add("active");
    

    //api call to fetch info
    try{
        const response =  await fetch(
                            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_key}&units=metric`
                        );
        const data = await response.json();

        // remove loader 
        loadingScreen.classList.remove("active");

        // user info contain visible
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);
    }
    catch(err){
        console.log("Error while fetching API data");
        console.log(err);
        loadingScreen.classList.remove("active");
    }
}

function renderWeatherInfo(weatherInfo) {
    // console.log("render weather info called...");

    // fetch the elements 
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-counrtyIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temprature = document.querySelector("[data-temp]");
    const humidity = document.querySelector("[data-humidity]");
    const windspeed = document.querySelector("[data-windspeed]");
    const cloud = document.querySelector("[data-clouds]");

    console.log(weatherInfo)

    // set data to respective elements 
    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    weatherIcon.src = `http://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    temprature.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed} m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloud.innerText = `${weatherInfo?.clouds?.all}%`; 
}


function getLocation() {
    // console.log("geolocation called...");
    if(navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        console.log("Error occured while getting geolocation..");
        console.log(err);
        alert("No Geolocation support available!!!");
    }
};

function showPosition(position) {
    // console.log("show position  called...");

    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    }

    // console.log("user cordinates ...");
    // console.log(userCoordinates)

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));
    fetchUserWeatherInfo(userCoordinates);

}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click",getLocation);


// search city weather
const searchInput = document.querySelector("[data-searchInput]");
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if(cityName === ""){
        return;

    }
    else{ 
        fetchSearchWeatherInfo(cityName);
    }
});


// function to find weather info on the basis of city
async function fetchSearchWeatherInfo(city) {
    // console.log("fetch weather info on city called...")
    notFoundContainer.classList.remove("active");
    loadingScreen.classList.add("active");
    userInfoContainer.classList.remove("active");
    grantAccessContainer.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_key}&units=metric`
          );
        const data = await response.json();
        console.log("city weather data : ")
        console.log(data);
        let cod = data?.cod;
        loadingScreen.classList.remove("active");
        if(cod == 404){
            console.log("Not Found..")
            notFoundContainer.classList.add("active");
        }
        else{
            userInfoContainer.classList.add("active");
            renderWeatherInfo(data);
        }
        
    }
    catch(err) {
        loadingScreen.classList.remove("active");
        console.log("Error while fetching API data");
    }
};
