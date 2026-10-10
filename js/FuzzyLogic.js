class FuzzyLogic {
  constructor() {
    this.name = ""; // linguistic term
    this.ndex = 0; // linguistic index
    this.n = 0; // number of points in the membership function
    this.x = [0, 0, 0, 0]; // domain points
    this.y = [0, 0, 0, 0]; // membership values
  }

  Set(nm, index, x0, y0, x1, y1, x2, y2, x3, y3) {
    const xx = [],
      yy = [];
    this.name = nm;
    this.ndex = index;
    xx[0] = x0;
    yy[0] = y0;
    let n = 1;

    if (x1 !== x0 || y1 !== y0) {
      xx[n] = x1;
      yy[n] = y1;
      ++n;
    }
    if (x2 !== x1 || y2 !== y1) {
      xx[n] = x2;
      yy[n] = y2;
      ++n;
    }
    if (x3 !== x2 || y3 !== y2) {
      xx[n] = x3;
      yy[n] = y3;
      ++n;
    }

    this.n = n;
    for (let i = 0; i < n; i++) {
      this.x[i] = xx[i];
      this.y[i] = yy[i];
    }
  }

  // returns the degree of membership of pt
  membership(pt) {
    const x = this.x,
      y = this.y,
      n = this.n;
    if (n === 0) return 0.0;
    if (pt <= x[0]) return y[0];
    if (pt >= x[n - 1]) return y[n - 1];

    let lo = 0,
      hi = n - 1,
      mid;
    for (;;) {
      mid = Math.floor((lo + hi) / 2);
      if (mid === lo) break;
      if (x[mid] < pt) lo = mid;
      else hi = mid;
    }

    const yy = ((pt - x[hi - 1]) / (x[hi] - x[hi - 1])) * (y[hi] - y[hi - 1]);
    return yy + y[hi - 1];
  }

  Area(mf) {
    const x = this.x,
      y = this.y,
      n = this.n;
    if (n === 0) return 0.0;
    else if (n === 2 && (y[0] === 0 || y[0] === 1))
      return 0.5 * mf * (x[1] - x[0]) * (2 - mf);
    else return 0.5 * mf * (x[2] - x[0]) * (2 - mf);
  }

  CenterOfArea(mf) {
    const x = this.x,
      n = this.n;
    if (mf === 0) return 0.0;
    if (n === 2 && x[0] === 0)
      return ((1 - mf + (mf * mf) / 3) * x[1]) / (2 - mf);
    else if (n === 2)
      return (
        (mf * (x[0] + (2.0 / 3) * mf * (x[1] - x[0])) +
          2 * (1 - mf) * (x[0] + 0.5 * (x[1] - x[0]) * (1 + mf))) /
        (2 - mf)
      );
    else return x[1];
  }

  GetLinguistic() {
    return this.name;
  }
  GetIndex() {
    return this.ndex;
  }

  min(a, b) {
    return a < b ? a : b;
  }
  max(a, b) {
    return a > b ? a : b;
  }
}
