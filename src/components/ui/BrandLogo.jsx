export default function BrandLogo({ className = 'h-7 w-7' }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <rect width="32" height="32" rx="6" style={{ fill: 'var(--main-color)' }} />
      <path
        d="M 5 6 V 24 M 5 6 C 13 6 20 10.3 20 15 C 20 19.7 13 24 5 24"
        stroke="#fff"
        strokeOpacity="0.92"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 10.5 9 V 27 M 10.5 9 C 18.5 9 25.5 13.3 25.5 18 C 25.5 22.7 18.5 27 10.5 27"
        stroke="#fff"
        strokeOpacity="0.55"
        strokeWidth="4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
