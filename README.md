# user-microservice

# User Nicroservice

Simple Microservice for User creation/authentication in Node, express and mongoose.

## Installation

Requires NPM and Mongo

Download the repository and run

```bash
npm install
```


## Defaults
the service makes use of global variables. If they don't exist values from the config/defaults file will be used.

## User Container
The application can be run as a docker container. The environment variabe are in the  .env

To build the container run following command in the 

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