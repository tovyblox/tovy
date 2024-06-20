const { exec } = require("child_process");
const dotenv = require("dotenv");
dotenv.config();

if (process.env.MIGRATE_DATABASE_URL) {
	const migrate = exec(`DATABASE_URL="${process.env.MIGRATE_DATABASE_URL}" npx prisma migrate deploy`);
	migrate.stdout?.on("data", (data) => {
		process.stdout.write(data);
	});
	//on error

	migrate.on("close", (code) => {
		process.stdout.write("Migrate exited with code " + code);
		if (code !== 0) {
			process.exit(1);
		}
		process.exit(0);
	});
} else if (process.env.DATABASE_URL) {
	const migrate = exec(`DATABASE_URL="${process.env.DATABASE_URL}" npx prisma migrate deploy`);

	migrate.stdout?.on("data", (data) => {
		process.stdout.write(data);
	});
	//on error

	migrate.on("close", (code) => {
		process.stdout.write("Migrate exited with code " + code);
		if (code !== 0) {
			process.exit(1);
		}
	});
} else {
	throw new Error('No database url provided');
}
