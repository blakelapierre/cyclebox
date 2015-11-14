# [cycle.js](http://cycle.js.org/) x [mathbox](https://gitgud.io/unconed/mathbox)

Testing an integration between the above two libraries.

I've barely worked with cycle.js, but am familiar with FRP. I've been looking for a new web framework, so this is project is currently just a demo application to explore some possibilities.

The current demo application computes which integers divide which other integers, which you can slice through in a couple ways.



[demo](http://blakelapierre.github.io/cyclebox/)


![screen.png](screen.png)


---------------

 First, make sure you have gulpur installed so that you can use ECMAScript 6 features in the gulpfile. This allows more concise syntax and is thus easier to read.


`npm install -g gulpur`

[Note: there is another way to do this with gulp and/or babel. Should investigate. I believe it requires changing the name of the gulpfile though.]

##### Install
````
git clone https://github.com/blakelapierre/cyclebox
cd cyclebox
./install.sh
cd frontend
````


##### Development
During development use the `dev` task to launch a browser window pre-wired to live reload instantly when you modify the source (HTML/LESS/JS).

`gulpur dev`


##### Build
Produce a concatenated, minified, distributable directory.

`gulpur build`

The output is placed in `frontend/.dist`.


---------------
Pull Requests, Issues, and all other Contributions are welcome and encouraged. The goal of this project is to be a base to facilitate the rapid development of websites, either for personal projects, or for widespread distribution.