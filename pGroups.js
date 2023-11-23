/**
 * A class representing a persistent group of values.
 */
class PGroup {
    /**
     * Constructor for PGroup class.
     * @param {Array} group - The initial array of values for the group.
     */
    constructor(group) {
        if (!Array.isArray(group)) {
            this.group = Array(group);
        } else {
            this.group = group;
        }    
    }

    /**
     * Adds a value to the group and returns a new PGroup instance with the given member added.
     * @param {*} value - The value to be added to the group.
     * @returns {PGroup} - A new PGroup instance with the value added.
     */
    add(value) {
        // Check if the value is already in the group
        if (!this.has(value)) {
            // Create a new PGroup instance with the value added
            return new PGroup(this.group.concat(value));
        }
        // If the value already exists, return the current instance
        return this;
    }

    /**
     * Deletes a value from the group and returns a new PGroup instance without the given member.
     * @param {*} value - The value to be deleted from the group.
     * @returns {PGroup} - A new PGroup instance without the value.
     */
    delete(value) {
        // Check if the value exists in the group
        if (this.has(value)) {
            // Create a new PGroup instance without the value
            return new PGroup(this.group.filter(v => v !== value));
        }
        // If the value doesn't exist, return the current instance
        return this;
    }

    /**
     * Checks if a value exists in the group.
     * @param {*} value - The value to be checked.
     * @returns {boolean} - True if the value exists in the group, false otherwise.
     */
    has(value) {
        return this.group.includes(value);
    }

    /**
     * Static method that returns a new PGroup instance with an empty array.
     * @returns {PGroup} - A new PGroup instance with an empty array.
     */
    static get empty() {
        return new PGroup([]);
    }
}


let group1 = new PGroup("[1, 2, 3]");

let group2 = group1.add(4);
console.log(group2.group); // [1, 2, 3, 4]

let group3 = group2.delete(2);
console.log(group3.group); // [1, 3, 4]

console.log(group3.has(3)); // true
console.log(group3.has(2)); // false

let emptyGroup = PGroup.empty;
console.log(emptyGroup.group); // []