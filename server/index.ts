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
	ws.send('Starting download...\n');
	const proc = spawn('gallery-dl', [
		'-o',
		'output.mode=terminal',
		'-o',
		'output.progress=true',
		...data.urls
	]);

	// Listen for data from the child process stdout
	proc.stdout.on('data', (data) => {
		// Send the data to the WebSocket as a string
		ws.send(data.toString());
	});

	proc.stderr.on('data', (data) => {
		// TODO: handle progress (stderr) flooding the output log
		console.log(data.toString());
		// ws.send(data.toString());
	});

	proc.stdout.on('close', () => {
		ws.send('Done.\n');
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
