import { Vector } from 'utils/Vector'

// https://franklinta.com/2014/09/08/computing-css-matrix3d-transforms/
// prettier-ignore
export const getTransform = (from: Vector[], to: Vector[]) => {
    var A, H, b, h, i, k, l, ref;
    // var A, H, b, h, i, k, k_i, l, lhs, m, ref, rhs;
    console.assert((from.length === (ref = to.length) && ref === 4));
    A = []; // 8x8
    for (i = k = 0; k < 4; i = ++k) {
      A.push([from[i].x, from[i].y, 1, 0, 0, 0, -from[i].x * to[i].x, -from[i].y * to[i].x]);
      A.push([0, 0, 0, from[i].x, from[i].y, 1, -from[i].x * to[i].y, -from[i].y * to[i].y]);
    }
    b = []; // 8x1
    for (i = l = 0; l < 4; i = ++l) {
      b.push(to[i].x);
      b.push(to[i].y);
    }
    // Solve A * h = b for h
    h = (window as any).solve(A, b);
    H = [
      [h[0], h[1], 0, h[2]],
      [h[3], h[4], 0, h[5]],
      [  0,    0,  1,   0 ],
      [h[6], h[7], 0,   1 ]
    ];

    var k, results;
    results = [];
    for (i = k = 0; k < 4; i = ++k) {
      results.push((() => {
        var l, results1;
        results1 = [];
        for (let j = l = 0; l < 4; j = ++l) {
          results1.push(H[j][i].toFixed(20));
        }
        return results1;
      })());
    }
    return results.join(',');
  }
