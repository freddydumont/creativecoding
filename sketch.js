const canvasSketch = require('canvas-sketch');
const { lerp } = require('canvas-sketch-util/math');
const random = require('canvas-sketch-util/random');
const palettes = require('nice-color-palettes');

const settings = {
  dimensions: [2048, 2048],
};

const sketch = () => {
  const colorCount = random.rangeFloor(2, 6);
  const palette = random.shuffle(random.pick(palettes).slice(0, colorCount));

  const createGrid = () => {
    const points = [];
    const count = 6;

    for (let x = 0; x < count; x++) {
      for (let y = 0; y < count; y++) {
        const u = x / (count - 1);
        const v = y / (count - 1);

        const radius = Math.abs(random.noise2D(u, v) * 0.025);

        points.push({
          position: [u, v],
          radius,
          color: random.pick(palette),
          rotation: random.noise2D(u, v),
        });
      }
    }

    return points;
  };

  const points = createGrid();

  return ({ context, width, height }) => {
    const margin = width * 0.175;

    // reusable lerp functions
    const lerpWidth = (x) => lerp(margin, width - margin, x);
    const lerpHeight = (y) => lerp(margin, height - margin, y);

    /** Draw and fill a trapezoid */
    function drawTrapezoid([x1, y1], [x2, y2], color) {
      context.strokeStyle = 'white';
      context.lineWidth = 12;
      context.lineCap = 'round';
      context.beginPath();
      context.moveTo(x1, y1);
      context.lineTo(x2, y2);
      context.lineTo(x2, lerpWidth(1));
      context.lineTo(x1, lerpWidth(1));
      context.lineTo(x1, y1);
      context.fillStyle = color;
      context.fill();
      context.stroke();
    }

    context.fillStyle = 'white';
    context.fillRect(0, 0, width, height);

    // draw point grid and return an array of usable
    const lerpedPoints = points.map(({ position: [u, v], ...rest }) => {
      const x = lerpWidth(u);
      const y = lerpHeight(v);

      return {
        ...rest,
        position: [x, y],
      };
    });

    const shuffled = random.shuffle(lerpedPoints);

    const averaged = [];
    // do the following until there is no more points
    while (shuffled.length > 0) {
      // connect two random points on the grid
      //  - get two different random positions
      const [point1, point2] = shuffled.splice(0, 2);

      const {
        position: [x1, y1],
        color,
      } = point1;

      const {
        position: [x2, y2],
      } = point2;

      const averageY = (y1 + y2) / 2;

      averaged.push({ point1, point2, averageY });
    }

    // sort the averaged array
    averaged.sort(({ averageY: a }, { averageY: b }) => a - b);

    // draw
    averaged.forEach(
      ({
        point1: {
          position: [x1, y1],
          color,
        },
        point2: {
          position: [x2, y2],
        },
      }) => drawTrapezoid([x1, y1], [x2, y2], color)
    );
  };
};

canvasSketch(sketch, settings);
