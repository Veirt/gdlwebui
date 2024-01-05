import { type ServerWebSocket } from 'bun';
import { spawn } from 'child_process';

type Message = {
	action: string;
	data: any;
};

const server = Bun.serve({
	fetch(req, server) {
		const success = server.upgrade(req);
		if (success) {
			// Bun automatically returns a 101 Switching Protocols
			// if the upgrade succeeds
			return undefined;
		}

		// handle HTTP request normally
		return new Response('Hello world!');
	},
	websocket: {
		message
	},
	port: 8080
});

async function launchGalleryDl(ws: ServerWebSocket, data: { urls: string[] }) {
	ws.send(JSON.stringify({ output: 'Starting gallery-dl...\n' }));
	const proc = spawn('gallery-dl', [
		'-o',
		'output.mode=terminal',
		'-o',
		'output.progress=true',
		...data.urls
	]);

	// Listen for data from the child process stdout
	proc.stdout.on('data', (data: Buffer) => {
		// Send the data to the WebSocket as a string
		let dataString = data.toString();
		if (!dataString.endsWith('\n')) {
			dataString += '\n';
		}

		ws.send(JSON.stringify({ output: dataString }));
	});

	// both error and progress will go to stderr.
	proc.stderr.on('data', (data: Buffer) => {
		let dataString = data.toString();
		if (dataString.includes('error')) {
			ws.send(JSON.stringify({ error: dataString }));
		} else {
			ws.send(JSON.stringify({ progress: data.toString() }));
		}
	});

	proc.on('close', (code) => {
		ws.send(JSON.stringify({ output: `gallery-dl process exited with code: ${code}\n` }));
	});
}

async function message(ws: ServerWebSocket, message: String | Buffer) {
	const msg: Message = JSON.parse(message as string);

	if (msg.action === 'download') {
		// handle download here
		launchGalleryDl(ws, msg.data);
	}
}

console.log(`Listening on ${server.hostname}:${server.port}`);
