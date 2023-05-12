import axios from "axios";

export async function getRobloxUsername(id: number) {
  const { data } = await axios.get(`https://users.roblox.com/v1/users/${id}`);
  return data.name;
}

export async function getRobloxUsernameS(id: string) {
  const { data } = await axios.get(`https://users.roblox.com/v1/users/${id}`);
  return data.name;
}

// get thumbnail
export async function getRobloxThumbnail(id: number) {
  const { data } = await axios.get(
    `https://thumbnails.roblox.com/v1/users/avatar-headshot?userIds=${id}&size=60x60&format=Png&isCircular=false`
  );

  console.log(data.data[0].imageUrl)

  return data.data[0].imageUrl;
}

// get display name
export async function getRobloxDisplayName(id: number) {
  const { data } = await axios.get(`https://users.roblox.com/v1/users/${id}`);

  return data.displayName;
}

// get user id
export async function getRobloxUserId(username: string, origin?: string) {
  const { data } = await axios.post(
    `${origin ? (origin + "/") : "/"}api/roblox/id`,
    {
      keyword: username
    }
  );

console.log(`${origin ? (origin + "/") : "/"}api/roblox/id`)

  return data.data[0].id;
}