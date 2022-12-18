#!/usr/bin/env node

import { GameServer } from "./game-server";

const server = new GameServer();
server.startGameEngine();