export function Footer() {
  return (
    <footer className="bg-surface-container-lowest w-full mt-auto border-t border-outline-variant/10">
      <div className="flex flex-col md:flex-row justify-between items-center px-margin-mobile md:px-margin-desktop py-10 max-w-container-max mx-auto gap-6">
        <div className="font-label-caps text-label-caps text-on-surface uppercase tracking-widest">
          Base62
        </div>
        <div className="flex flex-wrap justify-center gap-6 font-body-sm text-body-sm">
          <span className="text-on-tertiary-fixed-variant hover:text-on-surface transition-colors duration-200 cursor-default">
            Precision Links
          </span>
          <span className="text-on-tertiary-fixed-variant hover:text-on-surface transition-colors duration-200 cursor-default">
            Gold Standard
          </span>
          <span className="text-on-tertiary-fixed-variant hover:text-on-surface transition-colors duration-200 cursor-default">
            Built with &hearts;
          </span>
        </div>
        <div className="font-body-sm text-body-sm text-secondary text-center md:text-right">
          &copy; {new Date().getFullYear()} Base62. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
