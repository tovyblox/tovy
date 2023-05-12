import NodeCache from "node-cache";
import * as noblox from 'noblox.js'
import { getRobloxUsername, getRobloxThumbnail, getRobloxDisplayName, getRobloxUserId } from "@/utils/roblox";

const usernames = new NodeCache();
const thumbnails = new NodeCache();
const displaynames = new NodeCache();

export async function getUsername(userId: number | bigint) {
	const cachedUsername = usernames.get(Number(userId));
	if (cachedUsername) {
		return cachedUsername as string;
	} else {
		const username = await getRobloxUsername(Number(userId));
		usernames.set(Number(userId), username);
		return username as string;
	}
}

/** 
 * Returns a cached thumbnail or fresh thumbnail if not cached already
 * @returns {Promise<string>}
 */
export async function getThumbnail (userId: number | bigint): Promise<string> {
	const cachedThumbnail = thumbnails.get(Number(userId));
	if (cachedThumbnail) {
		return cachedThumbnail as string;
	} else {
		const thumbnail = await getRobloxThumbnail(Number(userId)).catch(e => null);
		if (!thumbnail) return 'https://www.roblox.com/headshot-thumbnail/image?userId=' + userId + '&width=420&height=420&format=png';
		thumbnails.set(Number(userId), thumbnail);
		return thumbnail as string;
	}
}

export async function getDisplayName (userId: number | bigint): Promise<string> {
	const cachedDisplayName = displaynames.get(Number(userId));
	console.log(cachedDisplayName)
	if (cachedDisplayName) {
		return cachedDisplayName as string;
	} else {
		const displayName = (await getRobloxDisplayName(Number(userId)));
		displaynames.set(Number(userId), displayName);
		return displayName as string;
	}
}

