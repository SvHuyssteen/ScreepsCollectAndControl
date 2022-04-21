import { prototypes, utils, constants } from "/game";

const unitCost = {
  Harvester: 200,
};

export function spawnCreep(spawnPoint, energy, creepType) {
  switch (creepType) {
    case "basicHarvester":
      if (energy > unitCost.Harvester) {
        console.log(
          "request for harvester deployment successfull, starting build"
        );
        //logic for eco creep spawn
        const creep = spawnPoint.spawnCreep([
          constants.WORK,
          constants.CARRY,
          constants.MOVE,
        ]).object;
        creep.role = "basicHarvester";
        creep.class = "eco";
        creep.order = "default";
        creep.action = "idle";
      }
      break;
  }
}

//build workers
