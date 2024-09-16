const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const Profile = require("../models/Profile.model");

let mongoServer;

beforeAll(async () => {
    mongoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri();
    await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
});

afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();
});

describe("Profile Model Test Suite", () => {
    it("should create and save a profile successfully", async () => {
        const validProfile = new Profile({
            user: new mongoose.Types.ObjectId(),
            bio: "Software Developer",
            currentPosition: "Full Stack Developer",
            ironhackClass: "Web Dev Jan 2023",
            abilities: ["JavaScript", "Node.js"],
            email: "test@example.com",
            profilePicture: "http://example.com/picture.jpg",
            githubUrl: "http://github.com/test",
        });

        const savedProfile = await validProfile.save();

        // Test if fields were saved correctly
        expect(savedProfile._id).toBeDefined();
        expect(savedProfile.bio).toBe("Software Developer");
        expect(savedProfile.email).toBe("test@example.com");
        expect(savedProfile.abilities.length).toBe(2);
    });

    it("should add timestamps to the profile", async () => {
        const validProfile = new Profile({
            user: new mongoose.Types.ObjectId(),
            bio: "Software Developer",
            currentPosition: "Full Stack Developer",
        });

        const savedProfile = await validProfile.save();

        expect(savedProfile.createdAt).toBeDefined();
        expect(savedProfile.updatedAt).toBeDefined();
    });
});
