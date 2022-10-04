declare global {
	namespace NodeJS {
	  interface Global {
		prisma: any;
	  }
	}
  }