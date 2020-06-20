# user-microservice

Simple Microservice for User creation/authentication in Node, express and mongoose.

## Installation

Requires NPM and Mongo. Each service will use it's own schema. by default. you can change that behavior by changing the config/defaults.js 

Download the repository and run the following command in the /api directory

```bash
npm install 
```

Then

```bash
nodemon server
```


## Defaults
the service makes use of global variables. If they don't exist values from the config/defaults file will be used.

## User Container
The application can be run as a docker container. The environment variabe are in the  .env

To build the container run following command in /api directory

```bash
docker-compose up
```

## To do
Move the authentication to an API gate way
Vendor micro service

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## License
[MIT](https://choosealicense.com/licenses/mit/)