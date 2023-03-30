const { Schema, model } = require("mongoose");

// TODO: Please make sure you edit the User model to whatever makes sense in this case
const userSchema = new Schema(
  {
    username: {
      type: String,
      required: false,
      unique: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
    },
    ownedCharacters: {
      type: [Schema.Types.ObjectId],
      ref: "Character",
    },
    userIconImgUrl: {
      type: String,
      required: true,
    },
    bannerImgUrl: {
      type: String,
      required: true,
      default: '/images/banner.png'
    }
  },
  {
    // this second object adds extra properties: `createdAt` and `updatedAt`
    timestamps: true,
  }
);

const User = model("User", userSchema);

module.exports = User;
