import prisma from './database';

const configCahce = new Map<string, any>();

/** @returns {Promise<object>} */

export async function getConfig(key: string, groupid: number) {
	if (configCahce.has(`${groupid}_${key}`)) {
		return configCahce.get(`${groupid}_${key}`);
	} else {
		const config = await prisma.config.findFirst({
			where: {
				workspaceGroupId: groupid,
				key: key,
			},
		});
		if (config) {
			configCahce.set(`${groupid}_${key}`, config.value);
			return config.value;
		} else {
			return null;
		}
	}
}

export async function fetchworkspace(groupid: number) {
	const workspace = await prisma.workspace.findFirst({
		where: {
			groupId: groupid,
		},
	});
	return workspace;
}

export async function setConfig(key: string, value: any, groupid: number) {
	const config = await prisma.config.findFirst({
		where: {
			workspaceGroupId: groupid,
			key: key,
		},
	});
	if (config) {
		await prisma.config.update({
			where: {
				id: config.id,
			},
			data: {
				value: value,
			},
		});
	} else {
		await prisma.config.create({
			data: {
				key: key,
				value: value,
				workspaceGroupId: groupid,
			},
		});
	}
	configCahce.set(`${groupid}_${key}`, value);
}

export async function refresh(key: string, groupid: number) {
	configCahce.delete(`${groupid}_${key}`);
}

