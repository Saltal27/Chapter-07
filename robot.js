/***************** DEFINING VILLAGE ROADS *****************/
var roads = [
    "Alice's House-Bob's House", "Alice's House-Cabin",
    "Alice's House-Post Office", "Bob's House-Town Hall",
    "Daria's House-Ernie's House", "Daria's House-Town Hall",
    "Ernie's House-Grete's House", "Grete's House-Farm",
    "Grete's House-Shop", "Marketplace-Farm",
    "Marketplace-Post Office", "Marketplace-Shop",
    "Marketplace-Town Hall", "Shop-Town Hall"
];

/**
 * Builds a graph representation of the road network based on the given edges.
 * @param {Array} edges - The array of road connections between locations.
 * @returns {Object} - The graph representation of the road network.
 */
function buildGraph(edges) {
    let graph = Object.create(null);

    function addEdge(from, to) {
        if (graph[from] == null) {
            graph[from] = [to];
        } else {
            graph[from].push(to);
        }
    }
    for (let [from, to] of edges.map(r => r.split("-"))) {
        addEdge(from, to);
        addEdge(to, from); // Since the roads are bidirectional, add the reverse edge as well.
    }
    return graph;
}

var roadGraph = buildGraph(roads);

var mailRoute = [
    "Alice's House", "Cabin", "Alice's House", "Bob's House",
    "Town Hall", "Daria's House", "Ernie's House",
    "Grete's House", "Shop", "Grete's House", "Farm",
    "Marketplace", "Post Office"
];



/***************** DEFINING ROBOTS *****************/
/* random robot */
/**
 * Picks a random element from the given array.
 * @param {Array} array - The input array from which to pick a random element.
 * @returns {*} - A randomly selected element from the input array.
 */
function randomPick(array) {
    let choice = Math.floor(Math.random() * array.length);
    return array[choice];
}

/**
 * Implements a robot that makes random moves in the village's road network.
 * @param {Object} state - The current state of the village.
 * @returns {Object} - The next random move to be taken by the robot.
 */
function randomRobot(state) {
    return {
        direction: randomPick(roadGraph[state.place]) // Return a random direction from the current place's neighbors.
    };
}

/* route robot */
/**
 * Implements a robot that follows a predefined route to deliver parcels.
 * @param {Object} state - The current state of the village.
 * @param {Array} memory - The memory or state of the robot.
 * @returns {Object} - The next action to be taken by the robot.
 */
function routeRobot(state, memory) {
    if (memory.length == 0) { // If the memory is empty, initialize it with the predefined mail route.
        memory = mailRoute;
    }
    return {
        direction: memory[0], // Return the first step of the route as the next direction.
        memory: memory.slice(1) // Update the memory with the remaining steps of the route.
    };
}

/* goal oriented robot */
/**
 * Finds the shortest route from the 'from' node to the 'to' node in the given graph.
 * @param {Object} graph - The graph representing the village's road network.
 * @param {string} from - The starting node of the route.
 * @param {string} to - The destination node of the route.
 * @returns {Array} - The shortest route from 'from' to 'to' in the graph.
 */
function findRoute(graph, from, to) {
    let work = [{
        at: from,
        route: []
    }];
    for (let i = 0; i < work.length; i++) {
        let {
            at,
            route
        } = work[i];
        for (let place of graph[at]) {
            if (place == to) return route.concat(place); // If the destination is reached, return the route.
            if (!work.some(w => w.at == place)) { // If the node has not been visited before, add it to the work list.
                work.push({
                    at: place,
                    route: route.concat(place)
                });
            }
        }
    }
}

/**
 * Implements a robot that uses a goal-oriented approach to deliver parcels.
 * @param {Object} state - The current state of the village.
 * @param {Array} route - The current route of the robot.
 * @returns {Object} - The next action to be taken by the robot.
 */
function goalOrientedRobot({
    place,
    parcels
}, route) {
    if (route.length == 0) { // If there is no current route, find a new one.
        let parcel = parcels[0];
        if (parcel.place != place) {
            route = findRoute(roadGraph, place, parcel.place); // Find a route to the parcel's place.
        } else {
            route = findRoute(roadGraph, place, parcel.address); // Find a route to the parcel's address.
        }
    }
    return {
        direction: route[0], // Return the first step of the route as the next direction.
        memory: route.slice(1) // Update the memory with the remaining steps of the route.
    };
}

/* nearest parcel robot */
/**
 * Sorts the parcels based on the steps needed to reach their respective places from the given location.
 * @param {string} place - The current location from which the parcels are to be sorted.
 * @param {Array} parcels - An array of parcels to be sorted based on their route length.
 * @returns {Array} - An array of sorted parcels based on the steps needed to reach their respective places.
 */
function sortParcels(place, parcels) {
    // Map each parcel to its route length from the given location
    let sortedParcels = parcels.map(p => {
            let parcelRoute = findRoute(roadGraph, place, p.place)
            return {
                place: p.place,
                address: p.address,
                stepsNeededToGet: parcelRoute.length
            };
        })
        // Sort the parcels based on the steps needed to reach their respective places
        .sort((a, b) => a.stepsNeededToGet - b.stepsNeededToGet);
    return sortedParcels;
}

/**
 * Represents a robot that delivers parcels by prioritizing the nearest parcel and generating the most efficient route to deliver it.
 * @param {object} location - An object containing the current location and the list of parcels to be delivered.
 * @param {Array} route - An array representing the route to be taken by the robot.
 * @returns {object} - An object containing the direction and memory for the robot to execute the next step in the route.
 */
function nearestParcelRobot({
    place,
    parcels
}, route) {
    // If the robot has reached its destination and has no more steps in the route
    if (route.length == 0) {
        // Sort the parcels based on the steps needed to reach their respective places
        let sortedParcels = sortParcels(place, parcels);
        // Get the nearest parcel
        let parcel = sortedParcels[0];
        // If the nearest parcel is not at the current location, generate a route to the parcel's place
        if (parcel.place != place) {
            route = findRoute(roadGraph, place, parcel.place);
        } else { // Otherwise, generate a route to the parcel's address
            route = findRoute(roadGraph, place, parcel.address);
        }
    }
    // Return the next step in the route
    return {
        direction: route[0],
        memory: route.slice(1)
    };
}



/***************** RUNNING A ROBOT *****************/
/**
 * Represents the state of the village with a current place and parcels to be delivered.
 * @param {string} place - The current place of the robot.
 * @param {Array} parcels - The parcels to be delivered.
 */
var VillageState = class VillageState {
    constructor(place, parcels) {
        this.place = place;
        this.parcels = parcels;
    }

    /**
     * Moves the robot to the specified destination and updates the parcels accordingly.
     * @param {string} destination - The destination to move to.
     * @returns {VillageState} - The updated VillageState after the move.
     */
    move(destination) {
        if (!roadGraph[this.place].includes(destination)) {
            return this; // If the destination is not reachable, return the current state.
        } else {
            let parcels = this.parcels.map(p => {
                if (p.place != this.place) return p;
                return {
                    place: destination,
                    address: p.address
                };
            }).filter(p => p.place != p.address);
            return new VillageState(destination, parcels); // Return a new VillageState after the move.
        }
    }
}

/**
 * Generates a random VillageState with the specified number of parcels.
 * @param {number} parcelCount - The number of parcels to be generated (default is 5).
 * @returns {VillageState} - The randomly generated VillageState.
 */
VillageState.random = function (parcelCount = 5) {
    let parcels = [];
    for (let i = 0; i < parcelCount; i++) {
        let address = randomPick(Object.keys(roadGraph));
        let place;
        do {
            place = randomPick(Object.keys(roadGraph));
        } while (place == address);
        parcels.push({
            place,
            address
        });
    }
    return new VillageState("Post Office", parcels); // Return a new VillageState with the generated parcels.
};

/**
 * Runs the specified robot on the given state and returns the number of moves taken to deliver all parcels.
 * @param {VillageState} state - The initial state of the village.
 * @param {function} robot - The robot function to be run.
 * @param {any} memory - The memory or state of the robot.
 * @returns {number} - The number of moves taken to deliver all parcels.
 */
function runRobot(state, robot, memory) {
    for (let turn = 0;; turn++) {
        if (state.parcels.length == 0) {
            // console.log(`Done in ${turn} turns`);
            return (turn); // If all parcels are delivered, return the number of turns.
        }
        let action = robot(state, memory); // Get the next action from the robot.
        state = state.move(action.direction); // Move the robot to the specified direction.
        memory = action.memory; // Update the memory/state of the robot.
        // console.log(`Moved to ${action.direction}`);
    }
}



/***************** COMPARING TWO ROBOTS *****************/
/**
 * Compares the performance of two robots by running them on randomly generated tasks and calculating their average moves.
 * @param {function} robot1 - The first robot function to be compared.
 * @param {Array} robot1StartingMemory - The starting memory for the first robot.
 * @param {function} robot2 - The second robot function to be compared.
 * @param {Array} robot2StartingMemory - The starting memory for the second robot.
 * @param {number} parcelsNumPerTask - The number of parcels per task (default is 5).
 */
function compareRobots(robot1, robot1StartingMemory, robot2, robot2StartingMemory, parcelsNumPerTask = 5) {
    // Generate 100 random tasks with the specified number of parcels
    let tasks = [];
    let robot1TasksMoves = [];
    let robot2TasksMoves = [];

    for (let i = 0; i < 100; i++) {
        tasks.push(VillageState.random(parcelsNumPerTask));
    }

    // Run each robot on the generated tasks and record the number of moves for each task
    for (let task of tasks) {
        robot1TasksMoves.push(runRobot(state = task, robot = robot1, memory = robot1StartingMemory));
        robot2TasksMoves.push(runRobot(state = task, robot = robot2, memory = robot2StartingMemory));
    }

    // Calculate the total moves and average moves for each robot
    let robot1TotalMoves = robot1TasksMoves.reduce((n1, n2) => {
        return n1 + n2;
    })
    let robot1Average = Math.round(robot1TotalMoves / robot1TasksMoves.length);
    let robot2TotalMoves = robot2TasksMoves.reduce((n1, n2) => {
        return n1 + n2;
    })
    let robot2Average = Math.round(robot2TotalMoves / robot2TasksMoves.length);

    // Display the average moves for each robot
    console.log("The first robot takes an average of " + robot1Average + " moves to deliver " + parcelsNumPerTask + " parcels.");
    console.log("The second robot takes an average of " + robot2Average + " moves to deliver " + parcelsNumPerTask + " parcels.");
}



let robot1 = randomRobot;
let robot2 = routeRobot;
let robot3 = goalOrientedRobot;
let robot4 = nearestParcelRobot;

compareRobots(robot4, [], robot3, []);

