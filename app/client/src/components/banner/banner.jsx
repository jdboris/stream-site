import { useEffect } from "react";
import { tryOperation } from "../../utils/utils";
import css from "./banner.module.scss";
import theme from "../../css/theme.module.scss";

export function Banner({ useSettings, useAuth }) {
  const { loading, banners, readAllBanners, settings, updateSettings } =
    useSettings();
  const { user } = useAuth();

  useEffect(() => {
    if (user?.isAdmin) {
      tryOperation(async () => {
        await readAllBanners();
      });
    }
  }, [user?.isAdmin, readAllBanners]);

  return (
    <div className={css.banner + " " + theme.theme}>
      {settings && (
        <>
          <img src={settings.banner.url} alt="banner" />

          {user?.isAdmin && (
            <div
              className={`${css.controls} ${
                loading ? theme.loading + " " + css.loading : ""
              }`}
            >
              <select
                onChange={(e) => {
                  tryOperation(async () => {
                    await updateSettings({ bannerId: e.target.value });
                  });
                }}
                value={settings.bannerId}
              >
                {banners &&
                  banners.map((banner, i) => {
                    return (
                      <option key={`banner-list-entry-${i}`} value={banner.id}>
                        {banner.name}
                      </option>
                    );
                  })}
              </select>
            </div>
          )}
        </>
      )}
    </div>
  );
}
