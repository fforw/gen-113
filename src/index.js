import domready from "domready"
import { voronoi } from "d3-voronoi"
import { polygonCentroid } from "d3-polygon"
import "./style.css"
import randomPalette, { randomPaletteWithBlack } from "./randomPalette"

const PHI = (1 + Math.sqrt(5)) / 2;
const TAU = Math.PI * 2;
const DEG2RAD_FACTOR = TAU / 360;

const config = {
    width: 0,
    height: 0
};

/**
 * @type CanvasRenderingContext2D
 */
let ctx;
let canvas;

const overdraw = 1.2
function createPoints(count = 20)
{
    const { width, height } = config

    const out = []

    for (let i = 0; i < count; i++)
    {
        out.push([
            Math.random() * width | 0,
            Math.random() * height | 0
        ])

    }

    return out
}

function relax(v, pts, count = 5)
{
    for (let i = 0; i < count; i++)
    {
        pts = v(pts).polygons().map(poly => {
            const c = polygonCentroid(poly)
            c[0] |= 0
            c[1] |= 0
            return c
        })
    }
    return pts
}

function drawPolygon(ctx, polygon)
{
    const last = polygon.length - 1
    const [x1, y1] = polygon[last]

    ctx.beginPath()
    ctx.moveTo(
        x1 | 0,
        y1 | 0
    )

    for (let i = 0; i < polygon.length; i++)
    {
        const [x1, y1] = polygon[i]
        ctx.lineTo(x1, y1)
    }
    ctx.fill();
    ctx.stroke();
}

domready(
    () => {

        canvas = document.getElementById("screen");
        ctx = canvas.getContext("2d");

        // const width = (window.innerWidth) | 0;
        // const height = (window.innerHeight) | 0;
        const width = 2000;
        const height = 2000;

        config.width = width;
        config.height = height;

        canvas.width = width;
        canvas.height = height;

        const paint = () => {

            const palette = randomPalette()

            ctx.strokeStyle = "#000";
            ctx.lineWidth = 4;
            ctx.clearRect(0,0, width, height);

            const borderX = (overdraw - 1) * width / 2
            const borderY = (overdraw - 1) * height / 2
            const v = voronoi().extent([[-borderX,-borderY], [width + borderX, height + borderY]])

            let pts = createPoints(80)
            pts = relax(v, pts, 3)

            const r0 = 600;
            const r = 400;
            const r2 = 300;
            const r3 = 350;
            const cx = width >> 1
            const cy = height >> 1
            const steps = 64
            const step = TAU/steps
            const off = step/2
            for (let i = 0; i < steps; i++)
            {
                {
                    const x = cx + Math.cos(i * step) * r0
                    const y = cy + Math.sin(i * step) * r0

                    pts.push([x,y])
                }
                {
                    const x = cx + Math.cos(i * step) * r
                    const y = cy + Math.sin(i * step) * r

                    pts.push([x,y])
                }
                if (i & 1)
                {
                    const x = cx + Math.cos(i * step) * r2
                    const y = cy + Math.sin(i * step) * r2

                    pts.push([x,y])
                }
                if ((i & 3) === 0)
                {
                    const x = cx + Math.cos(i * step + off) * r3
                    const y = cy + Math.sin(i * step + off) * r3

                    pts.push([x,y])
                }
            }

            const diagram = v(pts);

            diagram.polygons().forEach(polygon => {

                ctx.fillStyle = palette[0|Math.random() * palette.length] 

                if (polygon)
                {
                    drawPolygon(ctx, polygon)
                }
            });


        }

        paint()

        canvas.addEventListener("click", paint, true)
    }
);
