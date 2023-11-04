import Link from "next/link";

export default function Footer() {
  return (
    <footer className="flex w-full flex-col justify-between gap-4 bg-[#EEE] px-12 py-4 text-sm text-[#666] md:flex-row md:items-center">
      <div>
        © 2023 Snapify by{" "}
        <Link
          target="_blank"
          className="underline hover:text-black"
          href="https://marcushof.vercel.app/"
        >
          Marcus Hof
        </Link>
        , ported by{" "}
        <Link
          target="_blank"
          className="underline hover:text-black"
          href="https://lemonyte.github.io"
        >
          Lemonyte
        </Link>
      </div>
      <Link
        key="GitHub"
        href="https://github.com/lemonyte/snapify"
        target="_blank"
        className="text-sm text-[#666] hover:text-black"
      >
        GitHub
      </Link>
    </footer>
  );
}
