harvardclassics app
===================

# Create environment
* Make sure you have nodejs and npm installed, check that using `npm -v`
* Install ionic 4 if you haven't already, run `sudo npm -g i ionic`, it will ask you for your user password
* Check that you have the latest ionic client installed, run `ionic -v`, the version when writing this is 4.6.0
* Checkout this repository using `git clone https://github.com/cunla/harvardclassics2`, project will be 
cloned to a directory `harvardclassics2` under the directory where you ran the command
* Run `npm install` to download all dependencies
* Run `ionic serve`
* Go in your browser to the address `http://localhost:8100`
* To develop this you can use any IDE you want, I used [Webstorm](https://www.jetbrains.com/webstorm/?fromMenu)

# Different views

### AppComponent
The app starts in this page, which contains also the menu with links to other pages

### TodayPage
An view that contains a daily reading.

If the day parameter is not given to the view, it calculates today's date.

### MonthPage
Contains cards with links to daily readings.

# Services

### AnalyticsProvider
Google Analytics provider for app

### MaterialService
Service to fetch data about daily readings
