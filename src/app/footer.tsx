import Link from "next/link";

export const Footer = () => {
  return (
    <footer className="px-5 pt-6 pb-12 text-sm md:px-6 md:text-base">
      <p>
        <Link
          className="text-link"
          href="https://github.com/mattbolanos/portfolio"
          rel="noopener noreferrer"
          target="_blank"
        >
          Source
        </Link>
      </p>
    </footer>
  );
};
