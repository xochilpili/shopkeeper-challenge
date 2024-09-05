import express, { Express } from 'express';
import { engine } from 'express-handlebars';
import { Logger } from 'pino';
import { pinoLogger } from './logger';
import pinoHttp from 'pino-http';
import path from 'path';
import { get as getConfig } from './config';
import { Server } from 'http';
import Routes from './routes';
import { DatabaseManager, DatabaseOptions } from './db';

export default class ServerExpress {
	private static logger: Logger = pinoLogger;
	private static _instance: Express;
	private static _server: Server;
	private static _db: DatabaseManager;

	public static async start(): Promise<void> {
		const host = getConfig('/service/host');
		const port = getConfig('/service/port');

		this._instance = express();

		this._instance.engine(
			'handlebars',
			engine({
				defaultLayout: 'main',
				helpers: {
					json: (context: any) => JSON.stringify(context),
				},
			})
		);

		this._instance.set('view engine', 'handlebars');
		this._instance.set('views', path.resolve(__dirname, './views'));
		this._instance.use(express.static(path.resolve(__dirname, './public')));

		this._instance.use(pinoHttp({ logger: pinoLogger }));

		const dbConfig: DatabaseOptions = {
			user: getConfig('/database/user'),
			host: getConfig('/database/host'),
			database: getConfig('/database/database'),
			password: getConfig('/database/password'),
			port: getConfig('/database/port'),
		};

		// Using DI (Dependencu Injection) to inject the database manager and easy to test...
		this._db = new DatabaseManager(dbConfig);
		const routes = new Routes(this._db);
		this._instance.use('/', routes.router);
		this._server = this._instance.listen(port, host, () => {
			this.logger.info(`Server listening on port ${host}:${port}`);
		});
	}

	public static async stop(): Promise<void> {
		this.logger.info('Server stopping');
		if (this._server) {
			this._server.close((err) => {
				if (err) this.logger.error(err, `Error stopping server`);
			});
		}
		if (this._db) {
			await this._db.close();
		}
	}
}
