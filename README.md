# Harvard Classics progressive webapp

## Introduction

A progressive webapp that allows you to read HarvardClassics, mark notes and track progress. The app is deployed here: http://harvardclassics365.firebaseapp.com

The Harvard Universal Classics, originally known as Dr. Eliot's Five Foot Shelf, is a 51-volume anthology of classic works from world literature, compiled and edited by Harvard University president Charles W. Eliot and first published in 1909.

Eliot had stated in speeches that the elements of a liberal education could be obtained by spending 15 minutes a day reading from a collection of books that could fit on a five-foot shelf. (Originally he had said a three-foot shelf.) The publisher P. F. Collier and Son saw an opportunity and challenged Eliot to make good on this statement by selecting an appropriate collection of works, and the Harvard Classics was the result.

## Code Samples

The app starts `AppComponent`, which contains also the menu with links to other pages

### TodayPage
An view that contains a daily reading.

If the day parameter is not given to the view, it calculates today's date.

### MonthPage
Contains cards with links to daily readings.

### AnalyticsProvider
Google Analytics provider for app

### MaterialService
Service to fetch data about daily readings


## Installation

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
