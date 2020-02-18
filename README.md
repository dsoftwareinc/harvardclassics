<h1 align="center">Welcome to Harvard Classics 👋</h1>
<p>
  <img src="https://img.shields.io/badge/version-1.0.0-blue.svg?cacheSeconds=2592000" />
  <a href="https://github.com/cunla/harvardclassics2/blob/master/LICENSE">
    <img alt="License: MIT" src="https://img.shields.io/badge/License-MIT-yellow.svg" target="_blank" />
  </a>
</p>

> A progressive webapp that allows you to read Harvard Classics
<p align="center">
  <img src="screenshots/menu.png" width="300" title="Menu page">
  <img src="screenshots/today.png" width="300" title="Today reading">
  <img src="screenshots/month.png" width="300" alt="Monthly summary">
</p>


### 🏠 [Homepage](http://harvardclassics365.firebaseapp.com)

## Install


* Make sure you have nodejs and npm installed, check that using `npm -v`
* Install ionic 4 if you haven't already, run `sudo npm -g i ionic`, it will ask you for your user password
* Check that you have the latest ionic client installed, run `ionic -v`, the version when writing this is 4.6.0
* Checkout this repository using `git clone https://github.com/cunla/harvardclassics2`, project will be 
cloned to a directory `harvardclassics2` under the directory where you ran the command
* Run `npm install` to download all dependencies
* Run `ionic serve`
* Go in your browser to the address `http://localhost:8100`
* To develop this you can use any IDE you want, I used [Webstorm](https://www.jetbrains.com/webstorm/?fromMenu)

In order to use the DB functionality set up `environment.ts` using your backbase settings.

```typescript
export const environment = {
    production: false,
    firebase: {
        apiKey: 'AIzaSyBqFThhFkJF_8FFgzdg1LIsvhixhz30-G8',
        authDomain: 'harvardclassics365.firebaseapp.com',
        databaseURL: 'https://harvardclassics365.firebaseio.com',
        projectId: 'harvardclassics365',
        storageBucket: 'harvardclassics365.appspot.com',
        messagingSenderId: '319043773098'
    },
};
```


## Usage

```sh
npm run start
```

## Author

👤 **Daniel &amp; Natalia Moran**

* Github: [@cunla](https://github.com/cunla)

## 🤝 Contributing

Contributions, issues and feature requests are welcome!<br />Feel free to check [issues page](https://github.com/cunla/harvardclassics2/issues).

## Show your support

Give a ⭐️ if this project helped you!

## 📝 License

Copyright © 2019 [Daniel &amp; Natalia Moran](https://github.com/cunla).<br />
This project is [MIT](https://github.com/cunla/harvardclassics2/blob/master/LICENSE) licensed.

***
_This README was generated with ❤️ by [readme-md-generator](https://github.com/kefranabg/readme-md-generator)_
