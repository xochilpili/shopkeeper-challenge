import { Request, Response } from 'express';

import { DatabaseManager } from './db';

export default class RouteHandler {
	constructor(private databaseManager: DatabaseManager) {}
	// TODO: Move this to a utility lib
	private randomInt(min: number, max: number) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	}
	// TODO: Move this to a utility lib
	private rowToDataset(items: any[]) {
		const dataset = new Map<string, Record<string, any>>();
		const labels = new Set<string>();
		for (const item of items) {
			if (!labels.has(item.listing_month)) labels.add(item.listing_month);
			if (dataset.has(item.title)) {
				dataset.get(item.title).data.push(item.avg_revenue);
			} else {
				dataset.set(item.title, {
					label: `Broker: ${item.broker} - ${item.title}`,
					data: [item.avg_revenue],
					lineTension: 0,
					backgroundColor: 'transparent',
					borderColor: `rgba(${this.randomInt(1, 255)},${this.randomInt(1, 255)},${this.randomInt(1, 255)},1)`,
					borderWidth: 4,
				});
			}
		}
		return { dataset: Array.from(dataset.values()), labels: Array.from(labels) };
	}

	async Home(req: Request, res: Response): Promise<void> {
		try {
			const data = await this.databaseManager.getAverageGroupedPerSite('2020-11-01', '2021-11-01');
			if (!Array.isArray(data)) throw new Error('Invalid data returned from database');
			const { dataset, labels } = this.rowToDataset(data);

			const context = {
				company: 'Acme Inc.',
				title: 'Home',
				message: 'Sales data for November 2021',
				labels,
				dataset,
				records: data,
			};

			res.render('home', context);
		} catch (error) {
			req.log.error(error, 'Error getting deals');
			res.status(500).send('Internal server error');
		}
	}
}
