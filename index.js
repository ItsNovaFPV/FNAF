const express = require('express');
const { createServer } = require('http');
const { join } = require('path');
const { Server } = require('socket.io');
const awsServerlessExpress = require('aws-serverless-express');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*', // Replace '*' with your specific origin if needed
        methods: ['GET', 'POST'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true
    }
});

// Serve static files from the 'src' directory
app.use(express.static(join(__dirname, 'src')));
app.use(awsServerlessExpressMiddleware.eventContext());

app.get('/', (req, res) => {
  res.sendFile(join(__dirname, 'src', 'index.html'));
});

let taskCompletion = false;
let gameInterval;

io.on('connection', (socket) => {
    console.log('New client connected');

    let rightDoorLight = false;
    let leftDoorLight = false;

    socket.on('leftDoorButtonPress', () => {
        leftDoorLight = true;
        console.log('Left door light enabled');
        io.emit('leftDoorLightStatus', leftDoorLight);
    });

    socket.on('leftDoorButtonRelease', () => {
        leftDoorLight = false;
        console.log('Left door light disabled');
        io.emit('leftDoorLightStatus', leftDoorLight);
    });

    socket.on('rightDoorButtonPress', () => {
        rightDoorLight = true;
        console.log('Right door light enabled');
        io.emit('rightDoorLightStatus', rightDoorLight);
    });

    socket.on('rightDoorButtonRelease', () => {
        rightDoorLight = false;
        console.log('Right door light disabled');
        io.emit('rightDoorLightStatus', rightDoorLight);
    });


    socket.on('sendFunction', (functionString) => {
        let receivedFunction = new Function('return ' + functionString)();
        try {
            let output = receivedFunction();
            socket.emit('functionOutput', output);
        } catch (error) {
            console.error('Error executing function:', error);
        }
    });

    socket.on('playAudio', () => {
        io.emit('playAudio');
        socket.emit('reset');
    });

    let readyCount = 0;
    const totalAnimatronics = 5;

    socket.on('ready', () => {
        readyCount++;
        if (readyCount === totalAnimatronics) {
            console.log('All animatronics ready');
            startGame();
            io.emit('timeUpdate', 0);
        } 
    });

    socket.on('gameOver', () => {
        console.log('Animatronics win');
        io.emit('gameOver');
    });

    socket.on('task completion', (completed) => {
        console.log('Task completion:', completed);
        taskCompletion = completed;
    });

    socket.on('sendHallucination', () => {
        console.log('Hallucination sent');
        io.emit('guardHallucination');
    });

    socket.on('stopSound', () => {
        console.log('Stop all sounds');
        io.emit('stopAllSounds');
    });

    socket.on('playRandomAudio', () => {
        const soundNumber = Math.floor(Math.random() * 6) + 1;
        const soundName = `rsound${soundNumber}.mp3`;
        io.emit('playrSound', soundName);
        console.log(soundName);
    });

    function startGame() {
        let currentHour = 0;
        gameInterval = setInterval(function() {
            if (currentHour >= 6) {
                currentHour = 0;
            }
            currentHour++;
            if (currentHour === 6) {
                if (taskCompletion) {
                    io.emit('guardWin');
                } else {
                    io.emit('fired');
                }
            }
            if (currentHour >= 1 && currentHour <= 6) {
                io.emit('startFailureSimulation');
            }
            io.emit('timeUpdate', currentHour);
        }, 60000);
    }

    socket.on('reset', function() {
        console.log('Resetting game');
        clearInterval(gameInterval);
        readyCount = 0;
        io.emit('timeUpdate', 0);
    });

    socket.on('playSound', (soundName) => {
        console.log(`Playing sound: ${soundName}`);
        io.emit('playSound', soundName);
    });

    socket.on('disconnect', () => {
        console.log('Client disconnected');
    });
});

const lambdaServer = awsServerlessExpress.createServer(app);

exports.handler = (event, context) => {
  awsServerlessExpress.proxy(lambdaServer, event, context);
};