class BusSchedule {
  constructor(fis) {
    this.fis = fis;
  }

  getDeparture(k) {
    return BusSchedule.FIRST_TRIP + BusSchedule.INTERVAL * k;
  }

  // Finds the first bus that reaches the user's location at or after currentTime.
  // Returns null if no bus is left for the day.
  findNextBus(dist, currentTime) {
    for (let k = 0; k < BusSchedule.NUM_TRIPS; k++) {
      const departure = this.getDeparture(k);
      const label = this.fis.defuzzify(departure, dist);
      const travelMin = this.fis.getTravelTime();
      const arrival = departure + travelMin / 60.0;

      if (arrival >= currentTime)
        return {
          departure,
          travelMin,
          label,
          arrival,
          waitMin: (arrival - currentTime) * 60.0,
        };
    }
    return null;
  }
}

BusSchedule.FIRST_TRIP = 4.5; // 4:30 AM
BusSchedule.INTERVAL = 0.5; // 30 minutes
BusSchedule.NUM_TRIPS = 27; // 4:30 AM to 5:30 PM
BusSchedule.MAX_DISTANCE = 125.0; // route length in km
