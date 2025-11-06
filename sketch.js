/// <reference types="p5/global" />

// TODO:  add disclaimer about localhost socket.io is required or implement secure on cloud server
let socket;
let messages;
let formChat;
let input;
let strokeColor = '#000000';
const backgroundColor = '#969696';

const strokeWidth = 24

function setup() 
{ 
    let canvas = createCanvas(640, 480);
    canvas.parent('canvas'); // Set the parent of the canvas to the div with id 'canvas'
  
    
  
    background(backgroundColor)

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

    socket.on('mouse', alienDrawing)
    //socket.on('iss', (data) => { console.log('ISS location:', data) })

    const colorPicker = document.getElementById('colorPicker');
    colorPicker.addEventListener('input', (event) => {
        strokeColor = event.target.value;
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
            });
        }
    });
} 

function draw() 
{ 
   
}

function mouseDragged() 
{
    let data = {
        x: mouseX, 
        y: mouseY,
        color: strokeColor
    }

    socket.emit('mouse', data)
    noStroke()
    fill(strokeColor)
    ellipse(mouseX, mouseY, strokeWidth, strokeWidth)
}

function alienDrawing(data) 
{
    noStroke()
    fill(data.color);
    ellipse(data.x, data.y, strokeWidth, strokeWidth)

}







 
          
