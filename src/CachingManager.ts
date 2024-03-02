import { CombatAreasUIManager } from "./CombatAreasUIManager";
import { SettingsManager } from "./SettingsManager";

export class CachingManager {
    /** Hard level cap, that can never be increased, based on Gamemode settings and expansion entitlements */
    private static _gameLevelHardCap = 120; // avoid resetting anything just in case

    private static _lowestSkill = {
        skillId: "UNSET",
        level: 120, // avoid resetting anyone, if this is ever wrongfully not-updated
        xpCap: exp.level_to_xp(120 + 1) - 1 // avoid resetting anyone, if this is ever wrongfully not-updated
    };

    /** Patches methods in order to update info about current lowest non-combat skill whenever necessary */
    public static patch(ctx: Modding.ModContext): void {
        // @ts-ignore: You can patch base class no problem
        ctx.patch(Skill, "onLevelUp").after(function (returnValue: void, oldLevel: number, newLevel: number) {
            // If the levelled skill is the current lowest skill,
            // then we have to re-check what the current lowest skill is
            if (this.id === CachingManager._lowestSkill.skillId) {
                CachingManager.updateLowestSkill();
            }

            // Re-check, whether a combat skill reached the cap
            CombatAreasUIManager.evaluateSkillCappedCombatExpNoticeDisplay();
        });

        // @ts-ignore: You can patch base class no problem
        ctx.patch(Skill, 'setUnlock').after(function (returnValue: void) {
            CachingManager.updateLowestSkill();
            CombatAreasUIManager.evaluateSkillCappedCombatExpNoticeDisplay();
        });
    }

    /**
     * Update the cached value for that the lowest skill currently is
     * @param ignoreLockedSkills - whether to ignore locked skills. If not provided, the setting will be read
     */
    public static updateLowestSkill(ignoreLockedSkills?: boolean | undefined): void {
        CachingManager._lowestSkill = CachingManager.getLowestSkill(ignoreLockedSkills);
    }

    /** On character load, set initial value about lowest non-combat skill */
    public static initValue(ctx: Modding.ModContext): void {
        ctx.onCharacterLoaded(() => {
            CachingManager.updateLowestSkill();
            CachingManager._gameLevelHardCap = game.currentGamemode.overrideLevelCap !== undefined
                ? game.currentGamemode.overrideLevelCap
                : cloudManager.hasTotHEntitlement
                    ? 120
                    : 99;
        });
    }

    /** Whether all skills have been maxed */
    public static allSkillsMaxed(): boolean {
        return CachingManager._lowestSkill.level >= CachingManager._gameLevelHardCap;
    }

    /**
     * Get xp cap based on lowest non-combat skill
     * @returns
     */
    public static getXpCap(): number {
        return CachingManager._lowestSkill.xpCap;
    }

    /**
     * Whether any combat skill is at or above the cap
     * @returns
     */
    public static anyCombatSkillReachedCap(): boolean {
        if (CachingManager.allSkillsMaxed()) {
            return false;
        }

        const combatSkills = game.skills.filter((skill) => {
            return skill.isCombat
        });
        const xpCap: number = CachingManager.getXpCap();

        return combatSkills.some((cSkill) => cSkill.xp >= xpCap);
    }

    /**
     * Retrieves the current lowest non-combat skill level
     * @param ignoreLockedSkills - whether to ignore locked skills. If not provided, the setting will be read
     * @returns
     */
    public static getLowestSkill(ignoreLockedSkills?: boolean | undefined): { skillId: string; level: number; xpCap: number; } {
        if (ignoreLockedSkills === undefined) {
            ignoreLockedSkills = SettingsManager.getIgnoreLockedSkills();
        }

        const nonCombatSkills = game.skills.filter((skill) => {
            return !skill.isCombat
                && (skill.isUnlocked
                    || !ignoreLockedSkills);
        });
        const lowestSkill = nonCombatSkills.reduce((acc, current) => current.level < acc.level ? current : acc, nonCombatSkills[0] || undefined);

        return {
            skillId: lowestSkill.id,
            level: lowestSkill.level,
            xpCap: exp.level_to_xp(lowestSkill.level + 1) - 1
        };
    }
}