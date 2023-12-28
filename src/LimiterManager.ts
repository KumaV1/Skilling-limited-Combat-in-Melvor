import { Constants } from "./Constants";

export class LimiterManager {
    // Toggles/Patches for xp limitation and corresponding notification in UI
    // ^ likely render html element on load, and just toggle visibility if necessary?

    public static patch(ctx: Modding.ModContext) {
    // @ts-ignore: You can patch base class no problem
        ctx.patch(Skill, "capXPForGamemode").after(function (returnValue: void) {
            // Not relevant for non-combat skills
            if (!this.isCombat) {
                return;
            }

            // Get lowest non-combat skill level
            const level: number = 1;
            const xpCap: number = exp.level_to_xp(level + 1) - 1;
            if (this._xp > xpCap) {
                this._xp = this.id === Constants.HITPOINTS_SKILL_ID
                    ? Math.max(xpCap, Constants.HITPOINTS_XP_CAP)
                    : xpCap;
                this.renderQueue.xpCap = true;
            }
        });
    }
}