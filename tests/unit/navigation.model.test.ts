import { describe, it, expect } from "vitest";
import {
  NavigationItem,
  NavigationMenuService,
} from "@/lib/navigation/navigation.model";
import { Home } from "lucide-react";

describe("NavigationItem (OOP Model)", () => {
  it("correctly identifies exact matches for home route", () => {
    const homeItem = new NavigationItem("/", "Beranda", Home, true);

    expect(homeItem.isActive("/")).toBe(true);
    expect(homeItem.isActive("/harian")).toBe(false);
    expect(homeItem.isActive("/login")).toBe(false);
  });

  it("correctly identifies subroutes for non-root routes", () => {
    const harianItem = new NavigationItem("/harian", "Harian", Home);

    expect(harianItem.isActive("/harian")).toBe(true);
    expect(harianItem.isActive("/harian/detail")).toBe(true);
    expect(harianItem.isActive("/mingguan")).toBe(false);
  });
});

describe("NavigationMenuService (OOP Service)", () => {
  const service = new NavigationMenuService();

  it("encapsulates primary and secondary navigation items", () => {
    const primary = service.getPrimaryItems();
    const secondary = service.getSecondaryItems();

    expect(primary.length).toBe(4);
    expect(secondary.length).toBe(2);
    expect(service.getAllItems().length).toBe(6);
  });

  it("finds the active navigation item by path", () => {
    const activeHome = service.findActiveItem("/");
    expect(activeHome?.label).toBe("Beranda");

    const activeHarian = service.findActiveItem("/harian");
    expect(activeHarian?.label).toBe("Harian");

    const activeKategori = service.findActiveItem("/kategori");
    expect(activeKategori?.label).toBe("Kategori");

    const unknown = service.findActiveItem("/unknown");
    expect(unknown).toBeUndefined();
  });
});
