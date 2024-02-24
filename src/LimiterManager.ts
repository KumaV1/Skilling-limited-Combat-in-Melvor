import { CachingManager } from "./CachingManager";
import { CombatAreasUIManager } from "./CombatAreasUIManager";
import { Constants } from "./Constants";

export class LimiterManager {
    public static patch(ctx: Modding.ModContext) {
        // Note: The original method checks on "overrideLevelCap" and "allowXPOverLevelCap". If that resulted in an xp cap below this restriction,
        // then this restriction can't even be hit because "this._xp" has already been adjusted in that case, so there should be no worries there.
        // Due to that, our "max skill level reached" check also shouldn't have to care about gamemode specific restrictions like incremental increase of level caps

        // @ts-ignore: You can patch base class no problem
        ctx.patch(Skill, "capXPForGamemode").after(function (returnValue: void) {
            // Not relevant for non-combat skills
            if (!this.isCombat) {
                return;
            }

            // Do not set an xp cap, if all skills have been maxed
            if (CachingManager.allSkillsMaxed()) {
                return;
            }

            // Get lowest non-combat skill level
            const xpCap: number = CachingManager.getXpCap();
            if (this.xp > xpCap) {
                const newXp = this.id === Constants.HITPOINTS_SKILL_ID
                    ? Math.max(xpCap, Constants.HITPOINTS_XP_CAP)
                    : xpCap;
                this.setXP(newXp);
                CombatAreasUIManager.evaluateSkillCappedCombatExpNoticeDisplay();
            }
        });
    }
}