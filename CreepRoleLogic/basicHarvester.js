import { prototypes, utils, constants, visual } from "/game";

export function creepLogic(listBasicHarvester, mySource, mySpawn) {
  for (let creep of listBasicHarvester) {
    if (creep.action == "idle") {
      creep.action = "harvesting";
      console.log(
        "harvester with id of: ",
        creep.id,
        "moving from idle stage to harvesting"
      );
    } else if (
      creep.action == "depositing" &&
      creep.store.getUsedCapacity(constants.RESOURCE_ENERGY) == 0
    ) {
      creep.action = "harvesting";
      console.log(
        "harvester with id of: ",
        creep.id,
        "moving from depositing to harvesting"
      );
    } else if (
      creep.action == "harvesting" &&
      creep.store.getFreeCapacity(constants.RESOURCE_ENERGY) == 0
    ) {
      console.log(
        "harvester with id of: ",
        creep.id,
        "moving from harvesting to depositing"
      );
      creep.action = "depositing";
    }

    //check if the harvester is full and needs to deposit

    //check if the harvester needs to harvest
    if (creep.action == "harvesting") {
      if (creep.harvest(mySource) == constants.ERR_NOT_IN_RANGE) {
        creep.moveTo(mySource);
      } else {
        creep.harvest(mySource);
      }
    }

    if (creep.action == "depositing") {
      if (
        creep.transfer(mySpawn, constants.RESOURCE_ENERGY) ==
        constants.ERR_NOT_IN_RANGE
      ) {
        creep.moveTo(mySpawn);
      } else {
        creep.transfer(mySpawn, constants.RESOURCE_ENERGY);
      }
    }
  }
}
