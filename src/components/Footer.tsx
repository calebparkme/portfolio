import type { Dictionary } from "@/dictionaries/types";

export default function Footer({ dict }: { dict: Dictionary["footer"] }) {
  return (
    <footer className="px-6 py-8 text-center text-xs text-neutral-400 sm:px-10">
      © {new Date().getFullYear()} Caleb Park. {dict.rights}
    </footer>
  );
}
