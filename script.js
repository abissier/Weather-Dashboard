const searchWrapper = document.querySelector(".search-input");
const inputBox = document.querySelector("input");
const suggBox = document.querySelector(".autocom-box");

var queryURLBase = "https://api.openweathermap.org/data/2.5/forecast?q=";
var imperialUnits = "&units=imperial";
var apiKey = "&appid=086828ce404d02fbf057835f64951922";
var lat = "";
var lon = "";
var userCity = "";
var btnCity = "";
var previousSearch = [];
var storedCity = "";

//auto fill content from CodingNepal YouTube 
inputBox.onkeyup = (e) => {
    let userData = e.target.value;
    let emptyArray = [];
    if (userData) {
        emptyArray = suggestions.filter((data) => {
            //filter array value
            return data.toLocaleLowerCase().startsWith(userData.toLocaleLowerCase());
        });
        emptyArray = emptyArray.map((data) => {
            return data = '<li>' + data + '</li>';
        });
        searchWrapper.classList.add("active")
        showSuggestions(emptyArray)
        let allList = document.querySelectorAll("li");
        for (var i = 0; i < allList.length; i++) {
            allList[i].setAttribute("onclick", "select(this)");
        }
    } else {
        searchWrapper.classList.remove("active");
    }
}

function select(element) {
    let selectUserData = element.textContent;
    inputBox.value = selectUserData;
    searchWrapper.classList.remove("active");
}

function showSuggestions(list) {
    let listData;
    if (!list.length) {
        userValue = inputBox.value;
        listData = '<li>' + userValue + '</li>';
    } else {
        listData = list.join('')
    }
    suggBox.innerHTML = listData;
}

getLastSearch();

function getLastSearch() {
    storedCity = localStorage.getItem("city");
}

if (storedCity) {

    var newUrl = queryURLBase + storedCity + imperialUnits + apiKey;

    runQuery(newUrl);
}


//ajax request to get info
function runQuery(queryURL) {

    $(".weather-info").empty();
    $(".weather-imgs-content").empty();

    $.ajax({
        url: queryURL,
        method: "GET"

        //function to get main weather info
    }).done(function (weatherData) {

        //add to html weather-info class
        var weatherInfoSection = $("<div>");
        weatherInfoSection.addClass("weather");
        $(".weather-info").append(weatherInfoSection);

        //check if previous search array does not include user city 
        if (!previousSearch.includes(userCity)) {
            //if true then add to html city-list class
            var cityItem = $("<button>");
            cityItem.addClass("city");
            $(".city-list").append(cityItem);
            previousSearch.push(userCity);
            cityItem.append("<h2>" + weatherData.city.name + "</h2>");
        }

        //delete extra content from the date gathered from api
        var weatherDataDate = weatherData.list[0].dt_txt.toString().slice(0, 10);
        //save city weather icon in variable to make easier to append in next step
        var cityWeatherIcon = "<img src=https://openweathermap.org/img/w/" + weatherData.list[0].weather[0].icon + ".png>";

        //append wanted data from api to html
        $(".weather").append("<h2>" + weatherData.city.name + " " + weatherDataDate + cityWeatherIcon + "</h2>");
        $(".weather").append("<h5>" + "Temperature: " + weatherData.list[0].main.temp + "&deg;F" + "</h5>");
        $(".weather").append("<h5>" + "Humidity: " + weatherData.list[0].main.humidity + "%" + "</h5>");
        $(".weather").append("<h5>" + "Wind Speed " + weatherData.list[0].wind.speed + " MPH" + "</h5>");

        //for loop to gather info for 5 day outlook content 
        for (var i = 1; i < 35; i += 8) {
            var dailyWeather = $("<div>");
            dailyWeather.addClass("weatherslot")
            dailyWeather.attr("id", "slot-" + i);
            $(".weather-imgs-content").append(dailyWeather);

            //delete extra content from the date gathered from api
            var littleWeatherDate = weatherData.list[i].dt_txt.toString().slice(0, 10);
            //save city weather icon in variable to make easier to append in next step
            var weatherIcon = "https://openweathermap.org/img/w/" + weatherData.list[i].weather[0].icon + ".png";

            //append wanted data from api to html
            $("#slot-" + i).append("<h6>" + littleWeatherDate + "</h6>");
            $("#slot-" + i).append("<img src=" + weatherIcon + ">");
            $("#slot-" + i).append("<h6>" + "Temperature: " + weatherData.list[i].main.temp + "&deg;F" + "</h6>");
            $("#slot-" + i).append("<h6>" + "Humidity: " + weatherData.list[i].main.humidity + "%" + "</h6>");
        }

        //store lat and lon var 
        lat = weatherData.city.coord.lat;
        lon = weatherData.city.coord.lon;

        //then run new api call to get uv info w previous functions lat and lon
    }).then(function (weatherUV) {

        $.ajax({
            url: "https://api.openweathermap.org/data/2.5/uvi?lat=" + lat + "&lon=" + lon + apiKey,
            method: "GET"

        }).done(function (weatherUV) {

            $(".weather").append("<h5 class='uv'>" + "UV Index: <span>" + weatherUV.value + "</span></h5>");

            var uvIndex = parseInt(weatherUV.value, 10);

            if (uvIndex <= 2) {
                $(".uv").addClass("favorable");
            } else if (uvIndex >= 3 && uvIndex <= 5) {
                $(".uv").addClass("moderate");
            } else {
                $(".uv").addClass("severe");
            }
        })

    })
};

//onclick event for search button
$('#search-button').on("click", function (event) {
    userCity = $("#city").val().trim();

    var newUrl = queryURLBase + userCity + imperialUnits + apiKey;

    localStorage.setItem("city", userCity);
    //run query w new url
    runQuery(newUrl);
    return false;
});

//onclick event for previous city search 
$(".city-list").on("click", function (event) {
    btnCity = event.target.innerText;

    var newUrl = queryURLBase + btnCity + imperialUnits + apiKey;

    localStorage.setItem("city", btnCity);

    // run query w new url
    runQuery(newUrl);
    return false;
})