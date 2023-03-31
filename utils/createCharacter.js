//Function to create a new character for a user
//The Name, Description, Class and Image of the new Character are chosen by the user
//The remaining stats are picked randomly

const Character = require("../models/Character.model");

module.exports = (ownerId, characterName,  characterDescription, characterClass, charImgUrl) => {
  const healthPoints = Math.ceil(500 + Math.random() * 250);
  const strength = Math.ceil(15 + Math.random() * 15);
  const defense = Math.ceil(4 + Math.random() * 5);

  const characterData = {
    name: characterName,
    characterClass,
    level: 1,
    description: characterDescription,
    healthPoints,
    strength,
    defense,
    experiencePoint: 0,
    owner: ownerId,
    charImgUrl
  };

  return characterData;
};
