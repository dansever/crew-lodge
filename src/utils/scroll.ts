"use client";

/**
 * Smoothly scrolls to the specified element ID
 * @param elementId The ID of the element to scroll to (without the # symbol)
 */
export const scrollToSection = (elementId: string): void => {
  const element = document.getElementById(elementId);
  if (element) {
    element.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }
};

/**
 * Smoothly scrolls to the top of the page
 */
export const scrollToTop = (): void => {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
};

/**
 * Handles smooth scrolling for anchor links
 * @param e The click event
 * @param sectionId The ID of the target section
 */
export const handleSmoothScroll = (
  e: React.MouseEvent<HTMLAnchorElement>,
  sectionId: string,
): void => {
  e.preventDefault();
  scrollToSection(sectionId);

  // Update URL without causing a page reload
  window.history.pushState({}, "", `#${sectionId}`);
};
