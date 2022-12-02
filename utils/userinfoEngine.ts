import NodeCache from "node-cache";
import * as noblox from 'noblox.js'

const usernames = new NodeCache();
const thumbnails = new NodeCache();
const displaynames = new NodeCache();

export async function getUsername(userId: number | bigint) {
	const cachedUsername = usernames.get(Number(userId));
	if (cachedUsername) {
		return cachedUsername as string;
	} else {
		const username = await noblox.getUsernameFromId(Number(userId));
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
		const thumbnail = await noblox.getPlayerThumbnail(Number(userId), '60x60', undefined, undefined, "headshot");
		thumbnails.set(Number(userId), thumbnail[0].imageUrl);
		return thumbnail[0].imageUrl as string;
	}
}

export async function getDisplayName (userId: number | bigint): Promise<string> {
	const cachedDisplayName = displaynames.get(Number(userId));
	if (cachedDisplayName) {
		return cachedDisplayName as string;
	} else {
		const displayName = (await noblox.getPlayerInfo(Number(userId))).displayName;
		displaynames.set(Number(userId), displayName);
		return displayName as string;
	}
}

