import prisma from "./database";
import axios from "axios";

export const getRegistry = async (url: string) => {
	const regconfig = await prisma.instanceConfig.findUnique({
		where: {
			key: 'registry'
		}
	});
	if (!regconfig?.value) {
		return setRegistry(url);
	}

	

	const req = await axios.post('http://localhost:8080/checkregister', {
		instanceKey: (regconfig.value as any).key,
		instanceUrl: url
	}).catch(e => null);
	if (!req) return;
}

export const setRegistry = async (url: string) => {
	const regconfig = await prisma.instanceConfig.findUnique({
		where: {
			key: 'registry'
		}
	});
	if (regconfig) return { error: 'Registry already exists' };
	const workspace = await prisma.workspace.findFirst({});
	if (!workspace) return { error: 'No workspace found' };

	const req = await axios.post('http://localhost:8080/register', {
		groupID: workspace.groupId,
		instanceURL: url
	}).catch(err => null);
	if (!req) {
		await prisma.instanceConfig.upsert({
			where: {
				key: 'registry'
			},
			update: {
				value: {
					setup: false,
					key: null
				}
			},
			create: {
				key: 'registry',
				value: {
					setup: false,
					key: null
				}
			}

		})
		return;
	}

	await prisma.instanceConfig.upsert({
		where: {
			key: 'registry'
		},
		update: {
			value: {
				setup: true,
				key: req.data.instanceKey
			}
		},
		create: {
			key: 'registry',
			value: {
				setup: true,
				key: req.data.instanceKey
			}
		}
	})
}