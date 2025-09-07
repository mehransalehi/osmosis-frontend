// eslint-disable-next-line simple-import-sort/imports
import classNames from "classnames";
import { observer } from "mobx-react-lite";
import { useRouter } from "next/router";
import React, {
  type FunctionComponent,
  type PropsWithChildren,
  useMemo,
} from "react";

import { IconButton } from "~/components/buttons/icon-button";
import Logo from "~/public/images/logo.svg";

import { MainLayoutMenu, MainMenu } from "~/components/main-menu";
import { NavBar } from "~/components/navbar";
import { NavbarOsmoPrice } from "~/components/navbar-osmo-price";
import { NavbarOsmosisUpdate } from "~/components/navbar-osmosis-update";
import { useCurrentLanguage, useWindowSize } from "~/hooks";
import { AssetVariantsConversionModal } from "~/modals/variants-conversion";

export const MainLayout = observer(
  ({
    children,
    menus,
    secondaryMenuItems,
  }: PropsWithChildren<{
    menus: MainLayoutMenu[];
    secondaryMenuItems: MainLayoutMenu[];
  }>) => {
    const router = useRouter();
    useCurrentLanguage();
    const { height, isMobile } = useWindowSize();

    const smallVerticalScreen = height < 850;

    const showFixedLogo = !smallVerticalScreen && !isMobile;
    const showBlockLogo = smallVerticalScreen && !isMobile;

    const selectedMenuItem = useMemo(
      () =>
        menus.find(
          ({ selectionTest }) => selectionTest?.test(router.pathname) ?? false
        ),
      [menus, router.pathname]
    );
    const navBarTitle = useMemo(() => {
      // Note: in designs we're moving to no title in nav bar.
      // Filtering here to avoid title bar flash from menu list item titles
      // appearing in nav bar before child components set global state via useNavBar.
      const selectedTitle = selectedMenuItem?.label;

      if (selectedTitle === "Trade") return;
      if (selectedTitle === "Portfolio") return;

      return selectedTitle;
    }, [selectedMenuItem?.label]);

    return (
      <React.Fragment>
        {showFixedLogo && (
          <div className="fixed z-50 w-sidebar px-5 pt-6">
            <OsmosisFullLogo onClick={() => router.push("/")} />
          </div>
        )}
        <div className="md:flex hidden absolute top-[20px] right-[20px] z-50">
          <OsmosisFullLogo onClick={() => router.push("/")} />
        </div>
        <div className="fixed inset-y-0 z-40 flex w-sidebar flex-col overflow-y-auto overflow-x-hidden bg-osmoverse-1000 px-2 py-6 md:hidden">
          {showBlockLogo && (
            <div className="z-50 mx-auto ml-3 w-sidebar grow-0">
              <OsmosisFullLogo onClick={() => router.push("/")} />
            </div>
          )}
          <MainMenu
            className={classNames(showBlockLogo && "!mt-8")}
            menus={menus}
            secondaryMenuItems={secondaryMenuItems}
          />
          <div className="flex flex-1 flex-col justify-end gap-5">
            <div className="px-2">
              <NavbarOsmosisUpdate />
            </div>
            <NavbarOsmoPrice />
          </div>
        </div>

        <NavBar
          className="ml-sidebar md:ml-0"
          title={navBarTitle}
          menus={menus}
          secondaryMenuItems={secondaryMenuItems}
        />
        <div className="ml-sidebar md:ml-0">{children}</div>
        <AssetVariantsConversionModal />
      </React.Fragment>
    );
  }
);

const OsmosisFullLogo: FunctionComponent<{
  width?: number;
  height?: number;
  onClick?: () => void;
}> = ({ width = 175, height = 48, onClick }) => (
  <IconButton
    className="cursor-pointer"
    mode="unstyled"
    aria-label="osmosis logo"
    style={{
      width,
      height,
    }}
    onClick={(e) => {
      e.stopPropagation();
      onClick?.();
    }}
    /** We cannot add this to the sprite.svg since nested <defs></defs> are not supported  */
    icon={<img src={Logo.src} alt="" className="" />}
  />
);
