import NodeCache from "node-cache";
import * as noblox from 'noblox.js'

const usernames = new NodeCache();
const thumbnails = new NodeCache();
const displaynames = new NodeCache();

export async function getUsername(userId: number) {
	const cachedUsername = usernames.get(userId);
	if (cachedUsername) {
		return cachedUsername as string;
	} else {
		const username = await noblox.getUsernameFromId(userId);
		usernames.set(userId, username);
		return username as string;
	}
}

/** 
 * Returns a cahced thumbnail or fresh thumbnail if not cached already
 * @returns {Promise<string>} 
 */
export async function getThumbnail (userId: number): Promise<string> {
	const cachedThumbnail = thumbnails.get(userId);
	if (cachedThumbnail) {
		return cachedThumbnail as string;
	} else {
		const thumbnail = await noblox.getPlayerThumbnail(userId, '60x60', undefined, undefined, "headshot");
		thumbnails.set(userId, thumbnail[0].imageUrl);
		return thumbnail[0].imageUrl as string;
	}
}

export async function getDisplayName (userId: number): Promise<string> {
	const cachedDisplayName = displaynames.get(userId);
	if (cachedDisplayName) {
		return cachedDisplayName as string;
	} else {
		const displayName = (await noblox.getPlayerInfo(userId)).displayName;
		displaynames.set(userId, displayName);
		return displayName as string;
	}
}

