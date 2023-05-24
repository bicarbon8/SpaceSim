# Spaceship Game (space-sim)
origially an experiment to create a 3D Spaceship Simulator, this project is now a 2D multiplayer Spaceship shooter game made with Phaser.io that serves as a way of developing new skills and testing out different approaches to solving game problems

## Project Structure
this project uses a monorepo architecture where the client and server parts of the game are split into two separate projects, `space-sim-client` and `space-sim-server`, under the `./projects/client` and `./projects/server` directories respectively and a third shared project, `space-sim-shared`, which contains components used in both the client and server is under the `./projects/shared` directory.

## Build Process
the build process must first build the shared project since it is used in both of the other projects, but they can be built in any order after building `space-sim-shared`. when running locally you should use the `npm run start:dev` command as this will first build shared and then startup both the client and server projects running on localhost ports `4500` and `8081` respectively. for running in production use the `npm run build` command followed by `npm run open -w space-sim-server` to start the game server on port `8081` and deploy the `./docs` directory to your static site server.

## Future
- provide a customisation scene in the game allowing players to specify the look of their ship as well as the attached engine and weapon specifications
- develop a more fleshed out _Singleplayer_ mode
- implement more _Multiplayer_ game modes like 1v1, team battles, timed battle royale
- implement a _Multiplayer_ lobby where players can wait for their games to start or choose their opponents (for modes like 1v1)
- better UI