import { Pool } from 'pg';

export interface DatabaseOptions {
	user: string;
	host: string;
	database: string;
	password: string;
	port: number;
}

export class DatabaseManager {
	private readonly _pool: Pool;

	constructor(config: DatabaseOptions) {
		this._pool = new Pool(config);
	}

	async query(query: string, values: any[]) {
		const res = await this._pool.query(query, values);
		return res.rows;
	}

	async getAverageGroupedPerSite(start_date: string, end_date: string): Promise<any[]> {
		// Not enough permissions to create views, functions, etc. So I will use an ugly query
		const query = `
			with months as (
				select 
					generate_series(
						'${start_date}'::date, 
						'${end_date}'::date, 
						'1 month'::interval
					) as month
			), 
			brokers as (
				select 
					distinct d.site_id as broker, 
					s.title 
				from 
					deals_history d 
				inner join sites s on d.site_id = s.id 
			) 
			select 
				broker, 
				b.title, 
				to_char(m.month, 'YYYY-MM') as listing_month,
				to_char(m.month, 'MONTH') as month,
				coalesce(count(dh.id), 0) as new_listings,
				coalesce(avg(dh.revenue), 0) as avg_revenue
			from 
				months m 
			cross join brokers b 
			left join deals_history dh on to_char(dh.created_at, 'YYYY-MM') = to_char(m.month, 'YYYY-MM') and dh.site_id = b.broker and dh.removed = false 
			group by 
				b.broker, 
				b.title, 
				m.month 
			order by 
				b.broker, 
				m.month;
		`;
		const res = await this.query(query, []);
		return res;
	}

	async close() {
		await this._pool.end();
	}
}
