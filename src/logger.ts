import { pino } from 'pino';
import { get as getConfig } from './config';

export const pinoLogger = pino({
	level: getConfig('/logger/level'),
	formatters: {
		level: (label) => ({ severity: label.toUpperCase() }),
	},
});
