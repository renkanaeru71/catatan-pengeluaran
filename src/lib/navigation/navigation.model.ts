import type { LucideIcon } from "lucide-react";
import {
  Home,
  CalendarDays,
  CalendarRange,
  Calendar,
  Receipt,
  Tags,
} from "lucide-react";

/**
 * Value Object representing a single Navigation Item in OOP paradigm.
 * Encapsulates navigation target metadata and matching behavior.
 */
export class NavigationItem {
  constructor(
    public readonly href: string,
    public readonly label: string,
    public readonly icon: LucideIcon,
    public readonly exact: boolean = false,
  ) {}

  /**
   * Encapsulated domain logic to test whether a given pathname is active.
   */
  public isActive(currentPath: string): boolean {
    if (this.exact || this.href === "/") {
      return currentPath === this.href;
    }
    return currentPath === this.href || currentPath.startsWith(`${this.href}/`);
  }
}

/**
 * NavigationMenuService follows OOP encapsulation and Single Responsibility.
 * Centralizes primary and secondary menu items and provides search/state helpers.
 */
export class NavigationMenuService {
  private readonly primaryItems: readonly NavigationItem[];
  private readonly secondaryItems: readonly NavigationItem[];

  constructor() {
    this.primaryItems = Object.freeze([
      new NavigationItem("/", "Beranda", Home, true),
      new NavigationItem("/harian", "Harian", CalendarDays),
      new NavigationItem("/mingguan", "Mingguan", CalendarRange),
      new NavigationItem("/bulanan", "Bulanan", Calendar),
    ]);

    this.secondaryItems = Object.freeze([
      new NavigationItem("/transaksi", "Transaksi", Receipt),
      new NavigationItem("/kategori", "Kategori", Tags),
    ]);
  }

  public getPrimaryItems(): readonly NavigationItem[] {
    return this.primaryItems;
  }

  public getSecondaryItems(): readonly NavigationItem[] {
    return this.secondaryItems;
  }

  public getAllItems(): readonly NavigationItem[] {
    return [...this.primaryItems, ...this.secondaryItems];
  }

  public findActiveItem(currentPath: string): NavigationItem | undefined {
    return this.getAllItems().find((item) => item.isActive(currentPath));
  }
}

/** Singleton instance for use across UI components */
export const navigationService = new NavigationMenuService();
