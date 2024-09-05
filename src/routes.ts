import { Router, Request, Response } from 'express';
import { DatabaseManager } from './db';
import RouteHandler from './handlers';

export default class Routes {
	public readonly router: Router;
	private readonly handlers: RouteHandler;

	constructor(databaseManager: DatabaseManager) {
		this.router = Router();
		this.handlers = new RouteHandler(databaseManager);
		this.initializeRoutes();
	}

	private initializeRoutes(): void {
		this.router.get('/', (req: Request, res: Response) => this.handlers.Home(req, res));
	}
}
