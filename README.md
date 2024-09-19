# MC Web Tools

React app created with typescript and displays a selection of various web tools

### Included web tools:

### 🐼 Terrain Verification app

* Cesium map with a terrain provider

* Height tool

* Inspector tool

### 🐼 Reference to Nominatim app

* OpenStreetMap

* A tool to search OSM data by name or address (geocoding) and to generate synthetic addresses of OSM points (reverse geocoding)

### 🐼 Reference to Valhalla app

* OpenStreetMap

* A routing engine and accompanying libraries for use with OSM data

* Tools like time+distance matrix computation, isochrones, elevation sampling, map matching and tour optimization (Travelling Salesman)

### 🐼 Reference to Developer Portal app

* MapColonies Documentation

* Getting started guide

* Release Notes

* OGC Protocols

### 🐼 Reference to Cesium-Sandcastle app

* Cesium map

* A live-coding area

* CesiumJS examples

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app)


## Installation

Install deps with yarn

```bash
yarn
```

Run confd

```bash
yarn confd
```

To generate:  
public/env-config.js  <- For env variables  
public/index.html  <- For PUBLIC_URL, to support non-root URL  
  
Start app

```bash
yarn start
```

Or

```bash
yarn global add serve
yarn build
npx serve -s build
```

Open [http://localhost:3000](http://localhost:3000)

## Running Tests

To run tests, run the following command

```bash
yarn test
```

It will run in an interactive mode  
See [running tests](https://facebook.github.io/create-react-app/docs/running-tests)

## Preparing for deployment

To prepare the code for deployment, run the following command

```bash
yarn build
```

It bundles react app with production mode and optimizes performance

See [deployment](https://facebook.github.io/create-react-app/docs/deployment)

## Init configuration inside a docker

To use app env variables inside a docker, run the following command

```bash
node ./confd/generate-config.js --environment production --indocker
```

## Deployment

See [helm values](https://github.com/MapColonies/helm-common/blob/c352a2453117895ec0f9df0267a66d6f5b9c2da2/README.md)
