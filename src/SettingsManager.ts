import { CachingManager } from "./CachingManager";
import { Constants } from "./Constants";
import { ModContextMemoizer } from "./ModContextMemoizer";

export class SettingsManager {
    public static init(ctx: Modding.ModContext) {
        ctx.settings.section(getLangString(`${Constants.MOD_NAMESPACE}_Settings_Section_Restrictions`)).add([
            {
                type: 'switch',
                name: 'ignore-locked-skills',
                label: getLangString(`${Constants.MOD_NAMESPACE}_Settings_Setting_Label_Ignore_Locked_Skills`),
                hint: getLangString(`${Constants.MOD_NAMESPACE}_Settings_Setting_Hint_Ignore_Locked_Skills`),
                default: false,
                onChange(value: boolean, previousValue: boolean): void {
                    CachingManager.updateLowestSkill();
                }
            } as Modding.Settings.SwitchConfig
        ]);
    }

    /**
     * Whether locked skills should be ignored
     * @returns
     */
    public static getIgnoreLockedSkills(): boolean {
        return ModContextMemoizer.ctx.settings
            .section(getLangString(`${Constants.MOD_NAMESPACE}_Settings_Section_Restrictions`))
            .get('ignore-locked-skills') as boolean;
    }
}