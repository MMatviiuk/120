"use client";

import Link from "next/link";
import styles from "./MobileHeader.module.css";

type MobileHeaderProps = {
  onMenuToggle: () => void;
  isMenuOpen: boolean;
};

export function MobileHeader({ onMenuToggle, isMenuOpen }: MobileHeaderProps) {
  return (
    <header className={styles.mobileHeader}>
      <div className={styles.headerContent}>
        <div className={styles.logoSection}>
          <Link href="/dashboard" className={styles.logoLink}>
            <div className={styles.logoMark}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.svg"
                alt="Prescription Clarity Logo"
                className={styles.logoImage}
              />
            </div>
            <div className={styles.logoTitle}>
              <h1>Prescription</h1>
              <p>Clarity</p>
            </div>
          </Link>
        </div>
        <button
          type="button"
          className={`${styles.menuButton} ${isMenuOpen ? styles.menuButtonOpen : ""}`}
          onClick={onMenuToggle}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={isMenuOpen}
        >
          <span className={styles.menuIconWrapper}>
            <span className={styles.menuLine} />
            <span className={styles.menuLine} />
            <span className={styles.menuLine} />
          </span>
        </button>
      </div>
    </header>
  );
}
