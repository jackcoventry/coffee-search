import { FOOTER_LINK_LABEL, FOOTER_NOTE, GITHUB_URL } from '@/consts/label';

export function Footer() {
  return (
    <footer className="text-center p-6 font-body text-black flex flex-col gap-4">
      <svg
        className="icon | mx-auto"
        width="1.25em"
        height="1.25em"
        fill="currentColor"
        aria-hidden
      >
        <use xlinkHref="/icons/icons.svg#backpack" />
      </svg>

      <div>
        <p>{FOOTER_NOTE}</p>
        <p>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline focusable"
          >
            {FOOTER_LINK_LABEL}
          </a>
        </p>
      </div>
    </footer>
  );
}
