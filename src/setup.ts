import { CachingManager } from './CachingManager';
import { CombatAreasUIManager } from './CombatAreasUIManager';
import { LimiterManager } from './LimiterManager';
import { ModContextMemoizer } from './ModContextMemoizer';
import { SettingsManager } from './SettingsManager';
import { TranslationManager } from './translation/TranslationManager';

import '../assets/Logo.png'

export async function setup(ctx: Modding.ModContext) {
    TranslationManager.register(ctx);
    SettingsManager.init(ctx);
    CachingManager.patch(ctx);
    CachingManager.initValue(ctx);
    LimiterManager.patch(ctx);
    CombatAreasUIManager.initSkillCappedCombatExpNotice(ctx);

    ctx.api({
        getXpCap: () => CachingManager.getXpCap(),
        getLowestSkill: () => CachingManager.getLowestSkill()
    });

    ModContextMemoizer.memoizeContext(ctx);
}