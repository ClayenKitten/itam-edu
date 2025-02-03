import { error, log } from "console";
import type { BotContext, StaticBotContext } from "../ctx";
import type { Telegraf } from "telegraf";

export async function messageSendout(
    ctx: StaticBotContext,
    telegraf: Telegraf<BotContext>
) {
    try {
        const unsentMessages = await ctx.db.notification.getUnsentMessages();
        //console.log('length = ', unsentMessages.length)
        if (unsentMessages.length === 0) return;
        //console.log('Min = ', Math.min(unsentMessages.length, 30))
        //console.log("_________________")
        for (let i = 0; i < Math.min(unsentMessages.length, 30); i++) {
            //console.log('iteration number: ', i,"/", Math.min(unsentMessages.length, 30))
            let { userId, id, notificationText } = unsentMessages[i]!;
            let user = await ctx.db.user.getById(userId);
            if (user === null) return error(404);
            const message = await telegraf.telegram.sendMessage(
                user!.tgChatId,
                notificationText
            );
            await ctx.db.notification.changeMessageStatus(
                id,
                new Date(message.date * 1000)
            );
        }
    } catch (error) {
        ctx.logger.error("Unable to get unsent messages", error);
    }
}
