// src/DataManager.js
export class DataManager {
    constructor(saveKey) {
        this.saveKey = saveKey;
    }

    save(data) {
        try {
            const json = JSON.stringify(data);
            localStorage.setItem(this.saveKey, json);
            console.log("Game saved successfully!");
        } catch (error) {
            console.error("Failed to save game:", error);
        }
    }

    load() {
        try {
            const json = localStorage.getItem(this.saveKey);
            if (json) {
                console.log("Loading saved game...");
                return JSON.parse(json);
            }
            return null;
        } catch (error) {
            console.error("Failed to load game:", error);
            return null;
        }
    }
}