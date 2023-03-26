const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const characterSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    characterClass: {
      type: String,
      enum: ["Bard", "Fighter", "Wizard"],
    },
    level: {
      type: Number,
      min: 1,
    },
    description: {
      type: String,
      maxlength: 5000,
    },
    healthPoints: {
      type: Number,
      required: true,
    },
    strength: {
      type: Number,
      min: 0,
      required: true,
    },
    defense: {
      type: Number,
      min: 0,
      required: true,
    },
    experiencePoints: {
      type: Number,
      min: 0,
      default: 0,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const Character = model("Character", characterSchema);

module.exports = Character;
