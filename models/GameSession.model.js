const { Schema, model } = require("mongoose");


// TODO: Please make sure you edit the User model to whatever makes sense in this case
const gameSessionSchema = new Schema(
  {
    socketId: {
      type: String,
      required: false,
      unique: true,
      trim: true,
    },
    selectedCharacter: {
      type: Schema.Types.ObjectId,
      ref: "Character"
    },
    isReady: {
        type: Boolean,
        default: false
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const GameSession = model("GameSession", gameSessionSchema);

module.exports = GameSession;