import { CachingManager } from './CachingManager';
import { LimiterManager } from './LimiterManager';

import '../assets/Logo.png'

export async function setup(ctx: Modding.ModContext) {
    CachingManager.patch(ctx);
    CachingManager.initValue(ctx);
    LimiterManager.patch(ctx);

    // TODOs:
    // * Add a message like with adventure mode, but in the combat UI, that will inform about at least one skill having reached their cap
}