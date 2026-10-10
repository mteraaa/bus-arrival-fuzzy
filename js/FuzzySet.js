class FuzzySet {
  constructor() {
    this.accessor = new FuzzyLogic();
    this.departureTime = Array.from({ length: 5 }, () => new FuzzyLogic());
    this.distance = Array.from({ length: 5 }, () => new FuzzyLogic());
    this.travelTime = Array.from({ length: 7 }, () => new FuzzyLogic());
    this.matched_features = Array.from({ length: 5 }, () =>
      new Array(5).fill(0),
    );
    this.travelTime_COA = 0.0;
    this.firedRules = [];
    this.InitializeFuzzySets();
  }

  InitializeFuzzySets() {
    // Membership function for Time of Day Input (hour the bus leaves, 4.5 - 17.5)
    this.departureTime[0].Set(
      "EARLYMORNING",
      0,
      4.5,
      1,
      4.5,
      1,
      4.5,
      1,
      7.5,
      0,
    );
    this.departureTime[1].Set("MORNINGRUSH", 1, 4.5, 0, 7.5, 1, 7.5, 1, 10, 0);
    this.departureTime[2].Set("LATEMORNING", 2, 7.5, 0, 10, 1, 10, 1, 12.5, 0);
    this.departureTime[3].Set("NOON", 3, 10, 0, 12.5, 1, 12.5, 1, 17.5, 0);
    this.departureTime[4].Set(
      "AFTERNOONRUSH",
      4,
      12.5,
      0,
      17.5,
      1,
      17.5,
      1,
      17.5,
      1,
    );

    // Membership function for Distance from Terminal Input (km, 0 - 125)
    this.distance[0].Set("VERYNEAR", 0, 0, 1, 0, 1, 0, 1, 35, 0);
    this.distance[1].Set("NEAR", 1, 0, 0, 35, 1, 35, 1, 62.5, 0);
    this.distance[2].Set("MIDDLE", 2, 35, 0, 62.5, 1, 62.5, 1, 90, 0);
    this.distance[3].Set("FAR", 3, 62.5, 0, 90, 1, 90, 1, 125, 0);
    this.distance[4].Set("VERYFAR", 4, 90, 0, 125, 1, 125, 1, 125, 1);

    // Membership function for Travel Time Output (minutes, 0 - 240)
    this.travelTime[0].Set("VERYSHORT", 0, 0, 1, 0, 1, 0, 1, 30, 0);
    this.travelTime[1].Set("SHORT", 1, 10, 0, 45, 1, 45, 1, 80, 0);
    this.travelTime[2].Set("FAIRLYSHORT", 2, 45, 0, 80, 1, 80, 1, 115, 0);
    this.travelTime[3].Set("MODERATE", 3, 80, 0, 115, 1, 115, 1, 150, 0);
    this.travelTime[4].Set("FAIRLYLONG", 4, 115, 0, 150, 1, 150, 1, 185, 0);
    this.travelTime[5].Set("LONG", 5, 150, 0, 185, 1, 185, 1, 220, 0);
    this.travelTime[6].Set("VERYLONG", 6, 185, 0, 240, 1, 240, 1, 240, 1);

    // Fuzzy Rules [departureTime][distance]
    const F = FuzzySet,
      m = this.matched_features;
    m[F.EARLYMORNING][F.VERYNEAR] = F.VERYSHORT;
    m[F.EARLYMORNING][F.NEAR] = F.SHORT;
    m[F.EARLYMORNING][F.MIDDLE] = F.FAIRLYSHORT;
    m[F.EARLYMORNING][F.FAR] = F.MODERATE;
    m[F.EARLYMORNING][F.VERYFAR] = F.FAIRLYLONG;

    m[F.MORNINGRUSH][F.VERYNEAR] = F.VERYSHORT;
    m[F.MORNINGRUSH][F.NEAR] = F.FAIRLYSHORT;
    m[F.MORNINGRUSH][F.MIDDLE] = F.MODERATE;
    m[F.MORNINGRUSH][F.FAR] = F.LONG;
    m[F.MORNINGRUSH][F.VERYFAR] = F.VERYLONG;

    m[F.LATEMORNING][F.VERYNEAR] = F.VERYSHORT;
    m[F.LATEMORNING][F.NEAR] = F.SHORT;
    m[F.LATEMORNING][F.MIDDLE] = F.FAIRLYSHORT;
    m[F.LATEMORNING][F.FAR] = F.FAIRLYLONG;
    m[F.LATEMORNING][F.VERYFAR] = F.LONG;

    m[F.NOON][F.VERYNEAR] = F.VERYSHORT;
    m[F.NOON][F.NEAR] = F.SHORT;
    m[F.NOON][F.MIDDLE] = F.MODERATE;
    m[F.NOON][F.FAR] = F.FAIRLYLONG;
    m[F.NOON][F.VERYFAR] = F.VERYLONG;

    m[F.AFTERNOONRUSH][F.VERYNEAR] = F.VERYSHORT;
    m[F.AFTERNOONRUSH][F.NEAR] = F.FAIRLYSHORT;
    m[F.AFTERNOONRUSH][F.MIDDLE] = F.FAIRLYLONG;
    m[F.AFTERNOONRUSH][F.FAR] = F.LONG;
    m[F.AFTERNOONRUSH][F.VERYFAR] = F.VERYLONG;
  }

  computeCentroid(dep_time, dist) {
    let area = 0,
      centroid = 0,
      numerator = 0,
      denominator = 0,
      minimum = 0.0;
    this.firedRules = [];

    for (
      let i = 0;
      i < 5;
      i++ // departureTime input
    )
      for (let j = 0; j < 5; j++) {
        // distance input
        minimum = this.accessor.min(
          this.departureTime[i].membership(dep_time),
          this.distance[j].membership(dist),
        );
        if (minimum !== 0) {
          const rule =
            this.matched_features[this.departureTime[i].GetIndex()][
              this.distance[j].GetIndex()
            ];
          area = this.travelTime[rule].Area(minimum);
          centroid = this.travelTime[rule].CenterOfArea(minimum);
          numerator += area * centroid;
          denominator += area;

          this.firedRules.push({
            timeTerm: this.departureTime[i].GetLinguistic(),
            distanceTerm: this.distance[j].GetLinguistic(),
            outputTerm: this.travelTime[rule].GetLinguistic(),
            strength: minimum,
            area: area,
            center: centroid,
          });
        }
      }

    if (denominator === 0.0) return 0.0;
    else return numerator / denominator;
  }

  // Runs the full inference and returns the linguistic label of the output
  defuzzify(dep_time, dist) {
    this.travelTime_COA = this.computeCentroid(dep_time, dist);

    let maxMembership = 0.0;
    let travel_linguistic = "";
    for (let i = 0; i < 7; i++) {
      if (this.travelTime[i].membership(this.travelTime_COA) > maxMembership) {
        maxMembership = this.travelTime[i].membership(this.travelTime_COA);
        travel_linguistic = this.travelTime[i].GetLinguistic();
      }
    }
    return travel_linguistic;
  }

  getTravelTime() {
    return this.travelTime_COA;
  }
  getFiredRules() {
    return this.firedRules;
  }
}

// input: time of day (bus departure time)
FuzzySet.EARLYMORNING = 0;
FuzzySet.MORNINGRUSH = 1;
FuzzySet.LATEMORNING = 2;
FuzzySet.NOON = 3;
FuzzySet.AFTERNOONRUSH = 4;
// input: distance from starting terminal
FuzzySet.VERYNEAR = 0;
FuzzySet.NEAR = 1;
FuzzySet.MIDDLE = 2;
FuzzySet.FAR = 3;
FuzzySet.VERYFAR = 4;
// output: travel time
FuzzySet.VERYSHORT = 0;
FuzzySet.SHORT = 1;
FuzzySet.FAIRLYSHORT = 2;
FuzzySet.MODERATE = 3;
FuzzySet.FAIRLYLONG = 4;
FuzzySet.LONG = 5;
FuzzySet.VERYLONG = 6;
