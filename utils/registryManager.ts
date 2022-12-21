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
	};
	const config = JSON.parse(JSON.stringify(regconfig.value));
	if (!config.setup) { 
		console.log('registry not setup')
		return setRegistry(url);
	}

	const req = await axios.post('https://registry.tovyblox.xyz/checkregister', {
		instanceKey: (regconfig.value as any).key,
		instanceUrl: url
	}).catch(e => {
		if (e?.response?.data === 'Instance does not exist') {
			return setRegistry(url);
		}
	});
	if (!req) return;
}

export const setRegistry = async (url: string) => {
	const regconfig = await prisma.instanceConfig.findUnique({
		where: {
			key: 'registry'
		}
	});
	if (regconfig && JSON.parse(JSON.stringify(regconfig?.value)).setup) return { error: 'Registry already exists' };
	const workspace = await prisma.workspace.findFirst({});
	if (!workspace) return { error: 'No workspace found' };

	const req = await axios.post('https://registry.tovyblox.xyz/register', {
		groupID: workspace.groupId,
		instanceURL: url
	}).catch(err => null);
	
	if (!req) {
		console.log(`Failed to register to registry`)
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
	console.log(`Registered to registry`)

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