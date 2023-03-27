module.exports = (character, healthPoints, strengthPoints, defensePoints) => {

    const newExpPoints = character.experiencePoints - (healthPoints + strengthPoints + defensePoints);

    const newHealth = character.healthPoints + healthPoints * 25;
    const newStrength = character.strength + strengthPoints * 15;
    const newDefense = character.defense + defensePoints * 5;

    return {
        healthPoints: newHealth,
        strength: newStrength,
        defense: newDefense,
        experiencePoints: newExpPoints
    };
}