//Function to claculate the new Stats of a Character, after being Upgraded

module.exports = (character, healthPoints, strengthPoints, defensePoints) => {

    const newExpPoints = character.experiencePoints - (healthPoints + strengthPoints + defensePoints);
    const newLevel = character.level + (healthPoints + strengthPoints + defensePoints);

    const newHealth = character.healthPoints + healthPoints * 15;
    const newStrength = character.strength + strengthPoints * 10;
    const newDefense = character.defense + defensePoints * 5;

    return {
        healthPoints: newHealth,
        strength: newStrength,
        defense: newDefense,
        experiencePoints: newExpPoints,
        level: newLevel
    };
}