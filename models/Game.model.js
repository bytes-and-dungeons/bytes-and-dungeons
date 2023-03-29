const { Schema, model } = require("mongoose");


// TODO: Please make sure you edit the User model to whatever makes sense in this case
const gameSchema = new Schema(
  {
    gameRoom: {
      type: Number,
      required: true,
      unique: true,
      trim: true,
    },
    playerOneSocketId: { 
        type: String,
        required: true
    },
    playerTwoSocketId: {
        type: String,
        required: true
    },
    playerOneChar: [{
        name: String,
        health: Number,
        strength: Number,
        defense: Number
    }],
    playerTwoChar: [{
        name: String,
        health: Number,
        strength: Number,
        defense: Number
    }],
    playerOneActionState: {
        type: String,
        enum: ['Attack', 'Spell', 'Defense', 'Idle'],
        default: 'Idle'
    },
    playerTwoActionState: {
        type: String,
        enum: ['Attack', 'Spell', 'Defense', 'Idle'],
        default: 'Idle'
    },
    message: {
      type: String,
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Game = model("Game", gameSchema);

module.exports = Game;