import Image from 'next/image';

interface BrandLogoProps {
  theme?: 'light' | 'dark';
  className?: string;
  onClick?: () => void;
}

export function BrandLogo({
  theme = 'light',
  className = '',
  onClick,
}: BrandLogoProps) {
  const lightModeSrc = '/logos/crewlodge-logo-main.svg';
  const darkModeSrc = '/logos/crewlodge-logo-light.svg';
  const src = theme === 'light' ? lightModeSrc : darkModeSrc;

  return (
    <Image
      src={src}
      alt="CrewLodge"
      width={0}
      height={0}
      className={`w-auto h-auto max-w-[140px] cursor-pointer ${className}`}
      onClick={onClick}
      priority
    />
  );
}
