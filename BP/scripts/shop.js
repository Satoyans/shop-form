import * as mcui from "@minecraft/server-ui";
import { Player, system } from "@minecraft/server";
import { padText } from "./util";

const item_num = 100; // ショップに登録されているアイテムの数
const item_per_page = 20; // 1ページに表示するアイテムの数 //RP側で固定
const page_num = Math.ceil(item_num / item_per_page); // ページ数

function shop(ev, page = 1) {
	const form = new mcui.ActionFormData().title("§s§h§o§p§r" + (ev.title ?? "ショップフォーム"));

	form.body(`${padText(String(page), 10)} / ${padText(String(page_num), 10)} ページ`);
	form.button("|<<");
	form.button("<");
	form.button(">");
	form.button(">>|");

	//表示するページのアイテム数を計算
	let item_per_this_page = item_per_page;
	if (page == page_num && item_num % item_per_page !== 0) item_per_this_page = item_num % item_per_page;

	//アイテムのボタン追加
	for (const i in Array.from({ length: item_per_this_page })) {
		const item_index = (page - 1) * 20 + Number(i) + 1;
		const name = padText(`アイテム${item_index}`, 100);
		const gold = padText(`${item_index * 100}G`, 100);

		const description = padText(
			`${item_index}番目のアイテム\n${Array(item_index).fill("テスト\n").join("")}`
				.split(/\n/g)
				// 18文字ごとに改行 (半角の文字の場合ずれる)
				.map((v) => (v.match(/.{1,18}/g) ?? [v]).join("\n"))
				.join("\n"),
			1000
		);

		const item_id_aux = String(item_index * 65536);

		//iが偶数ならリンゴのテクスチャ、奇数であればinventory_item_renderer
		form.button(name + gold + description, Number(i) % 2 === 1 ? `§i§m§gtextures/items/apple` : `§a§u§x${item_id_aux}`);
	}

	system.run(async () => {
		//送信
		const result = await sendFormReliably(form, ev.sender);
		if (result === null) return;

		const pressed_index = result.selection;
		const item_pressed = pressed_index > 3; // 0,1,2,3はページ移動ボタン

		if (!item_pressed) {
			const select_action = new Map([
				[0, "|<<"],
				[1, "<"],
				[2, ">"],
				[3, ">>|"],
			]);

			switch (select_action.get(pressed_index)) {
				case "|<<":
					shop(ev, 1);
					break;
				case "<":
					shop(ev, Math.max(page - 1, 1));
					break;
				case ">":
					shop(ev, Math.min(page + 1, page_num));
					break;
				case ">>|":
					shop(ev, page_num);
					break;
			}
			return;
		}

		//アイテムの処理
		console.log(`§a購入:アイテム${result.selection + 1 - 4 + (page - 1) * 20}`);
	});
}

/**
 *
 * @param {mcui.ActionFormData} form
 * @param {Player} sender
 * @returns {Promise<mcui.ActionFormResponse|null>}
 */
function sendFormReliably(form, sender) {
	const retry_limit = 100; //5sec
	let retry_count = 0;
	return new Promise(async (resolve, reject) => {
		const result = await form.show(sender);
		if (result.cancelationReason === mcui.FormCancelationReason.UserClosed || retry_count > retry_limit) resolve(null);
		if (result.cancelationReason === mcui.FormCancelationReason.UserBusy) {
			await system.waitTicks(1);
			retry_count++;
			resolve(await sendFormReliably(form, sender));
		}
		resolve(result);
	});
}

/**
 *
 * @param {Player} sender
 * @param {string} message
 */
function sendShopForm(sender, title = undefined) {
	system.run(() => shop({ title, sender }));
}

export { sendShopForm };
