import { CachingManager } from "./CachingManager";
import { Constants } from "./Constants";

export class CombatAreasUIManager {
    public static _skillCappedCombatExpNoticeElement: HTMLElement;

    /**
     * Patches the display of a warning message,
     * to indicate combat skills being capped due to a non-combat skill of lower level
     * @param ctx
     */
    public static initSkillCappedCombatExpNotice(ctx: Modding.ModContext) {
        ctx.onInterfaceReady(function () {
            // Build and add notice html
            const containerEl = CombatAreasUIManager.createSkillCappedCombatExpNotice();
            CombatAreasUIManager._skillCappedCombatExpNoticeElement = containerEl;

            const siblingEl = document.getElementById('combat-select-area-Dungeon');
            if (siblingEl !== undefined && siblingEl !== null) {
                siblingEl.insertAdjacentElement("afterend", containerEl);
            }

            CombatAreasUIManager.evaluateSkillCappedCombatExpNoticeDisplay();
        });
    }

    /**
     *
     */
    public static evaluateSkillCappedCombatExpNoticeDisplay(): void {
        // Skip, if element has not been created yet
        if (!CombatAreasUIManager._skillCappedCombatExpNoticeElement) {
            return;
		}

        // Either ensure the element is displayed or not, depending on which case is necessary
        if (CachingManager.anyCombatSkillReachedCap()) {
            showElement(CombatAreasUIManager._skillCappedCombatExpNoticeElement);
        } else {
            hideElement(CombatAreasUIManager._skillCappedCombatExpNoticeElement);
        }
    }

    /**
     * Creates container displaying a warn message, if your combat level has reached the limit based non non-combat skill levels
     * @returns
     */
    private static createSkillCappedCombatExpNotice(): HTMLElement {
        let containerEl = document.createElement("div");
        containerEl.classList.add('d-none', 'row', 'row-deck', 'gutters-tiny', Constants.SKILL_CAPPED_COMBAT_EXP_NOTICE_CONTAINER_CLASS);

        const headline = getLangString(`${Constants.MOD_NAMESPACE}_Skill_Capped_Combat_Exp_Notice_Headline`);
        const text = getLangString(`${Constants.MOD_NAMESPACE}_Skill_Capped_Combat_Exp_Notice_Text`);
        containerEl.innerHTML = `<div class="col-12"><div class="block block-rounded block-link-pop border-top border-warning border-4x bg-combat-dark p-3"><h5 class="mb-1 text-warning">${headline}</h5><span class="font-w400">${text}</span>`;

        return containerEl;
    }
}