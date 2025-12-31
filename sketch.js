/// <reference types="p5/global" />

// TODO:  add disclaimer about localhost socket.io is required or implement secure on cloud server
let socket;
let messages;
let formChat;
let input;
let strokeColor = '#000000';
const backgroundColor = '#969696';

let currentStrokeWidth = 10;

function setup() 
{ 
    // Create responsive canvas
    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent('canvas');
    canvas.style('display', 'block');
  
    background(backgroundColor);

    messages = document.getElementById('messages');
    formChat = document.getElementById('formChat');
    username = document.getElementById('username');
    input = document.getElementById('input');

    socket = io();

    formChat.addEventListener('submit', function(e) {
        e.preventDefault();
        if (input.value && username.value) {
            const message = {
                name: username.value,
                text: input.value
            };
            socket.emit('chat message', message);
            input.value = '';
        }
    });
      
    socket.on('chat message', function(msg) {
        console.log('message: ', msg);
        let item = document.createElement('li');
        item.textContent = `${msg.name}: ${msg.text}`;
        messages.appendChild(item);
        window.scrollTo(0, document.body.scrollHeight);
    });

    socket.on('mouse', alienDrawing);

    const colorPicker = document.getElementById('colorPicker');
    colorPicker.addEventListener('input', (event) => {
        strokeColor = event.target.value;
    });

    const brushSize = document.getElementById('brushSize');
    brushSize.addEventListener('input', (event) => {
        currentStrokeWidth = parseInt(event.target.value);
    });

    const eraser = document.getElementById('eraser');
    eraser.addEventListener('click', () => {
        strokeColor = backgroundColor;
    });

    const clearCanvas = document.getElementById('clearCanvas');
    clearCanvas.addEventListener('click', () => {
        socket.emit('clearCanvas');
        background(backgroundColor);
    });

    socket.on('clearCanvas', () => {
        background(backgroundColor);
    });

    const saveCanvas = document.getElementById('saveCanvas');
    saveCanvas.addEventListener('click', () => {
        const email = prompt("Please enter your email address:");
        if (email) {
            const canvas = document.querySelector('canvas');
            const dataURL = canvas.toDataURL();
            fetch('/api/alert', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    dest: email,
                    msg: 'Here is your saved canvas!',
                    image64: dataURL,
                }),
            }).catch(err => console.error('Error sending email:', err));
        }
    });

    const downloadCanvas = document.getElementById('downloadCanvas');
    downloadCanvas.addEventListener('click', () => {
        saveCanvas('myCanvas.jpg');
    });
} 

function windowResized() {
    // Preserve the current drawing
    let img = get();
    resizeCanvas(windowWidth, windowHeight);
    background(backgroundColor);
    image(img, 0, 0);
}

function draw() 
{ 
   
}

function mouseDragged() 
{
    let data = {
        x: mouseX, 
        y: mouseY,
        px: pmouseX,
        py: pmouseY,
        color: strokeColor,
        width: currentStrokeWidth
    }

    socket.emit('mouse', data);

    stroke(strokeColor);
    strokeWeight(currentStrokeWidth);
    line(pmouseX, pmouseY, mouseX, mouseY);
}

function alienDrawing(data) 
{
    stroke(data.color);
    strokeWeight(data.width || 10); // Default if not provided
    // Use data.px if available, otherwise just points (fallback to dots if no previous point sent)
    if (data.px !== undefined && data.py !== undefined) {
        line(data.px, data.py, data.x, data.y);
    } else {
        // Fallback for old clients or if packet structure differs
        noStroke();
        fill(data.color);
        ellipse(data.x, data.y, data.width || 10, data.width || 10);
    }
}
