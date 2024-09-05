/*
	Shopkeeper Challenge
	Author: armando.chavez <xochilpili@gmail.com>
*/
import ServerExpress from './server';
(async () => {
	await ServerExpress.start();
	const signalTraps = ['SIGTERM', 'SIGINT', 'SIGUSR2'];
	signalTraps.forEach((type) => {
		process.once(type, async () => {
			try {
				await ServerExpress.stop();
			} finally {
				process.kill(process.pid, type);
			}
		});
	});
})().catch(console.error);
