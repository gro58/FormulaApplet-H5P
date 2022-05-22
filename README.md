# FormulaApplet-H5P
* is a fork of FormulaApplet
* with goal to get rid of all pure HTML related code, <del>especially the fApp object</del> 'Done!'
* simplifying code 
* lets you create math or physics exercises on HTML pages or in Wikis. 
* You can provide an expression as solution, and FormulaApplet checks if your solution is right or wrong.
* Algebraic equivalent solutions are also accepted.
* FormulaApplet is able to deal with physical units.
* FormulaApplet is open source. It is written in JavaScript and uses some open source libraries.
* FormulaApplet is the successor of Formel-Applet (Java, closed source).
* [ToDo list](./md/ToDo.md) for FormulaApplet-H5P
* [FormulaApplet wiki](https://github.com/gro58/FormulaApplet-H5P/wiki)
* [Docs](https://raw.githack.com/gro58/FormulaApplet-H5P/master/main/docs/index.html) generated by jsdoc.js - Work in progress
## FormulaApplet_H5P is still under development (especially the H5P part).
* Using semantic versioning, the major version number has been changed to zero to express the development state of the project.
* Version number of FormulaAppletEditor and FormulaApplet has been changed from 0.12.x to 0.13.x

# H5P Plugin
## General
* There is an H5P plugin for the FormulaApplet with which you can put FormulaApplet tasks on pages with H5p support.
* You need the H5P.FormulaApplet and the H5P.FormulaAppletEditor plugin for this to work.
## H5P Development environment
* In the h5p folder there is a Docker environment for a Drupal instance with H5P installed on which you can test the plugin.
* First-time installation for the Docker development environment:
  1. [Install Docker](https://docs.docker.com/get-docker/) and Docker Compose (might be included with docker).
  1. Run the following command in the `h5p` directory: `docker compose build` (might take a while), then `docker compose up`. If `docker compose` is not available, use `docker-compose`.
  1. Open http://localhost:8080. Start the setup for Drupal. If you need account credentials, use username `admin` with password `admin`. 
  1. Follow [the steps to set up H5P development](https://h5p.org/development-environment-docker#:~:text=Enabling%20H5P%20development%20mode%20and%20development%20folder) (under "Enabling H5P development mode and development folder").
  1. Now start the JavaScript Bundler (Rollup) build in H5P development mode by running `npm run h5p` in the `main` folder. This will automatically build the plugin scripts, copy them into the plugin development folders and should auto-refresh the Drupal page when code is changed.
  1. Now "create content" in Drupal and choose the FormulaApplet plugin.
