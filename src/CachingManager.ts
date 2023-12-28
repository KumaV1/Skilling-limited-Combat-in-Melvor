export class CachingManager {
    private static _lowestSkill = {
        skillId: "UNSET",
        level: 120 // avoid resetting anyone, if this is ever wrongfully not-updated
    };

    /** Patches methods in order to update info about current lowest non-combat skill whenever necessary */
    public static patch(ctx: Modding.ModContext): void {
    // @ts-ignore: You can patch base class no problem
        ctx.patch(Skill, "onLevelUp").after(function (returnValue: void, oldLevel: number, newLevel: number) {
            // If the levelled skill is NOT the current lowest skill,
            // then we don't actually need to do anything
            if (this.id !== CachingManager._lowestSkill.skillId) {
                return;
            }

            // Otherwise we have to check all skills, possibly update what the currently lowest non-combat skill level is
            // Also hide the potentially displayed xp cap notice
            CachingManager._lowestSkill = CachingManager.getLowestSkill();

            const noticeElement = document.getElementById('skill-capped-combat-xp-notice');
            if (noticeElement !== undefined && noticeElement !== null) {
                hideElement(noticeElement);
            }
        });
    }

    /** On character load, set initial value about lowest non-combat skill */
    public static initValue(ctx: Modding.ModContext): void {
        ctx.onCharacterLoaded(() => {
            CachingManager._lowestSkill = CachingManager.getLowestSkill();
        });
    }

    /**
     * Get xp cap based on lowest non-combat skill
     * @returns
     */
    public static getXpCap(): number {
        return exp.level_to_xp(CachingManager._lowestSkill.level + 1) - 1;
    }

    /**
     * Retrieves the current lowest non-combat skill level
     * @returns
     */
    public static getLowestSkill(): { skillId: string; level: number; } {
        // Just get a list of all skills,
        // filter out the combat skills,
        // and then do an order by or something to get the lowest level among them

        const nonCombatSkills = game.skills.filter((skill) => {
            return !skill.isCombat;
        });
        const lowestSkill = nonCombatSkills.reduce((acc, current) => current.level < acc.level ? current : acc, nonCombatSkills[0] || undefined);

        return {
            skillId: lowestSkill.id,
            level: lowestSkill.level
        };
    }
}