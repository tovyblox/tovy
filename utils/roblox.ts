import noblox from "noblox.js";

export async function getRobloxUsername(id: number) {
let username = await noblox.getUsernameFromId(id)
return username
}

// get thumbnail
export async function getRobloxThumbnail(id: number) {
let thumb = await noblox.getPlayerThumbnail(id, 420, "png",true, "headshot")
console.log(`[IMAGE DEBUG]: Identified Thumbnail URL ${thumb}`)
return thumb[0].imageUrl
}

// get display name
export async function getRobloxDisplayName(id: number) {
let newInfo = await noblox.getPlayerInfo(id)
return newInfo.displayName
}

// get user id
export async function getRobloxUserId(username: string, origin?: string) {
	let ids = await noblox.getIdFromUsername([username])
return ids
}
