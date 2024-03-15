import * as Carousel from "./Carousel.js";
import axios from "axios";

const breedSelect = document.getElementById("breedSelect");
const infoDump = document.getElementById("infoDump");
const progressBar = document.getElementById("progressBar");
const getFavouritesBtn = document.getElementById("getFavouritesBtn");

const API_KEY ="live_YxX8QE2O1kMENLR3058dZoAIFlkDoHBnB0aOBUQbTelN8UH4ffFKtisxGIwwTvmq";

// create instance of axios, named api
const api = axios.create();

// task 5
// boiler plate taken from axios documentation
api.interceptors.request.use(
  function (config) {
    config.metadata = { startTime: new Date() };
    return config;
  },
  function (e) {
    return Promise.reject(e);
  }
);

api.interceptors.response.use(
  function (response) {
    const endTime = new Date();
    const startTime = response.config.metadata.startTime;
    
    // here we take the end time, subtract the start time and then print it to console as instructed
    console.log(`It takes ${endTime - startTime} milliseconds to complete.`);
    return response;
  },
  function (e) {
    return Promise.reject(e);
  }
);

async function initialLoad() {
  try {
    // here I fetch all of the breeds, and turn the breeds into an array of json objects
    const response = await api.get("https://api.thecatapi.com/v1/breeds");
    const breeds = response.data;

    //for each breed, create an option element and set the value text content and finally appendChild to breedSelect
    breeds.forEach((breed) => {
      const newOption = document.createElement("option");
      newOption.value = breed.id;
      newOption.textContent = breed.name;
      breedSelect.appendChild(newOption);
    });

    // here I call the "change" event to trigger for the first element since technically it's loading a default value and not changing
    // so this calls the change event for the first element so data loads correctly.
    breedSelect.dispatchEvent(new Event("change"));
  } catch (e) {
    console.error("Something went wrong: ", e);
  }
}

initialLoad();

breedSelect.addEventListener("change", async () => {
  try {
    // here I get the images of the selected breed using the ID, and limit the images to 5 (if there is more than 5)
    const response = await api.get(
      `https://api.thecatapi.com/v1/images/search?breed_id=${breedSelect.value}&limit=5`
    );
    const data = response.data;

    // make sure the carousel is empty before appending new images
    Carousel.clear();

    // for each image, in the collection of images
    data.forEach(async (item) => {
      // create a carousel item using the img url and then append it to the carousel element
      const carouselItem = Carousel.createCarouselItem(
        item.url,
        "Alt",
        item.id
      );
      Carousel.appendCarousel(carouselItem);
    });
    // this try catch loop is specifically for getting data on the specific breed for the infoDump text information
    try {
      const breedResponse = await api.get(
        `https://api.thecatapi.com/v1/images/${data[0].id}`
      );
      const breedData = breedResponse.data;

      // sets the innerHTML of infodump to the data that we pull within breedData
      infoDump.innerHTML = `<h2>${breedData.breeds[0].name}</h2><p><strong>Weight:</strong> ${breedData.breeds[0].weight.imperial} lbs</p><p><strong>Temperament:</strong> ${breedData.breeds[0].temperament}</p><p><strong>Origin:</strong> ${breedData.breeds[0].origin}</p><p><strong>Lifespan:</strong> ${breedData.breeds[0].life_span} years</p>`;
    } catch (e) {
      console.error("Something went wrong:", e);
    }

    Carousel.start();
  } catch (e) {
    console.error("Something went wrong: ", e);
  }
});
