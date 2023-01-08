import { WebhookClient, EmbedBuilder, ActionRowBuilder, ButtonBuilder } from 'discord.js';
import prisma, { Session, SessionType } from '@/utils/database';
import { getThumbnail, getUsername } from './userinfoEngine';
export const sendWebhook = async (session: (Session & {
	sessionType: SessionType
})) => {
	if (!session.sessionType.webhookEnabled) return;
	const webhook = new WebhookClient({ url: session.sessionType.webhookUrl! });

	const messageEmbed = new EmbedBuilder()
		.setTitle(await gmsg(session.sessionType.webhookTitle || 'New %TYPE% Session'))
		.setColor("Green")
		.setTimestamp()
		.setAuthor({
			name: await getUsername(session.ownerId!),
			iconURL: await getThumbnail(session.ownerId!),
			url: `https://www.roblox.com/users/${session.ownerId}/profile`
		})
		.setDescription(
			await gmsg(
				session.sessionType.webhookBody ||
				`A %TYPE% is now being hosted by %HOST%! Join the game below to attend this session.`
			)
		)
		.setFooter({ text: `Tovy Sessions` });

	const actionRow = new ActionRowBuilder<ButtonBuilder>()

	if (session.sessionType.gameId) {
		messageEmbed.addFields([{
			name: "Gamelink",
			value: `https://www.roblox.com/games/${session.sessionType.gameId}/-`,
			inline: true
		}])
		actionRow.addComponents(new ButtonBuilder().setURL(`https://www.roblox.com/games/${session.sessionType.gameId}/-`).setLabel("Join Game").setStyle(("Link" as any)))
	}

	const message = await webhook.send({ embeds: [messageEmbed], components: actionRow.components.length ? [actionRow] : undefined, content: session.sessionType.webhookPing || "" })
	await prisma.session.update({
		where: {
			id: session.id
		},
		data: {
			messageId: message.id
		}
	})

	async function gmsg(text: string) {
		let replacements: {
			[key: string]: string;
		} = {};
		replacements[`%TYPE%`] = session.sessionType.name;
		replacements[`%HOST%`] = await getUsername(session.ownerId!);

		return text.replace(/%\w+%/g, (all) => {
			return typeof replacements[all] !== "undefined"
				? replacements[all]
				: all;
		});
	}
}

export const deleteWebhook = async (session: (Session & {
	sessionType: SessionType
})) => {
	if (!session.sessionType.webhookEnabled) return;
	if (!session.messageId) return;
	const webhook = new WebhookClient({ url: session.sessionType.webhookUrl! });
	const messageEmbed = new EmbedBuilder()
		.setTitle(await gmsg('%TYPE% Session Ended'))
		.setColor("Red")
		.setTimestamp()
		.setAuthor({
			name: await getUsername(session.ownerId!),
			iconURL: await getThumbnail(session.ownerId!),
			url: `https://www.roblox.com/users/${session.ownerId}/profile`
		})
		.setDescription(
			await gmsg(
				`The %TYPE% session hosted by %HOST% has ended.`
			)
		)
		.setFooter({ text: `Tovy Sessions` });
	
	await webhook.editMessage(session.messageId, { embeds: [messageEmbed], components: [], content: "" })
	

	async function gmsg(text: string) {
		let replacements: {
			[key: string]: string;
		} = {};
		replacements[`%TYPE%`] = session.sessionType.name;
		replacements[`%HOST%`] = await getUsername(session.ownerId!);

		return text.replace(/%\w+%/g, (all) => {
			return typeof replacements[all] !== "undefined"
				? replacements[all]
				: all;
		});
	}
}