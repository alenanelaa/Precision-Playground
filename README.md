# Precision Playground

## The Game <br>
Inspired by the Gridshot game mode in AimLabs, the player aims and shoots at various targets spread around the environment as fast as possible. The game records the fastest time of the player in a given session, and the goal of the player is to train their aim and achieve the lowest time that they can.

![Precision Playground](https://github.com/alenanelaa/Precision-Playground/blob/master/demo.gif)

## Run the Game

Go to: https://alenanelaa.github.io/Precision-Playground/ <br>
or
1. Download the repository to your local machine
2. Open a terminal in the Precision-Playground directory
3. Run the command `python server.py` (If it says you don't have permission, run the command `chmod +x server.py` first)
4. Open a browser and navigate to the url `http://localhost:8000/`
5. Position the cursor in the center of the crosshair and left click to start the game

## Features
* **First Person Perspective** - player's cursor is locked to the center of the screen and the camera moves according to mouse movements
* **Mouse Picking/Detection** - the game detects when the player's cursor is positioned correctly on click such that a target is hit
* **Dynamic Object Instantiation** - the positions of the targets are randomized each round of the game
* **Game Timer** - game keeps track of the time taken between eliminating the first and last target to measure player's performance
* **Environment Population** - the game environment features various crates, tables, and other props with various textures and shading
* **Texture Coordinate Mapping** - textures applied to objects within environment mapped properly so textures are not stretched/distorted across objects
* **Sound** - the game features toggleable background music as well as sound effects for when each target is hit and when all targets have been hit and the game is complete

## Contributors

Alena Zhu // alena.k.zhu@gmail.com // alenanelaa
- Implemented first person shooter perspective, camera movement, and sound

Raphael Santos // raphaelsantos@g.ucla.edu // raph-santos
- Designed and implemented environment walls and props, applied textures

Andrew Wang // uswangandrew@g.ucla.edu // thanosaw
- Implemented mouse picking, target generation, statistics tracking, and game logic
