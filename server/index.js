const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();

app.use(cors());
app.use(bodyParser.json());


function createConnections() {
    let list = [];
    return {
        send(message) {
            messageId++;
            list.forEach(({ id, req, res }) => {
                console.log('Sending for: ', id)
                res.write(`id: ${messageId}\n`);
                res.write(`data: ${JSON.stringify(message)}\n\n`);
            });
        },
        add(id, req, res) {
            list.push({ id, req, res })
        },
        remove(id) {
            list = list.filter(item => item.id !== id);
        }
    }
}

const connections = createConnections();

let messageId = 0;
app.post('/send', (req, res) => {
    console.log('Message', req.body)
    messageId++;
    connections.send({ ...req.body, id: messageId });
    res.sendStatus(201);
})

let connId = 0;
app.get('/sse', (req, res) => {
    // SSE Setup
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
    });
    
    res.write('\n');
 
    const connectionId = ++connId;
    connections.add(connectionId, req, res)
 
    req.on('close', () => {
        connections.remove(connectionId);
    });
});


app.listen(4040, () => console.log('Server started...'));