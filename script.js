const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// Resize canvas to fit window
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Define cube vertices
const vertices = [
    [-1, -1, -1],
    [1, -1, -1],
    [1, 1, -1],
    [-1, 1, -1],
    [-1, -1, 1],
    [1, -1, 1],
    [1, 1, 1],
    [-1, 1, 1]
];

// Define cube edges
const edges = [
    [0, 1], [1, 2], [2, 3], [3, 0],
    [4, 5], [5, 6], [6, 7], [7, 4],
    [0, 4], [1, 5], [2, 6], [3, 7]
];

// Projection matrix
let fNear = 0.1;
let fFar = 1000;
let fFov = 90;
let fAspectRatio = canvas.height / canvas.width;
let fFovRad = 1 / Math.tan(fFov * 0.5 / 180 * Math.PI);

let projectionMatrix = [
    [fAspectRatio * fFovRad, 0, 0, 0],
    [0, fFovRad, 0, 0],
    [0, 0, fFar / (fFar - fNear), 1],
    [0, 0, (-fFar * fNear) / (fFar - fNear), 0]
];

// Function to multiply a vector by a matrix
function multiplyMatrixVector(i, m) {
    let o = [0, 0, 0];
    o[0] = i[0] * m[0][0] + i[1] * m[1][0] + i[2] * m[2][0] + m[3][0];
    o[1] = i[0] * m[0][1] + i[1] * m[1][1] + i[2] * m[2][1] + m[3][1];
    o[2] = i[0] * m[0][2] + i[1] * m[1][2] + i[2] * m[2][2] + m[3][2];
    let w = i[0] * m[0][3] + i[1] * m[1][3] + i[2] * m[2][3] + m[3][3];

    if (w !== 0) {
        o[0] /= w; o[1] /= w; o[2] /= w;
    }
    return o;
}

// Main loop
function mainLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = '#fff';

    let rotationX = timestamp * 0.001;
    let rotationZ = timestamp * 0.0005;

    let projectedPoints = vertices.map(vertex => {
        // Rotate in X-axis
        let rotatedX = [
            vertex[0],
            vertex[1] * Math.cos(rotationX) - vertex[2] * Math.sin(rotationX),
            vertex[1] * Math.sin(rotationX) + vertex[2] * Math.cos(rotationX)
        ];

        // Rotate in Z-axis
        let rotatedZ = [
            rotatedX[0] * Math.cos(rotationZ) - rotatedX[1] * Math.sin(rotationZ),
            rotatedX[0] * Math.sin(rotationZ) + rotatedX[1] * Math.cos(rotationZ),
            rotatedX[2]
        ];

        // Offset into the screen
        rotatedZ[2] += 3;

        // Project
        let projected = multiplyMatrixVector(rotatedZ, projectionMatrix);

        // Scale and translate
        projected[0] = projected[0] * canvas.width * 0.5 + canvas.width * 0.5;
        projected[1] = projected[1] * canvas.height * 0.5 + canvas.height * 0.5;

        return projected;
    });

    // Draw edges
    edges.forEach(edge => {
        ctx.beginPath();
        ctx.moveTo(projectedPoints[edge[0]][0], projectedPoints[edge[0]][1]);
        ctx.lineTo(projectedPoints[edge[1]][0], projectedPoints[edge[1]][1]);
        ctx.stroke();
    });

    requestAnimationFrame(mainLoop);
}

// Start the main loop
mainLoop(0);

// Handle window resize
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    fAspectRatio = canvas.height / canvas.width;
    projectionMatrix[0][0] = fAspectRatio * fFovRad;
});