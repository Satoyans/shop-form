import { CommandPermissionLevel, CustomCommandParamType, CustomCommandStatus, Player, system, world } from "@minecraft/server";
import { sendShopForm } from "./shop.js";

system.beforeEvents.startup.subscribe((ev) => {
	console.log("shop ui is running!!");

	ev.customCommandRegistry.registerCommand(
		{
			name: "shop:open",
			description: "Open the shop from",
			permissionLevel: CommandPermissionLevel.Any,
			optionalParameters: [{ name: "form title", type: CustomCommandParamType.String }],
		},
		(origin, title) => {
			if (origin.sourceEntity instanceof Player) {
				sendShopForm(origin.sourceEntity, title);
				return { status: CustomCommandStatus.Success };
			}
			return { status: CustomCommandStatus.Failure, message: "This command can only be used by players." };
		}
	);
});
