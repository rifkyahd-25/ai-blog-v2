import mongoose from "mongoose";

// One doc per device. No user accounts needed for this — readers are
// anonymous, so a token is just "a device that wants new-post alerts".
const pushTokenSchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true },
    platform: { type: String, enum: ["ios", "android", "web"], default: "android" },
  },
  { timestamps: true }
);

export default mongoose.model("PushToken", pushTokenSchema);
