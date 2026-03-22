import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "@/app/generated/prisma/client";

const adapter = new PrismaBetterSqlite3({
	url: process.env.DATABASE_URL ?? "file:./prisma/dev.db",
});
const prisma = new PrismaClient({ adapter });

const projects = [
	{
		id: "seed-project-1",
		name: "Website Redesign",
		description: "Modernize the company website with new branding",
		status: "active",
	},
	{
		id: "seed-project-2",
		name: "Mobile App MVP",
		description: "Build the first version of the iOS and Android app",
		status: "active",
	},
	{
		id: "seed-project-3",
		name: "Data Pipeline Migration",
		description: "Migrate ETL jobs from Airflow to Dagster",
		status: "completed",
	},
	{
		id: "seed-project-4",
		name: "API Gateway",
		description: "Centralize API routing and rate limiting",
		status: "active",
	},
	{
		id: "seed-project-5",
		name: "Design System",
		description: null,
		status: "archived",
	},
];

async function main() {
	for (const project of projects) {
		await prisma.project.upsert({
			where: { id: project.id },
			update: {},
			create: project,
		});
	}
	console.log(`Seeded ${projects.length} projects`);
}

main()
	.catch((e) => {
		console.error(e);
		process.exit(1);
	})
	.finally(() => prisma.$disconnect());
