### Windows Setup

To set the script shell on Windows, run:
```sh
npm config set script-shell "C:\\Program Files\\git\\bin\\bash.exe"
```

### Running Locally

1. Create a `.env` file based on `.env.template` and configure your PostgreSQL and Redis instances.

### Install Dependencies

To install the necessary dependencies, run:
```sh
npm install
```

### Generate Prisma Client

To generate the Prisma client, run:
```sh
npm run client
```

### Start the Server

To start the server in development mode, run:
```sh
npm run dev
```

## Testing the API

Open the `bruno-collection` folder with [Bruno](https://www.usebruno.com/).

## Available Scripts

In the project directory, you can run the following scripts:

### `npm run dev`

Starts the app in development mode.\
Open [http://localhost:80](http://localhost:80) to view it in the browser.

### `npm start`

Starts the app in production mode.

### `npm run test`

Runs the test cases.

