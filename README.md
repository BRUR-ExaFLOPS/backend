# Travel API Documentation

This documentation provides an overview of the Travel API endpoints, request/response schemas, and how to interact with them. The API is built using NestJS and offers various travel-related services such as accommodations, distance calculations, weather forecasts, and more.

## Frontend Repository

[Frontend Repository](https://github.com/BRUR-ExaFLOPS/trip-frontend)

## Table of Contents

- [Travel API Documentation](#travel-api-documentation)
  - [Frontend Repository](#frontend-repository)
  - [Table of Contents](#table-of-contents)
  - [Getting Started](#getting-started)
  - [Environment Variables](#environment-variables)
  - [API Endpoints](#api-endpoints)
    - [Photos](#photos)
      - [GET /photos](#get-photos)
    - [Travel](#travel)
      - [GET /travel/distance-matrix](#get-traveldistance-matrix)
      - [GET /travel/nearby-hotels](#get-travelnearby-hotels)
      - [GET /travel/popular-foods-restaurants](#get-travelpopular-foods-restaurants)
      - [GET /travel/accommodations](#get-travelaccommodations)
      - [GET /travel/travel-recommendations](#get-traveltravel-recommendations)
      - [POST /travel/store-trip-plan](#post-travelstore-trip-plan)
      - [GET /travel/trip-details](#get-traveltrip-details)
      - [POST /travel/upload](#post-travelupload)
      - [POST /travel/upload-trip-images](#post-travelupload-trip-images)
      - [GET /travel/trip/:id](#get-traveltripid)
      - [GET /travel/generate-blog/:id](#get-travelgenerate-blogid)
      - [GET /travel/search-images](#get-travelsearch-images)
      - [GET /travel/image/:filename](#get-travelimagefilename)
      - [GET /travel/weather](#get-travelweather)
  - [Data Transfer Objects (DTOs)](#data-transfer-objects-dtos)
    - [AccommodationsDto](#accommodationsdto)
    - [AccommodationDto](#accommodationdto)
    - [AccommodationsResponseDto](#accommodationsresponsedto)
    - [DistanceMatrixDto](#distancematrixdto)
    - [DistanceMatrixResponseDto](#distancematrixresponsedto)
    - [ForecastRequestDto](#forecastrequestdto)
    - [ForecastResponseDto](#forecastresponsedto)
    - [DailyForecast](#dailyforecast)
    - [NearbyHotelsDto](#nearbyhotelsdto)
    - [NearbyHotelsResponseDto](#nearbyhotelsresponsedto)
    - [HotelDto](#hoteldto)
    - [PopularFoodsRestaurantsDto](#popularfoodsrestaurantsdto)
    - [PopularFoodsRestaurantsResponseDto](#popularfoodsrestaurantsresponsedto)
    - [RestaurantDto](#restaurantdto)
    - [TravelRecommendationsDto](#travelrecommendationsdto)
    - [TravelRecommendationsResponseDto](#travelrecommendationsresponsedto)
    - [TripPlanDto](#tripplandto)
  - [Setting Up the NestJS Application](#setting-up-the-nestjs-application)
  - [Services Overview](#services-overview)
    - [Google Maps API](#google-maps-api)
    - [OpenWeatherMap API](#openweathermap-api)
    - [OpenAI API](#openai-api)
    - [Clerk (Authentication)](#clerk-authentication)
    - [MongoDB](#mongodb)
  - [License](#license)

## Getting Started

To use the Travel API, you need to set up the NestJS backend application and ensure all dependencies are installed. The API uses various services like Google Maps API, OpenWeatherMap API, OpenAI API, and Clerk for authentication. It requires several environment variables to be configured.

## Environment Variables

Create a `.env` file in the root directory and add the following variables:

```
MAP_API_KEY=<your_google_maps_api_key>
OPEN_WEATHER_API_KEY=<your_open_weather_api_key>
OPENAI_API_KEY=<your_openai_api_key>
CLERK_SECRET_KEY=<your_clerk_secret_key>
MONGODB_URI=<your_mongodb_connection_string>
JWT_SECRET=<your_jwt_secret>
PORT=3000
```

- **MAP_API_KEY**: Your Google Maps API key. Used for accessing Google Maps services like Places API, Distance Matrix API, etc.
- **OPEN_WEATHER_API_KEY**: Your OpenWeatherMap API key. Used for fetching weather forecasts.
- **OPENAI_API_KEY**: Your OpenAI API key. Used for generating content such as blogs.
- **CLERK_SECRET_KEY**: The secret key for Clerk, used for authentication and user management.
- **MONGODB_URI**: Your MongoDB connection string. Used to connect to your MongoDB database.
- **JWT_SECRET**: A secret key for signing JWT tokens. Ensure this is a strong, random string.
- **PORT**: The port on which the NestJS application will run. Defaults to 3000 if not specified.

**Note:** Do not share your API keys or secret keys publicly. Ensure that your `.env` file is included in your `.gitignore` file to prevent it from being committed to version control.

## API Endpoints

### Photos

#### GET /photos

Retrieve a photo from Google Places API based on a photo reference.

- **URL:** `/photos`
- **Method:** `GET`
- **Query Parameters:**
  - `photoReference` (string, required): The photo reference string obtained from Google Places API.
  - `maxWidth` (number, optional): The maximum width of the photo. Defaults to 400 if not provided.
- **Response:** Streams the photo directly to the client.
- **Error Responses:**
  - `500 Internal Server Error`: If there's an error fetching the photo.

### Travel

#### GET /travel/distance-matrix

Get distance and duration between an origin and a destination using Google Distance Matrix API.

- **URL:** `/travel/distance-matrix`
- **Method:** `GET`
- **Query Parameters:**
  - `origin` (string, required): The starting location.
  - `destination` (string, required): The ending location.
- **Response:**
  ```json
  {
    "origin": "string",
    "destination": "string",
    "distance": "string",
    "duration": "string"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: If parameters are missing or invalid.
  - `500 Internal Server Error`: If there's an error fetching data from the API.

#### GET /travel/nearby-hotels

Retrieve nearby hotels based on a destination.

- **URL:** `/travel/nearby-hotels`
- **Method:** `GET`
- **Query Parameters:**
  - `destination` (string, required): The destination location.
  - `radius` (number, optional): Radius in meters to search within. Defaults to 10000 meters.
  - `limit` (number, optional): Maximum number of hotels to return. Defaults to 5.
- **Response:**
  ```json
  {
    "destination": "string",
    "latitude": number,
    "longitude": number,
    "hotels": [
      {
        "name": "string",
        "address": "string",
        "rating": number,
        "userRatingsTotal": number,
        "latitude": number,
        "longitude": number,
        "placeId": "string",
        "types": ["string"]
      }
    ]
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: If parameters are missing or invalid.
  - `500 Internal Server Error`: If there's an error fetching data from the API.

#### GET /travel/popular-foods-restaurants

Get popular food restaurants near a location.

- **URL:** `/travel/popular-foods-restaurants`
- **Method:** `GET`
- **Query Parameters:**
  - `location` (string, required): The location to search around.
  - `radius` (number, optional): Radius in meters to search within. Defaults to 5000 meters.
  - `limit` (number, optional): Maximum number of restaurants to return. Defaults to 10.
- **Response:**
  ```json
  {
    "location": "string",
    "latitude": number,
    "longitude": number,
    "restaurants": [
      {
        "name": "string",
        "address": "string",
        "rating": number,
        "userRatingsTotal": number,
        "latitude": number,
        "longitude": number,
        "placeId": "string",
        "types": ["string"],
        "priceLevel": number,
        "photos": ["string"],
        "openingHours": ["string"],
        "photoDescriptions": ["string"]
      }
    ]
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: If parameters are missing or invalid.
  - `500 Internal Server Error`: If there's an error fetching data from the API.

#### GET /travel/accommodations

Get accommodations near a location.

- **URL:** `/travel/accommodations`
- **Method:** `GET`
- **Query Parameters:**
  - `location` (string, required): The location to search around.
  - `radius` (number, optional): Radius in meters to search within. Defaults to 5000 meters.
  - `limit` (number, optional): Maximum number of accommodations to return. Defaults to 10.
- **Response:**
  ```json
  {
    "location": "string",
    "latitude": number,
    "longitude": number,
    "accommodations": [
      {
        "name": "string",
        "address": "string",
        "rating": number,
        "userRatingsTotal": number,
        "latitude": number,
        "longitude": number,
        "placeId": "string",
        "types": ["string"],
        "priceLevel": number,
        "openingHours": ["string"],
        "photos": ["string"]
      }
    ]
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: If parameters are missing or invalid.
  - `500 Internal Server Error`: If there's an error fetching data from the API.

#### GET /travel/travel-recommendations

Get travel recommendations based on a destination and duration.

- **URL:** `/travel/travel-recommendations`
- **Method:** `GET`
- **Query Parameters:**
  - `destination` (string, required): The destination for recommendations.
  - `origin` (string, optional): The starting location.
  - `duration` (number, required): Duration of the trip in days.
- **Response:**
  ```json
  {
    "destination": "string",
    "duration": number,
    "accommodations": [
      {
        "name": "string",
        "price": "string",
        "placeId": "string"
      }
    ],
    "mealPlans": [
      {
        "name": "string",
        "price": "string",
        "placeId": "string"
      }
    ],
    "transportation": [
      {
        "type": "string",
        "price": "string",
        "placeId": "string"
      }
    ]
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: If parameters are missing or invalid.
  - `500 Internal Server Error`: If there's an error fetching data from the API.

#### POST /travel/store-trip-plan

Store a trip plan for a user.

- **URL:** `/travel/store-trip-plan`
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "username": "string",
    "destination": "string",
    "tripPlan": "string",
    "transportOption": "string",
    "mealPlan": "string",
    "accommodation": "string"
  }
  ```
- **Response:**
  ```json
  {
    "username": "string",
    "destination": "string",
    "tripPlan": "string",
    "transportOption": "string",
    "mealPlan": "string",
    "accommodation": "string"
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: If request body is invalid.
  - `500 Internal Server Error`: If there's an error storing the trip plan.

#### GET /travel/trip-details

Get trip details for a user.

- **URL:** `/travel/trip-details`
- **Method:** `GET`
- **Query Parameters:**
  - `username` (string, required): The username to retrieve trip details for.
- **Response:**
  ```json
  {
    // Trip details data
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: If parameters are missing or invalid.
  - `500 Internal Server Error`: If there's an error retrieving trip details.

#### POST /travel/upload

Upload multiple image files.

- **URL:** `/travel/upload`
- **Method:** `POST`
- **Form Data:**
  - `images`: Array of image files (up to 10 files).
- **Response:**
  ```json
  {
    "message": "Files uploaded successfully",
    "data": [
      {
        "originalName": "string",
        "filename": "string",
        "path": "string"
      }
    ]
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: If file validation fails.
  - `500 Internal Server Error`: If there's an error uploading files.

#### POST /travel/upload-trip-images

Upload trip images associated with a trip ID.

- **URL:** `/travel/upload-trip-images`
- **Method:** `POST`
- **Query Parameters:**
  - `tripId` (string, required): The ID of the trip to associate images with.
- **Form Data:**
  - `images`: Array of image files (up to 10 files).
- **Response:**
  ```json
  {
    "message": "Trip images uploaded successfully",
    "data": [
      // Trip image data
    ]
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: If file validation fails or `tripId` is missing.
  - `500 Internal Server Error`: If there's an error uploading images.

#### GET /travel/trip/:id

Get details of a trip by its ID.

- **URL:** `/travel/trip/:id`
- **Method:** `GET`
- **Path Parameters:**
  - `id` (string, required): The ID of the trip.
- **Response:**
  ```json
  {
    // Trip details data
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: If `id` is invalid.
  - `500 Internal Server Error`: If there's an error retrieving the trip.

#### GET /travel/generate-blog/:id

Generate a blog for a trip by its ID.

- **URL:** `/travel/generate-blog/:id`
- **Method:** `GET`
- **Path Parameters:**
  - `id` (string, required): The ID of the trip.
- **Response:**
  ```json
  {
    // Generated blog data
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: If `id` is invalid.
  - `500 Internal Server Error`: If there's an error generating the blog.

#### GET /travel/search-images

Search for images based on a query.

- **URL:** `/travel/search-images`
- **Method:** `GET`
- **Query Parameters:**
  - `query` (string, required): The search query.
- **Response:**
  ```json
  {
    // Search results data
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: If `query` is missing.
  - `500 Internal Server Error`: If there's an error performing the search.

#### GET /travel/image/:filename

Serve an uploaded image by filename.

- **URL:** `/travel/image/:filename`
- **Method:** `GET`
- **Path Parameters:**
  - `filename` (string, required): The filename of the image.
- **Response:** Sends the image file.
- **Error Responses:**
  - `404 Not Found`: If the image is not found.
  - `500 Internal Server Error`: If there's an error retrieving the image.

#### GET /travel/weather

Get weather forecast for a location and date range.

- **URL:** `/travel/weather`
- **Method:** `GET`
- **Query Parameters:**
  - `location` (string, required): The location to get the forecast for.
  - `startDate` (string, required): The start date in ISO format.
  - `endDate` (string, required): The end date in ISO format.
- **Response:**
  ```json
  {
    "location": "string",
    "latitude": number,
    "longitude": number,
    "forecast": [
      {
        "date": "string",
        "temperature": {
          "min": number,
          "max": number
        },
        "description": "string",
        "humidity": number,
        "windSpeed": number
      }
    ]
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: If parameters are missing or invalid.
  - `500 Internal Server Error`: If there's an error fetching the forecast.

## Data Transfer Objects (DTOs)

### AccommodationsDto

Request parameters for accommodations search.

- **Properties:**
  - `location` (string, required): The location to search around.
  - `radius` (number, optional): Search radius in meters (1 - 50000). Default is 5000.
  - `limit` (number, optional): Maximum number of results (1 - 20). Default is 10.

### AccommodationDto

Details of an accommodation.

- **Properties:**
  - `name` (string): Name of the accommodation.
  - `address` (string): Address.
  - `rating` (number): Rating score.
  - `userRatingsTotal` (number): Total number of user ratings.
  - `latitude` (number): Latitude coordinate.
  - `longitude` (number): Longitude coordinate.
  - `placeId` (string): Google Place ID.
  - `types` (array of strings): Types/categories.
  - `priceLevel` (number, optional): Price level.
  - `openingHours` (array of strings): Opening hours.
  - `photos` (array of strings): Photo references or URLs.

### AccommodationsResponseDto

Response structure for accommodations search.

- **Properties:**
  - `location` (string): The searched location.
  - `latitude` (number): Latitude of the location.
  - `longitude` (number): Longitude of the location.
  - `accommodations` (array of `AccommodationDto`): List of accommodations.

### DistanceMatrixDto

Request parameters for distance matrix calculation.

- **Properties:**
  - `origin` (string, required): Starting location.
  - `destination` (string, required): Destination location.

### DistanceMatrixResponseDto

Response structure for distance matrix calculation.

- **Properties:**
  - `origin` (string): Starting location.
  - `destination` (string): Destination location.
  - `distance` (string): Distance between origin and destination.
  - `duration` (string): Estimated travel time.

### ForecastRequestDto

Request parameters for weather forecast.

- **Properties:**
  - `location` (string, required): Location for the forecast.
  - `startDate` (string, required): Start date in ISO format.
  - `endDate` (string, required): End date in ISO format.

### ForecastResponseDto

Response structure for weather forecast.

- **Properties:**
  - `location` (string): Location of the forecast.
  - `latitude` (number): Latitude coordinate.
  - `longitude` (number): Longitude coordinate.
  - `forecast` (array of `DailyForecast`): List of daily forecasts.

### DailyForecast

Details of a daily weather forecast.

- **Properties:**
  - `date` (string): Date of the forecast.
  - `temperature` (object):
    - `min` (number): Minimum temperature.
    - `max` (number): Maximum temperature.
  - `description` (string): Weather description.
  - `humidity` (number): Humidity percentage.
  - `windSpeed` (number): Wind speed.

### NearbyHotelsDto

Request parameters for nearby hotels search.

- **Properties:**
  - `destination` (string, required): Destination location.
  - `radius` (number, optional): Search radius in meters. Default is 10000.
  - `limit` (number, optional): Maximum number of hotels to return. Default is 5.

### NearbyHotelsResponseDto

Response structure for nearby hotels search.

- **Properties:**
  - `destination` (string): The searched destination.
  - `latitude` (number): Latitude of the destination.
  - `longitude` (number): Longitude of the destination.
  - `hotels` (array of `HotelDto`): List of hotels.

### HotelDto

Details of a hotel.

- **Properties:**
  - `name` (string): Name of the hotel.
  - `address` (string): Address.
  - `rating` (number): Rating score.
  - `userRatingsTotal` (number): Total number of user ratings.
  - `latitude` (number): Latitude coordinate.
  - `longitude` (number): Longitude coordinate.
  - `placeId` (string): Google Place ID.
  - `types` (array of strings): Types/categories.

### PopularFoodsRestaurantsDto

Request parameters for popular foods restaurants search.

- **Properties:**
  - `location` (string, required): Location to search around.
  - `radius` (number, optional): Search radius in meters. Default is 5000.
  - `limit` (number, optional): Maximum number of restaurants to return. Default is 10.

### PopularFoodsRestaurantsResponseDto

Response structure for popular foods restaurants search.

- **Properties:**
  - `location` (string): The searched location.
  - `latitude` (number): Latitude of the location.
  - `longitude` (number): Longitude of the location.
  - `restaurants` (array of `RestaurantDto`): List of restaurants.

### RestaurantDto

Details of a restaurant.

- **Properties:**
  - `name` (string): Name of the restaurant.
  - `address` (string): Address.
  - `rating` (number): Rating score.
  - `userRatingsTotal` (number): Total number of user ratings.
  - `latitude` (number): Latitude coordinate.
  - `longitude` (number): Longitude coordinate.
  - `placeId` (string): Google Place ID.
  - `types` (array of strings): Types/categories.
  - `priceLevel` (number, optional): Price level.
  - `photos` (array of strings, optional): Photo references or URLs.
  - `openingHours` (array of strings, optional): Opening hours.
  - `photoDescriptions` (array of strings, optional): Descriptions of photos.

### TravelRecommendationsDto

Request parameters for travel recommendations.

- **Properties:**
  - `destination` (string, required): Destination location.
  - `origin` (string, optional): Starting location.
  - `duration` (number, required): Duration of the trip in days.

### TravelRecommendationsResponseDto

Response structure for travel recommendations.

- **Properties:**
  - `destination` (string): Destination location.
  - `duration` (number): Duration in days.
  - `accommodations` (array of objects): Recommended accommodations.
    - `name` (string): Name of the accommodation.
    - `price` (string): Price information.
    - `placeId` (string): Google Place ID.
  - `mealPlans` (array of objects): Recommended meal plans.
    - `name` (string): Name of the meal plan or restaurant.
    - `price` (string): Price information.
    - `placeId` (string): Google Place ID.
  - `transportation` (array of objects): Recommended transportation options.
    - `type` (string): Type of transportation.
    - `price` (string): Price information.
    - `placeId` (string): Google Place ID.

### TripPlanDto

Structure for storing a user's trip plan.

- **Properties:**
  - `username` (string, required): Username of the user.
  - `destination` (string, required): Destination location.
  - `tripPlan` (string, required): Description or details of the trip plan.
  - `transportOption` (string, required): Selected transportation option.
  - `mealPlan` (string, required): Selected meal plan.
  - `accommodation` (string, required): Selected accommodation.

## Setting Up the NestJS Application

To set up and run the NestJS backend application:

1. **Clone the Repository:**
   ```bash
   git clone <repository-url>
   cd <repository-directory>
   ```

2. **Install Dependencies:**
   ```bash
   yarn install
   ```
   or
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**

   Create a `.env` file in the root directory and add the environment variables as shown in the [Environment Variables](#environment-variables) section.

4. **Run the Application in Development Mode:**
   ```bash
   yarn start:dev
   ```
   or
   ```bash
   npm run start:dev
   ```

   The application will be accessible at `http://localhost:3000`.

5. **Build and Run in Production Mode:**

   Build the application:

   ```bash
   yarn build
   ```
   or
   ```bash
   npm run build
   ```

   Run the application:

   ```bash
   yarn start:prod
   ```
   or
   ```bash
   npm run start:prod
   ```

## Services Overview

### Google Maps API

The application uses the Google Maps API for various functionalities such as fetching places, calculating distances, and retrieving photos.

- **Environment Variable:** `MAP_API_KEY`
- **Documentation:** [Google Maps API Documentation](https://developers.google.com/maps/documentation)

### OpenWeatherMap API

The application uses the OpenWeatherMap API to fetch weather forecasts for specific locations.

- **Environment Variable:** `OPEN_WEATHER_API_KEY`
- **Documentation:** [OpenWeatherMap API Documentation](https://openweathermap.org/api)

### OpenAI API

The application uses the OpenAI API to generate content such as travel blogs.

- **Environment Variable:** `OPENAI_API_KEY`
- **Documentation:** [OpenAI API Documentation](https://platform.openai.com/docs/introduction)

### Clerk (Authentication)

Clerk is used for managing authentication in the app.

- **Environment Variable:** `CLERK_SECRET_KEY`
- **Documentation:** [Clerk Documentation](https://clerk.dev/docs)

### MongoDB

The application uses MongoDB as its database to store trip plans, images, and other data.

- **Environment Variable:** `MONGODB_URI`
- **Documentation:** [MongoDB Documentation](https://docs.mongodb.com/)

## License

This project is licensed under the [MIT License](LICENSE).
