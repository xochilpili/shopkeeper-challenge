import { Store } from '@hapipal/confidence';
import * as dotenv from 'dotenv';

if (process.env.NODE_ENV !== 'test') dotenv.config();

const store = new Store({
	env: { $env: 'ENV', $default: 'local' },
	service: {
		host: { $env: 'HOST', $default: 'localhost' },
		port: { $env: 'PORT', $coerce: 'number', $default: 3000 },
	},
	logger: {
		level: { $env: 'LOG_LEVEL', $default: 'info' },
	},
	database: {
		host: { $env: 'DB_HOST', $default: 'localhost' },
		port: { $env: 'DB_PORT', $coerce: 'number', $default: 5432 },
		username: { $env: 'DB_USERNAME', $default: '' },
		password: { $env: 'DB_PASSWORD', $default: '' },
		database: { $env: 'DB_NAME', $default: '' },
	},
});

export const get = (key: string) => store.get(key);
