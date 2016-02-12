//STRATEGY
// ==============================

// Initially cars have no scheduled picks, so for each car we pick a “ride” 
// who’s total distance (vehicle -> origin -> destination) is minimized 
// for the current location of the car.
// 
// Once we reach the origin of our first customer we pick him up and 
// check if there are any people in the building that we can take along for 
// the ride. To do this, we use the “peoples” and “picks” queue. We calculate the 
// time it’ll take to drop off everyone we’ve committed to and then add the extra 
// people if the time allows.


// RUNTIME
// ==============================
// v = # vehicles
// p = # people
// b = # buildings
// vp           to find best ride
// vp           to check riders in building
// So vp + vp -> O(vp)



// DATA STRUCTS
// =================================
building_dict = {
    "A":0,
    "B":1,
    "C":2,
    "D":3,
    "E":4,
    "F":5,
    "G":6
};

vehicle_picks = {
    "one":      [],
    "two":      [],
    "three":    [],
    "four":     [],
    "five":     [],
}

scheduled_for_pickup = {};

// PROGRAM
// =================================

// Runs once for every unit of time

// @param [Vehicle]   vehicles
// @param [People]    peoples
// @param [Building]  buildings

function turn(vehicles,peoples,buildings) {  

    for (i in vehicles) {
        vehicle = vehicles[i];
        
        // FINDING NEXT CUSTOMER
        // =================================
        // We pick the customer that results in the shortest total trip
        // We need to pick him up before he starts walking
        
        if (!onPickupRun(vehicle) && !hasPassenger(vehicle)) {
            bestPickup   = [null,Infinity];
            for (j in peoples) {

                person        = peoples[j];
                destination   = buildings[building_dict[person.destination]];
                tripDistance  = totalTripDistance(vehicle,person,destination);
                distanceToPickup = distance(vehicle, person);
                // People walk slower, hence *2
                pickupDeadline = person.time - distance(person, destination) * 2;
                if  (!(person.name in scheduled_for_pickup) &&
                    tripDistance    <   bestPickup[1]       &&
                    tripDistance    <=  person.time         &&
                    pickupDeadline  >   distanceToPickup) {
                     bestPickup = [person,tripDistance]
                }
            }

            person = bestPickup[0]
            // Add shortest pickup to picks
            if (person != null) {
              scheduled_for_pickup[person.name] = vehicle.name;
              vehicle_picks[vehicle.name].push(person);
            }
        }

        // MOVING CARS ALONG
        // =============================

        if (onPickupRun(vehicle)) {
            personToPickup = vehicle_picks[vehicle.name][0];

            if (inSamePosition(vehicle,personToPickup) && !("vehicle" in personToPickup)) {
              origin        = buildings[building_dict[personToPickup.origin]];
              destination   = buildings[building_dict[personToPickup.destination]];
              vehicle.pick(personToPickup);
              vehicle_picks[vehicle.name].shift(); // Remove the person from pickup queue
              checkForRiders(vehicle,peoples,origin,buildings);
            } else {
              vehicle.moveTo(personToPickup);
            }
        } else if (hasPassenger(vehicle)) {
              passenger     = vehicle.peoples[0];
              destination   = buildings[building_dict[passenger.destination]];
              vehicle.moveTo(destination);
        }

    }
}


// Pick up any people that are in the current building
// and we know we can drop off eventually.

// @param {Vehicle}   vehicle
// @param [People]    peoples
// @param {Building}  building
// @param [Building]  buildings

function checkForRiders(vehicle,peoples,building,buildings) {

    if (inSamePosition(vehicle, building)) {

        // Consider passengers from previous origins
        passengers          = vehicle.peoples;
        timeToDropCurrentPassengers = 0;
        consideredLocation          = { x:vehicle.x, y:vehicle.y };

        for (i in passengers) {
          passenger     = passengers[i];
          destination   = buildings[building_dict[passenger.destination]];
          timeToDropCurrentPassengers += distance(consideredLocation,destination);
          consideredLocation.x = destination.x
          consideredLocation.y = destination.y
        }

        // Consider passenger(s) we just picked up in current location
        picksHere = vehicle.picks;
        for (i in picksHere) {
            namePerson = picksHere[i];
            person = findPerson(namePerson,peoples);
            if (person != null) {
                destination = buildings[building_dict[person.destination]];
                timeToDropCurrentPassengers += distance(consideredLocation,destination);
                consideredLocation.x = destination.x
                consideredLocation.y = destination.y
            }
        }

        lastScheduledDropLocation = consideredLocation;

        for (i in peoples) {
            person                  = peoples[i];
            destination             = buildings[building_dict[person.destination]];
            totalTimeToDestination  = timeToDropCurrentPassengers + distance(lastScheduledDropLocation,destination);
            if (!(person.name in scheduled_for_pickup)  && 
              person.origin == building.name            && 
              person.time  >= totalTimeToDestination    &&
              !(personInList(person,passengers))        &&
              !(personInList(person,picksHere))) 
            {
                vehicle.pick(person);
                timeToDropCurrentPassengers   = totalTimeToDestination;
                lastScheduledDropLocation     = destination;
            }
        }
    }
}

// HELPERS
// ==================================

function distance(obj1, obj2) {
    return Math.abs(obj1.x - obj2.x) + Math.abs(obj1.y - obj2.y);
}

function totalTripDistance(vehicle,person,destination) {
    return distance(vehicle,person) + distance(person,destination);
}

function inSamePosition(obj1, obj2) {
    return (obj1.x == obj2.x && obj1.y == obj2.y);
}

function onPickupRun(vehicle) {
  return vehicle_picks[vehicle.name].length > 0;
}

function hasPassenger(vehicle) {
  return vehicle.peoples.length > 0;
}

function personInList(person,people) {
  for (i in people) {
    p = people[i];
    if (person.name == p.name) {
      return true;
    }
  }

  return false
}

function findPerson(name,peoples) {
  for (i in peoples) {
    person = peoples[i];
    if (person.name == name) {
      return person
    }
  }
  return null
}

