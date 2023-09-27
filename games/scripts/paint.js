const canvas = document.getElementById('drawing-board');
const toolbar = document.getElementById('toolbar');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth - canvas.offsetLeft;
canvas.height = window.innerHeight - canvas.offsetTop;
let isPainting = false;
let lineWidth = 5;

toolbar.addEventListener('click', e => {
    if (e.target.id === 'clear') {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
});
toolbar.addEventListener('change', e => {
    if (e.target.id === 'stroke') {
        ctx.strokeStyle = e.target.value;
    }
    if (e.target.id === 'lineWidth') {
        lineWidth = e.target.value;
    }

});
const draw = (e) => {
    if (!isPainting) {
        return;
    }
    ctx.lineWidth = lineWidth;
    ctx.lineCap = 'round';
    ctx.lineTo(e.clientX - canvas.offsetLeft, e.clientY);
    ctx.stroke();
}
canvas.addEventListener('mousedown', e => {
    isPainting = true;
});
canvas.addEventListener('mouseup', e => {
    isPainting = false;
    ctx.beginPath();
});
canvas.addEventListener('mousemove', draw);